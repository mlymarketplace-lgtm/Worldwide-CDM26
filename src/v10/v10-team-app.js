// QualifGaïndé V11.2 — France qualifiée + Paraguay–France + stats Mbappé
// Conserve le socle V10.4.4 : routing, PWA, API, bracket et affichage local timezone.
(function(){
  window.QUALIFGAINDE_V10_ACTIVE = true;
  const DATA_BASE = 'data/';
  const AR_ENABLED = true; // V10.2 — retirer/mettre false pour désactiver l’arabe sans casser le reste.
  const TEAM_ORDER = ['senegal','algeria','egypt','ivory_coast','dr_congo','morocco','belgium','brazil','france','spain'];
  const FALLBACK_TEAMS = {
    switzerland:{teamName:'Suisse',flag:'🇨🇭',supporterName:'Nati'}, japan:{teamName:'Japon',flag:'🇯🇵',supporterName:'Samouraïs Bleus'},
    sweden:{teamName:'Suède',flag:'🇸🇪',supporterName:'Blågult'}, norway:{teamName:'Norvège',flag:'🇳🇴',supporterName:'Norvège'},
    england:{teamName:'Angleterre',flag:'🏴',supporterName:'Three Lions'}, netherlands:{teamName:'Pays-Bas',flag:'🇳🇱',supporterName:'Oranje'},
    iraq:{teamName:'Iraq',flag:'🇮🇶'}, egypt:{teamName:'Égypte',flag:'🇪🇬'}, iran:{teamName:'Iran',flag:'🇮🇷'},
    'new_zealand':{teamName:'Nouvelle-Zélande',flag:'🇳🇿'}, haiti:{teamName:'Haïti',flag:'🇭🇹'}, scotland:{teamName:'Écosse',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿'},
    germany:{teamName:'Allemagne',flag:'🇩🇪'}, ecuador:{teamName:'Équateur',flag:'🇪🇨'}, curacao:{teamName:'Curaçao',flag:'🇨🇼'}, portugal:{teamName:'Portugal',flag:'🇵🇹'}, colombia:{teamName:'Colombie',flag:'🇨🇴'}, uzbekistan:{teamName:'Ouzbékistan',flag:'🇺🇿'}, argentina:{teamName:'Argentine',flag:'🇦🇷'}, jordan:{teamName:'Jordanie',flag:'🇯🇴'}, austria:{teamName:'Autriche',flag:'🇦🇹'}, australia:{teamName:'Australie',flag:'🇦🇺'}, spain:{teamName:'Espagne',flag:'🇪🇸'}, france:{teamName:'France',flag:'🇫🇷'}
  };
  let state = { teams:{}, matches:{}, results:{}, opponentResults:{}, opponents:{}, previews:{}, stories:{}, teamNext:{}, farewells:{}, activeTeamId:null, activeLang:'fr', i18n:{} };
  let v10CountdownTimer = null;
  let v10CountdownTextObserver = null;
  let v10CountdownScoreTimer = null;
  let v10CountdownScoreInFlight = false;

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
  function teamLabel(id){
    const base = state.teams[id] || state.opponents[id] || FALLBACK_TEAMS[id] || {teamName:id, flag:'🏳️', supporterName:''};
    const tr = (state.i18n?.[state.activeLang]?.teams || {})[id] || {};
    return Object.assign({}, base, tr);
  }
  function mergeTeamI18n(team, lang){ return Object.assign({}, team, (state.i18n?.[lang]?.teams || {})[state.activeTeamId] || {}); }
  function getActiveTeam(){
    const base = state.teams[state.activeTeamId];
    if(!base) return null;
    return mergeTeamI18n(base, state.activeLang || base.defaultLang || 'fr');
  }
  function getPreview(matchId, lang){ return ((state.i18n?.[lang || state.activeLang]?.previews || {})[matchId]) || state.previews[matchId]; }
  function getStory(teamId, lang){ return ((state.i18n?.[lang || state.activeLang]?.stories || {})[teamId]) || state.stories[teamId]; }
  function formatMatchTimeForDevice(matchDate, lang = state.activeLang || 'fr'){
    if (typeof window.QUALIFGAINDE_FORMAT_MATCH_TIME_FOR_DEVICE === 'function') {
      return window.QUALIFGAINDE_FORMAT_MATCH_TIME_FOR_DEVICE(matchDate, lang);
    }
    const d = new Date(matchDate);
    if(Number.isNaN(d.getTime())) return '';
    const locale = lang === 'ar' ? 'ar-EG' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-PT' : lang === 'en' ? 'en-GB' : 'fr-FR';
    const label = lang === 'en' ? 'local time' : lang === 'pt' ? 'hora local' : lang === 'es' ? 'hora local' : lang === 'ar' ? 'التوقيت المحلي' : 'heure locale';
    const parts = new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).reduce((acc, part) => { acc[part.type] = part.value; return acc; }, {});
    const hour = String(parts.hour || '00').padStart(2,'0');
    const minute = String(parts.minute || '00').padStart(2,'0');
    const time = lang === 'en' ? `${hour}:${minute}` : `${hour}h${minute}`;
    const day = [parts.weekday, parts.day, parts.month].filter(Boolean).join(' ');
    return `${day} · ${time} · ${label}`;
  }
  function formatDateParis(iso, lang){ return formatMatchTimeForDevice(iso, lang); }
  function matchLabel(match){ return match ? (match['label_' + (state.activeLang || 'fr')] || match.label || '') : ''; }
  function isLiveLikeStatus(status){ return status === 'live' || status === 'in_progress'; }
  function isFinalStatus(status){ return status === 'final'; }
  function penaltyTuple(entry){
    const ph = entry?.penalty?.home ?? entry?.penaltyHome;
    const pa = entry?.penalty?.away ?? entry?.penaltyAway;
    return (ph !== null && ph !== undefined && pa !== null && pa !== undefined) ? [ph, pa] : null;
  }
  function getScoreEntry(matchId){ return (state.liveScores && state.liveScores[matchId]) || null; }
  function scoreLabelFor(entry){
    const lang = state.activeLang || 'fr';
    if(!entry) return '';
    const pen = penaltyTuple(entry);
    const penTxt = pen ? ` · TAB ${pen[0]}–${pen[1]}` : '';
    if(isLiveLikeStatus(entry.status)){
      const minute = entry.minute ? ` · ${entry.minute}e` : '';
      if(lang === 'ar') return `مباشر${minute}${penTxt}`;
      if(lang === 'pt') return `Ao vivo${minute}${penTxt}`;
      if(lang === 'es') return `En directo${minute}${penTxt}`;
      if(lang === 'en') return `Live${minute}${penTxt}`;
      return `Match en direct${minute}${penTxt}`;
    }
    if(isFinalStatus(entry.status)){
      if(lang === 'ar') return `انتهت المباراة${penTxt}`;
      if(lang === 'pt') return `Terminado${penTxt}`;
      if(lang === 'es') return `Terminado${penTxt}`;
      if(lang === 'en') return `Full time${penTxt}`;
      return `Match terminé${penTxt}`;
    }
    return '';
  }
  function updateCountdownScorePanel(matchId){
    const match = state.matches[matchId];
    const center = $('.countdown-center');
    if(!match || !center) return;
    let panel = $('#v10-countdown-score');
    if(!panel){
      panel = document.createElement('div');
      panel.id = 'v10-countdown-score';
      panel.className = 'v10-countdown-score';
      const meta = $('.countdown-meta', center);
      if(meta && meta.parentNode) meta.insertAdjacentElement('afterend', panel);
      else center.prepend(panel);
    }
    const entry = getScoreEntry(matchId);
    const hasScore = entry && entry.home !== null && entry.home !== undefined && entry.away !== null && entry.away !== undefined;
    const relevant = hasScore && (isLiveLikeStatus(entry.status) || isFinalStatus(entry.status));
    panel.classList.toggle('is-visible', !!relevant);
    panel.classList.toggle('is-live', !!(entry && isLiveLikeStatus(entry.status)));
    panel.classList.toggle('is-final', !!(entry && isFinalStatus(entry.status)));
    if(!relevant){ panel.innerHTML = ''; return; }
    const home = teamLabel(match.home), away = teamLabel(match.away);
    panel.innerHTML = `<div class="v10-score-status">${safeHtml(scoreLabelFor(entry))}</div>
      <div class="v10-score-line"><span>${safeHtml(home.flag || '')} ${safeHtml(home.teamName || match.home)}</span><strong>${entry.home}–${entry.away}</strong><span>${safeHtml(away.teamName || match.away)} ${safeHtml(away.flag || '')}</span></div>`;
  }
  async function refreshCountdownScore(){
    if(v10CountdownScoreInFlight || !state.activeTeamId) return;
    const team = state.teams[state.activeTeamId];
    const matchId = team && team.nextMatchId;
    if(!matchId) return;

    // V10.4.1 : la page principale pilote le polling /scores pour éviter
    // deux appels API concurrents. La carte équipe relit le dernier état connu.
    if(window.QUALIFGAINDE_LAST_SCORES && window.QUALIFGAINDE_LAST_SCORES.matches){
      state.liveScores = window.QUALIFGAINDE_LAST_SCORES.matches;
      updateCountdownScorePanel(matchId);
    }
    if(window.QUALIFGAINDE_SCORE_POLLING){
      // Pas de fetch direct ici : le polling global respecte les fenêtres live.
      return;
    }

    v10CountdownScoreInFlight = true;
    try{
      const res = await fetch('/.netlify/functions/scores?t=' + Date.now(), { cache:'no-store' });
      if(res.ok){
        const data = await res.json();
        if(data && data.matches){
          state.liveScores = data.matches;
          updateCountdownScorePanel(matchId);
        }
      }
    }catch(e){
      // Silencieux : la carte compte à rebours reste affichée si l'API tarde.
    }finally{
      v10CountdownScoreInFlight = false;
    }
  }
  function ensureCountdownScorePolling(){
    if(v10CountdownScoreTimer) clearInterval(v10CountdownScoreTimer);
    refreshCountdownScore();
    v10CountdownScoreTimer = setInterval(refreshCountdownScore, 60000);
  }
  window.addEventListener('qualifgainde:scoresUpdated', ev => {
    const team = state.teams[state.activeTeamId];
    const matchId = team && team.nextMatchId;
    if(ev.detail && ev.detail.matches){
      state.liveScores = ev.detail.matches;
      if(matchId) updateCountdownScorePanel(matchId);
    }
  });
  function headerSuffix(lang){ return lang === 'ar' ? 'كأس العالم 2026' : lang === 'es' ? 'Mundial 2026' : lang === 'pt' ? 'Copa 2026' : lang === 'en' ? 'WC 2026' : 'CM 2026'; }
  function heroTitleFor(team){
    if(team.heroTitle) return team.heroTitle;
    if(state.activeLang === 'ar') return `${team.flag} ${team.teamName} في كأس العالم 2026`;
    if(state.activeLang === 'es') return `${team.flag} ${team.teamName} en la Copa Mundial 2026`;
    if(state.activeLang === 'pt') return `${team.flag} ${team.teamName} na Copa do Mundo 2026`;
    if(state.activeLang === 'en') return `${team.flag} ${team.teamName} at the 2026 World Cup`;
    return `${team.flag} ${team.teamName} à la Coupe du monde 2026`;
  }
  function roundLabelFor(team){
    const lang = state.activeLang || team.defaultLang || 'fr';
    if(team.roundLabel) return team.roundLabel;
    const map = {
      R32:{fr:'seizième de finale',en:'Round of 32',pt:'16 avos',es:'dieciseisavos',ar:'دور الـ32'},
      R16:{fr:'huitième de finale',en:'Round of 16',pt:'oitavos de final',es:'octavos de final',ar:'دور الـ16'},
      QF:{fr:'quart de finale',en:'quarter-final',pt:'quartos de final',es:'cuartos de final',ar:'ربع النهائي'},
      SF:{fr:'demi-finale',en:'semi-final',pt:'semifinal',es:'semifinal',ar:'نصف النهائي'},
      F:{fr:'finale',en:'final',pt:'final',es:'final',ar:'النهائي'}
    };
    const round = team.currentRound || team.round || 'R32';
    return (map[round] && (map[round][lang] || map[round].fr)) || round;
  }
  function statusDisplayFor(team){
    const lang = state.activeLang || team.defaultLang || 'fr';
    const round = roundLabelFor(team);
    if(team.tournamentStatus === 'eliminated'){
      if(lang === 'ar') return `أُقصي في ${round}`;
      if(lang === 'en') return `Eliminated in the ${round}`;
      if(lang === 'pt') return `Eliminado nos ${round}`;
      if(lang === 'es') return `Eliminado en ${round}`;
      return `Éliminée en ${round}`;
    }
    if(team.tournamentStatus === 'qualified'){
      if(lang === 'ar') return `تأهل إلى ${round}`;
      if(lang === 'en') return `Qualified for the ${round}`;
      if(lang === 'pt') return `Classificado para os ${round}`;
      if(lang === 'es') return `Clasificado para ${round}`;
      return `Qualifié en ${round}`;
    }
    return team.statusLabel || team.tagline || '';
  }
  function eliminatedHeroSubtitle(team){
    const lang = state.activeLang || team.defaultLang || 'fr';
    if(team.heroSubtitle) return team.heroSubtitle;
    if(lang === 'ar') return 'احترام كامل، الموعد بعد أربع سنوات.';
    if(lang === 'en') return 'Total respect — see you in four years.';
    if(lang === 'pt') return 'Respeito total — encontro marcado daqui a quatro anos.';
    if(lang === 'es') return 'Respeto total: cita dentro de cuatro años.';
    return 'Respect total, rendez-vous dans quatre ans.';
  }
  function eliminatedScoreLine(team, match){
    if(team.exitScoreLine) return team.exitScoreLine;
    if(!match) return statusDisplayFor(team);
    const home = teamLabel(match.home), away = teamLabel(match.away);
    return `${home.flag || ''} ${home.teamName || match.home} – ${away.teamName || match.away} ${away.flag || ''}`;
  }
  function resultClass(code){ return code === 'V' ? 'win' : code === 'D' ? 'loss' : 'draw'; }
  function safeHtml(str){ const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
  function supportedLangs(){ return AR_ENABLED ? ['fr','en','pt','es','ar'] : ['fr','en','pt','es']; }
  function detectBrowserLang(options){
    const opts = options || {};
    const allowArabic = opts.allowArabic === true;
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'fr';
    const low = String(nav).toLowerCase();
    // V10.3.2 : pas d'arabe automatique sur la page d'accueil.
    // L'arabe reste disponible pour l'Egypte, ou via ?team=egypt&lang=ar.
    if(allowArabic && AR_ENABLED && low.startsWith('ar')) return 'ar';
    if(low.startsWith('pt')) return 'pt';
    if(low.startsWith('es')) return 'es';
    if(low.startsWith('en')) return 'en';
    return 'fr';
  }
  function chooseSelectorLang(params){
    const urlLang = params.get('lang');
    if(supportedLangs().includes(urlLang)) return urlLang;
    const saved = localStorage.getItem('siteLang');
    const source = localStorage.getItem('siteLangSource');
    // V10.3.2 : la home détecte automatiquement FR/EN/PT/ES.
    // On évite l'arabe en page d'accueil pour garder une entrée universelle lisible.
    // L'arabe reste activé sur la page Egypte via defaultLang=ar.
    if(source === 'manual' && supportedLangs().includes(saved) && saved !== 'ar') return saved;
    return detectBrowserLang({ allowArabic:false });
  }
  function isRtlLang(lang){ return AR_ENABLED && lang === 'ar'; }
  function syncLangButtons(lang){
    $$('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.langBtn === lang));
  }
  function applyLangShell(lang){
    document.documentElement.lang = lang || 'fr';
    // RTL contrôlé : on évite de passer tout le document en dir=rtl pour ne pas casser les tableaux globaux.
    document.documentElement.dir = 'ltr';
    document.body.classList.toggle('v10-lang-ar', isRtlLang(lang));
    document.body.classList.toggle('v10-rtl', isRtlLang(lang));
    document.body.dataset.v10Lang = lang || 'fr';
    syncLangButtons(lang || 'fr');
  }
  function uiText(key){
    const lang = state.activeLang || 'fr';
    const d = {
      enter:{fr:'Entrer avec cette équipe →', en:'Enter with this team →', pt:'Entrar com esta seleção →', es:'Entrar con este equipo →', ar:'ادخل مع هذا المنتخب ←'},
      next:{fr:'Prochain', en:'Next', pt:'Próximo', es:'Próximo', ar:'التالي'},
      choose:{fr:'Je suis supporter de…', en:'I support…', pt:'Sou torcedor de…', es:'Soy hincha de…', ar:'أنا أشجع…'},
      lead:{fr:'Couleurs, calendrier, prochain match, compte à rebours, histoire : choisis ton camp et vis la Coupe du monde depuis ta tribune.',en:'Colours, schedule, next match, countdown, story: choose your side and live the World Cup from your stand.',pt:'Cores, calendário, próximo jogo, contagem regressiva e história: escolha seu lado e viva a Copa do Mundo.',es:'Colores, calendario, próximo partido, cuenta atrás e historia: elige tu equipo y vive el Mundial.',ar:'الألوان، الرزنامة، المباراة القادمة، العد التنازلي والحكاية: اختر منتخبك وعش كأس العالم من مدرجك.'},
      global:{fr:'Voir le tournoi complet sans choisir d’équipe', en:'See the full tournament without choosing a team', pt:'Ver o torneio completo sem escolher seleção', es:'Ver el torneo completo sin elegir equipo', ar:'عرض البطولة كاملة دون اختيار منتخب'},
      resume:{fr:'Reprendre avec', en:'Resume with', pt:'Continuar com', es:'Continuar con', ar:'المتابعة مع'}
    };
    return (d[key] && (d[key][lang] || d[key].fr)) || key;
  }

  async function loadData(){
    const [teams, matches, results, previews, stories] = await Promise.all([
      readJson(DATA_BASE+'teams.json'), readJson(DATA_BASE+'matches.json'), readJson(DATA_BASE+'team-results.json'), readJson(DATA_BASE+'previews.json'), readJson(DATA_BASE+'stories.json')
    ]);
    state.teams = teams; state.matches = matches; state.results = results; state.previews = previews; state.stories = stories;
    state.opponents = await readOptionalJson(DATA_BASE+'opponents.json');
    state.opponentResults = await readOptionalJson(DATA_BASE+'opponent-results.json');
    state.teamNext = await readOptionalJson(DATA_BASE+'team-next.json');
    state.farewells = await readOptionalJson(DATA_BASE+'farewells.json');
    // V11 — overrides éditoriaux de tournoi vivant : on garde les mêmes écrans,
    // mais on met à jour les prochains matchs / statuts depuis un fichier dédié.
    Object.entries(state.teamNext || {}).forEach(([id, cfg]) => {
      if(!state.teams[id] || !cfg) return;
      if(cfg.nextMatchId) state.teams[id].nextMatchId = cfg.nextMatchId;
      if(cfg.status) state.teams[id].tournamentStatus = cfg.status;
      if(cfg.round) state.teams[id].currentRound = cfg.round;
      if(cfg.statusLabel) state.teams[id].statusLabel = cfg.statusLabel;
      if(cfg.selectorLine) state.teams[id].selectorLine = cfg.selectorLine;
      ['roundLabel','heroSubtitle','exitScoreLine','farewellHeadline','eliminatedBy','pendingNext'].forEach(key => {
        if(cfg[key] !== undefined) state.teams[id][key] = cfg[key];
      });
    });
    state.i18n.pt = {
      teams: await readOptionalJson(DATA_BASE+'i18n/pt/teams.json'),
      previews: await readOptionalJson(DATA_BASE+'i18n/pt/previews.json'),
      stories: await readOptionalJson(DATA_BASE+'i18n/pt/stories.json')
    };
    state.i18n.es = {
      teams: await readOptionalJson(DATA_BASE+'i18n/es/teams.json'),
      previews: await readOptionalJson(DATA_BASE+'i18n/es/previews.json'),
      stories: await readOptionalJson(DATA_BASE+'i18n/es/stories.json')
    };
    if(AR_ENABLED){
      state.i18n.ar = {
        teams: await readOptionalJson(DATA_BASE+'i18n/ar/teams.json'),
        previews: await readOptionalJson(DATA_BASE+'i18n/ar/previews.json'),
        stories: await readOptionalJson(DATA_BASE+'i18n/ar/stories.json')
      };
    }
  }

  function installSelector(){
    document.body.classList.add('v10-selector-open');
    const saved = localStorage.getItem('qualifgainde.favoriteTeam');
    const cards = TEAM_ORDER.filter(id => state.teams[id]).map(id => {
      const raw = state.teams[id];
      const t = teamLabel(id);
      const match = state.matches[raw.nextMatchId] || {};
      const opponentId = match.home === id ? match.away : match.home;
      const opp = teamLabel(opponentId);
      return `<a class="v10-team-card" href="?team=${encodeURIComponent(id)}" style="--card-primary:${raw.primary};--card-secondary:${raw.secondary};--card-accent:${raw.accent}" data-team-card="${id}">
        <img src="${safeHtml(raw.bannerImg)}" alt="${safeHtml(t.teamName)}" loading="lazy" decoding="async">
        <div class="v10-team-card-body">
          <div class="v10-team-flag">${raw.flag}</div>
          <div class="v10-team-name">${safeHtml(t.teamName)}</div>
          <div class="v10-team-supporter">${safeHtml(t.supporterName || t.statusLabel || '')}</div>
          <div class="v10-team-line">${safeHtml(t.selectorLine || t.tagline || '')}<br>${uiText('next')} : ${safeHtml(matchLabel(match) || opp.teamName || '')}</div>
          <span class="v10-team-enter">${uiText('enter')}</span>
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
        <p class="v10-selector-lead">${uiText('lead')}</p>
      </div></div>
      <div class="v10-choice-title">${uiText('choose')}</div>
      <div class="v10-team-grid">${cards}</div>
      <div class="v10-selector-actions">
        ${savedTeam ? `<a class="v10-action" href="?team=${encodeURIComponent(saved)}">${uiText('resume')} ${savedTeam.flag} ${safeHtml(savedTeam.teamName)}</a>` : ''}
        <a class="v10-action" href="?mode=global">${uiText('global')}</a>
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
    const lang = state.activeLang || team.defaultLang || 'fr';
    document.title = `${team.teamName} · QualifGaïndé Worldwide`;
    applyLangShell(lang);
    const htitle = $('.htitle');
    if(htitle){
      htitle.innerHTML = `<span>${safeHtml(team.teamName)}</span> — ${headerSuffix(lang)}<span class="v10-active-team-pill">${team.flag} ${safeHtml(team.supporterName || '')}</span>`;
    }
    const kicker = $('.site-kicker'); if(kicker) kicker.textContent = statusDisplayFor(team) || team.tagline || 'QualifGaïndé Worldwide';
    const logo = $('.mascot-logo');
    if(logo){ logo.src = team.mascotImg || team.heroImg || logo.src; logo.alt = team.heroPlayer || team.teamName; }
    const music = $('#btn-music');
    if(music){
      music.textContent = lang === 'ar' ? `أجواء ${team.supporterName || team.teamName}` : lang === 'pt' ? 'Ambiente de estádio' : lang === 'es' ? `Ambiente ${team.supporterName || team.teamName}` : `Ambiance ${team.supporterName || team.teamName}`;
    }
    if(typeof window.setQualifGaindeAmbienceTeam === 'function') window.setQualifGaindeAmbienceTeam(state.activeTeamId);
  }

  function renderHeaderScores(teamId){
    const list = state.results[teamId] || [];
    const wrap = $('#live-center'); if(!wrap || !list.length) return;
    $$('.hscore', wrap).forEach(row => row.remove());
    const anchor = $('#hdr-score', wrap) || wrap.firstChild;
    const visible = list.slice(-4);
    visible.forEach((r, idx) => {
      const row = document.createElement('div');
      row.className = `hscore ${resultClass(r.result)}`;
      const resultLabel = state.activeLang === 'ar' ? `المباراة ${idx+1}` : `Match ${idx+1}`;
      row.innerHTML = `<div class="hs-label">${safeHtml(resultLabel)}</div><div class="hs-score">${safeHtml(r.label)}</div><div class="hs-note">${safeHtml(r.note || '')}</div>`;
      wrap.insertBefore(row, anchor || null);
    });
    wrap.setAttribute('aria-label', `Résultats récents · ${teamLabel(teamId).teamName}`);
  }

  function renderHero(team){
    const img = $('#hero-banner img');
    if(img){ img.src = team.bannerImg || img.src; img.alt = `${team.teamName} · QualifGaïndé Worldwide`; img.loading='eager'; img.decoding='async'; img.fetchPriority='high'; }
    const title = $('#hero-title'); if(title) title.textContent = heroTitleFor(team);
    const sub = $('#hero-subtitle'); if(sub) sub.textContent = team.tournamentStatus === 'eliminated' ? eliminatedHeroSubtitle(team) : (team.heroSubtitle || team.tagline || team.statusLabel || '');
  }

  function renderOpponent(teamId, team){
    const match = state.matches[team.nextMatchId]; if(!match) return;
    if(team.tournamentStatus === 'eliminated'){
      const card = $('#probable-opponent'); if(card) card.title = `Parcours terminé : ${matchLabel(match)}`;
      const label = $('.opp-label'); if(label){
        label.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${safeHtml(statusDisplayFor(team))}`;
      }
      const name = $('#opp-main-name'); if(name) name.textContent = eliminatedScoreLine(team, match);
      const sub = $('#opp-main-sub'); if(sub) sub.textContent = `${matchLabel(match)} · Match terminé · ${match.stadium || ''}`;
      return;
    }
    const oppId = match.home === teamId ? match.away : match.home;
    const opp = teamLabel(oppId);
    const card = $('#probable-opponent'); if(card) card.title = `Prochain match : ${matchLabel(match)}`;
    const label = $('.opp-label'); if(label){
      const txt = state.activeLang === 'ar' ? 'المباراة القادمة R32' : state.activeLang === 'es' ? 'Próximo partido R32' : state.activeLang === 'pt' ? 'Próximo jogo R32' : state.activeLang === 'en' ? 'Next R32 match' : 'Prochain match R32';
      label.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${txt}`;
    }
    const name = $('#opp-main-name'); if(name) name.textContent = `${opp.flag || ''} ${opp.teamName || oppId}`;
    const sub = $('#opp-main-sub'); if(sub) sub.textContent = `${matchLabel(match)} · ${formatDateParis(match.dateParis, state.activeLang)} · ${match.stadium || ''}`;
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
        img.alt = `${profile.heroPlayer || profile.teamName || t.teamName} · ${t.teamName}`; img.loading='lazy'; img.decoding='async';
      } else {
        img.style.display = 'none';
      }
    }

    const title = $('.side-title', side);
    if(title) title.innerHTML = `<span>${t.flag || ''} ${safeHtml(t.teamName)}</span><span>${safeHtml(t.supporterName || profile?.statusLabel || profile?.nickname || '')}</span>`;

    const sub = $('.side-sub', side);
    if(sub){
      const player = profile?.heroPlayer ? ` · ${profile.heroPlayer}` : '';
      const resultCount = (state.results[teamId] || state.opponentResults[teamId] || []).length;
      const recentLabel = resultCount >= 4
        ? (state.activeLang === 'ar' ? 'آخر أربع نتائج' : state.activeLang === 'en' ? 'Last four results' : state.activeLang === 'es' ? 'Últimos cuatro resultados' : state.activeLang === 'pt' ? 'Últimos quatro resultados' : 'Quatre derniers résultats')
        : (state.activeLang === 'ar' ? 'آخر ثلاث نتائج' : state.activeLang === 'en' ? 'Last three results' : state.activeLang === 'es' ? 'Últimos tres resultados' : state.activeLang === 'pt' ? 'Últimos três resultados' : 'Trois derniers résultats');
      sub.textContent = `${isOpponent ? (state.activeLang === 'ar' ? 'خصم تحت المراقبة' : 'Adversaire à surveiller') : recentLabel}${player}`;
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
    if(team.tournamentStatus === 'eliminated'){
      const secBefore = Array.from(document.querySelectorAll('.sec')).find(el => /Prochaine|Próximo|Proximo|Next|Parcours|Journey|Fin/i.test(el.textContent));
      if(secBefore){
        secBefore.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${safeHtml(statusDisplayFor(team))}`;
      }
      const cmatch = $('.countdown-match'); if(cmatch) cmatch.textContent = eliminatedScoreLine(team, match);
      const meta = $('.countdown-meta'); if(meta) meta.textContent = `${matchLabel(match)} · Match terminé · ${match.stadium || ''}`;
      ['cd-days','cd-hours','cd-min','cd-sec'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent='00'; });
      const msg = $('#countdown-end-msg'); if(msg) msg.textContent = eliminatedHeroSubtitle(team);
      renderSide($('.player-side.bel'), match.home);
      renderSide($('.player-side.sen'), match.away);
      updateCountdownScorePanel(team.nextMatchId);
      return;
    }
    const secBefore = Array.from(document.querySelectorAll('.sec')).find(el => /Prochaine|Próximo|Proximo|Next/i.test(el.textContent));
    if(secBefore){
      const sectionText = state.activeLang === 'ar' ? `المباراة القادمة لـ ${safeHtml(team.teamName)}` : state.activeLang === 'pt' ? `Próximo jogo do ${safeHtml(team.teamName)}` : state.activeLang === 'es' ? `Próximo partido de ${safeHtml(team.teamName)}` : state.activeLang === 'en' ? `Next match for ${safeHtml(team.teamName)}` : `Prochaine rencontre de ${safeHtml(team.teamName)}`;
      secBefore.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${sectionText}`;
    }
    const home = teamLabel(match.home), away = teamLabel(match.away);
    const cmatch = $('.countdown-match'); if(cmatch) cmatch.textContent = state.activeLang === 'ar' ? `${home.flag || ''} ${home.teamName} ضد ${away.teamName} ${away.flag || ''}` : `${home.flag || ''} ${home.teamName} vs ${away.teamName} ${away.flag || ''}`;
    const meta = $('.countdown-meta'); if(meta) meta.textContent = `${formatDateParis(match.dateParis, state.activeLang)} · ${match.stadium || ''}${match.channel_fr ? ' · ' + match.channel_fr : ''}`;
    renderSide($('.player-side.bel'), match.home);
    renderSide($('.player-side.sen'), match.away);
    startV10Countdown(match.dateParis, team);
    updateCountdownScorePanel(team.nextMatchId);
    ensureCountdownScorePolling();
  }

  function countdownFixedMessage(team, isMatchDay){
    const lang = state.activeLang || team.defaultLang || 'fr';
    if(isMatchDay){
      if(lang === 'ar') return `يوم المباراة: ${team.teamName} يدخل المشهد.`;
      if(lang === 'pt') return `Dia de jogo: ${team.teamName} entra em campo.`;
      if(lang === 'es') return `Día de partido: ${team.teamName} entra en escena.`;
      if(lang === 'en') return `Match day: ${team.teamName} steps onto the stage.`;
      return `Jour de match : ${team.teamName} entre dans l’arène.`;
    }
    if(lang === 'ar') return 'الموعد العالمي القادم.';
    if(lang === 'pt') return 'Próximo compromisso mundial.';
    if(lang === 'es') return 'Próxima cita mundial.';
    if(lang === 'en') return 'Next World Cup appointment.';
    return 'Prochain rendez-vous mondial.';
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
    const farewell = team.tournamentStatus === 'eliminated' ? (state.farewells[state.activeTeamId] || state.farewells.generic_africa || state.farewells.generic_world) : null;
    const matchId = team.nextMatchId;
    const preview = farewell || getPreview(matchId, state.activeLang || team.defaultLang);
    const card = $('#belgique-senegal');
    if(card){
      card.classList.toggle('v11-farewell-card', !!farewell);
      card.classList.toggle('v11-preview-card', !farewell);
    }
    if(!preview) return;
    const title = $('#belgique-senegal .teaser-title');
    if(title){
      const displayTitle = farewell ? (team.farewellHeadline || preview.title || 'AU REVOIR') : preview.title;
      title.innerHTML = `<img class="section-mascot" src="assets/lion-mascotte.png" alt="Mascotte">${safeHtml(displayTitle)}`;
    }
    const body = $('#belgique-senegal .teaser-body');
    if(body){
      const paragraphs = Array.isArray(preview.body) ? preview.body : [preview.body || ''];
      const angle = (preview.angle || preview.kicker) ? `<strong>${safeHtml(preview.angle || preview.kicker)}</strong><br><br>` : '';
      body.innerHTML = angle + paragraphs.map(p => safeHtml(p)).join('<br><br>');
    }
  }

  function renderStory(teamId, team){
    const story = getStory(teamId, state.activeLang || team.defaultLang); if(!story) return;
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
    a.textContent = state.activeLang === 'ar' ? `تغيير المنتخب · ${team.flag} ${team.teamName}` : `Changer d’équipe · ${team.flag} ${team.teamName}`;
    document.body.appendChild(a);
  }

  function releaseV10Boot(){
    document.documentElement.classList.remove('v10-booting');
    document.body.classList.add('v10-ready');
  }

  function lockLegacyCountdown(){
    window.QUALIFGAINDE_V10_COUNTDOWN_LOCKED = true;
  }

  function applyTeam(teamId){
    const team = getActiveTeam(); if(!team) return;
    localStorage.setItem('qualifgainde.favoriteTeam', teamId);
    lockLegacyCountdown();
    setCssVars(team); renderHeader(team); renderHeaderScores(teamId); renderHero(team); renderOpponent(teamId, team); renderCountdown(teamId, team); renderPreview(team); renderStory(teamId, team); addChangeTeamLink(team);
    releaseV10Boot();
  }

  function patchLanguageSwitcher(){
    const originalSet = window.setLanguage;
    if(typeof originalSet === 'function' && !originalSet.__v10Patched){
      window.setLanguage = function(lang){
        state.activeLang = supportedLangs().includes(lang) ? lang : (state.activeLang || 'fr');
        try { localStorage.setItem('siteLang', state.activeLang); localStorage.setItem('siteLangSource','manual'); } catch(e) {}
        let res;
        if(state.activeLang === 'ar'){
          // Le legacy I18N ne connaît pas encore AR : on évite son fallback FR et on garde l'arabe isolé en V10.
          applyLangShell('ar');
        } else {
          res = originalSet.apply(this, [state.activeLang]);
        }
        setTimeout(() => { if(state.activeTeamId) applyTeam(state.activeTeamId); else syncLangButtons(state.activeLang); }, 20);
        setTimeout(() => { if(state.activeTeamId) applyTeam(state.activeTeamId); else syncLangButtons(state.activeLang); }, 180);
        return res;
      };
      window.setLanguage.__v10Patched = true;
    }
    const originalApply = window.applyLanguage;
    if(typeof originalApply === 'function' && !originalApply.__v10Patched){
      window.applyLanguage = function(){
        const res = originalApply.apply(this, arguments);
        setTimeout(() => { if(state.activeTeamId) applyTeam(state.activeTeamId); }, 30);
        return res;
      };
      window.applyLanguage.__v10Patched = true;
    }
  }

  async function init(){
    try { await loadData(); } catch(err) { console.error('[V10] Chargement data impossible', err); return; }
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('team');
    if(!teamId && params.get('mode') !== 'global') { state.activeLang = chooseSelectorLang(params); applyLangShell(state.activeLang); installSelector(); releaseV10Boot(); return; }
    if(!teamId && params.get('mode') === 'global') { state.activeLang = chooseSelectorLang(params); applyLangShell(state.activeLang); releaseV10Boot(); return; }
    if(teamId && state.teams[teamId]){
      state.activeTeamId = teamId;
      const baseTeam = state.teams[teamId];
      const urlLang = params.get('lang');
      state.activeLang = supportedLangs().includes(urlLang) ? urlLang : (baseTeam.defaultLang || 'fr');
      try { localStorage.setItem('siteLang', state.activeLang); localStorage.setItem('siteLangSource', supportedLangs().includes(urlLang) ? 'url' : 'team-default'); } catch(e) {}
      patchLanguageSwitcher();
      if(state.activeLang && typeof window.setLanguage === 'function'){
        try { window.setLanguage(state.activeLang); } catch(e) { console.warn('[V10] setLanguage ignoré', e); }
      }
      applyTeam(teamId);
      setTimeout(() => applyTeam(teamId), 120);
      setTimeout(() => applyTeam(teamId), 520);
      setTimeout(() => applyTeam(teamId), 980);
      setTimeout(() => applyTeam(teamId), 1400);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();