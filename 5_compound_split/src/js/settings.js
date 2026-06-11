/**
 * 설정 화면 렌더링·조작 (TRD §2.2, PLAN M0)
 * 문항 수(6·12·18) / 모드(연습하기 2 · 도전하기 3) / TTS·효과음 토글.
 * 변경 즉시 saveSettings() 영속화.
 */

import { QUESTION_COUNTS, FADING_LEVELS } from './config.js';
import { state } from './state.js';
import { saveSettings } from './storage.js';
import { goTo } from './ui.js';
import { isTTSSupported } from './tts.js';

/** 설정 화면 진입 — 렌더링 후 화면 전환 (HTML onclick에서 호출) */
export function openSettings() {
  renderSettings();
  goTo('settings-screen');
}

/** 설정 화면 UI를 state.settings와 동기화 */
export function renderSettings() {
  syncCountChips();
  syncFadingChips();
  syncToggle('toggle-tts', state.settings.ttsEnabled);
  syncToggle('toggle-sound', state.settings.soundEnabled);

  // TTS 미지원 → 토글 비활성화 + 안내 (TRD §8.3 graceful degradation)
  if (!isTTSSupported()) {
    const toggle = document.getElementById('toggle-tts');
    const hint = document.getElementById('tts-hint');
    if (toggle) toggle.classList.add('disabled');
    if (hint) hint.textContent = '이 브라우저는 소리 읽기를 지원하지 않아요';
  }
}

/**
 * 토글 설정 변경 (HTML onclick에서 호출)
 * @param {'ttsEnabled'|'soundEnabled'} key
 * @param {HTMLElement} el 토글 요소
 */
export function toggleSetting(key, el) {
  if (key === 'ttsEnabled' && !isTTSSupported()) return;
  state.settings[key] = !state.settings[key];
  saveSettings();
  if (el) el.classList.toggle('on', state.settings[key]);
}

/**
 * 문항 수 선택 (HTML onclick에서 호출)
 * @param {6|12|18} n
 */
export function selectCount(n) {
  if (!QUESTION_COUNTS.includes(n)) return;
  state.settings.questionCount = n;
  saveSettings();
  syncCountChips();
}

/**
 * 모드 선택 — 시작 화면·설정 화면 칩 동시 동기화 (HTML onclick에서 호출)
 * @param {2|3} level 2 = 연습하기 / 3 = 도전하기
 */
export function selectFadingLevel(level) {
  if (!FADING_LEVELS.includes(level)) return;
  state.settings.fadingLevel = level;
  saveSettings();
  syncFadingChips();
}

function syncCountChips() {
  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === state.settings.questionCount);
  });
}

function syncFadingChips() {
  // 시작 화면(#fading-chips-start)과 설정 화면(#fading-chips) 양쪽 모두 동기화
  document.querySelectorAll('[data-fading]').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.fading) === state.settings.fadingLevel);
  });
}

function syncToggle(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', on);
}
