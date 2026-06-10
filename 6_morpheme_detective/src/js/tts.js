// Web Speech API 래퍼 — TRD §3.6
// iOS Safari: 첫 사용자 제스처에서 빈 utterance 한 번 호출해 unlock.
import { state } from './state.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function isAvailable() {
  return !!synth;
}

export function unlock() {
  if (!synth || state.settings.speechReady) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    synth.speak(u);
    state.settings.speechReady = true;
  } catch (e) {
    console.warn('[tts] unlock 실패:', e);
  }
}

export function cancel() {
  if (synth) synth.cancel();
}

// 한자 발견 시: speakHanja({ reading:'차', meaning:'수레' }) → "차, 수레 차"
export function speakHanja({ reading, meaning }) {
  if (!reading) return;
  const text = meaning ? `${reading}, ${meaning} ${reading}` : reading;
  speak(text);
}

export function speak(text, { lang = 'ko-KR', rate = 0.95 } = {}) {
  if (!synth || !text) return;
  if (state.settings.ttsEnabled === false) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    synth.speak(u);
  } catch (e) {
    console.warn('[tts] speak 실패:', e);
  }
}
