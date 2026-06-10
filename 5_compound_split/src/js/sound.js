/**
 * Web Audio API 효과음 — 오실레이터로 정답/오류 톤 생성 (TRD §12.2)
 * 외부 오디오 파일 없음. 설정 OFF·미지원 시 no-op.
 */

import { state } from './state.js';

let ctx = null;

function getCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** 자동재생 정책 대응 — 첫 사용자 인터랙션에서 호출 */
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

/**
 * 단일 톤 재생 — gain envelope로 클릭 노이즈 방지.
 * @param {number} freq 주파수(Hz)
 * @param {number} durationMs 길이(ms)
 * @param {OscillatorType} type 파형
 */
function playTone(freq, durationMs, type = 'sine') {
  if (!state.settings.soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = c.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.05);
}

/** 정답 톤 — 밝은 상승 2음 */
export function playCorrect() {
  playTone(880, 180);          // A5
  setTimeout(() => playTone(1174.66, 240), 120); // D6
}

/** 오류 톤 — 낮은 단음 */
export function playError() {
  playTone(220, 250, 'square'); // A3
}
