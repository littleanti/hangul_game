// game.js — 라운드 컨트롤러 (M2 본 구현 → M6 점진 변환 개편, TRD §2.1, §9.1, §10)
// 흐름: startSession → startRound → (탭/드래그) onBlockSelected — 한자 1개 단위 즉시 판정
//       → 부분 정답: 카드 음절 한글→한자 제자리 변환 → 전부 변환 시 분해 팝업 → 다음 라운드
//       → 오답: 해당 블록만 shake 후 재시도 → endSession

import { state } from './state.js';
import { ROUND_SUMMARY_MS, WORD_COMPLETE_MS } from './config.js';
import { shuffle } from './utils.js';
import * as ui from './ui.js';
import * as storage from './storage.js';
import * as settings from './settings.js';
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

/**
 * 한자 1개 단위 판정 — 아직 변환되지 않은 음절 중 id와 일치하는 인덱스 반환.
 * 순서 무관(어느 음절부터 골라도 됨), 불일치·중복 정답이면 -1.
 * @param {object} vocabItem
 * @param {string} id - 선택한 한자 블록 ID
 * @param {boolean[]} solved - 음절별 변환 완료 여부
 */
export function componentIndexFor(vocabItem, id, solved) {
  return vocabItem.components.findIndex((c, i) => c === id && !solved[i]);
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
  closeRoundSummary();
  state.session.queue = pickQueue(VOCAB);
  state.session.currentIdx = 0;
  state.session.hintLevel = state.progress.lastHintLevel || 1;
  state.session.correctCount = 0;
  state.session.wrongCount = 0;
  state.session.stars = 0;
  state.session.wrongPerRound = [];
  state.session.solvedPerRound = [];
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
  state.round.solvedComponents = item.components.map(() => false);
  state.round.attemptCount = 0;

  // 합성어 카드(음절 단위 span — 정답 시 제자리 한글→한자 변환 대상)
  // + 힌트 레이어 (M3: L1 라벨+하이라이트 / L2 하이라이트 / L3 없음)
  renderWord(item);
  hint.renderHint(item, state.session.hintLevel);

  // 진행률 바 + 힌트 레벨 배지
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${(idx / state.session.queue.length) * 100}%`;
  const badge = document.getElementById('hint-level-badge');
  if (badge) badge.textContent = `힌트 ${state.session.hintLevel}단계`;

  // 도크 — 블록 1개 탭/스냅마다 onBlockSelected로 즉시 라우팅
  dock.renderDock(item, onBlockSelected);

  tts.speak(item.word);
  state.round.phase = 'awaiting';
}

/** 합성어 카드를 음절 단위 span으로 렌더링 — 정답 음절의 제자리 변환 대상 */
function renderWord(item) {
  const wordEl = document.getElementById('compound-word');
  if (!wordEl) return;
  wordEl.textContent = '';
  // 2형태소 합성어 = 음절:한자 1:1 대응 (vocab 스키마 보장). 불일치 데이터는 통짜 폴백.
  if (item.word.length !== item.components.length) {
    wordEl.textContent = item.word;
    return;
  }
  [...item.word].forEach((ch, i) => {
    const syl = document.createElement('span');
    syl.className = 'syllable';
    syl.dataset.idx = String(i);
    syl.textContent = ch;
    wordEl.appendChild(syl);
  });
}

/** 정답 음절 한글→한자 제자리 변환 — 한자 + 한글 루비(가독 비계 유지) */
function transformSyllable(idx, hanjaId, hangulCh) {
  const syl = document.querySelector(`#compound-word .syllable[data-idx="${idx}"]`);
  if (!syl) return;
  syl.textContent = hanjaId;
  const ruby = document.createElement('span');
  ruby.className = 'syl-ruby';
  ruby.textContent = hangulCh;
  syl.appendChild(ruby);
  syl.classList.add('solved');
}

