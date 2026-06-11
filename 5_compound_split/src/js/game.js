/**
 * 게임 로직 — 출제·탭 검출·피드백·종료 (TRD §5, PLAN M2·M3)
 * 핵심 루프: 카드 표시 → 탭/드래그 히트 검출 → 정답 팝업·오답 피드백 → 다음 카드 → 완료 화면.
 * 2모드 페이딩 — 연습하기(2): 점선 경계+첫 조각 그림 / 도전하기(3): 단서 없음.
 * 경계 가시성·단서량만 모드별 분기, 입력·화면·어휘는 모드 간 불변 (TRD §5.3).
 */

import { state, resetGame, startSession, WORDS } from './state.js';
import { shuffle } from './utils.js';
import { speak, cancelSpeech } from './tts.js';
import { playCorrect, playError } from './sound.js';
import { goTo, closePopups } from './ui.js';
import { saveSettings, saveLeaderboardRecord, updateProgress } from './storage.js';
import {
  TAP_TOLERANCE_PX,
  TAP_MOVE_THRESHOLD_PX,
  ERROR_MESSAGE_MS,
  AUTO_ADVANCE_STREAK,
  FADING_LEVEL_LABELS,
} from './config.js';

/** 오답 피드백 문구 (TRD §5.2 — G3: "뜻 있는 최소 단위" 직관) */
const ERROR_MESSAGE_TEXT = '그 조각은 뜻이 없네';

// ── 모듈 내부 상태 ──────────────────────────────────────────
let timers = [];          // 진행 중인 setTimeout 핸들 (카드 전환·화면 이탈 시 일괄 해제)
let errorTimer = null;    // 오류 메시지 자동 숨김 타이머
let popupOpenedAt = 0;    // 팝업 오픈 타임스탬프 (체류 시간 측정, TRD §5.4)
let levelUpNotice = 0;    // 자동 승급 직후 안내할 새 모드 값 (0 = 없음, R2 플래그 ON일 때만 설정됨)

/** 게임 화면이 활성 상태일 때만 콜백 실행하는 지연 타이머 (화면 이탈 시 부작용 차단) */
function addTimer(fn, ms) {
  timers.push(setTimeout(() => {
    const gs = document.getElementById('game-screen');
    if (gs && gs.classList.contains('active')) fn();
  }, ms));
}

function clearTimers() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
}

/** 현재 카드의 단어 */
function currentWord() {
  return state.game.queue[state.game.currentIdx];
}

// ── 출제 큐 구성 (TRD §5.5) ─────────────────────────────────
/**
 * 셔플 + 반복 채움 — questionCount가 풀 크기(6)보다 크면 셔플 풀을 반복 이어붙인다.
 * @param {import('../data/words.js').CompoundWord[]} words
 * @param {number} questionCount
 */
export function buildQueue(words, questionCount) {
  const pool = shuffle([...words]);
  if (questionCount <= pool.length) {
    return pool.slice(0, questionCount);
  }
  const filled = [];
  while (filled.length < questionCount) {
    filled.push(...shuffle([...words]));
  }
  return filled.slice(0, questionCount);
}

// ── 게임 시작 ───────────────────────────────────────────────
/** 게임 시작 — 시작 화면·완료 화면 "다시 하기"에서 호출 (HTML onclick) */
export function startGame() {
  clearTimers();
  resetGame();
  startSession();
  state.game.queue = buildQueue(WORDS, state.settings.questionCount);
  goTo('game-screen');
  renderCard();
}

// ── 카드 렌더링 (TRD §5.3 — 2모드 페이딩) ───────────────────
/** 모드 → 경계 가시성 클래스 (연습하기 점선 / 도전하기 선 없음) */
const BOUNDARY_CLASS = {
  2: 'boundary-dashed',
  3: 'boundary-hidden',
};

/**
 * 카드 렌더링 — .compound-card 생성, 합성어 텍스트(R7: '빗방울' 전체 표기),
 * 진행 N/M 표시, TTS 자동 재생.
 * 카드 텍스트는 표면형 기준으로 두 span으로 나눠 렌더링한다:
 *   splitIndex = word.length - part2.length  (예: 빗방울 → '빗' + '방울')
 * 두 span 사이의 .card-boundary가 형태소 경계 — 모드별 가시성 (TRD §5.3):
 *   연습하기(2) 점선 + 첫 조각 그림만 / 도전하기(3) 선·단서 없음.
 * 입력 방식·화면 구성·어휘는 모드 간 불변.
 * @param {import('../data/words.js').CompoundWord} [word] 기본값: 현재 큐 카드
 * @param {2|3} [fadingLevel] 기본값: state.settings.fadingLevel
 */
