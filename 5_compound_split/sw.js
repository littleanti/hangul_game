/**
 * Service Worker — Network First, 캐시 폴백 (TRD §7.2)
 * CACHE_VERSION은 게임 고유 접두사 — 같은 오리진의 타 게임과 캐시 충돌 방지.
 *
 * [전략 — M1-1 버그의 구조적 해결]
 * 초기 Cache First 전략은 콘텐츠(words.js 등)가 갱신되어도 sw.js 자체가
 * 무변경이면 브라우저가 SW 재설치를 트리거하지 않아 프리캐시가 영구 고착되는
 * 문제가 있었다(BUG.md M1-1). 매 콘텐츠 갱신마다 CACHE_VERSION을 수동으로
 * 올리는 규칙은 누락 시 동일 버그가 재발하므로, 전략 자체를 Network First로
 * 전환한다:
 *   - 온라인: 항상 네트워크에서 최신 응답을 받아 서빙하고, 성공 응답을
 *     캐시에 덮어써 캐시를 항상 최신으로 유지한다.
 *   - 오프라인: fetch 실패 시 캐시(마지막 성공 응답)로 폴백 — PWA 오프라인
 *     동작은 그대로 유지된다.
 * 이로써 sw.js 바이트 변경 없이도 콘텐츠 갱신이 즉시 반영된다.
 * CACHE_VERSION은 v2로 올려, M0 시점에 고착된 v1 캐시(플레이스홀더 words.js)를
 * activate 단계에서 확실히 폐기한다.
 */

const CACHE_VERSION = '5_compound_split-v2';
const CACHE_NAME = CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/data/words.js',
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
  './src/js/game.js',
];

// install: 사전 캐시 (최초 방문 직후부터 오프라인 동작 보장)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// activate: 구버전 캐시 삭제 (M0 v1 고착 캐시 폐기 포함)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: Network First → 캐시 폴백. 성공 응답은 캐시에 갱신 저장.
self.addEventListener('fetch', e => {
  const { request } = e;
  // 같은 오리진의 GET만 처리 — 외부 리소스(Google Fonts 등)·비GET은 브라우저 기본 동작
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE_NAME).then(c => c.put(request, copy)));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(cached =>
          cached || (request.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
