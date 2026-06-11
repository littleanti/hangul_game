# TRD — 합성어 쪼개기 (5_compound_split)

> Technical Requirements Document
> Last updated: 2026-06-11

---

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 의존성 없음, 빌드 불필요 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 지원, 트리 분리 용이 |
| CSS | Vanilla CSS + CSS Variables | 디자인 토큰 공유, 시리즈 정합 |
| 폰트 | Google Fonts — Jua, Gowun Dodum | 시리즈 표준 한글 폰트 |
| 개발 서버 | `npx serve -l 4329` | zero-config, ES Modules file:// 우회 |
| 저장소 | `localStorage` | 진척·설정 영속화, 서버 불필요 |
| TTS | Web Speech API (`ko-KR`) | 네이티브, 설치 불필요 |
| 효과음 | Web Audio API (오실레이터) | 외부 파일 없이 정답/오류 톤 생성 |

**의도적으로 제외한 것**:
- React/Vue 등 프레임워크 — 이 규모에서는 과함
- Vite/Webpack 빌드 도구 — ES Modules로 충분, 빌드 단계 없음
- TypeScript — 프로토타입 속도 우선
- npm 런타임 의존성 — `node_modules` 없음

---

## 2. 아키텍처

### 2.1 디렉터리 구조

```
5_compound_split/
├── index.html                  # 단일 HTML, 모든 화면 포함
├── manifest.json               # PWA 매니페스트 (start_url·scope './')
├── sw.js                       # Service Worker (CACHE_VERSION 고유 접두사)
├── docs/
│   ├── PRD.md
│   ├── TRD.md                  # 본 문서
│   └── PLAN.md
└── src/
    ├── css/
    │   ├── tokens.css          # 복사본: 1_chosung_quiz/src/css/tokens.css 동일
    │   ├── base.css            # body, *, 리셋, 공통 레이아웃
    │   ├── components.css      # 복사본: 1_chosung_quiz/src/css/components.css 동일
    │   ├── screens.css         # 공용 화면(start/settings/leaderboard/end) 스타일
    │   │                       #   → 1_chosung_quiz/src/css/screens.css 공용 섹션 가져옴
    │   └── game.css            # 게임 플레이 화면 전용 확장 스타일
    ├── data/
    │   └── words.js            # 합성어 콘텐츠 데이터 (ES Module)
    └── js/
        ├── main.js             # 진입점 + window 전역 노출
        ├── config.js           # 상수 (순수, 의존성 없음)
        ├── state.js            # 전역 상태 싱글톤
        ├── storage.js          # localStorage 래퍼
        ├── utils.js            # 순수 유틸 (셔플 등)
        ├── tts.js              # Web Speech API 래퍼
        ├── sound.js            # Web Audio API 효과음
        ├── ui.js               # 화면 전환 헬퍼 (goTo)
        ├── settings.js         # 설정 화면 렌더링
        ├── leaderboard.js      # 리더보드 화면 렌더링
        └── game.js             # 게임 로직 (출제·탭 처리·피드백·종료)
```

### 2.2 모듈 의존성

```
main.js
  ├─ config.js          (최하위, 순수 상수)
  ├─ state.js           → config.js, words.js
  ├─ storage.js         → state.js, config.js
  ├─ utils.js           → config.js
  ├─ tts.js             (독립)
  ├─ sound.js           (독립)
  ├─ ui.js              → utils.js, tts.js
  ├─ settings.js        → state.js, storage.js, ui.js
  ├─ leaderboard.js     → storage.js, ui.js
  └─ game.js            → state.js, utils.js, tts.js, sound.js, ui.js, storage.js, words.js
```

`main.js`는 모든 모듈의 공개 함수를 `window.*`에 노출하여 HTML `onclick=""` 속성에서 호출 가능하게 한다. 이벤트 리스너 배선은 JS에서 하지 않는다.

### 2.3 화면 상태 머신

```
start ──→ game ──→ end
  │         ↑        │
  ↓         │        ↓
settings ───┘    leaderboard
  │                   │
  └─────────────────→ start
```

전이 시 부작용:
- 모든 전이 → `cancelSpeech()` + 진행 중인 게임 타이머·팝업 해제
- `game-screen` 진입 → `startGame()` 호출
- `settings-screen` 진입 → `renderSettings()` 호출
- `leaderboard-screen` 진입 → `renderLeaderboard()` 호출

