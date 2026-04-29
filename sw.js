/* ═══════════════════════════════════════
   ScanPro Service Worker v1.0.0
   - Cache-first for assets
   - Network-first for API calls
   - Data is NEVER cleared on update
═══════════════════════════════════════ */
const CACHE_NAME = 'scanpro-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'no-cors' }))))
      .catch(() => {}) // Don't fail install if cache fails
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches (NEVER touch localStorage/IndexedDB)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Don't cache API calls
  if(
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('js.stripe.com')
  ) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if(cached) return cached;
        return fetch(event.request)
          .then(resp => {
            if(resp && resp.status === 200 && resp.type !== 'opaque') {
              const clone = resp.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            }
            return resp;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));
      })
  );
});

// Message handling
self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
