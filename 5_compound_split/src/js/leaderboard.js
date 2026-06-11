/**
 * 리더보드 화면 렌더링 (TRD §9.1)
 * 표시: 날짜·모드·문항 수·정답 수·오류 수 / 최신순 / 빈 상태 메시지.
 * 과거 기록의 fadingLevel 1·2는 '연습하기', 3은 '도전하기'로 레이블 매핑 (데이터는 불변).
 * 순수 DOM 생성 — 동적 텍스트는 모두 textContent (TRD §11).
 */

import { LEADERBOARD_KEY, FADING_LEVEL_LABELS } from './config.js';
import { loadData } from './storage.js';
import { goTo } from './ui.js';

/** 리더보드 화면 진입 — 렌더링 후 화면 전환 (HTML onclick에서 호출) */
export function openLeaderboard() {
  renderLeaderboard();
  goTo('leaderboard-screen');
}

/** 'compound_split_leaderboard'를 읽어 기록 목록 DOM 생성 */
export function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const empty = document.getElementById('leaderboard-empty');
  if (!list || !empty) return;

  list.innerHTML = '';

  const records = loadData(LEADERBOARD_KEY, []);
  const recent = Array.isArray(records) ? [...records].reverse() : []; // 최신 기록 우선

  const hasRecords = recent.length > 0;
  list.style.display = hasRecords ? '' : 'none';
  empty.style.display = hasRecords ? 'none' : '';
  if (!hasRecords) return;

  recent.forEach(record => list.appendChild(buildItem(record)));
}

/** 세션 기록 카드 1장 — 헤더(날짜) + 통계 배지 행 */
function buildItem(record) {
  const item = document.createElement('div');
  item.className = 'lb-item';

  const head = document.createElement('div');
  head.className = 'lb-item-head';
  head.appendChild(span('lb-date', formatDate(record.ts)));
  item.appendChild(head);

  const stats = document.createElement('div');
  stats.className = 'lb-stats';
  // 구 L1(값 1) 기록 포함 무효값은 '연습하기'로 폴백 표시 (2모드 체계)
  stats.appendChild(span('lb-stat', `✂️ ${FADING_LEVEL_LABELS[record.fadingLevel] || FADING_LEVEL_LABELS[2]}`));
  stats.appendChild(span('lb-stat', `🎲 ${record.questionCount || 0}문항`));
  stats.appendChild(span('lb-stat', `⭕ ${record.correctCount || 0}`));
  stats.appendChild(span('lb-stat', `❌ ${record.errorCount || 0}`));
  stats.appendChild(span('lb-stat', `⏱ ${formatDuration(record.durationMs)}`));
  item.appendChild(stats);

  return item;
}

function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

/** Date.now() 타임스탬프 → 'M월 D일 HH:MM' */
function formatDate(ts) {
  const d = new Date(ts || 0);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}:${mm}`;
}

/** 소요 ms → 'M분 S초' (1분 미만은 'S초') */
function formatDuration(ms) {
  const totalSec = Math.max(0, Math.round((ms || 0) / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}분 ${sec}초` : `${sec}초`;
}
