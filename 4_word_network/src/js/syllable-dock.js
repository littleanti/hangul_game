import { shuffle, sampleDistinct } from './utils.js';
import { DECOY_COUNT, SYLLABLE_POOL, MAX_DOCK_SYLLABLES } from './config.js';

export function buildDock(targetWords, difficulty, customDecoyCount) {
  const correct = targetWords.flatMap(w => w.syllables);
  const decoyCount = difficulty === 'custom' ? (customDecoyCount ?? 5) : (DECOY_COUNT[difficulty] ?? 3);
  const maxDecoys = MAX_DOCK_SYLLABLES - correct.length;
  const decoys = sampleDistinct(SYLLABLE_POOL, Math.min(decoyCount, maxDecoys), correct);
  return shuffle([...correct, ...decoys]).map((char, i) => ({
    id: `syl-${i}-${char}-${Date.now()}`,
    char,
    used: false,
  }));
}

export function renderDock(syllables, onTap) {
  const dock = document.getElementById('syllable-dock');
  if (!dock) return;
  dock.innerHTML = '';
  for (const syl of syllables) {
    const btn = document.createElement('button');
    btn.className = 'syllable-block' + (syl.used ? ' used' : '');
    btn.dataset.sylId = syl.id;
    btn.textContent = syl.char;
    btn.setAttribute('aria-label', syl.char);
    if (!syl.used) {
      btn.addEventListener('click', () => onTap(syl), { once: true });
    }
    dock.appendChild(btn);
  }
}

export function markUsed(syllableId) {
  const btn = document.querySelector(`[data-syl-id="${CSS.escape(syllableId)}"]`);
  if (btn) {
    btn.classList.add('used');
    btn.disabled = true;
  }
}

export function unmarkUsed(syllableId) {
  const btn = document.querySelector(`[data-syl-id="${CSS.escape(syllableId)}"]`);
  if (btn) {
    btn.classList.remove('used');
    btn.disabled = false;
  }
}
