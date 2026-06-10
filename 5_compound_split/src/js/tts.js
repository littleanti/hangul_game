/**
 * Web Speech API 래퍼 (TRD §12.1)
 * ko-KR 우선 → ko* 폴백 → 기본 음성. 미지원 시 graceful degradation.
 */

import { state } from './state.js';

let koVoice = null;
let unlocked = false;

/** TTS 지원 여부 */
export function isTTSSupported() {
  return 'speechSynthesis' in window;
}

/** ko-KR 우선 음성 선택 — voiceschanged 비동기 로딩 대응 */
function pickVoice() {
  if (!isTTSSupported()) return;
  const voices = speechSynthesis.getVoices();
  koVoice =
    voices.find(v => v.lang === 'ko-KR') ||
    voices.find(v => v.lang && v.lang.startsWith('ko')) ||
    null;
}

if (isTTSSupported()) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

/** 자동재생 정책 대응 — 첫 사용자 인터랙션에서 호출 */
export function unlock() {
  if (!isTTSSupported() || unlocked) return;
  unlocked = true;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 */
  }
}

/**
 * 텍스트 발화 — 설정 OFF·미지원 시 no-op.
 * @param {string} text
 */
export function speak(text) {
  if (!isTTSSupported() || !state.settings.ttsEnabled || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;  // 유아 속도
  utterance.pitch = 1.05;
  if (koVoice) utterance.voice = koVoice;
  speechSynthesis.speak(utterance);
}

/** 진행 중인 발화 전체 취소 — 화면 전환 공통 부작용 (TRD §2.3) */
export function cancelSpeech() {
  if (!isTTSSupported()) return;
  speechSynthesis.cancel();
}
