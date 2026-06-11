// pointer.js — Pointer Events 통합 (M2 본 구현, TRD §6.1)
// setPointerCapture 기반 드래그 추적, 탭 판별(이동 < SNAP_DIST px), releaseAll.
// IME 완전 회피 — 모든 입력은 Pointer Events로만 처리.

import { SNAP_DIST } from './config.js';
import { dist } from './utils.js';

/** @type {Map<number, object>} pointerId → 진행 중 제스처 세션 */
const active = new Map();

/**
 * 요소에 탭/드래그 통합 제스처를 부착한다.
 * - pointerdown: setPointerCapture 후 세션 시작
 * - pointermove: 누적 이동 ≥ SNAP_DIST(8px) 시 드래그로 승격
 * - pointerup:   드래그였으면 onDragEnd, 아니면 onTap (탭 판별: 이동 < 8px)
 * - pointercancel: cancelled=true로 onDragEnd
 *
 * @param {HTMLElement} el
 * @param {{ onTap?: (e) => void,
 *           onDragStart?: (e) => void,
 *           onDragMove?: (e, dx, dy) => void,
 *           onDragEnd?: (e|null, dx, dy, cancelled) => void }} handlers
 */
export function attach(el, handlers = {}) {
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch { /* 무시 */ }
    active.set(e.pointerId, {
      el,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastDx: 0,
      lastDy: 0,
      dragging: false,
      handlers,
    });
  });

  el.addEventListener('pointermove', (e) => {
    const s = active.get(e.pointerId);
    if (!s || s.el !== el) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    s.lastDx = dx;
    s.lastDy = dy;
    if (!s.dragging && dist(0, 0, dx, dy) >= SNAP_DIST) {
      s.dragging = true; // 이동 ≥ 8px → 드래그 승격
      s.handlers.onDragStart?.(e);
    }
    if (s.dragging) s.handlers.onDragMove?.(e, dx, dy);
  });

  const finish = (e, cancelled) => {
    const s = active.get(e.pointerId);
    if (!s || s.el !== el) return;
    active.delete(e.pointerId);
    try { el.releasePointerCapture(e.pointerId); } catch { /* 무시 */ }
    if (s.dragging) {
      s.handlers.onDragEnd?.(e, e.clientX - s.startX, e.clientY - s.startY, cancelled);
    } else if (!cancelled) {
      s.handlers.onTap?.(e); // 이동 < 8px → 탭
    }
  };
  el.addEventListener('pointerup', (e) => finish(e, false));
  el.addEventListener('pointercancel', (e) => finish(e, true));
}

/** 화면 전환 등에서 모든 포인터 캡처 해제 + 진행 중 드래그 취소 (TRD §2.3 부작용) */
export function releaseAll() {
  for (const s of active.values()) {
    try { s.el.releasePointerCapture(s.pointerId); } catch { /* 무시 */ }
    if (s.dragging) {
      // 취소 통지 — dock이 transform 등 시각 상태를 원복하도록
      s.handlers.onDragEnd?.(null, s.lastDx, s.lastDy, true);
    }
  }
  active.clear();
}
