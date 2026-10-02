/**
 * SIMPEL-IF Service Worker
 * STIT Ihsanul Fikri
 * Offline caching & multiplatform PWA support
 * Version: 5.5.1
 */

const CACHE_NAME = 'simpel-if-v5.5.1';

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
  './js/utils/api-client.js',
  './js/utils/chart-engine.js',
  './js/utils/drag-scroll.js',
  './js/utils/export-engine.js',
  './js/utils/formatters.js',
  './js/utils/image-compressor.js',
  './js/utils/multiplatform.js',
  './js/utils/qr-engine.js',
  './js/utils/user-experience.js',
  './js/views/dashboard-bendahara.js',
  './js/views/view-akademik.js',
  './js/views/view-audit-log.js',
  './js/views/view-kalender.js',
  './js/views/view-laporan.js',
  './js/views/view-login.js',
  './js/views/view-mahasiswa.js',
  './js/views/view-matriks-rekap.js',
  './js/views/view-pimpinan.js',
  './js/views/view-qr-validator.js',
  './js/views/view-skema-tarif.js',
  './js/views/view-verifikasi.js'
];

// Install event - Cache core app shell and immediately take over
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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

// Activate event - Immediately clean all obsolete caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[PWA ServiceWorker] Purging old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-First for HTML/Scripts/Styles; Cache-First for static assets; Bypass for APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Don't intercept non-GET requests
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // CRITICAL: NEVER intercept cPanel MySQL API endpoints or PHP scripts
  if (url.pathname.includes('/api/') || url.pathname.endsWith('.php')) {
    return;
  }

  // Allow external APIs or analytics to pass through
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Network-First strategy for HTML navigation, JS modules, and CSS styles
  // Ensures fresh updates are visible immediately, falling back to cache when offline
  const isCodeOrDoc = request.mode === 'navigate' ||
                      url.pathname.endsWith('.js') ||
                      url.pathname.endsWith('.css') ||
                      url.pathname.endsWith('.html') ||
                      url.pathname === '/' ||
                      url.search.includes('v=');

  if (isCodeOrDoc) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Cache-First strategy for static images, logos, and webfonts
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      });
    })
  );
});

// Message listener for skip waiting or cache purge
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
