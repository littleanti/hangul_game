// Pointer Events 통합 — TRD §4.1
// down/move/up/cancel + setPointerCapture. 화면 전환 시 releaseAll().
const ACTIVE = new WeakMap(); // el → Set<pointerId>

export function attachPointer(el, { down, move, up, cancel } = {}) {
  if (!el) return () => {};
  const offs = [];
  const ids = ACTIVE.get(el) || new Set();
  ACTIVE.set(el, ids);

  const onDown = e => {
    try { el.setPointerCapture?.(e.pointerId); } catch (_) {}
    ids.add(e.pointerId);
    if (down) down(e);
  };
  const onUp = e => {
    ids.delete(e.pointerId);
    try { el.releasePointerCapture?.(e.pointerId); } catch (_) {}
    if (up) up(e);
  };
  const onCancel = e => {
    ids.delete(e.pointerId);
    try { el.releasePointerCapture?.(e.pointerId); } catch (_) {}
    if (cancel) cancel(e);
  };

  el.addEventListener('pointerdown',   onDown);   offs.push(['pointerdown',   onDown]);
  if (move)   { el.addEventListener('pointermove', move); offs.push(['pointermove', move]); }
  el.addEventListener('pointerup',     onUp);     offs.push(['pointerup',     onUp]);
  el.addEventListener('pointercancel', onCancel); offs.push(['pointercancel', onCancel]);

  return () => offs.forEach(([name, h]) => el.removeEventListener(name, h));
}

// 화면 전환 시 일괄 release — TRD §2.4 부작용
export function releaseAll(el) {
  if (!el) return;
  const ids = ACTIVE.get(el);
  if (!ids) return;
  ids.forEach(id => {
    try { el.releasePointerCapture?.(id); } catch (_) {}
  });
  ids.clear();
}
