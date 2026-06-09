export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

export function showFlash(message, type = 'info') {
  let el = document.getElementById('flash-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash-msg';
    el.className = 'flash';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `flash ${type}`;
  requestAnimationFrame(() => {
    el.classList.add('visible');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('visible');
    }, 1800);
  });
}

export function animateShake(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // force reflow
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

export function animateSparkle(el) {
  el.classList.remove('sparkle');
  void el.offsetWidth;
  el.classList.add('sparkle');
  el.addEventListener('animationend', () => el.classList.remove('sparkle'), { once: true });
}

export function updateProgress(current, total) {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (fill) fill.style.width = `${Math.max(0, (current - 1) / total * 100)}%`;
  if (text) text.textContent = `장면 ${current} / ${total}`;
}

export function updateScore(score) {
  const el = document.getElementById('score-badge');
  if (el) el.textContent = `🏆 ${score}`;
}
