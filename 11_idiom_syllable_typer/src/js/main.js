/**
 * main.js — 진입점 / 부트스트랩 (PLAN M2 — M0 스텁 대체)
 *
 * - 저장된 설정 로드 → state.settings 병합 → DOM 반영
 * - 화면 전환 이벤트 바인딩 (data-goto 위임) — game 진입 시 startSession()
 * - 설정 토글·시작 레벨 칩 → state.settings + localStorage 즉시 저장
 *   (설정 화면 정식 렌더링·레벨 연동 고도화는 M3 settings.js)
 * - TTS 미지원 기기: 토글 비활성화 + 안내
 */

import { state } from './state.js';
import * as storage from './storage.js';
import * as tts from './tts.js';
import * as ui from './ui.js';
import * as game from './game.js';
import * as end from './end.js';

/* ── 설정 로드 / DOM 반영 ───────────────────────── */

/** 토글 DOM id → settings 키 매핑 */
const TOGGLE_MAP = {
  'toggle-tts': 'ttsEnabled',
  'toggle-sound': 'soundEnabled',
  'toggle-autofade': 'autoFade',
};

function loadSettings() {
  const saved = storage.load('settings');
  if (saved && typeof saved === 'object') Object.assign(state.settings, saved);

  /* TTS 미지원 기기 — 강제 OFF + 토글 비활성화 + 안내 */
  if (!tts.isSupported()) {
    state.settings.ttsEnabled = false;
    const toggle = ui.el('toggle-tts');
    if (toggle) {
      toggle.classList.add('disabled');
      toggle.setAttribute('aria-disabled', 'true');
    }
    const hint = ui.el('tts-hint');
    if (hint) hint.textContent = '이 기기에서는 TTS를 지원하지 않아요';
  }
}

function saveSettings() {
  storage.save('settings', state.settings);
}

/** state.settings 값을 토글·레벨 칩 DOM에 반영 */
function applySettingsToDom() {
  Object.entries(TOGGLE_MAP).forEach(([id, key]) => {
    const toggle = ui.el(id);
    if (!toggle) return;
    toggle.classList.toggle('on', Boolean(state.settings[key]));
    toggle.setAttribute('aria-checked', String(Boolean(state.settings[key])));
  });

  document.querySelectorAll('#level-chips .chip').forEach((chip) => {
    chip.classList.toggle('active', Number(chip.dataset.level) === state.settings.fadingLevel);
  });
}

/* ── 이벤트 위임 ────────────────────────────────── */

function bindEvents() {
  document.addEventListener('click', (e) => {
    /* 화면 전환 (data-goto) */
    const gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn) {
      const target = gotoBtn.dataset.goto;
      ui.showScreen(target);
      if (target === 'game-screen') game.startSession();
      return;
    }

    /* 설정 토글 */
    const toggle = e.target.closest('.toggle');
    if (toggle && !toggle.classList.contains('disabled')) {
      const key = TOGGLE_MAP[toggle.id];
      if (key) {
        state.settings[key] = !state.settings[key];
        saveSettings();
        applySettingsToDom();
      }
      return;
    }

    /* 시작 레벨 칩 (단일 선택) */
    const chip = e.target.closest('#level-chips .chip');
    if (chip) {
      state.settings.fadingLevel = Number(chip.dataset.level) || 1;
      saveSettings();
      applySettingsToDom();
      if (state.settings.fadingLevel > 1) {
        ui.showToast('Lv.2·3 입력은 준비 중이에요 — 지금은 Lv.1로 진행돼요');
      }
    }
  });
}

/* ── 부트스트랩 ─────────────────────────────────── */

loadSettings();
applySettingsToDom();
bindEvents();

game.init({
  onSessionEnd: () => {
    ui.showScreen('end-screen');
    end.render();
  },
});

/* 디버그 편의 전역 노출 */
window.showScreen = ui.showScreen;
