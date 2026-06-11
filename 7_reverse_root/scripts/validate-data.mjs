// validate-data.mjs — M1 데이터 자가 검증 스크립트 (PLAN.md M1 "데이터 유효성 자가 검사")
// 실행: node scripts/validate-data.mjs   (7_reverse_root 루트에서)
//
// 검증 항목:
//  (a) vocab.js 의 모든 components / distractors 가 hanja.js 키로 존재
//  (b) 이 게임의 모든 한자(hanja.js 키 전체)가 6_morpheme_detective 100자 풀에 존재
//      + 메타데이터(reading/meaning/grade)가 원본과 일치
//  (c) 중복 어휘 없음, 중복 컴포넌트 쌍 없음(순서 무관)
//  (d) components 길이 2, distractors 2~3
//  (+) hanja 표기 = components 결합, distractors 와 components 비중복,
//      difficulty ∈ {1,2,3}, 어휘 15개, 디스트랙터 내부 중복 없음

import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const load = (p) => import(pathToFileURL(p).href);

const { HANJA } = await load(path.join(root, 'src/data/hanja.js'));
const { VOCAB } = await load(path.join(root, 'src/data/vocab.js'));
const { HANJA: SOURCE_HANJA } = await load(
  path.resolve(root, '../6_morpheme_detective/src/data/hanja.js'),
);

const errors = [];
const ok = (label) => console.log(`  PASS  ${label}`);
const cp = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

// ── (d) 스키마 형상 ─────────────────────────────────────────────────
for (const v of VOCAB) {
  if (!Array.isArray(v.components) || v.components.length !== 2)
    errors.push(`[d] ${v.word}: components 길이가 2가 아님 (${v.components?.length})`);
  if (!Array.isArray(v.distractors) || v.distractors.length < 2 || v.distractors.length > 3)
    errors.push(`[d] ${v.word}: distractors 길이가 2~3이 아님 (${v.distractors?.length})`);
  if (![1, 2, 3].includes(v.difficulty))
    errors.push(`[d] ${v.word}: difficulty 값 이상 (${v.difficulty})`);
  if (typeof v.hanja !== 'string' || v.hanja !== v.components.join(''))
    errors.push(`[d] ${v.word}: hanja('${v.hanja}') ≠ components 결합('${v.components.join('')}')`);
  const overlap = v.distractors.filter((d) => v.components.includes(d));
  if (overlap.length)
    errors.push(`[d] ${v.word}: distractors 가 components 와 중복 (${overlap.join(',')})`);
  if (new Set(v.distractors).size !== v.distractors.length)
    errors.push(`[d] ${v.word}: distractors 내부 중복`);
}
if (VOCAB.length !== 15) errors.push(`[d] 어휘 수가 15가 아님 (${VOCAB.length})`);
if (!errors.some((e) => e.startsWith('[d]')))
  ok(`(d) 스키마 형상 — 어휘 ${VOCAB.length}개, components=2, distractors=2~3, difficulty∈{1,2,3}, hanja 표기 일치`);

// ── (a) components/distractors 가 hanja.js 키로 존재 ────────────────
let refCount = 0;
for (const v of VOCAB) {
  for (const ch of [...v.components, ...v.distractors]) {
    refCount++;
    if (!HANJA[ch]) errors.push(`[a] ${v.word}: '${ch}'(${cp(ch)}) 가 hanja.js 에 없음`);
    else if (HANJA[ch].id !== ch) errors.push(`[a] hanja.js '${ch}': id 필드 불일치 ('${HANJA[ch].id}')`);
  }
}
if (!errors.some((e) => e.startsWith('[a]')))
  ok(`(a) 참조 무결성 — 한자 참조 ${refCount}건 전부 hanja.js 키로 존재`);

// ── (b) 6_morpheme_detective 100자 풀 교차 검증 ─────────────────────
const sourceIds = Object.keys(SOURCE_HANJA);
if (sourceIds.length !== 100)
  errors.push(`[b] 원본 풀이 100자가 아님 (${sourceIds.length})`);
for (const [ch, meta] of Object.entries(HANJA)) {
  const src = SOURCE_HANJA[ch];
  if (!src) {
    errors.push(`[b] '${ch}'(${cp(ch)}) 가 6_morpheme_detective 100자 풀에 없음`);
    continue;
  }
  for (const f of ['reading', 'meaning', 'grade']) {
    if (meta[f] !== src[f])
      errors.push(`[b] '${ch}'.${f} 원본 불일치: '${meta[f]}' ≠ '${src[f]}'`);
  }
}
if (!errors.some((e) => e.startsWith('[b]')))
  ok(`(b) 100자 풀 — hanja.js ${Object.keys(HANJA).length}자 전부 원본 풀 내 존재 + reading/meaning/grade 일치 (신규 한자 0)`);

// ── (c) 중복 어휘·중복 컴포넌트 쌍 없음 ─────────────────────────────
const words = VOCAB.map((v) => v.word);
const dupWords = words.filter((w, i) => words.indexOf(w) !== i);
if (dupWords.length) errors.push(`[c] 중복 어휘: ${[...new Set(dupWords)].join(', ')}`);
const pairs = VOCAB.map((v) => [...v.components].sort().join('+'));
const dupPairs = pairs.filter((p, i) => pairs.indexOf(p) !== i);
if (dupPairs.length) errors.push(`[c] 중복 컴포넌트 쌍: ${[...new Set(dupPairs)].join(', ')}`);
if (!errors.some((e) => e.startsWith('[c]')))
  ok('(c) 중복 없음 — 어휘 15종 유일, 컴포넌트 쌍(순서 무관) 유일');

// ── 결과 ────────────────────────────────────────────────────────────
const byDiff = VOCAB.reduce((m, v) => ((m[v.difficulty] = (m[v.difficulty] || 0) + 1), m), {});
console.log(`  INFO  difficulty 분포: ${JSON.stringify(byDiff)} / 사용 한자 ${Object.keys(HANJA).length}자`);

if (errors.length) {
  console.error(`\nFAIL — ${errors.length}건:`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
