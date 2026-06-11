// game.js — 라운드 컨트롤러 (M2 본 구현, TRD §2.1, §9.1, §10)
// 흐름: startSession → startRound → (탭/드래그) onBlocksSelected → checkAnswer
//       → 정답: 분해 팝업 → 다음 라운드 / 오답: shake 후 재시도 → endSession

import { state } from './state.js';
import { shuffle } from './utils.js';
import * as ui from './ui.js';
import * as tts from './tts.js';
import * as audio from './audio.js';
import * as hint from './hint.js';
import * as dock from './dock.js';
import * as decomp from './decomp.js';
import { VOCAB } from '../data/vocab.js';

// ====== 큐 구성 (TRD §10.2, §10.3) ======

/** 난이도 오름차순 정렬 후 각 난이도 구간 내부 shuffle */
export function buildSessionQueue(vocab) {
  const groups = new Map(); // difficulty → VocabItem[]
  for (const v of vocab) {
    if (!groups.has(v.difficulty)) groups.set(v.difficulty, []);
    groups.get(v.difficulty).push(v);
  }
  const out = [];
  for (const d of [...groups.keys()].sort((a, b) => a - b)) {
    out.push(...shuffle(groups.get(d)));
  }
  return out;
}

/** 직전 세션 어휘 중복 ≤ 20% 제한 — fresh 우선, 부족분만 repeat으로 채움 */
export function pickQueue(vocab) {
  const lastWords = state.session.lastPlayedWords || new Set();
  const fresh = vocab.filter(v => !lastWords.has(v.word));
  const repeat = vocab.filter(v => lastWords.has(v.word));
  // fresh가 충분하면 fresh만, 부족하면 repeat으로 채움
  // (풀 15개 = 세션 15라운드인 현재는 전체 선택 — 풀 확장 시 ≤20% 제한 발효)
  const picked = [...fresh, ...shuffle(repeat)].slice(0, vocab.length);
  return buildSessionQueue(picked);
}

// ====== 판정·점수 (TRD §9.1, §10.1) ======

/** 순서 무관 집합 비교 (Set 기반) */
export function checkAnswer(selectedIds, vocabItem) {
  const correct = new Set(vocabItem.components);
  const selected = new Set(selectedIds);
  if (correct.size !== selected.size) return false;
  for (const id of correct) {
    if (!selected.has(id)) return false;
  }
  return true;
}

/** 별 계산 — 정답률 ≥0.9 → 3, ≥0.7 → 2, 그 외 1 */
export function calcStars(correctCount, total) {
  const rate = total > 0 ? correctCount / total : 0;
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  return 1;
}

/** 점수 = (정답 수 × 10) + (오답 없는 라운드 수 × 5) */
export function calcScore(session) {
  const bonus = session.queue.filter((_, i) => session.wrongPerRound[i] === 0).length;
  return session.correctCount * 10 + bonus * 5;
}

// ====== 세션·라운드 진행 ======

/** 세션 시작 — play 화면 진입 시 호출 (main.js startGame) */
export function startSession() {
  decomp.close();
  state.session.queue = pickQueue(VOCAB);
  state.session.currentIdx = 0;
  state.session.hintLevel = state.progress.lastHintLevel || 1;
  state.session.correctCount = 0;
  state.session.wrongCount = 0;
  state.session.stars = 0;
  state.session.wrongPerRound = [];
  state.round.phase = 'idle';
  startRound(0);
}

/** 라운드 시작 — 합성어 카드 렌더링 + TTS 발화 + 도크 구성 + 힌트 적용 */
export function startRound(idx) {
  const item = state.session.queue[idx];
  if (!item) { endSession(); return; }

  state.session.currentIdx = idx;
  state.session.hintLevel = hint.levelForRound(idx, state.session.queue.length);
  state.round.phase = 'presenting';
  state.round.selectedComponents = [];
  state.round.attemptCount = 0;

  // 합성어 카드 — M2는 합성어 텍스트만 표시 (힌트 레이어는 M3)
  const wordEl = document.getElementById('compound-word');
  if (wordEl) wordEl.textContent = item.word;
  hint.renderHint(item, state.session.hintLevel);

  // 진행률 바 + 힌트 레벨 배지
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${(idx / state.session.queue.length) * 100}%`;
  const badge = document.getElementById('hint-level-badge');
  if (badge) badge.textContent = `힌트 ${state.session.hintLevel}단계`;

  // 도크 — 2개 선택 완료 시 onBlocksSelected로 라우팅
  dock.renderDock(item, onBlocksSelected);

  tts.speak(item.word);
  state.round.phase = 'awaiting';
}

/** 블록 2개 선택 완료 — dock.js가 호출. 정답/오답 분기 */
export function onBlocksSelected(ids) {
  const idx = state.session.currentIdx;
  const item = state.session.queue[idx];
  if (!item || state.round.phase !== 'awaiting') return;

  state.round.attemptCount += 1;

  if (checkAnswer(ids, item)) {
    // ----- 정답 -----
    state.round.phase = 'correct';
    state.session.correctCount += 1;
    state.session.wrongPerRound[idx] = state.session.wrongPerRound[idx] ?? 0;
    audio.playCorrect();
    dock.markCorrect();
    // 분해 애니메이션 + 결과 팝업 → "다음" 버튼으로 다음 라운드
    state.round.phase = 'result';
    decomp.playDecomp(item, () => nextRound());
  } else {
    // ----- 오답 — 힌트 레벨 유지(강등 없음), 재시도 -----
    state.round.phase = 'wrong';
    state.session.wrongCount += 1;
    state.session.wrongPerRound[idx] = (state.session.wrongPerRound[idx] ?? 0) + 1;
    audio.playWrong();
    dock.playWrongSelection(); // shake + 선택 해제 후 재시도 가능
    state.round.selectedComponents = [];
    state.round.phase = 'awaiting';
  }
}

/** 다음 라운드 — 마지막 라운드였으면 세션 종료 */
function nextRound() {
  const next = state.session.currentIdx + 1;
  if (next >= state.session.queue.length) {
    endSession();
  } else {
    startRound(next);
  }
}

/** 세션 종료 — 점수·별 계산, 완료 화면 렌더링 (점수 영속 저장은 M4) */
export function endSession() {
  decomp.close();

  const total = state.session.queue.length || 1;
  const correct = state.session.correctCount;
  const stars = calcStars(correct, total);
  const score = calcScore(state.session);
  state.session.stars = stars;

  // 다음 세션 pickQueue의 중복 제한용 (메모리 내, 미영속 — TRD §10.3)
  state.session.lastPlayedWords = new Set(state.session.queue.map(v => v.word));

  // 진행률 바 가득 채움
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = '100%';

  // 완료 화면 DOM 채우기
  const rate = Math.round((correct / total) * 100);
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('end-stars', '★'.repeat(stars) + '☆'.repeat(3 - stars));
  setText('end-correct', String(correct));
  setText('end-total', String(total));
  setText('end-rate', `${rate}%`);
  setText('end-score', String(score));
  setText('end-feedback',
    stars === 3 ? '한자 뿌리 박사네요! 🏅' :
    stars === 2 ? '아주 잘했어요! 조금만 더! 💪' :
                  '괜찮아요, 다시 도전해봐요! 🌱');

  // TODO(M4): storage.saveScore({ score, stars, ... }) + progress 영속화
  ui.goTo('end');
}
