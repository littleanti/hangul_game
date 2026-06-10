/**
 * Level 0 — 모음 소리 매칭 (PRD §5, TRD §5.1·§5.4)
 * 대형 모음 카드 + TTS 자동 재생 → 보기 3~4개 중 같은 모음 탭.
 * 정답 800ms 후 다음 문항, 오답 1200ms 후 재시도 허용.
 */

import { state, buildLevel0Questions } from './state.js';
import { VOWEL_BY_ID } from '../data/vowels.js';
import { FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_WRONG } from './config.js';
import { speak } from './tts.js';
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
  card.textContent = v.char;
  card.setAttribute('aria-label', `${v.char} ${v.sound} 카드`);
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
    // ----- 정답: 애니메이션 + playCorrect + TTS 재발화 → 800ms 후 다음 문항 -----
    g.answered = true;
    if (firstTry) g.l0Correct += 1;
    if (btn) btn.classList.add('correct');
    document.getElementById('l0-card').classList.add('correct');
    playCorrect();
    speak(v.sound);
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
