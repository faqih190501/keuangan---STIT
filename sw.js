/**
 * SIMPEL-IF Service Worker
 * STIT Ihsanul Fikri
 * Offline caching & multiplatform PWA support
 */

const CACHE_NAME = 'simpel-if-v5.4.1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/images/logo.png',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './css/receipt.css',
  './css/responsive.css',
  './js/app.js',
  './js/auth.js',
  './js/billing-engine.js',
  './js/modals.js',
  './js/models.js',
  './js/state.js',
  './js/utils/chart-engine.js',
  './js/utils/drag-scroll.js',
  './js/utils/export-engine.js',
  './js/utils/formatters.js',
  './js/utils/image-compressor.js',
  './js/utils/qr-engine.js',
  './js/utils/user-experience.js',
  './js/utils/multiplatform.js',
  './js/views/dashboard-bendahara.js',
  './js/views/view-akademik.js',
  './js/views/view-audit-log.js',
  './js/views/view-kalender.js',
  './js/views/view-laporan.js',
  './js/views/view-login.js',
  './js/views/view-mahasiswa.js',
  './js/views/view-pimpinan.js',
  './js/views/view-qr-validator.js',
  './js/views/view-skema-tarif.js',
  './js/views/view-verifikasi.js',
  './js/views/view-matriks-rekap.js'
];

// Install event - Cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll with individual catch to avoid aborting on single failed resource
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[PWA ServiceWorker] Failed to cache: ${asset}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[PWA ServiceWorker] Removing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Stale-While-Revalidate with Network Fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Don't intercept non-GET requests or Google Analytics / external APIs
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Allow Google Fonts to pass through or be handled dynamically
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an HTML navigation, return cached index.html
          if (request.mode === 'navigate') {
            return caches.match('./index.html') || cachedResponse;
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Message listener for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
