/**
 * Level 0 — 모음 소리 매칭 (PRD §5, TRD §5.1·§5.4)
 * 대형 모음 카드 + TTS 자동 재생 → 보기 3~4개 중 같은 모음 탭.
 * 정답 800ms 후 다음 문항, 오답 1200ms 후 재시도 허용.
 */

import { state, buildLevel0Questions } from './state.js';
import { VOWEL_BY_ID } from '../data/vowels.js';
import { FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_WRONG, L0_AUDIO_ONLY_RATIO } from './config.js';
import { speak, TTS_AVAILABLE } from './tts.js';
import { playCorrect, playWrong } from './sound.js';
import { goTo, updateHud } from './ui.js';
import { initLevel1 } from './level1.js';

// 현재 문항을 첫 시도에 맞혔는지 — 정답률은 첫 시도 기준 (재시도로 정답 수 부풀림 방지)
let firstTry = true;

const HUD_LABEL = '🔊 소리 찾기';

/** Level 0 시작 — 문항 풀 빌드 + 첫 문항 렌더링 */
export function initLevel0() {
  const g = state.game;
  g.phase = 'level0';
  g.l0Questions = buildLevel0Questions(state.settings.vowelCount);
  g.l0Idx = 0;
  g.l0Correct = 0;
  g.answered = false;
  goTo('game-level0');
  renderQuestion(0);
}

/** 문항 렌더링 — 대형 모음 카드 + TTS 자동 재생 + 보기 격자 */
export function renderQuestion(idx) {
  const g = state.game;
  g.l0Idx = idx;
  g.answered = false;
  firstTry = true;

  const q = g.l0Questions[idx];
  const v = VOWEL_BY_ID[q.answer];

  updateHud(`${idx + 1} / ${g.l0Questions.length}`, HUD_LABEL, g.l0Correct);

  const card = document.getElementById('l0-card');
  // ----- 음성 전용 페이딩 (TRD §9.5): 후반 ⌈N/2⌉ 문항은 글자 숨김 — 청각 단서만 -----
  // 시작 인덱스 = ⌊N/2⌋ — 5문항이면 idx 2~4(3문항), 10문항이면 idx 5~9가 음성 전용.
  // TTS fallback: speak()의 가드(TTS_AVAILABLE && ttsEnabled)와 동일 조건을 문항마다 재평가.
  // 소리 단서가 불가능하면 모든 문항에서 글자 표시 — 게임이 풀 수 없는 상태 방지.
  const audioOnlyStart = Math.floor(g.l0Questions.length * L0_AUDIO_ONLY_RATIO);
  const audioOnly = idx >= audioOnlyStart && TTS_AVAILABLE && state.settings.ttsEnabled;
  if (audioOnly) {
    card.textContent = '?';
    card.setAttribute('aria-label', '소리를 듣고 같은 모음을 찾아요');
    card.classList.add('audio-only');
  } else {
    card.textContent = v.char;
    card.setAttribute('aria-label', `${v.char} ${v.sound} 카드`);
    card.classList.remove('audio-only');
  }
  card.classList.remove('correct');

  const grid = document.getElementById('l0-choices');
  grid.innerHTML = '';
  q.choices.forEach(id => {
    const cv = VOWEL_BY_ID[id];
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = cv.char;
    btn.dataset.id = id;
    btn.setAttribute('aria-label', `${cv.char} ${cv.sound} 버튼`);
    // 탭 = pointerdown 단일 이벤트 (TRD §5.1) + 키보드 접근용 click 폴백
    btn.setAttribute('onpointerdown', `tapChoice('${id}')`);
    btn.setAttribute('onclick', `tapChoice('${id}')`);
    grid.appendChild(btn);
  });

  document.getElementById('l0-feedback').textContent = '';
  speak(v.sound);
}

/** 현재 문항 모음 다시 듣기 (TTS 버튼) */
export function speakCurrentL0() {
  const q = state.game.l0Questions[state.game.l0Idx];
  if (q) speak(VOWEL_BY_ID[q.answer].sound);
}

/**
 * 보기 탭 — answered 가드로 중복 탭 방지 (TRD §5.1)
 * @param {string} vowelId
 */
export function tapChoice(vowelId) {
  const g = state.game;
  if (g.phase !== 'level0' || g.answered) return;

  const q = g.l0Questions[g.l0Idx];
  const v = VOWEL_BY_ID[q.answer];
  const btn = document.querySelector(`#l0-choices .choice-btn[data-id="${vowelId}"]`);
  const fb = document.getElementById('l0-feedback');

  if (vowelId === q.answer) {
    // ----- 정답: 애니메이션 + playCorrect → 800ms 후 다음 문항 (TTS 재발화 없음 — 다음 문항 발화와 혼동 방지) -----
    g.answered = true;
    if (firstTry) g.l0Correct += 1;
    if (btn) btn.classList.add('correct');
    const card = document.getElementById('l0-card');
    // 음성 전용 모드였다면 정답 시 글자 공개 — 자소-음소 연결 재강화 (TRD §9.5)
    if (card.classList.contains('audio-only')) {
      card.classList.remove('audio-only');
      card.textContent = v.char;
      card.setAttribute('aria-label', `${v.char} ${v.sound} 카드`);
    }
    card.classList.add('correct');
    playCorrect();
    fb.textContent = `딩동댕! ${v.sound} 맞았어요!`;
    updateHud(`${g.l0Idx + 1} / ${g.l0Questions.length}`, HUD_LABEL, g.l0Correct);

    setTimeout(() => {
      if (g.phase !== 'level0') return; // 사용자가 도중에 화면 이탈
      const next = g.l0Idx + 1;
      if (next < g.l0Questions.length) {
        renderQuestion(next);
      } else {
        initLevel1(); // Level 0 완료 → phase 'level1' + goTo('game-level1')
      }
    }, FEEDBACK_DELAY_CORRECT);
  } else {
    // ----- 오답: 흔들기 + playWrong → 1200ms 후 재시도 허용 -----
    g.answered = true;
    firstTry = false;
    if (btn) btn.classList.add('wrong', 'shake');
    playWrong();
    fb.textContent = '다시 한 번 들어봐요!';

    setTimeout(() => {
      if (g.phase !== 'level0') return;
      if (btn) btn.classList.remove('wrong', 'shake');
      fb.textContent = '';
      g.answered = false;
    }, FEEDBACK_DELAY_WRONG);
  }
}