---

## 3. 데이터 모델 / 스키마

### 3.1 콘텐츠 데이터 (`src/data/words.js`)

```js
// 합성어 단일 항목
/**
 * @typedef {Object} CompoundWord
 * @property {string}   id          - 고유 ID (예: 'raindrop')
 * @property {string}   word        - 합성어 전체 (예: '빗방울')
 * @property {string}   part1       - 첫 번째 형태소 (예: '비')
 * @property {string}   part2       - 두 번째 형태소 (예: '방울')
 * @property {string}   part1Emoji  - 첫 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part2Emoji  - 두 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part1Meaning - 첫 번째 조각 뜻 라벨 (예: '내리는 비')
 * @property {string}   part2Meaning - 두 번째 조각 뜻 라벨 (예: '동그란 방울')
 * @property {string}   [part1ImageUrl] - 조각1 그림 URL (선택, 이모지 폴백)
 * @property {string}   [part2ImageUrl] - 조각2 그림 URL (선택, 이모지 폴백)
 * @property {string}   sceneEmoji  - 합성어 전체 대표 이모지 (카드 배경용)
 * @property {string}   sharedMorpheme - 공유 형태소 ID ('방울'|'빛'|'송이')
 * @property {string[]} wrongSplits - 잘못된 분절 예시 배열 (오답 탭 검출용)
 *                                    예: ['빗방', '울'], ['빗', '방울'] 중 올바른 쪽 제외
 * @property {string}   category    - 씬 카테고리 (Stage 3 씬 ID와 호환)
 *                                    예: 'rain_raindrop', 'mountain_pinecone' 등
 */

export const WORDS = [
  {
    id: 'raindrop',
    word: '빗방울',
    part1: '비',          // '빗'의 기저형
    part2: '방울',
    part1Emoji: '🌧️',
    part2Emoji: '💧',
    part1Meaning: '내리는 비',
    part2Meaning: '동그란 방울',
    sceneEmoji: '🌧️',
    sharedMorpheme: '방울',
    wrongSplits: [['빗방', '울'], ['빗', '방울']],  // '비(빗)+방울'이 정답
    category: 'rain_raindrop',
  },
  // ... (솔방울, 별빛, 달빛, 꽃송이, 눈송이)
];

// 공유 형태소 페어링 메타 (Stage 4 payoff 보호용 참조)
export const SHARED_MORPHEME_PAIRS = {
  '방울': ['raindrop', 'pinecone'],
  '빛':   ['starlight', 'moonlight'],
  '송이': ['flower', 'snowflake'],
};
```

**스키마 설계 원칙**:
- `id`는 Stage 3 (`4_word_network`) 단어 ID와 동일한 네이밍 규칙(`씬_표제어`) 준수 → 상호 참조 용이
- `wrongSplits`는 배열의 배열로 복수 오답 경계를 정의; 각 내부 배열은 `[part1오답, part2오답]` 쌍
- `sharedMorpheme`은 공유 형태소 시각 연출 여부를 제어하는 플래그로 활용 가능
- `part1ImageUrl` / `part2ImageUrl` 미제공 시 이모지로 graceful fallback

### 3.2 게임 전역 상태 (`src/js/state.js`)

```js
state = {
  settings: {
    questionCount: 6 | 12 | 18,   // 문항 수
    fadingLevel:   2 | 3,         // 2모드 — 2: 연습하기(점선 경계+첫 조각 힌트), 3: 도전하기(무단서)
                                  // 값 1은 레거시(구 L1 실선) — 로드 시 2로 마이그레이션 후 저장
    ttsEnabled:    boolean,
    soundEnabled:  boolean,
  },
  game: {
    queue:        CompoundWord[],  // 이번 세션 출제 순서
    currentIdx:   number,          // 현재 카드 인덱스
    correctCount: number,          // 정답 수
    errorCount:   number,          // 잘못된 분절 시도 수 (라운드당 누적)
    popupOpen:    boolean,         // 조각 팝업 표시 여부
    popupDwellMs: number,          // 팝업 표시 시작 타임스탬프 (체류 시간 측정)
  },
  session: {
    startedAt:    number,          // 세션 시작 타임스탬프
    completedAt:  number | null,
  },
}
```

### 3.3 영속 데이터 스키마 (`localStorage`)

모든 키는 `compound_split_` 접두사를 붙여 같은 오리진의 타 게임과 충돌을 방지한다.

