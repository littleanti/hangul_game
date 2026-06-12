/**
 * utils.js — 순수 유틸 함수 (TRD §9)
 */

import { DOCK_SIZE } from './config.js';

/* ── 한글 자모 테이블 (TRD §9.3) ─────────────────── */

export const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/* ── 배열 유틸 ──────────────────────────────────── */

/**
 * Fisher-Yates 셔플 — 원본을 변경하지 않고 새 배열 반환.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ── 한글 음절 조합/분해 ─────────────────────────── */

/**
 * 초성·중성·종성 인덱스로 완성형 음절 조립 (TRD §5.1 Lv.2 조합기).
 * 한글 유니코드: 0xAC00 + (초성 idx * 21 + 중성 idx) * 28 + 종성 idx
 * @param {number} cho  초성 인덱스 (CHOSUNG, 0~18)
 * @param {number} jung 중성 인덱스 (JUNGSUNG, 0~20)
 * @param {number} jong 종성 인덱스 (JONGSUNG, 0~27, 0 = 받침 없음)
 * @returns {string} 완성형 한글 1글자
 *
 * 단위 테스트 케이스 (Vitest 도입 전 수동 검증 — PLAN M3):
 *   assembleSyllable(11, 20, 8) === '일'   // ㅇ+ㅣ+ㄹ  (U+C77C)
 *   assembleSyllable(9, 4, 1)   === '석'   // ㅅ+ㅓ+ㄱ  (U+C11D)
 *   assembleSyllable(11, 20, 0) === '이'   // ㅇ+ㅣ     (받침 없음)
 *   assembleSyllable(12, 8, 0)  === '조'   // ㅈ+ㅗ
 *   assembleSyllable(14, 16, 0) === '취'   // ㅊ+ㅟ     (복합 모음)
 *   assembleSyllable(11, 14, 8) === '월'   // ㅇ+ㅝ+ㄹ  (복합 모음+받침)
 */
export function assembleSyllable(cho, jung, jong = 0) {
  return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

/**
 * 음절의 초성 자모를 반환 (Lv.2 초성 힌트 배지).
 * 완성형 한글이 아니면 입력을 그대로 반환.
 * @param {string} syllable 예: "일"
 * @returns {string} 예: "ㅇ"
 */
export function getChosung(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return syllable;
  return CHOSUNG[Math.floor(code / 588)];
}

/**
 * 완성형 한글(U+AC00~D7A3) 1글자인지 검증 (Lv.3 commitChar — 자모 단독 거부).
 * @param {string} ch
 * @returns {boolean}
 */
export function isCompleteHangul(ch) {
  if (typeof ch !== 'string' || ch.length !== 1) return false;
  const code = ch.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

/* ── Lv.1 도크 풀 구성 (TRD §9.1) ────────────────── */

/**
 * Lv.1 도크 8개 음절 풀 구성:
 * 정답 1 + 해당 슬롯 distractors 4 + 타 음절(다른 슬롯 정답·방해) 3 = 8개, 중복 없음.
 * @param {import('../data/idioms.js').SyllableEntry} syllableEntry 현재 슬롯 음절 항목
 * @param {string[]} allSyllables 추가 샘플링 후보 음절 풀 (전체 정답 음절 등)
 * @returns {string[]} 셔플된 8개 음절
 */
export function buildDockPool(syllableEntry, allSyllables) {
  const answer = syllableEntry.syllable;
  // 정답 + 방해 음절 — 데이터 오류 방어를 위해 중복 제거
  const base = [...new Set([answer, ...syllableEntry.distractors])];
  const extra = shuffle(
    [...new Set(allSyllables)].filter((s) => !base.includes(s))
  ).slice(0, DOCK_SIZE - base.length);
  return shuffle([...base, ...extra]);
}
