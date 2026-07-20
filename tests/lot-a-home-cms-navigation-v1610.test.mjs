import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let code = fs.readFileSync(path.join(root, 'assets/js/computed-team-state.js'), 'utf8');
code = code.replace(/\}\)\(\);\s*$/, 'window.__QG_V1610_TEST__={renderHome,renderWorldCupMemory,renderGaindesHub,renderFinal,sortNewsNewestFirst};})();');

function classList(){
  const values = new Set();
  return {add:(...items)=>items.forEach(item=>values.add(item)),remove:(...items)=>items.forEach(item=>values.delete(item)),contains:item=>values.has(item)};
}
const document = {readyState:'loading',documentElement:{classList:classList(),lang:'fr',dir:'ltr'},addEventListener(){},getElementById(){return null}};
const context = {
  console, URLSearchParams, document,
  location:{search:'?v=1610'}, history:{replaceState(){}},
  setTimeout(){return 0}, clearTimeout(){}, setInterval(){return 0}, clearInterval(){},
  CustomEvent:class{},
  fetch:async()=>({ok:false,json:async()=>null}),
};
context.window=context;
context.window.addEventListener=()=>{};
vm.createContext(context);
vm.runInContext(code, context);

const teams = JSON.parse(fs.readFileSync(path.join(root,'data/teams.json'),'utf8'));
const results = JSON.parse(fs.readFileSync(path.join(root,'data/team-results.json'),'utf8'));
const newsStatic = JSON.parse(fs.readFileSync(path.join(root,'data/world-news.json'),'utf8'));
const dynamic = {
  id:'news_recent',section:'gaindes',publishedAt:'2026-07-20T18:00:00Z',priority:0,
  langs:{fr:{title:'La brève dynamique la plus récente',body:'Résumé',article:['Résumé'],tag:'Mercato'}}
};
const older = {
  id:'news_old',section:'gaindes',publishedAt:'2026-07-19T18:00:00Z',priority:0,
  langs:{fr:{title:'Une brève plus ancienne',body:'Résumé',article:['Résumé'],tag:'Forme'}}
};
const selector={innerHTML:''};
context.__QG_V1610_TEST__.renderHome(selector, teams, {}, [older,...newsStatic,dynamic], results, {});
if(!selector.innerHTML.includes('Le Mondial est terminé')) throw new Error('Lot A: nouveau message d’accueil absent');
if(!selector.innerHTML.includes('?mode=worldcup')) throw new Error('Lot A: route mémoire du Mondial absente');
if(!selector.innerHTML.includes('Espagne · 2 étoiles')) throw new Error('Lot A: deuxième étoile de l’Espagne absente');
if(!selector.innerHTML.includes('Suivi des Gaïndés')) throw new Error('Lot A: carte Suivi des Gaïndés absente');
if(!selector.innerHTML.includes('Brèves des Gaïndés')) throw new Error('Lot A: carte Brèves des Gaïndés absente');
if(selector.innerHTML.indexOf('La brève dynamique la plus récente') > selector.innerHTML.indexOf('Une brève plus ancienne')) throw new Error('Lot A: ordre récent vers ancien incorrect');
if(/Voir la page globale|mode=global/.test(selector.innerHTML)) throw new Error('Lot A: ancien bouton global encore rendu');

selector.innerHTML='';
context.location.search='?mode=worldcup&v=1610';
context.__QG_V1610_TEST__.renderWorldCupMemory(selector, teams, {}, [], results, {});
if(!selector.innerHTML.includes('la mémoire du tournoi')) throw new Error('Lot A: mémoire du Mondial non rendue');
if(!selector.innerHTML.includes('Choisissez une nation')) throw new Error('Lot A: liste des nations absente');
if(!selector.innerHTML.includes('?team=spain')) throw new Error('Lot A: lien Espagne absent');
if(/Belgique\s+vs\s+Sénégal|Belgique–Sénégal|Prochaine rencontre des Gaïndés|Voir la page globale/i.test(selector.innerHTML)) throw new Error('Lot A: fuite de la page Sénégal dans la mémoire neutre');

const gaindesHost={innerHTML:''};
const gaindesSelector={innerHTML:'',querySelector(query){return query==='[data-gaindes-route-host]'?gaindesHost:null;}};
context.location.search='?mode=gaindes&v=1610';
context.__QG_V1610_TEST__.renderGaindesHub(gaindesSelector);
if(!gaindesSelector.innerHTML.includes('qg16-shell-header')) throw new Error('Lot A: header commun absent du Suivi des Gaïndés');
if(!gaindesSelector.innerHTML.includes('/?v=1610')) throw new Error('Lot A: retour racine absent du Suivi des Gaïndés');
if(!gaindesSelector.innerHTML.includes('Suivi des Gaïndés')) throw new Error('Lot A: fil d\'Ariane du Suivi absent');

const finalSelector={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
context.location.search='?mode=final&v=1610';
context.__QG_V1610_TEST__.renderFinal(finalSelector, teams, {resolved:{},state:{}}, results, {});
if(!finalSelector.innerHTML.includes('Mémoire du Mondial')) throw new Error('Lot A: page finale sans retour parent');
if(!finalSelector.innerHTML.includes('/?v=1610')) throw new Error('Lot A: page finale sans retour racine');

const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!index.includes("var selectorActive = !p.has('team');")) throw new Error('Lot A: route global historique encore exclue du sélecteur');
if(index.includes('href="?mode=global')) throw new Error('Lot A: destination mode=global encore présente dans index.html');
const admin = fs.readFileSync(path.join(root,'admin-gaindes/index.html'),'utf8');
if(!admin.includes('L’analyse de la rédaction')) throw new Error('Lot A: libellé CMS non mis à jour');
if(admin.includes('Le regard de QualifGaïndé')) throw new Error('Lot A: ancien libellé CMS encore actif');
console.log('PASS Lot A — home, CMS, navigation');
