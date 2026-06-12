/**
 * game.js — 게임 루프 핵심 (PLAN M2 / TRD §5)
 *
 * Lv.1 음절블록 탭 기반 완전 플레이 루프:
 * 문항 출제 → 한자 카드 렌더 + TTS → 활성 슬롯 도크 입력 →
 * 즉각 채점(slotPop/shake + 효과음) → 어원 팝업(논블로킹) →
 * 4슬롯 완성 → 다음 문항 → 10개 완료 시 세션 종료 콜백.
 *
 * Lv.2(자모 키패드)·Lv.3(자유 IME)·슬롯 독립 페이딩 진급은 M3 범위.
 */

import {
  SLOT_COUNT,
  IDIOM_COUNT,
  MIN_FADING_LEVEL,
  SHAKE_DURATION,
  POPUP_AUTO_CLOSE,
  IDIOM_COMPLETE_DELAY,
} from './config.js';
import { state, resetSession } from './state.js';
import { IDIOMS } from '../data/idioms.js';
import { shuffle, buildDockPool } from './utils.js';
import { markIdiomCompleted } from './storage.js';
import * as tts from './tts.js';
import * as sound from './sound.js';
import { el, updateProgress } from './ui.js';

/* ── 모듈 내부 상태 ─────────────────────────────── */

/** 세션 종료 시 호출되는 콜백 (main.js 가 주입 — end 화면 전환) */
let onSessionEnd = null;

/** 슬롯별 "첫 시도 정답" 여부 (result.totalCorrect 집계용) */
let slotFirstTry = new Array(SLOT_COUNT).fill(true);

/** 슬롯에 표시 중인 글자 ('' = 빈 슬롯) */
let slotText = new Array(SLOT_COUNT).fill('');

/** 오답 shake 동안 입력 잠금 */
let inputLocked = false;

/** 어원 팝업 자동 닫힘 타이머 */
let popupTimer = null;

/** 문항 전환 타이머 (홈 이탈 시 정리) */
let advanceTimer = null;

/* ── 초기화 / 세션 ──────────────────────────────── */

/**
 * 1회성 이벤트 바인딩 + 세션 종료 콜백 주입 (main.js 부트스트랩에서 호출).
 * @param {{ onSessionEnd?: () => void }} [opts]
 */
export function init({ onSessionEnd: cb } = {}) {
  onSessionEnd = cb || null;

  const ttsBtn = el('tts-btn');
  if (ttsBtn) ttsBtn.addEventListener('click', speakIdiom);

  const closeBtn = el('etymology-close');
  if (closeBtn) closeBtn.addEventListener('click', hideEtymologyPopup);
}

/**
 * 새 세션 시작: 10개 문항 순서 확정(셔플) + slotLevels 초기화 + 첫 문항 렌더.
 */
export function startSession() {
  resetSession();
  state.session.idioms = shuffle(IDIOMS).slice(0, IDIOM_COUNT);
  /** 사자성어 word → 해당 세션 도달 페이딩 레벨 (리더보드 LeaderboardEntry.idiomLevels) */
  state.session.idiomLevels = {};
  clearTimers();
  renderIdiom(0);
}

/** 현재 문항 항목 */
function currentIdiom() {
  return state.session.idioms[state.session.currentIdx];
}

/** 현재 활성 슬롯 인덱스 (좌→우 첫 미정답 슬롯). 전부 정답이면 null. */
function activeSlotIdx() {
  const idx = state.session.slotStates.findIndex((s) => s !== 'correct');
  return idx === -1 ? null : idx;
}

/** 진행 중 타이머 정리 (재시작·이탈 안전) */
function clearTimers() {
  if (advanceTimer) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }
  hideEtymologyPopup();
  inputLocked = false;
}

/* ── 렌더링 ─────────────────────────────────────── */

/**
 * 문항 렌더: 한자 카드(4글자 + 한글독음 + 의미) + 슬롯/도크 초기화 + TTS 자동 발화.
 * @param {number} idx 문항 인덱스 (0~9)
 */
