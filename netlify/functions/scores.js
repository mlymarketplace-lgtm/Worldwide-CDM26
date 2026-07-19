// netlify/functions/scores.js
// Appel sécurisé à API-FOOTBALL / API-SPORTS.
// La clé reste cachée dans Netlify : Environment variable FOOTBALL_API_KEY.
// Le front appelle : /.netlify/functions/scores
//
// Réponse volontairement compatible avec ton live.json actuel :
// { updatedAt, source, matches: { "cro-gha": { home, away, status } } }

const API_BASE = "https://v3.football.api-sports.io";

// Coupe du Monde FIFA dans API-FOOTBALL.
// Si l'ID varie dans ton compte API, tu peux le surcharger dans Netlify avec FOOTBALL_LEAGUE_ID.
const LEAGUE_ID = process.env.FOOTBALL_LEAGUE_ID || "1";
const SEASON = process.env.FOOTBALL_SEASON || "2026";

// Cache live mutualisé.
// V15.4.2 : plafond DUR à 25 s. Une ancienne variable Netlify réglée à 300 s
// ne peut plus réintroduire le retard de cinq minutes observé pendant le live.
const requestedCacheSeconds = Number(process.env.FOOTBALL_CACHE_SECONDS || 25);
const CACHE_SECONDS = Math.min(
  25,
  Math.max(10, Number.isFinite(requestedCacheSeconds) ? requestedCacheSeconds : 25)
);

let memoryCache = {
  expiresAt: 0,
  body: null,
};

const TRACKED_MATCHES = {
  // Derniers matchs de groupes suivis pendant la qualification du Sénégal
  "uru-esp": { home: "URU", away: "ESP" },
  "cpv-ksa": { home: "CPV", away: "KSA" },
  "egy-irn": { home: "EGY", away: "IRN" },
  "nzl-bel": { home: "NZL", away: "BEL" },
  "cro-gha": { home: "CRO", away: "GHA" },
  "pan-eng": { home: "PAN", away: "ENG" },
  "col-por": { home: "COL", away: "POR" },
  "cod-uzb": { home: "COD", away: "UZB" },
  "jor-arg": { home: "JOR", away: "ARG" },
  "alg-aut": { home: "ALG", away: "AUT" },

  // Phase à élimination directe — 16es de finale
  // Important pour afficher les matchs live même s'ils ne concernent pas le Sénégal.
  "rsa-can": { home: "RSA", away: "CAN" },
  "bra-jpn": { home: "BRA", away: "JPN" },
  "ger-par": { home: "GER", away: "PAR" },
  "ned-mar": { home: "NED", away: "MAR" },
  "civ-nor": { home: "CIV", away: "NOR" },
  "fra-swe": { home: "FRA", away: "SWE" },
  "mex-ecu": { home: "MEX", away: "ECU" },
  "eng-cod": { home: "ENG", away: "COD" },
  "bel-sen": { home: "BEL", away: "SEN" },
  "usa-bih": { home: "USA", away: "BIH" },
  "esp-aut": { home: "ESP", away: "AUT" },
  "por-cro": { home: "POR", away: "CRO" },
  "sui-alg": { home: "SUI", away: "ALG" },
  "aus-egy": { home: "AUS", away: "EGY" },
  "arg-cpv": { home: "ARG", away: "CPV" },
  "col-gha": { home: "COL", away: "GHA" },

  // Huitièmes de finale — suivi automatique après la bascule R32 → R16.
  "can-mar": { home: "CAN", away: "MAR" },
  "par-fra": { home: "PAR", away: "FRA" },
  "bra-nor": { home: "NOR", away: "BRA" },
  "mex-eng": { home: "MEX", away: "ENG" },
  "por-esp": { home: "POR", away: "ESP" },
  "usa-bel": { home: "USA", away: "BEL" },
  "arg-egy": { home: "ARG", away: "EGY" },
  "sui-col": { home: "SUI", away: "COL" },

  // Deux derniers matchs : clés KO exactes, sans dépendre uniquement de l’horaire.
  "third-103": { home: "FRA", away: "ENG" },
  "final-104": { home: "ESP", away: "ARG" },
};

