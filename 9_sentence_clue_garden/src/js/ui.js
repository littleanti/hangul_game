/**
 * UI 공용 헬퍼 — 화면 전환 (TRD §2.3, §2.4)
 * goTo() 공통 부작용: cancelSpeech() + 진행 중 타이머 중단 + 포커스 이동
 */

import { cancelSpeech } from './tts.js';

// 화면 전환 시 함께 정리해야 하는 타이머들 (게임 진행 setTimeout 등)
const screenTimers = new Set();

/** 화면 전환 시 자동 정리되는 setTimeout 등록 */
export function setScreenTimer(fn, ms) {
  const id = setTimeout(() => {
    screenTimers.delete(id);
    fn();
  }, ms);
  screenTimers.add(id);
  return id;
}

/** 등록된 타이머 전부 중단 */
export function clearScreenTimers() {
  screenTimers.forEach(id => clearTimeout(id));
  screenTimers.clear();
}

/**
 * 화면 전환 (TRD §2.4 — 모든 전이는 goTo 경유)
 * @param {string} id - 표시할 screen의 id
 *   (home-screen | settings-screen | play-screen | end-screen | leaderboard-screen)
 */
export function goTo(id) {
  cancelSpeech();
  clearScreenTimers();
  clearFeedback();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  focusFirstInteractive(target);
}

/** 새 화면의 첫 인터랙티브 요소로 포커스 이동 (TRD §7.5) */
function focusFirstInteractive(screen) {
  const el = screen.querySelector('button, [tabindex]');
  if (el) el.focus({ preventScroll: true });
}

/** aria-live 피드백 텍스트 초기화 */
export function clearFeedback() {
  document.querySelectorAll('.feedback-live').forEach(el => {
    el.textContent = '';
  });
}
