/**
 * localStorage / IndexedDB 래퍼 (TRD §3.3~3.5, §8)
 * - 모든 접근은 try/catch — Private 브라우징 실패 시 무시하고 게임 진행 (TRD §8.3)
 * - M0: 설정 로드·저장 최소 구현. 리더보드·IndexedDB는 M2에서 완성.
 */

import { SETTINGS_KEY, LEADERBOARD_KEY, DEFAULT_SETTINGS } from './config.js';
import { state } from './state.js';

/** 설정 로드 — 없으면 기본값 유지 (앱 시작 시 main.js가 호출) */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // localStorage 거부(Incognito 등) — 세션 내 메모리에서만 유지
  }
}

/** 설정 저장 — 설정 변경 시 즉시 호출 */
export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    // 실패 무시 (TRD §8.3)
  }
}

/** 리더보드 로드 — 실패 시 빈 배열 */
export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 리더보드 기록 추가 — M2: 최대 50개 관리(accuracy 기준 하위 삭제) 구현 */
export function saveLeaderboard(record) {
  // TODO(M2): record 추가 → LEADERBOARD_MAX 초과 시 하위 항목 삭제 → setItem
  void record;
}

/** 세션 레코드 저장 — M2: IndexedDB(9scg_db/sessions), 실패 시 무시 */
export async function saveSession(record) {
  // TODO(M2): indexedDB.open(DB_NAME, DB_VERSION) Promise 래퍼 + add
  void record;
}

/** 세션 이력 조회 — M2: IndexedDB 전체/필터 조회 */
export async function loadSessions(filter) {
  // TODO(M2)
  void filter;
  return [];
}
