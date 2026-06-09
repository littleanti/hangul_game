/**
 * 프로필 관리 — 사용자별 설정 분리
 *
 * localStorage 구조:
 *   chosung-quiz-profiles-v1 = {
 *     profiles: [{ id, name, emoji, createdAt, settings }, ...],
 *     currentProfileId: "...",
 *   }
 *
 * - 각 프로필은 독립된 settings(카테고리/난이도/문제수/타이머/토글)를 가짐
 * - 기존 v2 단일 설정 데이터가 있으면 "게스트" 프로필로 자동 마이그레이션
 */

import { DEFAULT_SETTINGS, STORAGE_KEY } from './config.js';
import { CATEGORIES } from '../data/words.js';

const PROFILES_KEY = 'chosung-quiz-profiles-v1';

export const PROFILE_EMOJIS = ['🧒', '👦', '👧', '🐻', '🐰', '🐼', '🦊', '🐸'];
export const MAX_PROFILES    = 8;
export const MAX_NAME_LENGTH = 8;

function uuid() {
  return 'p-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
}

function defaultProfileSettings() {
  return {
    ...DEFAULT_SETTINGS,
    categories: [...CATEGORIES],  // 직렬화용 배열 포맷
  };
}

let data = {
  profiles: [],
  currentProfileId: null,
};

function readRaw() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function persist() {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(data));
  } catch (e) {
    /* private 모드 등 - 무시 */
  }
}

function readLegacySettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearLegacy() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* 무시 */ }
}

/**
 * 앱 시작 시 호출 — 데이터 로드 또는 초기 프로필 생성(+마이그레이션)
 */
export function initProfiles() {
  const existing = readRaw();
  if (existing && Array.isArray(existing.profiles) && existing.profiles.length > 0) {
    data = existing;
    // 현재 ID가 유효하지 않으면 첫 프로필로 복구
    if (!data.profiles.find(p => p.id === data.currentProfileId)) {
      data.currentProfileId = data.profiles[0].id;
      persist();
    }
    return;
  }

  // 최초 실행 — legacy 설정이 있으면 "게스트" 프로필로 이전
  const legacy = readLegacySettings();
  const initial = {
    id: uuid(),
    name: '게스트',
    emoji: '🧒',
    createdAt: Date.now(),
    settings: legacy || defaultProfileSettings(),
  };
  data = { profiles: [initial], currentProfileId: initial.id };
  persist();
  clearLegacy();
}

export function listProfiles() {
  return [...data.profiles];
}

export function getCurrentProfile() {
  return data.profiles.find(p => p.id === data.currentProfileId) || null;
}

export function setCurrentProfile(id) {
  if (!data.profiles.find(p => p.id === id)) return false;
  data.currentProfileId = id;
  persist();
  return true;
}

export function createProfile(name, emoji) {
  if (data.profiles.length >= MAX_PROFILES) return null;
  const trimmed = (name || '').trim().slice(0, MAX_NAME_LENGTH);
  if (!trimmed) return null;
  const p = {
    id: uuid(),
    name: trimmed,
    emoji: emoji && PROFILE_EMOJIS.includes(emoji) ? emoji : PROFILE_EMOJIS[0],
    createdAt: Date.now(),
    settings: defaultProfileSettings(),
  };
  data.profiles.push(p);
  data.currentProfileId = p.id;
  persist();
  return p;
}

export function deleteProfile(id) {
  if (data.profiles.length <= 1) return false;  // 최소 하나 유지
  data.profiles = data.profiles.filter(p => p.id !== id);
  if (data.currentProfileId === id) {
    data.currentProfileId = data.profiles[0].id;
  }
  persist();
  return true;
}

/**
 * 현재 프로필의 settings를 갱신 (storage.js saveSettings에서 호출)
 */
export function saveCurrentProfileSettings(settings) {
  const cur = getCurrentProfile();
  if (!cur) return;
  cur.settings = settings;
  persist();
}

export function getCurrentProfileSettings() {
  const cur = getCurrentProfile();
  return cur ? cur.settings : null;
}
