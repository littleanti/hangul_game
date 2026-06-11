// settings.js — 설정 화면 렌더링·저장 (M0 스텁 → M4 본 구현)

import { state } from './state.js';
import * as storage from './storage.js';
import * as tts from './tts.js';

const TOGGLE_IDS = {
  ttsEnabled: 'toggle-tts',
  sfxEnabled: 'toggle-sfx',
  hintVisible: 'toggle-hint',
};

/** 저장된 설정 로드 후 토글 UI 동기화 */
export function init() {
  const saved = storage.get('settings');
  if (saved && typeof saved === 'object') {
    for (const k of Object.keys(TOGGLE_IDS)) {
      if (typeof saved[k] === 'boolean') state.settings[k] = saved[k];
    }
  }
  // TTS 미지원 시 토글 자동 비활성화 (graceful degradation, TRD §8.2)
  if (!tts.isSupported()) {
    state.settings.ttsEnabled = false;
    const el = document.getElementById(TOGGLE_IDS.ttsEnabled);
    if (el) el.classList.add('disabled');
    const hint = document.getElementById('tts-hint');
    if (hint) hint.textContent = '이 기기에서는 소리 읽기를 지원하지 않아요';
  }
  syncToggles();
}

function syncToggles() {
  for (const [k, id] of Object.entries(TOGGLE_IDS)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', !!state.settings[k]);
  }
}

/** 토글 탭 핸들러 (index.html onclick) */
export function toggleSetting(key, el) {
  if (!(key in TOGGLE_IDS)) return;
  if (key === 'ttsEnabled' && !tts.isSupported()) return; // 미지원 시 무시
  state.settings[key] = !state.settings[key];
  if (el) el.classList.toggle('on', state.settings[key]);
}

/** 설정 저장 ('7rr:settings') */
export function save() {
  storage.set('settings', {
    ttsEnabled: state.settings.ttsEnabled,
    sfxEnabled: state.settings.sfxEnabled,
    hintVisible: state.settings.hintVisible,
  });
}

/** 진행 초기화 — '7rr:progress' + '7rr:leaderboard' 삭제 (확인 다이얼로그는 M4) */
export function resetProgress() {
  storage.remove('progress');
  storage.remove('leaderboard');
  state.progress.totalSessions = 0;
  state.progress.bestScore = 0;
  state.progress.lastHintLevel = 1;
}
