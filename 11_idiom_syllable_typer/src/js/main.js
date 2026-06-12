/**
 * main.js — M0 스텁: 화면 전환만 처리한다.
 * M2 에서 게임 부트스트랩(모듈 연결·이벤트 바인딩)으로 대체된다.
 *
 * 컨벤션 (1_chosung_quiz 동일): section.screen 표시/숨김은
 * .screen.active 클래스 토글로 처리한다.
 */

const SCREEN_IDS = [
  'start-screen',
  'settings-screen',
  'leaderboard-screen',
  'end-screen',
  'game-screen',
];

/** 지정한 화면만 .active 로 표시 */
function showScreen(id) {
  if (!SCREEN_IDS.includes(id)) return;
  SCREEN_IDS.forEach((sid) => {
    const el = document.getElementById(sid);
    if (el) el.classList.toggle('active', sid === id);
  });
}

/* 화면 전환: data-goto="<screen-id>" 버튼 위임 처리 */
document.addEventListener('click', (e) => {
  const gotoBtn = e.target.closest('[data-goto]');
  if (gotoBtn) {
    showScreen(gotoBtn.dataset.goto);
    return;
  }

  // 설정 토글 스텁 (시각 효과만 — 실제 설정 저장은 M3 settings.js)
  const toggle = e.target.closest('.toggle');
  if (toggle && !toggle.classList.contains('disabled')) {
    const on = toggle.classList.toggle('on');
    toggle.setAttribute('aria-checked', String(on));
    return;
  }

  // 시작 레벨 칩 스텁 (단일 선택 시각 효과만 — 실제 레벨 적용은 M3)
  const chip = e.target.closest('#level-chips .chip');
  if (chip) {
    chip.parentElement
      .querySelectorAll('.chip')
      .forEach((c) => c.classList.toggle('active', c === chip));
  }
});

// 디버그 편의를 위해 전역 노출 (M2 에서 정식 ui.js 로 이전)
window.showScreen = showScreen;
