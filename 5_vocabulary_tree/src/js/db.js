// IndexedDB 영속화 — Dexie (ESM CDN) + in-memory 폴백
// Private Browsing 등에서 IndexedDB 실패 시 in-memory만 사용 (세션 한정)

let Dexie;
try {
  ({ default: Dexie } = await import('https://esm.sh/dexie@4.0.8'));
} catch (e) {
  console.warn('[db] Dexie 로드 실패, in-memory 폴백', e);
}

// in-memory fallback store
const mem = {
  hanja:   [],
  words:   [],
  srl:     [],
  daily:   new Map(),
  profile: new Map(),
};

let db = null;
let usingMemory = false;

async function tryInitDexie() {
  if (!Dexie) return false;
  try {
    db = new Dexie('vocabulary_tree');
    db.version(1).stores({
      hanja:   '++id, hanjaId, learnedAt',
      words:   '++id, wordId, hanjaId, learnedAt',
      srl:     '++id, wordId, dueAt, interval, ease',
      daily:   'date, hanjaId, completedCount',
      profile: 'key',
    });
    await db.open();
    return true;
  } catch (e) {
    console.warn('[db] IndexedDB 사용 불가, in-memory 폴백', e);
    db = null;
    usingMemory = true;
    return false;
  }
}

await tryInitDexie();
if (!db) usingMemory = true;

// ========== profile ==========
export async function getProfile(key, defaultVal = null) {
  if (usingMemory) return mem.profile.get(key) ?? defaultVal;
  const row = await db.profile.get(key);
  return row?.value ?? defaultVal;
}

export async function setProfile(key, value) {
  if (usingMemory) { mem.profile.set(key, value); return; }
  await db.profile.put({ key, value });
}

// ========== hanja ==========
export async function markHanjaLearned(hanjaId) {
  const learnedAt = Date.now();
  if (usingMemory) {
    if (!mem.hanja.find(h => h.hanjaId === hanjaId)) {
      mem.hanja.push({ id: mem.hanja.length + 1, hanjaId, learnedAt });
    }
    return;
  }
  const existing = await db.hanja.where('hanjaId').equals(hanjaId).first();
  if (!existing) await db.hanja.add({ hanjaId, learnedAt });
}

export async function listLearnedHanja() {
  if (usingMemory) return [...mem.hanja];
  return await db.hanja.toArray();
}

// ========== words ==========
export async function addLearnedWord(wordId, hanjaId) {
  const learnedAt = Date.now();
  if (usingMemory) {
    if (!mem.words.find(w => w.wordId === wordId)) {
      mem.words.push({ id: mem.words.length + 1, wordId, hanjaId, learnedAt });
    }
    return;
  }
  const existing = await db.words.where('wordId').equals(wordId).first();
  if (!existing) await db.words.add({ wordId, hanjaId, learnedAt });
}

export async function listLearnedWords() {
  if (usingMemory) return [...mem.words];
  return await db.words.toArray();
}

export async function countLearnedWords() {
  if (usingMemory) return mem.words.length;
  return await db.words.count();
}

// ========== srl ==========
export async function upsertSrl({ wordId, dueAt, interval, ease }) {
  if (usingMemory) {
    const i = mem.srl.findIndex(r => r.wordId === wordId);
    const row = { wordId, dueAt, interval, ease };
    if (i >= 0) mem.srl[i] = { ...mem.srl[i], ...row };
    else mem.srl.push({ id: mem.srl.length + 1, ...row });
    return;
  }
  const existing = await db.srl.where('wordId').equals(wordId).first();
  if (existing) await db.srl.update(existing.id, { dueAt, interval, ease });
  else await db.srl.add({ wordId, dueAt, interval, ease });
}

export async function dueSrlWords(byTs = Date.now()) {
  if (usingMemory) return mem.srl.filter(r => r.dueAt <= byTs).sort((a, b) => a.dueAt - b.dueAt);
  return await db.srl.where('dueAt').belowOrEqual(byTs).sortBy('dueAt');
}

export async function getSrl(wordId) {
  if (usingMemory) return mem.srl.find(r => r.wordId === wordId) || null;
  return await db.srl.where('wordId').equals(wordId).first();
}

// ========== daily ==========
export async function getDaily(date) {
  if (usingMemory) return mem.daily.get(date) || null;
  return await db.daily.get(date);
}

export async function setDaily(date, payload) {
  if (usingMemory) { mem.daily.set(date, { date, ...payload }); return; }
  await db.daily.put({ date, ...payload });
}

export async function listRecentDaily(limit = 30) {
  if (usingMemory) {
    return [...mem.daily.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }
  return await db.daily.orderBy('date').reverse().limit(limit).toArray();
}

// ========== 트랜잭션 헬퍼 ==========
// 어휘 학습 완료 = words insert + srl seed + daily increment
export async function recordWordLearned(word, dailyDate, srlSeed) {
  if (usingMemory) {
    await addLearnedWord(word.id, word.hanjaId);
    await markHanjaLearned(word.hanjaId);
    await upsertSrl({ wordId: word.id, ...srlSeed });
    const d = mem.daily.get(dailyDate) || { date: dailyDate, hanjaId: word.hanjaId, completedCount: 0, wordIds: [] };
    if (!d.wordIds.includes(word.id)) {
      d.wordIds = [...(d.wordIds || []), word.id];
      d.completedCount = d.wordIds.length;
    }
    mem.daily.set(dailyDate, d);
    return;
  }
  await db.transaction('rw', db.words, db.hanja, db.srl, db.daily, async () => {
    await addLearnedWord(word.id, word.hanjaId);
    await markHanjaLearned(word.hanjaId);
    await upsertSrl({ wordId: word.id, ...srlSeed });
    const existing = await db.daily.get(dailyDate);
    const wordIds = existing?.wordIds ? [...existing.wordIds] : [];
    if (!wordIds.includes(word.id)) wordIds.push(word.id);
    await db.daily.put({
      date: dailyDate,
      hanjaId: word.hanjaId,
      completedCount: wordIds.length,
      wordIds,
    });
  });
}

export function isMemoryMode() {
  return usingMemory;
}
