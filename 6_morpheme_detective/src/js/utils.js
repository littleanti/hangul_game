// 순수 유틸 — TRD §2.1
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const dist  = (a, b)      => Math.hypot(b.x - a.x, b.y - a.y);
export const dprPx = dp          => dp * (devicePixelRatio || 1);

// 좌표 정규화: SVG 클라이언트 좌표 → viewBox 좌표
export function clientToViewBox(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  const ctm = svg.getScreenCTM();
  return ctm ? pt.matrixTransform(ctm.inverse()) : { x: clientX, y: clientY };
}

export function throttle(fn, ms) {
  let last = 0, pendingArgs = null, pendingTimer = null;
  return function(...args) {
    const now    = Date.now();
    const remain = ms - (now - last);
    if (remain <= 0) {
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!pendingTimer) {
      pendingArgs = args;
      pendingTimer = setTimeout(() => {
        last = Date.now();
        pendingTimer = null;
        fn.apply(this, pendingArgs);
      }, remain);
    }
  };
}
