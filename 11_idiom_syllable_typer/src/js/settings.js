/**
 * settings.js — 설정 로드/저장 + 화면 렌더 + 토글 + 시작 레벨 (PLAN M3 / TRD §2.2)
 *
 * - 토글: TTS·효과음·자동 페이딩 진급·레벨 고정 → state.settings + 11ist_settings 즉시 저장
 * - startWithLevel(level): 시작 화면 레벨 칩 탭 → fadingLevel 교체 → 즉시 게임 시작
 * - TTS 미지원 기기: ttsEnabled 강제 OFF + 토글 비활성화 + 안내 문구
 * - 게임 시작 동작은 main.js 가 init() 으로 주입 — game.js 직접 import 회피 (TRD §2.2)
 */

import { MIN_FADING_LEVEL, MAX_FADING_LEVEL } from './config.js';
import { state } from './state.js';
import * as storage from './storage.js';
import * as tts from './tts.js';
import { el, showToast } from './ui.js';

/** 토글 DOM id → settings 키 매핑 */
const TOGGLE_MAP = {
  'toggle-tts': 'ttsEnabled',
  'toggle-sound': 'soundEnabled',
  'toggle-autofade': 'autoFade',
  'toggle-levellock': 'levelLock',
};

/** 게임 시작 콜백 (main.js 주입) */
let onStartGame = null;

/** 페이딩 레벨을 1~3 범위로 보정 */
function clampLevel(level) {
  const lv = Number(level) || MIN_FADING_LEVEL;
  return Math.min(MAX_FADING_LEVEL, Math.max(MIN_FADING_LEVEL, lv));
}

/**
 * 부트스트랩: 저장 설정 로드 → TTS 지원 확인 → DOM 반영.
 * @param {{ onStartGame?: () => void }} [opts]
 */
export function init({ onStartGame: cb } = {}) {
  onStartGame = cb || null;
  load();
  applyTtsSupport();
  render();
}

/** `11ist_settings` 로드 → state.settings 병합 (알 수 없는 키 무시, 레벨 범위 보정) */
export function load() {
  const saved = storage.load('settings');
  if (saved && typeof saved === 'object') {
    Object.keys(state.settings).forEach((key) => {
      if (key in saved) state.settings[key] = saved[key];
    });
  }
  state.settings.fadingLevel = clampLevel(state.settings.fadingLevel);
}

/** state.settings → `11ist_settings` 저장 */
export function save() {
  storage.save('settings', state.settings);
}

/** TTS 미지원 기기 감지: 강제 OFF + 토글 비활성화 + 안내 메시지 (PLAN M3) */
function applyTtsSupport() {
  if (tts.isSupported()) return;
  state.settings.ttsEnabled = false;
  const toggle = el('toggle-tts');
  if (toggle) {
    toggle.classList.add('disabled');
    toggle.setAttribute('aria-disabled', 'true');
  }
  const hint = el('tts-hint');
  if (hint) hint.textContent = '이 기기에서는 TTS를 지원하지 않아요';
}

/** 설정 화면 렌더: state.settings 값을 토글·레벨 칩 DOM에 반영 */
export function render() {
  Object.entries(TOGGLE_MAP).forEach(([id, key]) => {
    const toggle = el(id);
    if (!toggle) return;
    toggle.classList.toggle('on', Boolean(state.settings[key]));
    toggle.setAttribute('aria-checked', String(Boolean(state.settings[key])));
  });

  document.querySelectorAll('#level-chips .chip').forEach((chip) => {
    chip.classList.toggle('active', clampLevel(chip.dataset.level) === state.settings.fadingLevel);
  });
}

/**
 * 토글 탭 → 값 반전 + 저장 + DOM 갱신 (main.js 클릭 위임에서 호출).
 * disabled 토글(TTS 미지원)은 무시.
 * @param {HTMLElement} toggleEl
 */
export function toggleSetting(toggleEl) {
  if (!toggleEl || toggleEl.classList.contains('disabled')) return;
  const key = TOGGLE_MAP[toggleEl.id];
  if (!key) return;
  state.settings[key] = !state.settings[key];
  save();
  render();
}

/**
 * 시작 화면 레벨 칩 탭 → 해당 레벨로 즉시 게임 시작 (PLAN M3).
 * @param {number|string} level 1 | 2 | 3
 */
export function startWithLevel(level) {
  state.settings.fadingLevel = clampLevel(level);
  save();
  render();
  showToast(`🚀 Lv.${state.settings.fadingLevel} 바로 시작!`);
  if (onStartGame) onStartGame();
}
