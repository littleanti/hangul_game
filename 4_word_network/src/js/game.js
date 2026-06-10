import { SCENES } from '../data/scenes.js';
import { WORDS_BY_SCENE } from '../data/words.js';
import { getState, resetGame, getCurrentTargetWord } from './state.js';
import { buildDock, renderDock, markUsed, unmarkUsed } from './syllable-dock.js';
import { renderSlots, fillNextSlot, fillSlotAt, checkSlots, lockSlots, clearSlotsFrom, markSlotsWrong, celebrateSlots, shakeSlots } from './slot.js';
import { renderScene, markWordMatched } from './scene.js';
import { showScreen, showFlash, updateProgress, updateScore } from './ui.js';
import { vibrate } from './utils.js';
import { speak, speakThen } from './tts.js';
import { playCorrect, playIncorrect, initAudio } from './sound.js';
import { initDrag } from './dnd.js';
import { HESITATION_HINT_TICKS, HESITATION_POSITION_TICKS } from './config.js';

let _dragController = null;
let _hintTimer = null;

const ENCOURAGEMENT = [
  '정말 잘했어요! 👏',
  '훌륭해요! 🌟',
  '최고예요! 🏆',
  '대단해요! 🎉',
  '완벽해요! ✨',
  '멋져요! 🦋',
];

function pickScenes(settings) {
  const { categories, sceneCount, difficulty } = settings;
  const available = SCENES.filter(s => {
    const words = WORDS_BY_SCENE[s.id] ?? [];
    return words.length > 0 && (categories.has(s.category) || categories.size === 0);
  });
  if (available.length === 0) return SCENES.slice(0, 1);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(sceneCount, shuffled.length)).map(scene => ({
    ...scene,
    words: (WORDS_BY_SCENE[scene.id] ?? []).slice(0, 3),
  }));
}

export function startGame() {
  const state = getState();
  resetGame();

  state.game.scenes = pickScenes(state.settings);
  if (state.game.scenes.length === 0) {
    showFlash('장면이 없어요. 카테고리를 선택해 주세요.', 'error');
    return;
  }
  state.game.currentIdx = 0;
  state.game.targetWordIdx = 0;

  showScreen('screen-play');
  updateScore(0);

  if (_dragController) _dragController.abort();
  _dragController = new AbortController();
  const dockEl = document.getElementById('syllable-dock');
  if (dockEl) {
    initDrag(
      dockEl,
      sylId => getState().game.dock.find(s => s.id === sylId),
      onSyllableDrop,
      _dragController.signal,
    );
  }

  loadCurrentScene();
}

function loadCurrentScene() {
  const state = getState();
  const scene = state.game.scenes[state.game.currentIdx];
  if (!scene) { endGame(); return; }

  state.game.targetWordIdx = 0;
  state.game.slot = { filled: [], lockedCount: 0 };

  renderScene(scene, scene.words);
  loadCurrentWord();
  updateProgress(state.game.currentIdx + 1, state.game.scenes.length);
}

function loadCurrentWord() {
  const state = getState();
  const scene = state.game.scenes[state.game.currentIdx];
  const targetIdx = state.game.targetWordIdx;
  const word = scene.words[targetIdx];
  if (!word) { advanceScene(); return; }

  state.game.slot = { filled: new Array(word.syllables.length).fill(null), lockedCount: 0 };

  const remainingWords = scene.words.slice(targetIdx);
  const dock = buildDock(remainingWords, state.settings.difficulty, state.settings.customDecoyCount);
  state.game.dock = dock;

  renderSlots(word);
  attachSlotTapHandlers();
  renderDock(dock, onSyllableTap);

  resetHint();
  startHintTimer();
}

function attachSlotTapHandlers() {
  const row = document.getElementById('slot-row');
  if (!row) return;
  row.addEventListener('click', e => {
    const slotEl = e.target.closest('.syllable-slot');
    if (!slotEl) return;
    if (!slotEl.classList.contains('filled') || slotEl.classList.contains('locked')) return;
    onFilledSlotTap(parseInt(slotEl.dataset.idx, 10));
  });
}

