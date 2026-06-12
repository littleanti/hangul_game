/**
 * game.js — 게임 루프 핵심 (PLAN M2 / TRD §5)
 *
 * 게임 플레이 루프:
 * 문항 출제 → 한자 카드 렌더 + TTS → 활성 슬롯 레벨별 입력 UI →
 * 즉각 채점(slotPop/shake + 효과음) → 어원 팝업(논블로킹) →
 * 4슬롯 완성 → 다음 문항 → 10개 완료 시 세션 종료 콜백.
 *
 * M3 — 3단 페이딩 (TRD §5.1 / §9.2):
 * - Lv.1 음절블록 도크 탭 (IME 완전 회피)
 * - Lv.2 초성 힌트 + 자모 키패드 조립 (QWERTY 계열 임시 배열 — PLAN R2, IME 비노출)
 * - Lv.3 자유 IME `<input maxlength=1>` — 완성형 한글(U+AC00~D7A3)만 채점
 * - 슬롯 독립 페이딩: 오답 슬롯만 Lv.1 재강화 (onSlotWrong), 나머지 레벨 유지
 * - 자동 진급: autoFade ON + 레벨 고정 OFF + 문항 오답 0 → fadingLevel +1 (최대 3)
 */

import {
  SLOT_COUNT,
  IDIOM_COUNT,
  MIN_FADING_LEVEL,
  MAX_FADING_LEVEL,
  SHAKE_DURATION,
  POPUP_AUTO_CLOSE,
  IDIOM_COMPLETE_DELAY,
} from './config.js';
import { state, resetSession } from './state.js';
import { IDIOMS } from '../data/idioms.js';
import {
  shuffle,
  buildDockPool,
  getChosung,
  assembleSyllable,
  isCompleteHangul,
  CHOSUNG,
  JUNGSUNG,
  JONGSUNG,
} from './utils.js';
import * as storage from './storage.js';
import * as tts from './tts.js';
import * as sound from './sound.js';
import { el, updateProgress, showToast } from './ui.js';

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

/* ── Lv.2 자모 조합 상태 ────────────────────────── */

/** QWERTY(두벌식) 계열 임시 배열 (PLAN R2 — 천지인 채택 여부는 사용자 테스트 후 결정) */
const JAMO_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '⌫', '✓'],
];

/** 복합 모음 조합 테이블 (예: ㅜ+ㅣ→ㅟ '취', ㅜ+ㅓ→ㅝ '월') */
const JUNG_COMBINE = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};

/** 현재 조합 중인 자모 인덱스 (-1 = 미입력, jong 0 = 받침 없음) */
let compose = { cho: -1, jung: -1, jong: 0 };

function resetCompose() {
  compose = { cho: -1, jung: -1, jong: 0 };
}

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

  /* Lv.3 자유 IME 입력 (정적 input — 1회만 바인딩) */
  const lv3Input = el('lv3-input');
  if (lv3Input) {
    lv3Input.addEventListener('input', onLv3Input);
    lv3Input.addEventListener('compositionend', commitLv3);
    lv3Input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commitLv3();
    });
  }
  const lv3Confirm = el('lv3-confirm');
  if (lv3Confirm) lv3Confirm.addEventListener('click', commitLv3);
}

