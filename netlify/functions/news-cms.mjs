import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const STORE = 'qg-news-v16';
const COOKIE = 'qg_gaindes_owner';
const VALID_STATUS = new Set(['draft', 'published', 'unpublished', 'archived']);
const VALID_SECTION = new Set(['world', 'gaindes']);
const VALID_RELIABILITY = new Set(['official', 'credible', 'rumor', 'unlikely']);
const H = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { ...H, ...extra },
});
const secret = () => String(process.env.QG_GAINDES_ADMIN_PASSWORD || '');
const eq = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a || '')).digest();
  const y = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(x, y);
};
function cookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  const part = raw.split(/;\s*/).find((value) => value.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : '';
}
function signed(exp) {
  return `${exp}.` + crypto.createHmac('sha256', secret()).update(`${exp}:qg-gaindes-owner`).digest('hex');
}
function owner(req) {
  const token = cookie(req, COOKIE);
  const [exp] = token.split('.');
  return Boolean(token && secret() && Number(exp) > Date.now() / 1000 && eq(token, signed(exp)));
}
const clean = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();
const normalized = (value) => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
const slugify = (value) => normalized(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
const contentFingerprint = (article) => crypto.createHash('sha256').update([
  normalized(article.title),
  normalized(article.body),
  normalized(article.section),
].join('\n')).digest('hex');

async function listAll(store) {
  const { blobs } = await store.list({ prefix: 'article:' });
  const values = await Promise.all((blobs || []).map(({ key }) => store.get(key, {
    type: 'json',
    consistency: 'strong',
  }).catch(() => null)));
  return values.filter(Boolean);
}
function publicArticle(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    analysis: article.analysis || '',
    section: article.section,
    reliability: article.reliability,
    sources: article.sources || '',
    author: article.author || 'QualifGaïndé',
    image: article.imageId ? `/.netlify/functions/news-cms?action=image&id=${encodeURIComponent(article.imageId)}` : '',
    imageAlt: article.imageAlt || article.title,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    status: article.status,
    priority: 0,
    langs: {
      fr: {
        title: article.title,
        body: article.excerpt,
        article: [article.excerpt, article.body].filter(Boolean),
        tag: article.tag || 'Brève',
      },
    },
  };
}

