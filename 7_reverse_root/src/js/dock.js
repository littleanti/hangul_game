// dock.js — 한자 블록 도크 렌더링·탭·드래그·스냅 (M2 본 구현 → M6 점진 변환 개편, TRD §3.5, §6.1, §6.2)
// 6_morpheme_detective 자성 스냅(40dp) 패러다임 계승.
// 탭과 드래그+자성 스냅 모두 동일한 제출 경로(onSubmit)로 라우팅 — 블록 1개 단위 즉시 판정.

import { shuffle, clamp, dist } from './utils.js';
import { MAGNET_PX, WRONG_SHAKE_MS } from './config.js';
import * as pointer from './pointer.js';
import { HANJA } from '../data/hanja.js';

// ----- 모듈 내부 상태 -----
let onSubmit = null;        // 블록 1개 제출 콜백 — game.onBlockSelected(id)
let locked = false;         // 판정·오답 shake 중 입력 잠금

/** 정답 2개 + 디스트랙터 2~3개 셔플 (TRD §3.5) */
export function buildDockItems(vocabItem) {
  const answer = vocabItem.components;   // 항상 2개
  const decoys = vocabItem.distractors;  // 2~3개
  return shuffle([...answer, ...decoys]);
}

/**
 * #hanja-dock에 블록 렌더링 + 탭/드래그 핸들러 부착.
 * @param {object} vocabItem
 * @param {(id: string) => void} submitCb — 블록 1개 탭/스냅마다 호출
 */
export function renderDock(vocabItem, submitCb) {
  const dockEl = document.getElementById('hanja-dock');
  if (!dockEl) return;
  dockEl.textContent = '';
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

  // 키보드 접근성 — Enter/Space로 제출 (TRD §8.2)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      submitBlock(el);
    }
  });

  // 드래그 세션 캐시 (드래그 시작 시점의 블록 중심·카드 rect)
  let base = null;  // { x, y } 블록 중심 (transform 없는 상태)
  let card = null;  // 합성어 카드 DOMRect

  pointer.attach(el, {
    onTap: () => submitBlock(el),

    onDragStart: () => {
      if (locked || el.classList.contains('solved')) return;
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
      // 카드에 스냅된 채 손을 떼면 = 제출 (탭과 동일 경로, TRD §6.1)
      if (wasSnapped) submitBlock(el);
    },
  });

  return el;
}

/**
 * 탭/드롭 공통 제출 — 블록 1개 단위 즉시 판정 경로.
 * game.onBlockSelected가 동기적으로 markBlockCorrect / playWrongBlock을
 * 호출해 잠금을 해제한다 (라운드 완성 시엔 phase 가드가 추가 입력 차단).
 */
function submitBlock(el) {
  if (locked || el.classList.contains('solved') || !onSubmit) return;
  locked = true;
  onSubmit(el.dataset.id);
}

/** 오답 shake 피드백 — 단일 블록 (TRD §6.2) */
export function playWrongFeedback(blockEl) {
  if (!blockEl) return;
  blockEl.classList.add('wrong-shake');
  blockEl.addEventListener('animationend', () => {
    blockEl.classList.remove('wrong-shake');
  }, { once: true });
}

function findBlock(id) {
  return document.querySelector(`#hanja-dock .hanja-block[data-id="${id}"]`);
}

/** 판정 잠금 해제 — game.js 가드가 제출을 무시한 경우의 복구 경로 */
export function unlock() {
  locked = false;
}

/** 오답 처리 — 선택한 블록만 shake 후 재시도 가능 상태로 복귀 (피드백 귀속 명확화) */
export function playWrongBlock(id) {
  playWrongFeedback(findBlock(id));
  // shake가 끝날 때까지 잠금 유지 — 연타로 인한 중복 판정 방지
  setTimeout(() => { locked = false; }, WRONG_SHAKE_MS + 50);
}

/** 부분 정답 처리 — 해당 블록 비활성(.solved) 후 즉시 다음 입력 허용 */
export function markBlockCorrect(id) {
  const el = findBlock(id);
  if (el) {
    el.classList.add('solved');
    el.setAttribute('aria-disabled', 'true');
    el.tabIndex = -1;
  }
  locked = false;
}
