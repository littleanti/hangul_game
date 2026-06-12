/**
 * config.js — 전역 상수 (순수 상수, import 없음)
 */

/** localStorage 키 접두사 — 동일 오리진 타 게임과 충돌 방지 */
export const STORAGE_PREFIX = '11ist_';

/** Service Worker 캐시 키 */
export const CACHE_VERSION = '11_idiom_syllable_typer-v2';

/* ── 게임 구조 상수 ─────────────────────────────── */

/** 사자성어당 음절 슬롯 수 (4×1) */
export const SLOT_COUNT = 4;

/** 세션당 문항(사자성어) 수 */
export const IDIOM_COUNT = 10;

/** 세션 총 슬롯 수 (정답률 분모) */
export const TOTAL_SLOTS = SLOT_COUNT * IDIOM_COUNT; // 40

/** Lv.1 도크 음절 블록 수 (정답 1 + 해당 슬롯 방해 4 + 타 음절 3) */
export const DOCK_SIZE = 8;

/** 페이딩 레벨 범위 (1: 음절블록 탭, 2: 초성힌트+자모 조립, 3: 자유 IME) */
export const MIN_FADING_LEVEL = 1;
export const MAX_FADING_LEVEL = 3;

/** 리더보드 최대 보관 건수 (FIFO) */
export const LEADERBOARD_MAX = 50;

/* ── 애니메이션 / 타이밍 상수 (ms) ─────────────────── */

/** 정답 슬롯 slotPop 애니메이션 길이 */
export const SLOT_POP_DURATION = 400;

/** 오답 슬롯 shake 애니메이션 길이 + 리셋 지연 (0.6초 후 리셋) */
export const SHAKE_DURATION = 600;

/** 어원 팝업 자동 닫힘 지연 */
export const POPUP_AUTO_CLOSE = 2000;

/** 4슬롯 전체 정답 → 다음 문항 진행 지연 */
export const IDIOM_COMPLETE_DELAY = 800;
