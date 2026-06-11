/**
 * 리더보드 화면 렌더링 (TRD §8.1)
 * M0: 빈 상태 표시만. M4에서 상위 10개 렌더링·정렬 옵션 완성.
 */

import { loadLeaderboard } from './storage.js';
import { goTo } from './ui.js';

let sortMode = 'score'; // 'score' | 'date'

/** 리더보드 화면 진입 */
export function openLeaderboard() {
  renderLeaderboard();
  goTo('leaderboard-screen');
}

/** 상위 10개 기록 렌더링 — 각 행은 .lb-item(.profile-item 패턴) (M4) */
export function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const empty = document.getElementById('leaderboard-empty');
  if (!list || !empty) return;

  const records = loadLeaderboard();
  list.innerHTML = '';
  empty.style.display = records.length === 0 ? '' : 'none';

  // TODO(M4): sortMode 정렬 → 상위 10개 .lb-item 렌더링 (textContent — XSS 안전)
}

/** 정렬 옵션 토글 — 점수순 / 날짜순 (M4) */
export function setLeaderboardSort(mode) {
  sortMode = mode;
  document.querySelectorAll('#lb-sort-chips .chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.sort === mode);
  });
  renderLeaderboard();
}
