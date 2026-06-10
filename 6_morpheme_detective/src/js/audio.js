// Web Audio API 효과음 — TRD §4.3 (Oscillator 기반, 외부 파일 없음)
import { state } from './state.js';

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function unlock() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
  } catch (e) {
    console.warn('[audio] unlock 실패:', e);
  }
}

export function stopAll() {
  // Oscillator 노드는 자체 종료 — ctx는 재사용을 위해 유지
}

// ── 발견음: 상승 사인파 (220→440Hz, 0.3s) ────────────────────────
function playDiscovery(c) {
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, c.currentTime);
  osc.frequency.linearRampToValueAtTime(440, c.currentTime + 0.3);

  gain.gain.setValueAtTime(0.4, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.35);
}

// ── 변형음: 하강 사인파 (440→220Hz, 0.5s) + 약한 진폭 ──────────
function playTransform(c) {
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, c.currentTime);
  osc.frequency.linearRampToValueAtTime(220, c.currentTime + 0.5);

  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.55);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.55);
}

// ── 보상음: C5→E5→G5 아르페지오 (0.5s) ──────────────────────────
function playReward(c) {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);

    const t0 = c.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);

    osc.start(t0);
    osc.stop(t0 + 0.28);
  });
}

export function play(name) {
  if (state.settings.audioEnabled === false) return;
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    if      (name === 'discovery') playDiscovery(c);
    else if (name === 'transform') playTransform(c);
    else if (name === 'reward')    playReward(c);
  } catch (e) {
    console.warn('[audio] play 실패:', e);
  }
}
