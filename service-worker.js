// QualifGaïndé Worldwide — Service Worker V11.5.7
const CACHE_VERSION = 'qg-v11-5-7-static';
const RUNTIME_CACHE = 'qg-v11-5-7-runtime';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-512.png',
  '/assets/lion-mascotte.png',
  '/src/v10/v10-team-app.css?v=11.5.7',
  '/src/v10/v10-team-app.js?v=11.5.7'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_ASSETS)).catch(() => null));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => ![CACHE_VERSION, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isFreshRoute(url){
  return url.pathname.startsWith('/.netlify/functions/') ||
         url.pathname === '/live.json' ||
         url.pathname === '/stats.json' ||
         url.pathname.startsWith('/data/');
}

async function networkFirst(request){
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    if (fresh && fresh.ok && request.method === 'GET' && !request.url.includes('/.netlify/functions/')) {
      cache.put(request, fresh.clone()).catch(() => null);
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request){
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone()).catch(() => null);
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isFreshRoute(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request).catch(() => caches.match('/index.html')));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(cacheFirst(request));
  }
});
