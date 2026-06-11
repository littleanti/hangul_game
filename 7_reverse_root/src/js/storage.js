// storage.js — localStorage 래퍼, '7rr:' 접두사 강제 (TRD §7.3)
// Incognito/Private Mode 등 localStorage 실패 시에도 앱이 정상 동작해야 한다.

import { STORAGE_PREFIX } from './config.js';

function key(k) { return `${STORAGE_PREFIX}${k}`; }

export function get(k, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key(k))) ?? fallback; }
  catch { return fallback; }
}

export function set(k, v) {
  try { localStorage.setItem(key(k), JSON.stringify(v)); }
  catch { /* Incognito 모드 등 실패 시 무시 */ }
}

export function remove(k) {
  try { localStorage.removeItem(key(k)); }
  catch { /* 무시 */ }
}
