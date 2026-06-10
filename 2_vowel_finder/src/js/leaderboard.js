/**
 * 리더보드 — 'vowel_finder_scores' 최근 5세션 렌더링 (TRD §8.2)
 * 표시: L0·L1 정답률 폭 비례 막대, 별점(--yellow), 날짜·소요시간,
 *       최고 기록(L0+L1 합산 정답률 최대 세션) 하이라이트.
 * 순수 DOM 생성 — 동적 텍스트는 모두 textContent (TRD §11).
 */

import { loadScores } from './storage.js';
import { goTo } from './ui.js';

// 화면에 표시할 최근 세션 수 (TRD §8.2)
const DISPLAY_MAX = 5;

/** 리더보드 화면 진입 — 렌더링 후 화면 전환 (HTML onclick에서 호출) */
export function openLeaderboard() {
  renderLeaderboard();
  goTo('leaderboard-screen');
}

/** 'vowel_finder_scores'를 읽어 최근 5세션 카드 DOM 생성 */
export function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const empty = document.getElementById('leaderboard-empty');
  if (!list || !empty) return;

  list.innerHTML = '';

  // loadScores()는 오래된 순 — 최근 5건을 최신순으로 표시
  const recent = loadScores().slice(-DISPLAY_MAX).reverse();
  const hasRecords = recent.length > 0;
  list.style.display = hasRecords ? '' : 'none';
  empty.style.display = hasRecords ? 'none' : '';
  if (!hasRecords) return;

  // 최고 기록 = 표시 세션 중 L0+L1 합산 정답률 최대 (TRD §8.2)
  const bestIdx = recent.reduce(
    (best, r, i) => sumAcc(r) > sumAcc(recent[best]) ? i : best, 0
  );

  recent.forEach((record, i) => {
    list.appendChild(buildItem(record, i === bestIdx));
  });
}

function sumAcc(r) {
  return (r.l0Accuracy || 0) + (r.l1Accuracy || 0);
}

/** 세션 카드 1장 — 헤더(날짜·별점·소요시간) + 막대 2줄 */
function buildItem(record, isBest) {
  const item = document.createElement('div');
  item.className = isBest ? 'lb-item best' : 'lb-item';

  // 헤더 행
  const head = document.createElement('div');
  head.className = 'lb-item-head';
  head.appendChild(span('lb-date', formatDate(record.ts)));
  if (isBest) head.appendChild(span('lb-best-tag', '최고 기록'));
  const stars = span('lb-stars', '★'.repeat(record.stars || 1) + '☆'.repeat(3 - (record.stars || 1)));
  stars.setAttribute('aria-label', `별 3개 중 ${record.stars || 1}개`);
  head.appendChild(stars);
  head.appendChild(span('lb-duration', formatDuration(record.durationMs)));
  item.appendChild(head);

  // 정답률 막대 — CSS width 폭 비례 (외부 차트 라이브러리 없음)
  item.appendChild(buildBarRow('소리 찾기', record.l0Accuracy || 0, 'l0'));
  item.appendChild(buildBarRow('모양 나누기', record.l1Accuracy || 0, 'l1'));
  return item;
}

/** 막대 1줄 — 레이블 + 트랙(채움 폭 = 정답률%) + 수치 */
function buildBarRow(label, accuracy, levelClass) {
  const pct = Math.round(accuracy * 100);
  const row = document.createElement('div');
  row.className = 'lb-bar-row';
  row.appendChild(span('lb-bar-label', label));

  const track = document.createElement('div');
  track.className = 'lb-bar-track';
  const fill = document.createElement('div');
  fill.className = `lb-bar-fill ${levelClass}`;
  fill.style.width = `${pct}%`;
  track.appendChild(fill);
  row.appendChild(track);

  row.appendChild(span('lb-bar-value', `${pct}%`));
  return row;
}

function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

/** Date.now() 타임스탬프 → 'M월 D일' */
function formatDate(ts) {
  const d = new Date(ts || 0);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 소요 ms → 'M분 S초' (1분 미만은 'S초') */
function formatDuration(ms) {
  const totalSec = Math.max(0, Math.round((ms || 0) / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}분 ${sec}초` : `${sec}초`;
}
