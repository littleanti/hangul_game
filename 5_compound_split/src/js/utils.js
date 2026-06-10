/**
 * 순수 유틸 (TRD §2.2)
 */

/**
 * Fisher-Yates 셔플 — 원본을 변경하지 않고 새 배열 반환.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
