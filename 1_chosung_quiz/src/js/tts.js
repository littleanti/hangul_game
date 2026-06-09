/**
 * TTS (Text-To-Speech) 모듈
 * Web Speech API를 사용해 한국어 단어를 읽어줍니다.
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

// 음성 리스트는 비동기로 로드되므로 이벤트 리스너 등록 필요
if (TTS_AVAILABLE) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * 단어 발음 재생
 * @param {string} text - 읽을 텍스트
 * @param {HTMLElement} [btnEl] - 재생 중 애니메이션을 적용할 버튼 엘리먼트
 */
export function speak(text, btnEl) {
  if (!TTS_AVAILABLE || !state.settings.ttsEnabled) return;
  try {
    speechSynthesis.cancel(); // 이전 발음 중단
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.85;
    u.pitch = 1.05;
    if (koVoice) u.voice = koVoice;

    if (btnEl) {
      btnEl.classList.add('speaking');
      u.onend = () => btnEl.classList.remove('speaking');
      u.onerror = () => btnEl.classList.remove('speaking');
    }
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 */
  }
}

export function cancelSpeech() {
  if (TTS_AVAILABLE) {
    try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }
}
