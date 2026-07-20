(function(){
  'use strict';

  const params = new URLSearchParams(location.search);
  const teamId = String(params.get('team') || '').toLowerCase();
  if (!teamId) return;

  const VERSION = '16.1.1';
  const TOKEN = '1611';
  const allowedLangs = ['fr','en','es','pt','ar'];
  const defaultByTeam = {england:'en',spain:'es',argentina:'es',brazil:'pt'};
  let lang = String(params.get('lang') || '').toLowerCase();
  if (!allowedLangs.includes(lang)) lang = defaultByTeam[teamId] || 'fr';

  const copy = {
    fr:{home:'Accueil',parent:'Mémoire du Mondial',change:'Toutes les équipes',journey:'Mémoire du parcours',stats:'Bilan du tournoi',story:'Le récit',group:'Phase de groupes',knockout:'Phase à élimination directe',all:'Tous les scores du parcours',round:'Tour',match:'Rencontre',result:'Résultat',note:'Repère',played:'matchs',wins:'victoires',draws:'nuls',losses:'défaites',goals:'buts marqués',conceded:'buts encaissés',last:'Dernier match',unavailable:'Informations indisponibles pour cette équipe.',empty:'Aucun match disponible dans cette partie du parcours.'},
    en:{home:'Home',parent:'World Cup memory',change:'All teams',journey:'Journey memory',stats:'Tournament record',story:'The story',group:'Group stage',knockout:'Knockout stage',all:'All journey scores',round:'Round',match:'Match',result:'Result',note:'Context',played:'matches',wins:'wins',draws:'draws',losses:'losses',goals:'goals scored',conceded:'goals conceded',last:'Last match',unavailable:'Information unavailable for this team.',empty:'No match is available for this part of the journey.'},
    es:{home:'Inicio',parent:'Memoria del Mundial',change:'Todos los equipos',journey:'Memoria del recorrido',stats:'Balance del torneo',story:'La historia',group:'Fase de grupos',knockout:'Fase eliminatoria',all:'Todos los resultados',round:'Ronda',match:'Partido',result:'Resultado',note:'Contexto',played:'partidos',wins:'victorias',draws:'empates',losses:'derrotas',goals:'goles marcados',conceded:'goles recibidos',last:'Último partido',unavailable:'Información no disponible para este equipo.',empty:'No hay partidos disponibles para esta parte del recorrido.'},
    pt:{home:'Início',parent:'Memória da Copa',change:'Todas as equipes',journey:'Memória do percurso',stats:'Balanço do torneio',story:'A história',group:'Fase de grupos',knockout:'Mata-mata',all:'Todos os resultados',round:'Fase',match:'Jogo',result:'Resultado',note:'Contexto',played:'jogos',wins:'vitórias',draws:'empates',losses:'derrotas',goals:'gols marcados',conceded:'gols sofridos',last:'Último jogo',unavailable:'Informação indisponível para esta equipe.',empty:'Nenhum jogo disponível nesta parte do percurso.'},
    ar:{home:'الرئيسية',parent:'ذاكرة كأس العالم',change:'كل المنتخبات',journey:'ذاكرة المشوار',stats:'حصيلة البطولة',story:'القصة',group:'دور المجموعات',knockout:'الأدوار الإقصائية',all:'كل نتائج المشوار',round:'الدور',match:'المباراة',result:'النتيجة',note:'السياق',played:'مباريات',wins:'انتصارات',draws:'تعادلات',losses:'هزائم',goals:'أهداف مسجلة',conceded:'أهداف مستقبلة',last:'آخر مباراة',unavailable:'المعلومات غير متاحة لهذا المنتخب.',empty:'لا توجد مباريات متاحة في هذا الجزء من المشوار.'}
  }[lang];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fetchJson = async (url) => {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}v=${TOKEN}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`fetch:${url}`);
    return response.json();
  };
  const localizedPath = (name) => lang === 'fr' ? `data/${name}.json` : `data/${lang}/${name}.json`;
  const labelFor = (row) => row?.[`label_${lang}`] || row?.label || '';
  const noteFor = (row) => row?.[`note_${lang}`] || row?.note || '';

  function parseScore(label){
    const match = String(label || '').match(/(\d+)\s*[–-]\s*(\d+)/);
    return match ? [Number(match[1]), Number(match[2])] : null;
  }
  function resultCode(row){
    const raw = String(row?.result || '').toUpperCase();
    if (lang === 'en') return raw === 'V' ? 'W' : raw === 'N' ? 'D' : raw === 'D' ? 'L' : raw;
    return raw;
  }
  function resultClass(row){
    const raw = String(row?.result || '').toUpperCase();
    return raw === 'V' || raw === 'W' ? 'win' : raw === 'N' || raw === 'DRAW' ? 'draw' : 'loss';
  }
  function roundKey(row, index){
    const id = String(row?.matchId || '').toUpperCase();
    if (id.startsWith('G-')) return 'group';
    if (/^N(?:7[3-9]|8[0-8])$/.test(id)) return 'r32';
    if (/^N(?:89|9[0-6])$/.test(id)) return 'r16';
    if (/^N(?:97|98|99|100)$/.test(id)) return 'qf';
    if (/^N10[12]$/.test(id)) return 'sf';
    if (id === 'N103') return 'third';
    if (id === 'N104') return 'final';
    return index < 3 ? 'group' : 'r32';
  }
  function roundLabel(key){
    const all = {
      fr:{group:'Phase de groupes',r32:'Seizièmes de finale',r16:'Huitièmes de finale',qf:'Quarts de finale',sf:'Demi-finales',third:'Match pour la 3e place',final:'Finale'},
      en:{group:'Group stage',r32:'Round of 32',r16:'Round of 16',qf:'Quarter-finals',sf:'Semi-finals',third:'Third-place play-off',final:'Final'},
      es:{group:'Fase de grupos',r32:'Dieciseisavos',r16:'Octavos',qf:'Cuartos de final',sf:'Semifinales',third:'Partido por el tercer puesto',final:'Final'},
      pt:{group:'Fase de grupos',r32:'16 avos de final',r16:'Oitavas de final',qf:'Quartas de final',sf:'Semifinais',third:'Disputa do terceiro lugar',final:'Final'},
      ar:{group:'دور المجموعات',r32:'دور الـ32',r16:'دور الـ16',qf:'ربع النهائي',sf:'نصف النهائي',third:'مباراة المركز الثالث',final:'النهائي'}
    };
    return (all[lang] || all.fr)[key] || key;
  }
  function splitRows(rows){
    const enriched = rows.map((row,index) => ({...row, __round:roundKey(row,index), __index:index}));
    return {
      all: enriched,
      group: enriched.filter((row) => row.__round === 'group'),
      knockout: enriched.filter((row) => row.__round !== 'group')
    };
  }
  function deriveStats(rows, teamNames){
    const names=(Array.isArray(teamNames)?teamNames:[teamNames]).filter(Boolean).map(name=>String(name).toLowerCase().trim());
    let wins=0,draws=0,losses=0,gf=0,ga=0;
    rows.forEach((row) => {
      const raw = String(row.result || '').toUpperCase();
      if (raw === 'V' || raw === 'W') wins += 1;
      else if (raw === 'N' || raw === 'DRAW') draws += 1;
      else if (raw === 'D' || raw === 'L') losses += 1;
      const score = parseScore(labelFor(row));
      if (!score) return;
      const localized=labelFor(row).toLowerCase().trim(), base=String(row.label||'').toLowerCase().trim();
      const starts = names.some(name => localized.startsWith(name) || base.startsWith(name));
      gf += starts ? score[0] : score[1];
      ga += starts ? score[1] : score[0];
    });
    return {played:rows.length,wins,draws,losses,gf,ga};
  }
  function theme(meta){
    return {primary:meta.primary || '#168b4c', secondary:meta.secondary || '#07111f', accent:meta.accent || '#f5c842'};
  }
  function medal(meta){
    const status = String(meta.tournamentStatus || meta.status || '').toLowerCase();
    if (status === 'champion') return '🏆';
    if (status === 'runner_up' || status === 'silver') return '🥈';
    if (status === 'bronze') return '🥉';
    return meta.flag || '⚽';
  }
  function languageLinks(){
    return allowedLangs.map((code) => {
      const href = `?team=${encodeURIComponent(teamId)}&lang=${code}&v=${TOKEN}`;
      return `<a class="qg16-lang ${code === lang ? 'active' : ''}" href="${href}" hreflang="${code}">${code.toUpperCase()}</a>`;
    }).join('');
  }
  function tableHtml(rows, title, key){
    const body = rows.length ? rows.map((row) => `<tr class="${resultClass(row)}">
      <td data-label="${esc(copy.round)}"><span class="qg16-round">${esc(roundLabel(row.__round))}</span></td>
      <td data-label="${esc(copy.match)}"><strong>${esc(labelFor(row))}</strong></td>
      <td data-label="${esc(copy.result)}"><span class="qg16-result-code">${esc(resultCode(row))}</span></td>
      <td data-label="${esc(copy.note)}">${esc(noteFor(row))}</td>
    </tr>`).join('') : `<tr><td colspan="4" class="qg16-empty">${esc(copy.empty)}</td></tr>`;
    return `<section class="qg16-table-section" data-table="${esc(key)}"><div class="qg16-section-head"><span>${esc(copy.journey)}</span><h2>${esc(title)}</h2></div><div class="qg16-table-scroll"><table><thead><tr><th>${esc(copy.round)}</th><th>${esc(copy.match)}</th><th>${esc(copy.result)}</th><th>${esc(copy.note)}</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
  }
  function storyHtml(story){
    if (!story || (!story.title && !(story.paragraphs || []).length)) return `<div class="qg16-empty">${esc(copy.unavailable)}</div>`;
    return `<div class="qg16-story-copy"><h3>${esc(story.title || copy.story)}</h3>${story.subtitle ? `<p class="qg16-story-subtitle">${esc(story.subtitle)}</p>` : ''}${(story.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${(story.timeline || []).length ? `<div class="qg16-timeline">${story.timeline.map((item) => `<span>${esc(item)}</span>`).join('')}</div>` : ''}</div>`;
  }

  async function renderTeamPage(){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.add('qg-v1611-team-route','qg-v1611-team-owned');
    document.body.innerHTML = '<main id="qg-v1611-team-root"><div class="qg16-loading">Chargement de la mémoire du parcours…</div></main>';
    try {
      const [baseTeams, localizedTeams, resultsData, baseStories, localizedStories] = await Promise.all([
        fetchJson('data/teams.json'),
        fetchJson(localizedPath('teams')).catch(() => ({})),
        fetchJson('data/team-results.json').catch(() => ({})),
        fetchJson('data/stories.json').catch(() => ({})),
        fetchJson(localizedPath('stories')).catch(() => ({}))
      ]);
      const meta = Object.assign({}, baseTeams[teamId] || {}, localizedTeams[teamId] || {});
      if (!meta.teamName) throw new Error('unknown-team');
      const rows = Array.isArray(resultsData[teamId]) ? resultsData[teamId] : [];
      const groups = splitRows(rows);
      const stats = deriveStats(rows, [meta.teamName, baseTeams[teamId]?.teamName]);
      const story = Object.assign({}, baseStories[teamId] || {}, localizedStories[teamId] || {});
      const palette = theme(meta);
      const banner = meta.bannerImg || meta.heroImg || meta.playerImg || '';
      const portrait = meta.heroImg || meta.playerImg || '';
      const last = rows.at(-1);
      document.title = `${meta.teamName} · Mémoire du Mondial 2026 · V${VERSION}`;
      document.body.innerHTML = `<main id="qg-v1611-team-root" style="--qg16-primary:${esc(palette.primary)};--qg16-secondary:${esc(palette.secondary)};--qg16-accent:${esc(palette.accent)}">
        <header class="qg16-page-header">
          <a class="qg16-brand" href="/?v=${TOKEN}"><img src="assets/lion-mascotte.png" alt="Suivi des Lions"><span><small>SUIVI DES LIONS · V${VERSION}</small><strong>${esc(copy.home)}</strong></span></a>
          <nav class="qg16-breadcrumb" aria-label="Fil d’Ariane"><a href="/?v=${TOKEN}">${esc(copy.home)}</a><span>›</span><a href="?mode=worldcup&v=${TOKEN}">${esc(copy.parent)}</a><span>›</span><b>${esc(meta.teamName)}</b></nav>
          <div class="qg16-language-nav">${languageLinks()}</div>
        </header>
        <section class="qg16-team-hero" ${banner ? `style="background-image:linear-gradient(90deg,#020617f2 0%,#020617c4 52%,#020617ee 100%),url('${esc(banner)}')"` : ''}>
          <div class="qg16-team-hero-copy"><span class="qg16-medal">${medal(meta)}</span><p>${esc(meta.supporterName || 'COUPE DU MONDE 2026')}</p><h1>${esc(meta.flag || '')} ${esc(meta.teamName)}</h1><h2>${esc(meta.statusLabel || meta.selectorLine || copy.unavailable)}</h2><div>${esc(meta.heroSubtitle || meta.tagline || '')}</div></div>
          ${portrait ? `<img class="qg16-team-player" src="${esc(portrait)}" alt="${esc(meta.heroPlayer || meta.teamName)}">` : ''}
        </section>
        <section class="qg16-team-shell">
          <div class="qg16-last-match"><span>${esc(copy.last)}</span><strong>${last ? esc(labelFor(last)) : esc(copy.unavailable)}</strong><small>${last ? esc(noteFor(last)) : ''}</small></div>
          <div class="qg16-section-head"><span>COUPE DU MONDE 2026</span><h2>${esc(copy.stats)}</h2></div>
          <div class="qg16-stats"><div><b>${stats.played}</b><span>${esc(copy.played)}</span></div><div><b>${stats.wins}</b><span>${esc(copy.wins)}</span></div><div><b>${stats.draws}</b><span>${esc(copy.draws)}</span></div><div><b>${stats.losses}</b><span>${esc(copy.losses)}</span></div><div><b>${stats.gf}</b><span>${esc(copy.goals)}</span></div><div><b>${stats.ga}</b><span>${esc(copy.conceded)}</span></div></div>
          ${tableHtml(groups.group, copy.group, 'group')}
          ${tableHtml(groups.knockout, copy.knockout, 'knockout')}
          ${tableHtml(groups.all, copy.all, 'all')}
          <section class="qg16-story"><div class="qg16-section-head"><span>ARCHIVES</span><h2>${esc(copy.story)}</h2></div>${storyHtml(story)}</section>
          <nav class="qg16-bottom-nav"><a href="?mode=worldcup&v=${TOKEN}">← ${esc(copy.parent)}</a><a href="/?v=${TOKEN}">${esc(copy.home)}</a></nav>
        </section>
      </main>`;
      document.documentElement.classList.add('qg-team-rendered');
      window.dispatchEvent(new CustomEvent('qg:v1611TeamRendered',{detail:{teamId,lang}}));
    } catch (error) {
      console.error('[Suivi des Lions V16.1.1 team renderer]', error);
      document.body.innerHTML = `<main id="qg-v1611-team-root"><header class="qg16-page-header"><a class="qg16-brand" href="/?v=${TOKEN}">← ${esc(copy.home)}</a><nav class="qg16-breadcrumb"><a href="?mode=worldcup&v=${TOKEN}">${esc(copy.parent)}</a></nav></header><section class="qg16-fatal"><h1>${esc(copy.unavailable)}</h1><p>${esc(teamId)}</p></section></main>`;
    }
  }

  window.renderTeamPageV1611 = renderTeamPage;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderTeamPage, {once:true});
  else renderTeamPage();
})();