| 키 | 값 타입 | 설명 |
|---|---|---|
| `compound_split_settings` | JSON | 설정 객체 (`questionCount`, `fadingLevel`, `ttsEnabled`, `soundEnabled`) |
| `compound_split_progress` | JSON | 페이딩 레벨별 최고 연속 정답수, 완료 횟수 |
| `compound_split_leaderboard` | JSON | 세션별 기록 배열 (최대 20건, 초과 시 오래된 것 삭제) |

```js
// compound_split_leaderboard 스키마
[
  {
    ts:           number,   // 완료 타임스탬프 (Unix ms)
    fadingLevel:  number,   // 2 | 3 (신규 기록). 과거 기록의 1은 데이터 수정 없이
                            // 표시 시에만 레이블 매핑: 1·2 → "연습하기", 3 → "도전하기"
    questionCount: number,
    correctCount: number,
    errorCount:   number,   // 세션 전체 오류 탭 횟수
    durationMs:   number,   // 세션 소요 시간
  },
  // ...
]
```

---

## 4. 디자인 시스템 정합성

### 4.1 원칙

공용 화면(홈/시작·설정·리더보드·완료)은 `1_chosung_quiz/src/css/`의 토큰·컴포넌트·화면 스타일을 **복사(복제)** 방식으로 가져온다. `import`나 CDN 링크가 아닌 물리적 파일 복사를 채택하는 이유는 게임별 독립 배포(PWA) 구조를 유지하기 위해서다. 파일 내용이 변경될 경우 시리즈 전체에 동기화한다.

| 파일 | 출처 | 방식 | 게임별 수정 허용 여부 |
|---|---|---|---|
| `src/css/tokens.css` | `1_chosung_quiz/src/css/tokens.css` 복사 | 파일 복제 | 금지 (토큰 추가만 허용) |
| `src/css/components.css` | `1_chosung_quiz/src/css/components.css` 복사 | 파일 복제 | 금지 |
| `src/css/screens.css` | `1_chosung_quiz/src/css/screens.css` 공용 섹션 발췌 복사 | 파일 복제 | 금지 (play 화면 섹션은 제외) |
| `src/css/game.css` | 신규 | 고유 작성 | 자유 확장 |

CSS 로드 순서 (`index.html` `<head>`):
```html
<link rel="stylesheet" href="src/css/tokens.css">
<link rel="stylesheet" href="src/css/base.css">
<link rel="stylesheet" href="src/css/components.css">
<link rel="stylesheet" href="src/css/screens.css">
<link rel="stylesheet" href="src/css/game.css">
```

### 4.2 색상 토큰 (tokens.css — 정본 수치)

```css
:root {
  --cream:       #FFF6E4;   /* 배경 */
  --coral:       #FF7757;   /* 주 강조색 */
  --coral-dark:  #d45a40;   /* 버튼 그림자 */
  --navy:        #2D3047;   /* 텍스트·테두리 */
  --navy-dark:   #1a1c2b;
  --mint:        #6BCAB8;   /* 보조 강조 */
  --mint-dark:   #4fa192;
  --yellow:      #FFD166;   /* 배지·강조 */
  --yellow-dark: #d4ad4e;
  --pink:        #FFB5B5;
  --red:         #E84545;
  --red-dark:    #b63333;
  --gray:        #E5E1D6;
  --shadow:      rgba(45, 48, 71, 0.15);
  /* 시맨틱 */
  --color-text:      var(--navy);
  --color-text-dim:  #6b6e82;
  --color-surface:   #FFFFFF;
  --color-surface2:  #F5EDD8;
  --color-border:    var(--gray);
}
```

배경은 항상 `background: var(--cream)`.

### 4.3 폰트 규격

```html
<!-- index.html <head> — Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

| 요소 | 규격 |
|---|---|
| 시작 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 2.1rem; color: var(--coral)` |
| 본문·부제목·설명 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 설정 섹션 레이블 | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |

### 4.4 버튼 규격 (components.css)

| 클래스 | font-size | padding | border-radius | 배경 | box-shadow |
|---|---|---|---|---|---|
| `.btn` | 1.2rem | 14px 28px | 100px | `var(--coral)` | `0 5px 0 var(--coral-dark)` |
| `.btn.big` | 1.45rem | 16px 44px | 100px | 동일 | 동일 |
| `.btn.small` | 1rem | 10px 20px | 100px | 동일 | 동일 |