export function renderCard(word = currentWord(), fadingLevel = state.settings.fadingLevel) {
  clearTimers();
  hideErrorMessage();

  const { currentIdx, queue } = state.game;

  // 진행 인디케이터 N / M
  const indicator = document.getElementById('progress-indicator');
  if (indicator) indicator.textContent = `${currentIdx + 1} / ${queue.length}`;

  const feedback = document.getElementById('game-feedback');
  if (feedback) feedback.textContent = '';

  const area = document.getElementById('card-area');
  if (!area) return;
  area.innerHTML = '';

  // 합성어 카드 — 모드별 경계 가시성 클래스 (TRD §5.3)
  const card = document.createElement('div');
  card.className = `compound-card ${BOUNDARY_CLASS[fadingLevel] || BOUNDARY_CLASS[2]}`;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${word.word} — 경계를 탭해서 두 조각으로 나눠요`);

  const splitIndex = word.word.length - word.part2.length;

  const scene = document.createElement('span');
  scene.className = 'card-scene-emoji';
  scene.textContent = word.sceneEmoji;
  scene.setAttribute('aria-hidden', 'true');

  const part1Span = document.createElement('span');
  part1Span.className = 'card-part card-part1';
  part1Span.textContent = word.word.slice(0, splitIndex); // 표면형 (예: '빗')

  const boundary = document.createElement('span');
  boundary.className = 'card-boundary';
  boundary.setAttribute('aria-hidden', 'true');

  const part2Span = document.createElement('span');
  part2Span.className = 'card-part card-part2';
  part2Span.textContent = word.word.slice(splitIndex);

  card.append(scene, part1Span, boundary, part2Span);
  attachCardEvents(card);
  area.appendChild(card);

  // 단서량 — 연습하기 첫 조각 그림만 / 도전하기 단서 없음(뜻은 정답 후 팝업에서만 공개)
  const hintRow = buildHintRow(word, fadingLevel);
  if (hintRow) area.appendChild(hintRow);

  // 자동 승급 직후 첫 카드 — 새 모드 안내 (R2 플래그 ON일 때만 발생)
  if (levelUpNotice && feedback) {
    feedback.textContent = `이제 ${FADING_LEVEL_LABELS[levelUpNotice] || '도전하기'}! 혼자 힘으로 도전해 봐요!`;
    levelUpNotice = 0;
  }

  // TTS 자동 재생 — 합성어 전체
  cancelSpeech();
  speak(word.word);
}

/**
 * 단서 행 — 모드별 단서량 (TRD §5.3)
 * 연습하기(2): 첫 번째 조각 그림만 — 뜻 라벨 없음 (showPart1HintOnly)
 * 도전하기(3): 단서 없음 → null 반환 (hideAllHints — 뜻은 정답 후 팝업에서만 공개)
 * @returns {HTMLElement|null}
 */
function buildHintRow(word, fadingLevel) {
  if (fadingLevel >= 3) return null; // 도전하기: 그림 단서 없음

  const row = document.createElement('div');
  row.className = 'hint-row';
  const el = document.createElement('div');
  el.className = 'hint-piece';
  const emoji = document.createElement('span');
  emoji.className = 'hint-emoji';
  emoji.appendChild(pieceVisual(word.part1ImageUrl, word.part1Emoji));
  el.appendChild(emoji);
  row.appendChild(el);
  return row;
}

/** 조각 그림 — ImageUrl 우선, 로드 실패·미제공 시 이모지 폴백 (TRD §10) */
function pieceVisual(imageUrl, emoji) {
  if (!imageUrl) return document.createTextNode(emoji);
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = '';
  img.onerror = () => img.replaceWith(document.createTextNode(emoji));
  return img;
}

// ── 입력 처리 — 탭/드래그 (TRD §6.2) ────────────────────────
/**
 * touchstart→touchend 이동 거리 < 10px → 탭.
 * ≥ 10px + 수평 방향 → 드래그로 간주, 끝 지점에 동일 히트 검출.
 * 수직 방향 → preventDefault 미호출(기본 스크롤 허용).
 * mouse 이벤트도 동일 로직 (데스크톱 테스트 지원).
 */
function attachCardEvents(card) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  card.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.hypot(dx, dy) < TAP_MOVE_THRESHOLD_PX || Math.abs(dx) >= Math.abs(dy)) {
      e.preventDefault(); // 합성 mouse 이벤트 중복 발화 방지
      onCardTap(t.clientX, t.clientY, card);
    }
    // 수직 스와이프 → 스크롤 허용 (preventDefault 미호출)
  }, { passive: false });

  card.addEventListener('mousedown', e => {
    tracking = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  card.addEventListener('mouseup', e => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) < TAP_MOVE_THRESHOLD_PX || Math.abs(dx) >= Math.abs(dy)) {
      onCardTap(e.clientX, e.clientY, card);
    }
  });
}

/**
 * 탭 히트 검출 — 올바른 분절 판정 (TRD §5.1)
 * splitBoundaryOffset은 part1 표면형 span의 실측 폭(글자 수 비례)으로 계산:
 *   boundaryX = part1 span의 오른쪽 가장자리 (탭 시점 실측 — 리사이즈에도 안전)
 * |tapX - boundaryX| <= 28px(56dp 터치 타겟의 절반) → 정답 분절.
 */
export function onCardTap(tapX, tapY, card) {
  if (state.game.popupOpen || card.classList.contains('split')) return;

  const part1Span = card.querySelector('.card-part1');
  if (!part1Span) return;
  const boundaryX = part1Span.getBoundingClientRect().right;

  if (Math.abs(tapX - boundaryX) <= TAP_TOLERANCE_PX) {
    triggerCorrectSplit(card);
  } else if (tapX < boundaryX - TAP_TOLERANCE_PX) {
    tryWrongSplit('left-only', card);  // 잘못된 왼쪽 분절 (예: 빗방+울의 왼쪽 과소 분절)
  } else {
    tryWrongSplit('right-only', card); // 잘못된 오른쪽 분절
  }
}

// ── 정답 처리 (TRD §5.4) ────────────────────────────────────
/**
 * 카드 분리 애니메이션(transform only, < 100ms 시작) + 효과음 +
 * TTS 시퀀스(전체 → 0.5s 후 part1 → 0.5s 후 part2) + 팝업 표시.
 */
function triggerCorrectSplit(card) {
  const word = currentWord();
  state.game.correctCount++;
  state.game.streak++;
  state.game.bestStreak = Math.max(state.game.bestStreak, state.game.streak); // 진척 기록용 (M4)
  maybeAutoAdvance(); // R2: AUTO_ADVANCE_STREAK 플래그 ON일 때만 동작 (기본 OFF=수동)

  card.classList.add('split'); // CSS transform 분리 애니메이션 즉시 시작
  playCorrect();

  const feedback = document.getElementById('game-feedback');
  if (feedback) feedback.textContent = `정답! ${word.part1} 더하기 ${word.part2}`;

  // TTS 시퀀스 — R7: 빗방울 조각1은 기저형 '비' 발음 우선
  cancelSpeech();
  speak(word.word);
  addTimer(() => speak(word.part1), 500);
  addTimer(() => speak(word.part2), 1000);

  // 분리 애니메이션이 보인 뒤 팝업 오픈
  addTimer(() => showSplitPopup(word), 450);
}

/**
 * 자동 승급 (PLAN R2 조치) — 연습하기(2) → 도전하기(3) 단 한 번만 가능.
 * config.js AUTO_ADVANCE_STREAK가 0(기본 OFF)이면 아무것도 하지 않는다 — 수동 선택만.
 * 플래그 ON(> 0)이고 연속 정답이 기준에 도달하면 도전하기로 승급하고
 * 설정을 영속화한 뒤, 시작/설정 화면 모드 칩을 동기화한다.
 * 새 모드는 다음 카드 렌더링부터 반영된다 (입력·화면·어휘는 불변, 단서량만 감소).
 */
function maybeAutoAdvance() {
  if (AUTO_ADVANCE_STREAK <= 0) return;                       // 플래그 OFF — 수동 선택 (기본)
  if (state.game.streak < AUTO_ADVANCE_STREAK) return;
  if (state.settings.fadingLevel >= 3) return;                // 도전하기(3)가 최고 — 2→3만 가능

  state.settings.fadingLevel = 3;                             // 연습하기 → 도전하기
  state.game.streak = 0;
  saveSettings();                                             // fadingLevel 영속화
  levelUpNotice = state.settings.fadingLevel;                 // 다음 카드에서 안내

  // 시작/설정 화면 레벨 칩 동기화 (settings.js syncFadingChips와 동일 규칙)
  document.querySelectorAll('[data-fading]').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.fading) === state.settings.fadingLevel);
  });
}

/** 팝업 내 조각1 표기 — R7: 표면형이 다르면 '비(빗)' 병기 */
function part1Display(word) {
  return word.part1Surface && word.part1Surface !== word.part1
    ? `${word.part1}(${word.part1Surface})`
    : word.part1;
}

/**
 * 조각 팝업 — role="dialog" 오버레이, 조각 그림 2장 + 뜻 라벨 + "다음" 버튼.
 * 오버레이 탭 또는 "다음" 버튼 탭으로 닫힘. 오픈 타임스탬프 기록(체류 시간 측정).
 * 콘텐츠는 정적 words.js 데이터만 사용 — innerHTML 허용 (TRD §11).
 */
function showSplitPopup(word) {
  closePopups(); // 중복 방지

  const popup = document.createElement('div');
  popup.className = 'split-popup modal-overlay';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-label', `${word.word} 조각 그림`);
  popup.setAttribute('onclick', 'closeSplitPopup()');

  const pieceHtml = (visual, wordText, meaning, idx) => `
    <div class="popup-piece" onclick="event.stopPropagation(); speakPiece(${idx})"
         role="button" aria-label="${wordText} — ${meaning} 듣기">
      <span class="piece-emoji" aria-hidden="true">${visual}</span>
      <span class="piece-word">${wordText}</span>
      <span class="piece-meaning">${meaning}</span>
    </div>`;

  popup.innerHTML = `
    <div class="split-popup-card">
      <h3 class="split-popup-title">'${word.word}'은(는) 두 조각!</h3>
      <div class="popup-pieces">
        ${pieceHtml(word.part1Emoji, part1Display(word), word.part1Meaning, 1)}
        <span class="piece-plus" aria-hidden="true">+</span>
        ${pieceHtml(word.part2Emoji, word.part2, word.part2Meaning, 2)}
      </div>
      <button class="btn big" onclick="event.stopPropagation(); closeSplitPopup()">다음 ➜</button>
    </div>`;

  document.body.appendChild(popup);
  state.game.popupOpen = true;
  popupOpenedAt = Date.now(); // 체류 시간 측정 시작 (TRD §5.4)
}

/** 팝업 닫기 — 체류 시간 누산 → 다음 카드 또는 완료 화면 (HTML onclick) */
export function closeSplitPopup() {
  if (!state.game.popupOpen) return;
  state.game.popupDwellMs += Date.now() - popupOpenedAt;
  closePopups();

  state.game.currentIdx++;
  if (state.game.currentIdx >= state.game.queue.length) {
    finishGame();
  } else {
    renderCard();
  }
}

/** 팝업 조각 TTS 재청취 (HTML onclick) — PRD §6.2: 조각 카드 TTS 버튼 */
export function speakPiece(which) {
  const word = currentWord();
  if (!word) return;
  cancelSpeech();
  speak(which === 1 ? word.part1 : word.part2);
}

// ── 오답 처리 (TRD §5.2) ────────────────────────────────────
/**
 * 오류 카운트++ → 흔들림(.shake, transform only — 키프레임 종료 시 원위치 자동 복귀)
 * → "그 조각은 뜻이 없네" 1500ms 표시 → 오류 톤.
 * @param {'left-only'|'right-only'} part 잘못 분절된 쪽 (지표 수집용)
 */
function tryWrongSplit(part, card) {
  state.game.errorCount++;
  state.game.streak = 0; // 연속 정답 끊김 (자동 승급 판정용, R2)
  playError();

  // 흔들림 재생 — 연타 시 리스타트를 위해 클래스 제거 후 reflow
  card.classList.remove('shake');
  void card.offsetWidth;
  card.classList.add('shake');

  const msg = document.getElementById('error-message');
  if (msg) {
    msg.textContent = ERROR_MESSAGE_TEXT;
    msg.classList.add('show');
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => msg.classList.remove('show'), ERROR_MESSAGE_MS);
  }
}

function hideErrorMessage() {
  clearTimeout(errorTimer);
  const msg = document.getElementById('error-message');
  if (msg) msg.classList.remove('show');
}

// ── 완료 흐름 ───────────────────────────────────────────────
/** 전체 큐 소진 → 완료 화면: 정답 수·오류 수·소요 시간·격려 메시지 + 기록 영속화 (M4) */
function finishGame() {
  clearTimers();
  state.session.completedAt = Date.now();

  const { correctCount, errorCount, queue } = state.game;
  const durationMs = state.session.completedAt - state.session.startedAt;

  // 리더보드 기록 저장 — 최대 20건, 초과 시 오래된 것 삭제 (TRD §3.3)
  saveLeaderboardRecord({
    ts: state.session.completedAt,
    fadingLevel: state.settings.fadingLevel,
    questionCount: queue.length,
    correctCount,
    errorCount,
    durationMs,
  });
  // 진척 갱신 — 페이딩 레벨별 최고 연속 정답 수·완료 횟수 (TRD §3.3)
  updateProgress(state.settings.fadingLevel, state.game.bestStreak);

  setText('end-correct', correctCount);
  setText('end-total', queue.length);
  setText('end-errors', errorCount);
  setText('end-duration', formatDuration(durationMs));
  setText('end-feedback', encouragement(errorCount));

  goTo('end-screen');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function formatDuration(ms) {
  const totalSec = Math.max(1, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

/** 격려 메시지 — 오류 수 기반 (항상 긍정 톤, 만 6~7세 대상) */
function encouragement(errorCount) {
  if (errorCount === 0) return '한 번도 안 틀리고 다 쪼갰어요! 정말 대단해요! 🌟';
  if (errorCount <= 2) return '낱말 조각을 잘 찾았어요! 멋져요! 👏';
  return '조각을 찾는 힘이 쑥쑥 자라고 있어요! 💪';
}
