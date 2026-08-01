import fs from 'node:fs';

const api = fs.readFileSync(new URL('../netlify/functions/publish-news.mjs', import.meta.url), 'utf8');
const cms = fs.readFileSync(new URL('../netlify/functions/news-cms.mjs', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('../scripts/publish-brief.mjs', import.meta.url), 'utf8');
const docs = fs.readFileSync(new URL('../AUTOMATISATION_CODEX.md', import.meta.url), 'utf8');
const admin = fs.readFileSync(new URL('../admin-gaindes/index.html', import.meta.url), 'utf8');

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

expect(api.includes('QG_PUBLISH_API_KEY'), 'Le secret de publication est absent.');
expect(api.includes("req.headers.get('authorization')"), 'L’authentification Bearer est absente.');
expect(api.includes('businessKey = `${player}:${topic}`'), 'La clé métier joueur + thème est absente.');
expect(api.includes("action: 'unchanged'"), 'Le refus des contenus inchangés est absent.');
expect(api.includes("reason: 'radar'"), 'L’exclusion du Radar est absente.');
expect(api.includes("url.hostname !== 'upload.wikimedia.org'"), 'La restriction Wikimedia est absente.');
expect(api.includes('wikimedia_credit_required'), 'Auteur et licence Wikimedia ne sont pas exigés.');
expect(api.includes('write_verification_failed'), 'La relecture après écriture est absente.');
expect(cms.includes('businessKey: article.businessKey'), 'La clé métier n’est pas exposée par le CMS.');
expect(cms.includes('imageCredit: article.imageCredit'), 'Les crédits photo ne sont pas exposés.');
expect(client.includes('Authorization: `Bearer ${apiKey}`'), 'Le client Codex n’envoie pas le secret.');
expect(client.includes("readFile('.env.local'"), 'Le client Codex ne charge pas la clé locale.');
expect(docs.includes('created') && docs.includes('updated') && docs.includes('unchanged'), 'Les résultats ne sont pas documentés.');
expect(admin.includes("article.businessKey?'🤖 Codex"), 'Les articles Codex ne sont pas identifiés dans la console.');
expect(admin.includes('L’analyse de la rédaction') && admin.includes("'analysis'"), 'L’analyse rédactionnelle n’est pas modifiable dans la console.');
expect(admin.includes('Vos modifications corrigeront cet article sans créer de doublon.'), 'La modification manuelle des articles Codex n’est pas explicitée.');
expect(cms.includes('imageCredit: article.imageCredit'), 'Les crédits Wikimedia ne sont pas exposés publiquement.');
expect(cms.includes("split(/\\n\\s*\\n/)"), 'Le corps automatisé n’est pas découpé en paragraphes.');
const renderer = fs.readFileSync(new URL('../assets/js/computed-team-state.js', import.meta.url), 'utf8');
expect(renderer.includes('news-image-credit') && renderer.includes('Source Wikimedia'), 'Les crédits Wikimedia ne sont pas affichés sous la photo.');

console.log('PASS Publication V16.3.0 — authentification, dédoublonnage, Radar et Wikimedia');
