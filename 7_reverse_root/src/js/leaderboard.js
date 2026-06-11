// leaderboard.js — 리더보드 화면 렌더링·점수 조회 (M4 본 구현, TRD §9.3)

import * as storage from './storage.js';

/** Unix timestamp(ms) → 'M월 D일' */
function formatDate(playedAt) {
  const d = new Date(playedAt);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 별 시각화 — ★★☆ 형식 (색은 .lb-stars의 --yellow) */
function formatStars(stars) {
  const n = Math.max(0, Math.min(3, stars | 0));
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

/** '7rr:leaderboard' 상위 10개를 #leaderboard-list에 주입 */
export function renderLeaderboard() {
  const listEl = document.getElementById('leaderboard-list');
  const emptyEl = document.getElementById('leaderboard-empty');
  if (!listEl || !emptyEl) return;

  const scores = storage.get('leaderboard', []);
  listEl.textContent = '';

  if (!Array.isArray(scores) || scores.length === 0) {
    emptyEl.style.display = ''; // "아직 기록이 없어요" 안내
    return;
  }
  emptyEl.style.display = 'none';

  // 저장 시 내림차순 정렬·10개 유지(storage.saveScore)지만, 방어적으로 재정렬·재절단
  const top10 = [...scores]
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
    .slice(0, 10);

  top10.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = `lb-item${i === 0 ? ' best' : ''}`;

    const head = document.createElement('div');
    head.className = 'lb-item-head';

    const date = document.createElement('span');
    date.className = 'lb-date';
    date.textContent = `${i + 1}위 · ${formatDate(s?.playedAt)}`;

    const stars = document.createElement('span');
    stars.className = 'lb-stars';
    stars.setAttribute('aria-label', `별 ${s?.stars ?? 0}개`);
    stars.textContent = formatStars(s?.stars ?? 0);

    head.appendChild(date);
    if (i === 0) {
      const tag = document.createElement('span');
      tag.className = 'lb-best-tag';
      tag.textContent = '최고 기록';
      head.appendChild(tag);
    }
    head.appendChild(stars);

    const stats = document.createElement('div');
    stats.className = 'lb-stats';
    const chips = [
      `${s?.score ?? 0}점`,
      `정답 ${s?.correctCount ?? 0}/${s?.totalCount ?? 0}`,
      `힌트 ${s?.hintLevel ?? 1}단계`,
    ];
    for (const text of chips) {
      const chip = document.createElement('span');
      chip.className = 'lb-stat';
      chip.textContent = text;
      stats.appendChild(chip);
    }

    item.append(head, stats);
    listEl.appendChild(item);
  });
}
