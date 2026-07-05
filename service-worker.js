// QualifGaïndé Worldwide — Service Worker V12.0.14 SAFE
const CACHE_VERSION = 'qg-v12-0-14-static';
const RUNTIME_CACHE = 'qg-v12-0-14-runtime';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION && k !== RUNTIME_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isFreshRoute(url){
  return url.pathname === '/' ||
         url.pathname === '/index.html' ||
         url.pathname.startsWith('/.netlify/functions/') ||
         url.pathname === '/live.json' ||
         url.pathname === '/stats.json' ||
         url.pathname.startsWith('/data/') ||
         url.pathname.startsWith('/src/');
}

async function networkFirst(request){
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    if (fresh && fresh.ok && request.method === 'GET') {
      // Ne jamais mettre en cache HTML/navigation : priorité à la version fraîche.
      const url = new URL(request.url);
      if (url.pathname !== '/' && url.pathname !== '/index.html' && request.mode !== 'navigate') {
        cache.put(request, fresh.clone()).catch(() => null);
      }
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

  if (request.mode === 'navigate' || isFreshRoute(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(cacheFirst(request));
  }
});
