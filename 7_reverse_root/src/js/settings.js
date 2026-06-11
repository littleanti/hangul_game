// settings.js — 설정 화면 렌더링·저장 (M0 스텁 → M4 본 구현)

import { state } from './state.js';
import * as storage from './storage.js';
import * as tts from './tts.js';

const TOGGLE_IDS = {
  ttsEnabled: 'toggle-tts',
  sfxEnabled: 'toggle-sfx',
  hintVisible: 'toggle-hint',
};

/** 저장된 설정 로드 후 토글 UI 동기화 */
export function init() {
  const saved = storage.get('settings');
  if (saved && typeof saved === 'object') {
    for (const k of Object.keys(TOGGLE_IDS)) {
      if (typeof saved[k] === 'boolean') state.settings[k] = saved[k];
    }
  }
  // TTS 미지원 시 토글 자동 비활성화 (graceful degradation, TRD §8.2)
  if (!tts.isSupported()) {
    state.settings.ttsEnabled = false;
    const el = document.getElementById(TOGGLE_IDS.ttsEnabled);
    if (el) el.classList.add('disabled');
    const hint = document.getElementById('tts-hint');
    if (hint) hint.textContent = '이 기기에서는 소리 읽기를 지원하지 않아요';
  }
  syncToggles();
}

function syncToggles() {
  for (const [k, id] of Object.entries(TOGGLE_IDS)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', !!state.settings[k]);
  }
}

/** 토글 탭 핸들러 (index.html onclick) */
export function toggleSetting(key, el) {
  if (!(key in TOGGLE_IDS)) return;
  if (key === 'ttsEnabled' && !tts.isSupported()) return; // 미지원 시 무시
  state.settings[key] = !state.settings[key];
  if (el) el.classList.toggle('on', state.settings[key]);
}

/** 설정 저장 ('7rr:settings') */
export function save() {
  storage.set('settings', {
    ttsEnabled: state.settings.ttsEnabled,
    sfxEnabled: state.settings.sfxEnabled,
    hintVisible: state.settings.hintVisible,
  });
}

// ====== 진행 초기화 — 인페이지 확인 단계 (M4, 브라우저 confirm 모달 금지) ======

/** "기록 지우기" 첫 탭 → 인페이지 확인 UI 표시 */
export function requestReset() {
  document.getElementById('reset-confirm')?.classList.add('open');
  document.getElementById('reset-btn')?.setAttribute('disabled', '');
}

/** 확인 UI "취소" → 확인 단계 닫기 */
export function cancelReset() {
  document.getElementById('reset-confirm')?.classList.remove('open');
  document.getElementById('reset-btn')?.removeAttribute('disabled');
}

/** 확인 UI "네, 지울래요" → '7rr:progress' + '7rr:leaderboard' 삭제 */
export function confirmReset() {
  storage.remove('progress');
  storage.remove('leaderboard');
  state.progress.totalSessions = 0;
  state.progress.bestScore = 0;
  state.progress.lastHintLevel = 1;
  state.progress.lastPlayedAt = 0;
  cancelReset();
  const hint = document.getElementById('reset-hint');
  if (hint) hint.textContent = '기록을 모두 지웠어요! 처음부터 다시 시작해요 🌱';
}

// ====== PWA 설치 프롬프트 (M4, TRD §15 — 세션 최초 완료 후 노출) ======

let deferredInstallPrompt = null; // beforeinstallprompt 이벤트 저장
let installOffered = false;       // 페이지 수명 내 1회만 노출

/** beforeinstallprompt 이벤트 저장 — main.js 초기화 시 호출 */
export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // 브라우저 기본 미니 인포바 차단, 이벤트만 저장
    deferredInstallPrompt = e;
  });
}

/** 세션 완료 화면에서 설치 버튼 노출 — game.endSession()이 호출 */
export function maybeOfferInstall() {
  if (!deferredInstallPrompt || installOffered) return;
  const slot = document.getElementById('install-slot');
  if (!slot) return;
  installOffered = true;

  const btn = document.createElement('button');
  btn.className = 'btn ghost small';
  btn.textContent = '📲 홈 화면에 추가';
  btn.addEventListener('click', async () => {
    const prompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    btn.remove();
    if (!prompt) return;
    prompt.prompt();
    try { await prompt.userChoice; } catch { /* 무시 */ }
  });
  slot.textContent = '';
  slot.appendChild(btn);
}
