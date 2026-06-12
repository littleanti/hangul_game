/**
 * 설정 영속화 — localStorage 직접 저장/로드
 */

import { DEFAULT_SETTINGS, STORAGE_KEY } from './config.js';
import { state } from './state.js';
import { CATEGORIES } from '../data/words.js';

// v2.1~v2.3 프로필 시스템이 쓰던 키 — 발견 시 현재 프로필 설정을 1회 이전
const LEGACY_PROFILES_KEY = 'chosung-quiz-profiles-v1';

function migrateLegacyProfiles() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const raw = localStorage.getItem(LEGACY_PROFILES_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const cur = data.profiles?.find(p => p.id === data.currentProfileId) || data.profiles?.[0];
    if (cur?.settings) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cur.settings));
    }
    localStorage.removeItem(LEGACY_PROFILES_KEY);
  } catch (e) {
    /* 무시 */
  }
}

export function saveSettings() {
  try {
    const toSave = {
      ...state.settings,
      categories: [...state.settings.categories],
      _userOverrides: state.userOverrides,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    /* 무시 */
  }
}

export function loadSettings() {
  try {
    migrateLegacyProfiles();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const { _userOverrides, ...settingsData } = JSON.parse(raw);
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...settingsData,
      categories: new Set(
        settingsData.categories && settingsData.categories.length ? settingsData.categories : CATEGORIES
      ),
    };
    state.userOverrides = _userOverrides || {};
  } catch (e) {
    /* 무시 */
  }
}
