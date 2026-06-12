/**
 * 메인 진입점 (TRD §2.5)
 * - 모듈 함수를 window에 노출 — HTML onclick/onpointerdown에서 직접 호출
 * - 초기화: 설정 로드 + 설정 UI 동기화 + 첫 pointerdown에서 AudioContext resume / TTS unlock
 */

import { state, resetGame, startSession } from './state.js';
import { loadSettings } from './storage.js';
import { goTo } from './ui.js';
import { unlock } from './tts.js';
import { resumeAudio } from './sound.js';
import { initLevel0, tapChoice, speakCurrentL0 } from './level0.js';
import { tapBucket, speakCurrentL1 } from './level1.js';
import { toggleSetting, selectCount, selectL1Count, syncSettingsUI } from './settings.js';
import { openLeaderboard } from './leaderboard.js';

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

// HTML onclick/onpointerdown에서 호출할 수 있게 전역으로 노출 (TRD §2.5)
window.goTo          = goTo;
window.startGame     = startGame;
window.tapChoice     = tapChoice;
window.tapBucket     = tapBucket;
window.speakVowel    = speakVowel;
window.toggleSetting = toggleSetting;
window.selectCount   = selectCount;
window.selectL1Count = selectL1Count;
window.openLeaderboard = openLeaderboard;

// 초기화 — 설정 로드(localStorage) 후 설정 화면 UI 동기화 (settings.js, M3)
loadSettings();
syncSettingsUI();

// 자동재생 정책 대응 — 첫 사용자 인터랙션에서 오디오/TTS 활성화 (TRD §7.4)
document.addEventListener('pointerdown', () => {
  resumeAudio();
  unlock();
}, { once: true });
