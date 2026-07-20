(function(){
  'use strict';
  const params = new URLSearchParams(location.search);
  const teamId = String(params.get('team') || '').toLowerCase();
  if(!teamId) return;
  const allowedLangs = ['fr','en','es','pt','ar'];
  let lang = String(params.get('lang') || '').toLowerCase();
  const defaultByTeam = {england:'en',spain:'es',argentina:'es',brazil:'pt'};
  if(!allowedLangs.includes(lang)) lang = defaultByTeam[teamId] || 'fr';
  const rtl = lang === 'ar';
  const T = {
    fr:{home:'Accueil',parent:'Mémoire du Mondial',group:'Phase de groupes',knockout:'Phase à élimination directe',allScores:'Tous les scores du parcours',round:'Tour',match:'Match',score:'Score',outcome:'Issue',results:'Parcours dans le Mondial',story:'Le récit',stats:'Bilan du tournoi',played:'matchs',wins:'victoires',draws:'nuls',losses:'défaites',goals:'buts marqués',conceded:'buts encaissés',unavailable:'Informations indisponibles',last:'Dernier match',change:'Changer d’équipe'},
    en:{home:'Home',parent:'World Cup archive',group:'Group stage',knockout:'Knockout stage',allScores:'Complete tournament journey',round:'Round',match:'Match',score:'Score',outcome:'Result',results:'World Cup journey',story:'The story',stats:'Tournament record',played:'matches',wins:'wins',draws:'draws',losses:'losses',goals:'goals scored',conceded:'goals conceded',unavailable:'Information unavailable',last:'Last match',change:'Change team'},
    es:{home:'Inicio',parent:'Memoria del Mundial',group:'Fase de grupos',knockout:'Fase eliminatoria',allScores:'Todos los resultados',round:'Ronda',match:'Partido',score:'Marcador',outcome:'Resultado',results:'Trayectoria en el Mundial',story:'La historia',stats:'Balance del torneo',played:'partidos',wins:'victorias',draws:'empates',losses:'derrotas',goals:'goles marcados',conceded:'goles recibidos',unavailable:'Información no disponible',last:'Último partido',change:'Cambiar equipo'},
    pt:{home:'Início',parent:'Memória da Copa',group:'Fase de grupos',knockout:'Mata-mata',allScores:'Todos os resultados',round:'Fase',match:'Jogo',score:'Placar',outcome:'Resultado',results:'Caminho na Copa',story:'A história',stats:'Balanço do torneio',played:'jogos',wins:'vitórias',draws:'empates',losses:'derrotas',goals:'gols marcados',conceded:'gols sofridos',unavailable:'Informação indisponível',last:'Último jogo',change:'Mudar equipe'},
    ar:{home:'الرئيسية',parent:'ذاكرة كأس العالم',group:'دور المجموعات',knockout:'الأدوار الإقصائية',allScores:'جميع نتائج المشوار',round:'الدور',match:'المباراة',score:'النتيجة',outcome:'الحصيلة',results:'مشوار كأس العالم',story:'القصة',stats:'حصيلة البطولة',played:'مباريات',wins:'انتصارات',draws:'تعادلات',losses:'هزائم',goals:'أهداف مسجلة',conceded:'أهداف مستقبلة',unavailable:'المعلومات غير متاحة',last:'آخر مباراة',change:'تغيير المنتخب'}
  }[lang];
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fetchJson = async url => { const r=await fetch(url+'?v=1610',{cache:'no-store'}); if(!r.ok) throw new Error(url); return r.json(); };
  const localizedPath = (name) => lang==='fr' ? `data/${name}.json` : `data/${lang}/${name}.json`;
  function resultLabel(r){ return r[`label_${lang}`] || r.label || T.unavailable; }
  function resultNote(r){ return r[`note_${lang}`] || r.note || ''; }
  function parseScore(label){
    const nums=String(label).match(/(\d+)\s*[–-]\s*(\d+)/); return nums ? [Number(nums[1]),Number(nums[2])] : null;
  }
  function deriveStats(results, teamName){
    let w=0,d=0,l=0,gf=0,ga=0;
    results.forEach(r=>{
      if(r.result==='V') w++; else if(r.result==='N') d++; else if(r.result==='D') l++;
      const sc=parseScore(r.label); if(!sc) return;
      const starts=String(r.label).toLowerCase().startsWith(String(teamName).toLowerCase());
      gf += starts?sc[0]:sc[1]; ga += starts?sc[1]:sc[0];
    });
    return {played:results.length,w,d,l,gf,ga};
  }
  function theme(meta){ return {p:meta.primary||'#16a34a',s:meta.secondary||'#0b1220',a:meta.accent||'#facc15'}; }
  function statusIcon(meta){ if(meta.status==='champion'||meta.tournamentStatus==='champion') return '🏆'; if(meta.status==='silver'||meta.tournamentStatus==='runner_up') return '🥈'; if(meta.status==='bronze') return '🥉'; return meta.flag||'⚽'; }
  function languageLinks(){ return allowedLangs.map(x=>`<a class="qg55-lang ${x===lang?'active':''}" href="?team=${encodeURIComponent(teamId)}&lang=${x}&v=1550">${x.toUpperCase()}</a>`).join(''); }
  function resultCards(results){
    if(!results.length) return `<div class="qg55-empty">${esc(T.unavailable)}</div>`;
    return results.map((r,i)=>`<article class="qg55-result ${r.result==='V'?'win':r.result==='D'?'loss':'draw'}"><span class="qg55-round">${esc(r.matchId||`M${i+1}`)}</span><strong>${esc(resultLabel(r))}</strong><small>${esc(resultNote(r))}</small></article>`).join('');
  }

  function phaseOf(r){const id=String(r.matchId||'');return id.startsWith('G-')?'group':'knockout'}
  function scoreOf(r){const m=String(resultLabel(r)).match(/(\d+)\s*[–-]\s*(\d+)/);return m?`${m[1]}–${m[2]}`:'—'}
  function matchWithoutScore(r){return String(resultLabel(r)).replace(/\s+\d+\s*[–-]\s*\d+.*/, '').trim() || resultLabel(r)}
  function outcomeOf(r){const x=String(r.result||'').toUpperCase();return x==='V'?'✅':x==='D'?'❌':'➖'}
  function tableHtml(title, rows){
    const body=rows.length?rows.map(r=>`<tr><td>${esc(r.matchId||'—')}</td><td>${esc(matchWithoutScore(r))}</td><td><strong>${esc(scoreOf(r))}</strong></td><td>${outcomeOf(r)} ${esc(resultNote(r))}</td></tr>`).join(''):`<tr><td colspan="4">${esc(T.unavailable)}</td></tr>`;
    return `<section class="qg55-table-card"><h2>${esc(title)}</h2><div class="qg55-table-scroll"><table><thead><tr><th>${esc(T.round)}</th><th>${esc(T.match)}</th><th>${esc(T.score)}</th><th>${esc(T.outcome)}</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
  }

  function storyHtml(story){
    if(!story) return `<div class="qg55-empty">${esc(T.unavailable)}</div>`;
    const ps=(story.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('');
    const tl=(story.timeline||[]).length?`<div class="qg55-timeline">${story.timeline.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`:'';
    return `<h3>${esc(story.title||T.story)}</h3>${story.subtitle?`<p class="qg55-subtitle">${esc(story.subtitle)}</p>`:''}${ps}${tl}`;
  }
  window.renderTeamPage = async function renderTeamPage(requestedTeamId=teamId, requestedLang=lang){
    document.documentElement.lang=requestedLang; document.documentElement.dir=rtl?'rtl':'ltr';
    document.documentElement.classList.add('qg-v1550-team-active');
    document.body.innerHTML='<main id="qg-v1550-team-root"><div class="qg55-loading">Loading…</div></main>';
    try{
      const [baseTeams, locTeams, resultsData, baseStories, locStories] = await Promise.all([
        fetchJson('data/teams.json'),
        fetchJson(localizedPath('teams')).catch(()=>({})),
        fetchJson('data/team-results.json').catch(()=>({})),
        fetchJson('data/stories.json').catch(()=>({})),
        fetchJson(localizedPath('stories')).catch(()=>({}))
      ]);
      const meta=Object.assign({},baseTeams[requestedTeamId]||{},locTeams[requestedTeamId]||{});
      if(!meta.teamName) throw new Error('unknown-team');
      const results=Array.isArray(resultsData[requestedTeamId])?resultsData[requestedTeamId]:[];
      const story=Object.assign({},baseStories[requestedTeamId]||{},locStories[requestedTeamId]||{});
      const st=deriveStats(results, meta.teamName);
      const th=theme(meta); const last=results[results.length-1];
      const banner=meta.bannerImg||meta.heroImg||meta.playerImg||'';
      const player=meta.heroImg||meta.playerImg||banner;
      document.title=`${meta.teamName} · Mondial 2026 · V16.1.0`;
      document.body.innerHTML=`<main id="qg-v1550-team-root" style="--qg55-primary:${esc(th.p)};--qg55-secondary:${esc(th.s)};--qg55-accent:${esc(th.a)}">
        <header class="qg55-topbar"><nav class="qg55-breadcrumb"><a class="qg55-home" href="/?v=1610">⌂ ${esc(T.home)}</a><a class="qg55-parent" href="/?mode=global&v=1610">← ${esc(T.parent)}</a></nav><div class="qg55-langs">${languageLinks()}</div></header>
        <section class="qg55-hero" ${banner?`style="background-image:linear-gradient(90deg,#030712ee 0%,#030712b8 52%,#030712e8 100%),url('${esc(banner)}')"`:''}>
          <div class="qg55-hero-copy"><span class="qg55-medal">${statusIcon(meta)}</span><p class="qg55-kicker">${esc(meta.supporterName||'WORLD CUP 2026')}</p><h1>${esc(meta.flag||'')} ${esc(meta.teamName)}</h1><h2>${esc(meta.statusLabel||meta.selectorLine||T.unavailable)}</h2><p>${esc(meta.heroSubtitle||meta.tagline||T.unavailable)}</p></div>
          ${player?`<img class="qg55-player" src="${esc(player)}" alt="${esc(meta.heroPlayer||meta.teamName)}">`:''}
        </section>
        <section class="qg55-shell">
          <div class="qg55-last"><span>${esc(T.last)}</span><strong>${last?esc(resultLabel(last)):esc(T.unavailable)}</strong><small>${last?esc(resultNote(last)):''}</small></div>
          <h2 class="qg55-section-title">${esc(T.stats)}</h2>
          <div class="qg55-stats"><div><b>${st.played}</b><span>${esc(T.played)}</span></div><div><b>${st.w}</b><span>${esc(T.wins)}</span></div><div><b>${st.d}</b><span>${esc(T.draws)}</span></div><div><b>${st.l}</b><span>${esc(T.losses)}</span></div><div><b>${st.gf}</b><span>${esc(T.goals)}</span></div><div><b>${st.ga}</b><span>${esc(T.conceded)}</span></div></div>
          <div class="qg55-tables">${tableHtml(T.group,results.filter(r=>phaseOf(r)==='group'))}${tableHtml(T.knockout,results.filter(r=>phaseOf(r)==='knockout'))}${tableHtml(T.allScores,results)}</div>
          <section class="qg55-story"><h2 class="qg55-section-title">${esc(T.story)}</h2>${storyHtml(story)}</section>
        </section>
      </main>`;
      document.documentElement.classList.add('qg-team-rendered');
      window.dispatchEvent(new CustomEvent('qg:v1550TeamRendered',{detail:{teamId:requestedTeamId,lang:requestedLang}}));
    }catch(err){
      document.body.innerHTML=`<main id="qg-v1550-team-root"><header class="qg55-topbar"><a class="qg55-home" href="/?v=1610">← ${esc(T.home)}</a></header><div class="qg55-fatal"><h1>${esc(T.unavailable)}</h1><p>${esc(requestedTeamId)}</p></div></main>`;
    }
  };
  // Attend que tous les scripts historiques aient fini leur boot puis prend définitivement la main.
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>window.renderTeamPage(),{once:true}); else window.renderTeamPage();
})();
