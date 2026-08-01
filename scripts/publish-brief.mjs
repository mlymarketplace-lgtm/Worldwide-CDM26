import fs from 'node:fs/promises';

async function loadLocalEnvironment() {
  let content = '';
  try { content = await fs.readFile('.env.local', 'utf8'); } catch { return; }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
}

await loadLocalEnvironment();
const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node scripts/publish-brief.mjs brief.json');
const endpoint = process.env.QG_PUBLISH_ENDPOINT || 'https://qualifgainde.netlify.app/.netlify/functions/publish-news';
const apiKey = process.env.QG_PUBLISH_API_KEY;
if (!apiKey) throw new Error('QG_PUBLISH_API_KEY est absente.');
const payload = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify(payload),
});
const result = await response.json();
if (!response.ok || !result.ok) throw new Error(`Publication refusée (${response.status}) : ${JSON.stringify(result)}`);
console.log(JSON.stringify(result, null, 2));
