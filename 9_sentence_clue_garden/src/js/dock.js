/**
 * 하단 도크 — 선택지 칩 렌더링·탭·드래그+자성 스냅 (TRD §5.2, §5.3, §5.5)
 * - pointerdown/move/up으로 탭·드래그 통합 처리 (마우스·터치·펜)
 * - 탭 → 빈칸 슬롯 배치 → 500ms 내 자동 정답 판정 (game.judgeAnswer)
 * - 드래그: 이동 6px 초과 시 드래그 시작 (.dragging — opacity .7 + scale 1.08)
 *   · 빈칸 ±30px(SNAP_RANGE_PX) 내 드롭 → 자성 스냅 흡착 후 배치
 *   · 범위 밖 드롭 → 원 위치 복귀 애니메이션
 * - 배치된 칩 재탭 → 도크 반환 (응답 확정 전까지만)
 * game.js와의 런타임 순환 의존은 ES Module 지연 참조로 안전 (TRD §2.3).
 */

import { state } from './state.js';
import { JUDGE_DELAY_MS, SNAP_RANGE_PX } from './config.js';
import { setScreenTimer } from './ui.js';
import { judgeAnswer } from './game.js';

const DRAG_THRESHOLD_PX = 6;   // 이 거리 이하 이동은 탭으로 판정
const SNAP_ANIM_MS = 150;      // 스냅 이동 애니메이션 (TRD §5.3 — 0.15s ease-out)
const RETURN_ANIM_MS = 180;    // 원 위치 복귀 애니메이션

let judgeTimer = null;  // 배치 → 판정 대기 타이머 (반환 시 취소)
let drag = null;        // 진행 중 포인터 제스처 { chip, pointerId, startX, startY, dx, dy, dragging, fromBlank }

/**
 * 선택지 칩 렌더링 (TRD §4.6 — Jua, 최소 높이 56px 터치 타겟)
 * textContent 사용 — XSS 안전.
 */
export function renderDock(choices) {
  const dock = document.getElementById('dock');
  if (!dock) return;
  dock.innerHTML = '';
  judgeTimer = null;
  drag = null;

  (choices || []).forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'dock-chip';
    chip.textContent = text;
    chip.addEventListener('pointerdown', onPointerDown);
    chip.addEventListener('pointermove', onPointerMove);
    chip.addEventListener('pointerup', onPointerUp);
    chip.addEventListener('pointercancel', onPointerCancel);
    dock.appendChild(chip);
  });
}

/** 도크 비우기 — 문제 전환 시 호출 */
export function clearDock() {
  const dock = document.getElementById('dock');
  if (dock) dock.innerHTML = '';
  judgeTimer = null;
  drag = null;
  state.game.selectedChoice = null;
}

/* ========== 포인터 제스처 (탭 + 드래그 통합) ========== */

function onPointerDown(e) {
  if (state.game.answered || drag) return;
  const chip = e.currentTarget;
  drag = {
    chip,
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    dx: 0,
    dy: 0,
    dragging: false,
    // 빈칸에 배치된 칩은 드래그 없이 탭(반환)만 허용 (TRD §5.5)
    fromBlank: !!chip.closest('.blank'),
  };
  chip.classList.add('pressed');
  try { chip.setPointerCapture(e.pointerId); } catch { /* 미지원 무시 */ }
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  if (drag.fromBlank) return;
  const { chip } = drag;
  drag.dx = e.clientX - drag.startX;
  drag.dy = e.clientY - drag.startY;

  if (!drag.dragging) {
    if (Math.hypot(drag.dx, drag.dy) < DRAG_THRESHOLD_PX) return;
    drag.dragging = true;
    chip.classList.remove('pressed');
    chip.classList.add('dragging'); // opacity .7 + will-change (game.css)
  }
  // scale(1.08) — 집어든 느낌 (TRD §5.3)
  chip.style.transform =
    `translate(${drag.dx}px, ${drag.dy}px) scale(1.08)`;
}

function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const { chip, dragging } = drag;
  drag = null;
  chip.classList.remove('pressed');

  if (!dragging) {
    onChipTap(chip); // 이동 없는 탭
    return;
  }

  const blank = document.querySelector('#sentence-text .blank');
  if (blank && !state.game.answered && isInSnapRange(chip, blank)) {
    snapToBlank(chip, blank);
  } else {
    returnToOrigin(chip);
  }
}

