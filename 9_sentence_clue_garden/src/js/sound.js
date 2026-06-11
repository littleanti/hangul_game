/**
 * Web Audio API 효과음 (TRD §9.4 — 독립 모듈)
 * M0: 스텁. M2에서 OscillatorNode 기반 정답/오답 효과음 완성.
 */

let audioCtx = null;

/** AudioContext 생성·재개 — 첫 사용자 인터랙션에서 호출 (자동재생 정책 대응) */
export function resumeAudio() {
  // TODO(M2): audioCtx = new AudioContext(); resume()
  void audioCtx;
}

/** 정답 효과음 (M2: 짧은 상승 사인파) */
export function playCorrect() {
  // TODO(M2): settings.soundEnabled 검사 + OscillatorNode
}

/** 오답 효과음 (M2: 짧은 하강 사인파) */
export function playWrong() {
  // TODO(M2)
}
