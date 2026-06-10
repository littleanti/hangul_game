/**
 * 효과음 — Web Audio API 오실레이터 (외부 파일 없음, TRD §2.3)
 * - playCorrect / playWrong / playSnap
 * - AudioContext는 첫 호출 시 lazy-init, 첫 pointerdown에서 resumeAudio() (자동재생 정책)
 * - 설정 sfxEnabled 존중
 */

import { state } from './state.js';

let ctx = null;

function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch (e) {
    return null;
  }
  return ctx;
}

/** 첫 사용자 인터랙션에서 호출 — suspended 컨텍스트 재개 (TRD §7.4) */
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => { /* 무시 */ });
  }
}

/**
 * 단일 톤 재생
 * @param {number} freq   주파수 (Hz)
 * @param {number} start  현재 시점 기준 시작 오프셋 (초)
 * @param {number} dur    재생 길이 (초)
 * @param {string} type   oscillator type
 * @param {number} peak   피크 볼륨 (0-1)
 */
function tone(freq, start, dur, type = 'sine', peak = 0.18) {
  if (!state.settings.sfxEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** 정답: C5 → E5 → G5 밝은 상승 아르페지오 */
export function playCorrect() {
  tone(523.25, 0.00, 0.14, 'triangle');  // C5
  tone(659.25, 0.12, 0.14, 'triangle');  // E5
  tone(783.99, 0.24, 0.22, 'triangle');  // G5
}

/** 오답: 낮은 하강 톤 (G3 → D3) */
export function playWrong() {
  tone(196.00, 0.00, 0.16, 'sawtooth', 0.12);  // G3
  tone(146.83, 0.14, 0.28, 'sawtooth', 0.12);  // D3
}

/** 자성 스냅: 짧은 상승 "퐁" (A5 → E6) */
export function playSnap() {
  tone(880.00,  0.00, 0.08, 'sine', 0.2);   // A5
  tone(1318.51, 0.06, 0.14, 'sine', 0.16);  // E6
}
