/**
 * sw.js — Service Worker (TRD §6.2)
 *
 * - CACHE_VERSION: '11_idiom_syllable_typer-v3' (config.js 와 동일 값 — SW 는
 *   ES Module import 없이 단독 실행되므로 상수를 복제한다)
 * - install: PRECACHE_URLS 전체 사전 캐시
 * - activate: CACHE_NAME 불일치 구버전 캐시 삭제 (타 게임 캐시는 자신의 SW 가 관리)
 * - fetch: Cache First 전략 (캐시 미스 시 네트워크 폴백)
 */

const CACHE_VERSION = '11_idiom_syllable_typer-v3';
const CACHE_NAME = CACHE_VERSION;

/* 캐시 대상 — 실제 존재하는 정적 자산 전체 */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/data/idioms.js',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/utils.js',
  './src/js/tts.js',
  './src/js/sound.js',
  './src/js/ui.js',
  './src/js/settings.js',
  './src/js/leaderboard.js',
  './src/js/end.js',
  './src/js/game.js',
];

/* install: 사전 캐시 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* activate: 구 버전 캐시 삭제 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* fetch: Cache First 전략 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
