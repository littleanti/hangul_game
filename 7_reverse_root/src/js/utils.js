// utils.js — 순수 유틸 (TRD §2.1)

/** min ≤ v ≤ max 로 자름 */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Fisher–Yates 셔플 — 원본 비파괴, 새 배열 반환 */
export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 두 점 사이 유클리드 거리 */
export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
