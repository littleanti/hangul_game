// main.js — 진입점 (TRD §2.2)
// 모듈 임포트 + index.html onclick용 window 전역 노출 + 사용자 제스처 오디오 게이트.
// SW 등록은 M4에서 추가.

import * as ui from './ui.js';
import * as tts from './tts.js';
import * as audio from './audio.js';
import * as settings from './settings.js';
import * as leaderboard from './leaderboard.js';
import * as game from './game.js';

// ----- 사용자 제스처 게이트 (TRD §2.3) -----
// start 화면 첫 탭에서 SpeechSynthesis + AudioContext unlock
function unlockOnce() {
  tts.unlock();
  audio.unlock();
}
document.addEventListener('pointerdown', unlockOnce, { once: true });

// ----- index.html onclick 핸들러 노출 -----
window.goTo = (name) => ui.goTo(name);

window.startGame = () => {
  ui.goTo('play');
  game.startSession();
};

window.openSettings = () => {
  ui.goTo('settings');
};

window.openLeaderboard = () => {
  leaderboard.renderLeaderboard();
  ui.goTo('leaderboard');
};

window.toggleSetting = (key, el) => settings.toggleSetting(key, el);

window.saveSettings = () => {
  settings.save();
  ui.goTo('start');
};

// 진행 초기화 — 인페이지 확인 단계 (M4, 브라우저 confirm 모달 금지)
window.resetProgress = () => settings.requestReset();
window.confirmResetProgress = () => settings.confirmReset();
window.cancelResetProgress = () => settings.cancelReset();

window.endSession = () => game.endSession();

// "다음 단계" — 8_vocabulary_tree 상대경로 (M3에서 졸업 기준 연동)
window.goNextStage = () => {
  window.location.href = '../8_vocabulary_tree/';
};

// ----- 초기화 -----
settings.init();
settings.initInstallPrompt(); // beforeinstallprompt 저장 (M4)
game.loadProgress();          // '7rr:progress' 복원 (M4)
ui.goTo('start');
