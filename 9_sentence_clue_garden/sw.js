/**
 * Service Worker — 문장 단서 정원 (TRD §6.2)
 *
 * M0: 등록 시 에러가 나지 않는 최소 구현.
 * M4에서 CACHE_ASSETS 프리캐시(install) + 구버전 캐시 정리(activate)
 * + Cache-First/Network-Fallback(fetch) 전략을 완성한다.
 *
 * CACHE_VERSION은 src/js/config.js의 동명 상수와 항상 일치시킬 것
 * (sw.js는 ES Module이 아니라 import 불가).
 */

const CACHE_VERSION = '9_sentence_clue_garden-v1';

self.addEventListener('install', () => {
  // M4: CACHE_ASSETS 전체 프리캐시 (cache.addAll)
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // M4: CACHE_VERSION이 다른 이전 캐시 삭제 (caches.delete)
  event.waitUntil(self.clients.claim());
});

// M4: fetch 핸들러 — Cache-First (정적 자산) + Network-Fallback (폰트 CDN)
