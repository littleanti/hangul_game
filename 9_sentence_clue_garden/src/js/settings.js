/**
 * 설정 화면 렌더링 (TRD §3.4 — 변경 즉시 저장)
 * TTS 미지원 브라우저: 토글 자동 비활성화 + 안내 메시지 (TRD §7.3)
 */

import { state } from './state.js';
import { saveSettings } from './storage.js';
import { goTo } from './ui.js';
import { isTtsSupported } from './tts.js';

/** 설정 화면 진입 */
export function openSettings() {
  renderSettings();
  goTo('settings-screen');
}

/** state.settings → 설정 UI 동기화 */
export function renderSettings() {
  const s = state.settings;

  document.querySelectorAll('#difficulty-chips .chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.difficulty === s.difficulty);
  });

  document.querySelectorAll('#count-chips .chip').forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.count) === s.questionCount);
  });

  syncToggle('toggle-hint', s.hintEnabled);
  syncToggle('toggle-sound', s.soundEnabled);

  // TTS 미지원 브라우저 → 토글 자동 비활성화 + 안내 (TRD §7.3)
  const ttsToggle = document.getElementById('toggle-tts');
  if (!isTtsSupported()) {
    s.ttsEnabled = false;
    if (ttsToggle) {
      ttsToggle.classList.remove('on');
      ttsToggle.classList.add('disabled');
    }
    const ttsHint = document.getElementById('tts-hint');
    if (ttsHint) ttsHint.textContent = '이 기기에서는 소리 듣기를 지원하지 않아요';
  } else {
    syncToggle('toggle-tts', s.ttsEnabled);
  }

  const nameInput = document.getElementById('player-name');
  if (nameInput && nameInput.value !== s.playerName) nameInput.value = s.playerName;
}

function syncToggle(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', !!on);
}

/** 난이도 선택 (easy | medium | hard | all) */
export function selectDifficulty(difficulty) {
  state.settings.difficulty = difficulty;
  saveSettings();
  renderSettings();
}

/** 문제 수 선택 (5 | 10 | 20) */
export function selectCount(count) {
  state.settings.questionCount = count;
  saveSettings();
  renderSettings();
}

/** ON/OFF 토글 (hintEnabled | ttsEnabled | soundEnabled) */
export function toggleSetting(key, _el) {
  if (key === 'ttsEnabled' && !isTtsSupported()) return; // 미지원 — 토글 잠금
  state.settings[key] = !state.settings[key];
  saveSettings();
  renderSettings();
}

/** 플레이어 이름 입력 (시리즈 유일 IME 허용 — 리더보드 표기용) */
export function setPlayerName(name) {
  state.settings.playerName = String(name).slice(0, 8);
  saveSettings();
}
