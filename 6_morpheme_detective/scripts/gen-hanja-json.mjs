#!/usr/bin/env node
// hanja.js 의 HANJA 메타로부터 src/assets/hanja/{id}.json 100개를 일괄 생성.
//
// 3-step morph 구성:
//   [0] 일반 원형 silhouette (placeholder, viewBox 1024 좌표)
//   [1] 변형 단계 intermediate (placeholder, 동일 token 수 → lerp 가능)
//   [2] 실 한자 stroke path — hanzi-writer-data (Make Me a Hanzi 파생) 에서 추출.
//       y 축 flip(900-y) 으로 SVG 좌표계로 변환. 토큰 수 미스매치 → cross-fade.
// 마지막에 system CJK 글리프 stage 가 morph.js 에서 자동 fade-in.
//
// hanzi-writer-data 가 설치되어 있지 않으면 실 stroke 가 placeholder 로 대체된다.
//
// 사용:
//   node scripts/gen-hanja-json.mjs              # 신규/누락만 생성
//   FORCE=1 node scripts/gen-hanja-json.mjs      # 모두 덮어쓰기

import { promises as fs, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');
const OUT_DIR    = path.join(ROOT, 'src', 'assets', 'hanja');
const HW_DATA    = path.join(ROOT, 'node_modules', 'hanzi-writer-data');

// ── placeholder paths (viewBox 0 0 1024 1024, 동일 토큰 수 = M+6L+Z = 8) ──
const PLACEHOLDER_SILHOUETTE   = 'M 512 100 L 870 232 L 924 600 L 700 880 L 324 880 L 100 600 L 154 232 Z';
const PLACEHOLDER_INTERMEDIATE = 'M 512 80 L 800 230 L 900 580 L 720 870 L 304 870 L 124 580 L 224 230 Z';

// ── path y 축 flip: hanzi-writer-data 의 y-up 좌표를 일반 SVG 의 y-down 으로 ──
// M/L/T/C/Q/S 는 인자 (x,y) 쌍/세쌍 → y 만 maxY-y 로 변환.
// H/V/Z 는 특수 처리. A(arc) 는 데이터에 없다고 가정.
function flipPathY(d, maxY = 900) {
  return d.replace(/[A-Za-z][^A-Za-z]*/g, seg => {
    const cmd = seg[0];
    if (cmd === 'Z' || cmd === 'z') return cmd;
    const nums = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (cmd === 'H' || cmd === 'h') return seg; // x 만 — 변환 불필요
    if (cmd === 'V' || cmd === 'v') {
      return cmd + ' ' + nums.map(n => maxY - n).join(' ');
    }
    // M/L/T/C/Q/S — i 가 홀수면 y
    const out = nums.map((n, i) => i % 2 === 1 ? maxY - n : n);
    return cmd + ' ' + out.join(' ');
  });
}

// hanzi-writer-data 로컬 파일에서 strokes 로드
function loadHanziStrokes(id) {
  const file = path.join(HW_DATA, `${id}.json`);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(data.strokes) ? data.strokes : null;
  } catch (e) {
    console.warn(`[gen-hanja-json] ${id}: parse error`, e.message);
    return null;
  }
}

async function main() {
  const force = process.env.FORCE === '1';
  const hanjaUrl = pathToFileURL(path.join(ROOT, 'src', 'data', 'hanja.js'));
  const { HANJA, HANJA_IDS } = await import(hanjaUrl);

  await fs.mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  let real = 0;
  let placeholder = 0;
  for (const id of HANJA_IDS) {
    const meta    = HANJA[id];
    const outPath = path.join(OUT_DIR, `${id}.json`);

    if (!force && existsSync(outPath)) {
      // skip-existing 모드는 hanja JSON 에는 적용 안 함 — 항상 갱신 (hanja.js 가 진실원)
    }

    const strokes = loadHanziStrokes(id);
    let realStrokePath;
    let source;
    let strokeCount;
    if (strokes && strokes.length) {
      realStrokePath = strokes.map(s => flipPathY(s, 900)).join(' ');
      source = 'hanzi-writer-data@2.0.1 (Make Me a Hanzi / Arphic Public License)';
      strokeCount = strokes.length;
      real++;
    } else {
      realStrokePath = PLACEHOLDER_INTERMEDIATE;
      source = 'placeholder (hanzi-writer-data 미설치 또는 한자 없음)';
      strokeCount = null;
      placeholder++;
    }

    const json = {
      id,
      reading:  meta.reading,
      meaning:  meta.meaning,
      source,
      viewBox:  '0 0 1024 1024',
      morphPaths: [
        PLACEHOLDER_SILHOUETTE,
        PLACEHOLDER_INTERMEDIATE,
        realStrokePath,
      ],
      strokeCount,
      notes: '3-step morph: 원형 실루엣 → 변형 → 실 해서체 stroke. 마지막에 system CJK 글리프 fade-in (morph.js 자동).',
    };
    await fs.writeFile(outPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    written++;
  }
  console.log(`[gen-hanja-json] written=${written} real=${real} placeholder=${placeholder} → ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
