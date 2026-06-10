/**
 * 설정 화면 (M3, TRD §2.3 — state.js·storage.js 의존)
 * TTS·효과음 토글 + 난이도 칩(vowelCount 5/10) 바인딩.
 * 변경 즉시 saveSettings() → localStorage 반영 — 새로고침 후에도 유지.
 * vowelCount는 startGame → initLevel0 → buildLevel0Questions(vowelCount)로 연동.
 */

import { state } from './state.js';
import { saveSettings } from './storage.js';
import { TTS_AVAILABLE } from './tts.js';

/**
 * 설정 토글 (TTS·효과음) — 즉시 저장
 * @param {'ttsEnabled'|'sfxEnabled'} key
 * @param {HTMLElement} el 토글 DOM (.toggle)
 */
export function toggleSetting(key, el) {
  state.settings[key] = !state.settings[key];
  el.classList.toggle('on', state.settings[key]);
  saveSettings();
}

/**
 * 난이도 칩 (Level 0 모음 수 5/10) — 즉시 저장
 * @param {5|10} count
 */
export function selectCount(count) {
  state.settings.vowelCount = count;
  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === count);
  });
  saveSettings();
}

/** 저장된 설정값을 설정 화면 UI에 반영 (초기 1회 호출) */
export function syncSettingsUI() {
  const ttsToggle = document.getElementById('toggle-tts');
  const sfxToggle = document.getElementById('toggle-sfx');
  if (ttsToggle) ttsToggle.classList.toggle('on', state.settings.ttsEnabled);
  if (sfxToggle) sfxToggle.classList.toggle('on', state.settings.sfxEnabled);
  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === state.settings.vowelCount);
  });

  // TTS 미지원 브라우저 — 토글 자동 비활성화 (graceful degradation, PRD §9.3)
  if (!TTS_AVAILABLE && ttsToggle) {
    state.settings.ttsEnabled = false;
    ttsToggle.classList.remove('on');
    ttsToggle.style.opacity = '0.4';
    ttsToggle.style.pointerEvents = 'none';
    const hint = document.getElementById('tts-hint');
    if (hint) hint.textContent = '이 기기에서는 소리 읽기를 지원하지 않아요';
  }
}
