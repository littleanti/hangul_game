// leaderboard.js — 리더보드 화면 렌더링·점수 조회 (M0 스텁 → M4 본 구현, TRD §9.3)

import * as storage from './storage.js';

/** '7rr:leaderboard' 상위 10개를 #leaderboard-list에 주입 (M4 본 구현) */
export function renderLeaderboard() {
  const listEl = document.getElementById('leaderboard-list');
  const emptyEl = document.getElementById('leaderboard-empty');
  if (!listEl || !emptyEl) return;

  const scores = storage.get('leaderboard', []);
  listEl.textContent = '';

  if (!Array.isArray(scores) || scores.length === 0) {
    emptyEl.style.display = '';
    return;
  }
  emptyEl.style.display = 'none';
  // M4: 점수 행 DOM 구성 (날짜 'M월 D일', 별 ★★☆ 시각화)
}
