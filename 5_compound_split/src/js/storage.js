/**
 * localStorage 래퍼 — 접두사 'compound_split_' (TRD §3.3, §9.2)
 * 모든 I/O는 try/catch — Incognito·저장소 차단 환경에서도 게임은 정상 동작.
 */

import { SETTINGS_KEY, DEFAULT_SETTINGS } from './config.js';
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
