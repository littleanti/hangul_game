/**
 * localStorage 영속화 — 접두사 'vowel_finder_' (TRD §3.3, §8.1)
 * 모든 I/O는 try/catch — Incognito·저장소 차단 환경에서도 게임은 정상 동작.
 */

import { DEFAULT_SETTINGS, SCORE_MAX } from './config.js';
import { state } from './state.js';

const SETTINGS_KEY = 'vowel_finder_settings';
const SCORES_KEY = 'vowel_finder_scores';

export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch (e) {
    /* 무시 — Incognito 등 저장 불가 환경 */
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    // 기본값 머지 보정 (TRD §8.1) — 구버전 저장값에 없는 키(예: l1Count)는 기본값으로 동작
    state.settings = { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    /* 무시 — 손상된 JSON·저장 불가 환경이면 기본값 유지 */
  }
}

/**
 * 세션 기록 저장 — 최신 SCORE_MAX(20)건만 유지 (TRD §8.1)
 * @param {{ ts:number, l0Accuracy:number, l1Accuracy:number,
 *           dragDone:boolean, durationMs:number, stars:1|2|3 }} record
 */
export function saveScore(record) {
  try {
    const scores = loadScores();
    scores.push(record);
    const trimmed = scores.slice(-SCORE_MAX);
    localStorage.setItem(SCORES_KEY, JSON.stringify(trimmed));
  } catch (e) {
    /* 무시 */
  }
}

/** @returns {Array} 세션 기록 배열 (오래된 순) — 실패 시 빈 배열 */
export function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * 별점 산출 (TRD §8.1)
 *   3점: L0 ≥ 80% AND L1 ≥ 75% AND dragDone
 *   2점: L0 ≥ 60% AND L1 ≥ 50%
 *   1점: 게임 완료 (정답률 미달)
 * @param {number} l0Acc 0.0~1.0
 * @param {number} l1Acc 0.0~1.0
 * @param {boolean} dragDone
 * @returns {1|2|3}
 */
export function calcStars(l0Acc, l1Acc, dragDone) {
  if (l0Acc >= 0.8 && l1Acc >= 0.75 && dragDone) return 3;
  if (l0Acc >= 0.6 && l1Acc >= 0.5) return 2;
  return 1;
}