공통 속성: `font-family: 'Jua', sans-serif; letter-spacing: 0.5px; color: #fff;`

눌림 효과 (`:active`): `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark);`

`.btn.mint` (보조 버튼): `background: var(--mint); box-shadow: 0 5px 0 var(--mint-dark)`
`.btn.ghost` (테두리 버튼): `background: transparent; color: var(--navy); box-shadow: inset 0 0 0 2px var(--navy)`

### 4.5 게임 플레이 화면 전용 CSS (`src/css/game.css`)

`screens.css`의 play-screen 섹션은 포함하지 않는다. `game.css`는 아래 요소를 신규 정의한다.

| 요소 | 설명 |
|---|---|
| `.compound-card` | 합성어 카드 컨테이너 — 경계 표시 레이어 포함, `min-height: 120px`, `border-radius: 32px` |
| `.boundary-dashed` | 연습하기 점선 경계 — `border-left: 3px dashed var(--coral)` |
| `.boundary-hidden` | 도전하기 경계 없음 — `border: none` (클래스만 다름, 실제 선 없음) |
| `.split-part` | 분절된 조각 카드 — `min-width: 56dp`, 탭 영역 전체 터치 가능 |
| `.split-popup` | 정답 팝업 오버레이 — `.modal-overlay` 기반, 조각 그림 2장 + 뜻 라벨 |
| `.popup-piece` | 팝업 내 조각 카드 1장 — 이모지 + 뜻 라벨 세로 배열 |
| `.error-message` | 오류 피드백 메시지 — `var(--red)` 배경, `.flash` 컴포넌트 확장 |
| `.progress-indicator` | N/M 진행 표시 — `font-family: 'Jua'` |

세로 방향 고정(`orientation: portrait` 전용). 가로 방향 UI(2컬럼 레이아웃·돋보기·핀치)는 구현하지 않는다.

---

## 5. 핵심 알고리즘

### 5.1 탭 히트 검출 — 올바른 분절 판정

```
onCardTap(tapX, tapY, card):
  boundaryX = card.offsetLeft + card.splitBoundaryOffset  // 형태소 경계 X 좌표
  tolerance  = 28px  // 56dp 터치 타겟의 절반 (만 6~7세 유아 기준)

  if |tapX - boundaryX| <= tolerance:
    → triggerCorrectSplit()
  else if tapX < boundaryX - tolerance:
    → tryWrongSplit(part='left-only')   // 잘못된 왼쪽 분절
  else:
    → tryWrongSplit(part='right-only')  // 잘못된 오른쪽 분절
```

`splitBoundaryOffset`은 각 합성어의 `part1` 글자 수에 비례하여 카드 렌더링 시 계산한다.

### 5.2 오답 탭 처리

```
tryWrongSplit(part):
  1. 오류 카운트 증가 (state.game.errorCount++)
  2. 흔들림 애니메이션 (.compound-card에 'shake' 클래스 토글)
  3. .error-message 표시 — "그 조각은 뜻이 없네" (1500ms 후 자동 숨김)
  4. 효과음 playError()
  5. 카드 원위치 유지 (애니메이션 후 복귀)
```

### 5.3 2모드 페이딩 렌더링

```
renderCard(word, fadingLevel):
  // 경계 가시성
  if fadingLevel === 2: card.addClass('boundary-dashed')   // 연습하기: 점선 경계
  if fadingLevel === 3: card.addClass('boundary-hidden')   // 도전하기: 경계 없음

  // 뜻 단서량
  if fadingLevel === 2: showPart1HintOnly(word)   // 연습하기: 첫 번째 조각 그림만
  if fadingLevel === 3: hideAllHints()            // 도전하기: 그림 단서 없음 (뜻은 정답 팝업에서만)
```

레거시 값 1(구 L1 실선+양쪽 단서)은 설정 로드 시 2로 마이그레이션되므로 렌더링 분기에 존재하지 않는다. `boundary-solid` 클래스와 양쪽 단서 렌더링(`showBothPartHints`) 분기는 삭제한다. 입력 방식(탭/드래그), 화면 구성, 어휘는 모드 간 불변이다.

### 5.4 정답 팝업 흐름