/** 블록 1개 선택 — dock.js가 호출. 한자 단위 즉시 판정 (M6 점진 변환) */
export function onBlockSelected(id) {
  const idx = state.session.currentIdx;
  const item = state.session.queue[idx];
  if (!item || state.round.phase !== 'awaiting') {
    dock.unlock(); // 제출이 무시된 경우 도크 잠금 복구
    return;
  }

  state.round.attemptCount += 1;
  const solved = state.round.solvedComponents;
  const compIdx = componentIndexFor(item, id, solved);

  if (compIdx >= 0) {
    // ----- 부분 정답 — 해당 음절 제자리 변환 -----
    solved[compIdx] = true;
    audio.playCorrect();
    dock.markBlockCorrect(id);
    transformSyllable(compIdx, id, item.word[compIdx]);

    // 부분 정답엔 개별 TTS 없음 — 효과음·변환 연출만. 음·뜻 발화는 완성 팝업이
    // 일괄 담당("화산! 불 화, 산 산"). 부분 발화는 마지막 음절만 생략되는 비대칭을
    // 만들었고, 같은 내용이 팝업에서 반복돼 제거 (시각+청각이 결합되는 팝업 시점이 학습에 유리).
    if (solved.every(Boolean)) {
      // ----- 라운드 완성 — 변환 연출을 보여준 뒤 음·뜻 확인 팝업 -----
      state.round.phase = 'result';
      state.session.correctCount += 1;
      state.session.wrongPerRound[idx] = state.session.wrongPerRound[idx] ?? 0;
      state.session.solvedPerRound[idx] = true; // 완료 화면 라운드별 요약용
      setTimeout(() => decomp.playDecomp(item, () => nextRound()), WORD_COMPLETE_MS);
    }
  } else {
    // ----- 오답 — 해당 블록만 shake, 힌트 레벨 유지(강등 없음), 재시도 -----
    state.session.wrongCount += 1;
    state.session.wrongPerRound[idx] = (state.session.wrongPerRound[idx] ?? 0) + 1;
    audio.playWrong();
    dock.playWrongBlock(id); // 선택한 블록만 shake — 피드백 귀속 명확화
  }
}

/** 다음 라운드 — 힌트 레벨이 내려가는 경계면 round-summary 인터스티셜 경유 */
function nextRound() {
  const next = state.session.currentIdx + 1;
  if (next >= state.session.queue.length) {
    endSession();
    return;
  }
  const nextLevel = hint.levelForRound(next, state.session.queue.length);
  if (nextLevel > state.session.hintLevel) {
    showRoundSummary(nextLevel, () => startRound(next));
  } else {
    startRound(next);
  }
}

// ====== 라운드 간 요약 인터스티셜 round-summary (PRD §6, TRD §3.4 — M3) ======

/** 떠 있는 round-summary 인터스티셜 제거 (화면 전환 등 정리용) */
export function closeRoundSummary() {
  document.querySelector('.round-summary-overlay')?.remove();
}

/**
 * 힌트 레벨 전환 직전 인터스티셜 — "이제 힌트를 줄여볼게요" 안내 + 별 누적 표시.
 * 탭 또는 ROUND_SUMMARY_MS 경과 시 자동으로 다음 라운드 진입.
 */
