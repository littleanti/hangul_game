// game.js — 라운드 컨트롤러 (M0 스텁 → M2/M3 본 구현, TRD §2.1, §10)

import { state } from './state.js';
import * as ui from './ui.js';
import * as hint from './hint.js';
import * as dock from './dock.js';
import { VOCAB } from '../data/vocab.js';

/** 난이도 오름차순 정렬 후 각 구간 내부 shuffle (M2 본 구현, TRD §10.2) */
export function buildSessionQueue(vocab) {
  return [...vocab].sort((a, b) => a.difficulty - b.difficulty);
}

/** 직전 세션 어휘 중복 ≤ 20% 제한 (M2 본 구현, TRD §10.3) */
export function pickQueue(vocab) {
  return buildSessionQueue(vocab);
}

/** 순서 무관 집합 비교 (TRD §10.1) */
export function checkAnswer(selectedIds, vocabItem) {
  const correct = new Set(vocabItem.components);
  const selected = new Set(selectedIds);
  if (correct.size !== selected.size) return false;
  for (const id of correct) {
    if (!selected.has(id)) return false;
  }
  return true;
}

/** 별 계산 — 정답률 ≥0.9 → 3, ≥0.7 → 2, 그 외 1 (TRD §9.1) */
export function calcStars(correctCount, total) {
  const rate = total > 0 ? correctCount / total : 0;
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  return 1;
}

/** 세션 시작 — play 화면 진입 시 호출 (M2 본 구현) */
export function startSession() {
  state.session.queue = pickQueue(VOCAB);
  state.session.currentIdx = 0;
  state.session.hintLevel = state.progress.lastHintLevel || 1;
  state.session.correctCount = 0;
  state.session.wrongCount = 0;
  state.round.phase = 'idle';
  startRound(0);
}

/** 라운드 시작 — 카드 렌더링·TTS·도크 구성 (M2 본 구현) */
export function startRound(idx) {
  state.session.currentIdx = idx;
  const item = state.session.queue[idx] ?? null;
  if (item) {
    dock.renderDock(item);
    hint.renderHint(item);
  }
  state.round.phase = item ? 'presenting' : 'idle';
  state.round.selectedComponents = [];
  state.round.attemptCount = 0;
}

/** 블록 2개 선택 완료 시 dock.js가 호출 (M2 본 구현) */
export function onBlocksSelected(ids) {
  void ids; // M2: checkAnswer → 정답/오답 분기
}

/** 세션 종료 — 점수 계산·저장 후 완료 화면 (M2/M4 본 구현) */
export function endSession() {
  ui.goTo('end');
}
