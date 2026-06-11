/**
 * Service Worker — 문장 단서 정원 (TRD §6.2, PLAN M4)
 *
 * 전략: Cache-First (정적 자산) + Network-Fallback.
 *  - install: CACHE_ASSETS 전체 프리캐시 (cache.addAll) — 최초 방문 직후 오프라인 보장
 *  - activate: CACHE_VERSION이 다른 이전 캐시 삭제 (caches.delete)
 *  - fetch: 캐시 우선 응답 → 미스 시 네트워크 → 성공 응답은 캐시에 갱신 저장
 *           (네트워크도 실패한 navigate 요청은 index.html 폴백)
 *
 * CACHE_VERSION은 src/js/config.js의 동명 상수와 항상 일치시킬 것
 * (sw.js는 ES Module이 아니라 import 불가). 자산 갱신 시 suffix를 올린다 (-v2, ...).
 * 같은 오리진의 타 게임 SW와 캐시 이름 충돌을 방지하는 게임 고유 접두사를 사용한다.
 */

const CACHE_VERSION = '9_sentence_clue_garden-v1';
const CACHE_NAME = CACHE_VERSION;

// 모든 정적 자산 열거 — css/js/data/아이콘 누락 없이 (PLAN M4)
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
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
  './src/js/sound.js',
  './src/js/ui.js',
  './src/js/hint.js',
  './src/js/dock.js',
  './src/js/settings.js',
  './src/js/leaderboard.js',
  './src/js/game.js',
  './src/data/sentences.js',
  'https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap',
];

// install: 전체 프리캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

// activate: 구버전(이름이 다른) 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch: Cache-First + Network-Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          // 성공 응답(같은 오리진 ok + 폰트 CDN opaque 포함)은 캐시에 저장
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            );
          }
          return res;
        })
        .catch(() => {
          // 오프라인 + 캐시 미스: 페이지 이동 요청이면 앱 셸로 폴백
          if (request.mode === 'navigate') return caches.match('./index.html');
          return undefined;
        });
    })
  );
});
