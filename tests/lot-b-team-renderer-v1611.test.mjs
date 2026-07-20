import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const code=fs.readFileSync(path.join(root,'assets/js/team-page-v1611.js'),'utf8');
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p.split('?')[0]),'utf8'));
function classes(){const values=new Set();return{add:(...items)=>items.forEach(item=>values.add(item)),remove:(...items)=>items.forEach(item=>values.delete(item)),contains:item=>values.has(item)}}
async function render(team,lang){
  let html='';
  const body={set innerHTML(value){html=value},get innerHTML(){return html}};
  const document={readyState:'complete',body,documentElement:{lang:'fr',dir:'ltr',classList:classes()},title:'',addEventListener(){}};
  const context={console,URLSearchParams,location:{search:`?team=${team}&lang=${lang}&v=1611`},document,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},fetch:async(url)=>({ok:true,json:async()=>readJson(url)}),setTimeout,clearTimeout};
  context.window=context; context.dispatchEvent=()=>{};
  vm.createContext(context); vm.runInContext(code,context);
  await new Promise(resolve=>setTimeout(resolve,50));
  return html;
}
const teams=Object.keys(readJson('data/teams.json')).sort();
const langs=['fr','en','es','pt','ar'];
for(const team of teams){
  for(const lang of langs){
    const html=await render(team,lang);
    if(!html.includes('qg-v1611-team-root')) throw new Error(`${team}/${lang}: root missing`);
    if((html.match(/class="qg16-table-section"/g)||[]).length !== 3) throw new Error(`${team}/${lang}: three tables missing`);
    if(!/data-table="group"[\s\S]*?<tbody>[\s\S]*?<tr class="/.test(html)) throw new Error(`${team}/${lang}: group memory empty`);
    if(!/data-table="knockout"[\s\S]*?<tbody>[\s\S]*?<tr class="/.test(html)) throw new Error(`${team}/${lang}: knockout memory empty`);
    if(!html.includes('?mode=worldcup')) throw new Error(`${team}/${lang}: parent navigation missing`);
    if(!html.includes('/?v=1611')) throw new Error(`${team}/${lang}: home navigation missing`);
    if(team!=='senegal' && /senegal-team|Belgique\s*[–-]\s*Sénégal|Belgique vs Sénégal|Mémoire des Gaïndés/i.test(html)) throw new Error(`${team}/${lang}: Senegal fallback detected`);
    if(team!=='senegal' && /assets\/senegal-team/i.test(html)) throw new Error(`${team}/${lang}: Senegal asset detected`);
  }
}
const computed=fs.readFileSync(path.join(root,'assets/js/computed-team-state.js'),'utf8');
const runBlock=computed.slice(computed.indexOf('async function run()'),computed.indexOf('let __qgAutoStateTimer'));
if(/updateTeamPage\s*\(/.test(runBlock)) throw new Error('Lot B: legacy updateTeamPage still called by public route pipeline');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!index.includes('assets/js/team-page-v1611.js?v=1611')) throw new Error('Lot B: new renderer not loaded');
if(index.includes('assets/js/team-page-v1550.js')) throw new Error('Lot B: old renderer still loaded');
console.log(`PASS Lot B — ${teams.length*langs.length} team/language combinations, three neutral tables`);
