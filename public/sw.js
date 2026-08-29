const VERSION = 'backup-receipt-__BUILD_ID__';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL = [
  '/',
  '/index.html',
  '/demo.html',
  '/404.html',
  '/offline.html',
  '/privacy/',
  '/terms/',
  '/assets/__APP_JS__',
  '/assets/__STYLE_CSS__',
  '/assets/legal-ff7db1a6.css',
  '/assets/receipt-inspection-768-9fd624e0.webp',
  '/assets/receipt-inspection-1280-3ed3da66.webp',
  '/manifest.webmanifest',
  '/assets/icon-192-a89d24be.png',
  '/assets/icon-512-22de8196.png',
  '/assets/icon-maskable-512-0fb5b020.png',
  '/assets/apple-touch-180-e257b61a.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => ![SHELL_CACHE, ASSET_CACHE].includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.postMessage({ type: 'APP_UPDATED', version: VERSION }));
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname === '/online-check.txt') {
    event.respondWith(fetch(request).catch(async () => {
      const client = await self.clients.get(event.clientId);
      client?.postMessage({ type: 'OFFLINE' });
      return new Response('', { status: 503, statusText: 'Offline' });
    }));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const isDemo = url.pathname === '/demo' || url.pathname === '/demo/';
      if (isDemo) {
        try {
          return await fetch(request);
        } catch {
          return (await caches.match('/demo.html')) || (await caches.match('/offline.html'));
        }
      }
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match('/index.html')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(ASSET_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});
