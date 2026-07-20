(function () {
  'use strict';
  const ENDPOINT = '/.netlify/functions/gaindes-control';
  const CARD_SELECTOR = '[data-gaindes-gated]';
  let statusPromise = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  async function status(force) {
    if (!statusPromise || force) {
      statusPromise = fetch(`${ENDPOINT}?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      }).then(async (response) => {
        if (!response.ok) throw new Error(`status-${response.status}`);
        return response.json();
      }).catch((error) => {
        console.error('[QG Gaindes Gate]', error);
        return { ok: false, mode: 'closed', allowed: false, owner: false, configured: false, unavailable: true };
      });
    }
    return statusPromise;
  }

  function applyCards(info) {
    document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
      const visible = info && info.mode === 'public';
      card.hidden = !visible;
      card.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
  }

  function copyForMode(mode, configured) {
    if (!configured) {
      return {
        kicker: 'CONFIGURATION REQUISE',
        title: 'Suivi des Gaïndés indisponible',
        body: 'Le propriétaire doit terminer la configuration de l’accès privé.',
        button: 'Configurer dans Netlify'
      };
    }
    if (mode === 'private') {
      return {
        kicker: 'ESPACE PRIVÉ',
        title: 'Suivi des Gaïndés',
        body: 'Cet espace est réservé au propriétaire et aux personnes autorisées.',
        button: 'Ouvrir l’espace'
      };
    }
    return {
      kicker: 'ESPACE FERMÉ',
      title: 'Suivi des Gaïndés',
      body: 'Le propriétaire a temporairement fermé cet espace.',
      button: 'Accès propriétaire'
    };
  }

  function gateHtml(info, standalone) {
    const c = copyForMode(info.mode, info.configured);
    const form = info.configured ? `<form class="qg-gate-form" data-gaindes-unlock>
      <label>Mot de passe<input type="password" name="password" autocomplete="current-password" required></label>
      <button type="submit">${esc(c.button)}</button>
      <p data-gaindes-error role="alert"></p>
    </form>` : '';
    return `<main class="qg-access-gate ${standalone ? 'is-standalone' : ''}">
      <div class="qg-access-emblem">🦁</div>
      <small>${esc(c.kicker)}</small>
      <h1>${esc(c.title)}</h1>
      <p>${esc(c.body)}</p>
      ${form}
      <a class="qg-access-back" href="/?v=1550">← Retour à QualifGaïndé</a>
    </main>`;
  }

  function injectStyles() {
    if (document.getElementById('qg-gaindes-gate-css')) return;
    const style = document.createElement('style');
    style.id = 'qg-gaindes-gate-css';
    style.textContent = `
      ${CARD_SELECTOR}[hidden]{display:none!important}
      .qg-access-gate{min-height:100%;display:grid;place-content:center;justify-items:center;text-align:center;padding:32px 20px;background:radial-gradient(circle at 50% 0,#0b5e3c55,transparent 35%),linear-gradient(155deg,#06101d,#0b1b2d 58%,#32151b);color:#fff;font-family:Inter,Arial,sans-serif}
      .qg-access-gate.is-standalone{min-height:100vh}
      .qg-access-emblem{width:82px;height:82px;display:grid;place-items:center;border-radius:50%;font-size:42px;background:#091627;border:2px solid #f5c842;box-shadow:0 0 44px #f5c84240;margin-bottom:18px}
      .qg-access-gate small{color:#f5c842;font-weight:950;letter-spacing:.18em}
      .qg-access-gate h1{margin:9px 0 10px;font:900 clamp(2.1rem,6vw,4rem)/.95 Oswald,Impact,sans-serif;text-transform:uppercase}
      .qg-access-gate>p{max-width:560px;color:#bdc9da;line-height:1.55}
      .qg-gate-form{width:min(390px,100%);display:grid;gap:11px;margin-top:22px}
      .qg-gate-form label{display:grid;gap:7px;text-align:left;color:#dce6f4;font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
      .qg-gate-form input{width:100%;padding:13px 14px;border-radius:13px;border:1px solid #ffffff2b;background:#06101dcc;color:#fff;outline:none}
      .qg-gate-form input:focus{border-color:#f5c842;box-shadow:0 0 0 3px #f5c84220}
      .qg-gate-form button{border:0;border-radius:999px;padding:13px 18px;background:#fdef42;color:#07111e;font-weight:950;cursor:pointer}
      .qg-gate-form [data-gaindes-error]{min-height:18px;color:#ff9ba4;font-size:.82rem}
      .qg-access-back{margin-top:18px;color:#f5c842;text-decoration:none;font-weight:850}
      .qg-gaindes-route-shell.is-checking{display:grid;place-items:center;color:#f5c842;font:800 1rem Inter,Arial,sans-serif}
      html.qg-gaindes-checking body{visibility:hidden}
    `;
    document.head.appendChild(style);
  }

  async function unlock(password) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'unlock', password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'Accès refusé.');
    statusPromise = null;
    return data;
  }

  function bindUnlock(root) {
    const form = root && root.querySelector('[data-gaindes-unlock]');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button');
      const error = form.querySelector('[data-gaindes-error]');
      const password = new FormData(form).get('password');
      button.disabled = true;
      error.textContent = '';
      try {
        await unlock(password);
        location.reload();
      } catch (err) {
        error.textContent = err.message || 'Accès refusé.';
        button.disabled = false;
      }
    });
  }

  async function protectRoute(selector, renderAllowed) {
    injectStyles();
    selector.innerHTML = '<div class="qg-gaindes-route-shell is-checking">Vérification de l’accès…</div>';
    const info = await status(true);
    applyCards(info);
    if (info.allowed) {
      renderAllowed();
      return;
    }
    selector.innerHTML = `<div class="qg-gaindes-route-shell">${gateHtml(info, false)}</div>`;
    bindUnlock(selector);
  }

  async function protectStandalone() {
    injectStyles();
    document.documentElement.classList.add('qg-gaindes-checking');
    const reveal = () => document.documentElement.classList.remove('qg-gaindes-checking');
    const info = await status(true);
    if (info.allowed) {
      reveal();
      return;
    }
    document.body.innerHTML = gateHtml(info, true);
    reveal();
    bindUnlock(document);
  }

  async function refreshCards() {
    injectStyles();
    const info = await status(true);
    applyCards(info);
    return info;
  }

  window.QGGaindesGate = { status, refreshCards, protectRoute, protectStandalone, bindUnlock };

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    refreshCards();
    const path = location.pathname.toLowerCase();
    if (path.includes('/mangara-studio-7f3k9q/')) protectStandalone();
    const observer = new MutationObserver(() => {
      status(false).then(applyCards);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const heartbeat = async () => {
      const info = await refreshCards();
      const params = new URLSearchParams(location.search);
      const protectedView = params.get('mode') === 'gaindes' || location.pathname.toLowerCase().includes('/mangara-studio-7f3k9q/');
      if (protectedView && !info.allowed && !document.querySelector('.qg-access-gate')) location.reload();
      if (protectedView && info.allowed && document.querySelector('.qg-access-gate')) location.reload();
    };
    setInterval(heartbeat, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) heartbeat(); });
  });
})();
