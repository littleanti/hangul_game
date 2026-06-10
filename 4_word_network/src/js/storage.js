import { STORAGE_KEYS } from './config.js';

function tryJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function trySave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

export function saveSettings(settings) {
  trySave(STORAGE_KEYS.SETTINGS, {
    ...settings,
    categories: [...settings.categories],
  });
}

export function loadSettings() {
  const raw = tryJSON(STORAGE_KEYS.SETTINGS);
  if (!raw) return null;
  if (Array.isArray(raw.categories)) raw.categories = new Set(raw.categories);
  return raw;
}

export function saveResume(gameData) {
  trySave(STORAGE_KEYS.RESUME, gameData);
}

export function loadResume() {
  return tryJSON(STORAGE_KEYS.RESUME);
}

export function clearResume() {
  try { localStorage.removeItem(STORAGE_KEYS.RESUME); } catch { /* ignore */ }
}
