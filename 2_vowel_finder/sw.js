/**
 * Service Worker — 오프라인 정적 에셋 캐시 (TRD §6.2)
 * 전략: cache-first (TRD 스펙 그대로). 캐시 미스 시 네트워크 폴백.
 *
 * [개발 시 주의 — SW 캐시 해제 방법]
 * cache-first라서 코드 수정 후에도 캐시된 구버전이 응답될 수 있다. 검증 시:
 *   1) DevTools → Application → Service Workers → "Update on reload" 체크 + "Unregister"
 *   2) DevTools → Application → Storage → "Clear site data"
 *   3) 콘솔에서:
 *      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
 *      caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
 *      이후 강력 새로고침(Ctrl+Shift+R)
 * 배포 시 코드 변경이 있으면 CACHE_VERSION 숫자를 올려 activate에서 구캐시를 정리한다.
 */

const CACHE_VERSION = '2_vowel_finder-v1';
// 타 게임 캐시와 충돌 없음:
//   1_chosung_quiz: 'chosung-quiz-v*'
//   3_syllable_assembly: '3_syllable_assembly-v*'

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/tts.js',
  './src/js/sound.js',
  './src/js/ui.js',
  './src/js/drag.js',
  './src/js/leaderboard.js',
  './src/js/settings.js',
  './src/js/level0.js',
  './src/js/level1.js',
  './src/js/onboarding.js',
  './src/data/vowels.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Google Fonts는 온라인 필요 — 캐시에서 제외 (TTS도 마찬가지)
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
