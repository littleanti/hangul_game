/**
 * 순수 유틸 (TRD §2.3 — config 외 의존성 없음)
 */

/** Fisher–Yates 셔플 — 원본 불변, 새 배열 반환 */
export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** min 이상 max 이하 정수 난수 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 값 범위 제한 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
