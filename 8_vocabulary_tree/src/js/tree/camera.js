// Affine matrix camera — pan + pinch zoom + minimap jump
// 단일 SVG <g> 의 transform 속성에 matrix(a 0 0 d e f) 형태로 적용.
// 회전은 없음 (a=d=scale).

import { CONFIG } from '../config.js';
import { clamp, distance } from '../utils.js';

export function createCamera({
  stageEl,
  contentEl, // <g> in svg
  contentWidth,
  contentHeight,
  onChange = () => {},
  minScale = CONFIG.CAMERA_SCALE_MIN,
  maxScale = CONFIG.CAMERA_SCALE_MAX,
} = {}) {
  const cam = { scale: 1, tx: 0, ty: 0, minScale, maxScale };

  function clampTranslate() {
    const rect = stageEl.getBoundingClientRect();
    const minX = rect.width - contentWidth * cam.scale;
    const minY = rect.height - contentHeight * cam.scale;
    const maxX = 0;
    const maxY = 0;
    cam.tx = clamp(cam.tx, Math.min(minX, maxX), Math.max(minX, maxX));
    cam.ty = clamp(cam.ty, Math.min(minY, maxY), Math.max(minY, maxY));
  }

  function apply() {
    clampTranslate();
    contentEl.setAttribute('transform', `matrix(${cam.scale} 0 0 ${cam.scale} ${cam.tx} ${cam.ty})`);
    onChange(getState());
  }

  function getState() {
    return { scale: cam.scale, tx: cam.tx, ty: cam.ty };
  }

  function setState({ scale, tx, ty }) {
    if (scale != null) cam.scale = clamp(scale, cam.minScale, cam.maxScale);
    if (tx != null) cam.tx = tx;
    if (ty != null) cam.ty = ty;
    apply();
  }

  function fit() {
    const rect = stageEl.getBoundingClientRect();
    const fitScale = Math.min(rect.width / contentWidth, rect.height / contentHeight);
    cam.scale = clamp(fitScale, cam.minScale, cam.maxScale);
    cam.tx = (rect.width - contentWidth * cam.scale) / 2;
    cam.ty = (rect.height - contentHeight * cam.scale) / 2;
    apply();
  }

  function zoomAt(focalX, focalY, deltaScale) {
    const newScale = clamp(cam.scale * deltaScale, cam.minScale, cam.maxScale);
    const ratio = newScale / cam.scale;
    cam.tx = focalX - (focalX - cam.tx) * ratio;
    cam.ty = focalY - (focalY - cam.ty) * ratio;
    cam.scale = newScale;
    apply();
  }

  // Pinch + pan via Pointer Events
  const pointers = new Map();
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchCenter = { x: 0, y: 0 };
  let panLast = null;

  function stagePoint(ev) {
    const r = stageEl.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  function onDown(ev) {
    if (ev.target.closest('.leaf')) return; // 잎 클릭은 패스
    stageEl.setPointerCapture?.(ev.pointerId);
    pointers.set(ev.pointerId, stagePoint(ev));
    if (pointers.size === 1) {
      panLast = stagePoint(ev);
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchStartDist = distance(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
      pinchStartScale = cam.scale;
      pinchCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      panLast = null;
    }
  }

  function onMove(ev) {
    if (!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, stagePoint(ev));
    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = distance(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
      if (pinchStartDist > 0) {
        const newScale = clamp(pinchStartScale * (dist / pinchStartDist), cam.minScale, cam.maxScale);
        const ratio = newScale / cam.scale;
        cam.tx = pinchCenter.x - (pinchCenter.x - cam.tx) * ratio;
        cam.ty = pinchCenter.y - (pinchCenter.y - cam.ty) * ratio;
        cam.scale = newScale;
        apply();
      }
    } else if (pointers.size === 1 && panLast) {
      const pt = stagePoint(ev);
      cam.tx += pt.x - panLast.x;
      cam.ty += pt.y - panLast.y;
      panLast = pt;
      apply();
    }
  }

  function onUp(ev) {
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinchStartDist = 0;
    if (pointers.size === 1) panLast = [...pointers.values()][0];
    else panLast = null;
  }

  function onWheel(ev) {
    ev.preventDefault();
    const pt = stagePoint(ev);
    const delta = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(pt.x, pt.y, delta);
  }

  stageEl.addEventListener('pointerdown', onDown);
  stageEl.addEventListener('pointermove', onMove);
  stageEl.addEventListener('pointerup', onUp);
  stageEl.addEventListener('pointercancel', onUp);
  stageEl.addEventListener('wheel', onWheel, { passive: false });

  function detach() {
    stageEl.removeEventListener('pointerdown', onDown);
    stageEl.removeEventListener('pointermove', onMove);
    stageEl.removeEventListener('pointerup', onUp);
    stageEl.removeEventListener('pointercancel', onUp);
    stageEl.removeEventListener('wheel', onWheel);
  }

  // 미니맵 점프 — content 좌표 (0..1, 0..1) → 카메라 중심 보간
  function jumpTo(normX, normY, { animate = true } = {}) {
    const rect = stageEl.getBoundingClientRect();
    const targetTx = -normX * contentWidth * cam.scale + rect.width / 2;
    const targetTy = -normY * contentHeight * cam.scale + rect.height / 2;
    if (!animate) {
      cam.tx = targetTx;
      cam.ty = targetTy;
      apply();
      return;
    }
    const startTx = cam.tx;
    const startTy = cam.ty;
    const steps = 16;
    let i = 0;
    const tick = () => {
      i++;
      const t = i / steps;
      const ease = 1 - Math.pow(1 - t, 3);
      cam.tx = startTx + (targetTx - startTx) * ease;
      cam.ty = startTy + (targetTy - startTy) * ease;
      apply();
      if (i < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  fit();

  return { getState, setState, fit, zoomAt, jumpTo, detach };
}
