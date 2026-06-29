// ══════════════════════════════════════════════════════════════════════
// QualifGaïndé Worldwide — V10 Team App
// v10-team-app.js — Routing, sélection, rendu par équipe, i18n étendu
// ══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────
  const AR_ENABLED = true;
  const DATA_BASE = '/data/';
  const ASSETS_BASE = '/assets/';

  // ── Drapeaux par code équipe (pour la card live) ──────────────────
  const TEAM_FLAGS_V10 = {
    senegal:'🇸🇳', algeria:'🇩🇿', belgium:'🇧🇪', brazil:'🇧🇷',
    france:'🇫🇷', ivory_coast:'🇨🇮', dr_congo:'🇨🇩', morocco:'🇲🇦',
    spain:'🇪🇸', egypt:'🇪🇬', australia:'🇦🇺', japan:'🇯🇵',
    switzerland:'🇨🇭', sweden:'🇸🇪', norway:'🇳🇴', england:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    netherlands:'🇳🇱', austria:'🇦🇹'
  };

  // ── Traductions étendues (couche V10 par-dessus I18N legacy) ────────
  const V10_I18N = {
    fr: {
      selectYourTeam: 'Choisissez votre équipe',
      selectSubtitle: 'Choose your team · Elige tu equipo · Escolha seu time',
      nextMatch: 'Prochain match',
      lastResults: 'Derniers résultats',
      heroPlayer: 'Joueur vedette',
      kickoffIn: 'Coup d\'envoi dans',
      changeTeam: '← Changer d\'équipe',
      days: 'jours', hours: 'heures', min: 'min', sec: 'sec',
      matchDone: 'Match terminé',
      nextRound: 'Prochain rendez-vous mondial.',
    },
    en: {
      selectYourTeam: 'Choose your team',
      selectSubtitle: 'Choisissez votre équipe · Elige tu equipo · Escolha seu time',
      nextMatch: 'Next match',
      lastResults: 'Last results',
      heroPlayer: 'Star player',
      kickoffIn: 'Kick-off in',
      changeTeam: '← Change team',
      days: 'days', hours: 'hours', min: 'min', sec: 'sec',
      matchDone: 'Match finished',
      nextRound: 'Next world-class appointment.',
    },
    pt: {
      selectYourTeam: 'Escolha seu time',
      selectSubtitle: 'Choisissez votre équipe · Choose your team · Elige tu equipo',
      nextMatch: 'Próximo jogo',
      lastResults: 'Últimos resultados',
      heroPlayer: 'Jogador estrela',
      kickoffIn: 'Começa em',
      changeTeam: '← Trocar de time',
      days: 'dias', hours: 'horas', min: 'min', sec: 'seg',
      matchDone: 'Jogo encerrado',
      nextRound: 'Próximo compromisso mundial.',
    },
    es: {
      selectYourTeam: 'Elige tu equipo',
      selectSubtitle: 'Choisissez votre équipe · Choose your team · Escolha seu time',
      nextMatch: 'Próximo partido',
      lastResults: 'Últimos resultados',
      heroPlayer: 'Jugador estrella',
      kickoffIn: 'Comienza en',
      changeTeam: '← Cambiar equipo',
      days: 'días', hours: 'horas', min: 'min', sec: 'seg',
      matchDone: 'Partido finalizado',
      nextRound: 'Próxima cita mundial.',
    },
    ar: {
      selectYourTeam: 'اختر فريقك',
      selectSubtitle: 'Choose your team · Choisissez votre équipe',
      nextMatch: 'المباراة القادمة',
      lastResults: 'آخر النتائج',
      heroPlayer: 'نجم الفريق',
      kickoffIn: 'الانطلاق في',
      changeTeam: 'تغيير الفريق ←',
      days: 'أيام', hours: 'ساعات', min: 'دقيقة', sec: 'ثانية',
      matchDone: 'انتهت المباراة',
      nextRound: 'الموعد العالمي القادم.',
    }
  };

  // ── State ────────────────────────────────────────────────────────────
  let activeTeam = null;
  let activeMatch = null;
  let teamsData = {};
  let matchesData = {};
  let teamResultsData = {};
  let opponentsData = {};
  let opponentResultsData = {};
  let countdownTimer = null;
  let v10Lang = 'fr';

  // ── Helpers ──────────────────────────────────────────────────────────
  function tv(key) {
    return (V10_I18N[v10Lang] && V10_I18N[v10Lang][key]) || V10_I18N.fr[key] || key;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fetchJSON(url) {
    return fetch(url + '?_=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  // ── Boot : lire les paramètres URL ──────────────────────────────────
  function getParams() {
    const p = new URLSearchParams(window.location.search);
    return { teamId: p.get('team'), langOverride: p.get('lang') };
  }

  // ── Détection de langue ──────────────────────────────────────────────
  function detectLang(team) {
    const { langOverride } = getParams();
    const manual = localStorage.getItem('siteLangSource') === 'manual' ? localStorage.getItem('siteLang') : null;
    if (langOverride && V10_I18N[langOverride]) return langOverride;
    if (manual && V10_I18N[manual]) return manual;
    if (team && team.defaultLang && V10_I18N[team.defaultLang]) {
      // Arabe : seulement sur la page équipe, pas la home
      if (team.defaultLang === 'ar' && !AR_ENABLED) return 'fr';
      return team.defaultLang;
    }
    // Détection navigateur pour la home
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'fr';
    const code = nav.split('-')[0].toLowerCase();
    return V10_I18N[code] ? code : 'fr';
  }

  // ── Injection CSS vars couleurs équipe ───────────────────────────────
  function applyTeamTheme(team) {
    const r = document.documentElement;
    r.style.setProperty('--v10-primary', team.primary || '#00853F');
    r.style.setProperty('--v10-secondary', team.secondary || '#FDEF42');
    r.style.setProperty('--v10-accent', team.accent || '#E31B23');
  }

  // ── RTL pour l'arabe ─────────────────────────────────────────────────
  function applyRTL(lang) {
    const appEl = document.getElementById('v10-team-app');
    if (!appEl) return;
    if (lang === 'ar') {
      appEl.classList.add('v10-rtl');
      appEl.setAttribute('dir', 'rtl');
    } else {
      appEl.classList.remove('v10-rtl');
      appEl.removeAttribute('dir');
    }
  }

  // ── Rendu de l'écran de sélection ───────────────────────────────────
  function renderSelector(teams) {
    const existing = document.getElementById('v10-team-selector');
    if (existing) existing.remove();

    // Langue home : jamais arabe automatiquement
    v10Lang = detectLang(null);
    if (v10Lang === 'ar') v10Lang = 'fr';

    const order = ['senegal','algeria','egypt','ivory_coast','dr_congo','morocco',
                   'belgium','brazil','france','spain'];

    const cards = order.map(id => {
      const t = teams[id];
      if (!t) return '';
      return `
        <a class="v10-team-card" href="/?team=${id}" 
           style="--tc-primary:${t.primary};"
           onclick="window.__v10SelectTeam(event,'${id}')">
          <div class="v10-tc-bg"></div>
          <div class="v10-tc-flag">${t.flag}</div>
          <div class="v10-tc-info">
            <div class="v10-tc-name">${t.teamName}</div>
            <div class="v10-tc-tag">${t.tagline || ''}</div>
          </div>
        </a>`;
    }).join('');

    const html = `
      <div id="v10-team-selector" class="v10-selector" role="dialog" aria-label="${tv('selectYourTeam')}">
        <div class="v10-sel-bg"></div>
        <div class="v10-sel-particles">
          ${[10,25,40,55,70,85].map((l,i) =>
            `<div class="v10-particle" style="left:${l}%;animation-duration:${9+i*2}s;animation-delay:${i*0.6}s"></div>`
          ).join('')}
        </div>
        <div class="v10-sel-header">
          <div class="v10-sel-logo">⚽</div>
          <div class="v10-sel-title">FIFA World Cup <span>2026</span></div>
          <div class="v10-sel-subtitle">${tv('selectYourTeam')} · ${tv('selectSubtitle')}</div>
        </div>
        <div class="v10-team-grid" id="v10-team-grid">${cards}</div>
        <div class="v10-sel-footer">
          Offert par Mohamed LY · Think Tank IPODE &nbsp;·&nbsp;
          <a href="/?team=senegal">🇸🇳 Sénégal →</a>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('afterbegin', html);
    document.documentElement.classList.remove('v10-booting');
  }

  // ── Rendu de la section équipe ───────────────────────────────────────
  function renderTeamApp(team, match, results, opponent, oppResults) {
    const existing = document.getElementById('v10-team-app');
    if (existing) existing.remove();

    // Obtenir image avec fallback PNG
    const playerImg = team.heroPng
      ? `<img src="${team.heroPng}" alt="${team.heroPlayer}" onerror="this.style.display='none'">`
      : (team.heroImg ? `<img src="${team.heroImg}" alt="${team.heroPlayer}" onerror="this.style.display='none'">` : '');

    const oppImg = opponent && (opponent.heroPng || opponent.heroImg)
      ? `<img src="${opponent.heroPng || opponent.heroImg}" alt="${opponent.heroPlayer}" onerror="this.style.display='none'">`
      : '';

    // Résultats équipe
    const teamResultsHtml = (results || []).map(r => {
      const cls = r.type === 'W' ? 'v10-res-w' : r.type === 'D' ? 'v10-res-d' : 'v10-res-n';
      return `<div class="v10-result ${cls}"><span>${r.label}</span><span class="v10-res-badge">${r.type}</span></div>`;
    }).join('');

    // Résultats adversaire
    const oppResultsHtml = (oppResults || []).map(r => {
      const cls = r.type === 'W' ? 'v10-res-w' : r.type === 'D' ? 'v10-res-d' : 'v10-res-n';
      return `<div class="v10-result ${cls}"><span>${r.label}</span><span class="v10-res-badge">${r.type}</span></div>`;
    }).join('');

    const matchLabel = match ? match.label : '—';
    const matchMeta = match ? `${match.stadium || ''} · ${formatDate(match.dateParis)}` : '';

    const html = `
      <div id="v10-team-app" class="v10-team-app">
        <!-- Bouton changer d'équipe -->
        <div class="v10-change-team-bar">
          <a class="v10-change-team" href="/">← ${tv('changeTeam').replace('← ','')}</a>
        </div>

        <!-- Bloc prochain match -->
        <div class="v10-match-block">
          <!-- Card équipe -->
          <div class="v10-player-card v10-home-card" style="--tc-primary:${team.primary}">
            <div class="v10-pc-img">${playerImg}</div>
            <div class="v10-pc-info">
              <div class="v10-pc-flag">${team.flag}</div>
              <div class="v10-pc-name">${team.teamName}</div>
              <div class="v10-pc-nick">${team.statusLabel || ''}</div>
            </div>
            <div class="v10-pc-results">
              <div class="v10-results-label">${tv('lastResults')}</div>
              ${teamResultsHtml}
            </div>
          </div>

          <!-- Compte à rebours central -->
          <div class="v10-countdown-center" id="v10-cd">
            <div class="v10-cd-label">${tv('kickoffIn')}</div>
            <div class="v10-cd-match">${matchLabel}</div>
            <div class="v10-cd-blocks">
              <div class="v10-cd-block"><div class="v10-cd-num" id="v10cd-j">--</div><div class="v10-cd-unit">${tv('days')}</div></div>
              <div class="v10-cd-block"><div class="v10-cd-num" id="v10cd-h">--</div><div class="v10-cd-unit">${tv('hours')}</div></div>
              <div class="v10-cd-block"><div class="v10-cd-num" id="v10cd-m">--</div><div class="v10-cd-unit">${tv('min')}</div></div>
              <div class="v10-cd-block"><div class="v10-cd-num" id="v10cd-s">--</div><div class="v10-cd-unit">${tv('sec')}</div></div>
            </div>
            <div class="v10-cd-meta">${matchMeta}</div>
          </div>

          <!-- Card adversaire -->
          <div class="v10-player-card v10-away-card" style="--tc-primary:${opponent ? opponent.primary || '#555' : '#555'}">
            ${opponent ? `
            <div class="v10-pc-img">${oppImg}</div>
            <div class="v10-pc-info">
              <div class="v10-pc-flag">${opponent.flag || ''}</div>
              <div class="v10-pc-name">${opponent.teamName}</div>
              <div class="v10-pc-nick">${opponent.nickname || ''}</div>
            </div>
            <div class="v10-pc-results">
              <div class="v10-results-label">${tv('lastResults')}</div>
              ${oppResultsHtml}
            </div>` : '<div class="v10-pc-info"><div class="v10-pc-name">—</div></div>'}
          </div>
        </div>
      </div>`;

    // Injecter juste après le header dans le main
    const main = document.querySelector('.main') || document.querySelector('main') || document.body;
    const firstSec = main.querySelector('.sec, section, .panel, .live-panel');
    if (firstSec) {
      firstSec.insertAdjacentHTML('beforebegin', html);
    } else {
      main.insertAdjacentHTML('afterbegin', html);
    }

    applyRTL(v10Lang);
    startV10Countdown(match);
  }

  // ── Compte à rebours V10 ─────────────────────────────────────────────
  function startV10Countdown(match) {
    if (countdownTimer) clearInterval(countdownTimer);
    if (!match || !match.dateUTC) return;

    // Verrouiller le countdown legacy V9.8
    window.QUALIFGAINDE_V10_COUNTDOWN_LOCKED = true;

    const target = new Date(match.dateUTC).getTime();

    function tick() {
      const now = Date.now();
      const diff = target - now;
      const jEl = document.getElementById('v10cd-j');
      const hEl = document.getElementById('v10cd-h');
      const mEl = document.getElementById('v10cd-m');
      const sEl = document.getElementById('v10cd-s');
      if (!jEl) return;

      if (diff <= 0) {
        jEl.textContent = '00'; hEl.textContent = '00';
        mEl.textContent = '00'; sEl.textContent = '00';
        return;
      }
      const j = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      jEl.textContent = pad(j);
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    }

    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // ── Format de date lisible ────────────────────────────────────────────
  function formatDate(dateParis) {
    if (!dateParis) return '';
    try {
      const d = new Date(dateParis);
      return d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'long' })
             + ' · ' + d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) + ' Paris';
    } catch(e) { return dateParis; }
  }

  // ── Adapter le titre de la page ───────────────────────────────────────
  function adaptPageTitle(team) {
    if (team) {
      document.title = team.flag + ' ' + team.teamName + ' — CM 2026 · QualifGaïndé Worldwide';
    } else {
      document.title = 'QualifGaïndé Worldwide · Coupe du Monde 2026';
    }
  }

  // ── Initialisation principale ─────────────────────────────────────────
  async function init() {
    const { teamId } = getParams();

    // Charger teams.json toujours
    teamsData = await fetchJSON(DATA_BASE + 'teams.json') || {};

    if (!teamId || !teamsData[teamId]) {
      // Afficher l'écran de sélection
      renderSelector(teamsData);
      adaptPageTitle(null);
      return;
    }

    // Équipe active
    activeTeam = teamsData[teamId];
    v10Lang = detectLang(activeTeam);

    // Appliquer thème couleur
    applyTeamTheme(activeTeam);
    adaptPageTitle(activeTeam);

    // Appliquer langue au legacy I18N si possible
    if (typeof setLanguage === 'function') {
      const safeLang = (v10Lang === 'ar' && !AR_ENABLED) ? 'fr' : v10Lang;
      try { setLanguage(safeLang); } catch(e) {}
    }

    // Sauvegarder en session
    sessionStorage.setItem('v10_team', teamId);

    // Charger les données en parallèle
    const [matches, results, opponents, oppResults] = await Promise.all([
      fetchJSON(DATA_BASE + 'matches.json'),
      fetchJSON(DATA_BASE + 'team-results.json'),
      fetchJSON(DATA_BASE + 'opponents.json'),
      fetchJSON(DATA_BASE + 'opponent-results.json')
    ]);

    matchesData = matches || {};
    teamResultsData = results || {};
    opponentsData = opponents || {};
    opponentResultsData = oppResults || {};

    // Trouver le match de l'équipe
    const matchId = activeTeam.nextMatchId;
    activeMatch = matchesData[matchId] || null;

    // Trouver l'adversaire
    let opponentId = null;
    if (activeMatch) {
      opponentId = activeMatch.home === teamId ? activeMatch.away : activeMatch.home;
    }
    const opponent = opponentId ? (opponentsData[opponentId] || teamsData[opponentId] || null) : null;
    const oppRes = opponentId ? (opponentResultsData[opponentId] || []) : [];
    const teamRes = teamResultsData[teamId] || [];

    // Rendre le bloc équipe
    renderTeamApp(activeTeam, activeMatch, teamRes, opponent, oppRes);

    // Retirer le booting après rendu
    document.documentElement.classList.remove('v10-booting');
  }

  // ── Exposition globale pour les onclick HTML ──────────────────────────
  window.__v10SelectTeam = function(e, teamId) {
    e.preventDefault();
    sessionStorage.setItem('v10_team', teamId);
    window.location.href = '/?team=' + teamId;
  };

  // ── Lancement ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
