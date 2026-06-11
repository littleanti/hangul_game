// dock.js — 한자 블록 도크 렌더링·탭·드래그·스냅 (M2 본 구현, TRD §3.5, §6.1, §6.2)
// 6_morpheme_detective 자성 스냅(40dp) 패러다임 계승.
// 탭(선택 토글)과 드래그+자성 스냅 모두 동일한 제출 경로(onSubmit)로 라우팅.

import { state } from './state.js';
import { shuffle, clamp, dist } from './utils.js';
import { MAGNET_PX, WRONG_SHAKE_MS } from './config.js';
import * as pointer from './pointer.js';
import { HANJA } from '../data/hanja.js';

// ----- 모듈 내부 상태 -----
let selected = new Set();   // 선택된 한자 ID
let onSubmit = null;        // 2개 선택 완료 콜백 — game.onBlocksSelected
let locked = false;         // 판정 중 입력 잠금

/** 정답 2개 + 디스트랙터 2~3개 셔플 (TRD §3.5) */
export function buildDockItems(vocabItem) {
  const answer = vocabItem.components;   // 항상 2개
  const decoys = vocabItem.distractors;  // 2~3개
  return shuffle([...answer, ...decoys]);
}

/**
 * #hanja-dock에 블록 렌더링 + 탭/드래그 핸들러 부착.
 * @param {object} vocabItem
 * @param {(ids: string[]) => void} submitCb — 2개 선택 완료 시 호출
 */
export function renderDock(vocabItem, submitCb) {
  const dockEl = document.getElementById('hanja-dock');
  if (!dockEl) return;
  dockEl.textContent = '';
  selected = new Set();
  onSubmit = submitCb || null;
  locked = false;

  for (const id of buildDockItems(vocabItem)) {
    dockEl.appendChild(makeBlock(id));
  }
}

/** 한자 블록 1개 생성 — aria-label="화 (불 화)" 형식 (TRD §8.2) */
function makeBlock(id) {
  const h = HANJA[id];
  const el = document.createElement('div');
  el.className = 'hanja-block';
  el.dataset.id = id;
  el.textContent = id;
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', `${h.reading} (${h.meaning} ${h.reading})`);
  el.setAttribute('aria-pressed', 'false');

  // 키보드 접근성 — Enter/Space로 선택 토글 (TRD §8.2)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelect(el);
    }
  });

  // 드래그 세션 캐시 (드래그 시작 시점의 블록 중심·카드 rect)
  let base = null;  // { x, y } 블록 중심 (transform 없는 상태)
  let card = null;  // 합성어 카드 DOMRect

  pointer.attach(el, {
    onTap: () => toggleSelect(el),

    onDragStart: () => {
      if (locked) return;
      const r = el.getBoundingClientRect(); // transform 0 시점 → base
      base = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      card = document.getElementById('compound-card')?.getBoundingClientRect() ?? null;
      el.classList.add('dragging');
    },

    onDragMove: (e, dx, dy) => {
      if (locked || !base) return;
      let tx = dx;
      let ty = dy;
      let near = false;
      if (card) {
        // 블록 중심 → 카드 rect 최근접점 거리
        const cx = base.x + dx;
        const cy = base.y + dy;
        const nx = clamp(cx, card.left, card.right);
        const ny = clamp(cy, card.top, card.bottom);
        const d = dist(cx, cy, nx, ny);
        near = d <= MAGNET_PX();
        if (near && d > 0) {
          // 자성 흡착 — 카드 가장자리 최근접점으로 끌려감 (40dp 자석, TRD §6.1)
          tx = nx - base.x;
          ty = ny - base.y;
        }
      }
      el.style.transform = `translate(${tx}px, ${ty}px) scale(1.08)`;
      el.classList.toggle('snapped', near);
    },

    onDragEnd: (e, dx, dy, cancelled) => {
      const wasSnapped = el.classList.contains('snapped');
      el.classList.remove('dragging', 'snapped');
      el.style.transform = '';
      base = null;
      card = null;
      if (locked || cancelled) return;
      // 카드에 스냅된 채 손을 떼면 = 선택 제출 (탭과 동일 경로, TRD §6.1)
      if (wasSnapped && !selected.has(el.dataset.id)) toggleSelect(el);
    },
  });

  return el;
}

/** 탭/드롭 공통 선택 토글 — 2개 선택 완료 시 자동 제출 */
function toggleSelect(el) {
  if (locked) return;
  const id = el.dataset.id;
  if (selected.has(id)) {
    selected.delete(id);
    el.classList.remove('selected');
    el.setAttribute('aria-pressed', 'false');
  } else {
    if (selected.size >= 2) return; // 안전장치 (2개 도달 시 잠금이라 통상 불가)
    selected.add(id);
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
  }
  state.round.selectedComponents = [...selected];

  if (selected.size === 2 && onSubmit) {
    locked = true; // 판정 동안 입력 잠금
    onSubmit([...selected]);
  }
}

/** 오답 shake 피드백 — 단일 블록 (TRD §6.2) */
export function playWrongFeedback(blockEl) {
  if (!blockEl) return;
  blockEl.classList.add('wrong-shake');
  blockEl.addEventListener('animationend', () => {
    blockEl.classList.remove('wrong-shake', 'selected');
  }, { once: true });
}

/** 오답 처리 — 선택된 블록 전체 shake 후 선택 해제·재시도 가능 상태로 복귀 */
export function playWrongSelection() {
  const dockEl = document.getElementById('hanja-dock');
  if (!dockEl) return;
  for (const el of dockEl.querySelectorAll('.hanja-block.selected')) {
    el.setAttribute('aria-pressed', 'false');
    playWrongFeedback(el);
  }
  selected = new Set();
  state.round.selectedComponents = [];
  // shake가 끝날 때까지 잠금 유지 — animationend의 .selected 제거가
  // 새 선택을 지우는 경합 방지. 종료 후 재시도 입력 허용.
  setTimeout(() => { locked = false; }, WRONG_SHAKE_MS + 50);
}

/** 정답 블록 하이라이트 (분해 팝업 전 시각 피드백) */
export function markCorrect() {
  const dockEl = document.getElementById('hanja-dock');
  if (!dockEl) return;
  for (const el of dockEl.querySelectorAll('.hanja-block.selected')) {
    el.classList.add('snapped');
  }
}
