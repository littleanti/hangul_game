# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run local dev server (required — ES Modules won't work via file://)
npm run dev        # http://localhost:4321 via npx serve
npm run live       # live-server with auto-reload

# No build step, no install needed (zero npm dependencies at runtime)
```

No automated test runner exists yet. Manual test checklist is in `docs/TRD.md` §8.

## Architecture

Vanilla JS + CSS, no framework, no build tool. ES Modules loaded natively by the browser.

### Screen state machine
```
start ──→ play ──→ end
  │        ↑        │
  ↓        │        ↓
settings ──┘    (replay/settings)
```
Screen transitions go through `goTo(screenName)` in `src/js/ui.js`, which always calls `stopTimer()` + `cancelSpeech()` before switching.

### Module dependency order
```
config.js          (pure constants, no imports)
words.js           (pure data)
utils.js  → config
state.js  → config, words
storage.js → state, config, words
tts.js             (Web Speech API wrapper)
timer.js           (setInterval countdown)
ui.js     → utils, timer, tts
settings.js → state, storage, tts, ui, game, words
game.js   → state, utils, timer, tts, ui, settings
main.js   → all of the above (entry point)
```

`settings.js` ↔ `game.js` have a circular dependency that is safe at runtime because references are resolved lazily.

### Global function exposure pattern
`main.js` exposes module functions on `window` (e.g. `window.revealAnswer = revealAnswer`) so HTML `onclick="..."` attributes can call them. All interactive buttons use this pattern — there is no event listener wiring in JS for button clicks.

### State model
`state` in `src/js/state.js` is the single mutable global singleton:
- `state.settings` — user preferences (categories as `Set<string>`, difficulty, questionCount, timerSeconds, ttsEnabled, imageMode)
- `state.game` — runtime game state (questions array, currentIdx, score, wrongAnswers, revealed flag, timer handle)

`localStorage` persistence is handled exclusively in `storage.js` via `loadSettings()` / `saveSettings()`. All `try/catch` around localStorage is intentional for Incognito mode resilience.

### Adding words
Edit only `src/data/words.js`. Each entry: `{ emoji, word, category, imageUrl? }`. To add a new category, also add it to the `CATEGORIES` export in the same file.

### CSS layer order
`tokens.css` → `base.css` → `components.css` → `screens.css`. All colors are CSS variables defined in `tokens.css`.

## Key implementation notes

- **Chosung extraction**: `Math.floor((charCode - 0xAC00) / 588)` — 588 = 21 vowels × 28 final consonants. Non-Korean chars pass through unchanged.
- **Question pool filling**: If filtered word count < `questionCount`, the pool is repeated (shuffled each pass) until enough questions exist.
- **Timer**: 100ms `setInterval`, `timeLeft -= 0.1`. On timeout: `revealAnswer(timedOut=true)` → waits `TIMEOUT_REVEAL_DURATION` (1800ms) → advances.
- **TTS**: Waits for `voiceschanged` event; prefers `ko-KR` voice, falls back to `ko*`, then default. If unsupported, the toggle in settings is disabled automatically.
- **Image mode**: `img.onerror` always falls back to emoji — never throws.
