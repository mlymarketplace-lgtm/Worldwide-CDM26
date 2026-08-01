import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const STORE = 'qg-news-v16';
const VALID_RELIABILITY = new Set(['official', 'credible', 'rumor', 'unlikely']);
const VALID_CHANGE_TYPE = new Set(['new', 'evolution', 'completed']);
const VALID_TOPIC = /^[a-z0-9][a-z0-9-]{1,48}$/;
const H = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: H });
const clean = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();
const normalized = (value) => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
const slugify = (value) => normalized(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
const fingerprint = (item) => crypto.createHash('sha256').update([
  normalized(item.title), normalized(item.excerpt), normalized(item.body), normalized(item.sources), normalized(item.reliability),
].join('\n')).digest('hex');
const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a || '')).digest();
  const y = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(x, y);
};
const authorized = (req) => {
  const expected = String(process.env.QG_PUBLISH_API_KEY || '');
  const supplied = String(req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return Boolean(expected && supplied && safeEqual(expected, supplied));
};

async function listAll(store) {
  const { blobs } = await store.list({ prefix: 'article:' });
  const values = await Promise.all((blobs || []).map(({ key }) => store.get(key, {
    type: 'json', consistency: 'strong',
  }).catch(() => null)));
  return values.filter(Boolean);
}

async function storeWikimediaImage(store, image, oldImageId) {
  if (!image?.url) return { imageId: oldImageId || null };
  const url = new URL(String(image.url));
  if (url.protocol !== 'https:' || url.hostname !== 'upload.wikimedia.org') throw new Error('wikimedia_image_url_required');
  const pageUrl = String(image.pageUrl || '');
  const page = new URL(pageUrl);
  if (page.protocol !== 'https:' || !['commons.wikimedia.org', 'fr.wikipedia.org', 'en.wikipedia.org'].includes(page.hostname)) {
    throw new Error('wikimedia_source_page_required');
  }
  const author = clean(image.author);
  const license = clean(image.license);
  if (!author || !license) throw new Error('wikimedia_credit_required');
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('wikimedia_download_failed');
  const type = String(response.headers.get('content-type') || '').split(';')[0];
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error('wikimedia_image_type');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 3 * 1024 * 1024) throw new Error('wikimedia_image_too_large');
  const imageId = `img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  await store.set(`image:${imageId}`, bytes);
  await store.setJSON(`image-meta:${imageId}`, { type, size: bytes.byteLength });
  return { imageId, imageCredit: { author, license, pageUrl, originalUrl: url.toString() } };
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (!authorized(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  let payload;
  try { payload = await req.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length || items.length > 10) return json({ ok: false, error: 'items_required', message: 'Envoie entre 1 et 10 sujets.' }, 400);

  try {
    const store = getStore({ name: STORE, consistency: 'strong' });
    const all = await listAll(store);
    const results = [];
    for (const raw of items) {
      if (raw.radar === true || raw.publish === false) {
        results.push({ action: 'skipped', reason: 'radar' });
        continue;
      }
      const player = slugify(raw.player);
      const topic = slugify(raw.topic);
      const title = clean(raw.title);
      const excerpt = clean(raw.excerpt);
      const body = clean(raw.body);
      const sources = clean(raw.sources);
      const reliability = clean(raw.reliability || 'credible');
      const requestedChange = clean(raw.changeType || 'evolution');
      if (!player || !VALID_TOPIC.test(topic) || !title || !excerpt || !body || !sources || !VALID_RELIABILITY.has(reliability) || !VALID_CHANGE_TYPE.has(requestedChange)) {
        results.push({ action: 'rejected', player, topic, error: 'invalid_article' });
        continue;
      }
      const businessKey = `${player}:${topic}`;
      const old = all.find((article) => article.businessKey === businessKey && article.status !== 'archived');
      const nextFingerprint = fingerprint({ title, excerpt, body, sources, reliability });
      if (old?.automationFingerprint === nextFingerprint) {
        results.push({ action: 'unchanged', id: old.id, businessKey, title: old.title });
        continue;
      }
      const now = new Date().toISOString();
      const id = old?.id || `news_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const image = await storeWikimediaImage(store, raw.image, old?.imageId);
      const article = {
        ...(old || {}),
        id,
        slug: old?.slug || slugify(raw.slug || title) || id,
        businessKey,
        player,
        topic,
        title,
        excerpt,
        body,
        analysis: clean(raw.analysis),
        section: 'gaindes',
        status: 'published',
        reliability,
        changeType: old ? requestedChange : 'new',
        sources,
        tag: clean(raw.tag || 'Actualité des Lions'),
        author: clean(raw.author || 'Rédaction Suivi des Lions'),
        imageId: image.imageId,
        imageCredit: image.imageCredit || old?.imageCredit || null,
        imageAlt: clean(raw.imageAlt || title),
        fingerprint: crypto.createHash('sha256').update([normalized(title), normalized(body), 'gaindes'].join('\n')).digest('hex'),
        automationFingerprint: nextFingerprint,
        createdAt: old?.createdAt || now,
        updatedAt: now,
        publishedAt: old?.publishedAt || now,
        version: (old?.version || 0) + 1,
        updateHistory: [...(old?.updateHistory || []), { at: now, changeType: old ? requestedChange : 'new', title }].slice(-20),
      };
      await store.setJSON(`article:${id}`, article);
      const verified = await store.get(`article:${id}`, { type: 'json', consistency: 'strong' });
      if (!verified || verified.automationFingerprint !== nextFingerprint) throw new Error('write_verification_failed');
      if (!old) all.push(article);
      else Object.assign(old, article);
      results.push({ action: old ? 'updated' : 'created', id, businessKey, title, changeType: article.changeType });
    }
    return json({ ok: true, processed: items.length, results });
  } catch (error) {
    console.error('[publish-news]', error);
    return json({ ok: false, error: String(error?.message || 'publication_failed') }, 500);
  }
};
