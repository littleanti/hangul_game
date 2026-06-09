/**
 * 게임 로직
 * - 문제 출제, 정답 처리, 종료 화면
 */

import { TIMEOUT_REVEAL_DURATION } from './config.js';
import { state, resetGame } from './state.js';
import { WORDS } from '../data/words.js';
import { getChosung, shuffle, $, $$ } from './utils.js';
import { startTimer, stopTimer, hideTimer } from './timer.js';
import { TTS_AVAILABLE, speak } from './tts.js';
import { playCorrect, playIncorrect } from './sound.js';
import { goTo } from './ui.js';
import { filterWords } from './settings.js';

const INPUT_CORRECT_DELAY = 1200;
const INPUT_WRONG_DELAY   = 2000;
const DISTRACTOR_COUNT    = 8;
const MAX_OVERLAP_RATIO   = 0.20;  // 직전 게임과 중복 허용 한도

/**
 * 게임 시작: 문제 풀 구성 → 첫 문제 로드
 */
export function startGame() {
  const pool = filterWords(state.settings);
  const needed = state.settings.questionCount;

  const questions = pickQuestions(pool, needed, state.lastGameWords);

  // 다음 게임 중복 제한을 위해 이번 회차 단어 기록
  state.lastGameWords = new Set(questions.map(q => q.word));

  resetGame();
  state.game.questions = questions;

  $('#total-num').textContent = questions.length;
  goTo('play-screen');
  loadQuestion();
}

/**
 * 풀에서 문제 선별 — 직전 게임과 중복을 최소화 (fresh 우선)
 * 풀이 충분하면 중복 ≤ 20%가 자연스럽게 성립.
 * 풀이 부족하면 기존 방식(풀 반복)으로 폴백.
 */
function pickQuestions(pool, needed, lastWords) {
  if (pool.length === 0) {
    // 필터 결과 0개 방어 - 전체 단어로 대체
    return shuffle(WORDS).slice(0, needed);
  }
  if (pool.length < needed) {
    // 풀이 needed보다 작음 → 반복해서 채우기 (중복 제한 불가)
    const filled = [];
    while (filled.length < needed) {
      filled.push(...shuffle(pool));
    }
    return filled.slice(0, needed);
  }

  const fresh   = pool.filter(w => !lastWords.has(w.word));
  const repeats = pool.filter(w =>  lastWords.has(w.word));

  if (fresh.length >= needed) {
    return shuffle(fresh).slice(0, needed);
  }

  // fresh 전부 + 모자란 만큼 repeats로 보충
  // fresh.length 가 needed*0.8 이상이면 중복 ≤ 20% 자동 달성
  const deficit = needed - fresh.length;
  return shuffle([
    ...fresh,
    ...shuffle(repeats).slice(0, deficit),
  ]);
}

/**
 * 현재 인덱스의 문제를 화면에 표시
 */
export function loadQuestion() {
  state.game.revealed = false;
  state.game.hintCount = 0;
  const q = state.game.questions[state.game.currentIdx];
  if (!q) {
    endGame();
    return;
  }

  $('#current-num').textContent = state.game.currentIdx + 1;
  $('#score').textContent = state.game.score;
  $('#category').textContent = q.category;

  renderVisual(q);

  // 초성 표시
  const wordEl = $('#word');
  wordEl.textContent = getChosung(q.word);
  wordEl.classList.remove('revealed');

  // TTS 버튼
  const ttsBtn = $('#tts-btn');
  ttsBtn.style.display = (TTS_AVAILABLE && state.settings.ttsEnabled) ? 'inline-block' : 'none';

  // 입력 모드 분기
  if (state.settings.inputMode) {
    $('#syllable-input-area').style.display = 'flex';
    $('#check-row').style.display = 'none';
    $('#result-row').style.display = 'none';
    renderSyllableMode(q.word);
  } else {
    $('#syllable-input-area').style.display = 'none';
    $('#check-row').style.display = 'flex';
    $('#result-row').style.display = 'none';
  }

  // 힌트 버튼
  $('#hint-btn-card').style.display = state.settings.hintEnabled ? 'block' : 'none';

  // 진행바
  const pct = (state.game.currentIdx / state.game.questions.length) * 100;
  $('#progress-fill').style.width = pct + '%';

  // 타이머
  if (state.settings.timerSeconds > 0) {
    startTimer(state.settings.timerSeconds, () => revealAnswer(true));
  } else {
    hideTimer();
  }
}

/**
 * 비주얼 영역 (이미지 또는 이모지)
 */
function renderVisual(q) {
  const visual = $('#visual-area');
  visual.innerHTML = '';

  if (state.settings.imageMode && q.imageUrl) {
    const img = document.createElement('img');
    img.className = 'image-display';
    img.src = q.imageUrl;
    img.alt = q.word;
    img.onerror = () => {
      // 이미지 로드 실패 시 이모지로 폴백
      visual.innerHTML = '';
      appendEmoji(visual, q.emoji);
    };
    visual.appendChild(img);
  } else {
    appendEmoji(visual, q.emoji);
  }
}

