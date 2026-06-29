// QualifGaïndé V10 — couche multi-équipes isolée
// Ne modifie pas scores.js, live.json, stats.json, ni le moteur bracket V9.8.
(function(){
  const DATA_BASE = 'data/';
  const TEAM_ORDER = ['senegal','algeria','belgium','brazil','france','ivory_coast','dr_congo','morocco'];
  const FALLBACK_TEAMS = {
    switzerland:{teamName:'Suisse',flag:'🇨🇭',supporterName:'Nati'}, japan:{teamName:'Japon',flag:'🇯🇵',supporterName:'Samouraïs Bleus'},
    sweden:{teamName:'Suède',flag:'🇸🇪',supporterName:'Blågult'}, norway:{teamName:'Norvège',flag:'🇳🇴',supporterName:'Norvège'},
    england:{teamName:'Angleterre',flag:'🏴',supporterName:'Three Lions'}, netherlands:{teamName:'Pays-Bas',flag:'🇳🇱',supporterName:'Oranje'},
    iraq:{teamName:'Iraq',flag:'🇮🇶'}, egypt:{teamName:'Égypte',flag:'🇪🇬'}, iran:{teamName:'Iran',flag:'🇮🇷'},
    'new_zealand':{teamName:'Nouvelle-Zélande',flag:'🇳🇿'}, haiti:{teamName:'Haïti',flag:'🇭🇹'}, scotland:{teamName:'Écosse',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿'},
    germany:{teamName:'Allemagne',flag:'🇩🇪'}, ecuador:{teamName:'Équateur',flag:'🇪🇨'}, curacao:{teamName:'Curaçao',flag:'🇨🇼'}, portugal:{teamName:'Portugal',flag:'🇵🇹'}, colombia:{teamName:'Colombie',flag:'🇨🇴'}, uzbekistan:{teamName:'Ouzbékistan',flag:'🇺🇿'}, argentina:{teamName:'Argentine',flag:'🇦🇷'}, jordan:{teamName:'Jordanie',flag:'🇯🇴'}, austria:{teamName:'Autriche',flag:'🇦🇹'}, france:{teamName:'France',flag:'🇫🇷'}
  };
  let state = { teams:{}, matches:{}, results:{}, opponentResults:{}, opponents:{}, previews:{}, stories:{}, activeTeamId:null, i18n:{} };
  let v10CountdownTimer = null;
  let v10CountdownTextObserver = null;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  async function readJson(path){
    const res = await fetch(path + '?v=' + Date.now(), { cache:'no-store' });
    if(!res.ok) throw new Error(path + ' HTTP ' + res.status);
    return res.json();
  }
  async function readOptionalJson(path){
    try { return await readJson(path); } catch(e) { return {}; }
  }
  function teamLabel(id){ return state.teams[id] || state.opponents[id] || FALLBACK_TEAMS[id] || {teamName:id, flag:'🏳️', supporterName:''}; }
  function mergeTeamI18n(team, lang){ return Object.assign({}, team, (state.i18n?.[lang]?.teams || {})[state.activeTeamId] || {}); }
  function getActiveTeam(){
    const base = state.teams[state.activeTeamId];
    if(!base) return null;
    return mergeTeamI18n(base, base.defaultLang);
  }
  function getPreview(matchId, lang){ return ((state.i18n?.[lang]?.previews || {})[matchId]) || state.previews[matchId]; }
  function getStory(teamId, lang){ return ((state.i18n?.[lang]?.stories || {})[teamId]) || state.stories[teamId]; }
  function formatDateParis(iso){
    const d = new Date(iso);
    if(Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Paris'}).format(d).replace(':','h');
  }
  function resultClass(code){ return code === 'V' ? 'win' : code === 'D' ? 'loss' : 'draw'; }
  function safeHtml(str){ const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }

  async function loadData(){
    const [teams, matches, results, previews, stories] = await Promise.all([
      readJson(DATA_BASE+'teams.json'), readJson(DATA_BASE+'matches.json'), readJson(DATA_BASE+'team-results.json'), readJson(DATA_BASE+'previews.json'), readJson(DATA_BASE+'stories.json')
    ]);
    state.teams = teams; state.matches = matches; state.results = results; state.previews = previews; state.stories = stories;
    state.opponents = await readOptionalJson(DATA_BASE+'opponents.json');
    state.opponentResults = await readOptionalJson(DATA_BASE+'opponent-results.json');
    state.i18n.pt = {
      teams: await readOptionalJson(DATA_BASE+'i18n/pt/teams.json'),
      previews: await readOptionalJson(DATA_BASE+'i18n/pt/previews.json'),
      stories: await readOptionalJson(DATA_BASE+'i18n/pt/stories.json')
    };
  }

  function installSelector(){
    document.body.classList.add('v10-selector-open');
    const saved = localStorage.getItem('qualifgainde.favoriteTeam');
    const cards = TEAM_ORDER.filter(id => state.teams[id]).map(id => {
      const t = state.teams[id];
      const match = state.matches[t.nextMatchId] || {};
      const opponentId = match.home === id ? match.away : match.home;
      const opp = teamLabel(opponentId);
      return `<a class="v10-team-card" href="?team=${encodeURIComponent(id)}" style="--card-primary:${t.primary};--card-secondary:${t.secondary};--card-accent:${t.accent}" data-team-card="${id}">
        <img src="${safeHtml(t.bannerImg)}" alt="${safeHtml(t.teamName)}">
        <div class="v10-team-card-body">
          <div class="v10-team-flag">${t.flag}</div>
          <div class="v10-team-name">${safeHtml(t.teamName)}</div>
          <div class="v10-team-supporter">${safeHtml(t.supporterName || t.statusLabel || '')}</div>
          <div class="v10-team-line">${safeHtml(t.selectorLine || t.tagline || '')}<br>Prochain : ${safeHtml(match.label || opp.teamName || '')}</div>
          <span class="v10-team-enter">Entrer avec cette équipe →</span>
        </div>
      </a>`;
    }).join('');
    const savedTeam = saved && state.teams[saved] ? state.teams[saved] : null;
    const overlay = document.createElement('div');
    overlay.className = 'v10-selector';
    overlay.id = 'v10-team-selector';
    overlay.innerHTML = `<div class="v10-selector-inner">
      <div class="v10-selector-top"><div>
        <div class="v10-world-badge">🏆 QualifGaïndé Worldwide</div>
        <h1>Entre dans <span>le Mondial</span></h1>
        <p class="v10-selector-lead">Couleurs, calendrier, prochain match, compte à rebours, histoire : choisis ton camp et vis la Coupe du monde depuis ta tribune.</p>
      </div></div>
      <div class="v10-choice-title">Je suis supporter de…</div>
      <div class="v10-team-grid">${cards}</div>
      <div class="v10-selector-actions">
        ${savedTeam ? `<a class="v10-action" href="?team=${encodeURIComponent(saved)}">Reprendre avec ${savedTeam.flag} ${safeHtml(savedTeam.teamName)}</a>` : ''}
        <a class="v10-action" href="?mode=global">Voir le tournoi complet sans choisir d’équipe</a>
      </div>
    </div>`;
    document.body.prepend(overlay);
  }

  function setCssVars(team){
    const root = document.documentElement;
    root.style.setProperty('--team-primary', team.primary);
    root.style.setProperty('--team-secondary', team.secondary);
    root.style.setProperty('--team-accent', team.accent);
    root.style.setProperty('--vert', team.primary);
    root.style.setProperty('--or', team.secondary);
    root.style.setProperty('--rouge', team.accent);
    document.body.classList.add('v10-team-applied');
  }

  function renderHeader(team){
    document.title = `${team.teamName} · QualifGaïndé Worldwide`;
    document.documentElement.lang = team.defaultLang || 'fr';
    const titleSpan = $('.htitle span'); if(titleSpan) titleSpan.textContent = team.teamName;
    const htitle = $('.htitle');
    if(htitle && !$('.v10-active-team-pill', htitle)) htitle.insertAdjacentHTML('beforeend', `<span class="v10-active-team-pill">${team.flag} ${team.supporterName || ''}</span>`);
    const kicker = $('.site-kicker'); if(kicker) kicker.textContent = team.tagline || team.statusLabel || 'QualifGaïndé Worldwide';
    const logo = $('.mascot-logo');
    if(logo){ logo.src = team.mascotImg || team.heroImg || logo.src; logo.alt = team.heroPlayer || team.teamName; }
    const music = $('#btn-music'); if(music) music.textContent = team.defaultLang === 'pt' ? 'Ambiente de estádio' : `Ambiance ${team.supporterName || team.teamName}`;
  }

  function renderHeaderScores(teamId){
    const list = state.results[teamId] || [];
    const wrap = $('#live-center'); if(!wrap || !list.length) return;
    $$('.hscore', wrap).forEach((row, idx) => {
      const r = list[idx]; if(!r) return;
      row.classList.remove('win','loss','draw'); row.classList.add(resultClass(r.result));
      const label = $('.hs-label', row); if(label) label.textContent = `Match ${idx+1}`;
      const score = $('.hs-score', row); if(score) score.textContent = r.label;
      const note = $('.hs-note', row); if(note) note.textContent = r.note || '';
    });
    wrap.setAttribute('aria-label', `Résultats récents · ${teamLabel(teamId).teamName}`);
  }

  function renderHero(team){
    const img = $('#hero-banner img');
    if(img){ img.src = team.bannerImg || img.src; img.alt = `${team.teamName} · QualifGaïndé Worldwide`; }
    const title = $('#hero-title'); if(title) title.textContent = `${team.flag} ${team.teamName} à la Coupe du monde 2026`;
    const sub = $('#hero-subtitle'); if(sub) sub.textContent = team.tagline || team.statusLabel || '';
  }

  function renderOpponent(teamId, team){
    const match = state.matches[team.nextMatchId]; if(!match) return;
    const oppId = match.home === teamId ? match.away : match.home;
    const opp = teamLabel(oppId);
    const card = $('#probable-opponent'); if(card) card.title = `Prochain match : ${match.label}`;
    const name = $('#opp-main-name'); if(name) name.textContent = `${opp.flag || ''} ${opp.teamName || oppId}`;
    const sub = $('#opp-main-sub'); if(sub) sub.textContent = `${match.label} · ${formatDateParis(match.dateParis)} · ${match.stadium || ''}`;
  }

  function renderSide(side, teamId){
    if(!side) return;
    const t = teamLabel(teamId);
    const profile = state.teams[teamId] || state.opponents[teamId] || null;
    const isOpponent = !state.teams[teamId] && !!state.opponents[teamId];
    side.classList.toggle('v10-placeholder', !profile);
    side.classList.toggle('v10-opponent-card', isOpponent);
    side.setAttribute('aria-label', `Forme récente de ${t.teamName}`);

    const img = $('.player-photo', side);
    const imgSrc = profile?.heroImg || profile?.playerImg || '';
    if(img){
      if(imgSrc){
        img.style.display = '';
        img.src = imgSrc;
        img.alt = `${profile.heroPlayer || profile.teamName || t.teamName} · ${t.teamName}`;
      } else {
        img.style.display = 'none';
      }
    }

    const title = $('.side-title', side);
    if(title) title.innerHTML = `<span>${t.flag || ''} ${safeHtml(t.teamName)}</span><span>${safeHtml(t.supporterName || profile?.statusLabel || profile?.nickname || '')}</span>`;

    const sub = $('.side-sub', side);
    if(sub){
      const player = profile?.heroPlayer ? ` · ${profile.heroPlayer}` : '';
      sub.textContent = `${isOpponent ? 'Adversaire à surveiller' : 'Trois derniers résultats'}${player}`;
    }

    const results = state.results[teamId] || state.opponentResults[teamId] || [];
    const list = $('.form-list', side);
    if(list){
      list.style.display = results.length ? '' : 'none';
      list.innerHTML = results.map(r => `<div class="form-row ${resultClass(r.result)}"><span>${safeHtml(r.label)}</span><strong>${safeHtml(r.result)}</strong></div>`).join('');
    }
  }

  function renderCountdown(teamId, team){
    const match = state.matches[team.nextMatchId]; if(!match) return;
    const secBefore = Array.from(document.querySelectorAll('.sec')).find(el => /Prochaine|Próximo|Proximo|Next/i.test(el.textContent));
    if(secBefore){
      const sectionText = team.defaultLang === 'pt' ? `Próximo jogo do ${safeHtml(team.teamName)}` : `Prochaine rencontre de ${safeHtml(team.teamName)}`;
      secBefore.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${sectionText}`;
    }
    const home = teamLabel(match.home), away = teamLabel(match.away);
    const cmatch = $('.countdown-match'); if(cmatch) cmatch.textContent = `${home.flag || ''} ${home.teamName} vs ${away.teamName} ${away.flag || ''}`;
    const meta = $('.countdown-meta'); if(meta) meta.textContent = `${formatDateParis(match.dateParis)} · ${match.stadium || ''}${match.channel_fr ? ' · ' + match.channel_fr : ''}`;
    renderSide($('.player-side.bel'), match.home);
    renderSide($('.player-side.sen'), match.away);
    startV10Countdown(match.dateParis, team);
  }

  function countdownFixedMessage(team, isMatchDay){
    if(isMatchDay) return team.defaultLang === 'pt' ? `Dia de jogo: ${team.teamName} entra em campo.` : `Jour de match : ${team.teamName} entre dans l’arène.`;
    return team.defaultLang === 'pt' ? 'Próximo compromisso mundial.' : 'Prochain rendez-vous mondial.';
  }

  function lockCountdownMessage(team, isMatchDay){
    const msg = $('#countdown-end-msg');
    if(!msg) return;
    const fixed = countdownFixedMessage(team, isMatchDay);
    msg.textContent = fixed;
    msg.dataset.v10FixedText = fixed;
    if(v10CountdownTextObserver) v10CountdownTextObserver.disconnect();
    v10CountdownTextObserver = new MutationObserver(() => {
      if(msg.textContent !== msg.dataset.v10FixedText) msg.textContent = msg.dataset.v10FixedText;
    });
    v10CountdownTextObserver.observe(msg, { childList:true, characterData:true, subtree:true });
  }

  function startV10Countdown(iso, team){
    const target = new Date(iso).getTime();
    if(Number.isNaN(target)) return;
    if(v10CountdownTimer) clearInterval(v10CountdownTimer);
    function set(id, v){ const el = document.getElementById(id); if(el) el.textContent = String(v).padStart(2,'0'); }
    function tick(){
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff/86400000); diff -= days*86400000;
      const hours = Math.floor(diff/3600000); diff -= hours*3600000;
      const mins = Math.floor(diff/60000); diff -= mins*60000;
      const secs = Math.floor(diff/1000);
      set('cd-days', days); set('cd-hours', hours); set('cd-min', mins); set('cd-sec', secs);
      lockCountdownMessage(team, target <= now);
    }
    tick(); v10CountdownTimer = setInterval(tick, 900);
  }

  function renderPreview(team){
    const matchId = team.nextMatchId;
    const preview = getPreview(matchId, team.defaultLang);
    if(!preview) return;
    const title = $('#belgique-senegal .teaser-title');
    if(title) title.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${safeHtml(preview.title)}`;
    const body = $('#belgique-senegal .teaser-body');
    if(body){
      const paragraphs = Array.isArray(preview.body) ? preview.body : [preview.body || ''];
      const angle = preview.angle ? `<strong>${safeHtml(preview.angle)}</strong><br><br>` : '';
      body.innerHTML = angle + paragraphs.map(p => safeHtml(p)).join('<br><br>');
    }
  }

  function renderStory(teamId, team){
    const story = getStory(teamId, team.defaultLang); if(!story) return;
    const title = $('#histoire-gaindes .story-title');
    if(title) title.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${safeHtml(story.title)}`;
    const kicker = $('#histoire-gaindes .story-kicker'); if(kicker) kicker.textContent = story.subtitle || team.tagline || '';
    const body = $('#histoire-gaindes .story-body');
    if(body){
      const paragraphs = (story.paragraphs || []).map(p => `<p>${safeHtml(p)}</p>`).join('');
      const timeline = (story.timeline || []).map(item => `<div class="story-tile"><b>${safeHtml(String(item).split('·')[0].trim())}</b>${safeHtml(String(item).includes('·') ? String(item).split('·').slice(1).join('·').trim() : item)}</div>`).join('');
      body.innerHTML = paragraphs + (timeline ? `<div class="story-timeline">${timeline}</div>` : '');
    }
  }

  function addChangeTeamLink(team){
    if($('#v10-change-team')) return;
    const a = document.createElement('a');
    a.href = './'; a.id = 'v10-change-team'; a.className = 'v10-change-team';
    a.textContent = `Changer d’équipe · ${team.flag} ${team.teamName}`;
    document.body.appendChild(a);
  }

  function applyTeam(teamId){
    const team = getActiveTeam(); if(!team) return;
    localStorage.setItem('qualifgainde.favoriteTeam', teamId);
    setCssVars(team); renderHeader(team); renderHeaderScores(teamId); renderHero(team); renderOpponent(teamId, team); renderCountdown(teamId, team); renderPreview(team); renderStory(teamId, team); addChangeTeamLink(team);
  }

  function patchLanguageSwitcher(){
    const original = window.setLanguage;
    if(typeof original !== 'function' || original.__v10Patched) return;
    window.setLanguage = function(lang){
      const res = original.apply(this, arguments);
      setTimeout(() => { if(state.activeTeamId) applyTeam(state.activeTeamId); }, 60);
      return res;
    };
    window.setLanguage.__v10Patched = true;
  }

  async function init(){
    try { await loadData(); } catch(err) { console.error('[V10] Chargement data impossible', err); return; }
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('team');
    if(!teamId && params.get('mode') !== 'global') { installSelector(); return; }
    if(teamId && state.teams[teamId]){
      state.activeTeamId = teamId;
      const baseTeam = state.teams[teamId];
      patchLanguageSwitcher();
      if(baseTeam.defaultLang && typeof window.setLanguage === 'function'){
        try { window.setLanguage(baseTeam.defaultLang); } catch(e) { console.warn('[V10] setLanguage ignoré', e); }
      }
      applyTeam(teamId);
      setTimeout(() => applyTeam(teamId), 120);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();