const TEAM_ALIASES = {
  URU: ["Uruguay"],
  ESP: ["Spain", "Espagne"],
  CPV: ["Cape Verde", "Cabo Verde", "Cap Vert", "Cap-Vert"],
  KSA: ["Saudi Arabia", "Saudi-Arabia", "Arabie Saoudite", "Arabie saoudite"],
  EGY: ["Egypt", "Egypte", "Égypte"],
  IRN: ["Iran", "IR Iran", "Iran IR"],
  NZL: ["New Zealand", "Nouvelle-Zélande", "Nouvelle Zelande"],
  BEL: ["Belgium", "Belgique"],
  CRO: ["Croatia", "Croatie"],
  GHA: ["Ghana"],
  PAN: ["Panama"],
  ENG: ["England", "Angleterre"],
  COL: ["Colombia", "Colombie"],
  POR: ["Portugal"],
  COD: ["Congo DR", "DR Congo", "Congo DR", "D.R. Congo", "RD Congo", "Democratic Republic of Congo", "Congo"],
  UZB: ["Uzbekistan", "Ouzbékistan", "Ouzbekistan"],
  JOR: ["Jordan", "Jordanie"],
  ARG: ["Argentina", "Argentine"],
  ALG: ["Algeria", "Algérie", "Algerie"],
  AUT: ["Austria", "Autriche"],
  RSA: ["South Africa", "Afrique du Sud", "South-Africa"],
  CAN: ["Canada"],
  BRA: ["Brazil", "Brésil", "Brasil"],
  JPN: ["Japan", "Japon"],
  GER: ["Germany", "Allemagne"],
  PAR: ["Paraguay"],
  NED: ["Netherlands", "Pays-Bas", "Pays Bas", "Holland", "Netherlands"],
  MAR: ["Morocco", "Maroc"],
  CIV: ["Ivory Coast", "Cote d Ivoire", "Côte d'Ivoire", "Côte d’Ivoire", "Cote d'Ivoire"],
  NOR: ["Norway", "Norvège", "Norvege"],
  FRA: ["France"],
  SWE: ["Sweden", "Suède", "Suede"],
  MEX: ["Mexico", "Mexique"],
  ECU: ["Ecuador", "Équateur", "Equateur"],
  USA: ["United States", "USA", "United States of America", "Etats-Unis", "États-Unis"],
  BIH: ["Bosnia and Herzegovina", "Bosnia", "Bosnie-Herzégovine", "Bosnie Herzégovine", "Bosnie"],
  SUI: ["Switzerland", "Suisse"],
  AUS: ["Australia", "Australie"],
  SEN: ["Senegal", "Sénégal"],
 };

// Les tours QF/SF/finale/3e place ont des participants dynamiques.
// Pour éviter de redéployer scores.js après chaque huitième, on peut reconnaître
// les fixtures API par créneau officiel, puis les renvoyer sous une clé stable du bracket.
const KO_DATE_SLOTS = [
  { key: "qf-97", kickoff: "2026-07-09T22:00:00+02:00" },
  { key: "qf-98", kickoff: "2026-07-10T21:00:00+02:00" },
  { key: "qf-99", kickoff: "2026-07-11T23:00:00+02:00" },
  { key: "qf-100", kickoff: "2026-07-12T03:00:00+02:00" },
  { key: "sf-101", kickoff: "2026-07-14T21:00:00+02:00" },
  { key: "sf-102", kickoff: "2026-07-15T21:00:00+02:00" },
  { key: "third-103", kickoff: "2026-07-18T23:00:00+02:00" },
  { key: "final-104", kickoff: "2026-07-19T21:00:00+02:00" },
];
const KO_SLOT_TOLERANCE_MS = 90 * 60 * 1000;

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      // Navigateur : jamais de score stocké. CDN : 25 s maximum, sans stale.
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "CDN-Cache-Control": `public, s-maxage=${CACHE_SECONDS}`,
      "Netlify-CDN-Cache-Control": `public, s-maxage=${CACHE_SECONDS}`,
      "X-QG-Live-Cache-Seconds": String(CACHE_SECONDS),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function teamMatches(apiTeam, code) {
  const apiName = normalize(apiTeam?.name);
  const aliases = TEAM_ALIASES[code] || [code];

  return aliases.some((alias) => {
    const a = normalize(alias);
    return apiName === a || apiName.includes(a) || a.includes(apiName);
  });
}

