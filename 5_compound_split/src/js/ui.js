/**
 * UI 공용 헬퍼 — 화면 전환 (TRD §2.3)
 * goTo() 공통 부작용: cancelSpeech() + 팝업 해제 + 피드백 초기화
 */

import { cancelSpeech } from './tts.js';
import { state } from './state.js';

/**
 * 화면 전환
 * @param {string} id - 표시할 screen의 id
 *   (start-screen | settings-screen | leaderboard-screen | game-screen | end-screen)
 */
export function goTo(id) {
  cancelSpeech();
  closePopups();
  clearFeedback();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/** 열려 있는 조각 팝업(.split-popup) 해제 — 전환 공통 부작용 */
export function closePopups() {
  document.querySelectorAll('.split-popup').forEach(p => p.remove());
  state.game.popupOpen = false;
}

/** aria-live 피드백 텍스트 초기화 */
export function clearFeedback() {
  document.querySelectorAll('.feedback-live').forEach(el => {
    el.textContent = '';
  });
}
