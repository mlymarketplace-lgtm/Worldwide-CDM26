
(function(){
  'use strict';

  const VERSION = (window.BUILD_VERSION || '15.4.2');
  const VERSION_TOKEN = (window.BUILD_VERSION_TOKEN || String(VERSION).replace(/\D/g,'') || '1542');
  const SEMIFINALISTS = new Set(['france','spain','england','argentina']);
  const FEATURED_ORDER = [
    'morocco','france','spain','belgium','norway','england','argentina','switzerland',
    'egypt',
    'brazil','senegal','algeria','ivory_coast','dr_congo','cape_verde','ghana'
  ];

  const CODE_TO_TEAM = {
    RSA:'south_africa', CAN:'canada', BRA:'brazil', JPN:'japan', GER:'germany', PAR:'paraguay',
    NED:'netherlands', MAR:'morocco', CIV:'ivory_coast', NOR:'norway', FRA:'france', SWE:'sweden',
    MEX:'mexico', ECU:'ecuador', ENG:'england', COD:'dr_congo', BEL:'belgium', SEN:'senegal',
    USA:'united_states', BIH:'bosnia', ESP:'spain', AUT:'austria', POR:'portugal', CRO:'croatia',
    SUI:'switzerland', ALG:'algeria', DZA:'algeria', AUS:'australia', EGY:'egypt', ARG:'argentina',
    CPV:'cape_verde', COL:'colombia', GHA:'ghana'
  };

  const TEAM_FALLBACKS = {
    south_africa:{teamName:'Afrique du Sud',flag:'🇿🇦'}, canada:{teamName:'Canada',flag:'🇨🇦'},
    japan:{teamName:'Japon',flag:'🇯🇵'}, germany:{teamName:'Allemagne',flag:'🇩🇪'}, paraguay:{teamName:'Paraguay',flag:'🇵🇾'},
    netherlands:{teamName:'Pays-Bas',flag:'🇳🇱'}, sweden:{teamName:'Suède',flag:'🇸🇪'}, mexico:{teamName:'Mexique',flag:'🇲🇽'},
    ecuador:{teamName:'Équateur',flag:'🇪🇨'}, united_states:{teamName:'États-Unis',flag:'🇺🇸'}, bosnia:{teamName:'Bosnie-Herzégovine',flag:'🇧🇦'},
    austria:{teamName:'Autriche',flag:'🇦🇹'}, portugal:{teamName:'Portugal',flag:'🇵🇹'}, croatia:{teamName:'Croatie',flag:'🇭🇷'},
    switzerland:{teamName:'Suisse',flag:'🇨🇭',supporterName:'Nati',heroImg:'assets/opponents/switzerland/player.webp',playerImg:'assets/opponents/switzerland/player.webp',heroPlayer:'Granit Xhaka'}, australia:{teamName:'Australie',flag:'🇦🇺'}, argentina:{teamName:'Argentine',flag:'🇦🇷',supporterName:'Albiceleste',heroImg:'assets/final/lionel-messi-final.jpg',playerImg:'assets/final/lionel-messi-final.jpg',heroPlayer:'Lionel Messi'},
    colombia:{teamName:'Colombie',flag:'🇨🇴'}, morocco:{teamName:'Maroc',flag:'🇲🇦'}, france:{teamName:'France',flag:'🇫🇷'},
    spain:{teamName:'Espagne',flag:'🇪🇸'}, norway:{teamName:'Norvège',flag:'🇳🇴'}, england:{teamName:'Angleterre',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',supporterName:'Three Lions',heroImg:'assets/teams/england/player.webp'},
    belgium:{teamName:'Belgique',flag:'🇧🇪'}, egypt:{teamName:'Égypte',flag:'🇪🇬'}, brazil:{teamName:'Brésil',flag:'🇧🇷'},
    senegal:{teamName:'Sénégal',flag:'🇸🇳'}, algeria:{teamName:'Algérie',flag:'🇩🇿'}, ivory_coast:{teamName:'Côte d’Ivoire',flag:'🇨🇮'},
    dr_congo:{teamName:'RD Congo',flag:'🇨🇩'}, cape_verde:{teamName:'Cap-Vert',flag:'🇨🇻'}, ghana:{teamName:'Ghana',flag:'🇬🇭'}
  };

  const MATCH_KEY_BY_ID = {
    N73:'rsa-can', N74:'ger-par', N75:'ned-mar', N76:'civ-nor', N77:'fra-swe', N78:'bra-jpn', N79:'mex-ecu', N80:'eng-cod',
    N81:'usa-bih', N82:'bel-sen', N83:'por-cro', N84:'esp-aut', N85:'sui-alg', N86:'aus-egy', N87:'arg-cpv', N88:'col-gha',
    N89:'par-fra', N90:'can-mar', N91:'bra-nor', N92:'mex-eng', N93:'por-spain', N94:'usa-bel', N95:'arg-egy', N96:'sui-col',
    N97:'qf-97', N98:'qf-98', N99:'qf-99', N100:'qf-100', N101:'sf-101', N102:'sf-102', N103:'third-103', N104:'final-104'
  };

  // V15.4.2 — aliases de clés live/API vers l'identifiant KO canonique.
  // Objectif : la home doit réagir même si la simulation reçoit `por-esp`, `por-spain`,
  // `usa-bel`, `bel-usa`, `usa-belgium`, etc.
  const KO_ID_BY_KEY = Object.assign(
    {},
    Object.fromEntries(Object.entries(MATCH_KEY_BY_ID).map(([id, key]) => [key, id])),
    {
      'por-esp':'N93', 'por-spain':'N93', 'portugal-spain':'N93', 'portugal-espagne':'N93',
      'usa-bel':'N94', 'bel-usa':'N94', 'usa-belgium':'N94', 'belgium-usa':'N94', 'united-states-belgium':'N94', 'us-belgium':'N94',
      'arg-egy':'N95', 'argentina-egypt':'N95', 'arg-egypt':'N95',
      'sui-col':'N96', 'switzerland-colombia':'N96',
      'qf98':'N98', 'qf-98':'N98', 'qf99':'N99', 'qf-99':'N99', 'nor-eng':'N99', 'norway-england':'N99', 'qf100':'N100', 'qf-100':'N100', 'arg-sui':'N100', 'argentina-switzerland':'N100',
      'eng-arg':'N102', 'england-argentina':'N102', 'argentina-england':'N102', 'sf102':'N102', 'sf-102':'N102'
    }
  );

  const KO_CODES_BY_ID = {
    N89:{h:'PAR',a:'FRA'}, N90:{h:'CAN',a:'MAR'}, N91:{h:'NOR',a:'BRA'}, N92:{h:'MEX',a:'ENG'},
    N93:{h:'POR',a:'ESP'}, N94:{h:'USA',a:'BEL'}, N95:{h:'ARG',a:'EGY'}, N96:{h:'SUI',a:'COL'},
    N97:{}, N98:{}, N99:{}, N100:{}, N101:{}, N102:{}, N103:{}, N104:{}
  };

  const MATCH_DEFS = {
    N73:{id:'N73',round:'r32',home:'south_africa',away:'canada',next:'N90',slot:'home'},
    N74:{id:'N74',round:'r32',home:'germany',away:'paraguay',next:'N89',slot:'home'},
    N75:{id:'N75',round:'r32',home:'netherlands',away:'morocco',next:'N90',slot:'away'},
    N76:{id:'N76',round:'r32',home:'ivory_coast',away:'norway',next:'N91',slot:'home'},
    N77:{id:'N77',round:'r32',home:'france',away:'sweden',next:'N89',slot:'away'},
    N78:{id:'N78',round:'r32',home:'brazil',away:'japan',next:'N91',slot:'away'},
    N79:{id:'N79',round:'r32',home:'mexico',away:'ecuador',next:'N92',slot:'home'},
    N80:{id:'N80',round:'r32',home:'england',away:'dr_congo',next:'N92',slot:'away'},
    N81:{id:'N81',round:'r32',home:'united_states',away:'bosnia',next:'N94',slot:'home'},
    N82:{id:'N82',round:'r32',home:'belgium',away:'senegal',next:'N94',slot:'away'},
    N83:{id:'N83',round:'r32',home:'portugal',away:'croatia',next:'N93',slot:'home'},
    N84:{id:'N84',round:'r32',home:'spain',away:'austria',next:'N93',slot:'away'},
    N85:{id:'N85',round:'r32',home:'switzerland',away:'algeria',next:'N96',slot:'home'},
    N86:{id:'N86',round:'r32',home:'australia',away:'egypt',next:'N95',slot:'away'},
    N87:{id:'N87',round:'r32',home:'argentina',away:'cape_verde',next:'N95',slot:'home'},
    N88:{id:'N88',round:'r32',home:'colombia',away:'ghana',next:'N96',slot:'away'},
    N89:{id:'N89',round:'r16',homeSource:'N74',awaySource:'N77',next:'N97',slot:'home'},
    N90:{id:'N90',round:'r16',homeSource:'N73',awaySource:'N75',next:'N97',slot:'away'},
    N91:{id:'N91',round:'r16',homeSource:'N76',awaySource:'N78',next:'N99',slot:'home'},
    N92:{id:'N92',round:'r16',homeSource:'N79',awaySource:'N80',next:'N99',slot:'away'},
    N93:{id:'N93',round:'r16',homeSource:'N83',awaySource:'N84',next:'N98',slot:'home'},
    N94:{id:'N94',round:'r16',homeSource:'N81',awaySource:'N82',next:'N98',slot:'away'},
    N95:{id:'N95',round:'r16',homeSource:'N87',awaySource:'N86',next:'N100',slot:'home'},
    N96:{id:'N96',round:'r16',homeSource:'N85',awaySource:'N88',next:'N100',slot:'away'},
    N97:{id:'N97',round:'qf',homeSource:'N89',awaySource:'N90',next:'N101',slot:'home'},
    N98:{id:'N98',round:'qf',homeSource:'N93',awaySource:'N94',next:'N101',slot:'away'},
    N99:{id:'N99',round:'qf',homeSource:'N91',awaySource:'N92',next:'N102',slot:'home'},
    N100:{id:'N100',round:'qf',homeSource:'N95',awaySource:'N96',next:'N102',slot:'away'},
    N101:{id:'N101',round:'sf',homeSource:'N97',awaySource:'N98',next:'N104',slot:'home',third:'N103',thirdSlot:'home'},
    N102:{id:'N102',round:'sf',homeSource:'N99',awaySource:'N100',next:'N104',slot:'away',third:'N103',thirdSlot:'away'},
    N103:{id:'N103',round:'third',homeLoserSource:'N101',awayLoserSource:'N102'},
    N104:{id:'N104',round:'final',homeSource:'N101',awaySource:'N102'}
  };
  const ORDER = ['N73','N74','N75','N76','N77','N78','N79','N80','N81','N82','N83','N84','N85','N86','N87','N88','N89','N90','N91','N92','N93','N94','N95','N96','N97','N98','N99','N100','N101','N102','N103','N104'];

  const UI = {
    fr:{qf:'La Finale', live:'Encore en course', out:'Les équipes qui nous ont fait vibrer', global:'Voir la page globale', quick:'', qualified:'Qualifiée', qualifiedM:'Qualifié', eliminated:'Éliminée', eliminatedM:'Éliminé', inRound:'en', next:'prochain défi', wait:'attend', vs:'ou', champion:'Champion simulé', nextMatch:'Prochain match', end:'Fin de parcours', last:'Derniers résultats', nextMatchConfirmed:'Prochain match confirmé', newsTitle:'Les Brèves du Mondial', newsLead:'Analyse, histoires fortes et signaux faibles de la phase finale.', homePill:'Phase finale · choisis ton équipe et suis son chemin jusqu’à la finale', homeKicker:'Bienvenue dans l’app mondiale', homeTitle:'Je suis supporter <span>de...</span>', homeLead:'Choisis ton équipe, suis ses résultats, son prochain adversaire, le tableau final et sa route jusqu’à la finale.', readAllNews:'Lire toutes les brèves'},
    en:{qf:'The Final', live:'Still alive', out:'Teams that made us dream', global:'Open global page', quick:'', qualified:'Qualified', qualifiedM:'Qualified', eliminated:'Eliminated', eliminatedM:'Eliminated', inRound:'for', next:'next challenge', wait:'waiting for', vs:'or', champion:'Champion', nextMatch:'Next match', end:'End of the road', last:'Last results', nextMatchConfirmed:'Next match confirmed', newsTitle:'Les Brèves du Mondial', newsLead:'Récits, analyses et tournants de la phase finale.', homePill:'Knockout stage · choose your team and follow its road to the final', homeKicker:'Welcome to the worldwide app', homeTitle:'I support <span>...</span>', homeLead:'Open your team page, results, next opponent, interactive bracket and full road to the final.', readAllNews:'Lire toutes les brèves'},
    pt:{qf:'A Final', live:'Ainda em prova', out:'As equipes que nos fizeram vibrar', global:'Ver página global', quick:'Acesso rápido França–Marrocos', qualified:'Qualificada', qualifiedM:'Qualificado', eliminated:'Eliminada', eliminatedM:'Eliminado', inRound:'nos', next:'próximo desafio', wait:'aguarda', vs:'ou', champion:'Campeão', nextMatch:'Próximo jogo', end:'Fim do percurso', last:'Últimos resultados', nextMatchConfirmed:'Próximo jogo confirmado', newsTitle:'Notas do Mundial', newsLead:'Análises, histórias fortes e momentos-chave da fase final.', homePill:'Mata-mata · estado das equipes calculado automaticamente', homeKicker:'Bem-vindo ao app mundial', homeTitle:'Eu torço <span>por...</span>', homeLead:'Veja a página da sua equipe, resultados, próximo adversário, chave interativa e caminho até à final.', readAllNews:'Ler todas as notas'},
    es:{qf:'La Final', live:'Siguen en carrera', out:'Los equipos que nos hicieron vibrar', global:'Ver página global', quick:'Acceso rápido Francia–Marruecos', qualified:'Clasificada', qualifiedM:'Clasificado', eliminated:'Eliminada', eliminatedM:'Eliminado', inRound:'en', next:'próximo reto', wait:'espera a', vs:'o', champion:'Campeón', nextMatch:'Próximo partido', end:'Fin del recorrido', last:'Últimos resultados', nextMatchConfirmed:'Próximo partido confirmado', newsTitle:'Breves del Mundial', newsLead:'Historias, análisis y puntos de inflexión de la fase final.', homePill:'Eliminatorias · estado calculado automáticamente', homeKicker:'Bienvenido a la app mundial', homeTitle:'Soy hincha <span>de...</span>', homeLead:'Consulta la página de tu equipo, resultados, próximo rival, cuadro interactivo y camino a la final.', readAllNews:'Leer todas las breves'},
    ar:{qf:'المتأهل للنهائي ونصف النهائي', live:'ما زالوا في المنافسة', out:'المنتخبات التي منحتنا الإثارة', global:'عرض الصفحة العامة', quick:'دخول سريع فرنسا–المغرب', qualified:'تأهلت', qualifiedM:'تأهل', eliminated:'أُقصيت', eliminatedM:'أُقصي', inRound:'إلى', next:'التحدي القادم', wait:'ينتظر', vs:'أو', champion:'البطل', nextMatch:'المباراة القادمة', end:'نهاية المشوار', last:'آخر النتائج', nextMatchConfirmed:'تم تأكيد المباراة القادمة', newsTitle:'موجز أخبار المونديال', newsLead:'تحليلات وقصص ولحظات حاسمة من الأدوار الإقصائية.', homePill:'الأدوار الإقصائية · حالة المنتخبات تُحسب تلقائياً', homeKicker:'مرحباً بك في التطبيق العالمي', homeTitle:'أنا أشجع <span>...</span>', homeLead:'تابع صفحة منتخبك ونتائجه وخصمه القادم والطريق الكامل نحو النهائي.', readAllNews:'قراءة كل الأخبار'}
  };

  function t(key, vars){
    const lang = activeLang();
    const c = UI[lang] || UI.fr;
    let value = c[key] || UI.fr[key] || key;
    if(vars) Object.keys(vars).forEach(k => { value = String(value).replace(new RegExp('\{'+k+'\}','g'), vars[k]); });
    return value;
  }

  function normalizeLang(v){
    const s = String(v || '').toLowerCase();
    if(s.startsWith('ar')) return 'ar';
    if(s.startsWith('pt')) return 'pt';
    if(s.startsWith('es')) return 'es';
    if(s.startsWith('en')) return 'en';
    return 'fr';
  }
  function activeLang(){
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('lang');
      const isHome = !params.has('team') && params.get('mode') !== 'global' && params.get('mode') !== 'news';
      if(isHome && !q) return 'fr';
      return normalizeLang(q || localStorage.getItem('siteLang') || (navigator.languages && navigator.languages[0]) || navigator.language || 'fr');
    } catch(e) { return 'fr'; }
  }
  function copy(){ return UI[activeLang()] || UI.fr; }
  function applyDocumentLocale(){
    const lang = activeLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('qg-rtl', lang === 'ar');
  }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  async function getJSON(path){
    try {
      const r = await fetch(path + (path.includes('?') ? '&' : '?') + 'v=' + VERSION, {cache:'no-store'});
      if(r.ok) return await r.json();
    } catch(e) {}
    return null;
  }
  function teamMeta(key, teams){
    return Object.assign({}, TEAM_FALLBACKS[key] || {teamName:key, flag:'🏳️'}, (teams && teams[key]) || {});
  }
  function teamName(key, teams){ return teamMeta(key, teams).teamName || key; }
  function teamFlag(key, teams){ return teamMeta(key, teams).flag || '🏳️'; }
  function feminine(key){
    return ['france','spain','belgium','norway','england','egypt','algeria','ivory_coast','dr_congo','argentina','switzerland','colombia','australia'].includes(key);
  }
  function roundLabel(round, lang){
    const labels = {
      fr:{r32:'16e',r16:'huitième',qf:'quart',sf:'demi-finale',finale:'finale',final:'finale',third:'match pour la 3e place'},
      en:{r32:'Round of 32',r16:'Round of 16',qf:'quarter-final',sf:'semi-final',finale:'final',final:'final',third:'third-place match'},
      pt:{r32:'16 avos',r16:'oitavos',qf:'quartos',sf:'meia-final',finale:'final',final:'final',third:'jogo do 3.º lugar'},
      es:{r32:'dieciseisavos',r16:'octavos',qf:'cuartos',sf:'semifinal',finale:'final',final:'final',third:'tercer puesto'},
      ar:{r32:'دور الـ32',r16:'ثمن النهائي',qf:'ربع النهائي',sf:'نصف النهائي',finale:'النهائي',final:'النهائي',third:'مباراة المركز الثالث'}
    };
    return (labels[lang] || labels.fr)[round] || round;
  }
  function scoreFrom(lock){
    if(lock && (lock.displayScore || lock.score)) return String(lock.displayScore || lock.score);
    const h = lock.home ?? lock.hg ?? 0, a = lock.away ?? lock.ag ?? 0;
    let s = h + '–' + a;
    const ph = lock.penaltyHome ?? (lock.penalty && lock.penalty.home);
    const pa = lock.penaltyAway ?? (lock.penalty && lock.penalty.away);
    if(ph != null && pa != null) s += ' · TAB ' + ph + '–' + pa;
    return s;
  }
  function mergeTeams(base, localized){
    const out = Object.assign({}, base || {});
    Object.keys(localized || {}).forEach(k => { out[k] = Object.assign({}, out[k] || {}, localized[k] || {}); });
    return out;
  }
  function lockMap(rawLocks, live){
    const map = {};

    function keyToId(key, v){
      const rawId = v && (v.koId || v.id || v.matchId);
      if(rawId && /^N\d+$/i.test(String(rawId))) return String(rawId).toUpperCase();
      const normalized = String(key || '').toLowerCase().trim().replace(/_/g,'-');
      return KO_ID_BY_KEY[normalized] || null;
    }
    function readScore(v, side){
      if(!v) return null;
      const direct = side === 'home'
        ? (v.home ?? v.hg ?? v.homeScore ?? v.goalsHome ?? (v.goals && v.goals.home))
        : (v.away ?? v.ag ?? v.awayScore ?? v.goalsAway ?? (v.goals && v.goals.away));
      return direct === undefined || direct === null || direct === '' ? null : Number(direct);
    }
    function readPenalty(v, side){
      if(!v) return null;
      const direct = side === 'home'
        ? (v.penaltyHome ?? (v.penalty && v.penalty.home) ?? (v.penalties && v.penalties.home))
        : (v.penaltyAway ?? (v.penalty && v.penalty.away) ?? (v.penalties && v.penalties.away));
      return direct === undefined || direct === null || direct === '' ? null : Number(direct);
    }
    function inferWinnerSide(v, home, away, penHome, penAway){
      if(v && (v.winnerSide === 0 || v.winnerSide === 1)) return Number(v.winnerSide);
      const w = String((v && v.winner) || '').toLowerCase();
      if(w === 'home' || w === 'h') return 0;
      if(w === 'away' || w === 'a') return 1;
      if(w && (w === String(v && (v.h || v.homeCode || '')).toLowerCase() || CODE_TO_TEAM[w.toUpperCase()] === CODE_TO_TEAM[String(v && (v.h || v.homeCode || '')).toUpperCase()])) return 0;
      if(w && (w === String(v && (v.a || v.awayCode || '')).toLowerCase() || CODE_TO_TEAM[w.toUpperCase()] === CODE_TO_TEAM[String(v && (v.a || v.awayCode || '')).toUpperCase()])) return 1;
      if(penHome !== null && penAway !== null && penHome !== penAway) return penHome > penAway ? 0 : 1;
      if(home !== null && away !== null && home !== away) return home > away ? 0 : 1;
      return null;
    }
    function addEntry(key, v, source){
      if(!v) return;
      const status = String(v.status || v.apiStatus || '').toLowerCase();
      const isFinal = status === 'final' || status === 'ft' || status === 'aet' || status === 'pen' || status.includes('match finished') || v.locked === true;
      if(!isFinal) return;
      const id = keyToId(key, v);
      if(!id || !MATCH_DEFS[id]) return;
      const def = MATCH_DEFS[id];
      const codes = KO_CODES_BY_ID[id] || {};
      const rawHome = readScore(v, 'home');
      const rawAway = readScore(v, 'away');
      const penaltyHome = readPenalty(v, 'home');
      const penaltyAway = readPenalty(v, 'away');
      const hasDisplay = !!(v.displayScore || v.scoreLine || v.score);
      if((rawHome === null || rawAway === null) && !hasDisplay && (penaltyHome === null || penaltyAway === null)) return;
      const home = rawHome === null ? 0 : rawHome;
      const away = rawAway === null ? 0 : rawAway;
      const h = v.h || v.homeCode || codes.h || (def.home ? teamCode(def.home) : undefined);
      const a = v.a || v.awayCode || codes.a || (def.away ? teamCode(def.away) : undefined);
      const winnerSide = inferWinnerSide(v, home, away, penaltyHome, penaltyAway);
      if(winnerSide !== 0 && winnerSide !== 1) return;
      map[id] = Object.assign({}, map[id] || {}, {
        koId:id,
        h, a,
        home, away,
        hg:home, ag:away,
        status:'final',
        apiStatus:v.apiStatus || 'FT',
        apiStatusLong:v.apiStatusLong || 'Match Finished',
        penaltyHome, penaltyAway,
        penalty: {home: penaltyHome, away: penaltyAway},
        displayScore: v.displayScore || v.score || null,
        scoreLine: v.scoreLine || null,
        winner: winnerSide === 1 ? 'away' : 'home',
        winnerSide,
        locked:true,
        source
      });
    }

    Object.entries(rawLocks || {}).forEach(([key, v]) => {
      if(v && v.koId && String(v.status || '').toLowerCase() === 'final') addEntry(key, v, 'knockout-locks');
    });

    Object.entries((live && live.matches) || {}).forEach(([key, v]) => addEntry(key, v, 'live-json'));

    // V15.4.2 — état réel du moteur KO en mémoire. C'est ce que la simulation utilise.
    // La home doit lire cette source prioritaire pour ne plus attendre un nouveau déploiement.
    try {
      if (typeof KNOCKOUT_LIVE_RESULTS !== 'undefined' && KNOCKOUT_LIVE_RESULTS) {
        Object.entries(KNOCKOUT_LIVE_RESULTS).forEach(([key, v]) => addEntry(key, v, 'runtime-ko'));
      }
    } catch(e) {}

    try {
      const last = window.QUALIFGAINDE_LAST_SCORES;
      if(last && last.matches) Object.entries(last.matches).forEach(([key, v]) => addEntry(key, v, 'last-scores'));
    } catch(e) {}

    if(window.__QG_MANUAL_KO_LOCKS) Object.entries(window.__QG_MANUAL_KO_LOCKS).forEach(([key, v]) => addEntry(key, v, 'manual'));
    return map;
  }
  function teamCode(team){
    return Object.keys(CODE_TO_TEAM).find(c => CODE_TO_TEAM[c] === team) || String(team || '').toUpperCase();
  }

  function buildState(teams, locks){
    const resolved = {};
    const lang = activeLang();

    function participantFromSource(sourceId, loser){
      const r = resolve(sourceId);
      if(!r || !r.final) return {team:null, label:placeholderFor(sourceId, teams, loser)};
      return {team: loser ? r.loser : r.winner, label:teamName(loser ? r.loser : r.winner, teams)};
    }
    function placeholderFor(id, teams){
      const d = MATCH_DEFS[id];
      if(!d) return 'TBD';
      const h = d.home ? teamName(d.home, teams) : (d.homeSource ? participantFromSource(d.homeSource).label : 'TBD');
      const a = d.away ? teamName(d.away, teams) : (d.awaySource ? participantFromSource(d.awaySource).label : 'TBD');
      if(lang === 'en') return 'Winner of ' + h + '–' + a;
      if(lang === 'pt') return 'Vencedor ' + h + '–' + a;
      if(lang === 'es') return 'Ganador ' + h + '–' + a;
      if(lang === 'ar') return 'الفائز من ' + h + '–' + a;
      return 'Vainqueur ' + h + '–' + a;
    }
    function resolve(id){
      if(resolved[id]) return resolved[id];
      const d = MATCH_DEFS[id];
      if(!d) return null;
      let home = d.home || null, away = d.away || null;
      let homeLabel = home ? teamName(home, teams) : '';
      let awayLabel = away ? teamName(away, teams) : '';
      if(d.homeSource){
        const p = participantFromSource(d.homeSource);
        home = p.team; homeLabel = p.label;
      }
      if(d.awaySource){
        const p = participantFromSource(d.awaySource);
        away = p.team; awayLabel = p.label;
      }
      if(d.homeLoserSource){
        const p = participantFromSource(d.homeLoserSource, true);
        home = p.team; homeLabel = p.label;
      }
      if(d.awayLoserSource){
        const p = participantFromSource(d.awayLoserSource, true);
        away = p.team; awayLabel = p.label;
      }
      const lock = locks[id];
      let final = !!lock;
      let winner = null, loser = null, winnerSide = null, score = '', scoreLine = '';
      if(lock){
        const lockHomeTeam = CODE_TO_TEAM[String(lock.h || '').toUpperCase()] || home;
        const lockAwayTeam = CODE_TO_TEAM[String(lock.a || '').toUpperCase()] || away;
        winnerSide = lock.winnerSide != null ? Number(lock.winnerSide) : (lock.winner === 'away' ? 1 : 0);
        winner = winnerSide === 1 ? lockAwayTeam : lockHomeTeam;
        loser = winnerSide === 1 ? lockHomeTeam : lockAwayTeam;
        home = lockHomeTeam || home; away = lockAwayTeam || away;
        homeLabel = teamName(home, teams); awayLabel = teamName(away, teams);
        score = scoreFrom(lock);
        scoreLine = lock.scoreLine || (homeLabel + ' ' + score + ' ' + awayLabel);
      }
      const out = {id, def:d, home, away, homeLabel, awayLabel, final, winner, loser, winnerSide, score, scoreLine, matchKey:MATCH_KEY_BY_ID[id]};
      resolved[id] = out;
      return out;
    }

    ORDER.forEach(id => resolve(id));

    const state = {};
    function initTeam(k){
      if(!k) return null;
      if(!state[k]) {
        const meta = teamMeta(k, teams);
        state[k] = {
          key:k, teamName:meta.teamName || teamName(k, teams), flag:meta.flag || teamFlag(k, teams),
          status:'alive', stageGroup:'still_alive', currentRound:'r32',
          statusLabel: meta.statusLabel || '', selectorLine: meta.selectorLine || '', nextMatchId: meta.nextMatchId || '',
          source:'computed'
        };
      }
      return state[k];
    }
    Object.keys(teams || {}).concat(FEATURED_ORDER).forEach(initTeam);

    ORDER.forEach(id => {
      const r = resolved[id], d = MATCH_DEFS[id];
      if(!r || !r.home || !r.away) return;
      if(r.final){
        if(r.winner){
          const ws = initTeam(r.winner);
          if(d.round === 'final'){
            Object.assign(ws, {status:'champion', stageGroup:'qualified_qf', currentRound:'champion', statusLabel:championLine(r.winner), selectorLine:championLine(r.winner), lastMatchId:id, lastMatchLabel:r.scoreLine, nextMatchId:null});
          } else if(d.round === 'third') {
            Object.assign(ws, {bronze:true, bronzeMatchId:id, bronzeScore:r.scoreLine});
          } else {
            const nextDef = d.next ? MATCH_DEFS[d.next] : null;
            const nextRound = nextDef ? nextDef.round : d.round;
            Object.assign(ws, {status:'qualified', stageGroup: stageFor(nextRound), currentRound:nextRound, qualifiedRound:nextRound, lastMatchId:id, lastMatchLabel:r.scoreLine, nextMatchId:d.next || null, nextSlot:d.slot || null});
          }
        }
        if(r.loser){
          const ls = initTeam(r.loser);
          Object.assign(ls, {status:'eliminated', stageGroup:'eliminated', eliminatedRound:d.round, currentRound:d.round, lastMatchId:id, lastMatchLabel:r.scoreLine, nextMatchId:null});
        }
      } else {
        [r.home, r.away].forEach(t => {
          if(!t) return;
          const s = initTeam(t);
          if(s.status !== 'eliminated' && s.status !== 'champion' && !(s.status === 'qualified' && rankRound(s.currentRound) >= rankRound(d.round))) {
            Object.assign(s, {status:'alive', stageGroup:'still_alive', currentRound:d.round, nextMatchId:id});
          }
        });
      }
    });

    Object.values(state).forEach(s => finalizeState(s, resolved, teams));
    return {state, resolved, locks};
  }

  function stageFor(round){
    return ['qf','sf','final','champion'].includes(round) ? 'qualified_qf' : 'still_alive';
  }
  function rankRound(r){ return {r32:1,r16:2,qf:3,sf:4,final:5,champion:6}[r] || 0; }
  function championLine(team){ return (activeLang() === 'fr' ? 'Champion du monde' : copy().champion); }
  function roundStatusText(adj, round, lang){
    const c = UI[lang] || UI.fr;
    if(lang === 'en') return `${adj} for the ${round}`;
    if(lang === 'ar') return `${adj} ${c.inRound} ${round}`;
    return `${adj} ${c.inRound} ${round}`;
  }
  function finalizeState(s, resolved, teams){
    const lang = activeLang();
    const c = copy();
    const fem = feminine(s.key);
    if(s.status === 'eliminated'){
      const adj = fem ? c.eliminated : c.eliminatedM;
      const eliminatedAt = roundStatusText(adj, roundLabel(s.eliminatedRound, lang), lang);
      s.statusLabel = eliminatedAt + (s.lastMatchLabel ? ' · ' + s.lastMatchLabel : '');
      s.selectorLine = eliminatedAt;
      return;
    }
    if(s.status === 'champion') return;
    const adj = fem ? c.qualified : c.qualifiedM;
    const rd = roundLabel(s.currentRound, lang);
    const next = nextOpponentInfo(s, resolved, teams);
    s.nextOpponentLabel = next.label;
    s.nextMatchLabel = next.matchLabel;
    s.nextMatchDate = next.date;
    const qualifiedFor = roundStatusText(adj, rd, lang);
    s.statusLabel = qualifiedFor + (next.label ? ' · ' + c.wait + ' ' + next.shortLabel : '');
    s.selectorLine = qualifiedFor + (next.label ? ' · ' + c.wait + ' ' + next.shortLabel : '');
  }
  function nextOpponentInfo(s, resolved, teams){
    if(!s.nextMatchId || !MATCH_DEFS[s.nextMatchId]) return {label:'', shortLabel:'', matchLabel:'', date:''};
    const r = resolved[s.nextMatchId];
    if(!r) return {label:'', shortLabel:'', matchLabel:'', date:''};
    let opp = '';
    if(r.home === s.key) opp = r.away ? teamName(r.away, teams) : r.awayLabel;
    else if(r.away === s.key) opp = r.home ? teamName(r.home, teams) : r.homeLabel;
    else opp = r.homeLabel && r.awayLabel ? r.homeLabel + '–' + r.awayLabel : '';
    const shortLabel = compactOpponent(opp);
    const matchLabel = (r.home ? teamFlag(r.home, teams) + ' ' + teamName(r.home, teams) : r.homeLabel) + '–' + (r.away ? teamName(r.away, teams) + ' ' + teamFlag(r.away, teams) : r.awayLabel);
    return {label:opp, shortLabel, matchLabel, date:dateForMatch(s.nextMatchId)};
  }
  function compactOpponent(label){
    const s = String(label || '');
    return s.replace(/^Vainqueur\s+/i,'').replace(/^Winner of\s+/i,'').replace(/^Vencedor\s+/i,'').replace(/^Ganador\s+/i,'').replace(/^الفائز من\s+/,'').replace('–', ' ' + copy().vs + ' ');
  }
  function dateForMatch(id){
    const dates = {
      fr:{N94:'Mar. 7 juillet · 02h00 · heure locale',N95:'Mar. 7 juillet · 18h00 · heure locale',N96:'Mar. 7 juillet · 22h00 · heure locale',N97:'Jeu. 9 juillet · 22h00 · heure locale',N98:'Ven. 10 juillet · 21h00 · heure locale',N99:'Sam. 11 juillet · 23h00 · heure locale',N100:'Dim. 12 juillet · 03h00 · heure locale',N101:'Mar. 14 juillet · 21h00 · heure locale',N102:'Mer. 15 juillet · 21h00 · heure locale',N103:'Sam. 18 juillet · 23h00 · heure locale',N104:'Dim. 19 juillet · 21h00 · heure locale'},
      en:{N94:'Tue 7 July · 02:00 · local time',N95:'Tue 7 July · 18:00 · local time',N96:'Tue 7 July · 22:00 · local time',N97:'Thu 9 July · 22:00 · local time',N98:'Fri 10 July · 21:00 · local time',N99:'Sat 11 July · 23:00 · local time',N100:'Sun 12 July · 03:00 · local time',N101:'Tue 14 July · 21:00 · local time',N102:'Wed 15 July · 21:00 · local time',N103:'Sat 18 July · 23:00 · local time',N104:'Sun 19 July · 21:00 · local time'},
      es:{N101:'Mar. 14 de julio · 21:00 · hora local',N102:'Mié. 15 de julio · 21:00 · hora local',N103:'Sáb. 18 de julio · 23:00 · hora local',N104:'Dom. 19 de julio · 21:00 · hora local'},
      pt:{N101:'Ter. 14 de julho · 21:00 · hora local',N102:'Qua. 15 de julho · 21:00 · hora local',N103:'Sáb. 18 de julho · 23:00 · hora local',N104:'Dom. 19 de julho · 21:00 · hora local'},
      ar:{N101:'الثلاثاء 14 يوليو · 21:00 · بالتوقيت المحلي',N102:'الأربعاء 15 يوليو · 21:00 · بالتوقيت المحلي',N103:'السبت 18 يوليو · 23:00 · بالتوقيت المحلي',N104:'الأحد 19 يوليو · 21:00 · بالتوقيت المحلي'}
    };
    const lang = activeLang();
    return (dates[lang] && dates[lang][id]) || dates.fr[id] || '';
  }

  
function newsHref(id, section){
    const p = new URLSearchParams();
    p.set('mode','news');
    if(section) p.set('section', section);
    if(id) p.set('article', id);
    p.set('v', VERSION_TOKEN);
    return '?' + p.toString();
  }

  function newsLang(item, lang){
    return (item && item.langs && (item.langs[lang] || item.langs.fr)) || {};
  }

  function worldNewsHtml(worldNews, section){
    const lang = activeLang(), c = copy();
    const activeSection = section || 'world';
    const items = Array.isArray(worldNews) ? worldNews.filter(item => (item.section || 'world') === activeSection).slice().sort((a,b)=>(a.priority||99)-(b.priority||99)) : [];
    if(!items.length) return '';
    function entry(item){
      const L = newsLang(item, lang);
      const featured = item.type === 'analysis' || item.priority === 1;
      return `<a class="world-news-card ${featured ? 'featured' : ''}" data-news-id="${esc(item.id)}" href="${esc(newsHref(item.id, item.section || activeSection))}" aria-label="${esc(L.title || '')}">
        <div class="world-news-media">${item.image ? `<img src="${esc(item.image)}" loading="lazy" decoding="async" alt="${esc(L.title || '')}">` : ''}</div>
        <div class="world-news-content">
          <div class="world-news-tag">${esc(L.tag || '')}</div>
          <h3>${esc(L.title || '')}</h3>
          <p>${esc(L.body || '')}</p>
          <span class="world-news-read">Lire la brève →</span>
        </div>
      </a>`;
    }
    return `<section class="world-news-section" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <div class="world-news-head">
        <a class="news-home-link" href="?v=${VERSION_TOKEN}" aria-label="Retour à la page d’accueil">
          <div class="world-news-kicker">Mondial Pulse Editorial</div>
          <h2>${esc(c.newsTitle)}</h2>
          <p>${esc(c.newsLead)}</p>
        </a>
      </div>
      <div class="world-news-grid">${items.map(entry).join('')}</div>
    </section>`;
  }

  function localizedResultRow(row, lang){
    const suffix = '_' + lang;
    const rawResult = String((row && row.result) || '').toUpperCase();
    let displayResult = rawResult;
    if(lang === 'en') displayResult = rawResult === 'V' ? 'W' : rawResult === 'N' ? 'D' : rawResult === 'D' ? 'L' : rawResult;
    return Object.assign({}, row || {}, {
      label: (row && row['label' + suffix]) || (row && row.label) || '',
      note: (row && row['note' + suffix]) || (row && row.note) || '',
      rawResult,
      displayResult
    });
  }

  function resultClassFor(raw){
    const r = String(raw || '').toUpperCase();
    return r === 'V' || r === 'W' ? 'win' : r === 'N' || r === 'DRAW' ? 'draw' : 'loss';
  }

  function journeyLimit(key, computed){
    const finalMatch = computed && computed.resolved && computed.resolved.N104;
    if(finalMatch && (finalMatch.home === key || finalMatch.away === key)) return 6;
    return SEMIFINALISTS.has(key) ? 5 : 4;
  }

  function journeyResultsForTeam(key, teamResults, computed, teams){
    const lang = activeLang();
    const rows = (((teamResults && teamResults[key]) || []).map(row => localizedResultRow(row, lang)));
    const seen = new Set(rows.map(row => row.matchId || String(row.label || '').toLowerCase().replace(/\s+/g,' ').trim()));
    ORDER.forEach(id => {
      const match = computed && computed.resolved && computed.resolved[id];
      if(!match || !match.final || !match.home || !match.away || (match.home !== key && match.away !== key) || seen.has(id)) return;
      const rawResult = match.winner === key ? 'V' : 'D';
      const label = `${teamName(match.home, teams)} ${match.score || ''} ${teamName(match.away, teams)}`.replace(/\s+/g,' ').trim();
      const note = roundLabel((match.def && match.def.round) || '', lang);
      rows.push({matchId:id, label, note, rawResult, displayResult: lang === 'en' ? (rawResult === 'V' ? 'W' : 'L') : rawResult});
      seen.add(id);
    });
    return rows;
  }

  function journeyRowsHtml(key, teamResults, computed, teams, limit){
    const rows = journeyResultsForTeam(key, teamResults, computed, teams).slice(-limit);
    return rows.map(row => `<div class="qg-journey-row ${resultClassFor(row.rawResult)}"><span>${esc(row.label || '')}</span><strong>${esc(row.displayResult || '')}</strong></div>`).join('');
  }

  function finalLiveSnapshot(live){
    const stores = [];
    if(live && live.matches) stores.push(live.matches);
    try { if(window.QUALIFGAINDE_LAST_SCORES && window.QUALIFGAINDE_LAST_SCORES.matches) stores.push(window.QUALIFGAINDE_LAST_SCORES.matches); } catch(e) {}
    try { if(typeof KNOCKOUT_LIVE_RESULTS !== 'undefined' && KNOCKOUT_LIVE_RESULTS) stores.push(KNOCKOUT_LIVE_RESULTS); } catch(e) {}
    for(const store of stores){
      for(const [key, value] of Object.entries(store || {})){
        const id = String((value && (value.koId || value.id || value.matchId)) || '').toUpperCase();
        const normalized = String(key || '').toLowerCase().replace(/_/g,'-');
        if(id === 'N104' || KO_ID_BY_KEY[normalized] === 'N104') return value || null;
      }
    }
    return null;
  }

  function finalContext(teams, computed, live){
    const match = computed && computed.resolved && computed.resolved.N104;
    const participants = match ? [match.home, match.away].filter(Boolean) : [];
    const known = participants.length === 2;
    const partial = participants.length === 1;
    const snapshot = finalLiveSnapshot(live);
    const status = String((snapshot && (snapshot.status || snapshot.apiStatus)) || '').toLowerCase();
    const isLive = known && !match.final && !!snapshot && !['scheduled','not started','ns','tbd',''].includes(status) && !['final','ft','aet','pen','match finished'].includes(status);
    let score = '';
    if(snapshot){
      const h = snapshot.home ?? snapshot.hg ?? snapshot.homeScore;
      const a = snapshot.away ?? snapshot.ag ?? snapshot.awayScore;
      if(h != null && a != null) score = `${h}–${a}`;
    }
    if(match && match.final) score = match.score || score;
    return {match, known, partial, participants, snapshot, state: match && match.final ? 'final' : isLive ? 'live' : 'upcoming', score, winner:match && match.final ? match.winner : null};
  }

  function finalCopy(){
    const lang = activeLang();
    const all = {
      fr:{badge:'FINALE · COUPE DU MONDE 2026',open:'Entrer dans la Finale',countdown:'Coup d’envoi dans',journey:'Les 6 derniers matchs dans ce Mondial',waiting:'La finale attend ses deux équipes',waitingDetail:'France–Espagne et Angleterre–Argentine doivent encore livrer leur verdict.',back:'Retour à l’accueil',live:'EN DIRECT',champion:'CHAMPION DU MONDE',scheduled:'Dim. 19 juillet · 21h00 · heure locale',firstFinalist:'PREMIÈRE FINALISTE',waitingOpponent:'L’Espagne attend le vainqueur d’Angleterre–Argentine',unknownFinalist:'Deuxième finaliste à venir'},
      en:{badge:'FINAL · 2026 WORLD CUP',open:'Enter the Final',countdown:'Kick-off in',journey:'Last 6 matches at this World Cup',waiting:'The final is waiting for its two teams',waitingDetail:'France–Spain and England–Argentina still have to decide the two finalists.',back:'Back to home',live:'LIVE',champion:'WORLD CHAMPION',scheduled:'Sun 19 July · 21:00 · local time',firstFinalist:'FIRST FINALIST',waitingOpponent:'Spain await the winner of England–Argentina',unknownFinalist:'Second finalist to come'},
      es:{badge:'FINAL · MUNDIAL 2026',open:'Entrar en la Final',countdown:'Comienza en',journey:'Los últimos 6 partidos en este Mundial',waiting:'La final espera a sus dos equipos',waitingDetail:'Francia–España e Inglaterra–Argentina aún deben decidir los dos finalistas.',back:'Volver al inicio',live:'EN DIRECTO',champion:'CAMPEÓN DEL MUNDO',scheduled:'Dom. 19 de julio · 21:00 · hora local',firstFinalist:'PRIMERA FINALISTA',waitingOpponent:'España espera al ganador de Inglaterra–Argentina',unknownFinalist:'Segundo finalista por decidir'},
      pt:{badge:'FINAL · COPA DO MUNDO 2026',open:'Entrar na Final',countdown:'Começa em',journey:'Os últimos 6 jogos neste Mundial',waiting:'A final espera pelas duas equipes',waitingDetail:'França–Espanha e Inglaterra–Argentina ainda vão definir os finalistas.',back:'Voltar ao início',live:'AO VIVO',champion:'CAMPEÃO DO MUNDO',scheduled:'Dom. 19 de julho · 21:00 · hora local',firstFinalist:'PRIMEIRA FINALISTA',waitingOpponent:'A Espanha espera o vencedor de Inglaterra–Argentina',unknownFinalist:'Segundo finalista por definir'},
      ar:{badge:'نهائي كأس العالم 2026',open:'دخول صفحة النهائي',countdown:'انطلاق المباراة بعد',journey:'آخر 6 مباريات في هذا المونديال',waiting:'النهائي ينتظر طرفيه',waitingDetail:'مباراتا فرنسا–إسبانيا وإنجلترا–الأرجنتين ستحددان طرفي النهائي.',back:'العودة إلى الرئيسية',live:'مباشر',champion:'بطل العالم',scheduled:'الأحد 19 يوليو · 21:00 · بالتوقيت المحلي',firstFinalist:'أول المتأهلين للنهائي',waitingOpponent:'إسبانيا تنتظر الفائز من إنجلترا والأرجنتين',unknownFinalist:'الطرف الثاني لم يُحسم بعد'}
    };
    return all[lang] || all.fr;
  }

  function finalCountdownHtml(ctx, teams){
    const c = finalCopy();
    if(ctx.state === 'live') return `<div class="qg-final-live"><span>${esc(c.live)}</span><strong>${esc(ctx.score || '0–0')}</strong></div>`;
    if(ctx.state === 'final') {
      const winnerName = ctx.winner ? teamName(ctx.winner, teams) : '';
      return `<div class="qg-final-live is-final"><span>${esc(c.champion + (winnerName ? ' · ' + winnerName : ''))}</span><strong>${esc(ctx.score || '')}</strong></div>`;
    }
    return `<div class="qg-final-countdown" data-final-countdown><div class="qg-final-countdown-label">${esc(c.countdown)}</div><div class="qg-final-boxes"><span><b data-final-days>00</b><small>J</small></span><span><b data-final-hours>00</b><small>H</small></span><span><b data-final-minutes>00</b><small>MIN</small></span><span><b data-final-seconds>00</b><small>SEC</small></span></div></div>`;
  }

  function localizedTeamHref(key){
    const p = new URLSearchParams(), lang = activeLang();
    p.set('team', key);
    if(key === 'spain' || key === 'argentina') p.set('lang','es');
    else if(key === 'england') p.set('lang','en');
    else if(lang !== 'fr') p.set('lang',lang);
    p.set('v', VERSION_TOKEN);
    return '?' + p.toString();
  }

  function finalPortrait(key){
    if(key === 'spain') return 'assets/final/lamine-yamal-final.jpg';
    if(key === 'argentina') return 'assets/final/lionel-messi-final.jpg';
    return teamImage(key, {});
  }

  function finalEditorialCopy(){
    const lang = activeLang();
    const all = {
      fr:{
        title:'Espagne–Argentine : la finale entre une légende et un monde nouveau',
        lead:'Trois étoiles contre une. Messi face à Lamine Yamal. L’Argentine retrouve une troisième finale mondiale consécutive, tandis qu’une Espagne presque imprenable avance vers le trône avec 13 buts marqués et un seul encaissé.',
        signature:'L’Argentine viendra avec sa mémoire. L’Espagne avec sa promesse. L’une défendra un héritage. L’autre tentera de prendre possession du futur.',
        spain:'1 étoile · 13 buts · 1 encaissé', argentina:'3 étoiles · 19 buts · 3e finale consécutive',
        duel:'Messi × Lamine Yamal', why:'Pourquoi cette finale est historique',
        facts:['Messi peut encore agrandir une légende déjà complète.','Lamine Yamal peut devenir le symbole des prochaines années du football mondial.','L’Espagne n’a encaissé qu’un but dans toute la compétition.','L’Argentine a inscrit 19 buts et dispute une troisième finale mondiale consécutive.'],
        paragraphs:[
          'Il y aura, d’un côté, le poids de l’éternité.',
          'L’Argentine de Lionel Messi, ses trois étoiles, sa ferveur et cette capacité unique à transformer les grands matchs en morceaux de mythologie. Une équipe qui connaît le chemin des finales, qui sait souffrir sans rompre et qui revient une nouvelle fois au dernier rendez-vous, comme si son histoire refusait de quitter la lumière.',
          'Et puis, en face, il y aura l’avenir.',
          'Une Espagne jeune, souveraine, précise comme une horloge et pourtant capable de fulgurances. Une équipe qui a traversé la compétition avec 13 buts inscrits pour un seul encaissé, mêlant maîtrise technique, discipline tactique et insouciance. La Roja ne demande plus la permission d’entrer dans la cour des grands : elle avance déjà comme si le trône lui appartenait.',
          'Au cœur de cette finale, deux visages résument deux générations. Lionel Messi, dernier gardien d’une époque qu’il a façonnée à son image. Lamine Yamal, prodige d’un football nouveau, libre, rapide et sans complexe.',
          'Ce match ne dira pas seulement qui sera champion du monde. Il dira peut-être où se situe désormais le centre de gravité du football. Messi peut encore ajouter une page immense à une légende qui semblait déjà complète. Mais si Yamal survole cette finale, s’il ose, crée et décide au moment où la planète entière le regarde, il pourrait devenir bien davantage qu’un jeune champion : le symbole des prochaines années du football mondial.',
          'Espagne–Argentine ne sera pas seulement une finale. Ce sera la rencontre entre ce que le football a produit de plus grand et ce qu’il s’apprête peut-être à célébrer demain.',
          'Le déroulé du match nous dira s’il s’agit encore du règne de Messi. Ou de la première nuit du monde de Lamine Yamal.'
        ]
      },
      en:{title:'Spain–Argentina: a legend meets a new world',lead:'Three stars against one. Messi faces Lamine Yamal in a final between heritage and the future.',signature:'Argentina bring their memory. Spain bring their promise.',spain:'1 star · 13 goals · 1 conceded',argentina:'3 stars · 19 goals · third consecutive final',duel:'Messi × Lamine Yamal',why:'Why this final is historic',facts:['Messi can add another page to his legend.','Yamal can become the face of football’s next era.','Spain have conceded only once.','Argentina have scored 19 goals and reach a third consecutive final.'],paragraphs:[]},
      es:{title:'España–Argentina: una leyenda frente a un mundo nuevo',lead:'Tres estrellas contra una. Messi frente a Lamine Yamal en una final entre la herencia y el futuro.',signature:'Argentina llega con su memoria. España con su promesa.',spain:'1 estrella · 13 goles · 1 encajado',argentina:'3 estrellas · 19 goles · tercera final consecutiva',duel:'Messi × Lamine Yamal',why:'Por qué esta final es histórica',facts:['Messi puede ampliar una leyenda ya completa.','Yamal puede convertirse en el símbolo de la próxima era.','España solo ha encajado un gol.','Argentina ha marcado 19 goles y disputa su tercera final consecutiva.'],paragraphs:[]},
      pt:{title:'Espanha–Argentina: uma lenda diante de um mundo novo',lead:'Três estrelas contra uma. Messi enfrenta Lamine Yamal numa final entre herança e futuro.',signature:'A Argentina chega com a memória. A Espanha com a promessa.',spain:'1 estrela · 13 gols · 1 sofrido',argentina:'3 estrelas · 19 gols · terceira final consecutiva',duel:'Messi × Lamine Yamal',why:'Por que esta final é histórica',facts:['Messi pode ampliar uma lenda já completa.','Yamal pode simbolizar a próxima era.','A Espanha sofreu apenas um gol.','A Argentina marcou 19 gols e disputa a terceira final seguida.'],paragraphs:[]},
      ar:{title:'إسبانيا والأرجنتين: أسطورة في مواجهة عالم جديد',lead:'ثلاث نجوم أمام نجمة واحدة، وميسي في مواجهة لامين يامال.',signature:'الأرجنتين تحمل الذاكرة، وإسبانيا تحمل الوعد.',spain:'نجمة · 13 هدفاً · هدف واحد مستقبَل',argentina:'3 نجوم · 19 هدفاً · النهائي الثالث توالياً',duel:'ميسي × لامين يامال',why:'لماذا هذا النهائي تاريخي',facts:['ميسي يستطيع إضافة فصل جديد إلى أسطورته.','يامال قد يصبح رمز الجيل القادم.','إسبانيا استقبلت هدفاً واحداً فقط.','الأرجنتين سجلت 19 هدفاً وتبلغ النهائي الثالث توالياً.'],paragraphs:[]}
    };
    return all[lang] || all.fr;
  }

  function finalTeamsHtml(ctx, teams){
    if(!ctx.match || (!ctx.match.home && !ctx.match.away)) return '';
    const c = finalCopy(), e = finalEditorialCopy(), home = ctx.match.home, away = ctx.match.away;
    const teamBlock = key => {
      const champion = ctx.state === 'final' && ctx.winner === key;
      const stat = key === 'spain' ? e.spain : key === 'argentina' ? e.argentina : '';
      return `<a class="qg-final-team${champion ? ' is-champion' : ''}" href="${esc(localizedTeamHref(key))}" aria-label="${esc(teamName(key, teams))}"><span class="qg-final-player"><img src="${esc(finalPortrait(key))}" alt="${esc(teamName(key, teams))}" loading="lazy" decoding="async"></span><span class="qg-final-team-flag">${esc(teamFlag(key, teams))}</span><strong>${esc(teamName(key, teams))}</strong>${stat ? `<small>${esc(stat)}</small>` : ''}${champion ? `<em class="qg-final-team-crown">🏆 ${esc(c.champion)}</em>` : ''}<b class="qg-final-team-link">Voir l’équipe →</b></a>`;
    };
    const waitingBlock = () => `<div class="qg-final-team is-waiting"><span>✦</span><strong>${esc(c.unknownFinalist)}</strong></div>`;
    return `<div class="qg-final-matchup">${home ? teamBlock(home) : waitingBlock()}<div class="qg-final-vs">VS</div>${away ? teamBlock(away) : waitingBlock()}</div>`;
  }

  function finalFactsHtml(){
    const e = finalEditorialCopy();
    return `<section class="qg-final-facts"><div class="qg-final-facts-title">${esc(e.why)}</div><div class="qg-final-facts-grid">${(e.facts || []).map(x=>`<div><span>✦</span><p>${esc(x)}</p></div>`).join('')}</div></section>`;
  }

  function finalEditorialHtml(full){
    const e = finalEditorialCopy();
    return `<div class="qg-final-editorial"><div class="qg-final-duel">${esc(e.duel)}</div><h2>${esc(e.title)}</h2><p class="qg-final-lead">${esc(e.lead)}</p><p class="qg-final-signature">${esc(e.signature)}</p>${full && e.paragraphs && e.paragraphs.length ? `<div class="qg-final-story">${e.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div>` : ''}</div>`;
  }

  function finalJourneyHtml(ctx, teams, teamResults, computed){
    const keys = ctx && ctx.match ? [ctx.match.home, ctx.match.away].filter(Boolean) : [];
    if(!keys.length) return '';
    const c = finalCopy();
    return `<div class="qg-final-journeys${keys.length === 1 ? ' is-single' : ''}">${keys.map(key => `<div class="qg-final-journey"><h3>${esc(teamFlag(key, teams) + ' ' + teamName(key, teams))}</h3><p>${esc(c.journey)}</p>${journeyRowsHtml(key, teamResults, computed, teams, 6)}</div>`).join('')}</div>`;
  }

  function localizedHomeHref(){
    const p = new URLSearchParams(), lang = activeLang();
    if(lang !== 'fr') p.set('lang', lang);
    p.set('v', VERSION_TOKEN);
    return '?' + p.toString();
  }

  function localizedFinalHref(){
    const p = new URLSearchParams(), lang = activeLang();
    p.set('mode','final');
    if(lang !== 'fr') p.set('lang', lang);
    p.set('v', VERSION_TOKEN);
    return '?' + p.toString();
  }

  function finaleHomeCardHtml(teams, computed, teamResults, live){
    const ctx = finalContext(teams, computed, live), c = finalCopy();
    if(!ctx.match || (!ctx.match.home && !ctx.match.away)) return '';
    const first = ctx.participants && ctx.participants[0];
    const pending = ctx.partial && first ? `<div class="qg-final-pending"><span>${esc(c.firstFinalist)}</span><strong>${esc(teamFlag(first, teams) + ' ' + teamName(first, teams))}</strong><p>${esc(c.waitingOpponent)}</p></div>` : '';
    return `<section class="qg-final-hero${ctx.partial ? ' is-partial' : ' is-complete'}"><div class="qg-final-shine"></div><div class="qg-final-badge">${esc(c.badge)}</div>${ctx.known ? `<img class="qg-final-poster" src="assets/news/finale-espagne-argentine-messi-yamal.jpg" alt="Espagne–Argentine · Messi face à Lamine Yamal" loading="eager" decoding="async">` : ''}${pending}${ctx.known ? finalEditorialHtml(false) : ''}${finalTeamsHtml(ctx, teams)}${finalCountdownHtml(ctx, teams)}<div class="qg-final-date">${esc(c.scheduled)}</div>${ctx.known ? finalFactsHtml() : finalJourneyHtml(ctx, teams, teamResults, computed)}<a class="qg-final-open" href="${esc(localizedFinalHref())}">${esc(c.open)} →</a></section>`;
  }

  function startFinalCountdown(root){
    if(window.__QG_FINAL_COUNTDOWN_TIMER__){ clearInterval(window.__QG_FINAL_COUNTDOWN_TIMER__); window.__QG_FINAL_COUNTDOWN_TIMER__ = null; }
    const blocks = Array.from((root || document).querySelectorAll('[data-final-countdown]'));
    if(!blocks.length) return;
    const target = new Date(isoForMatch('N104')).getTime();
    if(!Number.isFinite(target)) return;
    const pad = n => String(Math.max(0, Math.floor(n))).padStart(2,'0');
    function tick(){
      const diff = Math.max(0, target - Date.now());
      const values = {days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),minutes:Math.floor((diff%3600000)/60000),seconds:Math.floor((diff%60000)/1000)};
      blocks.forEach(block => {
        const d=block.querySelector('[data-final-days]'), h=block.querySelector('[data-final-hours]'), m=block.querySelector('[data-final-minutes]'), sec=block.querySelector('[data-final-seconds]');
        if(d) d.textContent=String(values.days); if(h) h.textContent=pad(values.hours); if(m) m.textContent=pad(values.minutes); if(sec) sec.textContent=pad(values.seconds);
      });
      if(diff <= 0 && window.__QG_FINAL_COUNTDOWN_TIMER__){ clearInterval(window.__QG_FINAL_COUNTDOWN_TIMER__); window.__QG_FINAL_COUNTDOWN_TIMER__=null; }
    }
    tick();
    window.__QG_FINAL_COUNTDOWN_TIMER__ = setInterval(tick,1000);
  }

  function renderFinal(selector, teams, computed, teamResults, live){
    if(!selector) return;
    const ctx = finalContext(teams, computed, live), c = finalCopy();
    const homeHref = localizedHomeHref();
    selector.innerHTML = `<div class="qg-entry-bg"></div><div class="qg-entry-wrap qg-final-page"><div class="qg-entry-top"><a class="qg-entry-brand" href="${esc(homeHref)}"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V${esc(VERSION)}</span></a><a class="qg-entry-pill" href="${esc(homeHref)}">${esc(c.back)}</a></div>${(ctx.known || ctx.partial) ? `<section class="qg-final-stage${ctx.partial ? ' is-partial' : ' is-complete'}"><div class="qg-final-badge">${esc(c.badge)}</div>${ctx.known ? `<img class="qg-final-poster" src="assets/news/finale-espagne-argentine-messi-yamal.jpg" alt="Espagne–Argentine · Messi face à Lamine Yamal">` : ''}${ctx.partial && ctx.participants[0] ? `<div class="qg-final-pending"><span>${esc(c.firstFinalist)}</span><strong>${esc(teamFlag(ctx.participants[0], teams) + ' ' + teamName(ctx.participants[0], teams))}</strong><p>${esc(c.waitingOpponent)}</p></div>` : ''}${ctx.known ? finalEditorialHtml(false) : ''}${finalTeamsHtml(ctx, teams)}${finalCountdownHtml(ctx, teams)}<div class="qg-final-date">${esc(c.scheduled)}</div>${ctx.known ? finalFactsHtml() : ''}${finalJourneyHtml(ctx, teams, teamResults, computed)}${ctx.known ? finalEditorialHtml(true) : ''}</section>` : `<section class="qg-final-stage qg-final-waiting"><div class="qg-final-badge">${esc(c.badge)}</div><h1>${esc(c.waiting)}</h1><p>${esc(c.waitingDetail)}</p></section>`}<div class="qg-entry-actions"><a class="qg-entry-action" href="${esc(homeHref)}">${esc(c.back)}</a></div></div>`;
    startFinalCountdown(selector);
    startThirdCountdown(selector);
  }

  function editorialTeasersHtml(worldNews){
    const lang = activeLang();
    const configs = [
      {section:'world', image:'assets/news/les-breves-du-mondial.png', kicker:'Mondial Pulse Editorial', title:'Les Brèves du Mondial'},
      {section:'gaindes', image:'assets/news/les-breves-des-gaindes.png', kicker:'Les Gaïndés dans le monde', title:'Les Brèves des Gaïndés'}
    ];
    return `<div class="qg-editorial-portals">${configs.map(cfg => {
      const items=(worldNews||[]).filter(x=>(x.section||'world')===cfg.section).sort((a,b)=>(a.priority||99)-(b.priority||99)).slice(0,2);
      const preview=items.map(item=>{const L=newsLang(item,lang);return `<span>${esc(L.title||'')}</span>`}).join('');
      const p=new URLSearchParams({mode:'news',section:cfg.section,v:VERSION_TOKEN});
      return `<a class="qg-editorial-portal ${cfg.section}" href="?${p.toString()}"><img src="${esc(cfg.image)}" loading="lazy" decoding="async" alt="${esc(cfg.title)}"><div><small>${esc(cfg.kicker)}</small><h2>${esc(cfg.title)}</h2><p>${preview}</p><strong>Ouvrir →</strong></div></a>`;
    }).join('')}</div>`;
  }

  function articleParagraphs(L){
    const raw = Array.isArray(L.article) ? L.article : [L.body || ''];
    return raw.filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
  }

  function renderNewsArticle(selector, item){
    if(!selector || !item) return;
    const lang = activeLang(), c = copy(), L = newsLang(item, lang);
    const section = item.section || 'world';
    selector.innerHTML = `
      <div class="qg-entry-bg"></div>
      <div class="qg-entry-wrap news-hub-wrap news-article-wrap">
        <div class="qg-entry-top">
          <a class="qg-entry-brand news-brand-home" href="?v=${VERSION_TOKEN}" aria-label="Retour à la page d’accueil"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V${esc(VERSION)}</span></a>
          <a class="qg-entry-pill news-pill-home" href="?mode=news&section=${esc(section)}&v=${VERSION_TOKEN}">${esc(section === 'gaindes' ? 'Les Brèves des Gaïndés' : c.newsTitle)}</a>
        </div>
        <article class="news-article" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
          <a class="news-article-header" href="?v=${VERSION_TOKEN}" aria-label="Retour à la home">
            <div class="qg-entry-kicker">${esc(L.tag || 'Brève')}</div>
            <h1>${esc(L.title || '')}</h1>
          </a>
          ${item.image ? `<img class="news-article-image" src="${esc(item.image)}" alt="${esc(L.title || '')}">` : ''}
          <div class="news-article-body">${articleParagraphs(L)}</div>
          <div class="qg-entry-actions"><a class="qg-entry-action" href="?mode=news&section=${esc(section)}&v=${VERSION_TOKEN}">← Toutes les brèves</a><a class="qg-entry-action" href="?v=${VERSION_TOKEN}">Accueil</a></div>
        </article>
      </div>`;
  }

  function renderNewsHub(selector, worldNews, section){
    if(!selector) return;
    const c = copy();
    const activeSection = section === 'gaindes' ? 'gaindes' : 'world';
    const isGaindes = activeSection === 'gaindes';
    const title = isGaindes ? 'Les Brèves des Gaïndés' : c.newsTitle;
    const lead = isGaindes ? 'Actualité, mercato et débats autour des Lions.' : c.newsLead;
    const image = isGaindes ? 'assets/news/les-breves-des-gaindes.png' : 'assets/news/les-breves-du-mondial.png';
    const other = isGaindes ? 'world' : 'gaindes';
    selector.innerHTML = `
      <div class="qg-entry-bg"></div>
      <div class="qg-entry-wrap news-hub-wrap">
        <div class="qg-entry-top">
          <a class="qg-entry-brand news-brand-home" href="?v=${VERSION_TOKEN}" aria-label="Retour à la page d’accueil"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V${esc(VERSION)}</span></a>
          <a class="qg-entry-pill news-pill-home" href="?mode=news&section=${other}&v=${VERSION_TOKEN}">${esc(isGaindes ? 'Brèves du Mondial' : 'Brèves des Gaïndés')}</a>
        </div>
        <a class="qg-news-section-hero ${activeSection}" href="?v=${VERSION_TOKEN}"><img src="${image}" alt="${esc(title)}"><div><small>${esc(isGaindes ? 'Les Gaïndés dans le monde' : 'Mondial Pulse Editorial')}</small><h1>${esc(title)}</h1><p>${esc(lead)}</p></div></a>
        ${worldNewsHtml(worldNews, activeSection)}
        <div class="qg-entry-actions"><a class="qg-entry-action" href="?v=${VERSION_TOKEN}">Retour à l’accueil</a></div>
      </div>`;
  }

  function knockoutLiveSnapshot(targetId, live){
    const stores=[];
    if(live && live.matches) stores.push(live.matches);
    try{if(window.QUALIFGAINDE_LAST_SCORES&&window.QUALIFGAINDE_LAST_SCORES.matches) stores.push(window.QUALIFGAINDE_LAST_SCORES.matches)}catch(e){}
    try{if(typeof KNOCKOUT_LIVE_RESULTS!=='undefined'&&KNOCKOUT_LIVE_RESULTS) stores.push(KNOCKOUT_LIVE_RESULTS)}catch(e){}
    for(const store of stores){
      for(const [key,value] of Object.entries(store||{})){
        const id=String((value&&(value.koId||value.id||value.matchId))||'').toUpperCase();
        const normalized=String(key||'').toLowerCase().replace(/_/g,'-');
        if(id===targetId || KO_ID_BY_KEY[normalized]===targetId) return value||null;
      }
    }
    return null;
  }
  function thirdPlaceContext(computed, live){
    const match=computed&&computed.resolved&&computed.resolved.N103;
    const known=!!(match&&match.home&&match.away);
    const snapshot=knockoutLiveSnapshot('N103',live);
    const status=String((snapshot&&(snapshot.status||snapshot.apiStatus))||'').toLowerCase();
    const isLive=known && !(match&&match.final) && !!snapshot && !['scheduled','not started','ns','tbd',''].includes(status) && !['final','ft','aet','pen','match finished'].includes(status);
    let score='';
    if(snapshot){const h=snapshot.home??snapshot.hg??snapshot.homeScore,a=snapshot.away??snapshot.ag??snapshot.awayScore;if(h!=null&&a!=null) score=`${h}–${a}`}
    if(match&&match.final) score=match.score||score;
    return {match,known,state:match&&match.final?'final':isLive?'live':'upcoming',score,winner:match&&match.final?match.winner:null};
  }
  function thirdPlaceCardHtml(teams, computed, live){
    const ctx=thirdPlaceContext(computed,live); if(!ctx.known) return '';
    const m=ctx.match, home=m.home, away=m.away;
    if(ctx.state==='final'){
      const winner=ctx.winner, loser=winner===home?away:home;
      return `<section class="qg-bronze-podium"><div class="qg-bronze-kicker">PODIUM · COUPE DU MONDE 2026</div><div class="qg-bronze-medal">🥉</div><small>MÉDAILLE DE BRONZE</small><h2>${esc(teamFlag(winner,teams)+' '+teamName(winner,teams))}</h2><strong>${esc(ctx.score||'')}</strong><p>Troisième de la Coupe du monde 2026</p><div class="qg-bronze-links"><a href="${esc(localizedTeamHref(winner))}">Voir le parcours du troisième →</a><a href="${esc(localizedTeamHref(loser))}">Voir l’autre parcours →</a></div></section>`;
    }
    const state=ctx.state;
    return `<section class="qg-third-card ${state}"><div class="qg-third-kicker">PETITE FINALE · 3E PLACE</div><small>Même le bronze aura un goût de suprématie</small><h2>France–Angleterre : le Channel en feu</h2><p>Harry Kane et Jude Bellingham face à Kylian Mbappé et Ousmane Dembélé. Une petite finale aux allures de sommet européen.</p><div class="qg-third-teams"><a href="${esc(localizedTeamHref(home))}"><span>${esc(teamFlag(home,teams))}</span><b>${esc(teamName(home,teams))}</b></a><i>VS</i><a href="${esc(localizedTeamHref(away))}"><span>${esc(teamFlag(away,teams))}</span><b>${esc(teamName(away,teams))}</b></a></div>${state==='live'?`<div class="qg-third-live"><em>EN DIRECT</em><strong>${esc(ctx.score||'0–0')}</strong></div>`:`<div class="qg-third-countdown" data-third-countdown><b data-third-days>00</b><span>J</span><b data-third-hours>00</b><span>H</span><b data-third-minutes>00</b><span>MIN</span></div>`}<div class="qg-third-date">Sam. 18 juillet · 23h00 · heure locale</div><a class="qg-third-read" href="${esc(newsHref('france-england-bronze','world'))}">Lire l’avant-match →</a></section>`;
  }
  function startThirdCountdown(root){
    const node=root&&root.querySelector('[data-third-countdown]'); if(!node) return;
    const target=new Date('2026-07-18T23:00:00+02:00').getTime();
    const tick=()=>{const diff=Math.max(0,target-Date.now()),d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60;const set=(q,v)=>{const e=node.querySelector(q);if(e)e.textContent=String(v).padStart(2,'0')};set('[data-third-days]',d);set('[data-third-hours]',h);set('[data-third-minutes]',m)};tick();setInterval(tick,30000);
  }

  function gaindesInternationalCardHtml(){
    return `<a class="qg-gaindes-entry-card" href="?mode=gaindes&v=${VERSION_TOKEN}" aria-label="Ouvrir Suivi des Gaïndés à l’international">
      <img src="/mangara-studio-7f3k9q/assets/brand/suivi-gaindes-lion.jpg" alt="Lion · Suivi des Gaïndés">
      <span class="qg-gaindes-entry-copy"><small>LES LIONS DANS LE MONDE</small><strong>Suivi des Gaïndés</strong><em>À l’international</em><p>Sélection, clubs, Europe, joueurs et Brèves des Gaïndés dans un même univers.</p><b>Entrer dans le suivi →</b></span>
    </a>`;
  }
  function farewellArchiveHtml(items, card, teams, c){
    return `<details class="qg-farewell-archive qg-farewell-card-modal"><summary><span class="qg-farewell-copy"><span class="qg-farewell-kicker">Mémoire du Mondial</span><strong>${esc(c.out)}</strong><small>${items.length} équipes · revoir leurs parcours</small></span><span class="qg-farewell-flags">${items.slice(0,8).map(s=>`<i>${esc(s.flag || teamFlag(s.key, teams))}</i>`).join('')}</span><span class="qg-farewell-open-label">Ouvrir →</span></summary><div class="qg-farewell-overlay"><div class="qg-farewell-dialog" role="dialog" aria-modal="true" aria-label="${esc(c.out)}"><button class="qg-farewell-close" type="button" aria-label="Fermer" onclick="this.closest('details').removeAttribute('open')">×</button><div class="qg-farewell-dialog-head"><span class="qg-farewell-kicker">Mémoire du Mondial</span><h2>${esc(c.out)}</h2><p>Choisis un drapeau pour revoir la page et le parcours de l’équipe.</p></div><div class="qg-team-grid qg-farewell-team-grid">${items.map(s=>card(s,'out')).join('')}</div></div></div></details>`;
  }
  function renderGaindesHub(selector){
    if(!selector) return;
    document.documentElement.classList.add('qg-gaindes-route');
    selector.innerHTML = `<div class="qg-gaindes-route-shell"><iframe class="qg-gaindes-route-frame" src="/mangara-studio-7f3k9q/?embedded=1&v=${VERSION_TOKEN}#home" title="Suivi des Gaïndés à l’international" loading="eager" allow="fullscreen"></iframe></div>`;
  }

  function renderHome(selector, teams, computed, worldNews, teamResults, live){
    if(!selector) return;
    const lang = activeLang(), c = copy();
    const homeFinalCtx = finalContext(teams, computed, live);
    const groups = {qf:[], live:[], out:[]};
    FEATURED_ORDER.forEach(key => {
      const s = computed.state[key];
      if(!s) return;
      if(s.stageGroup === 'eliminated') groups.out.push(s);
      else if(s.stageGroup === 'qualified_qf') groups.qf.push(s);
      else groups.live.push(s);
    });
    function href(s){
      const meta = teamMeta(s.key, teams);
      const p = new URLSearchParams();
      p.set('team', s.key);
      if(meta.defaultLang && ['england','norway','argentina','egypt'].includes(s.key)) p.set('lang', meta.defaultLang);
      p.set('v', VERSION_TOKEN);
      return '?' + p.toString();
    }
    function cardCopy(s){
      if(s.key !== 'england') return {name:s.teamName || teamName(s.key, teams), line:s.selectorLine || s.statusLabel || ''};
      const enNames = {england:'England',argentina:'Argentina',france:'France',spain:'Spain',norway:'Norway',mexico:'Mexico',dr_congo:'DR Congo'};
      if(s.status === 'champion') return {name:'England',line:'World champions'};
      if(s.status === 'eliminated') return {name:'England',line:`Eliminated in the ${roundLabel(s.eliminatedRound || s.currentRound, 'en')}`};
      const match = s.nextMatchId && computed.resolved ? computed.resolved[s.nextMatchId] : null;
      const opponentKey = match ? (match.home === 'england' ? match.away : (match.away === 'england' ? match.home : null)) : null;
      const opponent = opponentKey ? (enNames[opponentKey] || teamName(opponentKey, teams)) : '';
      const line = `Qualified for the ${roundLabel(s.currentRound, 'en')}` + (opponent ? ` · next: ${opponent}` : '');
      return {name:'England',line};
    }
    function card(s, cls){
      const native = cardCopy(s);
      return `<a class="qg-team-card ${cls}" href="${esc(href(s))}" data-team="${esc(s.key)}"><span class="qg-team-flag">${esc(s.flag || teamFlag(s.key, teams))}</span><span class="qg-team-copy"><span class="qg-team-name">${esc(native.name)}</span><span class="qg-team-line">${esc(native.line)}</span></span></a>`;
    }
    selector.innerHTML = `
      <div class="qg-entry-bg"></div>
      <div class="qg-entry-wrap">
        <div class="qg-entry-top">
          <div class="qg-entry-brand"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V${esc(VERSION)}</span></div>
          <div class="qg-entry-pill">${esc(c.homePill)}</div>
        </div>
        <div class="qg-entry-hero">
          <div class="qg-entry-kicker">${esc(c.homeKicker)}</div>
          <h1>${c.homeTitle}</h1>
          <p>${esc(c.homeLead)}</p>
        </div>
        ${finaleHomeCardHtml(teams, computed, teamResults, live)}
        ${thirdPlaceCardHtml(teams, computed, live)}
        ${!homeFinalCtx.known && groups.qf.length ? `<div class="qg-selector-group"><h2 class="qg-selector-title">${esc(c.qf)}</h2><div class="qg-team-grid">${groups.qf.map(s=>card(s,'qf')).join('')}</div></div>` : ''}
        ${groups.live.length ? `<div class="qg-selector-group"><h2 class="qg-selector-title">${esc(c.live)}</h2><div class="qg-team-grid">${groups.live.map(s=>card(s,'live')).join('')}</div></div>` : ''}
        ${gaindesInternationalCardHtml()}
        ${groups.out.length ? farewellArchiveHtml(groups.out, card, teams, c) : ''}
        ${editorialTeasersHtml(worldNews)}
        <div class="qg-entry-actions"><a class="qg-entry-action" href="?mode=global&v=${VERSION_TOKEN}">${esc(c.global)}</a></div>
      </div>`;
    startFinalCountdown(selector);
  }


function resultLetter(result, lang){
    if(!result) return '';
    const r = String(result).toUpperCase();
    if(lang === 'en'){ if(r === 'V' || r === 'W') return 'W'; if(r === 'D' || r === 'L') return 'L'; if(r === 'N' || r === 'DRAW') return 'D'; }
    if(r === 'V' || r === 'W') return 'V';
    if(r === 'D' || r === 'L') return 'D';
    if(r === 'N' || r === 'DRAW') return 'N';
    return r[0] || '';
  }
  function teamImage(key, teams){
    const meta = teamMeta(key, teams);
    return meta.heroImg || meta.playerImg || meta.bannerImg || 'assets/lion-mascotte.png';
  }
  function patchSideCard(card, key, teams, teamResults, computed){
    if(!card || !key) return;
    const meta = teamMeta(key, teams);
    card.className = 'player-side ' + key.replace(/_/g,'-');
    const lang = activeLang();
    card.setAttribute('aria-label', (lang === 'en' ? 'Recent form of ' : 'Forme récente de ') + (meta.teamName || teamName(key, teams)));
    const img = card.querySelector('.player-photo');
    if(img){
      img.src = teamImage(key, teams);
      img.alt = (meta.heroPlayer ? meta.heroPlayer + ', ' : '') + (meta.teamName || teamName(key, teams));
      img.loading = 'lazy';
      img.decoding = 'async';
    }
    const spans = card.querySelectorAll('.side-title span');
    if(spans[0]) spans[0].textContent = (meta.flag || teamFlag(key, teams)) + ' ' + (meta.teamName || teamName(key, teams));
    if(spans[1]) spans[1].textContent = meta.supporterName || meta.nickname || meta.teamName || teamName(key, teams);
    const sideSub = card.querySelector('.side-sub');
    const limit = journeyLimit(key, computed);
    if(sideSub) sideSub.textContent = lang === 'en' ? `Last ${limit} matches at this World Cup` : lang === 'es' ? `Los últimos ${limit} partidos en este Mundial` : `Les ${limit} derniers matchs dans ce Mondial`;
    const list = card.querySelector('.form-list');
    if(list){
      const rows = journeyResultsForTeam(key, teamResults, computed, teams).slice(-limit);
      if(rows.length){
        list.innerHTML = rows.map(r => `<div class="form-row ${resultClassFor(r.rawResult)}"><span>${esc(r.label || '')}</span><strong>${esc(r.displayResult || resultLetter(r.result, lang) || '')}</strong></div>`).join('');
      } else {
        list.innerHTML = `<div class="form-row"><span>${esc(copy().nextMatch || 'Prochain match')}</span><strong>·</strong></div>`;
      }
    }
  }
  function resolvedMatchTitle(match, teams){
    if(!match) return '';
    const h = match.home ? `${teamFlag(match.home, teams)} ${teamName(match.home, teams)}` : match.homeLabel;
    const a = match.away ? `${teamName(match.away, teams)} ${teamFlag(match.away, teams)}` : match.awayLabel;
    return [h,a].filter(Boolean).join('–');
  }
  
function isoForMatch(id){
    const iso = {
      N94:'2026-07-07T02:00:00+02:00',
      N95:'2026-07-07T18:00:00+02:00',
      N96:'2026-07-07T22:00:00+02:00',
      N97:'2026-07-09T22:00:00+02:00',
      N98:'2026-07-10T21:00:00+02:00',
      N99:'2026-07-12T03:00:00+02:00',
      N100:'2026-07-12T03:00:00+02:00',
      N101:'2026-07-14T21:00:00+02:00',
      N102:'2026-07-15T21:00:00+02:00',
      N103:'2026-07-18T23:00:00+02:00',
      N104:'2026-07-19T21:00:00+02:00'
    };
    return iso[id] || null;
  }
  function restartCountdown(matchId, card){
    if(!card || !matchId) return;
    const iso = isoForMatch(matchId);
    if(!iso) return;
    const target = new Date(iso).getTime();
    if(!Number.isFinite(target)) return;
    if(window.__QG_COUNTDOWN_TIMER__) {
      clearInterval(window.__QG_COUNTDOWN_TIMER__);
      window.__QG_COUNTDOWN_TIMER__ = null;
    }
    const days = card.querySelector('#cd-days') || document.getElementById('cd-days');
    const hours = card.querySelector('#cd-hours') || document.getElementById('cd-hours');
    const min = card.querySelector('#cd-min') || document.getElementById('cd-min');
    const sec = card.querySelector('#cd-sec') || document.getElementById('cd-sec');
    const pad = n => String(Math.max(0, Math.floor(n))).padStart(2,'0');
    function tick(){
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if(days) days.textContent = String(d);
      if(hours) hours.textContent = pad(h);
      if(min) min.textContent = pad(m);
      if(sec) sec.textContent = pad(s);
      if(diff <= 0 && window.__QG_COUNTDOWN_TIMER__) {
        clearInterval(window.__QG_COUNTDOWN_TIMER__);
        window.__QG_COUNTDOWN_TIMER__ = null;
      }
    }
    tick();
    window.__QG_COUNTDOWN_TIMER__ = setInterval(tick, 1000);
  }

  function patchCountdownPanel(activeTeam, teams, computed, teamResults){
    const s = computed && computed.state && computed.state[activeTeam];
    if(!s || s.status === 'eliminated') return;
    const card = document.getElementById('countdown-card');
    if(!card || !s.nextMatchId) return;
    const match = computed.resolved && computed.resolved[s.nextMatchId];
    if(!match) return;
    const def = match.def || MATCH_DEFS[s.nextMatchId] || {};
    const lang = activeLang();
    const matchTitle = resolvedMatchTitle(match, teams) || s.nextMatchLabel || s.nextOpponentLabel || '';
    const kicker = card.querySelector('.countdown-kicker');
    const matchEl = card.querySelector('.countdown-match');
    const meta = card.querySelector('.countdown-meta');
    const endMsg = document.getElementById('countdown-end-msg');
    if(kicker) kicker.textContent = roundLabel(def.round || s.currentRound || 'qf', lang);
    if(matchEl && matchTitle) matchEl.textContent = matchTitle;
    if(meta) meta.textContent = s.nextMatchDate || dateForMatch(s.nextMatchId) || '';
    if(endMsg){
      const h = match.home ? teamName(match.home, teams) : match.homeLabel;
      const a = match.away ? teamName(match.away, teams) : match.awayLabel;
      if(match.home && match.away) {
        endMsg.textContent = `${h}–${a} : ${t('nextMatchConfirmed')}.`;
      } else {
        endMsg.textContent = s.statusLabel || '';
      }
    }
    const sides = card.querySelectorAll('.player-side');
    if(sides[0]) patchSideCard(sides[0], match.home || activeTeam, teams, teamResults || {}, computed);
    if(sides[1]) patchSideCard(sides[1], match.away || null, teams, teamResults || {}, computed);
    // Corrige les placeholders visibles hérités du renderer statique.
    card.querySelectorAll('*').forEach(el => {
      if(el.children.length) return;
      let t = el.textContent || '';
      if(!t) return;
      if(match.away && /Vainqueur\s+États-Unis[–-]Belgique|Winner of United States[–-]Belgium|Ganador Estados Unidos[–-]Bélgica|Vencedor Estados Unidos[–-]Bélgica/i.test(t)){
        el.textContent = t
          .replace(/Vainqueur\s+États-Unis[–-]Belgique/g, teamName(match.away, teams))
          .replace(/Winner of United States[–-]Belgium/g, teamName(match.away, teams))
          .replace(/Ganador Estados Unidos[–-]Bélgica/g, teamName(match.away, teams))
          .replace(/Vencedor Estados Unidos[–-]Bélgica/g, teamName(match.away, teams));
      }
    });
    card.setAttribute('data-qg-computed-fixture', s.nextMatchId);
    restartCountdown(s.nextMatchId, card);
  }

  function updateTeamPage(activeTeam, teams, computed, teamResults){
    if(!activeTeam) return;
    const s = computed.state[activeTeam];
    if(!s) return;
    const c = copy();
    const title = document.querySelector('.htitle');
    if(title) title.innerHTML = `<span>${esc(s.teamName || teamName(activeTeam, teams))}</span> — CM 2026`;
    const finalMatch = computed && computed.resolved && computed.resolved.N104;
    const isFinalist = finalMatch && (activeTeam === finalMatch.home || activeTeam === finalMatch.away);
    if(isFinalist){
      const lang = activeLang();
      const finalTitle = lang === 'es' ? 'FINAL · ESPAÑA–ARGENTINA' : lang === 'en' ? 'FINAL · SPAIN–ARGENTINA' : 'FINALE · ESPAGNE–ARGENTINE';
      const finalSubtitle = activeTeam === 'spain'
        ? (lang === 'es' ? 'España se enfrenta a Argentina en una final entre una leyenda y un mundo nuevo.' : 'L’Espagne affronte l’Argentine dans une finale entre une légende et un monde nouveau.')
        : (lang === 'es' ? 'Messi y Argentina se enfrentan a España por una cuarta estrella.' : 'Messi et l’Argentine retrouvent l’Espagne pour une finale historique.');
      const kicker = document.querySelector('.site-kicker'); if(kicker) kicker.textContent = finalTitle;
      const heroSub = document.getElementById('hero-subtitle'); if(heroSub) heroSub.textContent = finalSubtitle;
      const card = document.getElementById('probable-opponent');
      if(card){
        const label = card.querySelector('.opp-label');
        const main = document.getElementById('opp-main-name');
        const sub = document.getElementById('opp-main-sub');
        if(label) label.innerHTML = (label.querySelector('img') ? label.querySelector('img').outerHTML : '') + (lang === 'es' ? 'La Gran Final' : 'La Grande Finale');
        if(main) main.textContent = lang === 'es' ? '🇪🇸 España–Argentina 🇦🇷' : '🇪🇸 Espagne–Argentine 🇦🇷';
        if(sub) sub.textContent = lang === 'es' ? 'Dom. 19 de julio · 21:00 · hora local' : 'Dim. 19 juillet · 21h00 · heure locale';
        document.body.removeAttribute('data-qg-eliminated');
        patchCountdownPanel(activeTeam, teams, computed, teamResults || {});
      }
      return;
    }
    if(activeTeam === 'england' && s.status === 'eliminated'){
      const kicker = document.querySelector('.site-kicker'); if(kicker) kicker.textContent = 'ELIMINATED IN THE SEMI-FINAL · ARGENTINA 2–1 ENGLAND';
      const heroSub = document.getElementById('hero-subtitle'); if(heroSub) heroSub.textContent = 'England’s World Cup journey ends one match short of the final.';
      const card = document.getElementById('probable-opponent');
      if(card){
        const label = card.querySelector('.opp-label'); const main = document.getElementById('opp-main-name'); const sub = document.getElementById('opp-main-sub');
        if(label) label.innerHTML = (label.querySelector('img') ? label.querySelector('img').outerHTML : '') + 'End of the road';
        if(main) main.textContent = '🏴 England';
        if(sub) sub.textContent = 'Eliminated in the semi-final · Argentina 2–1 England';
        document.body.setAttribute('data-qg-eliminated','true');
        const cd = document.getElementById('countdown-card'); if(cd) cd.style.display = 'none';
      }
      return;
    }
    const kicker = document.querySelector('.site-kicker');
    if(kicker) kicker.textContent = s.statusLabel || '';
    const heroSub = document.getElementById('hero-subtitle');
    if(heroSub && s.statusLabel) heroSub.textContent = s.statusLabel;
    const card = document.getElementById('probable-opponent');
    if(card){
      const label = card.querySelector('.opp-label');
      const main = document.getElementById('opp-main-name');
      const sub = document.getElementById('opp-main-sub');
      if(s.status === 'eliminated'){
        if(label) label.innerHTML = (label.querySelector('img') ? label.querySelector('img').outerHTML : '') + c.end;
        if(main) main.textContent = `${s.flag || teamFlag(activeTeam, teams)} ${s.teamName || teamName(activeTeam, teams)}`.trim();
        if(sub) sub.textContent = s.statusLabel || s.lastMatchLabel || '';
        document.body.setAttribute('data-qg-eliminated','true');
        const cd = document.getElementById('countdown-card');
        if(cd) cd.style.display = 'none';
      } else {
        if(label) label.innerHTML = (label.querySelector('img') ? label.querySelector('img').outerHTML : '') + c.nextMatch;
        if(main) main.textContent = s.nextMatchLabel || s.nextOpponentLabel || s.statusLabel || '';
        if(sub) sub.textContent = s.nextMatchDate || s.statusLabel || '';
        document.body.removeAttribute('data-qg-eliminated');
        patchCountdownPanel(activeTeam, teams, computed, teamResults || {});
      }
    } else {
      patchCountdownPanel(activeTeam, teams, computed, teamResults || {});
    }
  }


async function run(){
    const lang = activeLang();
    const langPath = lang && lang !== 'fr' ? '/data/' + lang + '/teams.json' : null;
    applyDocumentLocale();
    const [baseTeams, localizedTeams, rawLocks, live, teamResults, worldNews] = await Promise.all([
      getJSON('/data/teams.json'),
      langPath ? getJSON(langPath) : Promise.resolve(null),
      getJSON('/data/knockout-locks.json'),
      getJSON('/live.json'),
      getJSON('/data/team-results.json'),
      getJSON('/data/world-news.json')
    ]);
    const teams = mergeTeams(baseTeams || {}, localizedTeams || {});
    const locks = lockMap(rawLocks || {}, live || {});
    const computed = buildState(teams, locks);
    window.computedTeamState = computed.state;
    window.QG_COMPUTED_TEAM_STATE = computed;
    const params = new URLSearchParams(location.search);
    const activeTeam = params.get('team');
    const selector = document.getElementById('v10-team-selector');
    const mode = (params.get('mode') || '').toLowerCase();
    if(selector && !activeTeam && mode === 'final') {
      renderFinal(selector, teams, computed, teamResults || {}, live || {});
    } else if(selector && !activeTeam && mode === 'gaindes') {
      renderGaindesHub(selector);
    } else if(selector && !activeTeam && mode === 'news') {
      const articleId = params.get('article');
      const article = articleId && Array.isArray(worldNews) ? worldNews.find(x => x.id === articleId) : null;
      if(article) renderNewsArticle(selector, article);
      else renderNewsHub(selector, worldNews || [], params.get('section') || 'world');
    } else if(selector && !activeTeam && mode !== 'global') renderHome(selector, teams, computed, worldNews || [], teamResults || {}, live || {});
    if(activeTeam) updateTeamPage(activeTeam.toLowerCase(), teams, computed, teamResults || {});
  }

  let __qgAutoStateTimer = null;
  function scheduleRun(reason, delay){
    clearTimeout(__qgAutoStateTimer);
    __qgAutoStateTimer = setTimeout(function(){
      run().catch(function(e){ console.warn('[QG V' + VERSION + '] computedTeamState refresh skipped', reason, e); });
    }, delay == null ? 160 : delay);
  }

  window.QG_AUTO_TEAM_STATE_ENGINE = {run, buildState, scheduleRun};

  // V15.4.2 — rebrancher la home sur le vrai flux live.
  // `qualifgainde:scoresUpdated` est émis tôt par applyScoresData ; on relance donc plusieurs fois
  // pour passer APRÈS l'écriture de KNOCKOUT_LIVE_RESULTS et la propagation du bracket.
  window.addEventListener('qualifgainde:scoresUpdated', function(){
    scheduleRun('scoresUpdated-early', 80);
    setTimeout(function(){ scheduleRun('scoresUpdated-after-ko', 520); }, 120);
    setTimeout(function(){ scheduleRun('scoresUpdated-late', 1300); }, 650);
  });
  window.addEventListener('qualifgainde:koFinalized', function(){ scheduleRun('koFinalized', 80); });

  // Filet de sécurité : si applyScoresData est accessible globalement, on le wrappe pour relancer
  // computedTeamState à la fin de son traitement, pas seulement au début de l'arrivée API.
  try {
    if (typeof applyScoresData === 'function' && !applyScoresData.__qgComputedWrapped) {
      const __qgOriginalApplyScoresData = applyScoresData;
      const __qgWrappedApplyScoresData = function(){
        const result = __qgOriginalApplyScoresData.apply(this, arguments);
        scheduleRun('after-applyScoresData', 120);
        setTimeout(function(){ scheduleRun('after-applyScoresData-late', 700); }, 260);
        return result;
      };
      __qgWrappedApplyScoresData.__qgComputedWrapped = true;
      applyScoresData = __qgWrappedApplyScoresData;
      window.applyScoresData = __qgWrappedApplyScoresData;
    }
  } catch(e) {}

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
  window.addEventListener('load', () => setTimeout(run, 650), {once:true});
  setTimeout(run, 2400);
})();
