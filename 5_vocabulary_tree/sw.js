// Service Worker — PWA cache-first strategy with network fallback
// Precache core assets at install; skipWaiting + clients.claim for immediate activation

const CACHE_NAME = 'vt-cache-v4';

const PRECACHE_URLS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.webmanifest',
  // CSS
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/tree.css',
  './src/css/blocks.css',
  './src/css/modal.css',
  './src/css/overview.css',
  './src/css/boss.css',
  './src/css/dashboard.css',
  './src/css/collection.css',
  // JS — main
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/utils.js',
  './src/js/db.js',
  './src/js/notify.js',
  './src/js/tts.js',
  './src/js/curriculum.js',
  './src/js/srl.js',
  // JS — tree
  './src/js/tree/camera.js',
  './src/js/tree/grow.js',
  './src/js/tree/leaves.js',
  './src/js/tree/minimap.js',
  './src/js/tree/overview.js',
  './src/js/tree/render.js',
  // JS — blocks
  './src/js/blocks/drag.js',
  './src/js/blocks/match.js',
  './src/js/blocks/spawn.js',
  // JS — ui
  './src/js/ui/lock.js',
  './src/js/ui/modal.js',
  './src/js/ui/dashboard.js',
  './src/js/ui/collection.js',
  // JS — boss
  './src/js/boss/decompose.js',
  // Data
  './src/data/hanja.js',
  './src/data/words.js',
  './src/data/academic.js',
  // Icons
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

// Install: precache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).then(() => {
        self.skipWaiting();
      });
    })
  );
});

// Activate: clean up old caches, claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch: cache-first for same-origin only.
// Cross-origin (fonts, esm CDN) → let the browser handle natively to avoid
// CORS / opaque-response issues when re-fetching from the SW context.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Non-GET / cross-origin → no-op (browser default fetch).
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => caches.match('./index.html'));
    })
  );
});

// Message handler for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
