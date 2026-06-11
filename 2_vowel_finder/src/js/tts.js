/**
 * TTS — Web Speech API 래퍼 (TRD §2.3)
 * - 한국어 음성 품질 우선순위 선택 (Google > Natural/Neural/Online > ko-KR > ko*), voiceschanged 비동기 대기
 * - unlock(): 첫 사용자 인터랙션에서 호출 — iOS 등 자동재생 정책 해제
 * - 미지원 브라우저 graceful fallback: speak()는 조용히 no-op
 */

import { state } from './state.js';

export const TTS_AVAILABLE =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

let koVoice = null;

/**
 * 한국어 음성 품질 스코어 (높을수록 우선) — TRD §2.3
 * 배경: Windows 구형 SAPI 음성(Microsoft Heami)이 목록 앞에 와서
 * 단음절 발화("아" 등)에 아티팩트가 생김 → 고품질 음성 우선 선택.
 *   4: 이름에 "Google" 포함 ko* (예: "Google 한국의")
 *   3: 이름에 "Natural"/"Neural"/"Online" 포함 ko* (신형 고품질)
 *   2: lang === 'ko-KR' 기타 (예: Microsoft Heami — 기존 fallback)
 *   1: lang이 'ko'로 시작하는 기타
 *   0: 한국어 아님 (선택 제외)
 */
function scoreVoice(v) {
  if (!v.lang || !v.lang.startsWith('ko')) return 0;
  const name = v.name || '';
  if (name.includes('Google')) return 4;
  if (/Natural|Neural|Online/i.test(name)) return 3;
  if (v.lang === 'ko-KR') return 2;
  return 1;
}

function loadVoices() {
  if (!TTS_AVAILABLE) return;
  const voices = speechSynthesis.getVoices();
  let best = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  koVoice = best; // 없으면 null — utterance lang=ko-KR만으로 동작
}

// 음성 리스트는 비동기 로드 — voiceschanged 대기 (TRD §10)
if (TTS_AVAILABLE) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

let unlocked = false;

/**
 * 첫 pointerdown에서 호출 — 무음 발화로 speechSynthesis 활성화 + 음성 목록 재시도
 */
export function unlock() {
  if (!TTS_AVAILABLE || unlocked) return;
  unlocked = true;
  try {
    loadVoices();
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 */
  }
}

/**
 * 텍스트 발음 재생 (설정 ttsEnabled 존중)
 * @param {string} text - 읽을 텍스트
 */
export function speak(text) {
  if (!TTS_AVAILABLE || !state.settings.ttsEnabled) return;
  try {
    speechSynthesis.cancel(); // 이전 발음 중단
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.85;
    u.pitch = 1.05;
    if (koVoice) u.voice = koVoice;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 무시 — graceful fallback */
  }
}

/** 모음 객체 발음 재생 */
export function speakVowel(vowel) {
  if (vowel) speak(vowel.sound);
}

export function cancelSpeech() {
  if (TTS_AVAILABLE) {
    try { speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
  }
}