export function renderIdiom(idx) {
  const session = state.session;
  session.currentIdx = idx;
  session.slotStates.fill('empty');
  session.slotLevels.fill(
    /* M2: Lv.1 도크만 구현 — 설정 레벨과 무관하게 Lv.1 로 동작 (Lv.2·3은 M3) */
    MIN_FADING_LEVEL
  );
  session.attempts = 0;
  session.wrongSlots = new Set();
  slotFirstTry = new Array(SLOT_COUNT).fill(true);
  slotText = new Array(SLOT_COUNT).fill('');
  inputLocked = false;
  hideEtymologyPopup();

  const idiom = session.idioms[idx];

  /* 한자 카드 */
  const hanjaRow = el('hanja-row');
  hanjaRow.textContent = '';
  idiom.hanja.forEach((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    hanjaRow.appendChild(span);
  });
  el('hanja-reading').textContent = idiom.word;
  el('hanja-meaning').textContent = idiom.meaning;

  /* 진행 표시 + 페이딩 배지 */
  updateProgress(idx + 1, IDIOM_COUNT);
  el('fading-badge').textContent = `Lv.${session.slotLevels[0]}`;

  el('slot-row').classList.remove('complete');
  renderSlots();
  renderLv1Dock(activeSlotIdx());

  /* TTS 자동 발화 — 사자성어 전체 */
  speakIdiom();
}

/**
 * 4×1 슬롯 상태 클래스 토글 (empty → correct / wrong) + 활성 슬롯 맥동.
 * DOM 재생성 없음 — 클래스·텍스트 토글만 (TRD §11).
 */
export function renderSlots() {
  const slots = el('slot-row').querySelectorAll('.slot');
  const active = activeSlotIdx();
  slots.forEach((slotEl, i) => {
    const st = state.session.slotStates[i];
    slotEl.classList.toggle('correct', st === 'correct');
    slotEl.classList.toggle('wrong', st === 'wrong');
    slotEl.classList.toggle('active', i === active && st !== 'correct');
    slotEl.textContent = slotText[i];

    const label =
      st === 'correct'
        ? `${i + 1}번 슬롯: 정답 ${slotText[i]}`
        : st === 'wrong'
          ? `${i + 1}번 슬롯: 오답 ${slotText[i]}`
          : `${i + 1}번 슬롯: 비어 있음`;
    slotEl.setAttribute('aria-label', label);
  });
}

/**
 * Lv.1 음절블록 도크 렌더: buildDockPool() → 8개 64dp `<button>` 그리드.
 * `<input>` 미사용 — IME 완전 회피 (TRD §5.1, §7.4).
 * @param {number|null} slotIdx 활성 슬롯 인덱스 (null 이면 도크 비움)
 */
export function renderLv1Dock(slotIdx) {
  const dock = el('lv1-dock');
  dock.textContent = '';
  if (slotIdx === null || slotIdx === undefined) return;

  const idiom = currentIdiom();
  const entry = idiom.syllables[slotIdx];

  /* 추가 샘플링 풀: 다른 슬롯의 distractors (TRD §9.1) */
  const otherPool = idiom.syllables
    .filter((_, i) => i !== slotIdx)
    .flatMap((se) => se.distractors);

  const pool = buildDockPool(entry, otherPool);

  dock.setAttribute('aria-label', `음절 블록 선택 — 힌트: ${idiom.hint}`);
  dock.title = idiom.hint;

  pool.forEach((syllable) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dock-block';
    btn.textContent = syllable;
    btn.addEventListener('click', () => selectSyllable(syllable, activeSlotIdx(), btn));
    dock.appendChild(btn);
  });
}

/* ── 채점 ───────────────────────────────────────── */

/**
 * 음절 채점 (Lv.1 도크 탭 진입점).
 * 정답: slotPop + playCorrect + 음절 TTS + 어원 팝업 → 다음 슬롯 도크 갱신.
 * 오답: shake + playWrong → 0.6초 후 슬롯 리셋 (재시도 허용).
 * @param {string} syllable 선택한 음절
 * @param {number|null} slotIdx 채점 대상 슬롯
 * @param {HTMLButtonElement} [btnEl] 탭한 도크 블록 (정답 시 used 처리)
 */
