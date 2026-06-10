// 어휘 의미 카드 + 오답 미니퀴즈
import { speak, cancel as cancelTTS } from '../tts.js';
import { getHanja } from '../../data/hanja.js';
import { WORDS } from '../../data/words.js';
import { shuffle } from '../utils.js';

const root = () => document.getElementById('modal-root');

function ensureOverlay() {
  let el = root();
  if (!el) {
    el = document.createElement('div');
    el.id = 'modal-root';
    el.className = 'modal-overlay';
    document.body.appendChild(el);
  }
  return el;
}

function close() {
  cancelTTS();
  const el = root();
  if (el) { el.classList.remove('show'); el.innerHTML = ''; }
}

function open(html) {
  const el = ensureOverlay();
  el.innerHTML = html;
  el.classList.add('show');
  el.addEventListener('click', (e) => {
    if (e.target === el) close();
  }, { once: true });
  return el;
}

// 한자 분해 표시 — 어휘 음절별로 한자를 매칭 (간단 매칭)
function decomposeHTML(word) {
  const mainHanja = getHanja(word.hanjaId);
  const tiles = word.syllables.map((syl) => {
    if (mainHanja && (syl === mainHanja.eum || (mainHanja.id === 6 && syl === '유') ||
        (mainHanja.id === 10 && syl === '시') || (mainHanja.id === 33 && syl === '여') ||
        (mainHanja.id === 41 && syl === '연'))) {
      return `<div class="hanja-tile">
        <span class="glyph hanja">${mainHanja.code}</span>
        <span class="label">${mainHanja.hun} ${mainHanja.eum}</span>
      </div>`;
    }
    return `<div class="hanja-tile">
      <span class="glyph">${syl}</span>
      <span class="label">음절</span>
    </div>`;
  });
  return `<div class="hanja-decompose">${tiles.join('')}</div>`;
}

export function showLeafModal(word, { autoSpeak = true, onClose, autoNextLabel = '다음 어휘 →' } = {}) {
  const html = `
    <div class="modal leaf-modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>🍃 새 어휘</h2>
        <button class="close-btn" id="leaf-close">✕</button>
      </div>
      <div class="word-display">${word.text}</div>
      <div class="meaning">${word.meaning}</div>
      <p class="example">예: ${word.example}</p>
      ${decomposeHTML(word)}
      <div class="actions">
        <button class="btn small ghost" id="leaf-speak">🔊 듣기</button>
        <button class="btn small mint" id="leaf-next">${autoNextLabel}</button>
      </div>
    </div>
  `;
  const el = open(html);
  const handleClose = () => { close(); onClose?.(); };
  el.querySelector('#leaf-close').addEventListener('click', handleClose);
  el.querySelector('#leaf-next').addEventListener('click', handleClose);
  el.querySelector('#leaf-speak').addEventListener('click', () => speak(word.text));
  if (autoSpeak) {
    setTimeout(() => speak(word.text), 220);
  }
}

// 오답 미니퀴즈 — 정답 어휘 + 가짜 3개에서 4지선다
export function showMiniquiz(targetWord, { onResult } = {}) {
  const fakes = shuffle(
    WORDS.filter(w => w.id !== targetWord.id && w.hanjaId !== targetWord.hanjaId)
  ).slice(0, 3);
  const options = shuffle([targetWord, ...fakes]);
  const html = `
    <div class="modal miniquiz" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>📝 다시 풀어요</h2>
        <button class="close-btn" id="mq-close">✕</button>
      </div>
      <p class="question">아래 의미에 맞는 어휘를 골라요:</p>
      <div class="meaning" style="background:white;border:2px solid var(--navy);border-radius:16px;padding:14px;text-align:center;font-family:'Gowun Dodum',sans-serif;">
        ${targetWord.meaning}
      </div>
      <div class="options">
        ${options.map(o => `<button class="opt" data-id="${o.id}">${o.text}</button>`).join('')}
      </div>
    </div>
  `;
  const el = open(html);
  const close2 = () => close();
  el.querySelector('#mq-close').addEventListener('click', () => { onResult?.({ skipped: true }); close2(); });
  el.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const correct = id === targetWord.id;
      btn.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) {
        const right = el.querySelector(`.opt[data-id="${targetWord.id}"]`);
        if (right) right.classList.add('correct');
      }
      setTimeout(() => {
        onResult?.({ correct, picked: id });
        close2();
      }, correct ? 700 : 1100);
    }, { once: true });
  });
}

export function closeModal() { close(); }
