// 1일 1자 분량 결정 + 자정 락 판정
import { HANJA } from '../data/hanja.js';
import { getWordsForHanja } from '../data/words.js';
import { CONFIG } from './config.js';
import { todayISO } from './utils.js';
import { getDaily, listLearnedHanja, dueSrlWords, listLearnedWords } from './db.js';

// 학년에 맞춰 한자 후보 풀
function gradeFilter(grade) {
  // 8급은 모두 초3에 노출, 5,6학년은 동일 풀 사용
  return HANJA.filter(h => h.grade === grade || h.grade < grade);
}

// 오늘 학습할 한자 결정
// 1) 이미 오늘 시작한 한자가 있으면 그 한자
// 2) 아니면 학습 안 한 한자 중 첫 번째 (id 순서)
// 3) 전부 학습했으면 누적 한자 중 랜덤 복습용으로 다시 노출 (재방문)
export async function decideTodayHanja(grade = '3') {
  const date = todayISO();
  const today = await getDaily(date);
  if (today?.hanjaId) {
    return HANJA.find(h => h.id === today.hanjaId);
  }
  const learned = new Set((await listLearnedHanja()).map(r => r.hanjaId));
  const pool = gradeFilter(grade);
  const unseen = pool.find(h => !learned.has(h.id));
  if (unseen) return unseen;
  // 모두 학습 → 누적 한자 중 첫 번째 (복습 진입)
  return pool[0];
}

// 오늘 학습 큐: 복습(SRL) → 신규 4어휘
export async function buildTodayQueue(hanja) {
  const due = await dueSrlWords();
  const learnedSet = new Set((await listLearnedWords()).map(w => w.wordId));
  const candidates = getWordsForHanja(hanja.id);
  const unseen = candidates.filter(w => !learnedSet.has(w.id)).slice(0, CONFIG.DAILY_TARGET_WORDS);
  return {
    reviews: due,                // SRL 큐 (선행)
    newWords: unseen,            // 신규 학습 어휘
  };
}

// 오늘 락 여부 (어휘 4개 달성)
export async function isLockedToday() {
  const date = todayISO();
  const d = await getDaily(date);
  return !!d && d.completedCount >= CONFIG.DAILY_TARGET_WORDS;
}

// 진척
export async function getTodayProgress() {
  const date = todayISO();
  const d = await getDaily(date);
  return {
    date,
    hanjaId: d?.hanjaId || null,
    completedCount: d?.completedCount || 0,
    target: CONFIG.DAILY_TARGET_WORDS,
    locked: (d?.completedCount || 0) >= CONFIG.DAILY_TARGET_WORDS,
    wordIds: d?.wordIds || [],
  };
}
