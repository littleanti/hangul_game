// storage.js — localStorage 래퍼, '7rr:' 접두사 강제 (TRD §7.3)
// Incognito/Private Mode 등 localStorage 실패 시에도 앱이 정상 동작해야 한다.

import { STORAGE_PREFIX } from './config.js';

function key(k) { return `${STORAGE_PREFIX}${k}`; }

export function get(k, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key(k))) ?? fallback; }
  catch { return fallback; }
}

export function set(k, v) {
  try { localStorage.setItem(key(k), JSON.stringify(v)); }
  catch { /* Incognito 모드 등 실패 시 무시 */ }
}

export function remove(k) {
  try { localStorage.removeItem(key(k)); }
  catch { /* 무시 */ }
}

/**
 * '7rr:leaderboard'에 점수 추가 — 점수 내림차순 정렬, 최대 10개 유지 (TRD §9.2, M4).
 * scoreObj: { score, stars, correctCount, totalCount, hintLevel, playedAt }
 * 저장 실패(5MB 한도·Private Mode 등)는 set() 내부 try/catch로 graceful 처리.
 * @returns 저장된 상위 10개 목록
 */
export function saveScore(scoreObj) {
  const prev = get('leaderboard', []);
  const list = Array.isArray(prev) ? [...prev, scoreObj] : [scoreObj];
  list.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
  const top10 = list.slice(0, 10);
  set('leaderboard', top10);
  return top10;
}
