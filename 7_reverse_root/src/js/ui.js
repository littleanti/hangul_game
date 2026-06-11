// ui.js — 화면 전환 헬퍼 (TRD §2.3 화면 상태 머신)

import * as pointer from './pointer.js';
import * as tts from './tts.js';
import * as audio from './audio.js';

export const SCREENS = ['start', 'settings', 'leaderboard', 'end', 'play'];

/**
 * 화면 전환. screenName: 'start' | 'settings' | 'leaderboard' | 'end' | 'play'
 * 모든 전이 시 부작용: pointer.releaseAll() + tts.cancel() + audio.stopAll()
 */
export function goTo(screenName) {
  if (!SCREENS.includes(screenName)) {
    console.warn(`[ui] 알 수 없는 화면: ${screenName}`);
    return;
  }
  pointer.releaseAll();
  tts.cancel();
  audio.stopAll();

  for (const name of SCREENS) {
    const el = document.getElementById(`${name}-screen`);
    if (el) el.classList.toggle('active', name === screenName);
  }
}

/** 현재 활성 화면 이름 반환 (없으면 null) */
export function current() {
  return SCREENS.find(name =>
    document.getElementById(`${name}-screen`)?.classList.contains('active')
  ) ?? null;
}
