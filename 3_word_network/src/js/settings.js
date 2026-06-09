import { CATEGORY_LABELS, SCENE_COUNT_OPTIONS, CUSTOM_DECOY_OPTIONS } from './config.js';
import { getState } from './state.js';
import { saveSettings } from './storage.js';
import { showScreen, showFlash } from './ui.js';
import { startGame } from './game.js';

export function openSettings() {
  showScreen('screen-settings');
  renderSettings();
}

export function renderSettings() {
  renderCategories();
  renderSceneCount();
  renderCustomDecoy();
}

function renderCategories() {
  const row = document.getElementById('settings-category-chips');
  if (!row) return;
  row.innerHTML = '';
  const state = getState();
  Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'settings-chip' + (state.settings.categories.has(key) ? ' active' : '');
    btn.textContent = label;
    btn.onclick = () => {
      if (state.settings.categories.has(key)) {
        if (state.settings.categories.size > 1) state.settings.categories.delete(key);
      } else {
        state.settings.categories.add(key);
      }
      saveSettings(state.settings);
      renderCategories();
    };
    row.appendChild(btn);
  });
}

function renderSceneCount() {
  const state = getState();
  const row = document.getElementById('settings-scene-chips');
  if (!row) return;
  row.innerHTML = '';
  SCENE_COUNT_OPTIONS.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'settings-chip' + (state.settings.sceneCount === n ? ' active' : '');
    btn.textContent = `${n}장면`;
    btn.onclick = () => {
      state.settings.sceneCount = n;
      saveSettings(state.settings);
      renderSceneCount();
    };
    row.appendChild(btn);
  });
}

function renderCustomDecoy() {
  const state = getState();
  const row = document.getElementById('settings-custom-decoy-chips');
  if (!row) return;
  row.innerHTML = '';
  CUSTOM_DECOY_OPTIONS.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'settings-chip' + (state.settings.customDecoyCount === n ? ' active' : '');
    btn.textContent = `${n}개`;
    btn.onclick = () => {
      state.settings.customDecoyCount = n;
      saveSettings(state.settings);
      renderCustomDecoy();
    };
    row.appendChild(btn);
  });
}

export function startFromSettings() {
  const state = getState();
  if (state.settings.categories.size === 0) {
    showFlash('카테고리를 하나 이상 선택해 주세요.', 'error');
    return;
  }
  startGame();
}
