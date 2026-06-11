// tts.js — Web Speech API 래퍼 (M2 본 구현, TRD §2.1, §8.2)
// 한국어 보이스 우선 선택 + voiceschanged 대기. 미지원 브라우저에서도 graceful no-op.

import { state } from './state.js';

export function isSupported() {
  return 'speechSynthesis' in window;
}

// ----- 한국어 보이스 선택 (voiceschanged 대기) -----
let koVoice = null;

function pickKoreanVoice() {
  try {
    const voices = speechSynthesis.getVoices() || [];
    const ko = voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith('ko'));
    if (ko.length === 0) { koVoice = null; return; }
    // 품질 우선순위: 기기 내장(localService) + 기본 > 기기 내장 > 기본 > 첫 번째
    koVoice =
      ko.find(v => v.localService && v.default) ||
      ko.find(v => v.localService) ||
      ko.find(v => v.default) ||
      ko[0];
  } catch { koVoice = null; }
}

if (isSupported()) {
  pickKoreanVoice(); // 일부 브라우저(Safari 등)는 즉시 목록 제공
  try {
    // Chrome 등은 비동기 로드 — voiceschanged 대기 후 재선택
    speechSynthesis.addEventListener('voiceschanged', pickKoreanVoice);
  } catch {
    try { speechSynthesis.onvoiceschanged = pickKoreanVoice; } catch { /* 무시 */ }
  }
}

/** 사용자 제스처 게이트 — start 화면 첫 탭에서 호출 (iOS Safari 활성화) */
export function unlock() {
  if (!isSupported()) return;
  try {
    // 무음 발화로 speechSynthesis 활성화
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
    state.settings.speechReady = true;
    if (!koVoice) pickKoreanVoice();
  } catch { /* 무시 */ }
}

/** 한국어 보이스 우선 발화 — 이전 발화 즉시 끊고 새로 말함 (TRD §11) */
export function speak(text) {
  if (!isSupported() || !state.settings.ttsEnabled || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    if (koVoice) u.voice = koVoice;
    u.rate = 0.95; // 만 8세 대상 — 약간 천천히
    speechSynthesis.speak(u);
  } catch { /* 무시 */ }
}

export function cancel() {
  if (!isSupported()) return;
  try { speechSynthesis.cancel(); } catch { /* 무시 */ }
}
