// Minimap — 우상단 thumbnail. SVG 콘텐츠 축소 사본 + 현재 viewport 표시.

export function createMinimap(parent, {
  contentSvgInnerHTML,
  contentWidth,
  contentHeight,
  stageEl,
  camera,
}) {
  const W = 100;
  const H = Math.round(W * (contentHeight / contentWidth));

  const wrap = document.createElement('div');
  wrap.className = 'minimap';
  wrap.innerHTML = `
    <svg viewBox="0 0 ${contentWidth} ${contentHeight}" preserveAspectRatio="xMidYMid meet" class="minimap-content">
      ${contentSvgInnerHTML}
    </svg>
    <div class="minimap-viewport" aria-hidden="true"></div>
  `;
  wrap.style.width = `${W}px`;
  wrap.style.height = `${H}px`;
  parent.appendChild(wrap);

  // 썸네일은 콘텐츠 좌표계(viewBox=content) 그대로 보여준다.
  // 직렬화된 <g>에 메인 카메라 matrix가 남아 있으면 콘텐츠가 미니맵 밖으로 밀려 비어 보인다 → 제거.
  wrap.querySelectorAll('.minimap-content #ov-g, .minimap-content g[transform]').forEach((g) => {
    g.removeAttribute('transform');
    g.removeAttribute('id'); // 메인 #ov-g 와의 중복 id 제거
  });

  const vpEl = wrap.querySelector('.minimap-viewport');

  function updateViewport(state) {
    const rect = stageEl.getBoundingClientRect();
    const scale = state.scale;
    // 화면 좌표계에서 viewport가 차지하는 content 영역:
    const viewW = (rect.width / scale) / contentWidth;
    const viewH = (rect.height / scale) / contentHeight;
    const viewX = (-state.tx / scale) / contentWidth;
    const viewY = (-state.ty / scale) / contentHeight;
    vpEl.style.left = `${Math.max(0, viewX) * 100}%`;
    vpEl.style.top  = `${Math.max(0, viewY) * 100}%`;
    vpEl.style.width  = `${Math.min(1, viewW) * 100}%`;
    vpEl.style.height = `${Math.min(1, viewH) * 100}%`;
  }

  // 미니맵 클릭 → 카메라 점프
  wrap.addEventListener('click', (ev) => {
    const r = wrap.getBoundingClientRect();
    const normX = (ev.clientX - r.left) / r.width;
    const normY = (ev.clientY - r.top) / r.height;
    camera.jumpTo(normX, normY);
  });

  return { wrap, updateViewport, destroy: () => wrap.remove() };
}
