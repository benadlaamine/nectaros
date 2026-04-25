/* NectarOS Service Worker v5.1 — Chat removed */
const APP_VERSION = 'v5.1';
const CACHE = 'nectaros-v51';
const RUNTIME = 'nectaros-rt-v51';

const STATIC = ['/', './manifest.json'];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(STATIC).then(() =>
        Promise.allSettled(CDN.map(u =>
          fetch(u, {cache:'no-cache'}).then(r => r.ok ? c.put(u, r) : null).catch(()=>null)
        ))
      )
    ).then(() => console.log('[SW] NectarOS v5.1 installed'))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== RUNTIME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith('http') || e.request.method !== 'GET') return;
  const isHTML = e.request.headers.get('Accept')?.includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/')))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) {
          fetch(e.request).then(r => { if (r?.ok) caches.open(RUNTIME).then(c => c.put(e.request, r)); }).catch(()=>{});
          return cached;
        }
        return fetch(e.request).then(r => {
          if (r?.ok) caches.open(RUNTIME).then(c => c.put(e.request, r.clone()));
          return r;
        }).catch(() => new Response('', {status:503}));
      })
    );
  }
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});