function onPointerCancel(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const { chip, dragging } = drag;
  drag = null;
  chip.classList.remove('pressed');
  if (dragging) returnToOrigin(chip);
}

/* ========== 자성 스냅 (TRD §5.3) ========== */

/** 칩 중심이 빈칸 사각형 ±SNAP_RANGE_PX 범위 안인지 판정 */
function isInSnapRange(chip, blank) {
  const c = chip.getBoundingClientRect();
  const b = blank.getBoundingClientRect();
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  return (
    cx >= b.left - SNAP_RANGE_PX &&
    cx <= b.right + SNAP_RANGE_PX &&
    cy >= b.top - SNAP_RANGE_PX &&
    cy <= b.bottom + SNAP_RANGE_PX
  );
}

/** 스냅 성공 — 빈칸 중심으로 애니메이션 이동 후 배치 */
function snapToBlank(chip, blank) {
  const c = chip.getBoundingClientRect();
  const b = blank.getBoundingClientRect();
  // 현재 transform 기준 추가 이동량 — translate는 누적이므로 현 위치 차이만 더한다
  const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(chip.style.transform || '');
  const curX = match ? parseFloat(match[1]) : 0;
  const curY = match ? parseFloat(match[2]) : 0;
  const tx = curX + (b.left + b.width / 2) - (c.left + c.width / 2);
  const ty = curY + (b.top + b.height / 2) - (c.top + c.height / 2);

  chip.style.transition = `transform ${SNAP_ANIM_MS / 1000}s ease-out`;
  chip.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;
  afterTransition(chip, SNAP_ANIM_MS, () => {
    clearDragStyles(chip);
    placeChip(chip);
  });
}

/** 스냅 실패 — 원 위치(도크)로 부드럽게 복귀 */
function returnToOrigin(chip) {
  chip.style.transition = `transform ${RETURN_ANIM_MS / 1000}s ease-out`;
  chip.style.transform = '';
  afterTransition(chip, RETURN_ANIM_MS, () => clearDragStyles(chip));
}

/** transitionend(1회) + 안전 타임아웃 — 둘 중 먼저 온 쪽만 실행 */
function afterTransition(chip, ms, fn) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    fn();
  };
  chip.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, ms + 80);
}

function clearDragStyles(chip) {
  chip.classList.remove('dragging');
  chip.style.transition = '';
  chip.style.transform = '';
}

/* ========== 배치·반환 (TRD §5.2, §5.5) ========== */

/**
 * 칩 탭 처리
 * - 도크 칩 → 빈칸 배치 + 500ms 판정 예약
 * - 빈칸의 칩 → 도크 반환 + 판정 취소 (응답 확정 전까지만)
 */
function onChipTap(chip) {
  if (state.game.answered) return;
  const blank = document.querySelector('#sentence-text .blank');
  const dock = document.getElementById('dock');
  if (!blank || !dock) return;

  // 빈칸에 배치된 칩 재탭 → 도크 반환 (선택 취소)
  if (chip.parentElement === blank) {
    cancelJudge();
    dock.appendChild(chip);
    blank.classList.remove('filled');
    state.game.selectedChoice = null;
    return;
  }

  placeChip(chip);
}

/** 칩을 빈칸에 배치 → 500ms 내 자동 판정 (TRD §5.2) — 탭·드래그 공용 */
function placeChip(chip) {
  if (state.game.answered) return;
  const blank = document.querySelector('#sentence-text .blank');
  const dock = document.getElementById('dock');
  if (!blank || !dock) return;

  // 다른 칩이 이미 배치돼 있으면 먼저 도크로 반환
  const existing = blank.querySelector('.dock-chip');
  if (existing && existing !== chip) {
    cancelJudge();
    dock.appendChild(existing);
  }
  if (chip.parentElement === blank) return;

  blank.appendChild(chip);
  blank.classList.add('filled');
  state.game.selectedChoice = chip.textContent;
  judgeTimer = setScreenTimer(() => {
    judgeTimer = null;
    judgeAnswer(chip);
  }, JUDGE_DELAY_MS);
}

function cancelJudge() {
  if (judgeTimer !== null) {
    clearTimeout(judgeTimer);
    judgeTimer = null;
  }
}