/** state.settings.fadingLevel 을 1~3 범위로 보정해 반환 */
function settingsLevel() {
  const lv = Number(state.settings.fadingLevel) || MIN_FADING_LEVEL;
  return Math.min(MAX_FADING_LEVEL, Math.max(MIN_FADING_LEVEL, lv));
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
  /* 문항 시작 레벨 = 설정 레벨. 오답 슬롯은 onSlotWrong() 으로 해당 슬롯만 Lv.1 재강화 */
  session.slotLevels.fill(settingsLevel());
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

  /* 진행 표시 (페이딩 배지는 renderActiveInput 이 활성 슬롯 레벨로 갱신) */
  updateProgress(idx + 1, IDIOM_COUNT);

  el('slot-row').classList.remove('complete');
  renderSlots();
  renderActiveInput();

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

/* ── 입력 UI 디스패치 (슬롯 독립 페이딩 — PLAN M3) ── */

/** 모든 입력 UI 숨김 (문항 완성·세션 종료 시) */
function hideAllInputs() {
  ['lv1-dock', 'lv2-pad', 'lv3-area'].forEach((id) => {
    const node = el(id);
    if (node) node.hidden = true;
  });
}

/**
 * 활성 슬롯의 페이딩 레벨에 맞는 입력 UI 렌더 + 전환.
 * 슬롯마다 레벨이 다를 수 있으므로(오답 Lv.1 재강화) 슬롯 활성화 시마다 호출한다.
 */
export function renderActiveInput() {
  const slotIdx = activeSlotIdx();
  if (slotIdx === null) {
    hideAllInputs();
    return;
  }
  const level = state.session.slotLevels[slotIdx];
  el('fading-badge').textContent = `Lv.${level}`;
  el('lv1-dock').hidden = level !== MIN_FADING_LEVEL;
  el('lv2-pad').hidden = level !== 2;
  el('lv3-area').hidden = level !== MAX_FADING_LEVEL;
  if (level === MIN_FADING_LEVEL) renderLv1Dock(slotIdx);
  else if (level === 2) renderLv2Pad(slotIdx);
  else renderLv3Input(slotIdx);
}

/* ── Lv.2 초성힌트 + 자모 키패드 (IME 비노출) ────── */

/**
 * Lv.2 키패드 렌더: 초성 힌트 배지 + 자모 `<button>` 그리드(48dp) + 조립 미리보기.
 * `<input>` 미사용 — 소프트 키보드(IME) 비노출 (TRD §5.1, §7.4).
 * @param {number} slotIdx 활성 슬롯 인덱스
 */
export function renderLv2Pad(slotIdx) {
  resetCompose();
  const entry = currentIdiom().syllables[slotIdx];
  el('chosung-hint').textContent = `초성 힌트: ${getChosung(entry.syllable)}`;

  const grid = el('jamo-grid');
  grid.textContent = '';
  JAMO_ROWS.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'jamo-row';
    row.forEach((jamo) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jamo-key';
      btn.textContent = jamo;
      if (jamo === '⌫') {
        btn.classList.add('fn');
        btn.setAttribute('aria-label', '지우기');
      } else if (jamo === '✓') {
        btn.classList.add('fn', 'ok');
        btn.setAttribute('aria-label', '입력 확정');
      }
      btn.addEventListener('click', () => onJamoTap(jamo));
      rowEl.appendChild(btn);
    });
    grid.appendChild(rowEl);
  });

  updateLv2Preview(slotIdx);
}

/** 현재 조합 중인 글자 (모음 미입력 시 초성 자모 단독) */
function composePreviewChar() {
  if (compose.cho === -1) return '';
  if (compose.jung === -1) return CHOSUNG[compose.cho];
  return assembleSyllable(compose.cho, compose.jung, compose.jong);
}

/** 조립 미리보기 실시간 반영 — 미리보기 박스 + 활성 슬롯 동시 표시 (TRD §5.1) */
function updateLv2Preview(slotIdx) {
  const ch = composePreviewChar();
  el('lv2-preview').textContent = ch;
  if (slotIdx !== null && state.session.slotStates[slotIdx] !== 'correct') {
    slotText[slotIdx] = ch;
    renderSlots();
  }
}

/**
 * 자모 키 탭 → 내부 조합기 갱신.
 * 확정 시점 (TRD §5.1): ✓ 키 / 종성 보유 상태(또는 종성 불가 자음)에서 다음 초성 탭.
 * @param {string} jamo 탭한 자모 ('⌫' = 지우기, '✓' = 확정)
 */
