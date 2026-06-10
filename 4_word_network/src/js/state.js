import { DEFAULT_SETTINGS } from './config.js';

const _state = {
  settings: {
    categories: new Set(DEFAULT_SETTINGS.categories),
    difficulty: DEFAULT_SETTINGS.difficulty,
    sceneCount: DEFAULT_SETTINGS.sceneCount,
    ttsEnabled: DEFAULT_SETTINGS.ttsEnabled,
    hapticEnabled: DEFAULT_SETTINGS.hapticEnabled,
    hintMode: DEFAULT_SETTINGS.hintMode,
    coachingPrompt: DEFAULT_SETTINGS.coachingPrompt,
    customDecoyCount: DEFAULT_SETTINGS.customDecoyCount,
  },
  game: {
    scenes: [],           // Scene[] — selected for this session
    currentIdx: -1,
    slot: {
      filled: [],         // (string|null)[] — null = empty, string = syllable char
      lockedCount: 0,     // how many leading slots are locked correct
    },
    dock: [],             // {id, char, used}[]
    score: 0,
    stickers: [],
    wrongAnswers: [],
    hesitationTicks: 0,
    hintLevel: 0,
    targetWordIdx: 0,     // index within scene's words array
  },
  meta: {
    sessionStartedAt: null,
    lastSavedAt: null,
  },
};

export function getState() {
  return _state;
}

export function resetGame() {
  _state.game = {
    scenes: [],
    currentIdx: -1,
    slot: { filled: [], lockedCount: 0 },
    dock: [],
    score: 0,
    stickers: [],
    wrongAnswers: [],
    hesitationTicks: 0,
    hintLevel: 0,
    targetWordIdx: 0,
  };
  _state.meta.sessionStartedAt = new Date().toISOString();
}

export function getCurrentScene() {
  const { scenes, currentIdx } = _state.game;
  return scenes[currentIdx] ?? null;
}

export function getCurrentTargetWord() {
  const scene = getCurrentScene();
  if (!scene) return null;
  return scene.words[_state.game.targetWordIdx] ?? null;
}
