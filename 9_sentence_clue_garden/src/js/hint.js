/**
 * 3단 단서 페이딩 (TRD §5.4, §9.2)
 * M0: 스텁. M3에서 renderHint()·힌트 버튼 핸들러 완성.
 *
 * 페이딩 단계:
 *   0 — 단서 없음 (초기)
 *   1 — 음뜻 라벨 + 노란 하이라이트
 *   2 — 하이라이트만 (라벨 숨김)
 *   3 — 단서 완전 제거 + 힌트 버튼 비활성화
 */

import { state } from './state.js';
import { MAX_HINT_LEVEL } from './config.js';

/**
 * 현재 문제의 단서를 level에 맞게 렌더링 (M3)
 * highlight 인덱스 치환은 createTextNode + insertBefore로 XSS 없이 처리 (TRD §9.2)
 */
export function renderHint(item, level) {
  // TODO(M3)
  void item; void level;
}

/** 새 문제 진입 시 단서 상태 초기화 (M3) */
export function resetHint() {
  state.game.hintLevel = 0;
  // TODO(M3): 단서 DOM 제거 + 힌트 버튼 활성화 복원
}

/** 힌트 버튼 탭 — hintLevel 1씩 증가, MAX 도달 시 버튼 비활성화 (M3) */
export function onHintButton() {
  if (state.game.answered) return;
  if (state.game.hintLevel >= MAX_HINT_LEVEL) return;
  state.game.hintLevel += 1;
  // TODO(M3): renderHint(현재 문제, state.game.hintLevel) + hintLevelUsed 기록
}
