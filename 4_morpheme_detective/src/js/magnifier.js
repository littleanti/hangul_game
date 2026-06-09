// 돋보기 + 자석 흡착 — TRD §3.3 / PRD F6
// pointermove 위치 추적, 가까운 hit zone 화면 좌표 거리 ≤ MAGNET_PX 시 스냅.
// 마우스/터치 공통. 마우스 사용 시 pointerenter/leave 로 자연스러운 show/hide.
import { attachPointer } from './pointer.js';
import { MAGNET_PX }     from './config.js';

const MAG_ID = 'magnifier';
let cleanupFn  = null;
let extraOffs  = [];
let magEl      = null;
let stageEl    = null;
let lastSnap   = null;        // { el, cx, cy, d } | null

function ensureMagEl() {
  let el = document.getElementById(MAG_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = MAG_ID;
  el.className = 'magnifier';
  document.body.appendChild(el);
  return el;
}

function position(clientX, clientY) {
  if (!magEl) return;
  magEl.style.left = `${clientX}px`;
  magEl.style.top  = `${clientY}px`;
}

function snapToNearestHitZone(clientX, clientY) {
  if (!stageEl) return null;
  const zones = stageEl.querySelectorAll('.hit-zone');
  let best = null;
  let bestDist = Infinity;
  zones.forEach(z => {
    const r = z.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const d  = Math.hypot(cx - clientX, cy - clientY);
    if (d < bestDist) { bestDist = d; best = { el: z, cx, cy, d }; }
  });
  if (best && best.d <= MAGNET_PX) return best;
  return null;
}

function applySnapDataset(snap) {
  if (!magEl) return;
  if (snap && snap.el) {
    magEl.classList.add('snapped');
    magEl.dataset.snapObjectId = snap.el.dataset.objectId || '';
  } else {
    magEl.classList.remove('snapped');
    delete magEl.dataset.snapObjectId;
  }
}

function onMove(e) {
  if (!magEl) return;
  if (magEl.style.display === 'none') magEl.style.display = 'block';
  const snap = snapToNearestHitZone(e.clientX, e.clientY);
  lastSnap = snap;
  if (snap) position(snap.cx, snap.cy);
  else       position(e.clientX, e.clientY);
  applySnapDataset(snap);
}

function onEnter(e) {
  if (magEl) magEl.style.display = 'block';
  onMove(e);
}

function onLeave() {
  lastSnap = null;
  if (magEl) {
    magEl.style.display = 'none';
    applySnapDataset(null);
  }
}

export function attachMagnifier(stage) {
  detachMagnifier();
  stageEl = stage || document.getElementById('stage-canvas');
  if (!stageEl) return;
  magEl = ensureMagEl();
  magEl.style.display = 'none';   // 첫 hover 까지 숨김 (마우스 UX)
  lastSnap = null;

  cleanupFn = attachPointer(stageEl, {
    down:   onMove,
    move:   onMove,
    cancel: onLeave,
  });

  // 마우스 hover 들어옴/나감 — 터치엔 영향 없음
  const onEnterBound = e => onEnter(e);
  const onLeaveBound = () => onLeave();
  stageEl.addEventListener('pointerenter', onEnterBound);
  stageEl.addEventListener('pointerleave', onLeaveBound);
  extraOffs = [
    ['pointerenter', onEnterBound],
    ['pointerleave', onLeaveBound],
  ];
}

export function detachMagnifier() {
  if (cleanupFn) { cleanupFn(); cleanupFn = null; }
  if (stageEl && extraOffs.length) {
    extraOffs.forEach(([n, h]) => stageEl.removeEventListener(n, h));
  }
  extraOffs = [];
  if (magEl) {
    magEl.style.display = 'none';
    applySnapDataset(null);
  }
  stageEl  = null;
  lastSnap = null;
}

// stage.js 가 클릭 라우팅에 사용 — 현재 스냅된 hit zone 반환
export function getSnappedHitZone() {
  return lastSnap?.el || null;
}
