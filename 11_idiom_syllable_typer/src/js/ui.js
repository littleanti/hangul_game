/**
 * ui.js — 화면 전환·공통 UI 헬퍼 (TRD §2.3 / PLAN M2)
 *
 * 화면 전환은 반드시 showScreen() 을 경유한다.
 * 전환 부작용: tts.cancel() + sound.stopAll() (모든 전환 공통).
 * 화면별 진입 부작용(게임 시작·완료 렌더 등)은 main.js / game.js 가 담당.
 */

import * as tts from './tts.js';
import * as sound from './sound.js';

/** 화면 ID 목록 (index.html 의 .screen 컨테이너) */
export const SCREEN_IDS = [
  'start-screen',
  'settings-screen',
  'leaderboard-screen',
  'end-screen',
  'game-screen',
];

/**
 * getElementById 단축 헬퍼.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function el(id) {
  return document.getElementById(id);
}

/**
 * 지정 화면만 .active 표시. 전환 전 TTS·효과음 전부 정지.
 * @param {string} name 화면 ID (예: 'game-screen')
 */
export function showScreen(name) {
  if (!SCREEN_IDS.includes(name)) return;
  tts.cancel();
  sound.stopAll();
  SCREEN_IDS.forEach((sid) => {
    const screen = el(sid);
    if (screen) screen.classList.toggle('active', sid === name);
  });
}

/** @type {ReturnType<typeof setTimeout>|null} */
let toastTimer = null;

/**
 * 하단 토스트 메시지 표시 (자동 사라짐).
 * @param {string} msg
 * @param {number} [duration=1800] 표시 시간 (ms)
 */
export function showToast(msg, duration = 1800) {
  let toast = el('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * 진행 표시 갱신 — 문항 번호 텍스트 + 진행바 폭.
 * @param {number} current 현재 문항 번호 (1-base)
 * @param {number} total   전체 문항 수
 */
export function updateProgress(current, total) {
  const currentEl = el('current-num');
  const totalEl = el('total-num');
  const fill = el('progress-fill');
  if (currentEl) currentEl.textContent = String(current);
  if (totalEl) totalEl.textContent = String(total);
  if (fill && total > 0) fill.style.width = `${(current / total) * 100}%`;
}
