/**
 * 전역 상태 싱글톤 (TRD §3.2)
 * 모든 모듈이 이 객체를 공유 — 직렬화 대상은 storage.js가 관리.
 */

import { DEFAULT_SETTINGS } from './config.js';

export const state = {
  settings: { ...DEFAULT_SETTINGS },

  game: {
    questions: [],        // 이번 세션 문제 배열 (SentenceItem[])
    currentIdx: 0,
    score: 0,
    wrongItems: [],       // 오답 항목 { item, chosen }
    hintLevel: 0,         // 현재 문제의 단서 단계 (0=비표시, 1, 2, 3)
    answered: false,      // 현재 문제 응답 완료 여부
    selectedChoice: null, // 탭·드래그로 선택된 선택지 텍스트
  },

  lastGameIds: new Set(), // 직전 세션 문제 ID — 연속 중복 방지 (메모리만, 미저장)
};

/** 새 세션 시작 시 game 하위 상태 초기화 (M2에서 startGame()이 호출) */
export function resetGameState() {
  state.game.questions = [];
  state.game.currentIdx = 0;
  state.game.score = 0;
  state.game.wrongItems = [];
  state.game.hintLevel = 0;
  state.game.answered = false;
  state.game.selectedChoice = null;
}
