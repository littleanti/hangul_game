<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# src/js

## Purpose
앱의 모든 JavaScript 로직. ES Modules로 작성되어 브라우저가 직접 import한다. 빌드 단계 없음.

## Key Files

| File | Description |
|------|-------------|
| `main.js` | 진입점. 모든 모듈 import 후 함수를 `window`에 노출, 초기화 실행 |
| `config.js` | 순수 상수. CHOSUNG 배열, DEFAULT_SETTINGS, LEVEL_DEFAULTS, 옵션 목록 |
| `state.js` | 전역 싱글톤 `state` 객체. settings + game 런타임 상태 보관 |
| `words.js` | _(src/data/)_ 단어 DB — 이 파일에서 import |
| `game.js` | 게임 로직. 문제 출제, 정답 처리, 힌트, 글자 선택 모드, 종료 화면 |
| `settings.js` | 설정 화면 렌더링 및 인터랙션. `filterWords()` 도 여기에 있음 |
| `ui.js` | 화면 전환 `goTo()`, 플래시 메시지 `showFlash()` |
| `storage.js` | localStorage 영속화 — 현재 프로필의 settings를 저장/로드 |
| `profiles.js` | 다중 프로필 관리 (생성/삭제/전환, localStorage `chosung-quiz-profiles-v1`) |
| `profile-ui.js` | 프로필 칩 + 모달 UI 렌더링 및 이벤트 핸들러 |
| `utils.js` | `getChosung()`, `shuffle()`, `$()`, `$$()` |
| `timer.js` | 100ms setInterval 카운트다운. warn/danger CSS 클래스 자동 토글 |
| `tts.js` | Web Speech API 래퍼. ko-KR 음성 우선 선택, 미지원 시 TTS_AVAILABLE=false |
| `sound.js` | Web Audio API 오실레이터로 정답/오답 효과음 생성 (외부 파일 없음) |

## Module Dependency Order

```
config.js          (순수 상수, import 없음)
words.js           (순수 데이터)
utils.js  → config
state.js  → config, words
storage.js → state, config, words, profiles
tts.js             (Web Speech API)
timer.js  → state, utils
ui.js     → utils, timer, tts
settings.js → state, storage, tts, ui, game, words
game.js   → state, utils, timer, tts, ui, settings, sound
profiles.js → config, words
profile-ui.js → profiles, utils, storage, settings, ui
main.js   → 모두 (진입점)
```

`settings.js` ↔ `game.js` 순환 참조가 있으나 레이지 참조라 런타임에 안전.

## For AI Agents

### Working In This Directory
- **새 함수를 HTML onclick에서 호출하려면** `main.js`에서 반드시 `window.함수명 = 함수명` 추가.
- **상태 변경은 항상 `state` 객체를 통해** — 함수 내부 로컬 변수로 게임 상태를 관리하지 않는다.
- **localStorage 접근은 `storage.js` / `profiles.js`에서만** — 다른 모듈에서 직접 접근하지 않는다.
- 초성 추출 공식: `Math.floor((charCode - 0xAC00) / 588)` (588 = 21 × 28)

### Key Behaviors to Preserve
- `goTo()` 호출 시 항상 `stopTimer()` + `cancelSpeech()` 선행 — `ui.js`가 이를 보장함.
- 타이머 초과 시: `revealAnswer(timedOut=true)` → `TIMEOUT_REVEAL_DURATION`(1800ms) 대기 → 자동 advance.
- 이미지 로드 실패 시 이모지로 자동 폴백 (`img.onerror` — 절대 throw 하지 않음).
- 문제 풀이 부족 시 반복 채우기로 폴백 (pool < questionCount 상황 대비).

### Testing Requirements
- `npm run dev` 후 브라우저에서 수동 테스트
- 화면 전환 4가지(start→settings, start→play, play→end, end→start) 모두 확인
- TTS / 타이머 / 이미지 모드 / 글자 선택 모드 각각 테스트

### Common Patterns
- DOM 셀렉터: `$('#id')`, `$$('.class')` (utils.js)
- 설정 옵션 변경 후 항상 `saveSettings()` + `renderSettings()` 호출
- 프로필 전환 후 항상 `loadSettings()` + `renderSettings()` + `renderProfileChip()` 호출

## Dependencies

### Internal
- `src/data/words.js` — 단어 데이터
- `index.html` — `onclick="함수명()"` 패턴으로 이 디렉토리의 함수 호출

### External
- Web Speech API (tts.js)
- Web Audio API (sound.js)
- localStorage (profiles.js, storage.js)

<!-- MANUAL: -->