function onFilledSlotTap(idx) {
  const state = getState();
  const { slot } = state.game;
  if (idx < slot.lockedCount) return;

  for (let i = idx; i < slot.filled.length; i++) {
    if (slot.filled[i]) {
      slot.filled[i].used = false;
      unmarkUsed(slot.filled[i].id);
      slot.filled[i] = null;
    }
  }
  clearSlotsFrom(idx);
  vibrate(10);
  resetHint();
  startHintTimer();
}

function onSyllableDrop(syllable, slotIdx) {
  const state = getState();
  const { slot } = state.game;
  if (slotIdx < slot.lockedCount) return;
  if (slot.filled[slotIdx] !== null) return;
  if (syllable.used) return;
  if (slot.filled.every(v => v !== null)) return;

  initAudio();
  slot.filled[slotIdx] = syllable;
  syllable.used = true;
  markUsed(syllable.id);
  fillSlotAt(syllable.char, slotIdx);
  vibrate(15);
  resetHint();

  if (slot.filled.every(v => v !== null)) {
    validateAnswer(getCurrentTargetWord(), syllable.char);
  } else {
    speak(syllable.char);
    startHintTimer();
  }
}

function onSyllableTap(syllable) {
  const state = getState();
  const word = getCurrentTargetWord();
  if (!word) return;

  initAudio();
  const { slot } = state.game;

  const emptyIdx = slot.filled.findIndex((v, i) => i >= slot.lockedCount && v === null);
  if (emptyIdx === -1) return;

  slot.filled[emptyIdx] = syllable;
  syllable.used = true;
  markUsed(syllable.id);
  fillNextSlot(syllable.char, slot.lockedCount);
  vibrate(15);
  resetHint();

  if (slot.filled.every(v => v !== null)) {
    validateAnswer(word, syllable.char);
  } else {
    speak(syllable.char);
    startHintTimer();
  }
}

function validateAnswer(word, lastSylChar) {
  const result = checkSlots(word);
  const state = getState();

  if (result === 'correct') {
    clearHintTimer();
    celebrateSlots();
    vibrate(30);
    markWordMatched(word.id);
    speakThen(lastSylChar, () => { playCorrect(); speak(word.word); });
    state.game.score += 1;
    updateScore(state.game.score);
    state.game.stickers.push(word.emoji);

    showFlash(`${word.word}! 정답이에요! 🎉`, 'success');

    setTimeout(() => {
      state.game.targetWordIdx += 1;
      state.game.slot = { filled: [], lockedCount: 0 };
      loadCurrentWord();
    }, 1200);

  } else if (result && result.status === 'wrong') {
    shakeSlots();
    vibrate(50);
    speakThen(lastSylChar, () => { playIncorrect(); });
    markSlotsWrong(result.correctPrefixLen);

    if (!state.game.wrongAnswers.some(w => w.id === word.id)) {
      state.game.wrongAnswers.push(word);
    }

    const { filled } = state.game.slot;
    for (let i = result.correctPrefixLen; i < filled.length; i++) {
      if (filled[i]) {
        filled[i].used = false;
        unmarkUsed(filled[i].id);
        filled[i] = null;
      }
    }
    clearSlotsFrom(result.correctPrefixLen);

    if (result.correctPrefixLen > 0) {
      state.game.slot.lockedCount = result.correctPrefixLen;
      lockSlots(result.correctPrefixLen);
    }

    setTimeout(() => {
      renderDock(state.game.dock, onSyllableTap);
      startHintTimer();
    }, 50);
  }
}

function advanceScene() {
  const state = getState();
  state.game.currentIdx += 1;
  state.game.targetWordIdx = 0;

  if (state.game.currentIdx >= state.game.scenes.length) {
    endGame();
  } else {
    updateProgress(state.game.currentIdx, state.game.scenes.length);
    setTimeout(loadCurrentScene, 300);
  }
}

