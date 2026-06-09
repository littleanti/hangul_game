// 도감(컬렉션) 화면 — F14·F15
// 100칸 그리드 + 급수 필터(전체 / 8급 / 7급II).
//
// localStorage 키 `4md:collectionFilter` 로 마지막 선택을 기억(F19 영속화 정책과 동일).
import { HANJA, HANJA_IDS } from '../data/hanja.js';
import { state }            from './state.js';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: '8',   label: '8급' },
  { key: '7',   label: '7급Ⅱ' },
];
const FILTER_STORAGE_KEY = '4md:collectionFilter';

function getFilter() {
  try { return localStorage.getItem(FILTER_STORAGE_KEY) || 'all'; }
  catch { return 'all'; }
}
function setFilter(key) {
  try { localStorage.setItem(FILTER_STORAGE_KEY, key); } catch {}
}

function filteredIds(filter) {
  if (filter === '8') return HANJA_IDS.filter(id => HANJA[id].grade === 8);
  if (filter === '7') return HANJA_IDS.filter(id => HANJA[id].grade === 7);
  return HANJA_IDS;
}

function renderGrid(container, filter) {
  const collected = state.progress.collected;
  const ids = filteredIds(filter);
  const collectedInFilter = ids.filter(id => collected.has(id)).length;

  container.innerHTML = `
    <h2 class="collection-title">📚 한자 도감</h2>
    <p class="collection-subtitle">발견한 한자: ${collectedInFilter} / ${ids.length}</p>

    <div class="collection-filter" role="tablist" aria-label="급수 필터">
      ${FILTERS.map(f => `
        <button class="filter-chip ${f.key === filter ? 'active' : ''}"
                role="tab" aria-selected="${f.key === filter}"
                data-filter="${f.key}">${f.label}</button>
      `).join('')}
    </div>

    <div class="collection-grid" role="list">
      ${ids.map(id => {
        const h = HANJA[id];
        const found = collected.has(id);
        return `
          <div class="collection-card ${found ? 'found' : 'locked'}"
               role="listitem"
               aria-label="${found ? `${h.reading} ${h.meaning} (${h.grade}급)` : '미발견 한자'}">
            <div class="collection-card-hanja">${found ? id : '?'}</div>
            ${found
              ? `<div class="collection-card-reading">${h.reading}</div>
                 <div class="collection-card-meaning">${h.meaning}</div>
                 <div class="collection-card-grade">${h.grade}급${h.grade === 7 ? 'Ⅱ' : ''}</div>`
              : '<div class="collection-card-lock">🔒</div>'
            }
          </div>
        `;
      }).join('')}
    </div>

    <div class="collection-actions">
      <button id="btn-collection-back" class="btn ghost small">← 돌아가기</button>
    </div>
  `;
}

export function renderCollectionScreen() {
  const container = document.querySelector('#collection-screen .card-screen');
  if (!container) return;

  const initial = getFilter();
  renderGrid(container, initial);

  // 필터 chip 위임
  container.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    const next = chip.dataset.filter;
    if (!next || next === getFilter()) return;
    setFilter(next);
    renderGrid(container, next);
  });
}
