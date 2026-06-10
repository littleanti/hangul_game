// 메모리 상태 싱글톤
// 영속 상태는 db.js에서 IndexedDB로, 메모리/세션 상태만 여기서 관리.

export const state = {
  profile: {
    grade: '3',
    startedAt: null,
  },
  today: {
    date: null,         // 'YYYY-MM-DD'
    hanjaId: null,
    targetCount: 4,
    completed: [],      // Word[]
    locked: false,
  },
  tree: {
    nodes: new Map(),   // wordId → { x, y, branchIdx, hanjaId }
    branches: [],       // { idx, hanjaId, words: [wordId], angle, len }
    stage: 'sapling',
    cumulativeWords: 0,
  },
  camera: {
    scale: 1.0,
    tx: 0,
    ty: 0,
  },
  session: {
    blocks: [],         // floating syllable blocks
    activeBlock: null,  // 드래그 중
    srlQueue: [],
    currentWord: null,  // 현재 매칭 대상 어휘
    currentBranchIdx: 0,
    needSyllables: [],  // 정답 음절들 (남은 순서)
    placedSyllables: [],
  },
  ui: {
    screen: 'splash',
    boss: null,         // 진행 중 보스 데이터
  },
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(event = 'change') {
  for (const fn of listeners) {
    try { fn(event, state); } catch (e) { console.error(e); }
  }
}