export default async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || '';
    const store = getStore({ name: STORE, consistency: 'strong' });

    if (req.method === 'GET' && action === 'image') {
      const id = url.searchParams.get('id') || '';
      const meta = await store.get(`image-meta:${id}`, { type: 'json' }).catch(() => null);
      const bytes = await store.get(`image:${id}`, { type: 'arrayBuffer' }).catch(() => null);
      if (!meta || !bytes) return new Response('Not found', { status: 404 });
      return new Response(bytes, {
        headers: {
          'Content-Type': meta.type,
          'Cache-Control': 'public,max-age=31536000,immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (req.method === 'GET' && action === 'public') {
      const slug = url.searchParams.get('slug');
      const all = (await listAll(store))
        .filter((article) => article.status === 'published' && article.publishedAt && new Date(article.publishedAt) <= new Date())
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      if (slug) {
        const article = all.find((item) => item.slug === slug || item.id === slug);
        return article
          ? json({ ok: true, article: publicArticle(article) }, 200, { 'Cache-Control': 'public,max-age=30' })
          : json({ ok: false, error: 'not_found' }, 404);
      }
      return json({ ok: true, articles: all.map(publicArticle) }, 200, { 'Cache-Control': 'public,max-age=30' });
    }

    if (!owner(req)) {
      return json({
        ok: false,
        error: 'unauthorized',
        message: 'Session expirée ou absente. Ouvre de nouveau la session propriétaire.',
      }, 401);
    }

    if (req.method === 'GET' && action === 'admin-list') {
      return json({
        ok: true,
        articles: (await listAll(store)).sort((a, b) => new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0)),
      });
    }

    if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

    let body = {};
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: 'invalid_json', message: 'La requête envoyée est invalide.' }, 400);
    }

    if (body.action === 'save') {
      const now = new Date().toISOString();
      const requestId = clean(body.requestId);
      if (requestId) {
        const prior = await store.get(`request:${requestId}`, { type: 'json' }).catch(() => null);
        if (prior?.articleId) {
          const priorArticle = await store.get(`article:${prior.articleId}`, { type: 'json' }).catch(() => null);
          if (priorArticle) return json({ ok: true, replayed: true, article: priorArticle });
        }
      }

      const old = body.id
        ? await store.get(`article:${body.id}`, { type: 'json' }).catch(() => null)
        : null;
      const title = clean(body.title);
      const excerpt = clean(body.excerpt);
      const articleBody = clean(body.body);
      const section = clean(body.section);
      const status = clean(body.status || 'draft');
      const reliability = clean(body.reliability || 'rumor');

      if (!title || !VALID_SECTION.has(section) || !VALID_STATUS.has(status) || !VALID_RELIABILITY.has(reliability)) {
        return json({ ok: false, error: 'validation', message: 'Titre, rubrique, statut ou fiabilité invalide.' }, 400);
      }
      if (status === 'published' && (!excerpt || !articleBody)) {
        return json({ ok: false, error: 'publication_incomplete', message: 'Le chapô et le corps de l’article sont obligatoires pour publier.' }, 400);
      }

      const id = old?.id || `news_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const candidate = { title, body: articleBody, section };
      const fingerprint = contentFingerprint(candidate);
      const all = await listAll(store);
      const exactDuplicate = all.find((article) => article.id !== id && article.status !== 'archived' && article.fingerprint === fingerprint);
      if (exactDuplicate) {
        return json({
          ok: false,
          error: 'duplicate_article',
          message: 'Cette brève existe déjà. Ouvre l’article existant pour le modifier.',
          duplicate: { id: exactDuplicate.id, title: exactDuplicate.title, status: exactDuplicate.status },
        }, 409);
      }
      const closeTitle = all.find((article) => article.id !== id && article.status !== 'archived' && normalized(article.title) === normalized(title));
      if (closeTitle) {
        return json({
          ok: false,
          error: 'duplicate_title',
          message: 'Une brève portant exactement le même titre existe déjà.',
          duplicate: { id: closeTitle.id, title: closeTitle.title, status: closeTitle.status },
        }, 409);
      }

      let slug = slugify(body.slug || title) || id;
      if (all.some((article) => article.id !== id && article.slug === slug)) slug += `-${Date.now().toString().slice(-5)}`;

      const article = {
        id,
        slug,
        title,
        excerpt,
        body: articleBody,
        analysis: clean(body.analysis),
        section,
        status,
        reliability,
        sources: clean(body.sources),
        tag: clean(body.tag || 'Mercato'),
        author: clean(body.author || 'QualifGaïndé'),
        imageId: old?.imageId || null,
        imageAlt: clean(body.imageAlt || title),
        fingerprint,
        createdAt: old?.createdAt || now,
        updatedAt: now,
        publishedAt: status === 'published' ? (old?.publishedAt || now) : (old?.publishedAt || null),
        version: (old?.version || 0) + 1,
      };

      if (body.imageData && body.imageType) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(body.imageType)) {
          return json({ ok: false, error: 'image_type', message: 'Format d’image non autorisé.' }, 400);
        }
        const buffer = Buffer.from(String(body.imageData).split(',').pop(), 'base64');
        if (buffer.length > 3 * 1024 * 1024) {
          return json({ ok: false, error: 'image_too_large', message: 'Image limitée à 3 Mo.' }, 413);
        }
        const imageId = `img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        await store.set(`image:${imageId}`, arrayBuffer);
        await store.setJSON(`image-meta:${imageId}`, { type: body.imageType, size: buffer.length });
        article.imageId = imageId;
      }

      await store.setJSON(`article:${id}`, article);
      const verified = await store.get(`article:${id}`, { type: 'json', consistency: 'strong' });
      if (!verified || verified.id !== id) throw new Error('write_verification_failed');
      if (requestId) await store.setJSON(`request:${requestId}`, { articleId: id, completedAt: now });
      return json({ ok: true, article: verified });
    }

    if (body.action === 'archive') {
      const article = await store.get(`article:${body.id}`, { type: 'json' }).catch(() => null);
      if (!article) return json({ ok: false, error: 'not_found', message: 'Brève introuvable.' }, 404);
      article.status = 'archived';
      article.updatedAt = new Date().toISOString();
      await store.setJSON(`article:${article.id}`, article);
      return json({ ok: true });
    }

    if (body.action === 'export') {
      return json({ ok: true, version: '16.1.0', exportedAt: new Date().toISOString(), articles: await listAll(store) });
    }

    return json({ ok: false, error: 'unknown_action', message: 'Action inconnue.' }, 400);
  } catch (error) {
    console.error('[news-cms]', error);
    return json({
      ok: false,
      error: 'storage_error',
      message: 'Le CMS n’a pas pu enregistrer la brève. Consulte les logs de la fonction news-cms si le problème persiste.',
    }, 500);
  }
};