function onJamoTap(jamo) {
  const slotIdx = activeSlotIdx();
  if (inputLocked || slotIdx === null) return;

  if (jamo === '⌫') {
    if (compose.jong > 0) compose.jong = 0;
    else if (compose.jung !== -1) compose.jung = -1;
    else compose.cho = -1;
    updateLv2Preview(slotIdx);
    return;
  }
  if (jamo === '✓') {
    commitCompose(slotIdx);
    return;
  }

  const choIdx = CHOSUNG.indexOf(jamo);
  const jungIdx = JUNGSUNG.indexOf(jamo);

  if (jungIdx !== -1) {
    /* 모음 */
    if (compose.cho === -1) {
      showToast('자음(초성)부터 눌러 주세요');
      return;
    }
    if (compose.jung === -1) {
      compose.jung = jungIdx;
    } else if (compose.jong === 0) {
      /* 복합 모음 시도 (ㅜ+ㅣ→ㅟ 등) — 조합 불가면 교체 */
      const combined = JUNG_COMBINE[JUNGSUNG[compose.jung] + jamo];
      compose.jung = combined ? JUNGSUNG.indexOf(combined) : jungIdx;
    }
    /* 종성 보유 상태의 모음은 무시 — 슬롯당 1음절이라 도깨비불(연음) 없음 */
  } else if (choIdx !== -1) {
    /* 자음 */
    if (compose.cho === -1 || compose.jung === -1) {
      compose.cho = choIdx; /* 초성 입력(모음 전 재탭은 교체) */
    } else {
      const jongIdx = JONGSUNG.indexOf(jamo);
      if (compose.jong === 0 && jongIdx > 0) {
        compose.jong = jongIdx; /* 종성 입력 */
      } else {
        /* 종성 완료 후 다음 초성 탭 → 현재 조합 확정 채점 */
        commitCompose(slotIdx);
        return;
      }
    }
  }
  updateLv2Preview(slotIdx);
}

/** 조합 확정 → 채점. 미완성(초성/모음 누락) 조합은 안내 토스트 */
function commitCompose(slotIdx) {
  if (compose.cho === -1 || compose.jung === -1) {
    showToast('자음과 모음을 모아 글자를 만들어 주세요');
    return;
  }
  const syllable = assembleSyllable(compose.cho, compose.jung, compose.jong);
  resetCompose();
  el('lv2-preview').textContent = '';
  gradeSyllable(syllable, slotIdx);
}

/* ── Lv.3 자유 IME 입력 ─────────────────────────── */

/**
 * Lv.3 입력 렌더: `<input type="text" inputmode="text" maxlength="1">` 포커스.
 * autocomplete/autocorrect/autocapitalize/spellcheck 속성은 index.html 정적 마크업에 설정.
 * @param {number} slotIdx 활성 슬롯 인덱스 (포커스만 — 슬롯 표시는 renderSlots 가 담당)
 */
export function renderLv3Input(slotIdx) { // eslint-disable-line no-unused-vars
  const input = el('lv3-input');
  if (!input) return;
  input.value = '';
  /* 포커스 → 소프트 키보드(IME) 노출 — Lv.3 만 허용 (TRD §7.4) */
  try {
    input.focus({ preventScroll: true });
  } catch (e) {
    input.focus();
  }
}

/** Lv.3 입력값의 마지막 글자 */
function lv3Value() {
  const input = el('lv3-input');
  const v = input ? (input.value || '').trim() : '';
  return v ? v.charAt(v.length - 1) : '';
}

/** Lv.3 확정 채점 — isCompleteHangul 통과 시만 (자모 단독·비한글 거부, TRD §5.1 commitChar) */
function commitLv3() {
  const ch = lv3Value();
  if (!isCompleteHangul(ch)) return;
  const slotIdx = activeSlotIdx();
  if (inputLocked || slotIdx === null) return;
  if (state.session.slotLevels[slotIdx] !== MAX_FADING_LEVEL) return;
  el('lv3-input').value = '';
  gradeSyllable(ch, slotIdx);
}