```
triggerCorrectSplit():
  1. 카드 분리 애니메이션 (part1, part2 슬라이드-아웃, < 100ms 시작)
  2. 효과음 playCorrect()
  3. TTS: part1 → 0.5s 후 part2 (word 전체 발음은 카드 표시 시 1회로 충분 — 중복 제거)
  4. .split-popup 표시 (팝업 오픈 타임스탬프 기록)
  5. 아동이 팝업 탭 → 팝업 닫기 → 다음 카드
     (또는 "다음" 버튼 탭)
  6. 모든 카드 완료 → goTo('end-screen')
```

팝업 체류 시간 = 팝업 닫힘 타임스탬프 - 오픈 타임스탬프 → `state.game.popupDwellMs`에 누산.

**조사 자동 선택 규칙**: 팝업 제목의 조사는 병기("'꽃송이'은(는) 두 조각!")하지 않고 단어 마지막 글자의 종성(받침) 유무로 자동 선택한다. 한글 음절(U+AC00~U+D7A3)에서 `(charCode - 0xAC00) % 28 > 0`이면 받침 있음 → '은', `0`이면 받침 없음 → '는'을 사용한다(예: "'꽃밭'은", "'꽃송이'는"). 이 로직은 `utils.js`에 `josa(word, '은/는')` 형태의 순수 함수로 구현하며, 마지막 글자가 한글 음절 범위 밖이면 병기 형태('은(는)')로 폴백한다.

### 5.5 출제 순서 구성

```
buildQueue(words, questionCount, fadingLevel):
  pool = shuffle([...words])                   // 6개 도입 세트
  if questionCount <= pool.length:
    queue = pool.slice(0, questionCount)
  else:
    // 반복 채움 (설정 문항 수 > 6일 때)
    filled = []
    while filled.length < questionCount:
      filled.push(...shuffle([...words]))
    queue = filled.slice(0, questionCount)
  return queue
```

---

## 6. 입력 / 상호작용

### 6.1 터치 타겟 규격

- 합성어 카드 전체: 최소 터치 높이 **64dp** (유아 기준, PRD §9)
- 경계 탭 영역: 경계 양옆 각 **28px** (총 56dp)
- 팝업 "다음" 버튼: `.btn.big` — 56dp 이상
- 설정·완료 화면 버튼: `.btn` 또는 `.btn.big` — 44dp 이상

### 6.2 드래그 지원

경계 영역 드래그(스와이프)도 탭과 동일 로직으로 처리한다:
- `touchstart` → `touchend` 시 이동 거리 < 10px이면 탭으로 간주
- 이동 거리 >= 10px이고 방향이 수평이면 드래그로 간주 → 히트 검출 적용
- 수직 스크롤 방향이면 기본 스크롤 허용 (`e.preventDefault()` 미호출)

### 6.3 한글 IME 회피

텍스트 입력 필드 없음. 모든 상호작용은 블록 탭/드래그로 수행한다. `<input>`, `<textarea>` 요소를 게임 플레이 화면에 배치하지 않는다.

---

## 7. PWA / Service Worker

### 7.1 매니페스트 (`manifest.json`)

```json
{
  "name": "합성어 쪼개기",
  "short_name": "합성어쪼개기",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FFF6E4",
  "theme_color": "#FF7757",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

`start_url`과 `scope`를 `'./'`(상대경로)로 설정하여 서브디렉터리 배포 및 오리진 공유 환경에서 타 게임과 PWA 범위가 겹치지 않도록 한다.

### 7.2 Service Worker (`sw.js`)

전략: **Network First, 캐시 폴백**. 당초 Cache First였으나, 콘텐츠 갱신 시 `sw.js`가 무변경이면 프리캐시가 영구 고착되는 문제(BUG.md M1-1)로 전환했다. 온라인이면 항상 네트워크 최신 응답을 서빙하며 성공 응답을 캐시에 덮어쓰고, 오프라인이면 캐시(마지막 성공 응답)로 폴백한다 — `sw.js` 바이트 변경 없이도 콘텐츠 갱신이 즉시 반영되고 PWA 오프라인 동작은 유지된다.

```js
const CACHE_VERSION = '5_compound_split-v2'; // 구캐시 일괄 폐기가 필요할 때만 올림
const CACHE_NAME    = CACHE_VERSION;

// 캐시 대상
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/data/words.js',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/utils.js',
  './src/js/tts.js',
  './src/js/sound.js',
  './src/js/ui.js',
  './src/js/settings.js',
  './src/js/leaderboard.js',
  './src/js/game.js',
];

