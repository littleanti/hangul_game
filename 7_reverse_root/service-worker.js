// service-worker.js — PWA 오프라인 캐시 (TRD §7.2, M4)
// 파일 추가·삭제 시 PRECACHE_ASSETS 수동 갱신 + CACHE_VERSION bump 필수.

// 이 게임 고유 CACHE_VERSION — 다른 게임 SW와 충돌 없음
const CACHE_VERSION = '7_reverse_root-v1';
const CACHE_NAME = `hangul-games-${CACHE_VERSION}`;

// 캐시할 정적 자산 목록 (릴리즈 시 수동 또는 스크립트로 갱신)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/utils.js',
  './src/js/tts.js',
  './src/js/audio.js',
  './src/js/pointer.js',
  './src/js/ui.js',
  './src/js/settings.js',
  './src/js/leaderboard.js',
  './src/js/decomp.js',
  './src/js/hint.js',
  './src/js/dock.js',
  './src/js/game.js',
  './src/data/hanja.js',
  './src/data/vocab.js',
  './src/assets/icons/icon-192.png',
  './src/assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
