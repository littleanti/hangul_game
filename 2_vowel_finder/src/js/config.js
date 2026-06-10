/**
 * 앱 전역 상수 — 순수 상수만 (의존성 없음, 최하위 모듈)
 */

// 드래그 자성 스냅 반경 (dp) — Stage 2 자모 슬롯 드래그와 동일 반경 유지 (TRD §5.2)
export const SNAP_RADIUS = 20;

// Level 0 기본 출제 모음 수 (설정 vowelCount 기본값)
export const L0_COUNT_DEFAULT = 5;

// Level 1 비계(scaffold) 단계 전환 임계값 — 문항 인덱스(0-based) 기준 (TRD §9.4)
//   idx 0~2 → 0단계 (통 이름 레이블 + 예시 모음)
//   idx 3~6 → 1단계 (통 이름 레이블만)
//   idx 7~9 → 2단계 (빈 통, 아이콘만)
export const SCAFFOLD_THRESHOLDS = {
  level1Start: 3,
  level2Start: 7,
};

// 피드백 타이밍 (ms) — TRD §5.4
export const FEEDBACK_DELAY_CORRECT = 800;   // 정답 탭 → 다음 문항
export const FEEDBACK_DELAY_WRONG   = 1200;  // 오답 탭 → 재시도 허용
export const SNAP_FEEDBACK_DELAY    = 600;   // 스냅 성공 → 정오답 판정

// 리더보드 세션 기록 최대 보존 수 (최신 N건 유지, TRD §8.1)
export const SCORE_MAX = 20;

// 설정 기본값 (TRD §3.2 settings 레이어)
export const DEFAULT_SETTINGS = {
  ttsEnabled: true,            // TTS 켜기/끄기
  sfxEnabled: true,            // 효과음 켜기/끄기
  vowelCount: L0_COUNT_DEFAULT, // Level 0 출제 모음 수 (5 | 10)
};
