#!/usr/bin/env node
// SRL 알고리즘 + 단계 결정 + 자성 거리 단위 테스트
import { nextInterval, seedSrl, applyResult, applyWrongMini } from '../src/js/srl.js';
import { CONFIG } from '../src/js/config.js';

let passed = 0, failed = 0;
function eq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✓' : '✘'} ${name} ${ok ? '' : `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`}`);
  if (ok) passed++; else failed++;
}
function approxEq(name, a, b, tol = 0.001) {
  const ok = Math.abs(a - b) <= tol;
  console.log(`${ok ? '✓' : '✘'} ${name} ${ok ? '' : `expected≈${b} actual=${a}`}`);
  if (ok) passed++; else failed++;
}

// nextInterval — 첫 정답
{
  const r = nextInterval(null, true);
  eq('첫 정답 → 1일, ease=2.1', r, { interval: 1, ease: 2.1 });
}
// 두 번째 정답
{
  const r = nextInterval({ interval: 1, ease: 2.0 }, true);
  eq('1일에서 정답 → 3일, ease=2.1', r, { interval: 3, ease: 2.1 });
}
// 세 번째 정답
{
  const r = nextInterval({ interval: 3, ease: 2.1 }, true);
  eq('3일에서 정답 → round(3*2.1)=6일', r, { interval: 6, ease: 2.2 });
}
// 오답 → 1일, ease 감소
{
  const r = nextInterval({ interval: 7, ease: 2.5 }, false);
  eq('오답 → 1일, ease 0.2 감소', r, { interval: 1, ease: 2.3 });
}
// ease 하한
{
  const r = nextInterval({ interval: 7, ease: 1.4 }, false);
  approxEq('오답 ease 하한 1.3', r.ease, 1.3);
}

// seedSrl & applyResult/applyWrongMini
{
  const now = 1700000000000;
  const seed = seedSrl(now);
  approxEq('seedSrl dueAt = now + 1일', seed.dueAt - now, 24 * 3600 * 1000);
  eq('seedSrl interval=1, ease=2.1', { interval: seed.interval, ease: seed.ease }, { interval: 1, ease: 2.1 });
}
{
  const now = 1700000000000;
  const r = applyResult({ interval: 3, ease: 2.0 }, true, now);
  approxEq('applyResult 정답 6일 후 due', (r.dueAt - now) / (24 * 3600 * 1000), 6);
}
{
  const now = 1700000000000;
  const r = applyWrongMini({ interval: 14, ease: 2.5 }, now);
  approxEq('applyWrongMini 0.5배 → 7일 후 due', (r.dueAt - now) / (24 * 3600 * 1000), 7);
}

// CONFIG 정합성
eq('STAGE_THRESHOLD 순서', Object.values(CONFIG.STAGE_THRESHOLD), [0, 30, 120, 400]);
eq('SRL_INTERVALS', CONFIG.SRL_INTERVALS, [1, 3, 7, 14, 30]);
eq('DAILY_TARGET_WORDS', CONFIG.DAILY_TARGET_WORDS, 4);

console.log(`\n${failed === 0 ? '🎉' : '❌'} ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
