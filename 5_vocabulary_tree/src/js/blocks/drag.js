// Pointer Events 기반 드래그 + 자성 스냅
// stage 좌표계 안에서 모든 계산.
// 정답 슬롯 후보(필요한 다음 음절)에만 스냅 가이드 표시.

import { CONFIG } from '../config.js';
import { vibrate, distance } from '../utils.js';

// 핸들러 = { onDrop({block, syllable, x, y, slotIdx, distance}), getActiveSlots(): [{idx, x, y, requires}] }
export function attachDrag(stageEl, handlers) {
  let dragging = null;
  let activeSlots = [];

  function getStagePoint(ev) {
    const rect = stageEl.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  function nearestSlot(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const s of activeSlots) {
      const d = distance(x, y, s.x, s.y);
      if (d < bestD) { bestD = d; best = s; }
    }
    return { slot: best, dist: bestD };
  }

  function clearHighlights() {
    document.querySelectorAll('.branch-slot.active').forEach(el => el.classList.remove('active'));
  }

  function setHighlight(slotIdx, on) {
    document.querySelectorAll(`.branch-slot[data-slot="${slotIdx}"]`).forEach(el => {
      el.classList.toggle('active', on);
    });
  }

  function onPointerDown(ev) {
    const target = ev.target.closest('.syllable-block');
    if (!target || target.classList.contains('matched')) return;
    ev.preventDefault();
    try { target.setPointerCapture?.(ev.pointerId); } catch {}
    activeSlots = handlers.getActiveSlots();
    const startPt = getStagePoint(ev);
    const tx = Number(target.dataset.x);
    const ty = Number(target.dataset.y);
    dragging = {
      el: target,
      pointerId: ev.pointerId,
      offsetX: startPt.x - tx,
      offsetY: startPt.y - ty,
      currentX: tx,
      currentY: ty,
    };
    target.classList.remove('floating', 'wrong');
    target.classList.add('dragging');
  }

  function onPointerMove(ev) {
    if (!dragging || ev.pointerId !== dragging.pointerId) return;
    ev.preventDefault();
    const pt = getStagePoint(ev);
    let x = pt.x - dragging.offsetX;
    let y = pt.y - dragging.offsetY;
    const { slot, dist } = nearestSlot(x + 28, y + 28);
    clearHighlights();
    if (slot && dist < CONFIG.SNAP_GUIDE_DP) {
      setHighlight(slot.idx, true);
      if (dist < CONFIG.SNAP_STICK_DP) {
        // 흡착: 슬롯 중심으로 보간
        x = slot.x - 28;
        y = slot.y - 28;
        dragging.el.classList.add('snap-near');
      } else {
        dragging.el.classList.remove('snap-near');
      }
    } else {
      dragging.el.classList.remove('snap-near');
    }
    dragging.currentX = x;
    dragging.currentY = y;
    dragging.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function onPointerUp(ev) {
    if (!dragging || ev.pointerId !== dragging.pointerId) return;
    const el = dragging.el;
    const x = dragging.currentX + 28;
    const y = dragging.currentY + 28;
    const { slot, dist } = nearestSlot(x, y);
    clearHighlights();
    el.classList.remove('dragging', 'snap-near');
    const syllable = el.dataset.syllable;
    if (slot && dist < CONFIG.SNAP_GUIDE_DP) {
      handlers.onDrop({
        block: el,
        syllable,
        x, y,
        slotIdx: slot.idx,
        distance: dist,
        slot,
      });
    } else {
      // 슬롯 밖 → 원위치
      const ox = Number(el.dataset.x);
      const oy = Number(el.dataset.y);
      el.style.transform = `translate(${ox}px, ${oy}px)`;
      el.classList.add('floating');
      vibrate(20);
    }
    dragging = null;
  }

  stageEl.addEventListener('pointerdown', onPointerDown);
  stageEl.addEventListener('pointermove', onPointerMove);
  stageEl.addEventListener('pointerup', onPointerUp);
  stageEl.addEventListener('pointercancel', onPointerUp);

  return () => {
    stageEl.removeEventListener('pointerdown', onPointerDown);
    stageEl.removeEventListener('pointermove', onPointerMove);
    stageEl.removeEventListener('pointerup', onPointerUp);
    stageEl.removeEventListener('pointercancel', onPointerUp);
  };
}
