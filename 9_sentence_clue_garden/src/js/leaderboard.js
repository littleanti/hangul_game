/**
 * 리더보드 화면 렌더링 (TRD §8.1, PLAN M4)
 * - 상위 10개 렌더링 — 각 행은 .lb-item (.profile-item 패턴: white 배경, navy 테두리, 3px 하단 그림자)
 * - 정렬 토글: 점수순(점수→정답률→최신) / 날짜순(최신 우선)
 * - 기록 없으면 빈 상태 메시지 표시
 * - 순수 DOM 생성 — 동적 텍스트는 모두 textContent (XSS 안전, TRD §11)
 */

import { loadLeaderboard } from './storage.js';
import { goTo } from './ui.js';

const TOP_N = 10;

const DIFFICULTY_LABELS = {
  easy: '🌱 쉬움',
  medium: '🌿 보통',
  hard: '🌸 어려움',
  all: '🌼 전체',
};

let sortMode = 'score'; // 'score' | 'date'

/** 리더보드 화면 진입 (홈·완료 화면 onclick에서 호출) */
export function openLeaderboard() {
  renderLeaderboard();
  goTo('leaderboard-screen');
}

/** 상위 10개 기록 렌더링 */
export function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const empty = document.getElementById('leaderboard-empty');
  if (!list || !empty) return;

  list.innerHTML = '';

  const records = loadLeaderboard();
  const hasRecords = records.length > 0;
  list.style.display = hasRecords ? '' : 'none';
  empty.style.display = hasRecords ? 'none' : '';
  if (!hasRecords) return;

  sortRecords(records, sortMode)
    .slice(0, TOP_N)
    .forEach((record, idx) => list.appendChild(buildItem(record, idx)));
}

/** 정렬 옵션 토글 — 점수순 / 날짜순 (HTML onclick에서 호출) */
export function setLeaderboardSort(mode) {
  sortMode = mode === 'date' ? 'date' : 'score';
  document.querySelectorAll('#lb-sort-chips .chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.sort === sortMode);
  });
  renderLeaderboard();
}

/** 원본 불변 정렬 — score: 점수→정답률→최신 / date: 최신 우선 */
function sortRecords(records, mode) {
  const list = [...records];
  if (mode === 'date') {
    list.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } else {
    list.sort((a, b) =>
      (b.score || 0) - (a.score || 0) ||
      (b.accuracy || 0) - (a.accuracy || 0) ||
      (b.ts || 0) - (a.ts || 0));
  }
  return list;
}

/** 기록 1행 — 순위 + 이름 + 점수·정답률·난이도 배지 + 날짜 */
function buildItem(record, idx) {
  const item = document.createElement('div');
  item.className = 'lb-item';
  if (sortMode === 'score' && idx === 0) item.classList.add('best');

  const rank = document.createElement('span');
  rank.className = 'lb-rank';
  rank.textContent = sortMode === 'score' && idx === 0 ? '🏆' : `${idx + 1}위`;
  item.appendChild(rank);

  const main = document.createElement('div');
  main.style.flex = '1';
  main.style.minWidth = '0';

  const nameRow = document.createElement('div');
  nameRow.style.display = 'flex';
  nameRow.style.alignItems = 'baseline';
  nameRow.style.gap = '8px';
  nameRow.appendChild(span('lb-name', record.name || '익명'));
  nameRow.appendChild(span('lb-date', formatDate(record.ts)));
  main.appendChild(nameRow);

  const stats = document.createElement('div');
  stats.style.display = 'flex';
  stats.style.flexWrap = 'wrap';
  stats.style.gap = '6px';
  stats.style.marginTop = '4px';
  stats.appendChild(span('lb-stat', `⭐ ${record.score || 0}/${record.total || 0}`));
  stats.appendChild(span('lb-stat', `🎯 ${Math.round((record.accuracy || 0) * 100)}%`));
  stats.appendChild(span('lb-stat', DIFFICULTY_LABELS[record.difficulty] || DIFFICULTY_LABELS.all));
  main.appendChild(stats);

  item.appendChild(main);
  return item;
}

function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

/** Unix ms → 'M월 D일 HH:MM' */
function formatDate(ts) {
  const d = new Date(ts || 0);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}:${mm}`;
}
