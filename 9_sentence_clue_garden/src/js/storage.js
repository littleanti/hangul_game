/**
 * localStorage / IndexedDB 래퍼 (TRD §3.3~3.5, §8)
 * - 모든 접근은 try/catch — Private 브라우징 실패 시 무시하고 게임 진행 (TRD §8.3)
 * - 리더보드: localStorage, 최대 50개 (accuracy 기준 정렬 후 하위 삭제)
 * - 세션 기록: IndexedDB(9scg_db/sessions), 실패 시 localStorage 폴백
 */

import {
  SETTINGS_KEY,
  LEADERBOARD_KEY,
  DEFAULT_SETTINGS,
  LEADERBOARD_MAX,
  DB_NAME,
  DB_VERSION,
  SESSIONS_STORE,
  STORAGE_PREFIX,
} from './config.js';
import { state } from './state.js';

// IndexedDB 실패 시 localStorage 폴백 키 (배열, 최대 200건 유지)
const SESSIONS_FALLBACK_KEY = `${STORAGE_PREFIX}sessions`;
const SESSIONS_FALLBACK_MAX = 200;

/* ========== 설정 (localStorage) ========== */

/** 설정 로드 — 없으면 기본값 유지 (앱 시작 시 main.js가 호출) */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // localStorage 거부(Incognito 등) — 세션 내 메모리에서만 유지
  }
}

/** 설정 저장 — 설정 변경 시 즉시 호출 */
export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    // 실패 무시 (TRD §8.3)
  }
}

/* ========== 리더보드 (localStorage) ========== */

/** 리더보드 로드 — 실패 시 빈 배열 */
export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * 리더보드 기록 추가 (TRD §8.1)
 * record: { score, total, accuracy, difficulty, ts }
 * 최대 50개 초과 시 accuracy 기준 정렬 후 하위 항목 삭제.
 */
export function saveLeaderboard(record) {
  try {
    const list = loadLeaderboard();
    list.push(record);
    // accuracy 내림차순 (동률: 점수 → 최신순) — 초과분은 하위부터 삭제
    list.sort((a, b) =>
      (b.accuracy - a.accuracy) || (b.score - a.score) || (b.ts - a.ts));
    localStorage.setItem(
      LEADERBOARD_KEY,
      JSON.stringify(list.slice(0, LEADERBOARD_MAX)),
    );
  } catch {
    // 실패 무시 (TRD §8.3)
  }
}

/* ========== 누적 세션 기록 (IndexedDB + localStorage 폴백) ========== */

/** indexedDB.open Promise 래퍼 — 스토어·인덱스 생성 포함 (TRD §8.2) */
function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unsupported'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('ts', 'ts');
        store.createIndex('difficulty', 'difficulty');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

/** 트랜잭션 완료 Promise 래퍼 */
function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** localStorage 폴백 세션 목록 읽기 */
function loadFallbackSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_FALLBACK_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * 세션 레코드 저장 — 게임 완료 시 1건 (TRD §3.5)
 * record: { ts, difficulty, questions: [{id, correct, hintLevelUsed, chosen?}], score, total }
 */
export async function saveSession(record) {
  try {
    const db = await openDb();
    const tx = db.transaction(SESSIONS_STORE, 'readwrite');
    tx.objectStore(SESSIONS_STORE).add(record);
    await txDone(tx);
    db.close();
  } catch {
    // IndexedDB 실패(Incognito 등) → localStorage 폴백
    try {
      const list = loadFallbackSessions();
      list.push(record);
      localStorage.setItem(
        SESSIONS_FALLBACK_KEY,
        JSON.stringify(list.slice(-SESSIONS_FALLBACK_MAX)),
      );
    } catch {
      // 둘 다 실패 — 게임 진행에 영향 없음 (TRD §8.3)
    }
  }
}

/**
 * 세션 이력 조회 — filter.difficulty 지정 시 해당 난이도만
 * @returns {Promise<Array>} 실패 시 폴백 → 그래도 없으면 빈 배열
 */
export async function loadSessions(filter = {}) {
  let records = [];
  try {
    const db = await openDb();
    const tx = db.transaction(SESSIONS_STORE, 'readonly');
    const store = tx.objectStore(SESSIONS_STORE);
    records = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    records = loadFallbackSessions();
  }
  if (filter && filter.difficulty) {
    records = records.filter(r => r.difficulty === filter.difficulty);
  }
  return records;
}
