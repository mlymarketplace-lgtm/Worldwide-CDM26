import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const code=fs.readFileSync(path.join(root,'assets/js/team-page-v1550.js'),'utf8');
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p.split('?')[0]),'utf8'));
function classes(){const s=new Set();return{add:(...x)=>x.forEach(v=>s.add(v)),remove:(...x)=>x.forEach(v=>s.delete(v)),contains:x=>s.has(x)}}
async function render(team,lang){
  let html='';
  const body={set innerHTML(v){html=v},get innerHTML(){return html}};
  const document={readyState:'complete',body,documentElement:{lang:'fr',dir:'ltr',classList:classes()},title:'',addEventListener(){}};
  const context={console,URLSearchParams,location:{search:`?team=${team}&lang=${lang}&v=1550`},document,CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}},fetch:async(url)=>({ok:true,json:async()=>readJson(url)}),setTimeout,clearTimeout};
  context.window=context; context.dispatchEvent=()=>{};
  vm.createContext(context); vm.runInContext(code,context);
  await new Promise(r=>setTimeout(r,40));
  return html;
}
const teams=['spain','argentina','england','france','senegal','morocco'];
const langs=['fr','en','es','pt','ar'];
for(const team of teams){
  for(const lang of langs){
    const html=await render(team,lang);
    if(!html.includes('qg-v1550-team-root')) throw new Error(`${team}/${lang}: root missing`);
    if(team!=='senegal' && /senegal-team|Belgique\s*[–-]\s*Sénégal|Belgique vs Sénégal|Mémoire des Gaïndés/i.test(html)) throw new Error(`${team}/${lang}: Senegal fallback detected`);
    if(/assets\/senegal-team/i.test(html) && team!=='senegal') throw new Error(`${team}/${lang}: Senegal asset detected`);
  }
}
console.log(`PASS ${teams.length*langs.length} team/language combinations`);
