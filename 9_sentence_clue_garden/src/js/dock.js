/**
 * 하단 도크 — 선택지 칩 렌더링·탭·드래그 (TRD §5.2, §5.3)
 * M0: 스텁. M2에서 탭 입력, M3에서 드래그+자성 스냅(±30dp) 완성.
 * game.js와의 런타임 순환 의존은 ES Module 지연 참조로 안전 (TRD §2.3).
 */

import { state } from './state.js';

/**
 * 선택지 칩 렌더링 (M2)
 * - Jua 폰트, 최소 높이 56dp 터치 타겟
 * - pointerdown/pointerup으로 탭 처리, pointermove로 드래그 (M3)
 */
export function renderDock(choices) {
  // TODO(M2): #dock에 칩 생성 (textContent 사용 — XSS 안전)
  void choices;
}

/** 도크 비우기 — 문제 전환 시 호출 (M2) */
export function clearDock() {
  const dock = document.getElementById('dock');
  if (dock) dock.innerHTML = '';
  state.game.selectedChoice = null;
}
