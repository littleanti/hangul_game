/**
 * leaderboard.js — 리더보드 화면 렌더링 (PLAN M4 / TRD §8.3)
 *
 * `11ist_leaderboard`(LeaderboardEntry[]) 로드 →
 * - 사자성어 10개 × 최고 도달 레벨(Lv 뱃지) + 최고 정답률 표
 * - 최근 5건 세션 요약 카드 (날짜·정답률·최고 레벨)
 *
 * 모든 동적 텍스트는 textContent 로만 렌더 (TRD §12 — XSS 없음).
 */

import { IDIOMS } from '../data/idioms.js';
import * as storage from './storage.js';
import { el } from './ui.js';

/** 최근 세션 카드 표시 건수 */
const RECENT_SESSIONS = 5;

/**
 * 리더보드 화면 전체 렌더 (leaderboard-screen 진입 시 main.js 가 호출).
 */
export function render() {
  /** @type {Array<{date: string, correctRate: number, levelReached: number, idiomLevels: Object.<string, number>}>} */
  const board = storage.load('leaderboard', []);
  renderIdiomTable(board);
  renderSessionHistory(board);
}

/**
 * 사자성어별 최고 레벨·정답률 표 렌더.
 * 최고 레벨: 해당 어휘가 포함된 세션의 idiomLevels 최댓값.
 * 정답률: 해당 어휘가 포함된 세션들의 correctRate 최댓값 (세션 단위 기록).
 * @param {Array} board
 */
function renderIdiomTable(board) {
  const tbody = el('idiom-record-table').querySelector('tbody');
  tbody.textContent = '';

  IDIOMS.forEach((idiom) => {
    let bestLevel = 0;
    let bestRate = -1;
    board.forEach((entry) => {
      const lv = entry.idiomLevels && entry.idiomLevels[idiom.word];
      if (!lv) return;
      if (lv > bestLevel) bestLevel = lv;
      if (typeof entry.correctRate === 'number' && entry.correctRate > bestRate) {
        bestRate = entry.correctRate;
      }
    });

    const tr = document.createElement('tr');

    const tdWord = document.createElement('td');
    tdWord.textContent = idiom.word;
    tr.appendChild(tdWord);

    const tdLevel = document.createElement('td');
    tdLevel.appendChild(levelBadge(bestLevel));
    tr.appendChild(tdLevel);

    const tdRate = document.createElement('td');
    tdRate.textContent = bestRate >= 0 ? `${Math.round(bestRate * 100)}%` : '—';
    tr.appendChild(tdRate);

    tbody.appendChild(tr);
  });
}

/**
 * 최근 5건 세션 요약 카드 렌더. 기록 없으면 빈 안내 문구.
 * @param {Array} board
 */
function renderSessionHistory(board) {
  const wrap = el('session-history');
  wrap.textContent = '';

  if (!board.length) {
    const empty = document.createElement('p');
    empty.className = 'leaderboard-empty';
    empty.textContent = '아직 기록이 없어요';
    wrap.appendChild(empty);
    return;
  }

  board.slice(0, RECENT_SESSIONS).forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'session-card';

    const date = document.createElement('span');
    date.textContent = formatDate(entry.date);
    card.appendChild(date);

    const rate = document.createElement('span');
    rate.textContent = `정답률 ${Math.round((entry.correctRate || 0) * 100)}%`;
    card.appendChild(rate);

    card.appendChild(levelBadge(entry.levelReached));
    wrap.appendChild(card);
  });
}

/**
 * 레벨 뱃지 요소 생성. 기록 없음(0)은 '—' 회색 뱃지.
 * @param {number} level 0(없음) | 1 | 2 | 3
 * @returns {HTMLSpanElement}
 */
function levelBadge(level) {
  const badge = document.createElement('span');
  badge.className = 'level-badge';
  if (level >= 1 && level <= 3) {
    badge.classList.add(`lv${level}`);
    badge.textContent = `Lv.${level}`;
  } else {
    badge.textContent = '—';
  }
  return badge;
}

/**
 * ISO 날짜문자열 → "6. 12. 14:30" 형태 한국어 단축 표기.
 * @param {string} iso ISO 8601 문자열
 * @returns {string}
 */
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
