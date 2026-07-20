import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=process.cwd();
const code=fs.readFileSync(path.join(root,'assets/js/team-page-v1550.js'),'utf8');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p.split('?')[0]),'utf8'));
function classes(){const s=new Set();return{add:(...x)=>x.forEach(v=>s.add(v)),contains:x=>s.has(x)}}
async function render(team,lang){let html='';const document={readyState:'complete',body:{set innerHTML(v){html=v},get innerHTML(){return html}},documentElement:{lang:'fr',dir:'ltr',classList:classes()},title:'',addEventListener(){}};const c={console,URLSearchParams,location:{search:`?team=${team}&lang=${lang}&v=1610`},document,CustomEvent:class{},fetch:async u=>({ok:true,json:async()=>readJson(u)}),setTimeout,clearTimeout};c.window=c;c.dispatchEvent=()=>{};vm.createContext(c);vm.runInContext(code,c);await new Promise(r=>setTimeout(r,35));return html}
const teams=['spain','argentina','england','france','senegal','morocco'];
for(const team of teams){const html=await render(team,'fr');
 if((html.match(/qg55-table-card/g)||[]).length<3)throw new Error(`${team}: 3 tableaux absents`);
 if(!html.includes('qg55-breadcrumb')||!html.includes('mode=global'))throw new Error(`${team}: navigation parent/racine absente`);
 if(team!=='senegal'&&/senegal-team|Belgique\s*[–-]\s*Sénégal|Belgique vs Sénégal|Mémoire des Gaïndés/i.test(html))throw new Error(`${team}: fuite Sénégal`);
 const data=readJson('data/team-results.json')[team]||[];
 if(data.length && !html.includes(data[0].label.split(/\d/)[0].trim()))throw new Error(`${team}: données neutres non rendues`);
}
if(!code.includes("document.body.innerHTML='<main id=\"qg-v1550-team-root\""))throw new Error('renderer ne prend pas la main');
console.log('PASS Lot B: renderer équipe neutre + 3 tableaux');
