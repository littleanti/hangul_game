// Web Speech API 래퍼
import { CONFIG } from './config.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
let koVoice = null;
let voicesLoaded = false;

function loadVoices() {
  if (!supported) return;
  const voices = speechSynthesis.getVoices();
  koVoice = voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko')) || null;
  voicesLoaded = voices.length > 0;
}

if (supported) {
  loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

export function isTTSSupported() {
  return supported;
}

export function cancel() {
  if (!supported) return;
  try { speechSynthesis.cancel(); } catch {}
}

export function speak(text, { hanja = false } = {}) {
  if (!supported || !text) return;
  cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = CONFIG.TTS_LANG;
  u.rate = hanja ? CONFIG.TTS_RATE_HANJA : CONFIG.TTS_RATE_WORD;
  if (koVoice) u.voice = koVoice;
  speechSynthesis.speak(u);
}
