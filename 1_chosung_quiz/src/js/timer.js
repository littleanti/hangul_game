/**
 * 타이머 모듈
 * 카운트다운을 관리하고 시간 초과 시 콜백을 호출합니다.
 */

import { state } from './state.js';
import { $ } from './utils.js';

/**
 * 타이머 시작
 * @param {number} seconds - 총 시간 (초)
 * @param {function} onTimeout - 시간 초과 시 호출될 콜백
 */
export function startTimer(seconds, onTimeout) {
  stopTimer();
  state.game.timeLeft = seconds;

  const badge = $('#timer-badge');
  badge.style.display = 'inline-block';
  updateTimerUI();

  state.game.timerHandle = setInterval(() => {
    state.game.timeLeft -= 0.1;
    if (state.game.timeLeft <= 0) {
      state.game.timeLeft = 0;
      stopTimer();
      updateTimerUI();
      onTimeout && onTimeout();
    } else {
      updateTimerUI();
    }
  }, 100);
}

export function stopTimer() {
  if (state.game.timerHandle) {
    clearInterval(state.game.timerHandle);
    state.game.timerHandle = null;
  }
}

export function hideTimer() {
  const badge = $('#timer-badge');
  if (badge) badge.style.display = 'none';
}

function updateTimerUI() {
  const badge = $('#timer-badge');
  if (!badge) return;

  const sec = Math.max(0, Math.ceil(state.game.timeLeft));
  badge.textContent = '⏱ ' + sec;
  badge.classList.remove('warn', 'danger');

  const total = state.settings.timerSeconds;
  if (state.game.timeLeft <= total * 0.3) {
    badge.classList.add('danger');
  } else if (state.game.timeLeft <= total * 0.6) {
    badge.classList.add('warn');
  }
}
