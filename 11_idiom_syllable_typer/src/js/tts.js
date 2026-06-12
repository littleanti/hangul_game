/**
 * tts.js — Web Speech API 래퍼 (TRD §10)
 *
 * - `ko-KR` 우선 → `ko*` → default 폴백
 * - `voiceschanged` 이벤트 + 즉시 호출 이중 로드 (일부 브라우저는 비동기 로드)
 * - 미지원 환경에서는 모든 함수가 조용히 no-op (앱 정상 동작 유지)
 */

let koVoice = null;

/** 음성 목록에서 한국어 보이스 선택 (ko-KR → ko* → null) */
function loadVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  koVoice =
    voices.find((v) => v.lang === 'ko-KR') ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ko')) ||
    null;
}

/* 이중 로드: 이벤트(비동기 로드 브라우저) + 즉시(동기 로드 브라우저) */
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', loadVoice);
  loadVoice();
}

/**
 * TTS 지원 여부.
 * @returns {boolean}
 */
export function isSupported() {
  return 'speechSynthesis' in window;
}

/**
 * 텍스트 발화. 중복 발화 방지를 위해 `cancel()` 선행 (TRD §11).
 * @param {string} text  발화할 텍스트
 * @param {number} rate  발화 속도 (기본 0.9)
 * @param {number} pitch 음높이 (기본 1.0)
 * @returns {SpeechSynthesisUtterance|null} 발화 객체 (onend 등 핸들러 연결용) — 미지원 시 null
 */
export function speak(text, rate = 0.9, pitch = 1.0) {
  if (!isSupported() || !text) return null;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ko-KR';
  utt.rate = rate;
  utt.pitch = pitch;
  if (koVoice) utt.voice = koVoice;
  speechSynthesis.speak(utt);
  return utt;
}

/** 진행 중인 발화 전부 취소. */
export function cancel() {
  if (isSupported()) speechSynthesis.cancel();
}
