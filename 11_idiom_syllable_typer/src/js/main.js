/**
 * main.js — 진입점 / 부트스트랩 (PLAN M3)
 *
 * - settings.js 초기화: 11ist_settings 로드 → DOM 반영, TTS 미지원 처리
 * - 화면 전환 이벤트 바인딩 (data-goto 위임) — game 진입 시 startSession()
 * - 시작 레벨 칩 → settings.selectLevel() (레벨 선택만 — 시작은 "시작하기" 버튼)
 * - 설정 토글 → settings.toggleSetting()
 */

import * as ui from './ui.js';
import * as settings from './settings.js';
import * as game from './game.js';
import * as end from './end.js';
import * as leaderboard from './leaderboard.js';

/* ── 이벤트 위임 ────────────────────────────────── */

function bindEvents() {
  document.addEventListener('click', (e) => {
    /* 화면 전환 (data-goto) */
    const gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn) {
      const target = gotoBtn.dataset.goto;
      /* 게임 이탈 시 진행 타이머 정리 — 숨겨진 화면 렌더·TTS 발화 방지 (M5 QA) */
      game.stop();
      ui.showScreen(target);
      if (target === 'game-screen') game.startSession();
      if (target === 'leaderboard-screen') leaderboard.render();
      return;
    }

    /* 시작 레벨 칩 — 탭 시 레벨 선택만 (게임 시작은 "시작하기" 버튼) */
    const chip = e.target.closest('#level-chips .chip');
    if (chip) {
      settings.selectLevel(chip.dataset.level);
      return;
    }

    /* 설정 토글 (TTS·효과음·자동페이딩·레벨 고정) */
    const toggle = e.target.closest('.toggle');
    if (toggle) settings.toggleSetting(toggle);
  });
}

/* ── 부트스트랩 ─────────────────────────────────── */

settings.init();
bindEvents();

game.init({
  onSessionEnd: () => {
    ui.showScreen('end-screen');
    end.render();
  },
});

/* 디버그 편의 전역 노출 */
window.showScreen = ui.showScreen;
