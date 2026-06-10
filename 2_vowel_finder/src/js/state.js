/**
 * 앱 상태 — settings / game / session 3-레이어 (TRD §3.2)
 * 전역 싱글톤으로 사용합니다.
 * 순수 알고리즘 함수(shuffle, buildLevel0Questions, buildLevel1Queue)도
 * 여기서 export — DOM 의존 없음, 단독 import 가능.
 */

import { DEFAULT_SETTINGS, SCAFFOLD_FADE_RATIO } from './config.js';
import { VOWELS, LEVEL0_ROUNDS } from '../data/vowels.js';

function initialGame() {
  return {
    phase: 'idle',      // 'idle' | 'level0' | 'level1' | 'onboarding' | 'end'
    // Level 0
    l0Questions: [],    // 이번 세션 Level 0 문항 (셔플 후 추출)
    l0Idx: 0,           // 현재 문항 인덱스
    l0Correct: 0,       // 정답 수
    // Level 1
    l1Queue: [],        // 10개 모음 셔플 큐
    l1Idx: 0,
    l1Correct: 0,
    // 공통
    answered: false,    // 현재 문항 답변 완료 여부 (중복 탭 방지)
    scaffoldLevel: 0,   // 0 | 1 — 0=아이콘+레이블+예시, 1=아이콘+레이블
  };
}

export const state = {
  settings: { ...DEFAULT_SETTINGS },
  game: initialGame(),
  session: {
    startedAt: 0,       // Date.now() — 세션 시작 타임스탬프
  },
};

export function resetGame() {
  state.game = initialGame();
}

export function startSession() {
  state.session.startedAt = Date.now();
}

/* ===== 순수 알고리즘 (TRD §9.1~9.2, §9.4) ===== */

/** Fisher–Yates 셔플 — 원본을 제자리에서 섞고 같은 배열을 반환 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Level 0 문항 풀 구성 (TRD §9.1)
 * LEVEL0_ROUNDS 셔플 후 vowelCount개 추출 — 정답 모음 세션 내 중복 없음.
 * 각 문항에 choices(정답 + 오답 3개 셔플) 추가.
 */
export function buildLevel0Questions(vowelCount) {
  const shuffled = shuffle([...LEVEL0_ROUNDS]);
  const selected = shuffled.slice(0, vowelCount);
  return selected.map(r => ({
    ...r,
    choices: shuffle([r.answer, ...r.distractors]),
  }));
}

/**
 * Level 1 모음 큐 구성 (TRD §9.2) — 10개 모음 전체 셔플
 */
export function buildLevel1Queue() {
  return shuffle([...VOWELS]);
}

/**
 * Level 1 비계 단계 산출 (TRD §9.4, 2단 비계) — 문항 인덱스(0-based) 기준
 * 전반(idx < ⌈total/2⌉) → 0 (아이콘+레이블+예시) / 후반 → 1 (아이콘+레이블)
 * @returns {0|1}
 */
export function getScaffoldLevel(idx, total) {
  return idx >= Math.ceil(total * SCAFFOLD_FADE_RATIO) ? 1 : 0;
}
