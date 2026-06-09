// 음절 블록 floating 생성
// 한 어휘에 필요한 음절 + 더미 분산 음절을 stage 안에 떠다니게 배치

import { buildSyllablePool } from '../utils.js';

export function spawnBlocks(container, stageEl, word) {
  // 기존 블록 제거
  container.querySelectorAll('.syllable-block').forEach(b => b.remove());

  const rect = stageEl.getBoundingClientRect();
  const pool = buildSyllablePool(word.syllables, 4);

  // upper area only (트렁크/잎 영역과 겹치지 않게)
  const safeTop = rect.height * 0.05;
  const safeBottom = rect.height * 0.45;
  const safeLeft = 14;
  const safeRight = rect.width - 70;

  const placed = [];
  const tryPlace = () => {
    for (let attempts = 0; attempts < 20; attempts++) {
      const x = safeLeft + Math.random() * (safeRight - safeLeft);
      const y = safeTop + Math.random() * (safeBottom - safeTop);
      // 최소 거리 70
      const ok = placed.every(p => Math.hypot(p.x - x, p.y - y) > 70);
      if (ok) {
        placed.push({ x, y });
        return { x, y };
      }
    }
    return {
      x: safeLeft + Math.random() * (safeRight - safeLeft),
      y: safeTop + Math.random() * (safeBottom - safeTop),
    };
  };

  pool.forEach((syl, i) => {
    const { x, y } = tryPlace();
    const el = document.createElement('div');
    el.className = 'syllable-block floating';
    el.textContent = syl;
    el.dataset.syllable = syl;
    el.dataset.id = `b${i}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    el.style.setProperty('--float-base', `translate(${x}px, ${y}px)`);
    el.style.setProperty('--float-dur', `${5 + Math.random() * 3}s`);
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.dataset.x = String(x);
    el.dataset.y = String(y);
    container.appendChild(el);
  });
}

export function clearBlocks(container) {
  container.querySelectorAll('.syllable-block').forEach(b => b.remove());
}

// 한 블록을 정답 처리 (페이드 아웃)
export function consumeBlock(el) {
  el.classList.add('matched');
  setTimeout(() => el.remove(), 360);
}

// 블록 잘못된 위치 → 원위치
export function returnBlock(el) {
  el.classList.add('wrong');
  const x = Number(el.dataset.x);
  const y = Number(el.dataset.y);
  el.style.transform = `translate(${x}px, ${y}px)`;
  setTimeout(() => el.classList.remove('wrong'), 420);
}
