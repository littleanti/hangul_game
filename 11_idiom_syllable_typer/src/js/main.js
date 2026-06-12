/**
 * main.js — 진입점 / 부트스트랩 (PLAN M3)
 *
 * - settings.js 초기화: 11ist_settings 로드 → DOM 반영, TTS 미지원 처리
 * - 화면 전환 이벤트 바인딩 (data-goto 위임) — game 진입 시 startSession()
 * - 시작 레벨 칩 → settings.startWithLevel() (해당 레벨로 즉시 시작)
 * - 설정 토글 → settings.toggleSetting()
 */

import * as ui from './ui.js';
import * as settings from './settings.js';
import * as game from './game.js';
import * as end from './end.js';
import * as leaderboard from './leaderboard.js';

/** 레벨 칩 탭 즉시 시작 경로 (settings.js 에 콜백 주입 — 순환 import 회피) */
function startGame() {
  ui.showScreen('game-screen');
  game.startSession();
}

/* ── 이벤트 위임 ────────────────────────────────── */

function bindEvents() {
  document.addEventListener('click', (e) => {
    /* 화면 전환 (data-goto) */
    const gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn) {
      const target = gotoBtn.dataset.goto;
      ui.showScreen(target);
      if (target === 'game-screen') game.startSession();
      if (target === 'leaderboard-screen') leaderboard.render();
      return;
    }

    /* 시작 레벨 칩 — 탭 시 해당 레벨로 즉시 시작 (PLAN M3) */
    const chip = e.target.closest('#level-chips .chip');
    if (chip) {
      settings.startWithLevel(chip.dataset.level);
      return;
    }

    /* 설정 토글 (TTS·효과음·자동페이딩·레벨 고정) */
    const toggle = e.target.closest('.toggle');
    if (toggle) settings.toggleSetting(toggle);
  });
}

/* ── 부트스트랩 ─────────────────────────────────── */

settings.init({ onStartGame: startGame });
bindEvents();

game.init({
  onSessionEnd: () => {
    ui.showScreen('end-screen');
    end.render();
  },
});

/* 디버그 편의 전역 노출 */
window.showScreen = ui.showScreen;
