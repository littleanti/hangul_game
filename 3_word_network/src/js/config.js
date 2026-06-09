export const CATEGORIES = {
  NATURE: '자연',
  ANIMALS: '동물',
  DAILY: '일상',
  ACTIONS: '행동',
  EMOTIONS: '감정',
};

export const CATEGORY_LABELS = {
  '자연': '자연',
  '동물': '동물',
  '일상': '일상 사물',
  '행동': '행동',
  '감정': '감정(체언)',
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  CUSTOM: 'custom',
};

export const DECOY_COUNT = { easy: 2, medium: 3, hard: 4, custom: 5 };
export const MAX_DOCK_SYLLABLES = 12;
export const SNAP_RADIUS = 0.05;
export const DRAG_THRESHOLD = 8;
export const HESITATION_HINT_TICKS = 3;
export const HESITATION_POSITION_TICKS = 6;

export const SCENE_COUNT_OPTIONS = [3, 5, 8, 10];
export const CUSTOM_DECOY_OPTIONS = [2, 3, 4, 5, 6];

export const DIFFICULTY_LEVELS = [
  { key: 'easy',   emoji: '🌱', name: '레벨 1', desc: '디코이 2개' },
  { key: 'medium', emoji: '🌿', name: '레벨 2', desc: '디코이 3개' },
  { key: 'hard',   emoji: '🌳', name: '레벨 3', desc: '디코이 4개' },
  { key: 'custom', emoji: '🔥', name: '레벨 4', desc: '커스텀' },
];

export const STORAGE_KEYS = {
  SETTINGS: 'wn:settings',
  RESUME: 'wn:resume',
};

export const DEFAULT_SETTINGS = {
  categories: ['자연', '동물', '일상'],
  difficulty: 'medium',
  sceneCount: 5,
  ttsEnabled: true,
  hapticEnabled: true,
  hintMode: 'auto',
  coachingPrompt: true,
  customDecoyCount: 5,
};

// Korean high-frequency syllables for decoy generation
// Grouped by phonological similarity for confusable decoys
export const SYLLABLE_POOL = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하',
  '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히',
  '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호',
  '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후',
  '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐',
  '개', '내', '대', '래', '매', '배', '새', '애', '재', '채', '태', '패', '해',
  '강', '방', '상', '왕', '장', '창', '탕', '팡', '항',
  '길', '닐', '딜', '릴', '밀', '빌', '실', '일', '질', '칠', '킬', '틸', '필', '힐',
  '금', '넘', '담', '람', '맘', '밤', '삼', '암', '잠', '참', '캄', '탐', '팜', '함',
];
