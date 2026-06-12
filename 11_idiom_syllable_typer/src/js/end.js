/**
 * end.js — 완료 화면 렌더링 (PLAN M2 / TRD §2.3)
 *
 * 정답률·완료 사자성어 목록·오답 TTS 복습 버튼 표시 +
 * storage.saveResult() 로 리더보드 기록 저장.
 */

import { TOTAL_SLOTS } from './config.js';
import { state } from './state.js';
import * as storage from './storage.js';
import * as tts from './tts.js';
import { el } from './ui.js';

/**
 * 완료 화면 렌더 + 세션 결과 저장.
 * game.js 의 onSessionEnd 콜백(main.js 주입)에서 호출된다.
 */
export function render() {
  const { totalCorrect, wrongIdioms, levelReached } = state.result;
  const correctRate = TOTAL_SLOTS > 0 ? totalCorrect / TOTAL_SLOTS : 0;

  /* 점수 / 정답률 */
  el('final-correct').textContent = String(totalCorrect);
  el('final-total').textContent = String(TOTAL_SLOTS);
  el('accuracy').textContent = `정답률 ${Math.round(correctRate * 100)}%`;
  el('end-title').textContent =
    correctRate === 1 ? '완벽해요! 🏆'
    : correctRate >= 0.8 ? '참 잘했어요!'
    : correctRate >= 0.5 ? '잘했어요!'
    : '조금만 더 연습해요!';

  /* 완료 사자성어 목록 + 오답 TTS 복습 */
  renderIdiomList(wrongIdioms);

  /* 리더보드 결과 저장 (Incognito 실패 시 조용히 무시) */
  storage.saveResult({
    correctRate,
    levelReached,
    idiomLevels: state.session.idiomLevels || {},
  });
}

/**
 * 사자성어 10개 목록 렌더. 오답 어휘에는 🔊 TTS 복습 버튼 부착.
 * @param {string[]} wrongIdioms 오답이 발생한 사자성어 word 배열
 */
function renderIdiomList(wrongIdioms) {
  const list = el('end-idiom-list');
  list.textContent = '';

  state.session.idioms.forEach((idiom) => {
    const wrong = wrongIdioms.includes(idiom.word);

    const item = document.createElement('div');
    item.className = 'review-item';

    const emoji = document.createElement('span');
    emoji.className = 'review-emoji';
    emoji.textContent = wrong ? '❌' : '✅';
    item.appendChild(emoji);

    const word = document.createElement('span');
    word.className = 'review-word';
    word.textContent = `${idiom.word} (${idiom.hanja.join('')})`;
    const small = document.createElement('small');
    small.textContent = wrong ? `${idiom.meaning} — 오답이 있었어요` : idiom.meaning;
    word.appendChild(small);
    item.appendChild(word);

    if (wrong && tts.isSupported()) {
      const replay = document.createElement('button');
      replay.type = 'button';
      replay.className = 'review-tts';
      replay.textContent = '🔊';
      replay.setAttribute('aria-label', `${idiom.word} 발음 듣기`);
      replay.addEventListener('click', () => tts.speak(idiom.word));
      item.appendChild(replay);
    }

    list.appendChild(item);
  });
}
