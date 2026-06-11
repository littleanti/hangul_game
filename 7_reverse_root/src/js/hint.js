// hint.js — 힌트 레이어 컨트롤러 (M0 스텁 → M3 본 구현, TRD §3.4, §5.2)

import { state } from './state.js';

/**
 * 힌트 레벨에 따라 #hint-overlay 렌더링 (M3 본 구현):
 *   L1: .hint-segment 하이라이트(--hint-l1-bg) + .hint-label 뜻 라벨
 *   L2: .hint-segment.l2 하이라이트만
 *   L3: 오버레이 비움
 */
export function renderHint(vocabItem, hintLevel = state.session.hintLevel) {
  const overlay = document.getElementById('hint-overlay');
  if (!overlay) return;
  overlay.textContent = ''; // M3에서 레벨별 DOM 구성
  void vocabItem; void hintLevel;
}

/** 라운드 번호 → 힌트 레벨 (TRD §3.4: 라운드 수 고정 3등분) */
export function levelForRound(roundIdx, totalRounds) {
  const third = Math.ceil(totalRounds / 3) || 1;
  return Math.min(3, Math.floor(roundIdx / third) + 1);
}
