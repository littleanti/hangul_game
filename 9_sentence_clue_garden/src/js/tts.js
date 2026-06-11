/**
 * Web Speech API 래퍼 (TRD §7.3 — 독립 모듈)
 * M0: 스텁. M2에서 speak()·unlock()·미지원 감지 완성.
 */

import { TTS_RATE, TTS_LANG } from './config.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** TTS 지원 여부 — 미지원 시 설정 토글 자동 비활성화에 사용 (M2) */
export function isTtsSupported() {
  return supported;
}

/** 자동재생 정책 대응 — 첫 사용자 인터랙션에서 호출 (M2에서 구현) */
export function unlock() {
  // TODO(M2): 무음 utterance로 음성 엔진 워밍업
}

/** 텍스트 읽기 (M2에서 구현) */
export function speak(text, { rate = TTS_RATE, lang = TTS_LANG } = {}) {
  // TODO(M2): settings.ttsEnabled 검사 + SpeechSynthesisUtterance 발화
  void text; void rate; void lang;
}

/** 진행 중 발화 중단 — 화면 전환 공통 부작용 (ui.js goTo가 호출) */
export function cancelSpeech() {
  try {
    if (supported) window.speechSynthesis.cancel();
  } catch {
    // 무시
  }
}
