// 줌/팬 컨트롤 — F13
import { state } from './state.js';
import { clamp } from './utils.js';

const MIN_SCALE = 1;
const MAX_SCALE = 3;

let _canvas = null;
let _activePointers = new Map();
let _lastPinchDist = 0;
let _isPanning = false;
let _panStart = { x: 0, y: 0 };

export function applyTransform({ scale = 1, x = 0, y = 0 } = {}) {
  state.stage.zoom = clamp(scale, MIN_SCALE, MAX_SCALE);
  state.stage.pan  = { x, y };
  if (!_canvas) return;
  // zoom=1 + pan 없음 → transform 자체를 비운다.
  //  - identity transform 도 stacking context 를 만들고 자식 hit testing 경로에 영향 줄 수 있음
  //  - getScreenCTM 계산도 단순해져 좌표 변환 안정성 향상
  if (state.stage.zoom === 1 && x === 0 && y === 0) {
    _canvas.style.transform = '';
    _canvas.style.transformOrigin = '';
    _canvas.style.cursor = '';
    return;
  }
  _canvas.style.transformOrigin = '0 0';
  _canvas.style.transform = `scale(${state.stage.zoom}) translate(${state.stage.pan.x}px, ${state.stage.pan.y}px)`;
  _canvas.style.cursor = state.stage.zoom > 1 ? 'grab' : '';
}

export function resetViewport() {
  applyTransform({ scale: 1, x: 0, y: 0 });
}

function _clampPan(x, y, scale) {
  if (!_canvas) return { x, y };
  const parent = _canvas.parentElement;
  const pw = parent ? parent.clientWidth  : _canvas.clientWidth;
  const ph = parent ? parent.clientHeight : _canvas.clientHeight;
  const cw = _canvas.clientWidth  * scale;
  const ch = _canvas.clientHeight * scale;
  return {
    x: clamp(x, Math.min(0, pw - cw), 0),
    y: clamp(y, Math.min(0, ph - ch), 0),
  };
}

function _onWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.15 : 0.87;
  const newScale = clamp(state.stage.zoom * factor, MIN_SCALE, MAX_SCALE);
  if (newScale === state.stage.zoom) return;

  const cont = _canvas.parentElement || _canvas;
  const rect = cont.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const newPanX = mx * (1 / newScale - 1 / state.stage.zoom) + state.stage.pan.x;
  const newPanY = my * (1 / newScale - 1 / state.stage.zoom) + state.stage.pan.y;
  applyTransform({ scale: newScale, ..._clampPan(newPanX, newPanY, newScale) });
}

function _onPointerDown(e) {
  _canvas.setPointerCapture(e.pointerId);
  _activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (_activePointers.size === 1 && state.stage.zoom > 1) {
    _isPanning = true;
    _panStart = { x: e.clientX - state.stage.pan.x, y: e.clientY - state.stage.pan.y };
    if (_canvas) _canvas.style.cursor = 'grabbing';
  }
  if (_activePointers.size === 2) {
    _isPanning = false;
    const pts = [..._activePointers.values()];
    _lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }
}

function _onPointerMove(e) {
  if (!_activePointers.has(e.pointerId)) return;
  _activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (_activePointers.size === 2) {
    const pts = [..._activePointers.values()];
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    if (_lastPinchDist > 0) {
      const ratio    = dist / _lastPinchDist;
      const newScale = clamp(state.stage.zoom * ratio, MIN_SCALE, MAX_SCALE);
      const pan      = _clampPan(state.stage.pan.x, state.stage.pan.y, newScale);
      applyTransform({ scale: newScale, ...pan });
    }
    _lastPinchDist = dist;
  } else if (_isPanning && _activePointers.size === 1) {
    const raw = { x: e.clientX - _panStart.x, y: e.clientY - _panStart.y };
    const pan = _clampPan(raw.x, raw.y, state.stage.zoom);
    applyTransform({ scale: state.stage.zoom, ...pan });
  }
}

function _onPointerUp(e) {
  _canvas.releasePointerCapture(e.pointerId);
  _activePointers.delete(e.pointerId);
  if (_activePointers.size < 2) _lastPinchDist = 0;
  if (_activePointers.size === 0) {
    _isPanning = false;
    if (_canvas) _canvas.style.cursor = state.stage.zoom > 1 ? 'grab' : '';
  }
}

export function attachViewport(canvasEl) {
  if (_canvas) detachViewport();
  _canvas = canvasEl;
  resetViewport();
  _canvas.addEventListener('pointerdown',   _onPointerDown);
  _canvas.addEventListener('pointermove',   _onPointerMove);
  _canvas.addEventListener('pointerup',     _onPointerUp);
  _canvas.addEventListener('pointercancel', _onPointerUp);
  _canvas.addEventListener('wheel',         _onWheel, { passive: false });
}

export function detachViewport() {
  if (!_canvas) return;
  _canvas.removeEventListener('pointerdown',   _onPointerDown);
  _canvas.removeEventListener('pointermove',   _onPointerMove);
  _canvas.removeEventListener('pointerup',     _onPointerUp);
  _canvas.removeEventListener('pointercancel', _onPointerUp);
  _canvas.removeEventListener('wheel',         _onWheel);
  resetViewport();
  _canvas = null;
  _activePointers.clear();
}