function endGame() {
  clearHintTimer();
  const state = getState();
  showScreen('screen-end');

  const stickersEl = document.getElementById('end-stickers');
  if (stickersEl) {
    stickersEl.innerHTML = '';
    for (const emoji of state.game.stickers) {
      const span = document.createElement('span');
      span.className = 'sticker';
      span.textContent = emoji;
      stickersEl.appendChild(span);
    }
  }

  const scoreEl = document.getElementById('end-score-text');
  if (scoreEl) scoreEl.textContent = `${state.game.score}점`;

  const enc = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
  const encEl = document.getElementById('end-encouragement');
  if (encEl) encEl.textContent = enc;

  const wrongSection = document.getElementById('end-wrong-section');
  const wrongList = document.getElementById('end-wrong-list');
  const reviewToggle = document.getElementById('btn-review-toggle');
  if (wrongSection && wrongList) {
    if (state.game.wrongAnswers.length > 0) {
      wrongSection.style.display = 'block';
      wrongList.classList.remove('open');
      if (reviewToggle) reviewToggle.textContent = '📝 틀린 단어 보기 ▼';
      wrongList.innerHTML = '';
      for (const word of state.game.wrongAnswers) {
        const item = document.createElement('div');
        item.className = 'review-item';
        const emojiEl = document.createElement('span');
        emojiEl.className = 'review-emoji';
        emojiEl.textContent = word.emoji;
        const wordEl = document.createElement('span');
        wordEl.className = 'review-word';
        wordEl.textContent = word.word;
        const ttsBtn = document.createElement('button');
        ttsBtn.className = 'review-tts';
        ttsBtn.textContent = '🔊';
        ttsBtn.addEventListener('click', () => speak(word.word));
        item.appendChild(emojiEl);
        item.appendChild(wordEl);
        item.appendChild(ttsBtn);
        wrongList.appendChild(item);
      }
    } else {
      wrongSection.style.display = 'none';
    }
  }
}

// ── Hint System ──────────────────────────────────────────────

function startHintTimer() {
  clearHintTimer();
  _hintTimer = setInterval(() => {
    const state = getState();
    state.game.hesitationTicks++;
    if (state.game.hesitationTicks === HESITATION_HINT_TICKS) {
      applyHintLevel1();
    } else if (state.game.hesitationTicks === HESITATION_POSITION_TICKS) {
      applyHintLevel2();
    }
  }, 1000);
}

function clearHintTimer() {
  if (_hintTimer) { clearInterval(_hintTimer); _hintTimer = null; }
}

function resetHint() {
  const state = getState();
  state.game.hesitationTicks = 0;
  state.game.hintLevel = 0;
  document.querySelectorAll('.syllable-block.hint-glow').forEach(el => el.classList.remove('hint-glow'));
  document.querySelectorAll('.syllable-slot.hint-arrow').forEach(el => el.classList.remove('hint-arrow'));
}

function applyHintLevel1() {
  const state = getState();
  state.game.hintLevel = 1;
  const word = getCurrentTargetWord();
  if (!word) return;
  const nextEmpty = state.game.slot.filled.findIndex((v, i) => i >= state.game.slot.lockedCount && v === null);
  if (nextEmpty === -1) return;
  const correctChar = word.syllables[nextEmpty];
  const target = state.game.dock.find(s => !s.used && s.char === correctChar);
  if (target) {
    const btn = document.querySelector(`[data-syl-id="${CSS.escape(target.id)}"]`);
    if (btn) btn.classList.add('hint-glow');
  }
}

function applyHintLevel2() {
  const state = getState();
  state.game.hintLevel = 2;
  const nextEmpty = state.game.slot.filled.findIndex((v, i) => i >= state.game.slot.lockedCount && v === null);
  if (nextEmpty === -1) return;
  const slotEl = document.querySelector(`.syllable-slot[data-idx="${nextEmpty}"]`);
  if (slotEl) slotEl.classList.add('hint-arrow');
}
