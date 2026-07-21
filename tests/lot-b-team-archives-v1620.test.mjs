import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const code=fs.readFileSync(path.join(root,'assets/js/team-page-v1620.js'),'utf8');
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p.split('?')[0]),'utf8'));
function classes(){const values=new Set();return{add:(...items)=>items.forEach(item=>values.add(item)),remove:(...items)=>items.forEach(item=>values.delete(item)),contains:item=>values.has(item)}}
async function render(team,lang){
  let html='';
  const body={set innerHTML(value){html=value},get innerHTML(){return html}};
  const document={readyState:'complete',body,documentElement:{lang:'fr',dir:'ltr',classList:classes()},title:'',addEventListener(){}};
  const context={console,URLSearchParams,location:{search:`?team=${team}&lang=${lang}&v=1620`},document,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},fetch:async(url)=>({ok:true,json:async()=>readJson(url)}),setTimeout,clearTimeout};
  context.window=context; context.dispatchEvent=()=>{};
  vm.createContext(context); vm.runInContext(code,context);
  await new Promise(resolve=>setTimeout(resolve,60));
  return html;
}
const archive=readJson('data/world-cup-archive.json');
if(archive.version!=='16.1.2'||archive.frozen!==true) throw new Error('Archive mondiale figée de référence absente');
if(archive.groups.length!==12) throw new Error('Les 12 groupes ne sont pas présents');
if(archive.bestThird.length!==8) throw new Error('Les 8 meilleurs troisièmes ne sont pas présents');
if(archive.knockout.length!==32) throw new Error('Le tableau final doit contenir 32 matches');
if(archive.knockout.find(x=>x.id==='N104')?.winner!=='ESP') throw new Error('Champion final incorrect');
if(/simulat|pronostic|choisis le vainqueur|champion simulé/i.test(code)) throw new Error('Vocabulaire de simulation présent dans le renderer V16.2.0');
const teams=Object.keys(readJson('data/teams.json')).sort();
const langs=['fr','en','es','pt','ar'];
let referenceArchive='';
for(const team of teams){
  for(const lang of langs){
    const html=await render(team,lang);
    if(!html.includes('qg-v1611-team-root')) throw new Error(`${team}/${lang}: root missing`);
    if(!html.includes('PASSION FOOT - SUIVI DES LIONS')) throw new Error(`${team}/${lang}: nouvelle marque absente`);
    if(html.includes('SUIVI DES LIONS · V')) throw new Error(`${team}/${lang}: version technique encore affichée dans la marque`);
    if((html.match(/class="qg16-table-section"/g)||[]).length!==3) throw new Error(`${team}/${lang}: résultats du pays incomplets`);
    if((html.match(/data-archive-table=/g)||[]).length!==3) throw new Error(`${team}/${lang}: trois archives mondiales manquantes`);
    const story=html.indexOf('class="qg16-story"');
    const groups=html.indexOf('data-archive-table="groups"');
    const third=html.indexOf('data-archive-table="best-third"');
    const bracket=html.indexOf('data-archive-table="knockout"');
    const nav=html.indexOf('class="qg16-bottom-nav"');
    if(!(story>0 && story<groups && groups<third && third<bracket && bracket<nav)) throw new Error(`${team}/${lang}: ordre des sections incorrect`);
    if(!html.includes('data-match-id="N104"')||!html.includes('class="qg16-ko-champion"')) throw new Error(`${team}/${lang}: finale figée absente`);
    if(lang==='fr'){
      const start=html.indexOf('data-archive-table="groups"');
      const end=html.indexOf('class="qg16-bottom-nav"');
      const section=html.slice(start,end);
      if(!referenceArchive) referenceArchive=section;
      else if(section!==referenceArchive) throw new Error(`${team}: les trois tableaux globaux diffèrent selon le pays`);
    }
  }
}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!index.includes('assets/js/team-page-v1620.js?v=1620')) throw new Error('Renderer V16.2.0 non chargé');
if(!index.includes('assets/css/team-page-v1620.css?v=1620')) throw new Error('CSS V16.2.0 non chargé');
console.log(`PASS Lot B V16.2.0 — ${teams.length*langs.length} pages, récit avant trois archives figées identiques`);
