/**
 * sound.js — Web Audio API 효과음 (TRD §1, §11 / PLAN M2)
 *
 * - `AudioContext`는 최초 사용자 인터랙션 이후(= 최초 play* 호출 시점) 생성
 *   → 브라우저 자동재생 정책 준수 (모든 호출 지점이 탭 이벤트 핸들러 내부)
 * - playCorrect(): 상승 아르페지오 (C5 → E5 → G5)
 * - playWrong():  하강 톤
 * - stopAll():    재생 중인 모든 노드 즉시 정지 (화면 전환 부작용용)
 */

/** @type {AudioContext|null} */
let ctx = null;

/** @type {Set<OscillatorNode>} 재생 중(예약 포함) 오실레이터 */
const activeNodes = new Set();

/** AudioContext 지연 생성 + suspended 복구. 미지원 시 null. */
function getCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * 단일 톤 재생 (내부 헬퍼).
 * @param {number} freq    시작 주파수 (Hz)
 * @param {number} delay   시작 지연 (초)
 * @param {number} duration 길이 (초)
 * @param {{type?: OscillatorType, volume?: number, endFreq?: number|null}} [opts]
 */
function playTone(freq, delay, duration, { type = 'sine', volume = 0.18, endFreq = null } = {}) {
  const ac = getCtx();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);

  /* 클릭 노이즈 방지: 어택/릴리스 엔벨로프 */
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);

  activeNodes.add(osc);
  osc.onended = () => activeNodes.delete(osc);
}

/** 정답 효과음 — 상승 아르페지오 (C5 → E5 → G5). */
export function playCorrect() {
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    playTone(freq, i * 0.09, 0.22, { type: 'triangle', volume: 0.16 });
  });
}

/** 오답 효과음 — 하강 톤. */
export function playWrong() {
  playTone(311, 0, 0.32, { type: 'sawtooth', volume: 0.1, endFreq: 165 });
}

/** 재생 중·예약된 모든 효과음 즉시 정지 (화면 전환 시 호출). */
export function stopAll() {
  activeNodes.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {
      /* 이미 정지됨 — 무시 */
    }
  });
  activeNodes.clear();
}
