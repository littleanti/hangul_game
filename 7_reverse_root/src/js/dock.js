// dock.js — 한자 블록 도크 렌더링·탭·드래그·스냅 (M0 스텁 → M2 본 구현, TRD §3.5, §6.1)
// 6_morpheme_detective 자성 스냅(40dp) 패러다임 계승.

import { shuffle } from './utils.js';

/** 정답 2개 + 디스트랙터 2~3개 셔플 (TRD §3.5) */
export function buildDockItems(vocabItem) {
  const answer = vocabItem.components;   // 항상 2개
  const decoys = vocabItem.distractors;  // 2~3개
  return shuffle([...answer, ...decoys]);
}

/** #hanja-dock에 블록 렌더링 + 탭/드래그 핸들러 부착 (M2 본 구현) */
export function renderDock(vocabItem) {
  const dockEl = document.getElementById('hanja-dock');
  if (!dockEl) return;
  dockEl.textContent = ''; // M2에서 .hanja-block DOM 구성
  void vocabItem;
}

/** 오답 shake 피드백 (TRD §6.2) */
export function playWrongFeedback(blockEl) {
  if (!blockEl) return;
  blockEl.classList.add('wrong-shake');
  blockEl.addEventListener('animationend', () => {
    blockEl.classList.remove('wrong-shake', 'selected');
  }, { once: true });
}
