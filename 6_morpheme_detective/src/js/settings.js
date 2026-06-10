// 설정 화면 렌더링 + 인터랙션 — 1_chosung_quiz/src/js/settings.js 패턴 계승.
// 옵션: TTS · 효과음 · 객체 발광 힌트 · 글자 크기 · 다크 모드 · 진행 초기화.
import { state } from './state.js';
import { saveSettings, resetSettings, resetProgress } from './storage.js';
import { isAvailable as ttsAvailable } from './tts.js';

const FONT_OPTIONS = [
  { val: 0.9,  label: '작게' },
  { val: 1.0,  label: '보통' },
  { val: 1.15, label: '크게' },
];

// ── 전역 테마/글자 크기 적용 (body data-attr → CSS 룰) ─────────────
export function applyTheme() {
  const fs = state.settings.fontScale;
  const fsKey = fs <= 0.95 ? 'small' : (fs >= 1.10 ? 'large' : 'normal');
  document.body.dataset.font  = fsKey;
  document.body.dataset.theme = state.settings.darkMode ? 'dark' : 'light';
}

// ── 렌더 ────────────────────────────────────────────────────────────
export function renderSettings() {
  renderFontChips();
  renderToggles();
}

function renderFontChips() {
  const row = document.getElementById('font-chips');
  if (!row) return;
  row.innerHTML = '';
  FONT_OPTIONS.forEach(opt => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (Math.abs(state.settings.fontScale - opt.val) < 0.01 ? ' active' : '');
    chip.textContent = opt.label;
    chip.onclick = () => {
      state.settings.fontScale = opt.val;
      saveSettings();
      applyTheme();
      renderFontChips();
    };
    row.appendChild(chip);
  });
}

function renderToggles() {
  // TTS — 디바이스 미지원 시 강제 off + disabled 표기
  const tts     = document.getElementById('toggle-tts');
  const ttsHint = document.getElementById('tts-hint');
  if (tts) {
    if (!ttsAvailable()) {
      tts.classList.add('disabled');
      tts.classList.remove('on');
      state.settings.ttsEnabled = false;
      if (ttsHint) ttsHint.textContent = '⚠️ 이 기기/브라우저에서는 발음 듣기를 지원하지 않아요';
    } else {
      tts.classList.toggle('on', state.settings.ttsEnabled);
      if (ttsHint) ttsHint.textContent = '한자 발견 시 음과 뜻을 읽어줘요';
    }
  }
  // 효과음
  document.getElementById('toggle-audio')?.classList.toggle('on', state.settings.audioEnabled);
  // 펄스 힌트
  document.getElementById('toggle-pulse')?.classList.toggle('on', state.settings.pulseEnabled);
  // 다크 모드
  document.getElementById('toggle-dark')?.classList.toggle('on', state.settings.darkMode);
}

// ── 토글 클릭 ─────────────────────────────────────────────────────
function bindToggle(id, key, { onChange } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    if (el.classList.contains('disabled')) return;
    state.settings[key] = !state.settings[key];
    el.classList.toggle('on', state.settings[key]);
    saveSettings();
    onChange?.();
  });
}

// ── 진행 초기화 (확인 후) ─────────────────────────────────────────
function bindResetProgress() {
  const btn = document.getElementById('btn-reset-progress');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const ok = window.confirm('도감과 별을 모두 초기화할까요?\n(설정은 유지됩니다)');
    if (!ok) return;
    resetProgress();
    btn.textContent = '✅ 초기화됨';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = '🗑 도감·별 초기화'; btn.disabled = false; }, 1400);
  });
}

// ── 기본값 복원 ───────────────────────────────────────────────────
function bindResetDefaults() {
  const btn = document.getElementById('btn-reset-settings');
  if (!btn) return;
  btn.addEventListener('click', () => {
    resetSettings();
    applyTheme();
    renderSettings();
  });
}

// ── 진입점: DOMContentLoaded 이후 한 번만 호출 ────────────────────
export function initSettings() {
  applyTheme();
  bindToggle('toggle-tts',   'ttsEnabled');
  bindToggle('toggle-audio', 'audioEnabled');
  bindToggle('toggle-pulse', 'pulseEnabled');
  bindToggle('toggle-dark',  'darkMode', { onChange: applyTheme });
  bindResetDefaults();
  bindResetProgress();
}