// install: 사전 캐시 (최초 방문 직후부터 오프라인 동작 보장)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// activate: 구버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: Network First → 캐시 폴백. 성공 응답은 캐시에 갱신 저장.
self.addEventListener('fetch', e => {
  const { request } = e;
  // 같은 오리진의 GET만 처리 — 외부 리소스(Google Fonts 등)·비GET은 브라우저 기본 동작
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE_NAME).then(c => c.put(request, copy)));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(cached =>
          cached || (request.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
```

### 7.3 SW 등록 (`index.html`)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
</script>
```

상대경로 `'./sw.js'`로 등록하여 scope가 현재 디렉터리로 제한된다.

### 7.4 스토리지 키 충돌 방지

| 범위 | 접두사 | 예시 키 |
|---|---|---|
| 캐시 스토리지 | `5_compound_split-v1` | — |
| localStorage | `compound_split_` | `compound_split_settings` |

같은 오리진에서 여러 게임이 동작하더라도 키 충돌이 발생하지 않는다. 타 게임의 접두사 예시: `chosung_` (1_chosung_quiz).

---

## 8. 모바일 우선 / 접근성

### 8.1 뷰포트 및 레이아웃

```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
```

- `min-height: 100dvh` (동적 뷰포트 단위, iOS Safari 툴바 고려)
- 세로 방향 고정 (`manifest.json` `"orientation": "portrait"`)
- 반응형 범위: 320px ~ 768px 모바일 우선
- 컨테이너 `max-width: 480px; margin: 0 auto; padding: 16px`

### 8.2 유아 터치 타겟

만 6~7세 아동의 손가락 협응을 고려하여 모든 인터랙티브 요소의 최소 터치 타겟은 **64dp**로 설정한다 (PRD §9 요구사항). 합성어 카드 전체가 탭 가능 영역이 되도록 `min-height: 120px` 이상을 유지한다.

### 8.3 접근성 기준

- 색상 대비: 텍스트(`--navy` on `--cream`) WCAG AA 준수
- `aria-label`: 버튼·팝업에 한국어 레이블 부착
- `role="dialog"`: 조각 팝업(`.split-popup`)에 적용
- TTS 미지원 시 → 설정 토글 자동 비활성화, 뜻 텍스트 표시 유지 (graceful degradation)

---

## 9. 리더보드 / 영속화

### 9.1 리더보드 화면 규격

| 항목 | 내용 |
|---|---|
| 화면 식별자 | `leaderboard-screen` |
| CSS | `screens.css`의 공용 토큰·폰트·버튼 규격 그대로 적용 |
| 표시 항목 | 날짜·시간, 모드(연습하기/도전하기 — 레거시 fadingLevel 1·2는 "연습하기", 3은 "도전하기"로 표시), 문항 수, 정답 수, 오류 탭 수 |
| 최대 기록 수 | 20건 (초과 시 가장 오래된 항목 삭제) |
| 정렬 | 최신 기록 우선 (내림차순) |
| 빈 상태 | "아직 기록이 없어요" 안내 텍스트 |

### 9.2 localStorage 접근 패턴

```js
// storage.js 공통 패턴
function loadData(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch { return defaultValue; }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* Incognito 등 실패 시 무시, 앱 정상 동작 유지 */ }
}
```

Private Browsing(시크릿 모드) 환경에서 `localStorage` 쓰기가 실패하더라도 `try/catch`로 무시하여 게임은 정상 동작한다.

---

## 10. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 탭 → 분리 애니메이션 | `transform`/`opacity`만 사용 (compositor layer, < 100ms 시작) |
| 60fps 목표 | `requestAnimationFrame` 기반 팝업 전환 |
| 초기 로드 | ES Module 파일 < 10KB 분할, `preconnect`로 Google Fonts DNS 병렬화 |
| 이미지 | `onerror` → 이모지 폴백 (로드 실패 비용 최소화) |
| TTS | `voiceschanged` 이벤트 대기 후 음성 선택; 미지원 시 자동 비활성화 |
| DOM 업데이트 | 직접 DOM 조작; 카드 전환은 `innerHTML = ''` 후 `createElement` |

---

## 11. 보안

- 사용자 텍스트 입력 없음 → XSS 표면 최소
- 콘텐츠는 정적 `words.js`에서만 로드 → `textContent` 사용 원칙 (`innerHTML`은 정적 데이터에 한해 허용)
- 외부 서버 통신 없음; 모든 데이터 로컬

---

## 12. 외부 API

### 12.1 Web Speech API (TTS)

```js
// tts.js
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang  = 'ko-KR';
utterance.rate  = 0.85;   // 유아 속도
utterance.pitch = 1.05;
// ko-KR 음성 우선 → ko* 폴백 → 기본 음성
speechSynthesis.speak(utterance);
```

호환성 처리:
- `'speechSynthesis' in window` 체크 후 미지원 시 설정 토글 비활성화
- `voiceschanged` 이벤트로 음성 리스트 비동기 로딩 대기
- 미지원 브라우저에서도 뜻 텍스트 표시로 기능 유지

### 12.2 Web Audio API (효과음)

```js
// sound.js
function playCorrect() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 880;  // A5 정답 톤
  // ... gain envelope
}

function playError() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 220;  // 낮은 오류 톤
}
```

---

## 13. 테스트 전략

### 수동 테스트 체크리스트

- [ ] 연습하기(점선 경계) → 올바른 경계 탭 → 팝업 정상 출현, TTS 재생, 뜻 라벨 표시 + 첫 번째 조각 그림만 표시됨을 확인
- [ ] 도전하기(경계 없음) → 그림 단서 없음, 정답 후 팝업에서 뜻 공개
- [ ] 레거시 설정(localStorage `fadingLevel: 1` 또는 무효값) → 로드 시 2(연습하기)로 치환·저장됨을 확인
- [ ] 잘못된 경계 탭 → "그 조각은 뜻이 없네" 메시지 + 흔들림 + 카드 복귀
- [ ] 6라운드 전체 완료 → end-screen 진입
- [ ] 리더보드 → 기록 정상 저장·표시
- [ ] TTS 미지원 브라우저 → 토글 비활성화, 텍스트 표시 유지
- [ ] Incognito 모드 → localStorage 실패해도 게임 동작
- [ ] 설정 변경 후 새로고침 → 설정 유지
- [ ] SW 등록 후 오프라인 → 캐시에서 정상 로드
- [ ] 320px 최소 너비 → 카드·버튼 레이아웃 깨짐 없음

### 자동화 (추후)

- Vitest + jsdom으로 `buildQueue`, `hitTest`, `loadData`, `saveData` 유닛 테스트
- Playwright로 연습하기·도전하기 두 모드 전체 라운드 완주 E2E 시나리오

---

## 14. 배포

빌드 단계 없음. 정적 파일 그대로 배포 가능하다.

| 환경 | 명령 |
|---|---|
| 로컬 개발 | `npx serve -l 4329` |
| GitHub Pages | `gh-pages` 브랜치 푸시 |
| Netlify | `netlify deploy --dir=5_compound_split` |
| Vercel | `vercel --prod` |
| Cloudflare Pages | 디렉터리 드래그 앤 드롭 |

---

## 15. 시리즈 연속성

### 15.1 이전 단계 (4_word_network) 데이터 연결

- `words.js`의 `id` 및 `category` 필드는 `4_word_network/src/data/words.js` 표제어 ID·씬 카테고리와 동일 규칙을 따른다.
- Stage 3 씬 배경 이모지(rain, mountain, night, meadow, winter)를 카드 배경으로 재사용 가능하다.

### 15.2 다음 단계 (6_morpheme_detective) 스키마 호환

`CompoundWord` 스키마의 `part1`, `part2`, `sharedMorpheme` 필드는 Stage 6이 참조할 수 있는 형태로 설계되었다. Stage 6은 이 스키마를 확장하여 한자 형태소 필드를 추가한다. 역방향 호환성을 위해 기존 필드명을 변경하지 않는다.

### 15.3 오픈 이슈 (기술)

- [ ] 조각 단위 신규 그림 자산(이모지 vs 일러스트) 확정 시 `part1ImageUrl` / `part2ImageUrl` 채움
- [ ] 도전하기 자동 승급 조건(연습하기에서 연속 정답 N회, `AUTO_ADVANCE_STREAK` 플래그 ON 시 2→3 단 한 번만) vs 수동 선택 — 구현 전 PRD 확정 필요
- [ ] 공유 형태소 두 번째 출현 시 시각 연출(하이라이트) 여부 — `sharedMorpheme` 필드로 제어 가능하도록 설계 완료, 연출 ON/OFF는 config.js 플래그로 조절
