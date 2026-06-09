// 진행률 추적 — TRD §2.1 / PRD F11·F16
// localStorage prefix `4md:`, Private Mode 실패 시에도 게임이 깨지지 않음
import { STORAGE_PREFIX } from './config.js';
import { state }          from './state.js';

const KEY_COLLECTED = STORAGE_PREFIX + 'collected';
const KEY_STARS     = STORAGE_PREFIX + 'stars';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY_COLLECTED);
    if (raw) state.progress.collected = new Set(JSON.parse(raw));
    const s   = localStorage.getItem(KEY_STARS);
    if (s) state.progress.stars = Number(s) || 0;
  } catch (_) {}
}

export function saveProgress() {
  try {
    localStorage.setItem(KEY_COLLECTED, JSON.stringify([...state.progress.collected]));
    localStorage.setItem(KEY_STARS,     String(state.progress.stars));
  } catch (_) {}
}

// 별 정책: 같은 한자는 처음 발견 시에만 1별 지급
// 한국어문회 7·8급 100자 기준 최대 100별 — game.js 표시 상한은 시각적으로 10별
export function recordDiscovery(hanjaId) {
  const isNew = !state.progress.collected.has(hanjaId);
  state.progress.collected.add(hanjaId);
  state.progress.sessionCollected.add(hanjaId);
  if (isNew) state.progress.stars += 1;
  state.progress.sessionDiscoveries += 1;
  saveProgress();
  return isNew;
}

export function resetSession() {
  state.progress.sessionDiscoveries = 0;
  state.progress.sessionCollected   = new Set();
  state.progress.sessionStartedAt   = Date.now();
}

export function getSessionData() {
  return {
    sessionDiscoveries: state.progress.sessionDiscoveries,
    sessionCollected:   [...state.progress.sessionCollected],
    totalStars:         state.progress.stars,
    totalCollected:     [...state.progress.collected],
  };
}
