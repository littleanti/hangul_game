/**
 * 메인 진입점
 * - 모든 모듈을 가져와서 window에 노출 (HTML onclick 핸들러에서 호출할 수 있게)
 * - 초기화 수행
 */

import { loadSettings } from './storage.js';
import { renderSettings, openSettings, toggleSetting, resetSettings, startFromSettings, startWithLevel } from './settings.js';
import { startGame, revealAnswer, markAnswer, speakCurrent, toggleReview, quitGame, useHint } from './game.js';
import { goTo } from './ui.js';

// HTML의 onclick="..."에서 호출할 수 있게 전역으로 노출
window.goTo                   = goTo;
window.openSettings           = openSettings;
window.startGame              = startGame;
window.startFromSettings      = startFromSettings;
window.startWithLevel         = startWithLevel;
window.revealAnswer           = revealAnswer;
window.markAnswer             = markAnswer;
window.speakCurrent           = speakCurrent;
window.toggleReview           = toggleReview;
window.toggleSetting          = toggleSetting;
window.resetSettings          = resetSettings;
window.quitGame               = quitGame;
window.useHint                = useHint;

// 초기화 — 설정 로드 후 렌더
loadSettings();
renderSettings();
