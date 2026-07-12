
(function(){
  'use strict';

  const VERSION = '13.0.16';
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
    switzerland:{teamName:'Suisse',flag:'🇨🇭',supporterName:'Nati',heroImg:'assets/opponents/switzerland/player.webp',playerImg:'assets/opponents/switzerland/player.webp',heroPlayer:'Granit Xhaka'}, australia:{teamName:'Australie',flag:'🇦🇺'}, argentina:{teamName:'Argentine',flag:'🇦🇷',supporterName:'Albiceleste',heroImg:'assets/opponents/argentina/player.webp',playerImg:'assets/opponents/argentina/player.webp',heroPlayer:'Lionel Messi'},
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

  // V13.0.10 — aliases de clés live/API vers l'identifiant KO canonique.
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
      'qf98':'N98', 'qf-98':'N98', 'qf99':'N99', 'qf-99':'N99', 'nor-eng':'N99', 'norway-england':'N99', 'qf100':'N100', 'qf-100':'N100', 'arg-sui':'N100', 'argentina-switzerland':'N100'
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
    fr:{qf:'Qualifiés en demi-finale', live:'Encore en course', out:'Éliminés · respect', global:'Voir la page globale', quick:'', qualified:'Qualifiée', qualifiedM:'Qualifié', eliminated:'Éliminée', eliminatedM:'Éliminé', inRound:'en', next:'prochain défi', wait:'attend', vs:'ou', champion:'Champion simulé', nextMatch:'Prochain match', end:'Fin de parcours', last:'Derniers résultats', nextMatchConfirmed:'Prochain match confirmé', newsTitle:'Les Brèves du Mondial', newsLead:'Analyse, histoires fortes et signaux faibles de la phase finale.', homePill:'Phase finale · choisis ton équipe et suis son chemin jusqu’à la finale', homeKicker:'Bienvenue dans l’app mondiale', homeTitle:'Je suis supporter <span>de...</span>', homeLead:'Choisis ton équipe, suis ses résultats, son prochain adversaire, le tableau final et sa route jusqu’à la finale.', readAllNews:'Lire toutes les brèves'},
    en:{qf:'Semi-finalists', live:'Still alive', out:'Eliminated · respect', global:'Open global page', quick:'', qualified:'Qualified', qualifiedM:'Qualified', eliminated:'Eliminated', eliminatedM:'Eliminated', inRound:'for', next:'next challenge', wait:'waiting for', vs:'or', champion:'Champion', nextMatch:'Next match', end:'End of the road', last:'Last results', nextMatchConfirmed:'Next match confirmed', newsTitle:'Les Brèves du Mondial', newsLead:'Récits, analyses et tournants de la phase finale.', homePill:'Knockout stage · choose your team and follow its road to the final', homeKicker:'Welcome to the worldwide app', homeTitle:'I support <span>...</span>', homeLead:'Open your team page, results, next opponent, interactive bracket and full road to the final.', readAllNews:'Lire toutes les brèves'},
    pt:{qf:'Qualificados aos quartos', live:'Ainda em prova', out:'Eliminados · respeito', global:'Ver página global', quick:'Acesso rápido França–Marrocos', qualified:'Qualificada', qualifiedM:'Qualificado', eliminated:'Eliminada', eliminatedM:'Eliminado', inRound:'nos', next:'próximo desafio', wait:'aguarda', vs:'ou', champion:'Campeão', nextMatch:'Próximo jogo', end:'Fim do percurso', last:'Últimos resultados', nextMatchConfirmed:'Próximo jogo confirmado', newsTitle:'Notas do Mundial', newsLead:'Análises, histórias fortes e momentos-chave da fase final.', homePill:'Mata-mata · estado das equipes calculado automaticamente', homeKicker:'Bem-vindo ao app mundial', homeTitle:'Eu torço <span>por...</span>', homeLead:'Veja a página da sua equipe, resultados, próximo adversário, chave interativa e caminho até à final.', readAllNews:'Ler todas as notas'},
    es:{qf:'Clasificados a cuartos', live:'Siguen en carrera', out:'Eliminados · respeto', global:'Ver página global', quick:'Acceso rápido Francia–Marruecos', qualified:'Clasificada', qualifiedM:'Clasificado', eliminated:'Eliminada', eliminatedM:'Eliminado', inRound:'en', next:'próximo reto', wait:'espera a', vs:'o', champion:'Campeón', nextMatch:'Próximo partido', end:'Fin del recorrido', last:'Últimos resultados', nextMatchConfirmed:'Próximo partido confirmado', newsTitle:'Breves del Mundial', newsLead:'Historias, análisis y puntos de inflexión de la fase final.', homePill:'Eliminatorias · estado calculado automáticamente', homeKicker:'Bienvenido a la app mundial', homeTitle:'Soy hincha <span>de...</span>', homeLead:'Consulta la página de tu equipo, resultados, próximo rival, cuadro interactivo y camino a la final.', readAllNews:'Leer todas las breves'},
    ar:{qf:'المتأهلون إلى ربع النهائي', live:'ما زالوا في المنافسة', out:'المقصيون · احترام', global:'عرض الصفحة العامة', quick:'دخول سريع فرنسا–المغرب', qualified:'تأهلت', qualifiedM:'تأهل', eliminated:'أُقصيت', eliminatedM:'أُقصي', inRound:'إلى', next:'التحدي القادم', wait:'ينتظر', vs:'أو', champion:'البطل', nextMatch:'المباراة القادمة', end:'نهاية المشوار', last:'آخر النتائج', nextMatchConfirmed:'تم تأكيد المباراة القادمة', newsTitle:'موجز أخبار المونديال', newsLead:'تحليلات وقصص ولحظات حاسمة من الأدوار الإقصائية.', homePill:'الأدوار الإقصائية · حالة المنتخبات تُحسب تلقائياً', homeKicker:'مرحباً بك في التطبيق العالمي', homeTitle:'أنا أشجع <span>...</span>', homeLead:'تابع صفحة منتخبك ونتائجه وخصمه القادم والطريق الكامل نحو النهائي.', readAllNews:'قراءة كل الأخبار'}
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

    // V13.0.10 — état réel du moteur KO en mémoire. C'est ce que la simulation utilise.
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
  function finalizeState(s, resolved, teams){
    const lang = activeLang();
    const c = copy();
    const fem = feminine(s.key);
    if(s.status === 'eliminated'){
      const adj = fem ? c.eliminated : c.eliminatedM;
      s.statusLabel = adj + ' en ' + roundLabel(s.eliminatedRound, lang) + (s.lastMatchLabel ? ' · ' + s.lastMatchLabel : '');
      s.selectorLine = adj + ' en ' + roundLabel(s.eliminatedRound, lang);
      return;
    }
    if(s.status === 'champion') return;
    const adj = fem ? c.qualified : c.qualifiedM;
    const rd = roundLabel(s.currentRound, lang);
    const next = nextOpponentInfo(s, resolved, teams);
    s.nextOpponentLabel = next.label;
    s.nextMatchLabel = next.matchLabel;
    s.nextMatchDate = next.date;
    s.statusLabel = adj + ' en ' + rd + (next.label ? ' · ' + c.wait + ' ' + next.shortLabel : '');
    s.selectorLine = adj + ' en ' + rd + (next.label ? ' · ' + c.wait + ' ' + next.shortLabel : '');
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
    return s.replace(/^Vainqueur\s+/i,'').replace(/^Winner of\s+/i,'').replace(/^Vencedor\s+/i,'').replace(/^Ganador\s+/i,'').replace(/^الفائز من\s+/,'').replace('–', ' ou ');
  }
  function dateForMatch(id){
    const dates = {
      N94:'Mar. 7 juillet · 02h00 · heure locale', N95:'Mar. 7 juillet · 18h00 · heure locale', N96:'Mar. 7 juillet · 22h00 · heure locale',
      N97:'Jeu. 9 juillet · 22h00 · heure locale', N98:'Ven. 10 juillet · 21h00 · heure locale',
      N99:'Sam. 11 juillet · 23h00 · heure locale', N100:'Dim. 12 juillet · 03h00 · heure locale',
      N101:'Mar. 14 juillet · 21h00 · heure locale', N102:'Mer. 15 juillet · 21h00 · heure locale', N104:'Dim. 19 juillet · 21h00 · heure locale'
    };
    return dates[id] || '';
  }

  
function worldNewsHtml(worldNews){
    const lang = activeLang(), c = copy();
    const items = Array.isArray(worldNews) ? worldNews.slice().sort((a,b)=>(a.priority||99)-(b.priority||99)) : [];
    if(!items.length) return '';
    function entry(item){
      const L = (item.langs && (item.langs[lang] || item.langs.fr)) || {};
      const featured = item.type === 'analysis' || item.priority === 1;
      return `<article class="world-news-card ${featured ? 'featured' : ''}" data-news-id="${esc(item.id)}">
        <div class="world-news-media">${item.image ? `<img src="${esc(item.image)}" loading="lazy" decoding="async" alt="">` : ''}</div>
        <div class="world-news-content">
          <div class="world-news-tag">${esc(L.tag || '')}</div>
          <h3>${esc(L.title || '')}</h3>
          <p>${esc(L.body || '')}</p>
        </div>
      </article>`;
    }
    return `<section class="world-news-section" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <div class="world-news-head">
        <div>
          <div class="world-news-kicker">Mondial Pulse Editorial</div>
          <h2>${esc(c.newsTitle)}</h2>
          <p>${esc(c.newsLead)}</p>
        </div>
      </div>
      <div class="world-news-grid">${items.map(entry).join('')}</div>
    </section>`;
  }


  function worldNewsTeaserHtml(worldNews){
    const lang = activeLang(), c = copy();
    const items = Array.isArray(worldNews) ? worldNews.slice().sort((a,b)=>(a.priority||99)-(b.priority||99)) : [];
    if(!items.length) return '';
    const preview = items.slice(0,3).map(item => {
      const L = (item.langs && (item.langs[lang] || item.langs.fr)) || {};
      return `<span>${esc(L.title || '')}</span>`;
    }).join('');
    const first = items[0] || {};
    const L0 = (first.langs && (first.langs[lang] || first.langs.fr)) || {};
    return `<section class="world-news-teaser" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <div class="world-news-teaser-media">${first.image ? `<img src="${esc(first.image)}" loading="lazy" decoding="async" alt="">` : ''}</div>
      <div class="world-news-teaser-content">
        <div class="world-news-kicker">Mondial Pulse Editorial</div>
        <h2>${esc(c.newsTitle)}</h2>
        <p>${esc(c.newsLead)}</p>
        <div class="world-news-teaser-preview">${preview}</div>
        <a class="world-news-open" href="?mode=news&v=1316">${esc(c.readAllNews || c.newsTitle)}</a>
      </div>
    </section>`;
  }

  function renderNewsHub(selector, worldNews){
    if(!selector) return;
    const lang = activeLang(), c = copy();
    selector.innerHTML = `
      <div class="qg-entry-bg"></div>
      <div class="qg-entry-wrap news-hub-wrap">
        <div class="qg-entry-top">
          <div class="qg-entry-brand"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V13.0.10</span></div>
          <div class="qg-entry-pill">${esc(c.newsLead)}</div>
        </div>
        <div class="qg-entry-hero news-hub-hero">
          <div class="qg-entry-kicker">Mondial Pulse Editorial</div>
          <h1>${esc(c.newsTitle)}</h1>
          <p>${esc(c.newsLead)}</p>
        </div>
        ${worldNewsHtml(worldNews)}
        <div class="qg-entry-actions"><a class="qg-entry-action" href="?v=1316">${esc(c.global)}</a><a class="qg-entry-action" href="?team=france&v=1316">${esc(c.quick)}</a></div>
      </div>`;
  }

  function renderHome(selector, teams, computed, worldNews){
    if(!selector) return;
    const lang = activeLang(), c = copy();
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
      p.set('v','1316');
      return '?' + p.toString();
    }
    function card(s, cls){
      return `<a class="qg-team-card ${cls}" href="${esc(href(s))}" data-team="${esc(s.key)}"><span class="qg-team-flag">${esc(s.flag || teamFlag(s.key, teams))}</span><span class="qg-team-copy"><span class="qg-team-name">${esc(s.teamName || teamName(s.key, teams))}</span><span class="qg-team-line">${esc(s.selectorLine || s.statusLabel || '')}</span></span></a>`;
    }
    selector.innerHTML = `
      <div class="qg-entry-bg"></div>
      <div class="qg-entry-wrap">
        <div class="qg-entry-top">
          <div class="qg-entry-brand"><img src="assets/lion-mascotte.png" alt="Mondial Pulse"><span>Mondial Pulse 2026 · V13.0.10</span></div>
          <div class="qg-entry-pill">${esc(c.homePill)}</div>
        </div>
        <div class="qg-entry-hero">
          <div class="qg-entry-kicker">${esc(c.homeKicker)}</div>
          <h1>${c.homeTitle}</h1>
          <p>${esc(c.homeLead)}</p>
        </div>
        <div class="qg-selector-group"><h2 class="qg-selector-title">${esc(c.qf)}</h2><div class="qg-team-grid">${groups.qf.map(s=>card(s,'qf')).join('')}</div></div>
        ${groups.live.length ? `<div class="qg-selector-group"><h2 class="qg-selector-title">${esc(c.live)}</h2><div class="qg-team-grid">${groups.live.map(s=>card(s,'live')).join('')}</div></div>` : ''}
        <div class="qg-selector-group"><h2 class="qg-selector-title">${esc(c.out)}</h2><div class="qg-team-grid">${groups.out.map(s=>card(s,'out')).join('')}</div></div>
        ${worldNewsTeaserHtml(worldNews)}
        <div class="qg-entry-actions"><a class="qg-entry-action" href="?mode=global&v=1316">${esc(c.global)}</a></div>
      </div>`;
  }


function resultLetter(result){
    if(!result) return '';
    const r = String(result).toUpperCase();
    if(r === 'V' || r === 'W') return 'V';
    if(r === 'D' || r === 'L') return 'D';
    if(r === 'N' || r === 'DRAW') return 'N';
    return r[0] || '';
  }
  function teamImage(key, teams){
    const meta = teamMeta(key, teams);
    return meta.heroImg || meta.playerImg || meta.bannerImg || 'assets/lion-mascotte.png';
  }
  function patchSideCard(card, key, teams, teamResults){
    if(!card || !key) return;
    const meta = teamMeta(key, teams);
    card.className = 'player-side ' + key.replace(/_/g,'-');
    card.setAttribute('aria-label', 'Forme récente de ' + (meta.teamName || teamName(key, teams)));
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
    if(sideSub) sideSub.textContent = copy().last || 'Derniers résultats';
    const list = card.querySelector('.form-list');
    if(list){
      const rows = ((teamResults && teamResults[key]) || []).slice(-4);
      if(rows.length){
        list.innerHTML = rows.map(r => `<div class="form-row"><span>${esc(r.label || '')}</span><strong>${esc(resultLetter(r.result) || '')}</strong></div>`).join('');
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
    if(sides[0]) patchSideCard(sides[0], match.home || activeTeam, teams, teamResults || {});
    if(sides[1]) patchSideCard(sides[1], match.away || null, teams, teamResults || {});
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
    if(selector && !activeTeam && mode === 'news') renderNewsHub(selector, worldNews || []);
    else if(selector && !activeTeam && mode !== 'global') renderHome(selector, teams, computed, worldNews || []);
    if(activeTeam) updateTeamPage(activeTeam.toLowerCase(), teams, computed, teamResults || {});
  }

  let __qgAutoStateTimer = null;
  function scheduleRun(reason, delay){
    clearTimeout(__qgAutoStateTimer);
    __qgAutoStateTimer = setTimeout(function(){
      run().catch(function(e){ console.warn('[QG V13.0.10] computedTeamState refresh skipped', reason, e); });
    }, delay == null ? 160 : delay);
  }

  window.QG_AUTO_TEAM_STATE_ENGINE = {run, buildState, scheduleRun};

  // V13.0.10 — rebrancher la home sur le vrai flux live.
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
