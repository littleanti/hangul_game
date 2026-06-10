/**
 * 드래그 + 자성 스냅 엔진 — Pointer Events (TRD §5.2, §9.3)
 * - setPointerCapture로 마우스/터치/펜 통합, pointermove는 rAF 래핑 (60fps)
 * - findNearestBucket: ±SNAP_RADIUS(20dp) × devicePixelRatio 자성 반경
 *   ※ 거리 기준: 드롭 존 "사각형"까지의 최단 거리(존 내부 = 0).
 *     PRD §7.4 "목표 영역 ±20dp 내 드롭" — 존 중심이 아닌 존 영역 기준이
 *     유아 소근육 정밀도에 맞고 통(가로폭 넓음) 드롭에도 성립한다.
 * - snapToZone: transform 애니메이션 + playSnap()
 * - resetCard: 원위치 복귀
 * - stopDrag: 화면 전환 시 진행 중 드래그 강제 해제 (ui.goTo 공통 부작용)
 */

import { SNAP_RADIUS } from './config.js';
import { playSnap } from './sound.js';

// 진행 중 드래그 (한 번에 1개만 — 유아 멀티터치 방지)
let active = null;

/**
 * 카드에 드래그 배선. 같은 카드에 재호출해도 안전 (핸들러 프로퍼티 덮어쓰기).
 * @param {HTMLElement} cardEl
 * @param {{ id: string, el: HTMLElement }[]} dropZones
 * @param {{ onDrop?: (zoneId: string) => void, onMiss?: () => void,
 *           canDrag?: () => boolean }} [handlers]
 */
export function initDrag(cardEl, dropZones, { onDrop, onMiss, canDrag } = {}) {
  cardEl.style.touchAction = 'none'; // CSS와 이중 보장 — 스크롤 차단

  cardEl.onpointerdown = e => {
    if (active) return;                  // 다른 드래그 진행 중
    if (canDrag && !canDrag()) return;   // 피드백 대기 등 잠금 상태
    e.preventDefault();
    active = {
      cardEl, dropZones, onDrop, onMiss,
      pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY,
      lastX: e.clientX, lastY: e.clientY,
      raf: 0, moved: false,
    };
    try { cardEl.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
    cardEl.classList.remove('snapping');
    cardEl.classList.add('dragging');
  };

  cardEl.onpointermove = e => {
    if (!active || active.cardEl !== cardEl || e.pointerId !== active.pointerId) return;
    active.lastX = e.clientX;
    active.lastY = e.clientY;
    if (active.raf) return; // rAF 1프레임 1회 — 60fps 유지 (TRD §10)
    active.raf = requestAnimationFrame(() => {
      if (!active) return;
      active.raf = 0;
      const dx = active.lastX - active.startX;
      const dy = active.lastY - active.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) active.moved = true;
      cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
      highlightNearest(active.dropZones, active.lastX, active.lastY);
    });
  };

  cardEl.onpointerup = e => {
    if (!active || active.cardEl !== cardEl || e.pointerId !== active.pointerId) return;
    endDrag(e.clientX, e.clientY);
  };

  cardEl.onpointercancel = () => {
    if (active && active.cardEl === cardEl) stopDrag();
  };
}

function endDrag(px, py) {
  const { cardEl, dropZones, onDrop, onMiss, moved, raf, pointerId } = active;
  if (raf) cancelAnimationFrame(raf);
  try { cardEl.releasePointerCapture(pointerId); } catch (e) { /* 무시 */ }
  cardEl.classList.remove('dragging');
  dropZones.forEach(z => z.el.classList.remove('hover-active'));
  active = null;

  if (!moved) {           // 단순 탭 — 드래그 아님, 위치만 정리
    cardEl.style.transform = '';
    return;
  }

  const zone = findNearestBucket(dropZones, px, py);
  if (zone) {
    snapToZone(cardEl, zone.el);
    if (onDrop) onDrop(zone.id);
  } else {
    resetCard(cardEl);
    if (onMiss) onMiss();
  }
}

/** 진행 중 드래그 강제 해제 — 화면 전환 공통 부작용 (TRD §2.4) */
export function stopDrag() {
  if (!active) return;
  const { cardEl, dropZones, raf, pointerId } = active;
  if (raf) cancelAnimationFrame(raf);
  try { cardEl.releasePointerCapture(pointerId); } catch (e) { /* 무시 */ }
  cardEl.classList.remove('dragging', 'snapping');
  cardEl.style.transform = '';
  dropZones.forEach(z => z.el.classList.remove('hover-active'));
  active = null;
}

/** 포인터 → 드롭 존 사각형 최단 거리 (존 내부면 0) */
function distanceToZone(px, py, zoneEl) {
  const r = zoneEl.getBoundingClientRect();
  const dx = Math.max(r.left - px, 0, px - r.right);
  const dy = Math.max(r.top - py, 0, py - r.bottom);
  return Math.hypot(dx, dy);
}

/**
 * ±20dp × devicePixelRatio 반경 내 가장 가까운 드롭 존 (TRD §9.3)
 * @returns {{ id: string, el: HTMLElement } | null}
 */
export function findNearestBucket(dropZones, px, py) {
  const limit = SNAP_RADIUS * (window.devicePixelRatio || 1);
  const hit = dropZones
    .map(z => ({ zone: z, dist: distanceToZone(px, py, z.el) }))
    .filter(({ dist }) => dist <= limit)
    .sort((a, b) => a.dist - b.dist)[0];
  return hit ? hit.zone : null;
}

/** 드래그 중 자성 반경 내 존 하이라이트 */
function highlightNearest(dropZones, px, py) {
  const near = findNearestBucket(dropZones, px, py);
  dropZones.forEach(z => z.el.classList.toggle('hover-active', z === near));
}

/** 존 중앙으로 자성 흡착 — transform 애니메이션 + 스냅 효과음 */
export function snapToZone(cardEl, zoneEl) {
  const c = cardEl.getBoundingClientRect();
  const z = zoneEl.getBoundingClientRect();
  // 현재 transform 값에 중심 간 차이를 더해 존 중앙으로
  const cs = getComputedStyle(cardEl).transform;
  const m = new DOMMatrixReadOnly(cs === 'none' ? undefined : cs);
  const dx = (z.left + z.width / 2) - (c.left + c.width / 2);
  const dy = (z.top + z.height / 2) - (c.top + c.height / 2);
  cardEl.classList.add('snapping');
  cardEl.style.transform = `translate(${m.m41 + dx}px, ${m.m42 + dy}px)`;
  playSnap();
}

/** 카드 원위치 복귀 (스냅 실패·오답 드래그) */
export function resetCard(cardEl) {
  cardEl.classList.add('snapping');
  cardEl.style.transform = '';
  setTimeout(() => cardEl.classList.remove('snapping'), 250);
}
