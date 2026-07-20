import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

function classList(){
  const values = new Set();
  return {
    add:(...items)=>items.forEach(item=>values.add(item)),
    remove:(...items)=>items.forEach(item=>values.delete(item)),
    contains:item=>values.has(item),
    toggle(item,force){ if(force===true){values.add(item);return true;} if(force===false){values.delete(item);return false;} if(values.has(item)){values.delete(item);return false;} values.add(item);return true; },
    values
  };
}

// 1) Le vrai bootstrap de index.html doit classifier chaque route sans réactiver l'ancien sélecteur.
const index = read('index.html');
const firstScript = index.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
if(!firstScript) throw new Error('Lot A: bootstrap du head introuvable');
function boot(search){
  const classes=classList();
  const document={documentElement:{classList:classes,dataset:{}},};
  const location={search,pathname:'/',origin:'https://example.test',replace(){throw new Error('unexpected redirect')}};
  const context={window:null,document,location,URLSearchParams,setTimeout(){return 0},console};
  context.window=context;
  vm.createContext(context);
  vm.runInContext(firstScript,context);
  return {route:context.QG_APP_ROUTE,owner:context.QG_ROUTE_OWNER,classes,dataset:document.documentElement.dataset,selector:context.QUALIFGAINDE_SELECTOR_ACTIVE};
}
for(const [search,expected] of [
  ['?v=1611','home'],['?mode=worldcup&v=1611','worldcup'],['?mode=global&v=1611','worldcup'],
  ['?mode=news&v=1611','news'],['?mode=gaindes&v=1611','gaindes'],['?mode=final&v=1611','final'],['?team=spain&v=1611','team']
]){
  const state=boot(search);
  if(state.route!==expected) throw new Error(`Lot A: ${search} classée ${state.route} au lieu de ${expected}`);
  if(state.selector!==false) throw new Error(`Lot A: ancien sélecteur réactivé sur ${search}`);
  if(!state.classes.contains(`qg-route-${expected}`)) throw new Error(`Lot A: classe route absente pour ${search}`);
}
if(!index.includes('id="qg-app-root"')) throw new Error('Lot A: root applicatif dédié absent');
if(!index.includes('html.qg-v1611-app-route body > :not(#qg-app-root)')) throw new Error('Lot A: quarantaine visuelle du legacy absente');
if(index.includes("var selectorActive = !p.has('team');")) throw new Error('Lot A: ancienne règle imprécise encore active');
if(index.includes('href="?mode=global')) throw new Error('Lot A: destination mode=global encore présente dans index.html');

// 2) Tester les composants et le vrai pipeline run() sur le nouveau root, avec les données réelles.
let code = read('assets/js/computed-team-state.js');
code = code.replace(/\}\)\(\);\s*$/, 'window.__QG_V1611_TEST__={renderHome,renderWorldCupMemory,renderGaindesHub,renderFinal,sortNewsNewestFirst,run,safeRun};})();');
const classes=classList();
const appRoot={innerHTML:'',hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v;},querySelector(){return null},querySelectorAll(){return []}};
const legacyRoot={innerHTML:'LEGACY-BELGIQUE-SENEGAL',hidden:false,setAttribute(){},querySelector(){return null},querySelectorAll(){return []}};
const document={
  readyState:'loading',
  documentElement:{classList:classes,lang:'fr',dir:'ltr'},
  addEventListener(){},
  getElementById(id){return id==='qg-app-root'?appRoot:id==='v10-team-selector'?legacyRoot:null;}
};
const context={
  console,URLSearchParams,document,
  location:{search:'?v=1611'},history:{replaceState(){}},
  setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},
  CustomEvent:class{},Date,
  fetch:async(url)=>{
    const clean=String(url).split('?')[0].replace(/^\//,'');
    if(clean==='.netlify/functions/news-cms') return {ok:true,json:async()=>({articles:[]})};
    const file=path.join(root,clean);
    if(fs.existsSync(file)) return {ok:true,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};
    return {ok:false,json:async()=>null};
  },
};
context.window=context;
context.window.addEventListener=()=>{};
vm.createContext(context);
vm.runInContext(code, context);

