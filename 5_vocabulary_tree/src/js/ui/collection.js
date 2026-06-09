// 한자 도감 — 100자 전부 오픈 상태로 표시.
// 급수 필터(전체 / 8급 / 7급II) + 한자 카드를 누르면 그 한자로 만든 어휘가 펼쳐진다.
// (도감의 모든 한자는 잠금 없이 열려 있음 — 4_morpheme_detective와 달리 locked 상태 없음.)

import { HANJA } from '../../data/hanja.js';
import { getWordsForHanja } from '../../data/words.js';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: '8',   label: '8급' },
  { key: '7',   label: '7급II' },
  { key: '6',   label: '6급' },
  { key: '5',   label: '5급' },
];

const FILTER_STORAGE_KEY = 'vt:dogamFilter';

function getFilter() {
  try { return localStorage.getItem(FILTER_STORAGE_KEY) || 'all'; }
  catch { return 'all'; }
}
function setFilter(key) {
  try { localStorage.setItem(FILTER_STORAGE_KEY, key); } catch {}
}

function filteredHanja(filter) {
  const lv = Number(filter);
  if ([8, 7, 6, 5].includes(lv)) return HANJA.filter(h => h.level === lv);
  return HANJA;
}

function levelLabel(level) {
  return level === 7 ? '7급II' : `${level}급`;
}

let _onClose = null;

export function renderCollection(rootEl, { onClose } = {}) {
  _onClose = onClose;
  draw(rootEl, getFilter());
}

function draw(rootEl, filter) {
  const list = filteredHanja(filter);
  rootEl.innerHTML = `
    <div class="screen-header">
      <h2>📚 한자 도감</h2>
      <button class="close-btn" id="dogam-back" aria-label="홈">✕</button>
    </div>
    <p class="dogam-sub">한자 <strong>${list.length}</strong>자 · 글자를 누르면 어휘가 펼쳐져요</p>
    <div class="dogam-filter" role="tablist" aria-label="급수 필터">
      ${FILTERS.map(f => `
        <button class="dogam-chip ${f.key === filter ? 'active' : ''}"
                role="tab" aria-selected="${f.key === filter}"
                data-filter="${f.key}">${f.label}</button>
      `).join('')}
    </div>
    <div class="dogam-grid" id="dogam-grid" role="list">
      ${list.map(h => `
        <button class="dogam-card" data-id="${h.id}" role="listitem"
                aria-label="${h.hun} ${h.eum} ${levelLabel(h.level)}">
          <span class="dogam-glyph hanja">${h.code}</span>
          <span class="dogam-read">${h.hun} ${h.eum}</span>
          <span class="dogam-grade">${levelLabel(h.level)}</span>
        </button>
      `).join('')}
    </div>
  `;

  rootEl.querySelector('#dogam-back')?.addEventListener('click', () => _onClose?.());

  rootEl.querySelector('.dogam-filter')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.dogam-chip');
    if (!chip) return;
    const next = chip.dataset.filter;
    if (!next || next === getFilter()) return;
    setFilter(next);
    draw(rootEl, next);
  });

  rootEl.querySelector('#dogam-grid')?.addEventListener('click', (e) => {
    const card = e.target.closest('.dogam-card');
    if (!card) return;
    openDetail(Number(card.dataset.id));
  });
}

function openDetail(hanjaId) {
  const h = HANJA.find(x => x.id === hanjaId);
  if (!h) return;
  const words = getWordsForHanja(hanjaId);

  document.getElementById('dogam-detail')?.remove();

  const ov = document.createElement('div');
  ov.id = 'dogam-detail';
  ov.className = 'dogam-detail';
  ov.innerHTML = `
    <div class="dogam-detail-card" role="dialog" aria-modal="true" aria-label="${h.hun} ${h.eum} 어휘">
      <button class="dogam-detail-close" aria-label="닫기">✕</button>
      <div class="dogam-detail-head">
        <span class="dogam-detail-glyph hanja">${h.code}</span>
        <div class="dogam-detail-info">
          <div class="dogam-detail-read">${h.hun} ${h.eum}</div>
          <div class="dogam-detail-meta">${levelLabel(h.level)} · ${h.strokes}획 · 부수 ${h.radical}</div>
        </div>
      </div>
      <div class="dogam-detail-label">이 한자로 만든 어휘 <strong>${words.length}</strong></div>
      <div class="dogam-detail-words">
        ${words.length
          ? words.map(w => `
              <div class="dogam-word">
                <span class="dogam-word-text">${w.text}</span>
                <span class="dogam-word-mean">${w.meaning}</span>
              </div>`).join('')
          : '<div class="dogam-empty">아직 등록된 어휘가 없어요</div>'}
      </div>
    </div>
  `;
  document.body.appendChild(ov);

  const close = () => ov.remove();
  ov.querySelector('.dogam-detail-close')?.addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  requestAnimationFrame(() => ov.classList.add('shown'));
}
