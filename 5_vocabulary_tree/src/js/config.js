// 전역 상수
// 변경 시 docs/TRD.md §3 알고리즘과 동기화

export const CONFIG = {
  // 일일 학습 목표
  DAILY_TARGET_WORDS: 4,

  // 매칭/드래그
  SNAP_GUIDE_DP: 60,    // 시각 가이드 표시 거리
  SNAP_STICK_DP: 30,    // 흡착 (블록이 가지 끝으로 보간)

  // 나무 성장 단계 (누적 어휘 임계치)
  STAGE_THRESHOLD: {
    sapling: 0,
    young:   30,
    mature:  120,
    world:   400,
  },

  // SRL 간격 시퀀스 (일)
  SRL_INTERVALS: [1, 3, 7, 14, 30],
  SRL_EASE_DEFAULT: 2.0,
  SRL_EASE_MIN: 1.3,

  // TTS
  TTS_LANG: 'ko-KR',
  TTS_RATE_WORD: 0.85,
  TTS_RATE_HANJA: 0.7,

  // 학술 보스 진입 누적 어휘 수
  BOSS_UNLOCK_WORDS: 30,

  // 카메라
  CAMERA_SCALE_MIN: 0.3,
  CAMERA_SCALE_MAX: 3.0,

  // 알림 (분 단위)
  NOTIFY_DEFAULT_HOUR: 17, // 오후 5시

  // 디버그
  DEBUG: false,
};

// 화면 라우트
export const SCREENS = Object.freeze({
  SPLASH: 'splash',
  TODAY: 'today',
  PLAY: 'play',
  TREE: 'tree',
  LOCK: 'lock',
  BOSS: 'boss',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  COLLECTION: 'collection',
});
