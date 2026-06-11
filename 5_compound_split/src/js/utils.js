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

/**
 * 한글 음절의 종성(받침) 유무 판별 (TRD §5.4).
 * 한글 음절 범위(U+AC00~U+D7A3) 밖 문자는 null 반환.
 * @param {string} char 단일 문자
 * @returns {boolean | null} 받침 있음 true / 없음 false / 한글 음절 아님 null
 */
export function hasBatchim(char) {
  if (!char) return null;
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  return (code - 0xac00) % 28 > 0;
}

/**
 * 단어 마지막 글자의 받침 유무로 조사 자동 선택 (TRD §5.4).
 * 마지막 글자가 한글 음절 범위 밖이면 병기 형태('은(는)')로 폴백.
 * @param {string} word 대상 단어
 * @param {string} pair '받침형/무받침형' (예: '은/는', '이/가', '을/를')
 * @returns {string} 선택된 조사 (예: '은') 또는 폴백 병기 (예: '은(는)')
 */
export function josa(word, pair) {
  const [withBatchim, withoutBatchim] = pair.split('/');
  const batchim = hasBatchim(word ? word[word.length - 1] : '');
  if (batchim === null) return `${withBatchim}(${withoutBatchim})`;
  return batchim ? withBatchim : withoutBatchim;
}