function appendEmoji(container, emoji) {
  const span = document.createElement('span');
  span.className = 'emoji-display';
  span.textContent = emoji;
  container.appendChild(span);
}

/**
 * 정답 공개
 * @param {boolean} timedOut - 타이머 초과로 공개된 경우 true
 */
export function revealAnswer(timedOut) {
  if (state.game.revealed) return;
  state.game.revealed = true;
  stopTimer();

  const q = state.game.questions[state.game.currentIdx];
  const wordEl = $('#word');
  wordEl.textContent = q.word;
  wordEl.classList.add('revealed');

  $('#check-row').style.display = 'none';
  $('#hint-btn-card').style.display = 'none';
  $('#syllable-input-area').style.display = 'none';

  if (timedOut) {
    // 시간 초과: 오답 처리 후 잠시 보여주고 자동 이동
    state.game.wrongAnswers.push({ ...q, reason: 'timeout' });
    playIncorrect();
    if (state.settings.ttsEnabled) speak(q.word);
    setTimeout(advance, TIMEOUT_REVEAL_DURATION);
  } else {
    $('#result-row').style.display = 'flex';
    if (state.settings.ttsEnabled) speak(q.word);
  }
}

/**
 * 다음 문제로 이동 (또는 종료)
 */
function advance() {
  state.game.currentIdx++;
  if (state.game.currentIdx >= state.game.questions.length) {
    endGame();
  } else {
    loadQuestion();
  }
}

/**
 * 사용자가 맞혔음/틀렸음 선택
 */
export function markAnswer(correct) {
  const q = state.game.questions[state.game.currentIdx];
  if (correct) {
    state.game.score++;
    $('#score').textContent = state.game.score;
    playCorrect();
  } else {
    state.game.wrongAnswers.push({ ...q, reason: 'wrong' });
    playIncorrect();
  }
  advance();
}

/**
 * 현재 문제 TTS 재생 (HTML onclick에서 호출)
 */
export function speakCurrent() {
  const q = state.game.questions[state.game.currentIdx];
  if (q) speak(q.word, $('#tts-btn'));
}

/**
 * 게임 중 중단 — 현재까지의 결과로 종료 화면 표시
 */
export function quitGame() {
  stopTimer();
  goTo('start-screen');
}

/**
 * 종료 화면
 */
export function endGame() {
  stopTimer();
  const total = state.game.questions.length;
  const score = state.game.score;
  const pct   = total > 0 ? score / total : 0;

  const { title, emojis } = getEndingMessage(pct);

  $('#end-title').textContent    = title;
  $('#celebrate').textContent    = emojis;
  $('#final-score').textContent  = score;
  $('#final-total').textContent  = total;
  $('#final-total2').textContent = total;
  $('#accuracy').textContent     = `정답률 ${Math.round(pct * 100)}%`;
  $('#progress-fill').style.width = '100%';

  renderReview();
  goTo('end-screen');
}

function getEndingMessage(pct) {
  if (pct === 1)       return { title: '완벽해요! 천재!', emojis: '🏆👑✨' };
  if (pct >= 0.7)      return { title: '정말 잘했어요!',  emojis: '🎉⭐🎊' };
  if (pct >= 0.4)      return { title: '잘했어요!',       emojis: '😊👍💫' };
  return                    { title: '다시 해볼까요?',   emojis: '💪🌱📚' };
}

function renderReview() {
  const reviewToggle = $('#review-toggle');
  const reviewList   = $('#review-list');
  const wrong = state.game.wrongAnswers;
  reviewList.classList.remove('open');
  reviewList.innerHTML = '';

  if (wrong.length === 0) {
    reviewToggle.style.display = 'none';
    return;
  }

  reviewToggle.style.display = 'inline-block';
  reviewToggle.textContent = `📝 틀린 문제 다시 보기 (${wrong.length}개) ▼`;

  wrong.forEach(w => {
    const item = document.createElement('div');
    item.className = 'review-item';
    const reason = w.reason === 'timeout' ? '⏱ 시간초과' : '❌ 오답';
    item.innerHTML = `
      <span class="review-emoji">${w.emoji}</span>
      <div class="review-word">${w.word}<small>${w.category} · ${reason}</small></div>
    `;
    if (TTS_AVAILABLE && state.settings.ttsEnabled) {
      const btn = document.createElement('button');
      btn.className = 'review-tts';
      btn.textContent = '🔊';
      btn.onclick = () => speak(w.word, btn);
      item.appendChild(btn);
    }
    reviewList.appendChild(item);
  });
}

export function toggleReview() {
  const list = $('#review-list');
  const btn  = $('#review-toggle');
  list.classList.toggle('open');
  const isOpen = list.classList.contains('open');
  btn.textContent = btn.textContent.replace(/[▼▲]/, isOpen ? '▲' : '▼');
}

/* =========================================================
 * 힌트
 * ========================================================= */

function buildHintWord(word, hintCount) {
  let display = '';
  let sylIdx = 0;
  for (const ch of word) {
    if (isHangulSyllable(ch)) {
      display += sylIdx < hintCount ? ch : getChosung(ch);
      sylIdx++;
    } else {
      display += ch;
    }
  }
  return display;
}

