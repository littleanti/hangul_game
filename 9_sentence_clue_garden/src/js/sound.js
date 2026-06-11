/**
 * Web Audio API 효과음 (TRD §9.4)
 * - OscillatorNode 사인파 기반 — 외부 오디오 파일 의존 없음
 * - AudioContext는 첫 사용자 인터랙션 후 생성·재개 (자동재생 정책 대응)
 * - 설정 OFF·미지원 시 no-op
 */

import { state } from './state.js';

let audioCtx = null;

function getCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/** AudioContext 생성·재개 — 첫 사용자 인터랙션에서 호출 (main.js) */
export function resumeAudio() {
  try {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  } catch {
    // 무시
  }
}

/**
 * 단일 톤 재생 — gain envelope로 클릭 노이즈 방지
 * @param {number} freq 주파수(Hz)
 * @param {number} durationMs 길이(ms)
 * @param {OscillatorType} type 파형
 */
function playTone(freq, durationMs, type = 'sine') {
  if (!state.settings.soundEnabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.05);
  } catch {
    // 무시
  }
}

/** 정답 효과음 — 밝은 상승 2음 */
export function playCorrect() {
  playTone(880, 180);                              // A5
  setTimeout(() => playTone(1174.66, 240), 120);   // D6
}

/** 오답 효과음 — 낮은 하강 단음 */
export function playWrong() {
  playTone(220, 250, 'square');                    // A3
}
