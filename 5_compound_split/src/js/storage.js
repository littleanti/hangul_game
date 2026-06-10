/**
 * localStorage 래퍼 — 접두사 'compound_split_' (TRD §3.3, §9.2)
 * 모든 I/O는 try/catch — Incognito·저장소 차단 환경에서도 게임은 정상 동작.
 */

import {
  SETTINGS_KEY,
  PROGRESS_KEY,
  LEADERBOARD_KEY,
  LEADERBOARD_MAX,
  DEFAULT_SETTINGS,
} from './config.js';
import { state } from './state.js';

/**
 * 키의 JSON 값을 읽는다 — 실패(미존재·손상·차단) 시 defaultValue 반환.
 * @param {string} key
 * @param {*} defaultValue
 */
export function loadData(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * 값을 JSON으로 저장한다 — 실패 시 무시 (앱 정상 동작 유지).
 * @param {string} key
 * @param {*} value
 */
export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* 무시 — Incognito 등 저장 불가 환경 */
  }
}

/** 설정 로드 — 기본값 위에 저장값 병합 (앱 시작 시 호출) */
export function loadSettings() {
  const saved = loadData(SETTINGS_KEY, {});
  state.settings = { ...DEFAULT_SETTINGS, ...saved };
}

/** 설정 저장 — 설정 변경 즉시 호출 */
export function saveSettings() {
  saveData(SETTINGS_KEY, state.settings);
}

/**
 * 세션 완료 기록을 리더보드에 추가 (TRD §3.3)
 * 배열 끝에 추가(시간순) — 최대 LEADERBOARD_MAX(20)건 초과 시 가장 오래된 항목 삭제.
 * @param {{ts:number, fadingLevel:number, questionCount:number,
 *          correctCount:number, errorCount:number, durationMs:number}} record
 */
export function saveLeaderboardRecord(record) {
  const saved = loadData(LEADERBOARD_KEY, []);
  const records = Array.isArray(saved) ? saved : [];
  records.push(record);
  while (records.length > LEADERBOARD_MAX) records.shift(); // 오래된 것부터 삭제
  saveData(LEADERBOARD_KEY, records);
}

/**
 * 진척 갱신 (TRD §3.3 — compound_split_progress)
 * 페이딩 레벨별 최고 연속 정답 수·완료 횟수를 누적한다.
 * @param {1|2|3} fadingLevel
 * @param {number} bestStreak 이번 세션 최고 연속 정답 수
 */
export function updateProgress(fadingLevel, bestStreak) {
  const saved = loadData(PROGRESS_KEY, {});
  const progress = saved && typeof saved === 'object' ? saved : {};
  const key = String(fadingLevel);
  const entry = progress[key] || { bestStreak: 0, completedCount: 0 };
  entry.bestStreak = Math.max(entry.bestStreak || 0, bestStreak || 0);
  entry.completedCount = (entry.completedCount || 0) + 1;
  progress[key] = entry;
  saveData(PROGRESS_KEY, progress);
}
