/**
 * TTS — Web Speech API 래퍼 (TRD §2.3)
 * - ko-KR 음성 우선, voiceschanged 비동기 대기
 * - unlock(): 첫 사용자 인터랙션에서 호출 — iOS 등 자동재생 정책 해제
 * - 미지원 브라우저 graceful fallback: speak()는 조용히 no-op
 */

import { state } from './state.js';

export const TTS_AVAILABLE =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

let koVoice = null;

function loadVoices() {
  if (!TTS_AVAILABLE) return;
  const voices = speechSynthesis.getVoices();
  koVoice =
    voices.find(v => v.lang === 'ko-KR') ||
    voices.find(v => v.lang && v.lang.startsWith('ko')) ||
    null;
}

// 음성 리스트는 비동기 로드 — voiceschanged 대기 (TRD §10)
if (TTS_AVAILABLE) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

let unlocked = false;

/**
 * 첫 pointerdown에서 호출 — 무음 발화로 speechSynthesis 활성화 + 음성 목록 재시도
 */
export function unlock() {
  if (!TTS_AVAILABLE || unlocked) return;
  unlocked = true;
  try {
    loadVoices();
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 */
  }
}

/**
 * 텍스트 발음 재생 (설정 ttsEnabled 존중)
 * @param {string} text - 읽을 텍스트
 */
export function speak(text) {
  if (!TTS_AVAILABLE || !state.settings.ttsEnabled) return;
  try {
    speechSynthesis.cancel(); // 이전 발음 중단
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.85;
    u.pitch = 1.05;
    if (koVoice) u.voice = koVoice;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 — graceful fallback */
  }
}

/** 모음 객체 발음 재생 */
export function speakVowel(vowel) {
  if (vowel) speak(vowel.sound);
}

export function cancelSpeech() {
  if (TTS_AVAILABLE) {
    try { speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
  }
}
