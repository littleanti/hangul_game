/**
 * 상수 정의 (TRD §2.2 — 최하위, 순수 상수, 의존성 없음)
 */

// 스토리지·캐시 격리 (TRD §7.4)
export const STORAGE_PREFIX = 'compound_split_';
export const CACHE_VERSION = '5_compound_split-v1';

// localStorage 키 (TRD §3.3)
export const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
export const PROGRESS_KEY = `${STORAGE_PREFIX}progress`;
export const LEADERBOARD_KEY = `${STORAGE_PREFIX}leaderboard`;

// 설정 기본값·허용값
export const DEFAULT_QUESTION_COUNT = 6;
export const DEFAULT_FADING_LEVEL = 1;
export const QUESTION_COUNTS = [6, 12, 18];
export const FADING_LEVELS = [1, 2, 3];

export const DEFAULT_SETTINGS = {
  questionCount: DEFAULT_QUESTION_COUNT,
  fadingLevel: DEFAULT_FADING_LEVEL,
  ttsEnabled: true,
  soundEnabled: true,
};

// 리더보드 최대 기록 수 (TRD §9.1)
export const LEADERBOARD_MAX = 20;

// 탭 히트 검출 허용 오차 — 56dp 터치 타겟의 절반 (TRD §5.1, M2에서 사용)
export const TAP_TOLERANCE_PX = 28;

// 탭/드래그 구분 임계값 — 이동 거리 < 10px이면 탭으로 간주 (TRD §6.2)
export const TAP_MOVE_THRESHOLD_PX = 10;

// 오류 메시지 자동 숨김 시간 (TRD §5.2)
export const ERROR_MESSAGE_MS = 1500;

// 공유 형태소 시각 연출 ON/OFF — Stage 4 payoff 보호, 기본 OFF (PLAN R3)
export const SHOW_SHARED_MORPHEME_HIGHLIGHT = false;

// L3 자동 승급 연속 정답 수 — 0이면 비활성(수동 선택), PLAN R2 확정 후 조정
export const AUTO_ADVANCE_STREAK = 0;