const teams=readJson('data/teams.json');
const results=readJson('data/team-results.json');
const newsStatic=readJson('data/world-news.json');
const dynamic={id:'news_recent',section:'gaindes',publishedAt:'2026-07-20T18:00:00Z',priority:0,langs:{fr:{title:'La brève dynamique la plus récente',body:'Résumé',article:['Résumé'],tag:'Mercato'}}};
const older={id:'news_old',section:'gaindes',publishedAt:'2026-07-19T18:00:00Z',priority:0,langs:{fr:{title:'Une brève plus ancienne',body:'Résumé',article:['Résumé'],tag:'Forme'}}};
const selector={innerHTML:''};
context.__QG_V1611_TEST__.renderHome(selector,teams,{},[older,...newsStatic,dynamic],results,{});
if(!selector.innerHTML.includes('Votre App’ <span>« Suivi des Lions »</span>')) throw new Error('Lot A: nouveau wording d’accueil absent');
if(/QUALIFGAÏNDÉ · APRÈS-MONDIAL|Le Mondial est terminé/.test(selector.innerHTML)) throw new Error('Lot A: ancien wording d’accueil encore rendu');
if(!selector.innerHTML.includes('?mode=worldcup')) throw new Error('Lot A: route mémoire du Mondial absente');
if(!selector.innerHTML.includes('Espagne · 2 étoiles')) throw new Error('Lot A: deuxième étoile de l’Espagne absente');
if(!selector.innerHTML.includes('Suivi des Gaïndés')) throw new Error('Lot A: carte Suivi des Gaïndés absente');
if(!selector.innerHTML.includes('Brèves des Gaïndés')) throw new Error('Lot A: carte Brèves des Gaïndés absente');
if(selector.innerHTML.indexOf('La brève dynamique la plus récente')>selector.innerHTML.indexOf('Une brève plus ancienne')) throw new Error('Lot A: ordre récent vers ancien incorrect');
if(/Voir la page globale|mode=global/.test(selector.innerHTML)) throw new Error('Lot A: ancien bouton global encore rendu');

selector.innerHTML='';
context.location.search='?mode=worldcup&v=1611';
context.__QG_V1611_TEST__.renderWorldCupMemory(selector,teams,{},[],results,{});
if(!selector.innerHTML.includes('qg16-worldcup-main')) throw new Error('Lot A: mémoire du Mondial non rendue');
if(!selector.innerHTML.includes('Choisissez une nation')) throw new Error('Lot A: liste des nations absente');
if(!selector.innerHTML.includes('?team=spain')) throw new Error('Lot A: lien Espagne absent');
if(/Belgique\s+vs\s+Sénégal|Belgique–Sénégal|Prochaine rencontre des Gaïndés|Voir la page globale/i.test(selector.innerHTML)) throw new Error('Lot A: fuite Sénégal dans la mémoire neutre');

appRoot.innerHTML='';legacyRoot.innerHTML='LEGACY-BELGIQUE-SENEGAL';appRoot.attrs={};
context.location.search='?mode=worldcup&v=1611';
await context.__QG_V1611_TEST__.run();
if(!appRoot.innerHTML.includes('qg16-worldcup-main')) throw new Error('Lot A intégration: le pipeline n’a pas rendu la mémoire dans qg-app-root');
if(!appRoot.innerHTML.includes('Choisissez une nation')) throw new Error('Lot A intégration: mémoire incomplète');
if(legacyRoot.innerHTML!=='LEGACY-BELGIQUE-SENEGAL') throw new Error('Lot A intégration: le pipeline a réutilisé le root legacy');
if(appRoot.attrs['data-qg-render-complete']!=='worldcup') throw new Error('Lot A intégration: marqueur de rendu complet absent');
if(context.QG_LAST_RENDER?.route!=='worldcup') throw new Error('Lot A intégration: état de route final incorrect');

const css=read('assets/css/app-v1611.css');
if(!css.includes('.qg16-news-card h2{font-size:clamp(1.75rem')) throw new Error('Lot A: taille Brèves non réduite');
if(!css.includes('.qg16-news-card small{color:#fff')) throw new Error('Lot A: texte blanc de la carte Brèves absent');
const admin=read('admin-gaindes/index.html');
if(!admin.includes('L’analyse de la rédaction')) throw new Error('Lot A: libellé CMS non mis à jour');
if(admin.includes('Le regard de QualifGaïndé')) throw new Error('Lot A: ancien libellé CMS encore actif');
console.log('PASS Lot A — routeur, home, CMS, navigation et mémoire du Mondial');
