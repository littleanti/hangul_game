// tts.js — Web Speech API 래퍼 (M0 스텁 → M2 본 구현, TRD §2.1)
// 미지원 브라우저에서도 콘솔 에러 없이 graceful no-op.

import { state } from './state.js';

export function isSupported() {
  return 'speechSynthesis' in window;
}

/** 사용자 제스처 게이트 — start 화면 첫 탭에서 호출 */
export function unlock() {
  if (!isSupported()) return;
  try {
    // 무음 발화로 iOS Safari speechSynthesis 활성화
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
    state.settings.speechReady = true;
  } catch { /* 무시 */ }
}

/** 한국어 보이스 우선 발화 (M2에서 voiceschanged 대기·보이스 선택 구현) */
export function speak(text) {
  if (!isSupported() || !state.settings.ttsEnabled || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    speechSynthesis.speak(u);
  } catch { /* 무시 */ }
}

export function cancel() {
  if (!isSupported()) return;
  try { speechSynthesis.cancel(); } catch { /* 무시 */ }
}
