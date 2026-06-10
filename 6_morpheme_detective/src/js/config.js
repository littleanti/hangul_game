// 상수 — TRD §2.1 config.js
export const SCREENS = {
  START:        'start-screen',
  STAGE_SELECT: 'stage-select-screen',
  PLAY:         'play-screen',
  SETTINGS:     'settings-screen',
  MISSION:      'mission-screen',
  END:          'end-screen',
  COLLECTION:   'collection-screen',
};

export const DEV_PORT        = 4324;
export const HIT_MIN_DP      = 80;                                  // PRD F4
export const MAGNET_DP       = 40;                                  // TRD §3.3
export const MAGNET_PX       = MAGNET_DP * (devicePixelRatio || 1);
export const MORPH_DURATION  = 2000;                                // ms, TRD §3.2
export const PULSE_DURATION  = 5000;                                // ms, PRD F5
export const IDLE_HINT_DELAY = 10000;                               // ms, PRD F18 (미발견 강화 펄스)
export const STORAGE_PREFIX  = '4md:';
