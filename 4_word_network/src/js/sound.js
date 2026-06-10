let ctx = null;

function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { ctx = new AC(); } catch (e) { return null; }
  return ctx;
}

function tone(freq, start, dur, type = 'sine', peak = 0.18) {
  const c = getCtx();
  if (!c) return;
  const schedule = () => {
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
  };
  if (c.state === 'suspended') { c.resume().then(schedule); } else { schedule(); }
}

export function initAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

export function playCorrect() {
  tone(523.25, 0.00, 0.14, 'triangle');
  tone(659.25, 0.12, 0.14, 'triangle');
  tone(783.99, 0.24, 0.22, 'triangle');
}

export function playIncorrect() {
  tone(196.00, 0.00, 0.16, 'sawtooth', 0.12);
  tone(146.83, 0.14, 0.28, 'sawtooth', 0.12);
}
