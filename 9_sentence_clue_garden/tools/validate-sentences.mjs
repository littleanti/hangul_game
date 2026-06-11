// validate-sentences.mjs — src/data/sentences.js 유효성 검사 (PLAN M1)
// 실행: node tools/validate-sentences.mjs
//
// 게임 루트에는 package.json이 없으므로(.js = CommonJS 취급) sentences.js를
// 직접 import하지 않고, 파일 텍스트를 읽어 배열 리터럴을 평가하는 방식으로 검사한다.
//
// 검사 항목:
//   1. id: 'scg_NNN' 형식, 중복 없음
//   2. sentence: 빈칸 마커 '[ ]' 정확히 1개 (그 외 대괄호 금지), 길이 20~60자
//   3. answer: 비어 있지 않은 문자열
//   4. choices: 3~4개, 중복 없음, answer 포함
//   5. hint.level1: label 비어 있지 않음, highlight [시작, 끝] 범위 유효
//      hint.level2: highlight 범위 유효 (level1과 동일 구간)
//      highlight 구간이 빈칸 마커와 겹치지 않음
//   6. source === 'S8', difficulty ∈ {easy, medium, hard}, tags는 문자열 배열
//   7. 난이도별 최소 개수: easy ≥ 15, medium ≥ 15, hard ≥ 10

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'src', 'data', 'sentences.js');

const MARKER = '[ ]';
const MIN = { easy: 15, medium: 15, hard: 10 };
const LEN_MIN = 20;
const LEN_MAX = 60;

// ── 파일 텍스트 → 배열 추출 ───────────────────────────────────
const text = readFileSync(DATA_PATH, 'utf8');
const exportRe = /export\s+const\s+SENTENCES\s*=/;
if (!exportRe.test(text)) {
  console.error('실패: `export const SENTENCES =` 선언을 찾을 수 없음');
  process.exit(1);
}
let SENTENCES;
try {
  SENTENCES = new Function(text.replace(exportRe, 'return'))();
} catch (e) {
  console.error('실패: sentences.js 평가 오류 —', e.message);
  process.exit(1);
}
if (!Array.isArray(SENTENCES) || SENTENCES.length === 0) {
  console.error('실패: SENTENCES가 비어 있거나 배열이 아님');
  process.exit(1);
}

// ── 항목별 검사 ───────────────────────────────────────────────
const errors = [];
const seenIds = new Set();
const counts = { easy: 0, medium: 0, hard: 0 };

const isIntPair = (h) =>
  Array.isArray(h) && h.length === 2 && h.every((n) => Number.isInteger(n));

SENTENCES.forEach((item, i) => {
  const tag = item?.id ?? `(index ${i})`;
  const err = (msg) => errors.push(`${tag}: ${msg}`);

  // id
  if (typeof item.id !== 'string' || !/^scg_\d{3}$/.test(item.id)) err(`id 형식 위반 — '${item.id}'`);
  else if (seenIds.has(item.id)) err('id 중복');
  else seenIds.add(item.id);

  // sentence + 빈칸 마커
  if (typeof item.sentence !== 'string' || !item.sentence) { err('sentence 누락'); return; }
  const s = item.sentence;
  const markerCount = s.split(MARKER).length - 1;
  if (markerCount !== 1) err(`빈칸 마커 ${markerCount}개 (정확히 1개 필요)`);
  const bracketCount = (s.match(/[\[\]]/g) || []).length;
  if (bracketCount !== 2) err(`마커 외 대괄호 존재 (대괄호 ${bracketCount}개)`);
  if (s.length < LEN_MIN || s.length > LEN_MAX) err(`길이 ${s.length}자 (${LEN_MIN}~${LEN_MAX} 위반)`);

  // answer / choices
  if (typeof item.answer !== 'string' || !item.answer.trim()) err('answer 누락');
  if (!Array.isArray(item.choices) || item.choices.length < 3 || item.choices.length > 4) {
    err(`choices ${item.choices?.length ?? 0}개 (3~4개 필요)`);
  } else {
    if (new Set(item.choices).size !== item.choices.length) err('choices 중복');
    if (!item.choices.includes(item.answer)) err('choices에 answer 미포함');
    if (item.choices.some((c) => typeof c !== 'string' || !c.trim())) err('choices에 빈 항목');
  }

  // hint
  const markerStart = s.indexOf(MARKER);
  const markerEnd = markerStart + MARKER.length;
  const checkHighlight = (h, name) => {
    if (!isIntPair(h)) { err(`${name}.highlight가 [정수, 정수] 형식이 아님`); return; }
    const [a, b] = h;
    if (!(a >= 0 && a < b && b <= s.length)) { err(`${name}.highlight 범위 무효 [${a}, ${b}] (len=${s.length})`); return; }
    if (a < markerEnd && b > markerStart) err(`${name}.highlight가 빈칸 마커와 겹침 [${a}, ${b}]`);
  };
  if (!item.hint || typeof item.hint !== 'object') err('hint 누락');
  else {
    if (!item.hint.level1 || typeof item.hint.level1.label !== 'string' || !item.hint.level1.label.trim()) {
      err('hint.level1.label 누락');
    }
    checkHighlight(item.hint?.level1?.highlight, 'level1');
    checkHighlight(item.hint?.level2?.highlight, 'level2');
  }

  // source / difficulty / tags
  if (item.source !== 'S8') err(`source !== 'S8' — '${item.source}'`);
  if (!Object.hasOwn(counts, item.difficulty)) err(`difficulty 무효 — '${item.difficulty}'`);
  else counts[item.difficulty]++;
  if (!Array.isArray(item.tags) || item.tags.some((t) => typeof t !== 'string' || !t.trim())) err('tags가 문자열 배열이 아님');
});

// ── 난이도별 최소 개수 ────────────────────────────────────────
for (const [d, min] of Object.entries(MIN)) {
  if (counts[d] < min) errors.push(`난이도 '${d}' ${counts[d]}개 (최소 ${min}개 필요)`);
}

// ── 결과 ──────────────────────────────────────────────────────
console.log(`검사 대상: ${SENTENCES.length}개 항목`);
console.log(`난이도 분포: easy=${counts.easy}, medium=${counts.medium}, hard=${counts.hard}`);
if (errors.length) {
  console.error(`\n실패: ${errors.length}건\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('통과: 전 항목 유효성 검사 성공');
