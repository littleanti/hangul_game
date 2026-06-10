// 전역 상태 싱글톤 — TRD §2.3
export const DEFAULT_SETTINGS = {
  ttsEnabled:   true,
  audioEnabled: true,
  pulseEnabled: true,
  fontScale:    1.0,        // 0.9 | 1.0 | 1.15
  darkMode:     false,
  inputMode:    'tap',      // 'tap' | 'magnify'
  hanjaFilter:  null,       // Set<HanjaId> | null (null = 전체)
};

export const state = {
  settings: {
    audioReady:  false,
    speechReady: false,
    ...DEFAULT_SETTINGS,
  },
  stage: {
    currentStageId:    null,
    illustrationLoaded: false,
    hitZones:          [],
    pulseUntilTs:      0,
    zoom:              1,
    pan:               { x: 0, y: 0 },
  },
  detection: {
    activeWordId:      null,
    syllables:         [],
    targetHanja:       null,
    targetSyllableIdx: -1,
    morphPhase:        'idle',  // 'idle'|'silhouette'|'oracle'|'kaisho'|'done'
    cardsRevealed:     [],
    error:             null,   // 'morph-failed' | 'card-failed' | null
  },
  progress: {
    collected:          new Set(),
    stars:              0,
    sessionStartedAt:   0,
    sessionDiscoveries: 0,
    sessionCollected:   new Set(),
  },
};
