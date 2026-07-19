import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const STORE_NAME = "qg-gaindes-control";
const STATE_KEY = "visibility";
const COOKIE_NAME = "qg_gaindes_owner";
const SESSION_SECONDS = 60 * 60 * 24;
const VALID_MODES = new Set(["public", "private", "closed"]);

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, ...extraHeaders },
  });
}

function secret() {
  return String(process.env.QG_GAINDES_ADMIN_PASSWORD || "");
}

function secureEqual(a, b) {
  const ah = crypto.createHash("sha256").update(String(a || "")).digest();
  const bh = crypto.createHash("sha256").update(String(b || "")).digest();
  return crypto.timingSafeEqual(ah, bh);
}

function cookieValue(req, name) {
  const raw = req.headers.get("cookie") || "";
  const part = raw.split(/;\s*/).find((item) => item.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : "";
}

function signSession(exp) {
  const key = secret();
  if (!key) return "";
  const payload = `${exp}:qg-gaindes-owner`;
  const sig = crypto.createHmac("sha256", key).update(payload).digest("hex");
  return `${exp}.${sig}`;
}

function validSession(req) {
  const token = cookieValue(req, COOKIE_NAME);
  if (!token || !secret()) return false;
  const [rawExp, rawSig] = token.split(".");
  const exp = Number(rawExp);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = signSession(exp);
  return secureEqual(token, expected) && Boolean(rawSig);
}

async function readState() {
  try {
    const store = getStore(STORE_NAME);
    const saved = await store.get(STATE_KEY, { type: "json", consistency: "strong" });
    if (saved && VALID_MODES.has(saved.mode)) {
      return {
        mode: saved.mode,
        updatedAt: saved.updatedAt || null,
      };
    }
  } catch (error) {
    console.error("[gaindes-control] read failed", error);
  }
  return { mode: "private", updatedAt: null };
}

async function writeState(mode) {
  const state = { mode, updatedAt: new Date().toISOString() };
  const store = getStore(STORE_NAME);
  await store.setJSON(STATE_KEY, state);
  return state;
}

function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const value = signSession(exp);
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const configured = Boolean(secret());
  const state = await readState();
  const owner = validSession(req);

  if (req.method === "GET") {
    return json({
      ok: true,
      mode: state.mode,
      allowed: state.mode === "public" || owner,
      owner,
      configured,
      updatedAt: state.updatedAt,
    });
  }

  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const action = String(body.action || "");

  if (action === "logout") {
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
  }

  if (!configured) {
    return json({
      ok: false,
      error: "not_configured",
      message: "Le propriétaire doit définir QG_GAINDES_ADMIN_PASSWORD dans Netlify.",
    }, 503);
  }

  const password = String(body.password || "");
  if (!secureEqual(password, secret())) {
    return json({ ok: false, error: "invalid_password", message: "Mot de passe incorrect." }, 401);
  }

  if (action === "unlock") {
    return json({
      ok: true,
      mode: state.mode,
      allowed: true,
      owner: true,
    }, 200, { "Set-Cookie": sessionCookie() });
  }

  if (action === "set-mode") {
    const mode = String(body.mode || "").toLowerCase();
    if (!VALID_MODES.has(mode)) {
      return json({ ok: false, error: "invalid_mode" }, 400);
    }
    try {
      const saved = await writeState(mode);
      return json({
        ok: true,
        ...saved,
        allowed: true,
        owner: true,
      }, 200, { "Set-Cookie": sessionCookie() });
    } catch (error) {
      console.error("[gaindes-control] write failed", error);
      return json({ ok: false, error: "storage_error" }, 500);
    }
  }

  return json({ ok: false, error: "unknown_action" }, 400);
};
