// 미션 카드 — PRD F12
// renderMissionScreen(): mission-screen DOM 렌더
// buildMissionSVG(): foreignObject 없이 SVG <text> 기반 (공유/다운로드용)
import { HANJA } from '../data/hanja.js';

export function renderMissionScreen(sessionCollected, { onEnd } = {}) {
  const container = document.querySelector('#mission-screen .card-screen');
  if (!container) return;

  const mainHanjaId = sessionCollected[0];
  const hanja       = HANJA[mainHanjaId];

  if (!mainHanjaId || !hanja) {
    container.innerHTML = `
      <h2 class="mission-title">🌟 미션 완료!</h2>
      <p style="color:var(--color-text-dim);margin:20px 0">
        이번에는 한자를 발견하지 못했어요. 다시 도전해보세요!
      </p>
      <button id="btn-mission-end" class="btn">✅ 활동 마치기</button>
    `;
    document.getElementById('btn-mission-end')?.addEventListener('click', () => onEnd?.());
    return;
  }

  const vocabList = hanja.vocab.slice(0, 5);

  container.innerHTML = `
    <h2 class="mission-title">🌟 미션 완료!</h2>
    <div class="mission-card">
      <div class="mission-hanja" aria-label="${hanja.reading} ${hanja.meaning}">${mainHanjaId}</div>
      <div class="mission-reading">${hanja.reading} · ${hanja.meaning}</div>
      <div class="mission-vocab" aria-label="관련 단어">
        ${vocabList.map(w => `<span class="mission-vocab-item">${w}</span>`).join('')}
      </div>
      <div class="mission-challenge">
        <p class="mission-challenge-title">🔍 부모와 함께 찾아보기</p>
        <p class="mission-challenge-text">'${hanja.reading}'이 들어간 단어를 오늘 길에서 찾아보세요!</p>
      </div>
    </div>
    <div class="mission-actions">
      <button id="btn-mission-share" class="btn mint">📤 공유하기</button>
      <button id="btn-mission-end"   class="btn"     >✅ 활동 마치기</button>
    </div>
  `;

  document.getElementById('btn-mission-share')?.addEventListener('click', () => {
    _shareMission(mainHanjaId);
  });
  document.getElementById('btn-mission-end')?.addEventListener('click', () => onEnd?.());
}

function _shareMission(hanjaId) {
  const hanja = HANJA[hanjaId];
  if (!hanja) return;

  const text = `오늘은 '${hanjaId}(${hanja.reading}, ${hanja.meaning})' 한자를 발견했어요!\n관련 단어: ${hanja.vocab.slice(0, 3).join(', ')}\n\n🔍 형태소 탐정`;

  if (navigator.share) {
    navigator.share({ title: '형태소 탐정 미션 카드', text }).catch(() => {});
    return;
  }

  const svg = _buildMissionSVG(hanjaId);
  _downloadSVG(svg, `mission-${hanjaId}.svg`);
}

// SVG <text> 기반 — foreignObject 금지 (PRD 정책)
function _buildMissionSVG(hanjaId) {
  const hanja = HANJA[hanjaId];
  const vocab = hanja.vocab.slice(0, 5);
  const W = 600, H = 440;

  const gap   = Math.min(100, Math.floor((W - 80) / vocab.length));
  const vocabX = Math.round((W - gap * (vocab.length - 1)) / 2);
  const vocabItems = vocab.map((w, i) =>
    `<text x="${vocabX + i * gap}" y="308" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#2D3047">${w}</text>`
  ).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="24" fill="#FFF6E4"/>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="22" fill="none" stroke="#FF7757" stroke-width="4"/>
  <text x="${W / 2}" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#FF7757">오늘의 탐정 미션 카드</text>
  <text x="${W / 2}" y="168" text-anchor="middle" font-family="serif" font-size="100" fill="#2D3047">${hanjaId}</text>
  <text x="${W / 2}" y="208" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#6b6e82">${hanja.reading} · ${hanja.meaning}</text>
  <line x1="60" y1="228" x2="${W - 60}" y2="228" stroke="#E5E1D6" stroke-width="1.5"/>
  <text x="${W / 2}" y="258" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6b6e82">관련 단어</text>
  ${vocabItems}
  <line x1="60" y1="328" x2="${W - 60}" y2="328" stroke="#E5E1D6" stroke-width="1.5"/>
  <text x="${W / 2}" y="364" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#FF7757">부모와 함께: '${hanja.reading}'이 들어간 단어를 찾아보세요!</text>
  <text x="${W / 2}" y="410" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#aaa">형태소 탐정 — 익숙한 단어 속 숨은 한자를 찾아라</text>
</svg>`;
}

function _downloadSVG(content, filename) {
  const blob = new Blob([content], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
