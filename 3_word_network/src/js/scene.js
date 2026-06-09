import { speak } from './tts.js';

export function renderScene(scene, targetWords) {
  const area = document.getElementById('scene-area');
  if (!area) return;
  area.innerHTML = '';
  area.style.cssText = '';

  // gradient background (always set as fallback)
  if (scene.bgColors?.length >= 2) {
    area.style.background = `linear-gradient(160deg, ${scene.bgColors[0]}, ${scene.bgColors[1]})`;
  } else {
    area.style.background = 'linear-gradient(160deg, #e8f4f8, #b3d9f0)';
  }

  // photo background
  if (scene.bgImage) {
    const img = document.createElement('img');
    img.className = 'scene-bg-photo';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.src = scene.bgImage;
    area.appendChild(img);
  }

  // dark overlay for readability
  const overlay = document.createElement('div');
  overlay.className = 'scene-overlay';
  area.appendChild(overlay);

  // atmospheric background emojis (accent only)
  const bg = document.createElement('div');
  bg.className = 'scene-bg';
  for (const e of (scene.bgEmojis ?? [])) {
    const span = document.createElement('span');
    span.textContent = e;
    bg.appendChild(span);
  }
  area.appendChild(bg);

  // scene name badge
  const badge = document.createElement('div');
  badge.className = 'scene-name-badge';
  badge.textContent = `${scene.emoji} ${scene.name}`;
  area.appendChild(badge);

  // target items at hotspot positions
  for (const word of targetWords) {
    const item = document.createElement('div');
    item.className = 'target-item';
    item.dataset.wordId = word.id;
    item.style.left = `${word.hotspot.x * 100}%`;
    item.style.top = `${word.hotspot.y * 100}%`;
    item.style.transform = 'translate(-50%, -50%)';
    item.style.position = 'absolute';
    item.addEventListener('click', () => speak(word.word));

    const emoji = document.createElement('div');
    emoji.className = 'target-emoji';
    emoji.textContent = word.emoji;

    const label = document.createElement('div');
    label.className = 'target-label';
    label.textContent = word.word;

    item.appendChild(emoji);
    item.appendChild(label);
    area.appendChild(item);
  }
}

export function markWordMatched(wordId) {
  const item = document.querySelector(`.target-item[data-word-id="${wordId}"]`);
  if (item) item.classList.add('matched');
}
