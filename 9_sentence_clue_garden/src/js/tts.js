/**
 * Web Speech API 래퍼 (TRD §7.3)
 * - ko-KR 우선 음성 선택, rate 0.85 기본
 * - 미지원 브라우저: isTtsSupported() → 설정 토글 자동 비활성화 (settings.js)
 * - 설정 OFF·미지원 시 speak()는 no-op
 */

import { TTS_RATE, TTS_LANG } from './config.js';
import { state } from './state.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let koVoice = null;
let unlocked = false;

/** TTS 지원 여부 — 미지원 시 설정 토글 자동 비활성화에 사용 */
export function isTtsSupported() {
  return supported;
}

/** ko-KR 우선 음성 선택 — voiceschanged 비동기 로딩 대응 */
function pickVoice() {
  if (!supported) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    koVoice =
      voices.find(v => v.lang === TTS_LANG) ||
      voices.find(v => v.lang && v.lang.startsWith('ko')) ||
      null;
  } catch {
    koVoice = null;
  }
}

if (supported) {
  pickVoice();
  window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

/** 자동재생 정책 대응 — 첫 사용자 인터랙션에서 호출 (무음 발화로 엔진 워밍업) */
export function unlock() {
  if (!supported || unlocked) return;
  unlocked = true;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    // 무시
  }
}

/** 텍스트 읽기 — rate 0.85 / ko-KR 기본 (TRD §7.3) */
export function speak(text, { rate = TTS_RATE, lang = TTS_LANG } = {}) {
  if (!supported || !state.settings.ttsEnabled || !text) return;
  try {
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1.05;
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis.speak(u);
  } catch {
    // 무시
  }
}

/** 진행 중 발화 중단 — 화면 전환 공통 부작용 (ui.js goTo가 호출) */
export function cancelSpeech() {
  try {
    if (supported) window.speechSynthesis.cancel();
  } catch {
    // 무시
  }
}
