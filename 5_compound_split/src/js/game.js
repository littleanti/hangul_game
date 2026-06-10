/**
 * 게임 로직 — 출제·탭 검출·피드백·종료 (TRD §5)
 * M0: 화면 전환 스캐폴딩만. 카드 렌더링·히트 검출·팝업은 M2에서 구현.
 */

import { resetGame, startSession } from './state.js';
import { goTo } from './ui.js';

/**
 * 게임 시작 — 시작 화면·완료 화면 "다시 하기"에서 호출.
 * M2: buildQueue() + renderCard() 구현 예정.
 */
export function startGame() {
  resetGame();
  startSession();
  goTo('game-screen');
  renderPlaceholder();
}

/** M0 임시 표시 — M2에서 renderCard()로 대체 */
function renderPlaceholder() {
  const indicator = document.getElementById('progress-indicator');
  if (indicator) indicator.textContent = '준비 중이에요 (M2에서 구현)';
}
