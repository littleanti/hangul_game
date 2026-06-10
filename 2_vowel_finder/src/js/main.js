/**
 * 메인 진입점 (TRD §2.5)
 * - 모듈 함수를 window에 노출 — HTML onclick/onpointerdown에서 직접 호출
 * - 초기화: 설정 로드 + 설정 UI 동기화 + 첫 pointerdown에서 AudioContext resume / TTS unlock
 */

import { state, resetGame, startSession } from './state.js';
import { loadSettings, saveSettings } from './storage.js';
import { goTo } from './ui.js';
import { unlock, TTS_AVAILABLE } from './tts.js';
import { resumeAudio } from './sound.js';
import { initLevel0, tapChoice, speakCurrentL0 } from './level0.js';
import { tapBucket, speakCurrentL1 } from './level1.js';

/** 시작하기 — 화면 상태 머신: start → level0 → level1 → drag-onboarding → end */
function startGame() {
  resetGame();
  startSession();
  initLevel0();
}

/** 현재 문항 모음 다시 듣기 — 게임 화면 TTS 버튼 (phase별 분기) */
function speakVowel() {
  if (state.game.phase === 'level0') speakCurrentL0();
  else if (state.game.phase === 'level1') speakCurrentL1();
}

/** 설정 토글 (TTS·효과음) — 즉시 저장. M3에서 settings.js로 분리 예정 */
function toggleSetting(key, el) {
  state.settings[key] = !state.settings[key];
  el.classList.toggle('on', state.settings[key]);
  saveSettings();
}

/** 난이도 칩 (모음 수 5/10) — 즉시 저장 */
function selectCount(count, el) {
  state.settings.vowelCount = count;
  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === count);
  });
  saveSettings();
}

/** Stage 2(음절 조립소) 연결 — 배포 경로 확정 후 실제 URL 연결 (현재 no-op) */
function goToNextStage() {}

// HTML onclick/onpointerdown에서 호출할 수 있게 전역으로 노출 (TRD §2.5)
window.goTo          = goTo;
window.startGame     = startGame;
window.tapChoice     = tapChoice;
window.tapBucket     = tapBucket;
window.speakVowel    = speakVowel;
window.toggleSetting = toggleSetting;
window.selectCount   = selectCount;
window.goToNextStage = goToNextStage;

/** 저장된 설정값을 설정 화면 UI에 반영 */
function syncSettingsUI() {
  const ttsToggle = document.getElementById('toggle-tts');
  const sfxToggle = document.getElementById('toggle-sfx');
  if (ttsToggle) ttsToggle.classList.toggle('on', state.settings.ttsEnabled);
  if (sfxToggle) sfxToggle.classList.toggle('on', state.settings.sfxEnabled);
  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === state.settings.vowelCount);
  });

  // TTS 미지원 브라우저 — 토글 자동 비활성화 (graceful degradation, PRD §9.3)
  if (!TTS_AVAILABLE && ttsToggle) {
    state.settings.ttsEnabled = false;
    ttsToggle.classList.remove('on');
    ttsToggle.style.opacity = '0.4';
    ttsToggle.style.pointerEvents = 'none';
    const hint = document.getElementById('tts-hint');
    if (hint) hint.textContent = '이 기기에서는 소리 읽기를 지원하지 않아요';
  }
}

// 초기화
loadSettings();
syncSettingsUI();

// 자동재생 정책 대응 — 첫 사용자 인터랙션에서 오디오/TTS 활성화 (TRD §7.4)
document.addEventListener('pointerdown', () => {
  resumeAudio();
  unlock();
}, { once: true });
