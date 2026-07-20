import fs from 'node:fs';
const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/js/computed-team-state.js','utf8');
const admin=fs.readFileSync('admin-gaindes/index.html','utf8');
const must=[
  ['accueil post-Mondial',app.includes('Le Mondial est terminé, l’histoire continue')],
  ['carte mémoire Mondial',app.includes('qg-world-memory-card')&&app.includes('ESPAGNE · DEUX ÉTOILES')],
  ['podium home',app.includes('finalPodiumHtml(teams, computed, live)')],
  ['suivi Gaïndés',app.includes('gaindesInternationalCardHtml()')],
  ['brèves Gaïndés home',app.includes('qg-gaindes-news-home')],
  ['analyse rédaction admin',admin.includes('L’analyse de la rédaction')&&!admin.includes('Le regard de QualifGaïndé')],
  ['analyse rédaction public',app.includes('L’analyse de la rédaction')&&!app.includes('Le regard de QualifGaïndé')],
  ['tri newest first',app.includes("Date.parse(a.publishedAt||a.updatedAt||'')")],
  ['header contrasté',index.includes('V16.1.0 — accueil et navigation')],
  ['pastille globale masquée',index.includes('a[href*="mode=global"]{display:none!important}')]
];
for(const [name,ok] of must){if(!ok)throw new Error('LOT A FAIL: '+name)}
console.log('PASS Lot A: home, CMS, navigation');
