/**
 * 설정 화면 렌더링 및 인터랙션
 */

import {
  DIFFICULTY_OPTIONS, COUNT_OPTIONS, TIMER_OPTIONS, LEVEL_DEFAULTS
} from './config.js';
import { state, resetSettingsToDefault } from './state.js';
import { saveSettings } from './storage.js';
import { TTS_AVAILABLE } from './tts.js';
import { CATEGORIES, WORDS } from '../data/words.js';
import { $, $$ } from './utils.js';
import { goTo, showFlash } from './ui.js';
import { startGame } from './game.js';

/**
 * 현재 설정 기준으로 단어 필터링
 */
export function filterWords(settings) {
  return WORDS.filter(w => {
    if (!settings.categories.has(w.category)) return false;
    const len = w.word.length;
    switch (settings.difficulty) {
      case 'easy':   return len <= 2;
      case 'medium': return len === 3;
      case 'hard':   return len >= 4;
      default:       return true;
    }
  });
}

/**
 * 설정 화면 전체 다시 그리기
 */
export function renderSettings() {
  renderCategories();
  renderDifficulty();
  renderCount();
  renderTimer();
  renderToggles();
}

function renderCategories() {
  const row = $('#category-chips');
  row.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.settings.categories.has(cat) ? ' active mint-active' : '');
    chip.textContent = cat;
    chip.onclick = () => {
      if (state.settings.categories.has(cat)) {
        state.settings.categories.delete(cat);
      } else {
        state.settings.categories.add(cat);
      }
      saveSettings();
      renderSettings();
    };
    row.appendChild(chip);
  });
}

function renderDifficulty() {
  const row = $('#difficulty-chips');
  row.innerHTML = '';
  DIFFICULTY_OPTIONS.forEach(d => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.settings.difficulty === d.key ? ' active' : '');
    chip.textContent = d.label;
    chip.onclick = () => {
      state.settings.difficulty = d.key;
      state.userOverrides.difficulty = d.key;
      saveSettings();
      renderSettings();
    };
    row.appendChild(chip);
  });
}

function renderCount() {
  const row = $('#count-chips');
  row.innerHTML = '';
  COUNT_OPTIONS.forEach(n => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.settings.questionCount === n ? ' active' : '');
    chip.textContent = n + '문제';
    chip.onclick = () => {
      state.settings.questionCount = n;
      saveSettings();
      renderSettings();
    };
    row.appendChild(chip);
  });
}

function renderTimer() {
  const row = $('#timer-chips');
  row.innerHTML = '';
  TIMER_OPTIONS.forEach(t => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.settings.timerSeconds === t.val ? ' active' : '');
    chip.textContent = t.label;
    chip.onclick = () => {
      state.settings.timerSeconds = t.val;
      saveSettings();
      renderSettings();
    };
    row.appendChild(chip);
  });
}

function renderToggles() {
  // TTS 토글
  const ttsToggle = $('#toggle-tts');
  const ttsHint   = $('#tts-hint');
  if (!TTS_AVAILABLE) {
    ttsToggle.classList.add('disabled');
    ttsToggle.classList.remove('on');
    ttsToggle.onclick = null;
    ttsHint.textContent = '⚠️ 이 기기/브라우저에서는 발음 듣기를 지원하지 않아요';
    state.settings.ttsEnabled = false;
  } else {
    ttsToggle.classList.toggle('on', state.settings.ttsEnabled);
    ttsHint.textContent = '정답 공개 시 단어를 읽어줘요';
  }

  // 이미지 모드 토글
  const imgToggle = $('#toggle-image');
  imgToggle.classList.toggle('on', state.settings.imageMode);

  // 입력 모드 토글
  const inputToggle = $('#toggle-input');
  inputToggle.classList.toggle('on', state.settings.inputMode);

  // 힌트 버튼 토글
  const hintToggle = $('#toggle-hint');
  hintToggle.classList.toggle('on', state.settings.hintEnabled);
}

/**
 * 토글 클릭 핸들러 (HTML onclick에서 호출)
 */
export function toggleSetting(key, el) {
  if (key === 'ttsEnabled' && !TTS_AVAILABLE) return;
  state.settings[key] = !state.settings[key];
  el.classList.toggle('on', state.settings[key]);
  state.userOverrides[key] = state.settings[key];
  saveSettings();
}

/**
 * "기본값" 버튼
 */
export function resetSettings() {
  resetSettingsToDefault();
  saveSettings();
  renderSettings();
}

/**
 * 설정 화면 열기 — goTo + renderSettings 를 항상 함께 실행
 */
export function openSettings() {
  goTo('settings-screen');
  renderSettings();
}

/**
 * "시작하기" 버튼
 * - 유효성 검사 후 게임 시작
 */
export function startFromSettings() {
  if (state.settings.categories.size === 0) {
    showFlash('카테고리를 최소 하나 이상 선택해주세요');
    return;
  }
  const pool = filterWords(state.settings);
  if (pool.length === 0) {
    showFlash('선택한 조건에 맞는 단어가 없어요. 조건을 완화해주세요');
    return;
  }
  goTo('play-screen');
  startGame();
}

/**
 * 레벨 버튼 (1/2/3) 클릭 — 단어 길이 기반 난이도 설정 후 바로 시작
 */
export function startWithLevel(level) {
  // 레벨 버튼은 항상 레벨 기본값 적용 (userOverrides 무시)
  // 그 외 설정(카테고리, 문제 수, 타이머 등)은 현재 state.settings 유지
  Object.assign(state.settings, LEVEL_DEFAULTS[level]);
  goTo('play-screen');
  startGame();
}