export function useHint() {
  if (state.game.revealed) return;
  const q = state.game.questions[state.game.currentIdx];
  if (!q) return;
  const syllables = extractSyllables(q.word);

  if (state.settings.inputMode) {
    const nextIdx = state.game.currentInput.length;
    if (nextIdx >= syllables.length) return;
    const targetCh = syllables[nextIdx];
    const poolBtns = [...$$('#syllable-pool .syllable-btn')];
    const btn = poolBtns.find(b => b.textContent === targetCh && !b.classList.contains('used'));
    if (!btn) return;
    btn.classList.add('used', 'hint-used');
    state.game.currentInput.push({ ch: targetCh, btn });
    updateSyllableSlots();
    if (state.game.currentInput.length === syllables.length) {
      setTimeout(checkSyllableInput, 300);
    }
  } else {
    state.game.hintCount = (state.game.hintCount || 0) + 1;
    if (state.game.hintCount >= syllables.length) {
      revealAnswer(false);
      return;
    }
    $('#word').textContent = buildHintWord(q.word, state.game.hintCount);
  }
}

/* =========================================================
 * 글자 선택 모드
 * ========================================================= */

function isHangulSyllable(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

function extractSyllables(word) {
  const result = [];
  for (const ch of word) {
    if (isHangulSyllable(ch)) result.push(ch);
  }
  return result;
}

let _allSyllablesCache = null;
function getAllSyllables() {
  if (_allSyllablesCache) return _allSyllablesCache;
  const set = new Set();
  WORDS.forEach(w => {
    for (const ch of w.word) {
      if (isHangulSyllable(ch)) set.add(ch);
    }
  });
  _allSyllablesCache = [...set];
  return _allSyllablesCache;
}

function buildSyllablePool(answerWord) {
  const answer = extractSyllables(answerWord);
  const answerSet = new Set(answer);
  const distractorPool = getAllSyllables().filter(s => !answerSet.has(s));
  const distractors = shuffle(distractorPool).slice(0, DISTRACTOR_COUNT);
  return shuffle([...answer, ...distractors]);
}

/**
 * 글자 선택 모드 UI 렌더링 (슬롯 + 글자 풀)
 */
function renderSyllableMode(word) {
  const target = extractSyllables(word);
  state.game.targetSyllables = target;
  state.game.currentInput = [];

  // 슬롯
  const slots = $('#syllable-slots');
  slots.innerHTML = '';
  for (let i = 0; i < target.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'syllable-slot';
    slots.appendChild(slot);
  }

  // 글자 풀
  const pool = $('#syllable-pool');
  pool.innerHTML = '';
  const syllables = buildSyllablePool(word);
  syllables.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'syllable-btn';
    btn.type = 'button';
    btn.textContent = s;
    btn.onclick = () => pressSyllable(s, btn);
    pool.appendChild(btn);
  });

  // 지우기 버튼
  const erase = $('#syllable-erase');
  erase.onclick = eraseSyllable;
  erase.disabled = true;
}

function updateSyllableSlots() {
  const slots = $$('#syllable-slots .syllable-slot');
  slots.forEach((slot, i) => {
    slot.classList.remove('filled', 'correct', 'wrong');
    const item = state.game.currentInput[i];
    slot.textContent = item ? item.ch : '';
    if (item) slot.classList.add('filled');
  });
  $('#syllable-erase').disabled = state.game.currentInput.length === 0;
}

function pressSyllable(ch, btnEl) {
  if (state.game.revealed) return;
  const target = state.game.targetSyllables;
  if (!target) return;
  if (state.game.currentInput.length >= target.length) return;
  if (btnEl.classList.contains('used')) return;

  btnEl.classList.add('used');
  state.game.currentInput.push({ ch, btn: btnEl });
  updateSyllableSlots();

  if (state.game.currentInput.length === target.length) {
    checkSyllableInput();
  }
}

function eraseSyllable() {
  if (state.game.revealed) return;
  const last = state.game.currentInput.pop();
  if (last) last.btn.classList.remove('used');
  updateSyllableSlots();
}

function checkSyllableInput() {
  const target = state.game.targetSyllables;
  const user = state.game.currentInput.map(x => x.ch);
  const correct = user.every((ch, i) => ch === target[i]);

  const slots = $$('#syllable-slots .syllable-slot');
  slots.forEach((slot, i) => {
    slot.classList.remove('filled');
    slot.classList.add(user[i] === target[i] ? 'correct' : 'wrong');
  });

  state.game.revealed = true;
  stopTimer();
  $('#hint-btn-card').style.display = 'none';

  const q = state.game.questions[state.game.currentIdx];
  const wordEl = $('#word');
  wordEl.textContent = q.word;
  wordEl.classList.add('revealed');

  if (correct) {
    state.game.score++;
    $('#score').textContent = state.game.score;
    playCorrect();
  } else {
    state.game.wrongAnswers.push({ ...q, reason: 'wrong' });
    playIncorrect();
  }

  if (state.settings.ttsEnabled) speak(q.word);
  setTimeout(advance, correct ? INPUT_CORRECT_DELAY : INPUT_WRONG_DELAY);
}
