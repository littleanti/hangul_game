// hint.js — 힌트 레이어 컨트롤러 (M3 본 구현, TRD §3.4, §5.2)
// L1: 색 하이라이트 + 뜻 라벨 / L2: 하이라이트만 / L3: 오버레이 제거

import { state } from './state.js';
import { HANJA } from '../data/hanja.js';

/**
 * 힌트 레벨에 따라 #hint-overlay 렌더링 (TRD §5.2):
 *   L1: .hint-segment 하이라이트(--hint-l1-bg, 테두리 --hint-l1-border)
 *       + .hint-label 뜻 라벨("불 화" / "뫼 산")
 *   L2: .hint-segment.l2 하이라이트만 (뜻 라벨 없음)
 *   L3: 오버레이 비움 (합성어 카드만 표시)
 * 설정에서 힌트 표시를 끈 경우(hintVisible=false)에도 오버레이를 비운다.
 */
export function renderHint(vocabItem, hintLevel = state.session.hintLevel) {
  const overlay = document.getElementById('hint-overlay');
  if (!overlay) return;
  overlay.textContent = '';

  if (!vocabItem || hintLevel >= 3 || !state.settings.hintVisible) return;

  for (const id of vocabItem.components) {
    const seg = document.createElement('div');
    seg.className = hintLevel === 2 ? 'hint-segment l2' : 'hint-segment';

    if (hintLevel === 1) {
      const h = HANJA[id];
      const label = document.createElement('span');
      label.className = 'hint-label';
      label.textContent = h ? `${h.meaning} ${h.reading}` : id; // 예: "불 화"
      seg.appendChild(label);
    }
    overlay.appendChild(seg);
  }
}

/**
 * 라운드 번호 → 힌트 레벨 (TRD §3.4 — 라운드 수 고정 방식).
 * 15라운드 기준: 1~5번 L1, 6~10번 L2, 11~15번 L3.
 * 총 라운드 수가 15 미만이면 전체를 3등분하여 L1/L2/L3 구간 배정.
 * 오답 시 레벨 유지(강등 없음) — 레벨은 오직 라운드 번호로만 결정된다.
 */
export function levelForRound(roundIdx, totalRounds) {
  if (totalRounds <= 0) return 1;
  return Math.min(3, Math.floor((roundIdx * 3) / totalRounds) + 1);
}