/**
 * Lv.3 input 이벤트: 비한글 문자 즉시 제거, IME 조합 중('이'→'일' 진행)은
 * 오채점 방지를 위해 보류 — compositionend / Enter / 입력 버튼에서 확정.
 * @param {InputEvent} e
 */
function onLv3Input(e) {
  const ch = lv3Value();
  if (!ch) return;
  if (!isCompleteHangul(ch) && !/[ㄱ-ㅎㅏ-ㅣ]/.test(ch)) {
    el('lv3-input').value = ''; /* 영문·숫자 등 비한글 거부 */
    return;
  }
  if (e.isComposing) return;
  commitLv3();
}

/* ── 채점 ───────────────────────────────────────── */

/**
 * 음절 채점 — Lv.1 도크 탭 진입점 (Lv.2·3 은 gradeSyllable 직접 호출).
 * @param {string} syllable 선택한 음절
 * @param {number|null} slotIdx 채점 대상 슬롯
 * @param {HTMLButtonElement} [btnEl] 탭한 도크 블록 (정답 시 used 처리)
 */
export function selectSyllable(syllable, slotIdx, btnEl) {
  gradeSyllable(syllable, slotIdx, btnEl);
}

/**
 * 오답 슬롯 독립 페이딩 (PLAN M3 / TRD §9.2):
 * 해당 슬롯만 Lv.1 재강화, 나머지 슬롯 레벨 유지.
 * @param {number} slotIdx
 */
export function onSlotWrong(slotIdx) {
  state.session.slotLevels[slotIdx] = MIN_FADING_LEVEL;
  state.session.wrongSlots.add(slotIdx);
}

/**
 * 공통 채점 (전 레벨 공용).
 * 정답: slotPop + playCorrect + 음절 TTS + 어원 팝업 → 다음 활성 슬롯 입력 UI 전환.
 * 오답: shake + playWrong + 슬롯 Lv.1 재강화 → 0.6초 후 슬롯 리셋·입력 UI 갱신 (재시도).
 * @param {string} syllable 입력된 음절
 * @param {number|null} slotIdx 채점 대상 슬롯
 * @param {HTMLButtonElement} [btnEl] (Lv.1) 탭한 도크 블록
 */
function gradeSyllable(syllable, slotIdx, btnEl) {
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
      renderActiveInput();
    }
  } else {
    /* ── 오답 — 해당 슬롯 Lv.1 재강화 + 재시도 허용 ── */
    slotFirstTry[slotIdx] = false;
    onSlotWrong(slotIdx);
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
      /* 재강화된 레벨(Lv.1)에 맞는 입력 UI 로 전환 */
      renderActiveInput();
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
  storage.markIdiomCompleted(idiom.word); // S12 공유 스키마 (11ist_completedIdioms)
  maybeAutoFade();

  el('slot-row').classList.add('complete');
  hideAllInputs();
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

/**
 * 자동 페이딩 진급 (PLAN M3 / TRD §9.2):
 * autoFade ON + 레벨 고정 OFF + 문항 오답 0 → fadingLevel = min(3, fadingLevel + 1).
 * 다음 문항부터 적용. 변경 즉시 11ist_settings 저장.
 */
function maybeAutoFade() {
  const settings = state.settings;
  if (!settings.autoFade || settings.levelLock) return;
  if (state.session.wrongSlots.size > 0) return;
  if (settingsLevel() >= MAX_FADING_LEVEL) return;
  settings.fadingLevel = Math.min(MAX_FADING_LEVEL, settingsLevel() + 1);
  storage.save('settings', settings);
  showToast(`🎉 오답 없이 완성! 다음 문항은 Lv.${settings.fadingLevel}`);
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
