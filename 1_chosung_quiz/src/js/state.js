/**
 * 앱 상태
 * 전역 싱글톤으로 사용합니다.
 */

import { DEFAULT_SETTINGS } from './config.js';
import { CATEGORIES } from '../data/words.js';

function initialSettings() {
  return {
    ...DEFAULT_SETTINGS,
    categories: new Set(CATEGORIES),
  };
}

export const state = {
  settings: initialSettings(),
  game: {
    questions: [],
    currentIdx: 0,
    score: 0,
    wrongAnswers: [],
    revealed: false,
    timerHandle: null,
    timeLeft: 0,
  },
  // 직전 게임에 사용된 단어(word 문자열 Set) — 연속 플레이 시 중복 제한용
  lastGameWords: new Set(),
  // 유저가 설정 화면에서 명시적으로 변경한 항목만 기록 (레벨 버튼 기본값보다 우선)
  userOverrides: {},
};

export function resetSettingsToDefault() {
  state.settings = initialSettings();
  state.userOverrides = {};
}

export function resetGame() {
  state.game = {
    questions: [],
    currentIdx: 0,
    score: 0,
    wrongAnswers: [],
    revealed: false,
    timerHandle: null,
    timeLeft: 0,
  };
}
