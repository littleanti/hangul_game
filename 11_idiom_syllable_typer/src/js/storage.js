/**
 * storage.js — localStorage 래퍼 (try/catch, Incognito 안전)
 *
 * 모든 키는 STORAGE_PREFIX('11ist_')를 붙여 저장한다.
 * localStorage 접근 실패(Incognito·쿼터 초과 등) 시 조용히 무시하고
 * 앱은 정상 동작을 유지한다 (TRD §8.1, §12).
 */

import { STORAGE_PREFIX } from './config.js';

/**
 * 값 저장 (JSON 직렬화). 실패 시 무시.
 * @param {string} key   접두사 제외 키 (예: 'settings')
 * @param {*}      value JSON 직렬화 가능한 값
 */
export function save(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    /* Incognito 모드 등 — 무시 */
  }
}

/**
 * 값 로드 (JSON 역직렬화). 실패·부재 시 fallback 반환.
 * @param {string} key      접두사 제외 키
 * @param {*}      fallback 기본값
 * @returns {*}
 */
export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * 키 삭제. 실패 시 무시.
 * @param {string} key 접두사 제외 키
 */
export function remove(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    /* 무시 */
  }
}

/**
 * 완료한 사자성어를 `11ist_completedIdioms`(string[])에 누적 기록.
 * S12(`12_four-character_idiom_crossword`) 공유 스키마 호환 (TRD §8.4).
 * @param {string} word 사자성어 (예: "일석이조")
 */
export function markIdiomCompleted(word) {
  const completed = new Set(load('completedIdioms', []));
  completed.add(word);
  save('completedIdioms', [...completed]);
}
