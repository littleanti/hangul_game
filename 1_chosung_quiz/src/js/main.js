/**
 * 메인 진입점
 * - 모든 모듈을 가져와서 window에 노출 (HTML onclick 핸들러에서 호출할 수 있게)
 * - 초기화 수행
 */

import { initProfiles } from './profiles.js';
import { loadSettings } from './storage.js';
import { renderSettings, openSettings, toggleSetting, resetSettings, startFromSettings, startWithLevel } from './settings.js';
import { startGame, revealAnswer, markAnswer, speakCurrent, toggleReview, quitGame, useHint } from './game.js';
import { goTo } from './ui.js';
import {
  renderProfileChip, openProfileModal, closeProfileModal, closeProfileModalBg,
  showCreateProfileForm, cancelCreateProfile, confirmCreateProfile,
} from './profile-ui.js';

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
window.openProfileModal       = openProfileModal;
window.closeProfileModal      = closeProfileModal;
window.closeProfileModalBg    = closeProfileModalBg;
window.showCreateProfileForm  = showCreateProfileForm;
window.cancelCreateProfile    = cancelCreateProfile;
window.confirmCreateProfile   = confirmCreateProfile;

// 초기화 — 프로필 먼저, 그 다음 설정 로드/렌더
initProfiles();
loadSettings();
renderSettings();
renderProfileChip();
