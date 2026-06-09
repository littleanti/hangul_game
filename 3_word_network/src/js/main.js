import { showScreen } from './ui.js';
import { startGame } from './game.js';
import { loadSettings, saveSettings } from './storage.js';
import { getState } from './state.js';
import { openSettings, startFromSettings } from './settings.js';
import { DIFFICULTY_LEVELS } from './config.js';

function updateLevelButtonStates() {
  const { difficulty } = getState().settings;
  DIFFICULTY_LEVELS.forEach((lvl, i) => {
    document.getElementById(`btn-level-${i + 1}`)
      ?.classList.toggle('selected', lvl.key === difficulty);
  });
}

function goHome() {
  showScreen('screen-start');
  updateLevelButtonStates();
}

function startWithLevel(levelKey) {
  const state = getState();
  state.settings.difficulty = levelKey;
  saveSettings(state.settings);
  startGame();
}

function initApp() {
  const saved = loadSettings();
  if (saved) {
    const state = getState();
    Object.assign(state.settings, saved);
    if (saved.categories) state.settings.categories = saved.categories;
  }

  DIFFICULTY_LEVELS.forEach((lvl, i) => {
    document.getElementById(`btn-level-${i + 1}`)
      ?.addEventListener('click', () => startWithLevel(lvl.key));
  });

  document.getElementById('btn-play-again')?.addEventListener('click', startGame);
  document.getElementById('btn-settings')?.addEventListener('click', openSettings);
  document.getElementById('btn-home')?.addEventListener('click', goHome);
  document.getElementById('btn-back-start')?.addEventListener('click', goHome);

  document.getElementById('btn-settings-close')?.addEventListener('click', goHome);
  document.getElementById('btn-settings-home')?.addEventListener('click', goHome);
  document.getElementById('btn-settings-start')?.addEventListener('click', startFromSettings);

  updateLevelButtonStates();

  document.getElementById('btn-review-toggle')?.addEventListener('click', () => {
    const list = document.getElementById('end-wrong-list');
    const btn = document.getElementById('btn-review-toggle');
    if (!list || !btn) return;
    list.classList.toggle('open');
    btn.textContent = list.classList.contains('open')
      ? '📝 틀린 단어 접기 ▲'
      : '📝 틀린 단어 보기 ▼';
  });

  showScreen('screen-start');
}

document.addEventListener('DOMContentLoaded', initApp);
