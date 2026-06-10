/**
 * UI 공용 헬퍼 — 화면 전환 + 진행률 HUD (TRD §2.4)
 * goTo() 공통 부작용: cancelSpeech() + stopDrag() + clearFeedback()
 */

import { cancelSpeech } from './tts.js';
import { stopDrag } from './drag.js';

// 진행률 HUD를 표시하는 게임 플레이 화면
const HUD_SCREENS = ['game-level0', 'game-level1'];

/**
 * 화면 전환
 * @param {string} id - 표시할 screen의 id
 */
export function goTo(id) {
  cancelSpeech();
  stopDrag();
  clearFeedback();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  const hud = document.getElementById('progress-hud');
  if (hud) hud.style.display = HUD_SCREENS.includes(id) ? 'flex' : 'none';
}

/** 피드백 오버레이 초기화 — aria-live 텍스트 + 정오답/하이라이트 클래스 제거 */
export function clearFeedback() {
  document.querySelectorAll('.feedback-live').forEach(el => {
    el.textContent = '';
  });
  document
    .querySelectorAll('.choice-btn, .vowel-card, .bucket, .ob-target')
    .forEach(el => el.classList.remove('correct', 'wrong', 'shake', 'hover-active', 'done'));
}

/**
 * 진행률 HUD 갱신 — 현재 문항/전체 + 레벨명 + 정답 수
 * @param {string} stepText  예: '3 / 5'
 * @param {string} levelName 예: '소리 찾기'
 * @param {number} correct   정답 수
 */
export function updateHud(stepText, levelName, correct) {
  const step = document.getElementById('hud-step');
  const level = document.getElementById('hud-level');
  const score = document.getElementById('hud-score');
  if (step) step.textContent = stepText;
  if (level) level.textContent = levelName;
  if (score) score.textContent = `⭐ ${correct}`;
}
