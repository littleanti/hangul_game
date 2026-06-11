/**
 * 메인 진입점 (TRD §2.3)
 * - 모듈 공개 함수를 window에 노출 — HTML onclick에서 직접 호출 (이벤트 리스너 배선 없음)
 * - 초기화: 설정 로드 + 설정 UI 동기화 + 첫 인터랙션에서 오디오/TTS 활성화
 * - SW 등록은 index.html <head>의 인라인 스크립트가 담당 ('./sw.js' 상대 경로)
 */

import { goTo } from './ui.js';
import { loadSettings } from './storage.js';
import { unlock } from './tts.js';
import { resumeAudio } from './sound.js';
import {
  startGame,
  startGameWithDifficulty,
  speakSentence,
  toggleReview,
} from './game.js';
import {
  openSettings,
  renderSettings,
  toggleSetting,
  selectDifficulty,
  selectCount,
  setPlayerName,
} from './settings.js';
import { openLeaderboard, setLeaderboardSort } from './leaderboard.js';
import { onHintButton } from './hint.js';

// HTML onclick 속성에서 호출할 수 있게 전역으로 노출 (TRD §2.3)
window.goTo = goTo;
window.startGame = startGame;
window.startGameWithDifficulty = startGameWithDifficulty;
window.speakSentence = speakSentence;
window.toggleReview = toggleReview;
window.openSettings = openSettings;
window.openLeaderboard = openLeaderboard;
window.toggleSetting = toggleSetting;
window.selectDifficulty = selectDifficulty;
window.selectCount = selectCount;
window.setPlayerName = setPlayerName;
window.setLeaderboardSort = setLeaderboardSort;
window.onHintButton = onHintButton;

// 초기화 — 설정 로드(localStorage) 후 설정 화면 UI 동기화
loadSettings();
renderSettings();

// 자동재생 정책 대응 — 첫 사용자 인터랙션에서 오디오/TTS 활성화
document.addEventListener('pointerdown', () => {
  resumeAudio();
  unlock();
}, { once: true });
