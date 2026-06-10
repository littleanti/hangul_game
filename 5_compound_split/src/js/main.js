/**
 * 메인 진입점 (TRD §2.2)
 * - 모듈 공개 함수를 window에 노출 — HTML onclick에서 직접 호출 (이벤트 리스너 배선 없음)
 * - 초기화: 설정 로드 + 시작 화면 칩 동기화 + 첫 인터랙션에서 오디오/TTS 활성화
 * - SW 등록: './sw.js' 상대 경로 — 타 게임과 스코프 분리 (TRD §7.3)
 */

import { goTo } from './ui.js';
import { loadSettings } from './storage.js';
import { unlock } from './tts.js';
import { resumeAudio } from './sound.js';
import { startGame, closeSplitPopup, speakPiece } from './game.js';
import {
  openSettings,
  renderSettings,
  toggleSetting,
  selectCount,
  selectFadingLevel,
} from './settings.js';
import { openLeaderboard } from './leaderboard.js';

// HTML onclick 속성에서 호출할 수 있게 전역으로 노출 (TRD §2.2)
window.goTo = goTo;
window.startGame = startGame;
window.closeSplitPopup = closeSplitPopup;
window.speakPiece = speakPiece;
window.openSettings = openSettings;
window.openLeaderboard = openLeaderboard;
window.toggleSetting = toggleSetting;
window.selectCount = selectCount;
window.selectFadingLevel = selectFadingLevel;

// 초기화 — 설정 로드(localStorage) 후 설정·시작 화면 UI 동기화
loadSettings();
renderSettings();

// 자동재생 정책 대응 — 첫 사용자 인터랙션에서 오디오/TTS 활성화
document.addEventListener('pointerdown', () => {
  resumeAudio();
  unlock();
}, { once: true });

// SW 등록 — 상대경로 './sw.js' (scope가 현재 디렉터리로 제한, TRD §7.3)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
