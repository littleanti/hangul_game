// state.js — 전역 상태 싱글톤 (TRD §3.3 스키마)

export const state = {
  settings: {
    ttsEnabled: true,      // TTS 발화 on/off
    sfxEnabled: true,      // 효과음 on/off
    hintVisible: true,     // 설정에서 힌트 강제 표시 여부
    audioReady: false,     // 사용자 제스처 후 AudioContext unlock 완료 플래그
    speechReady: false,    // SpeechSynthesis 활성화 플래그
  },
  session: {
    queue: [],             // VocabItem[] — 이번 세션 출제 순서 (shuffle 후 고정)
    currentIdx: 0,         // 현재 라운드 인덱스
    hintLevel: 1,          // 1 | 2 | 3 (TRD §3.4)
    correctCount: 0,       // 세션 누적 정답 수
    wrongCount: 0,         // 세션 누적 오답 수
    stars: 0,              // 세션 획득 별 (정답률 기반)
    wrongPerRound: [],     // 라운드별 오답 수 — calcScore 보너스 산정 (TRD §9.1)
    lastPlayedWords: null, // Set<string> — 직전 세션 어휘 (메모리 내, 미영속)
  },
  round: {
    phase: 'idle',         // 'idle'|'presenting'|'awaiting'|'correct'|'wrong'|'result'
    selectedComponents: [],// 사용자가 선택한 한자 블록 ID (최대 2개)
    attemptCount: 0,       // 현재 라운드 시도 횟수
  },
  progress: {
    totalSessions: 0,      // 누적 세션 수 (localStorage 영속)
    bestScore: 0,          // 최고 점수 (영속)
    lastHintLevel: 1,      // 마지막 세션 종료 힌트 레벨 (영속, 다음 세션 초기값)
  },
};
