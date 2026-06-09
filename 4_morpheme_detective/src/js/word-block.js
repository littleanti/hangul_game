// 단어 → 음절 블록 컴포넌트 — TRD §5.2 / PRD F7·F8
// 음절 spread + 핵심 한자 음절 hl 트랜지션.
import { splitWord } from './hangul.js';
import { state }     from './state.js';

const CONTAINER_ID = 'word-block-container';

function ensureContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (el) return el;
  const dock = document.getElementById('stage-dock');
  if (!dock) return null;
  el = document.createElement('div');
  el.id = CONTAINER_ID;
  el.className = 'word-block-container';
  el.setAttribute('aria-live', 'polite');
  dock.appendChild(el);
  return el;
}

export function showWord({ text, syllables, targetSyllableIdx, targetHanjaId, wordId }) {
  const container = ensureContainer();
  if (!container) return;

  const list = Array.isArray(syllables) && syllables.length ? syllables : splitWord(text);

  container.innerHTML = '';
  list.forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'syllable';
    span.textContent = ch;
    span.dataset.idx = String(i);
    if (i === targetSyllableIdx) span.dataset.target = '1';
    container.appendChild(span);
  });

  state.detection.activeWordId      = wordId || null;
  state.detection.syllables         = list;
  state.detection.targetHanja       = targetHanjaId || null;
  state.detection.targetSyllableIdx = (typeof targetSyllableIdx === 'number') ? targetSyllableIdx : -1;

  // 다음 프레임에 spread + hl 트리거 (트랜지션 적용)
  requestAnimationFrame(() => {
    container.querySelectorAll('.syllable').forEach(el => el.classList.add('spread'));
    const target = container.querySelector('.syllable[data-target="1"]');
    if (target) {
      // 살짝 늦게 하이라이트해 분리 → 하이라이트 단계감
      setTimeout(() => target.classList.add('hl'), 220);
    }
  });
}

export function clearWord() {
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.innerHTML = '';
  state.detection.activeWordId      = null;
  state.detection.syllables         = [];
  state.detection.targetHanja       = null;
  state.detection.targetSyllableIdx = -1;
}
