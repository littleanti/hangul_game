// audio.js — Web Audio API 오실레이터 효과음 (M0 스텁 → M2 본 구현, TRD §2.1)

import { state } from './state.js';

let ctx = null;

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

function beep(freq, durationMs, type = 'sine') {
  if (!ctx || !state.settings.sfxEnabled) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch { /* 무시 */ }
}

export function playCorrect() { beep(880, 180); }
export function playWrong()   { beep(196, 250, 'square'); }
export function playDecomp()  { beep(523, 300, 'triangle'); }

export function stopAll() {
  // 오실레이터는 단발성 — 별도 정지 대상 없음 (M2에서 노드 추적 시 확장)
}
