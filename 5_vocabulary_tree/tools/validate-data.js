#!/usr/bin/env node
// 데이터 일관성 자동 점검 스크립트
// node tools/validate-data.js

import { HANJA, HANJA_BY_ID, HANJA_BY_CODE } from '../src/data/hanja.js';
import { WORDS, WORDS_BY_HANJA } from '../src/data/words.js';
import { ACADEMIC } from '../src/data/academic.js';

let errors = 0;
let warnings = 0;

const err = (msg) => { console.error(`✘ ${msg}`); errors++; };
const warn = (msg) => { console.warn(`⚠ ${msg}`); warnings++; };
const ok = (msg) => console.log(`✓ ${msg}`);

console.log('\n=== 한자 데이터 점검 ===');
{
  const ids = new Set();
  const codes = new Set();
  for (const h of HANJA) {
    if (!Number.isInteger(h.id) || h.id < 1) err(`한자 id 비정상: ${JSON.stringify(h)}`);
    if (ids.has(h.id)) err(`한자 id 중복: ${h.id}`);
    ids.add(h.id);
    if (codes.has(h.code)) err(`한자 code 중복: ${h.code}`);
    codes.add(h.code);
    if (!h.hun || !h.eum) err(`한자 ${h.code} 훈/음 누락`);
    if (![8, 7, 6, 5].includes(h.level)) warn(`한자 ${h.code} 급수 비표준: ${h.level}`);
    if (!['3', '4', '5', '6'].includes(h.grade)) warn(`한자 ${h.code} 학년 태그 비표준: ${h.grade}`);
  }
  ok(`한자 ${HANJA.length}자 등록`);
  if (HANJA.length < 50) warn(`한자 수가 50자 미만: ${HANJA.length}`);
}

console.log('\n=== 어휘 데이터 점검 ===');
{
  const wordIds = new Set();
  for (const w of WORDS) {
    if (!Number.isInteger(w.id) || w.id < 1) err(`어휘 id 비정상: ${JSON.stringify(w)}`);
    if (wordIds.has(w.id)) err(`어휘 id 중복: ${w.id}`);
    wordIds.add(w.id);
    if (!HANJA_BY_ID.has(w.hanjaId)) err(`어휘 ${w.text} 의 hanjaId ${w.hanjaId} 가 존재하지 않음`);
    if (!w.text || w.text.length < 1) err(`어휘 ${w.id} text 누락`);
    if (!Array.isArray(w.syllables) || w.syllables.length < 1) err(`어휘 ${w.text} syllables 누락`);
    if (w.text && w.syllables) {
      const joined = w.syllables.join('');
      if (joined !== w.text) err(`어휘 ${w.text} ↔ syllables 불일치 (${joined})`);
    }
    if (!w.meaning) err(`어휘 ${w.text} 의미 누락`);
    if (!w.example) err(`어휘 ${w.text} 예문 누락`);
    if (!['3', '4', '5', '6'].includes(w.grade)) warn(`어휘 ${w.text} 학년 태그 비표준: ${w.grade}`);
  }
  ok(`어휘 ${WORDS.length}개 등록`);

  // 한자별 어휘 수 점검
  let underFour = 0;
  for (const h of HANJA) {
    const list = WORDS_BY_HANJA.get(h.id) || [];
    if (list.length < 4) {
      warn(`한자 ${h.code}(${h.eum}) 어휘가 4개 미만: ${list.length}`);
      underFour++;
    }
    if (list.length > 8) {
      warn(`한자 ${h.code}(${h.eum}) 어휘가 8개 초과: ${list.length}`);
    }
  }
  if (underFour === 0) ok('모든 한자가 4어휘 이상 보유');

  // 어휘당 한자 음과 본문 일치 점검 (두음법칙·관용 허용)
  // 6(六)→유/육, 10(十)→시, 33(女녀)→여, 41(年년)→연 등
  const irregularReadings = {
    6: ['유', '육'],
    10: ['시'],
    33: ['여'],
    41: ['연'],
  };
  let mismatch = 0;
  for (const w of WORDS) {
    const h = HANJA_BY_ID.get(w.hanjaId);
    if (!h) continue;
    const hasNormal = w.syllables.includes(h.eum);
    const allowed = (irregularReadings[h.id] || []).some(s => w.syllables.includes(s));
    if (!hasNormal && !allowed) {
      warn(`어휘 ${w.text} 가 한자 ${h.code}(${h.eum}) 음을 포함하지 않음`);
      mismatch++;
    }
  }
  if (mismatch === 0) ok('어휘-한자 음 일관성 OK');
}

console.log('\n=== 학술 어휘(보스) 점검 ===');
{
  const ids = new Set();
  for (const a of ACADEMIC) {
    if (ids.has(a.id)) err(`학술 어휘 id 중복: ${a.id}`);
    ids.add(a.id);
    if (!a.text || !a.meaning) err(`학술 어휘 ${a.id} text/meaning 누락`);
    if (!Array.isArray(a.breakdown) || a.breakdown.length < 2) {
      err(`학술 어휘 ${a.text} 분해가 2자 미만`);
    }
    for (const b of a.breakdown) {
      if (!b.code || !b.hun || !b.eum || !b.meaning) {
        err(`학술 어휘 ${a.text} 분해 항목 누락: ${JSON.stringify(b)}`);
      }
    }
    if (!['math', 'science', 'social', 'language'].includes(a.subject)) {
      warn(`학술 어휘 ${a.text} subject 비표준: ${a.subject}`);
    }
  }
  ok(`학술 어휘 ${ACADEMIC.length}개 등록`);
  if (ACADEMIC.length < 30) warn(`학술 어휘가 30개 미만: ${ACADEMIC.length}`);
}

console.log('\n=== 결과 ===');
if (errors === 0 && warnings === 0) {
  console.log('🎉 모든 점검 통과 (errors=0, warnings=0)');
  process.exit(0);
} else if (errors === 0) {
  console.log(`✅ 통과 (warnings=${warnings})`);
  process.exit(0);
} else {
  console.log(`❌ 실패 (errors=${errors}, warnings=${warnings})`);
  process.exit(1);
}