export function selectSyllable(syllable, slotIdx, btnEl) {
  if (inputLocked || slotIdx === null || slotIdx === undefined) return;

  const session = state.session;
  const result = state.result;
  const idiom = currentIdiom();
  const entry = idiom.syllables[slotIdx];

  session.attempts += 1;
  result.totalAttempts += 1;

  if (syllable === entry.syllable) {
    /* ── 정답 ── */
    session.slotStates[slotIdx] = 'correct';
    slotText[slotIdx] = syllable;
    if (slotFirstTry[slotIdx]) result.totalCorrect += 1;

    if (state.settings.soundEnabled) sound.playCorrect();
    if (btnEl) btnEl.classList.add('used');
    renderSlots();
    showEtymologyPopup(entry);

    if (activeSlotIdx() === null) {
      onIdiomComplete();
    } else {
      if (state.settings.ttsEnabled) tts.speak(entry.syllable);
      renderLv1Dock(activeSlotIdx());
    }
  } else {
    /* ── 오답 — 재시도 허용 ── */
    slotFirstTry[slotIdx] = false;
    session.wrongSlots.add(slotIdx);
    if (!result.wrongIdioms.includes(idiom.word)) result.wrongIdioms.push(idiom.word);

    session.slotStates[slotIdx] = 'wrong';
    slotText[slotIdx] = syllable;
    if (state.settings.soundEnabled) sound.playWrong();
    renderSlots();

    inputLocked = true;
    setTimeout(() => {
      inputLocked = false;
      if (state.session.slotStates[slotIdx] === 'wrong') {
        state.session.slotStates[slotIdx] = 'empty';
        slotText[slotIdx] = '';
      }
      renderSlots();
    }, SHAKE_DURATION);
  }
}

/* ── 어원 팝업 ──────────────────────────────────── */

/**
 * 어원 팝업 표시 — 한자 + 음·뜻 + 어원 일화. 논블로킹(.modal 재사용,
 * 오버레이 pointer-events 차단 없음). 2초 자동 닫힘 + 수동 닫기.
 * @param {import('../data/idioms.js').SyllableEntry} entry
 */
export function showEtymologyPopup(entry) {
  el('etymology-hanja').textContent = entry.hanjaChar;
  el('etymology-sound-meaning').textContent = `${entry.hanjaSound} · ${entry.hanjaMeaning}`;
  el('etymology-story').textContent = currentIdiom().contextStory;

  const popup = el('etymology-popup');
  popup.hidden = false;

  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(hideEtymologyPopup, POPUP_AUTO_CLOSE);
}

/** 어원 팝업 닫기 (자동·수동 공용) */
export function hideEtymologyPopup() {
  if (popupTimer) {
    clearTimeout(popupTimer);
    popupTimer = null;
  }
  const popup = el('etymology-popup');
  if (popup) popup.hidden = true;
}

/* ── 문항 완성 / 세션 종료 ──────────────────────── */

/**
 * 4슬롯 전체 정답: 전체 팝 애니메이션 + 사자성어 TTS 발화 +
 * 0.8초 후 다음 문항 또는 완료 화면 전환.
 */
export function onIdiomComplete() {
  const session = state.session;
  const idiom = currentIdiom();
  const idiomLevel = Math.max(...session.slotLevels);

  session.idiomLevels[idiom.word] = idiomLevel;
  state.result.levelReached = Math.max(state.result.levelReached, idiomLevel);
  markIdiomCompleted(idiom.word); // S12 공유 스키마 (11ist_completedIdioms)

  el('slot-row').classList.add('complete');
  renderLv1Dock(null);
  if (state.settings.ttsEnabled) tts.speak(idiom.word);

  advanceTimer = setTimeout(() => {
    advanceTimer = null;
    el('slot-row').classList.remove('complete');
    const next = session.currentIdx + 1;
    if (next < session.idioms.length) {
      renderIdiom(next);
    } else {
      hideEtymologyPopup();
      if (onSessionEnd) onSessionEnd();
    }
  }, IDIOM_COMPLETE_DELAY);
}

/* ── TTS 버튼 ───────────────────────────────────── */

/** 사자성어 전체 발화 + TTS 버튼 speaking 애니메이션 토글 */
function speakIdiom() {
  if (!state.settings.ttsEnabled || !tts.isSupported()) return;
  const idiom = currentIdiom();
  if (!idiom) return;

  const utt = tts.speak(idiom.word);
  const btn = el('tts-btn');
  if (!utt || !btn) return;

  btn.classList.add('speaking');
  btn.setAttribute('aria-pressed', 'true');
  const done = () => {
    btn.classList.remove('speaking');
    btn.setAttribute('aria-pressed', 'false');
  };
  utt.onend = done;
  utt.onerror = done;
}
