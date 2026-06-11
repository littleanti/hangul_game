/**
 * 상수 정의 (TRD §2.2 — 최하위, 순수 상수, 의존성 없음)
 */

// 스토리지·캐시 격리 (TRD §7.4)
// CACHE_VERSION은 sw.js의 동명 상수와 항상 일치시킬 것 (sw.js는 ES Module이 아니라 import 불가).
// v2: M1-1 버그(Cache First 프리캐시 고착) 수정 시 v1 캐시 일괄 폐기를 위해 상향 — BUG.md 참조.
export const STORAGE_PREFIX = 'compound_split_';
export const CACHE_VERSION = '5_compound_split-v2';

// localStorage 키 (TRD §3.3)
export const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
export const PROGRESS_KEY = `${STORAGE_PREFIX}progress`;
export const LEADERBOARD_KEY = `${STORAGE_PREFIX}leaderboard`;

// 설정 기본값·허용값 — 2모드 체계: 2 = 연습하기(점선+첫 조각 그림) / 3 = 도전하기(단서 없음)
// 구 L1(실선, 값 1)은 폐기 — 레거시 저장값은 storage.js loadSettings()에서 2로 마이그레이션.
export const DEFAULT_QUESTION_COUNT = 6;
export const DEFAULT_FADING_LEVEL = 2;
export const QUESTION_COUNTS = [6, 12, 18];
export const FADING_LEVELS = [2, 3];

// 모드 표시 레이블 — UI·리더보드 공용 (과거 기록의 fadingLevel 1은 '연습하기'로 폴백 표시)
export const FADING_LEVEL_LABELS = { 2: '연습하기', 3: '도전하기' };

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

// 자동 승급 플래그 (PLAN R2 조치)
// 0 = OFF(기본): 자동 승급 없음 — 아동/보호자가 모드를 수동 선택.
// N(> 0) = ON: 연속 정답 N회 도달 시 연습하기(2) → 도전하기(3) 단 한 번 승급.
// A/B 검증 시 이 값만 변경하면 됨 — 로직은 game.js maybeAutoAdvance()가 플래그를 검사.
export const AUTO_ADVANCE_STREAK = 0;
