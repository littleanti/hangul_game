/**
 * 게임 코어 — 출제·정답 판정·진행 (TRD §2.3, §9)
 * - pickQuestions: fresh 우선, 부족 시 반복 채움 (TRD §9.1)
 * - renderQuestion: '[ ]' 마커 → .blank 슬롯 치환 (createTextNode — XSS 안전)
 * - judgeAnswer: trim 비교 → mint/red 피드백 + ⭕/❌ 레이블 + TTS + 효과음
 *   → 1500ms 후 nextQuestion → 마지막 문제 후 완료 화면
 */

import { state, resetGameState } from './state.js';
import { SENTENCES } from '../data/sentences.js';
import { shuffle } from './utils.js';
import { speak } from './tts.js';
import { playCorrect, playWrong } from './sound.js';
import { goTo, setScreenTimer } from './ui.js';
import { renderDock } from './dock.js';
import { resetHint } from './hint.js';
import { saveSettings, saveSession, saveLeaderboard } from './storage.js';
import { NEXT_DELAY_MS } from './config.js';

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/** 난이도 필터 — 'all'이면 전체 풀 사용 (TRD §9.1) */
function getFilteredPool() {
  const { difficulty } = state.settings;
  if (difficulty === 'all') return SENTENCES;
  return SENTENCES.filter(q => q.difficulty === difficulty);
}

/**
 * 게임 시작 — 설정 기반 문제 풀 구성 + 첫 문제 렌더링
 * (홈 '바로 시작'·설정 '시작하기'·완료 '다시 하기' 공용 진입점)
 */
export function startGame() {
  resetGameState();
  const pool = getFilteredPool();
  const questions = pickQuestions(
    pool,
    state.settings.questionCount,
    state.lastGameIds,
  );
  if (questions.length === 0) {
    goTo('home-screen');
    return;
  }
  state.game.questions = questions;
  // 직전 세션 ID 갱신 — 다음 '다시 하기'에서 연속 중복 방지 (메모리만 유지)
  state.lastGameIds = new Set(questions.map(q => q.id));
  goTo('play-screen');
  renderQuestion(questions[0]);
}

/** 홈 화면 레벨 버튼 — 난이도 지정 후 즉시 시작 */
export function startGameWithDifficulty(difficulty) {
  state.settings.difficulty = difficulty;
  saveSettings();
  startGame();
}

/**
 * 문제 풀에서 needed개 선별 (TRD §9.1)
 * - 직전 세션에 없던 fresh 문제 우선, 부족 시 직전 문제 반복
 * - 풀 전체가 needed보다 작으면 셔플 순환으로 반복 채움
 */
export function pickQuestions(pool, needed, lastIds) {
  if (!Array.isArray(pool) || pool.length === 0) return [];
  const ids = lastIds instanceof Set ? lastIds : new Set();
  const fresh = pool.filter(q => !ids.has(q.id));
  const repeats = pool.filter(q => ids.has(q.id));

  let picked;
  if (fresh.length >= needed) {
    picked = shuffle(fresh).slice(0, needed);
  } else {
    picked = [...shuffle(fresh), ...shuffle(repeats)].slice(0, needed);
  }
  // 풀 자체가 부족하면 반복 채움 (셔플 후 순환)
  while (picked.length < needed) {
    picked = [...picked, ...shuffle(pool)].slice(0, needed);
  }
  return picked;
}

