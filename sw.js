/* NectarOS Service Worker v5.3 */
const APP_VERSION = 'v5.4';
const CACHE   = 'nectaros-v9';
const RUNTIME = 'nectaros-rt-v9';

const STATIC = ['./', './manifest.json', './lang.js'];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// ── التثبيت: كاش الملفات الأساسية + CDN ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(STATIC).then(() =>
        Promise.allSettled(
          CDN.map(u =>
            fetch(u, {cache:'no-cache'})
              .then(r => r.ok ? c.put(u, r) : null)
              .catch(() => null)
          )
        )
      )
    ).then(() => {
      console.log('[SW] NectarOS', APP_VERSION, 'installed');
      return self.skipWaiting(); // ← تفعيل فوري بدون انتظار
    })
  );
});

// ── التفعيل: حذف الكاشات القديمة ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE && k !== RUNTIME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      console.log('[SW] NectarOS', APP_VERSION, 'activated');
      return self.clients.claim(); // ← تحكّم في الصفحات المفتوحة فوراً
    })
  );
});

// ── الطلبات: Network-first للـ HTML، Cache-first للباقي ──
self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith('http') || e.request.method !== 'GET') return;

  const isHTML = e.request.headers.get('Accept')?.includes('text/html');

  if (isHTML) {
    // HTML: جلب من الشبكة أولاً (يضمن الحصول على أحدث نسخة)
    e.respondWith(
      fetch(e.request, {cache:'no-cache'}).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() =>
        caches.match(e.request).then(r => r || caches.match('./'))
      )
    );
  } else {
    // الباقي: كاش أولاً مع تحديث خلفي
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(r => {
          if (r?.ok) caches.open(RUNTIME).then(c => c.put(e.request, r.clone()));
          return r;
        }).catch(() => null);

        return cached || fetchPromise || new Response('', {status: 503});
      })
    );
  }
});

// ── رسائل من الصفحة ──
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // إرسال إشعار للصفحات بأن تحديثاً تم
  if (e.data === 'GET_VERSION') {
    e.source.postMessage({type: 'SW_VERSION', version: APP_VERSION, cache: CACHE});
  }
});
