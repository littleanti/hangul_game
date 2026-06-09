/**
 * 앱 전역 상수
 */

export const CHOSUNG = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

export const STORAGE_KEY = 'chosung-quiz-settings-v2';

export const DEFAULT_SETTINGS = {
  categories: null,      // null이면 로드 시점에 CATEGORIES 전체로 초기화
  difficulty: 'all',     // 'all' | 'easy' | 'medium' | 'hard'
  questionCount: 10,     // 5 | 10 | 20
  timerSeconds: 0,       // 0 | 5 | 10 | 15
  ttsEnabled: true,
  imageMode: false,
  inputMode: false,      // 초성 버튼으로 직접 입력
  hintEnabled: true,    // 게임 중 힌트 버튼 표시
};

// 레벨 버튼별 기본 설정 — difficulty만 덮어쓰고 나머지는 유저 설정 유지
export const LEVEL_DEFAULTS = {
  1: { difficulty: 'easy'   },
  2: { difficulty: 'medium' },
  3: { difficulty: 'hard'   },
  4: { difficulty: 'all'    },
};

export const DIFFICULTY_OPTIONS = [
  { key: 'all',    label: '전체' },
  { key: 'easy',   label: '쉬움 (1-2글자)' },
  { key: 'medium', label: '보통 (3글자)' },
  { key: 'hard',   label: '어려움 (4글자+)' },
];

export const COUNT_OPTIONS = [5, 10, 20];

export const TIMER_OPTIONS = [
  { val: 0,  label: '끄기' },
  { val: 5,  label: '5초' },
  { val: 10, label: '10초' },
  { val: 15, label: '15초' },
];

// 시간초과 시 정답을 보여주고 다음 문제로 넘어가기까지의 시간 (ms)
export const TIMEOUT_REVEAL_DURATION = 1800;
