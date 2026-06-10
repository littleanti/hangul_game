// 어휘 잎 — DOM 노드 (hit zone 확보) + 간단 파티클
import { slotEndToScreen } from './render.js';

export function placeLeaf(container, stageEl, { slotIdx, word, golden = false, onClick }) {
  const pos = slotEndToScreen(stageEl, slotIdx);
  const leaf = document.createElement('div');
  leaf.className = 'leaf' + (golden ? ' golden' : '');
  leaf.style.left = `${pos.x}px`;
  leaf.style.top = `${pos.y}px`;
  leaf.dataset.wordId = word.id;
  leaf.innerHTML = `
    <div class="leaf-shape"></div>
    <div class="leaf-text"></div>
  `;
  leaf.querySelector('.leaf-text').textContent = word.text;
  if (onClick) {
    leaf.addEventListener('click', () => onClick(word));
  }
  container.appendChild(leaf);
  // 다음 프레임에 scale-in 트리거
  requestAnimationFrame(() => {
    requestAnimationFrame(() => leaf.classList.add('shown'));
  });
  return leaf;
}

// 잎 위치 재계산 (resize 등)
export function repositionLeaves(container, stageEl, words, slotMap) {
  container.querySelectorAll('.leaf').forEach(leaf => {
    const wid = Number(leaf.dataset.wordId);
    const slotIdx = slotMap.get(wid);
    if (slotIdx == null) return;
    const pos = slotEndToScreen(stageEl, slotIdx);
    leaf.style.left = `${pos.x}px`;
    leaf.style.top = `${pos.y}px`;
  });
}

// 골든 파티클 (학술 보스 보상용)
export function celebrateLeaf(stageEl, slotIdx) {
  const pos = slotEndToScreen(stageEl, slotIdx);
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      left: ${pos.x}px;
      top: ${pos.y}px;
      width: 8px; height: 8px;
      background: var(--yellow);
      border-radius: 50%;
      pointer-events: none;
      z-index: 30;
      transform: translate(-50%, -50%);
      transition: transform 0.7s ease-out, opacity 0.7s ease-out;
    `;
    stageEl.appendChild(p);
    const dx = (Math.random() - 0.5) * 100;
    const dy = -Math.random() * 80 - 20;
    requestAnimationFrame(() => {
      p.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 800);
  }
}
