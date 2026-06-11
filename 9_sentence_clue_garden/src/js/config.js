/**
 * 상수 정의 (TRD §2.3 — 최하위, 순수 상수, 의존성 없음)
 */

// 스토리지·캐시 격리 (TRD §6.3)
// CACHE_VERSION은 sw.js의 동명 상수와 항상 일치시킬 것 (sw.js는 ES Module이 아니라 import 불가).
export const STORAGE_PREFIX = '9scg_';
export const CACHE_VERSION = '9_sentence_clue_garden-v1';

// localStorage 키 (TRD §3.3, §3.4)
export const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
export const LEADERBOARD_KEY = `${STORAGE_PREFIX}leaderboard`;

// IndexedDB (TRD §3.5, §8.2)
export const DB_NAME = '9scg_db';
export const DB_VERSION = 1;
export const SESSIONS_STORE = 'sessions';

// 설정 허용값 (TRD §3.2)
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'all'];
export const QUESTION_COUNTS = [5, 10, 20];

// 설정 기본값 (TRD §3.4)
export const DEFAULT_SETTINGS = {
  difficulty: 'all',
  questionCount: 10,
  hintEnabled: true,
  ttsEnabled: true,
  soundEnabled: true,
  playerName: '',
};

// 리더보드 최대 기록 수 (TRD §8.1)
export const LEADERBOARD_MAX = 50;

// 게임 타이밍 (TRD §5.2)
export const JUDGE_DELAY_MS = 500;   // 칩 배치 → 정답 판정
export const NEXT_DELAY_MS = 1500;   // 피드백 → 다음 문제

// 드래그 자성 스냅 범위 (TRD §5.3)
export const SNAP_RANGE_PX = 30;

// 3단 단서 페이딩 최대 레벨 (TRD §5.4)
export const MAX_HINT_LEVEL = 3;

// TTS (TRD §7.3)
export const TTS_RATE = 0.85;
export const TTS_LANG = 'ko-KR';