function codeForApiTeam(apiTeam) {
  for (const code of Object.keys(TEAM_ALIASES)) {
    if (teamMatches(apiTeam, code)) return code;
  }
  return null;
}

function mapStatus(apiStatusShort) {
  const s = String(apiStatusShort || "").toUpperCase();

  if (["FT", "AET", "PEN", "AWD", "WO"].includes(s)) return "final";
  if (["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(s)) return "live";
  if (["PST"].includes(s)) return "postponed";
  if (["CANC", "ABD"].includes(s)) return "cancelled";

  return "scheduled";
}

function toNumberOrNull(value) {
  return value === undefined || value === null ? null : Number(value);
}

function toMatchPayload(apiFixture, key, reversed = false) {
  const goals = apiFixture?.goals || {};
  const score = apiFixture?.score || {};
  const penalty = score?.penalty || {};
  const fixture = apiFixture?.fixture || {};
  const status = fixture?.status || {};
  const teams = apiFixture?.teams || {};

  const fulltime = score?.fulltime || {};
  const extratime = score?.extratime || {};

  // V11.5.9 — sécurité TAB :
  // certains retours API peuvent renseigner score.fulltime/extratime
  // alors que goals.home/away est null après une séance de tirs au but.
  const rawHomeScore = toNumberOrNull(goals.home ?? extratime.home ?? fulltime.home);
  const rawAwayScore = toNumberOrNull(goals.away ?? extratime.away ?? fulltime.away);
  const rawPenaltyHome = toNumberOrNull(penalty.home);
  const rawPenaltyAway = toNumberOrNull(penalty.away);

  const homeScore = reversed ? rawAwayScore : rawHomeScore;
  const awayScore = reversed ? rawHomeScore : rawAwayScore;
  const penaltyHome = reversed ? rawPenaltyAway : rawPenaltyHome;
  const penaltyAway = reversed ? rawPenaltyHome : rawPenaltyAway;
  const mappedStatus = mapStatus(status.short);

  let winner = null;
  let resolvedBy = null;

  // API-SPORTS renseigne souvent teams.home.winner / teams.away.winner après TAB.
  if (teams.home?.winner === true) {
    winner = reversed ? "away" : "home";
    resolvedBy = "apiWinner";
  } else if (teams.away?.winner === true) {
    winner = reversed ? "home" : "away";
    resolvedBy = "apiWinner";
  }

  // Fallback : tirs au but, puis score terrain.
  if (!winner && mappedStatus === "final") {
    if (penaltyHome !== null && penaltyAway !== null && penaltyHome !== penaltyAway) {
      winner = penaltyHome > penaltyAway ? "home" : "away";
      resolvedBy = "penalties";
    } else if (homeScore !== null && awayScore !== null && homeScore !== awayScore) {
      winner = homeScore > awayScore ? "home" : "away";
      resolvedBy = "score";
    }
  }

  const homeApiTeam = reversed ? teams.away : teams.home;
  const awayApiTeam = reversed ? teams.home : teams.away;
  const homeCode = codeForApiTeam(homeApiTeam);
  const awayCode = codeForApiTeam(awayApiTeam);

  return {
    h: homeCode,
    a: awayCode,
    homeCode,
    awayCode,
    homeLabel: homeApiTeam?.name || null,
    awayLabel: awayApiTeam?.name || null,
    home: homeScore,
    away: awayScore,
    status: mappedStatus,
    minute: status.elapsed ?? null,
    apiStatus: status.short || null,
    apiStatusLong: status.long || null,
    fixtureId: fixture.id || null,
    date: fixture.date || null,
    homeName: homeApiTeam?.name,
    awayName: awayApiTeam?.name,
    penalty: { home: penaltyHome, away: penaltyAway },
    penaltyHome,
    penaltyAway,
    winner,
    winnerSide: winner === "home" ? 0 : winner === "away" ? 1 : null,
    locked: mappedStatus === "final" && !!winner,
    resolvedBy,
  };
}

function findTrackedMatch(apiFixture) {
  const homeTeam = apiFixture?.teams?.home;
  const awayTeam = apiFixture?.teams?.away;

  for (const [key, expected] of Object.entries(TRACKED_MATCHES)) {
    const normal =
      teamMatches(homeTeam, expected.home) &&
      teamMatches(awayTeam, expected.away);

    if (normal) {
      return { key, reversed: false };
    }

    const reversed =
      teamMatches(homeTeam, expected.away) &&
      teamMatches(awayTeam, expected.home);

    if (reversed) {
      return { key, reversed: true };
    }
  }

  return null;
}

function findDateSlotMatch(apiFixture, alreadyUsedKeys = new Set()) {
  const dateValue = apiFixture?.fixture?.date;
  if (!dateValue) return null;
  const fixtureMs = new Date(dateValue).getTime();
  if (!Number.isFinite(fixtureMs)) return null;

  let best = null;
  for (const slot of KO_DATE_SLOTS) {
    if (alreadyUsedKeys.has(slot.key)) continue;
    const slotMs = new Date(slot.kickoff).getTime();
    const delta = Math.abs(fixtureMs - slotMs);
    if (Number.isFinite(slotMs) && delta <= KO_SLOT_TOLERANCE_MS && (!best || delta < best.delta)) {
      best = { key: slot.key, reversed: false, delta };
    }
  }
  return best ? { key: best.key, reversed: false } : null;
}

async function fetchFixtures({ from, to }) {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    throw new Error("FOOTBALL_API_KEY is not configured in Netlify environment variables.");
  }

  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set("league", LEAGUE_ID);
  url.searchParams.set("season", SEASON);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("timezone", "Europe/Paris");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`API-FOOTBALL HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  if (data?.errors && Object.keys(data.errors).length) {
    throw new Error(`API-FOOTBALL error: ${JSON.stringify(data.errors)}`);
  }

  return {
    endpoint: "/fixtures",
    from,
    to,
    rawCount: Array.isArray(data?.response) ? data.response.length : 0,
    fixtures: Array.isArray(data?.response) ? data.response : [],
  };
}

exports.handler = async function handler(event) {
  try {
    const now = Date.now();

    if (memoryCache.body && memoryCache.expiresAt > now) {
      return json(200, {
        ...memoryCache.body,
        cache: "memory",
      }, { "X-QG-Cache": "memory" });
    }

    const params = event?.queryStringParameters || {};
    const today = new Date();

    // Par défaut : hier → +16 jours.
    // Fenêtre volontairement plus large pendant les 16es : elle couvre tous les matchs R32 proches
    // sans appeler plus souvent l'API, car le front décide quand appeler cette fonction.
    // Tu peux forcer avec /.netlify/functions/scores?from=2026-06-28&to=2026-07-04
    const from = params.from || process.env.FOOTBALL_DATE_FROM || ymd(addDays(today, -1));
    const to = params.to || process.env.FOOTBALL_DATE_TO || ymd(addDays(today, 16));

    const api = await fetchFixtures({ from, to });

    const matches = {};
    const usedSlotKeys = new Set();
    for (const fixture of api.fixtures) {
      let found = findTrackedMatch(fixture);
      if (!found) found = findDateSlotMatch(fixture, usedSlotKeys);
      if (!found) continue;

      matches[found.key] = toMatchPayload(fixture, found.key, found.reversed);
      if (found.key.startsWith("qf-") || found.key.startsWith("sf-") || found.key.startsWith("third-") || found.key.startsWith("final-")) {
        usedSlotKeys.add(found.key);
      }
    }

    const body = {
      updatedAt: new Date().toISOString(),
      source: "api-football",
      provider: "API-SPORTS",
      leagueId: LEAGUE_ID,
      season: SEASON,
      from,
      to,
      cacheSeconds: CACHE_SECONDS,
      foundMatches: Object.keys(matches).length,
      rawFixtures: api.rawCount,
      matches,
    };

    memoryCache = {
      expiresAt: now + CACHE_SECONDS * 1000,
      body,
    };

    return json(200, body, { "X-QG-Cache": "fresh" });
  } catch (error) {
    return json(500, {
      updatedAt: new Date().toISOString(),
      source: "api-football",
      error: true,
      message: error.message,
      hint: "Vérifie FOOTBALL_API_KEY dans Netlify, puis teste /.netlify/functions/scores",
    }, {
      "Cache-Control": "no-store",
    });
  }
};
