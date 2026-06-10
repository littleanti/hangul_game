// SRL 스케줄러 — SM-2 변형
import { CONFIG } from './config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// 다음 노출 간격 계산 (단위: 일)
// prev = { interval, ease }
// correct: boolean
export function nextInterval(prev, correct) {
  const ease = prev?.ease ?? CONFIG.SRL_EASE_DEFAULT;
  if (!correct) {
    return { interval: 1, ease: Math.max(ease - 0.2, CONFIG.SRL_EASE_MIN) };
  }
  const prevInterval = prev?.interval ?? 0;
  let days;
  if (prevInterval === 0) days = 1;
  else if (prevInterval === 1) days = 3;
  else days = Math.round(prevInterval * ease);
  return { interval: days, ease: ease + 0.1 };
}

// 초기 학습 후 SRL 시드 (정답으로 첫 노출)
export function seedSrl(now = Date.now()) {
  const { interval, ease } = nextInterval(null, true);
  return { interval, ease, dueAt: now + interval * DAY_MS };
}

// 정답/오답 처리
export function applyResult(prev, correct, now = Date.now()) {
  const { interval, ease } = nextInterval(prev, correct);
  return { interval, ease, dueAt: now + interval * DAY_MS };
}

// 오답 시 0.5배 (다음 노출 더 빨리)
export function applyWrongMini(prev, now = Date.now()) {
  const interval = Math.max(1, Math.round((prev?.interval ?? 1) * 0.5));
  const ease = Math.max((prev?.ease ?? CONFIG.SRL_EASE_DEFAULT) - 0.1, CONFIG.SRL_EASE_MIN);
  return { interval, ease, dueAt: now + interval * DAY_MS };
}
