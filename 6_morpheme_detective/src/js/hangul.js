// 한글 음절 분해 — TRD §3.1 (2단계 게임과 동일 알고리즘)
// 본 게임에서는 분해 결과보다 "음절 단위 시각 분리"가 핵심.

const HANGUL_BASE = 0xAC00;
const HANGUL_LAST = 0xD7A3;

export function isHangulSyllable(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_LAST;
}

export function decompose(syllable) {
  if (!syllable) return null;
  const code = syllable.charCodeAt(0) - HANGUL_BASE;
  if (code < 0 || code > 11171) return null;
  const cho  = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  return { cho, jung, jong };
}

// '주차장' → ['주','차','장']
export function splitWord(word) {
  return [...(word || '')];
}