/** 현재 문제 렌더링 — 진행바·점수·문장·도크 갱신 */
export function renderQuestion(item) {
  const g = state.game;
  g.answered = false;
  g.selectedChoice = null;
  resetHint();

  const total = g.questions.length;
  setText('progress-text', `${g.currentIdx + 1} / ${total}`);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${total > 0 ? (g.currentIdx / total) * 100 : 0}%`;
  setText('score-badge', `⭐ ${g.score}`);

  renderSentenceText(item.sentence);

  const hintArea = document.getElementById('hint-area');
  if (hintArea) hintArea.innerHTML = '';
  const hintBtn = document.getElementById('hint-button');
  if (hintBtn) {
    hintBtn.disabled = false;
    hintBtn.style.display = state.settings.hintEnabled ? '' : 'none';
  }

  const fb = document.getElementById('game-feedback');
  if (fb) {
    fb.textContent = '';
    fb.classList.remove('ok', 'no');
  }

  renderDock(shuffle(item.choices));
}

/**
 * 문장 본문 렌더링 — '[ ]' 마커를 <span class="blank">로 치환
 * createTextNode 기반이라 데이터에 마크업이 섞여도 XSS 없이 안전 (TRD §9.2)
 */
export function renderSentenceText(sentence) {
  const p = document.getElementById('sentence-text');
  if (!p) return;
  p.innerHTML = '';
  const parts = String(sentence).split('[ ]');
  parts.forEach((part, i) => {
    if (part) p.appendChild(document.createTextNode(part));
    if (i < parts.length - 1) {
      const blank = document.createElement('span');
      blank.className = 'blank';
      blank.setAttribute('role', 'img');
      blank.setAttribute('aria-label', '빈칸');
      p.appendChild(blank);
    }
  });
}

/** 정답 판정 — trim() 정규화 (TRD §9.3) */
export function checkAnswer(chosen, item) {
  return String(chosen).trim() === String(item.answer).trim();
}

/**
 * 응답 확정 — dock.js가 칩 배치 500ms 후 호출 (TRD §5.2)
 * 이 시점부터 칩 반환(선택 취소) 불가.
 */
export function judgeAnswer(chip) {
  const g = state.game;
  if (g.answered) return;
  const item = g.questions[g.currentIdx];
  if (!item) return;

  g.answered = true;
  const chosen = g.selectedChoice ?? '';
  const correct = checkAnswer(chosen, item);

  // 세션 기록 (TRD §3.5 — hintLevelUsed 포함)
  const result = { id: item.id, correct, hintLevelUsed: g.hintLevel };
  if (!correct) result.chosen = chosen;
  g.results.push(result);

  if (correct) {
    g.score += 1;
  } else {
    g.wrongItems.push({ item, chosen });
  }
  setText('score-badge', `⭐ ${g.score}`);

  // 힌트 버튼은 미응답 상태에서만 활성 (TRD §5.4)
  const hintBtn = document.getElementById('hint-button');
  if (hintBtn) hintBtn.disabled = true;

  // 색상 + 텍스트 레이블(⭕/❌) 병기 — 색각 접근성 (TRD §7.4)
  if (chip) {
    chip.classList.add(correct ? 'correct' : 'wrong');
    chip.disabled = true;
    const mark = document.createElement('span');
    mark.className = 'judge-mark';
    mark.textContent = correct ? '⭕' : '❌';
    chip.appendChild(mark);
  }
  const fb = document.getElementById('game-feedback');
  if (fb) {
    fb.textContent = correct ? '⭕ 정답이에요!' : `❌ 정답은 "${item.answer}"`;
    fb.classList.toggle('ok', correct);
    fb.classList.toggle('no', !correct);
  }

  if (correct) {
    playCorrect();
    speak(item.answer);
  } else {
    playWrong();
    speak(`정답은 ${item.answer}`);
  }

  setScreenTimer(nextQuestion, NEXT_DELAY_MS);
}

/** 다음 문제 진행 — 마지막 문제 후 완료 화면 */
export function nextQuestion() {
  const g = state.game;
  g.currentIdx += 1;
  if (g.currentIdx >= g.questions.length) {
    showEndScreen();
    return;
  }
  renderQuestion(g.questions[g.currentIdx]);
}

/** 완료 화면 — 점수·정답률·오답 목록 + saveSession/saveLeaderboard */
export function showEndScreen() {
  const g = state.game;
  const total = g.questions.length;
  const accuracy = total > 0 ? g.score / total : 0;

  setText('end-score', String(g.score));
  setText('end-total', String(total));
  setText('end-accuracy', `${Math.round(accuracy * 100)}%`);
  renderReviewList();

  if (total > 0) {
    const ts = Date.now();
    saveSession({
      ts,
      difficulty: state.settings.difficulty,
      questions: g.results.slice(),
      score: g.score,
      total,
      // S10 핸드오프 포맷 — difficulty·accuracy 필드 포함 (PRD §9.2)
      accuracy: Math.round(accuracy * 100) / 100,
    });
    saveLeaderboard({
      score: g.score,
      total,
      accuracy: Math.round(accuracy * 100) / 100,
      difficulty: state.settings.difficulty,
      ts,
    });
  }

  goTo('end-screen');
}

/** 오답 목록 렌더링 — 틀린 문장·선택한 답·정답 병기 (textContent — XSS 안전) */
function renderReviewList() {
  const list = document.getElementById('review-list');
  const toggle = document.querySelector('.review-toggle');
  if (!list) return;
  list.innerHTML = '';
  list.classList.remove('open');

  const wrong = state.game.wrongItems;
  if (toggle) toggle.style.display = wrong.length > 0 ? '' : 'none';

  wrong.forEach(({ item, chosen }) => {
    const row = document.createElement('div');
    row.className = 'review-item';

    const word = document.createElement('p');
    word.className = 'review-word';
    word.textContent = item.sentence;

    const detail = document.createElement('small');
    detail.textContent = `내 답: ${chosen || '—'} · 정답: ${item.answer}`;
    word.appendChild(detail);

    row.appendChild(word);
    list.appendChild(row);
  });
}

/** 문장 카드 TTS 버튼 — 문장 전체 읽기 (빈칸은 '빈칸'으로 발화) */
export function speakSentence() {
  const item = state.game.questions[state.game.currentIdx];
  if (!item) return;
  speak(String(item.sentence).replace('[ ]', '빈칸'));
}

/** 완료 화면 — 오답 목록 펼침/접힘 */
export function toggleReview() {
  const list = document.getElementById('review-list');
  if (list) list.classList.toggle('open');
}
