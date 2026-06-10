/**
 * 전역 상태 싱글톤 (TRD §3.2)
 * settings / game / session 세 블록 — 모든 모듈이 이 객체를 공유.
 */

import { DEFAULT_SETTINGS } from './config.js';
import { WORDS } from '../data/words.js';

/**
 * 콘텐츠 데이터 재노출 (TRD §2.2 — state.js → config.js, words.js)
 * M2의 buildQueue(words, questionCount)가 출제 풀로 사용한다.
 */
export { WORDS };

export const state = {
  settings: { ...DEFAULT_SETTINGS },
  game: {
    queue: [],          // 이번 세션 출제 순서 (CompoundWord[])
    currentIdx: 0,      // 현재 카드 인덱스
    correctCount: 0,    // 정답 수
    errorCount: 0,      // 잘못된 분절 시도 수
    popupOpen: false,   // 조각 팝업 표시 여부
    popupDwellMs: 0,    // 팝업 체류 시간 누산 (ms)
  },
  session: {
    startedAt: 0,
    completedAt: null,
  },
};

/** 게임 블록 초기화 — 새 게임 시작 시 호출 */
export function resetGame() {
  state.game.queue = [];
  state.game.currentIdx = 0;
  state.game.correctCount = 0;
  state.game.errorCount = 0;
  state.game.popupOpen = false;
  state.game.popupDwellMs = 0;
}

/** 세션 시작 타임스탬프 기록 */
export function startSession() {
  state.session.startedAt = Date.now();
  state.session.completedAt = null;
}
