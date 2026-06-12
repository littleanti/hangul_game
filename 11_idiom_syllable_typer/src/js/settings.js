/**
 * settings.js — 설정 로드/저장 + 화면 렌더 + 토글 + 시작 레벨 (PLAN M3 / TRD §2.2)
 *
 * - 토글: TTS·효과음·자동 페이딩 진급(기본 OFF) → state.settings + 11ist_settings 즉시 저장
 * - selectLevel(level): 시작 화면 레벨 칩 탭 → fadingLevel 교체·저장 (선택만 — 시작은 "시작하기" 버튼)
 * - TTS 미지원 기기: ttsEnabled 강제 OFF + 토글 비활성화 + 안내 문구
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
};

/** 페이딩 레벨을 1~3 범위로 보정 */
function clampLevel(level) {
  const lv = Number(level) || MIN_FADING_LEVEL;
  return Math.min(MAX_FADING_LEVEL, Math.max(MIN_FADING_LEVEL, lv));
}

/** 부트스트랩: 저장 설정 로드 → TTS 지원 확인 → DOM 반영. */
export function init() {
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
 * 시작 화면 레벨 칩 탭 → 시작 레벨 선택만 (게임 시작은 "시작하기" 버튼).
 * @param {number|string} level 1 | 2 | 3
 */
export function selectLevel(level) {
  state.settings.fadingLevel = clampLevel(level);
  save();
  render();
  showToast(`🎯 Lv.${state.settings.fadingLevel} 선택!`);
}
