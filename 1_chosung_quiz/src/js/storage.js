/**
 * 설정 영속화 — 현재 프로필의 settings로 라우팅
 * 실제 저장소 I/O는 profiles.js가 담당
 */

import { DEFAULT_SETTINGS } from './config.js';
import { state } from './state.js';
import { CATEGORIES } from '../data/words.js';
import { saveCurrentProfileSettings, getCurrentProfileSettings } from './profiles.js';

export function saveSettings() {
  try {
    const toSave = {
      ...state.settings,
      categories: [...state.settings.categories],
      _userOverrides: state.userOverrides,
    };
    saveCurrentProfileSettings(toSave);
  } catch (e) {
    /* 무시 */
  }
}

export function loadSettings() {
  try {
    const parsed = getCurrentProfileSettings();
    if (!parsed) return;
    const { _userOverrides, ...settingsData } = parsed;
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
