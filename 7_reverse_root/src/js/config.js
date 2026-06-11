// config.js — 순수 상수 (의존성 없음, TRD §2.2 최하위 모듈)

export const PORT = 4330;                          // 개발 서버 포트 (루트 컨벤션)
export const STORAGE_PREFIX = '7rr:';              // localStorage 키 접두사 (TRD §7.3)
export const CACHE_VERSION = '7_reverse_root-v1';  // SW 캐시 버전 (M4)

export const HINT_LEVELS = [1, 2, 3];              // L1: 라벨+하이라이트, L2: 하이라이트, L3: 없음
export const ROUND_COUNTS_PER_LEVEL = [5, 5, 5];   // 힌트 레벨별 라운드 수 (TRD §3.4)

export const MAGNET_DP = 40;                       // 자성 스냅 흡착 거리 (dp, TRD §6.1)
export const MAGNET_PX = () => MAGNET_DP * (window.devicePixelRatio || 1);
export const SNAP_DIST = 8;                        // 탭 판별 이동 임계값 (px)

// 애니메이션 duration (ms)
export const DECOMP_ANIM_MS = 400;                 // 분해 pieceReveal
export const WRONG_SHAKE_MS = 350;                 // 오답 shake
export const HINT_TRANSITION_MS = 300;             // L2→L1 하이라이트 전환
export const ROUND_SUMMARY_MS = 2600;              // round-summary 인터스티셜 자동 진행 대기 (M3)
