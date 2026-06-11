// audio.js — Web Audio API 오실레이터 효과음 (M2 본 구현, TRD §2.1)
// 외부 오디오 파일 없음 — 모든 효과음은 오실레이터로 합성.

import { state } from './state.js';

let ctx = null;
const activeNodes = new Set(); // 재생 중인 오실레이터 추적 (stopAll 대상)

/** 사용자 제스처 게이트 — start 화면 첫 탭에서 호출 */
export function unlock() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    state.settings.audioReady = true;
  } catch { /* 무시 */ }
}

/**
 * 단일 톤 합성 재생.
 * @param {number} freq        주파수(Hz)
 * @param {number} durationMs  길이(ms)
 * @param {OscillatorType} type 파형
 * @param {number} delayMs     시작 지연(ms) — 멜로디 시퀀스용
 */
function beep(freq, durationMs, type = 'sine', delayMs = 0) {
  if (!ctx || !state.settings.sfxEnabled) return;
  try {
    const t0 = ctx.currentTime + delayMs / 1000;
    const t1 = t0 + durationMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.15, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1);
    activeNodes.add(osc);
    osc.onended = () => activeNodes.delete(osc);
  } catch { /* 무시 */ }
}

/** 정답음 — 밝은 2음 상행 */
export function playCorrect() {
  beep(659, 120, 'sine');
  beep(880, 220, 'sine', 110);
}

/** 오답음 — 낮은 버즈 */
export function playWrong() {
  beep(196, 250, 'square');
}

/** 분해음 — 3음 상행 아르페지오 (분해 팝업 등장) */
export function playDecomp() {
  beep(523, 140, 'triangle');
  beep(659, 140, 'triangle', 120);
  beep(784, 240, 'triangle', 240);
}

/** 화면 전환 등에서 재생 중·예약된 효과음 즉시 정지 (TRD §2.3 부작용) */
export function stopAll() {
  for (const osc of activeNodes) {
    try { osc.stop(); } catch { /* 이미 정지된 노드 무시 */ }
  }
  activeNodes.clear();
}
