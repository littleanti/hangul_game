#!/usr/bin/env node
// PWA 아이콘 생성: node scripts/gen-icons.mjs
// icon.svg → icon-192.png / icon-512.png
// sharp는 형제 게임 6_morpheme_detective의 devDependency를 재사용한다 (읽기 전용 참조).
// 이 게임 자체는 npm 런타임 의존성 0 원칙 유지 — 생성된 PNG만 배포 자산.
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SIBLING_PKG = path.join(ROOT, '..', '6_morpheme_detective', 'package.json');

let sharp;
try {
  sharp = createRequire(SIBLING_PKG)('sharp');
} catch {
  console.error('❌ sharp 로드 실패: 6_morpheme_detective/node_modules/sharp 필요');
  process.exit(1);
}

const svgBuffer = readFileSync(path.join(ROOT, 'src/assets/icons/icon.svg'));
const outDir = path.join(ROOT, 'src/assets/icons');

for (const size of [192, 512]) {
  await sharp(svgBuffer, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`✅ icon-${size}.png`);
}
