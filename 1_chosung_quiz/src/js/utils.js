/**
 * 유틸 함수
 */

import { CHOSUNG } from './config.js';

/**
 * 한글 단어에서 초성만 추출
 * 한글 유니코드 공식: (코드 - 0xAC00) / 588 = 초성 인덱스
 */
export function getChosung(word) {
  let result = '';
  for (const ch of word) {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code >= 0 && code <= 11171) {
      result += CHOSUNG[Math.floor(code / 588)];
    } else {
      result += ch; // 한글이 아니면 그대로 (영문/숫자 등)
    }
  }
  return result;
}

/**
 * Fisher-Yates 셔플
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * DOM 셀렉터 shortcut
 */
export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);
