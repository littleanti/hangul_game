// 설정 영속화 — TRD §2.1 / 1_chosung_quiz/src/js/storage.js 패턴
// Private Mode 등 localStorage 실패 시에도 게임이 깨지지 않음.
import { STORAGE_PREFIX } from './config.js';
import { state, DEFAULT_SETTINGS } from './state.js';

const KEY_SETTINGS = STORAGE_PREFIX + 'settings';

// 영속 가능한 필드만 보존 (audioReady/speechReady 같은 런타임 플래그 제외)
const PERSISTENT_KEYS = Object.keys(DEFAULT_SETTINGS);

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    PERSISTENT_KEYS.forEach(k => {
      if (parsed[k] !== undefined) state.settings[k] = parsed[k];
    });
  } catch (_) {}
}

export function saveSettings() {
  try {
    const payload = {};
    PERSISTENT_KEYS.forEach(k => { payload[k] = state.settings[k]; });
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(payload));
  } catch (_) {}
}

export function resetSettings() {
  Object.assign(state.settings, DEFAULT_SETTINGS);
  saveSettings();
}

// 도감/별 초기화 — 부모-자녀 동시 사용 시 다른 아이로 넘길 때
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_PREFIX + 'collected');
    localStorage.removeItem(STORAGE_PREFIX + 'stars');
  } catch (_) {}
  state.progress.collected = new Set();
  state.progress.stars     = 0;
}
