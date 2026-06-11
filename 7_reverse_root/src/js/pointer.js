// pointer.js — Pointer Events 통합 (M0 스텁 → M2 본 구현, TRD §6.1)
// setPointerCapture 기반 드래그 추적, 탭 판별(이동 < SNAP_DIST px).

const activeCaptures = new Set(); // { el, pointerId }

/** M2: 드래그 시작 시 등록 */
export function track(el, pointerId) {
  try { el.setPointerCapture(pointerId); } catch { /* 무시 */ }
  activeCaptures.add({ el, pointerId });
}

/** 화면 전환 등에서 모든 포인터 캡처 해제 (TRD §2.3 부작용) */
export function releaseAll() {
  for (const { el, pointerId } of activeCaptures) {
    try { el.releasePointerCapture(pointerId); } catch { /* 무시 */ }
  }
  activeCaptures.clear();
}
