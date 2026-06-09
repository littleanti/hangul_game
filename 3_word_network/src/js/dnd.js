const DRAG_THRESHOLD = 8;

export function initDrag(container, getSyllableById, onDrop, signal) {
  container.addEventListener('pointerdown', e => {
    const blockEl = e.target.closest('.syllable-block:not(.used):not([disabled])');
    if (!blockEl) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;
    let ghost = null;

    blockEl.setPointerCapture(e.pointerId);

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        isDragging = true;
        ghost = createGhost(blockEl, e.clientX, e.clientY);
        blockEl.classList.add('dragging');
      }
      if (isDragging && ghost) {
        positionGhost(ghost, e.clientX, e.clientY);
        updateDropHighlight(e.clientX, e.clientY);
      }
    }

    function onUp(e) {
      blockEl.removeEventListener('pointermove', onMove);
      blockEl.removeEventListener('pointerup', onUp);
      blockEl.removeEventListener('pointercancel', onUp);

      if (ghost) { ghost.remove(); ghost = null; }
      blockEl.classList.remove('dragging');
      clearDropHighlights();

      if (isDragging) {
        // Suppress synthesized click after drag
        blockEl.addEventListener('click', ev => {
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }, { once: true, capture: true });

        const slot = findSlotAt(e.clientX, e.clientY);
        if (slot) {
          const slotIdx = parseInt(slot.dataset.idx, 10);
          const sylId = blockEl.dataset.sylId;
          const syl = getSyllableById(sylId);
          if (syl) onDrop(syl, slotIdx);
        }
      }
    }

    blockEl.addEventListener('pointermove', onMove);
    blockEl.addEventListener('pointerup', onUp);
    blockEl.addEventListener('pointercancel', onUp);

    if (signal) {
      signal.addEventListener('abort', () => {
        blockEl.removeEventListener('pointermove', onMove);
        blockEl.removeEventListener('pointerup', onUp);
        blockEl.removeEventListener('pointercancel', onUp);
        if (ghost) { ghost.remove(); ghost = null; }
        blockEl.classList.remove('dragging');
        clearDropHighlights();
      }, { once: true });
    }
  }, { signal });
}

function createGhost(sourceEl, x, y) {
  const ghost = sourceEl.cloneNode(true);
  ghost.className = 'syllable-block drag-ghost';
  ghost.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:9999',
    'opacity:0.88',
    'transform:scale(1.18)',
    'transition:none',
  ].join(';');
  document.body.appendChild(ghost);
  positionGhost(ghost, x, y);
  return ghost;
}

function positionGhost(ghost, x, y) {
  const w = ghost.offsetWidth || 56;
  const h = ghost.offsetHeight || 56;
  ghost.style.left = `${x - w / 2}px`;
  ghost.style.top  = `${y - h / 2}px`;
}

function findSlotAt(x, y) {
  for (const slot of document.querySelectorAll('.syllable-slot.empty:not(.locked)')) {
    const r = slot.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return slot;
  }
  return null;
}

function updateDropHighlight(x, y) {
  clearDropHighlights();
  const slot = findSlotAt(x, y);
  if (slot) slot.classList.add('drag-over');
}

function clearDropHighlights() {
  document.querySelectorAll('.syllable-slot.drag-over')
    .forEach(el => el.classList.remove('drag-over'));
}
