/**
 * UI 공용 헬퍼
 * 화면 전환, 플래시 메시지 등
 */

import { $, $$ } from './utils.js';
import { stopTimer } from './timer.js';
import { cancelSpeech } from './tts.js';

/**
 * 화면 전환
 * @param {string} id - 표시할 screen의 id
 */
export function goTo(id) {
  stopTimer();
  cancelSpeech();
  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/**
 * 상단 플래시 메시지 (설정 화면 유효성 검사용)
 */
export function showFlash(msg, duration = 2500) {
  const f = $('#flash');
  if (!f) return;
  f.textContent = msg;
  f.classList.add('show');
  setTimeout(() => f.classList.remove('show'), duration);
}
