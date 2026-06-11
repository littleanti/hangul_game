/**
 * 하단 도크 — 선택지 칩 렌더링·탭 입력 (TRD §5.2, §5.5)
 * - pointerdown/pointerup으로 탭 처리 (마우스·터치·펜 통합)
 * - 탭 → 빈칸 슬롯 배치 → 500ms 내 자동 정답 판정 (game.judgeAnswer)
 * - 배치된 칩 재탭 → 도크 반환 (응답 확정 전까지만)
 * - 드래그+자성 스냅(±30dp)은 M3에서 추가
 * game.js와의 런타임 순환 의존은 ES Module 지연 참조로 안전 (TRD §2.3).
 */

import { state } from './state.js';
import { JUDGE_DELAY_MS } from './config.js';
import { setScreenTimer } from './ui.js';
import { judgeAnswer } from './game.js';

let judgeTimer = null;   // 배치 → 판정 대기 타이머 (반환 시 취소)
let pressedChip = null;  // pointerdown된 칩 — pointerup과 짝 맞춰 탭 판정

/**
 * 선택지 칩 렌더링 (TRD §4.6 — Jua, 최소 높이 56px 터치 타겟)
 * textContent 사용 — XSS 안전.
 */
export function renderDock(choices) {
  const dock = document.getElementById('dock');
  if (!dock) return;
  dock.innerHTML = '';
  judgeTimer = null;
  pressedChip = null;

  (choices || []).forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'dock-chip';
    chip.textContent = text;
    chip.addEventListener('pointerdown', onChipPointerDown);
    chip.addEventListener('pointerup', onChipPointerUp);
    chip.addEventListener('pointercancel', onChipPointerCancel);
    dock.appendChild(chip);
  });
}

/** 도크 비우기 — 문제 전환 시 호출 */
export function clearDock() {
  const dock = document.getElementById('dock');
  if (dock) dock.innerHTML = '';
  judgeTimer = null;
  pressedChip = null;
  state.game.selectedChoice = null;
}

function onChipPointerDown(e) {
  if (state.game.answered) return;
  pressedChip = e.currentTarget;
  pressedChip.classList.add('pressed');
}

function onChipPointerUp(e) {
  const chip = e.currentTarget;
  const wasPressed = pressedChip === chip;
  if (pressedChip) pressedChip.classList.remove('pressed');
  pressedChip = null;
  if (!wasPressed) return;
  onChipTap(chip);
}

function onChipPointerCancel() {
  if (pressedChip) pressedChip.classList.remove('pressed');
  pressedChip = null;
}

/**
 * 칩 탭 처리 (TRD §5.2, §5.5)
 * - 도크 칩 → 빈칸 배치 + 500ms 판정 예약
 * - 빈칸의 칩 → 도크 반환 + 판정 취소 (응답 확정 전까지만)
 */
function onChipTap(chip) {
  if (state.game.answered) return;
  const blank = document.querySelector('#sentence-text .blank');
  const dock = document.getElementById('dock');
  if (!blank || !dock) return;

  // 1) 빈칸에 배치된 칩 재탭 → 도크 반환 (선택 취소)
  if (chip.parentElement === blank) {
    if (judgeTimer !== null) {
      clearTimeout(judgeTimer);
      judgeTimer = null;
    }
    dock.appendChild(chip);
    blank.classList.remove('filled');
    state.game.selectedChoice = null;
    return;
  }

  // 2) 다른 칩이 이미 배치돼 있으면 먼저 도크로 반환
  const existing = blank.querySelector('.dock-chip');
  if (existing) {
    dock.appendChild(existing);
    if (judgeTimer !== null) {
      clearTimeout(judgeTimer);
      judgeTimer = null;
    }
  }

  // 3) 칩을 빈칸에 배치 → 500ms 내 자동 판정 (TRD §5.2)
  blank.appendChild(chip);
  blank.classList.add('filled');
  state.game.selectedChoice = chip.textContent;
  judgeTimer = setScreenTimer(() => {
    judgeTimer = null;
    judgeAnswer(chip);
  }, JUDGE_DELAY_MS);
}
