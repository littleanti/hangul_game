#!/usr/bin/env node
// 아이콘 생성: node scripts/gen-icons.mjs (npm install sharp 필요)
import { readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('❌ sharp 미설치: npm install --save-dev sharp');
  process.exit(1);
}

const svgPath = path.join(ROOT, 'src/assets/icons/icon.svg');
const svgBuffer = readFileSync(svgPath);
const outDir = path.join(ROOT, 'src/assets/icons');
await mkdir(outDir, { recursive: true });

for (const size of [192, 512]) {
  await sharp(svgBuffer).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`✅ icon-${size}.png`);
}

await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
console.log('✅ apple-touch-icon.png (180x180)');
