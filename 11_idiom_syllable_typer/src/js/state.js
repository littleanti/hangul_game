/**
 * state.js — 전역 상태 싱글톤 (TRD §3.2)
 */

import { SLOT_COUNT, MIN_FADING_LEVEL } from './config.js';

/** 새 세션 초기값 생성 */
export function createSession() {
  return {
    /** @type {import('../data/idioms.js').IdiomEntry[]} 현재 세션 10개 문항 순서 */
    idioms: [],
    /** 현재 문항 인덱스 (0~9) */
    currentIdx: 0,
    /** 슬롯별 현재 페이딩 레벨 [lv, lv, lv, lv] (슬롯 독립 적용) */
    slotLevels: new Array(SLOT_COUNT).fill(MIN_FADING_LEVEL),
    /** 슬롯 상태: 'empty' | 'filled' | 'correct' | 'wrong' */
    slotStates: new Array(SLOT_COUNT).fill('empty'),
    /** 현재 문항 시도 횟수 */
    attempts: 0,
    /** @type {Set<number>} 오답 슬롯 인덱스 집합 */
    wrongSlots: new Set(),
  };
}

/** 새 결과 초기값 생성 */
export function createResult() {
  return {
    /** 1회 시도 정답 슬롯 수 (총 40슬롯) */
    totalCorrect: 0,
    /** 전체 시도 수 */
    totalAttempts: 0,
    /** @type {string[]} 오답이 발생한 사자성어 word 배열 */
    wrongIdioms: [],
    /** 세션 중 도달한 최고 페이딩 레벨 */
    levelReached: MIN_FADING_LEVEL,
  };
}

/** 전역 상태 싱글톤 */
export const state = {
  settings: {
    /** 1 | 2 | 3 — 현재 페이딩 레벨 (홈 레벨 칩으로 선택) */
    fadingLevel: 1,
    /** 자동 페이딩 진급 여부 (기본 OFF — OFF 면 선택 레벨로 고정 진행) */
    autoFade: false,
    /** TTS 온/오프 */
    ttsEnabled: true,
    /** 효과음 온/오프 */
    soundEnabled: true,
  },
  session: createSession(),
  result: createResult(),
};

/** 세션·결과 상태를 초기값으로 리셋 (설정은 유지) */
export function resetSession() {
  state.session = createSession();
  state.result = createResult();
}

export default state;
