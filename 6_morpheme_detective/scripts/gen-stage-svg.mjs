#!/usr/bin/env node
// stages.js 의 매트릭스를 기반으로 src/assets/stages/{id}.svg 10장을 일괄 생성.
//
// 각 SVG 는 stages.js 의 grid polygon 위치(5×2, viewBox 1600×900)에 정확히
// 들어맞는 placeholder 카드를 그린다 — 이모지 + 어휘 라벨 + 반투명 사각형.
//
// 기본 동작: 이미 존재하는 SVG 는 덮어쓰지 않음 (손그림 보호).
// 강제로 placeholder 로 되돌리려면 FORCE=1 환경변수 설정.
//
// 사용:
//   node scripts/gen-stage-svg.mjs          # 신규 stage 만 생성
//   FORCE=1 node scripts/gen-stage-svg.mjs  # 모든 stage placeholder 덮어쓰기

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');
const OUT_DIR    = path.join(ROOT, 'src', 'assets', 'stages');

// 장면별 배경 톤 + 객체 10개 이모지 (stages.js 매트릭스 순서와 1:1 대응)
const STAGE_VISUALS = {
  'parking-lot': {
    top: '#87CEEB', bot: '#FFE4B5',
    emojis: ['🚗','🅿️','🛣️','🏃','⚡','🏛️','🧭','🚲','🦺','🚧'],
  },
  'classroom': {
    top: '#FFF6E4', bot: '#A8D5BA',
    emojis: ['📕','🎒','👦','🌱','🚻','👩‍🏫','🧑','👧','🇰🇷','📝'],
  },
  'family-home': {
    top: '#FFDAB9', bot: '#FFE4E1',
    emojis: ['👨‍👩‍👧‍👦','👨','👩','👦','👧','🧒','🧑‍🤝‍🧑','📛','💬','🌸'],
  },
  'school-cafeteria': {
    top: '#FFFACD', bot: '#DEB887',
    emojis: ['🍱','🌳','⭐','🚰','👏','✅','💭','📋','➡️','⬅️'],
  },
  'fire-station': {
    top: '#FF8C8C', bot: '#FFD1D1',
    emojis: ['🔥','👨‍🚒','👥','🎯','⚖️','🚨','☮️','🏗️','⛏️','🕒'],
  },
  'nature-park': {
    top: '#87CEEB', bot: '#90EE90',
    emojis: ['⛰️','🌊','🏖️','🪨','🙌','🎯','🐦','🌲','🪴','🚜'],
  },
  'market': {
    top: '#FFD700', bot: '#FFA07A',
    emojis: ['🏪','📦','💵','📅','🌍','🏬','⏰','🌅','📚','🏠'],
  },
  'sky-time': {
    top: '#FF7F50', bot: '#FFD700',
    emojis: ['☀️','🌙','📅','☁️','✈️','🧍','🧑','⬜','🌐','🧭'],
  },
  'street': {
    top: '#B0C4DE', bot: '#778899',
    emojis: ['🚪','👜','📞','💬','📝','🛒','🤴','⬆️','⬇️','🥩'],
  },
  'numbers-class': {
    top: '#E6E6FA', bot: '#AFEEEE',
    emojis: ['🥇','🥈','🔺','4️⃣','⬟','6️⃣','⭐','🗺️','✖️','🔟'],
  },
};

// stages.js 와 동일 grid: 5×2, cell 240×260, start (90,90), gap (295,410)
function gridPos(idx) {
  const row = Math.floor(idx / 5);
  const col = idx % 5;
  return {
    x: 90 + col * 295,
    y: 90 + row * 410,
    w: 240,
    h: 260,
  };
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

function makeSvg(stage, visuals) {
  const cells = stage.clickableObjects.map((obj, i) => {
    const { x, y, w, h } = gridPos(i);
    const cx = x + w / 2;
    const word = stage.words[obj.wordId]?.text ?? obj.label;
    const emoji = visuals.emojis[i] ?? '⬛';
    return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22"
            fill="#FFFFFF" stroke="#2D3047" stroke-width="3" opacity="0.92"/>
      <text x="${cx}" y="${y + 120}" text-anchor="middle"
            font-size="96" dominant-baseline="middle">${escapeXml(emoji)}</text>
      <text x="${cx}" y="${y + h - 30}" text-anchor="middle"
            font-family="'Gowun Dodum', sans-serif" font-size="26"
            fill="#2D3047">${escapeXml(word)}</text>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"
     preserveAspectRatio="xMidYMid meet"
     aria-label="${escapeXml(stage.name)} 일러스트">
  <defs>
    <linearGradient id="bg-${stage.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="${visuals.top}"/>
      <stop offset="1"   stop-color="${visuals.bot}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1600" height="900" fill="url(#bg-${stage.id})"/>
  <text x="800" y="58" text-anchor="middle"
        font-family="'Jua', sans-serif" font-size="44"
        fill="#2D3047" opacity="0.55">${escapeXml(stage.name)}</text>
${cells}
</svg>
`;
}

async function main() {
  // 기본은 skip-existing (손그림 보호). FORCE=1 이어야 덮어쓰기.
  const skipExisting = process.env.FORCE !== '1';
  const stagesUrl = pathToFileURL(path.join(ROOT, 'src', 'data', 'stages.js'));
  const { STAGES } = await import(stagesUrl);

  await fs.mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  for (const stage of Object.values(STAGES)) {
    const visuals = STAGE_VISUALS[stage.id];
    if (!visuals) {
      console.warn(`[gen-stage-svg] visuals 없음: ${stage.id} — 스킵`);
      skipped++;
      continue;
    }
    const outPath = path.join(OUT_DIR, `${stage.id}.svg`);
    if (skipExisting) {
      try { await fs.access(outPath); skipped++; continue; } catch {}
    }
    await fs.writeFile(outPath, makeSvg(stage, visuals), 'utf8');
    written++;
  }
  console.log(`[gen-stage-svg] written=${written} skipped=${skipped} (FORCE=${process.env.FORCE === '1' ? 'on' : 'off'})`);
}

main().catch(e => { console.error(e); process.exit(1); });
