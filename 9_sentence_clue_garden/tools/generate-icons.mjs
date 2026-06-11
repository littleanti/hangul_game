/**
 * PWA 아이콘 생성 스크립트 — icons/icon-192.png, icons/icon-512.png
 *
 * 외부 의존성 없이 Node 내장 zlib만으로 PNG 바이트를 직접 생성한다.
 * (시리즈 원칙: npm 런타임 의존성 금지 — 일회성 생성 도구는 tools/에 보관)
 *
 * 모티프(정원·문장·단서):
 *   coral 배경 위 white 문장 카드(navy 테두리) — 문장 줄 가운데 yellow 빈칸(단서),
 *   카드 아래에서 mint 줄기·잎과 white 꽃잎 + yellow 꽃술이 피어나는 모습.
 *   색은 시리즈 디자인 토큰(tokens.css)만 사용.
 *
 * 실행: node tools/generate-icons.mjs   (9_sentence_clue_garden 루트에서)
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 시리즈 디자인 토큰 (tokens.css)
const CORAL = [0xFF, 0x77, 0x57];
const NAVY = [0x2D, 0x30, 0x47];
const CREAM = [0xFF, 0xF6, 0xE4];
const MINT = [0x6B, 0xCA, 0xB8];
const YELLOW = [0xFF, 0xD1, 0x66];
const WHITE = [0xFF, 0xFF, 0xFF];

/* ========== 래스터 캔버스 (RGB) ========== */

function makeCanvas(size) {
  return { size, px: new Uint8Array(size * size * 3) };
}

function setPx(c, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 3;
  c.px[i] = r; c.px[i + 1] = g; c.px[i + 2] = b;
}

function fillRect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) setPx(c, x, y, color);
}

function fillCircle(c, cx, cy, r, color) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) setPx(c, x, y, color);
}

function fillRoundRect(c, x0, y0, w, h, r, color) {
  r = Math.min(r, w / 2, h / 2);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const dx = x < x0 + r ? x0 + r - x : x > x0 + w - 1 - r ? x - (x0 + w - 1 - r) : 0;
      const dy = y < y0 + r ? y0 + r - y : y > y0 + h - 1 - r ? y - (y0 + h - 1 - r) : 0;
      if (dx * dx + dy * dy <= r * r) setPx(c, x, y, color);
    }
  }
}

/* ========== 아이콘 드로잉 (기준 좌표계 512, 스케일 s) ========== */

function drawIcon(c, s) {
  const S = (v) => v * s;

  // 배경 — coral 풀블리드 (maskable 대응)
  fillRect(c, 0, 0, c.size, c.size, CORAL);

  // 땅(정원 언덕) — mint 원호
  fillCircle(c, S(256), S(580), S(150), MINT);

  // 줄기 + 잎
  fillRoundRect(c, S(248), S(310), S(16), S(150), S(8), MINT);
  fillCircle(c, S(212), S(402), S(26), MINT);
  fillCircle(c, S(300), S(376), S(26), MINT);

  // 문장 카드 — white + navy 테두리
  fillRoundRect(c, S(58), S(58), S(396), S(204), S(36), NAVY);
  fillRoundRect(c, S(70), S(70), S(372), S(180), S(28), WHITE);

  // 문장 줄 1 — navy 텍스트 바
  fillRoundRect(c, S(104), S(108), S(304), S(30), S(15), NAVY);

  // 문장 줄 2 — navy 바 + yellow 빈칸(단서 슬롯) + navy 바
  fillRoundRect(c, S(104), S(176), S(92), S(30), S(15), NAVY);
  fillRoundRect(c, S(212), S(164), S(104), S(54), S(10), YELLOW);
  fillRect(c, S(212), S(208), S(104), S(10), CORAL); // 빈칸 밑줄 (coral)
  fillRoundRect(c, S(332), S(176), S(76), S(30), S(15), NAVY);

  // 꽃 — white 꽃잎 8장 + yellow 꽃술 (카드에서 피어남)
  const fx = 256, fy = 308;
  const petals = [
    [0, -44], [44, 0], [-44, 0], [0, 44],
    [31, -31], [-31, -31], [31, 31], [-31, 31],
  ];
  for (const [dx, dy] of petals) fillCircle(c, S(fx + dx), S(fy + dy), S(30), WHITE);
  fillCircle(c, S(fx), S(fy), S(34), YELLOW);

  // 꽃술 가운데 점 — cream
  fillCircle(c, S(fx), S(fy), S(12), CREAM);
}

/* ========== 2x 슈퍼샘플 다운스케일 ========== */

function downscale2x(src) {
  const size = src.size / 2;
  const out = makeCanvas(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 3;
      for (let ch = 0; ch < 3; ch++) {
        const a = src.px[((2 * y) * src.size + 2 * x) * 3 + ch];
        const b = src.px[((2 * y) * src.size + 2 * x + 1) * 3 + ch];
        const d = src.px[((2 * y + 1) * src.size + 2 * x) * 3 + ch];
        const e = src.px[((2 * y + 1) * src.size + 2 * x + 1) * 3 + ch];
        out.px[o + ch] = Math.round((a + b + d + e) / 4);
      }
    }
  }
  return out;
}

/* ========== PNG 인코딩 (RGB, 8-bit, 필터 0) ========== */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xEDB88320 ^ (v >>> 1) : v >>> 1;
    t[n] = v >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(c) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.size, 0);  // width
  ihdr.writeUInt32BE(c.size, 4);  // height
  ihdr[8] = 8;                    // bit depth
  ihdr[9] = 2;                    // color type: truecolor RGB
  // compression 0, filter 0, interlace 0

  // 스캔라인 — 각 행 앞에 필터 타입 0 바이트
  const raw = Buffer.alloc(c.size * (c.size * 3 + 1));
  for (let y = 0; y < c.size; y++) {
    raw[y * (c.size * 3 + 1)] = 0;
    c.px.subarray(y * c.size * 3, (y + 1) * c.size * 3)
      .forEach((v, i) => { raw[y * (c.size * 3 + 1) + 1 + i] = v; });
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ========== 실행 ========== */

mkdirSync(join(ROOT, 'icons'), { recursive: true });

for (const size of [192, 512]) {
  const hi = makeCanvas(size * 2);
  drawIcon(hi, (size * 2) / 512);
  const png = encodePng(downscale2x(hi));
  const out = join(ROOT, 'icons', `icon-${size}.png`);
  writeFileSync(out, png);
  console.log(`generated ${out} (${png.length} bytes)`);
}