function showRoundSummary(nextLevel, onContinue) {
  closeRoundSummary();

  const done = state.session.currentIdx + 1;                  // 완료한 라운드 수
  const stars = calcStars(state.session.correctCount, done);  // 지금까지의 누적 별

  const overlay = document.createElement('div');
  overlay.className = 'round-summary-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', '힌트 단계 안내');

  const card = document.createElement('div');
  card.className = 'round-summary-card';

  const title = document.createElement('div');
  title.className = 'summary-title';
  title.textContent = '이제 힌트를 줄여볼게요';

  const starsEl = document.createElement('div');
  starsEl.className = 'summary-stars';
  starsEl.setAttribute('aria-label', `지금까지 별 ${stars}개`);
  starsEl.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  const text = document.createElement('p');
  text.className = 'summary-text';
  text.textContent = nextLevel === 2
    ? `지금까지 ${state.session.correctCount}문제 정답! 이제 뜻 라벨 없이 하이라이트만 보여요`
    : `지금까지 ${state.session.correctCount}문제 정답! 마지막엔 힌트 없이 도전해봐요`;

  const tap = document.createElement('p');
  tap.className = 'summary-tap';
  tap.textContent = '화면을 누르면 바로 시작해요';

  card.append(title, starsEl, text, tap);
  overlay.appendChild(card);

  const proceed = () => {
    if (!overlay.isConnected) return; // 화면 전환 등으로 이미 정리된 경우 무시
    overlay.remove();
    onContinue();
  };
  overlay.addEventListener('pointerdown', proceed);
  document.body.appendChild(overlay);

  tts.speak('이제 힌트를 줄여볼게요');
  setTimeout(proceed, ROUND_SUMMARY_MS);
}

/** 세션 종료 — 점수·별 계산, 완료 화면 렌더링 (점수 영속 저장은 M4) */
export function endSession() {
  decomp.close();
  closeRoundSummary();

  const total = state.session.queue.length || 1;
  const correct = state.session.correctCount;
  const stars = calcStars(correct, total);
  const score = calcScore(state.session);
  state.session.stars = stars;

  // 다음 세션 pickQueue의 중복 제한용 (메모리 내, 미영속 — TRD §10.3)
  state.session.lastPlayedWords = new Set(state.session.queue.map(v => v.word));

  // 다음 세션 힌트 레벨 초기값 핸드오프
  state.progress.lastHintLevel = state.session.hintLevel;

  // ----- 영속화 (M4, TRD §9.2) -----
  // 리더보드: '7rr:leaderboard' 상위 10개 유지 (점수 내림차순)
  storage.saveScore({
    score,
    stars,
    correctCount: correct,
    totalCount: total,
    hintLevel: state.session.hintLevel,
    playedAt: Date.now(),
  });
  // 진행률: '7rr:progress' { totalSessions, lastHintLevel, lastPlayedAt }
  state.progress.totalSessions += 1;
  state.progress.bestScore = Math.max(state.progress.bestScore || 0, score); // 메모리 내 참고치
  storage.set('progress', {
    totalSessions: state.progress.totalSessions,
    lastHintLevel: state.progress.lastHintLevel,
    lastPlayedAt: Date.now(),
  });

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

  // 라운드별 요약 칩 — ★ 무오답 정답 / ✓ 오답 후 정답 / – 미완료(중도 종료)
  const roundsEl = document.getElementById('end-rounds');
  if (roundsEl) {
    roundsEl.textContent = '';
    state.session.queue.forEach((v, i) => {
      const solved = !!state.session.solvedPerRound[i];
      const flawless = solved && (state.session.wrongPerRound[i] ?? 0) === 0;
      const chip = document.createElement('span');
      chip.className = `end-round-chip${flawless ? ' perfect' : solved ? '' : ' missed'}`;
      chip.textContent = `${v.word} ${flawless ? '★' : solved ? '✓' : '–'}`;
      roundsEl.appendChild(chip);
    });
  }

  ui.goTo('end');

  // PWA 설치 프롬프트 — 세션 최초 완료 후 표시 (M4, TRD §15)
  settings.maybeOfferInstall();
}

/** 앱 시작 시 '7rr:progress' 로드 — lastHintLevel 등 세션 초기값 복원 (M4) */
export function loadProgress() {
  const saved = storage.get('progress');
  if (!saved || typeof saved !== 'object') return;
  if (Number.isFinite(saved.totalSessions)) state.progress.totalSessions = saved.totalSessions;
  if ([1, 2, 3].includes(saved.lastHintLevel)) state.progress.lastHintLevel = saved.lastHintLevel;
  if (Number.isFinite(saved.lastPlayedAt)) state.progress.lastPlayedAt = saved.lastPlayedAt;
}
