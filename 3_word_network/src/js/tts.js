let _koVoice = null;
let _ttsReady = false;

export let TTS_AVAILABLE = 'speechSynthesis' in window;

function loadVoice() {
  const voices = speechSynthesis.getVoices();
  _koVoice = voices.find(v => v.lang.startsWith('ko')) ?? null;
  if (_koVoice || voices.length) _ttsReady = true;
}

if (TTS_AVAILABLE) {
  loadVoice();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoice;
  }
}

export function speak(text, btnEl) {
  if (!TTS_AVAILABLE) return;
  import('./state.js').then(({ getState }) => {
    if (!getState().settings.ttsEnabled) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ko-KR';
    utt.rate = 0.85;
    utt.pitch = 1.05;
    if (_koVoice) utt.voice = _koVoice;
    if (btnEl) {
      utt.onstart = () => btnEl.classList.add('speaking');
      utt.onend = () => btnEl.classList.remove('speaking');
    }
    speechSynthesis.speak(utt);
  });
}

export function speakSequence(texts) {
  if (!TTS_AVAILABLE) return;
  import('./state.js').then(({ getState }) => {
    if (!getState().settings.ttsEnabled) return;
    speechSynthesis.cancel();
    const sayAt = (i) => {
      if (i >= texts.length) return;
      const utt = new SpeechSynthesisUtterance(texts[i]);
      utt.lang = 'ko-KR';
      utt.rate = 0.85;
      utt.pitch = 1.05;
      if (_koVoice) utt.voice = _koVoice;
      utt.onend = () => sayAt(i + 1);
      speechSynthesis.speak(utt);
    };
    sayAt(0);
  });
}

export function speakThen(text, callback) {
  if (!TTS_AVAILABLE) { if (callback) callback(); return; }
  import('./state.js').then(({ getState }) => {
    if (!getState().settings.ttsEnabled) { if (callback) callback(); return; }
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ko-KR';
    utt.rate = 0.85;
    utt.pitch = 1.05;
    if (_koVoice) utt.voice = _koVoice;

    let fired = false;
    let timerId = null;
    const fire = () => {
      if (fired) return;
      fired = true;
      if (timerId) { clearTimeout(timerId); timerId = null; }
      callback?.();
    };
    utt.onend = fire;
    utt.onerror = fire;
    // 발화가 실제로 시작되면 fallback을 글자 길이에 맞춰 연장 (모바일 onend 미발화 대응)
    utt.onstart = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(fire, text.length * 500 + 400);
    };
    // 초기 안전망: 모바일 Chrome cancel→speak race condition으로 발화 시작 자체가
    // 안 되는 경우 대비. 글자당 ~400ms + 200ms 여유 (이전 100ms는 모바일에서 너무 짧아
    // onstart 전에 fire 발동 → 음절 TTS 누락 발생)
    timerId = setTimeout(fire, text.length * 400 + 200);

    // 모바일 Chrome: cancel() 직후 speak() 호출이 무시되는 race condition 회피
    setTimeout(() => speechSynthesis.speak(utt), 30);
  });
}

export function cancelSpeech() {
  if (TTS_AVAILABLE) speechSynthesis.cancel();
}
