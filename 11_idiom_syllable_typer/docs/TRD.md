# TRD — 사자성어 음절 받아쓰기 (Idiom Syllable Typer)

> Technical Requirements Document
> Last updated: 2026-06-10

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 시리즈 컨벤션 통일, 빌드 불필요 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 지원, 의존성 없음 |
| CSS | Vanilla CSS + CSS Variables (디자인 토큰) | `1_chosung_quiz` 토큰 체계 직접 재사용 |
| 폰트 | Google Fonts `Jua` + `Gowun Dodum` | 시리즈 공통 폰트 규격 |
| 한자 폰트 | 시스템 CJK fallback (Noto Sans CJK KR 권장) | 10개 사자성어(40자) 한정 — 별도 서브셋 선택 사항 |
| 개발 서버 | `npx -y serve . -l 4332` | 포트 4332, 빌드 없음 |
| 영속화 | localStorage (설정·진행·리더보드) | 10개 어휘 한정, 5 MB 한도 내 충분 |
| TTS | Web Speech API (`ko-KR`) | 네이티브, 설치 불필요 |
| 효과음 | Web Audio API | 정답/오답 단순 톤, 의존성 없음 |

**의도적으로 제외한 것**:
- React / Vue / Svelte 프레임워크 — 이 규모에서는 과함
- 빌드 도구 (Vite / Webpack) — ES Modules + 정적 서버로 충분
- TypeScript — 프로토타입 속도 우선, JSDoc으로 보강
- IndexedDB — 데이터 규모(10개 사자성어)가 localStorage로 충분
- npm 런타임 의존성 — `node_modules` 없음

---

## 2. 아키텍처

### 2.1 디렉터리 구조

```
11_idiom_syllable_typer/
├── index.html               # 진입점. 5개 화면 슬롯 (section.screen)
├── package.json             # dev: npx -y serve . -l 4332
├── manifest.json            # PWA 매니페스트
├── sw.js                    # Service Worker (캐시 키: 11_idiom_syllable_typer-v1)
├── favicon.svg
├── src/
│   ├── css/
│   │   ├── tokens.css       # 1_chosung_quiz 토큰 복사본 (색상·그림자 CSS 변수)
│   │   ├── base.css         # 리셋 + 공통 타이포 + body/container 기본값
│   │   ├── components.css   # 1_chosung_quiz 컴포넌트 복사본 (.btn·.chip·.toggle·.modal 등)
│   │   ├── screens.css      # 공용 화면(start/settings/leaderboard/end) 스타일
│   │   └── game.css         # 게임 플레이 고유 CSS (한자 카드·슬롯·도크·키패드·팝업)
│   ├── data/
│   │   └── idioms.js        # 사자성어 10개 데이터 + 음절 분해 + 방해 음절 + 어원 정보
│   └── js/
│       ├── main.js          # 진입점 + 부트스트랩 + 화면 전환 이벤트
│       ├── config.js        # 상수 (STORAGE_PREFIX, CACHE_VERSION, 애니메이션 지연값 등)
│       ├── state.js         # 전역 상태 싱글톤
│       ├── storage.js       # localStorage 래퍼 (try/catch, Incognito 안전)
│       ├── utils.js         # 순수 유틸 (shuffle, getChosung, buildDistractors 등)
│       ├── tts.js           # Web Speech API 래퍼 (ko-KR 우선, 폴백, 미지원 비활성화)
│       ├── sound.js         # Web Audio API 효과음 (playCorrect / playWrong)
│       ├── ui.js            # showScreen, el(), progress, toast 헬퍼
│       ├── settings.js      # 설정 화면 렌더링 + 토글 이벤트
│       ├── leaderboard.js   # 리더보드 화면 렌더링
│       ├── end.js           # 완료 화면 렌더링 + 오답 복습 TTS
│       └── game.js          # 게임 루프 핵심 (문항 출제·슬롯 채점·페이딩·어원 팝업)
├── docs/                    # PRD / TRD / PLAN
└── AGENTS.md
```

### 2.2 모듈 의존성

```
config.js          (순수 상수, import 없음)
idioms.js          (순수 데이터, import 없음)
utils.js        → config.js
state.js        → config.js, idioms.js
storage.js      → config.js
tts.js             (Web Speech API 래퍼)
sound.js           (Web Audio API 래퍼)
ui.js           → utils.js, tts.js
settings.js     → state.js, storage.js, ui.js, tts.js
leaderboard.js  → state.js, storage.js, ui.js
end.js          → state.js, storage.js, ui.js, tts.js
game.js         → state.js, utils.js, tts.js, sound.js, ui.js, storage.js, idioms.js
main.js         → 위 전체 (진입점)
```

`settings.js` ↔ `game.js` 간 간접 참조는 런타임 시점 해결이므로 ES Module 순환 의존 문제 없음.

### 2.3 화면 상태 머신

```
start ──────────────────→ game
  │                         │
  ↓                         ↓
settings ←──────────────── end
  │                         │
  └─────────────────────→ leaderboard
```

화면 전환은 모두 `ui.js`의 `showScreen(name)` 경유. 전환 시 부작용:
- 모든 전환 → `tts.cancel()` + `sound.stopAll()`
- `game` 진입 → `game.startSession()` 호출
- `end` 진입 → `storage.saveResult()` + `leaderboard` 갱신
- `settings` 진입 → `settings.render()` 재호출

---

## 3. 데이터 모델 / 스키마

### 3.1 콘텐츠 데이터 (`src/data/idioms.js`)

S10(`10_literacy_decoder/src/data/idioms.js`)의 `BOSS_IDIOMS` 배열과 호환 가능한 구조로 정의한다. 필드 추가는 하위 호환성을 유지하며 확장한다.

```js
/**
 * @typedef {Object} IdiomEntry
 * @property {string}   word          - 한글 사자성어  예: "일석이조"
 * @property {string[]} hanja         - 한자 배열 (4개)  예: ["一","石","二","鳥"]
 * @property {string}   meaning       - 한 줄 의미  예: "두 가지 이득"
 * @property {string}   hint          - Lv.1 도크 툴팁용 어원 힌트
 * @property {string}   contextStory  - 어원 팝업용 짧은 일화 (1~2문장)
 * @property {SyllableEntry[]} syllables - 음절 분해 + 방해 음절
 */

/**
 * @typedef {Object} SyllableEntry
 * @property {string}   syllable      - 정답 음절  예: "일"
 * @property {string}   hanjaChar     - 해당 위치 한자  예: "一"
 * @property {string}   hanjaSound    - 한자 음  예: "일"
 * @property {string}   hanjaMeaning  - 한자 뜻  예: "하나"
 * @property {string[]} distractors   - 방해 음절 4개 (정답과 초성·모음 1자만 다름)
 */

export const IDIOMS = [
  {
    word: "일석이조",
    hanja: ["一", "石", "二", "鳥"],
    meaning: "두 가지 이득",
    hint: "돌 하나로 새 두 마리를 잡아요",
    contextStory: "활 하나로 새 두 마리를 잡듯, 한 번의 노력으로 두 가지 이득을 얻는 것.",
    syllables: [
      { syllable: "일", hanjaChar: "一", hanjaSound: "일", hanjaMeaning: "하나", distractors: ["월", "릴", "의", "울"] },
      { syllable: "석", hanjaChar: "石", hanjaSound: "석", hanjaMeaning: "돌",  distractors: ["삭", "적", "섞", "새"] },
      { syllable: "이", hanjaChar: "二", hanjaSound: "이", hanjaMeaning: "둘",  distractors: ["의", "아", "에", "이"] },
      { syllable: "조", hanjaChar: "鳥", hanjaSound: "조", hanjaMeaning: "새",  distractors: ["도", "조", "도", "초"] }
    ]
  }
  // … 나머지 9개 동일 구조
];
```

> S10 `BOSS_IDIOMS`와의 호환성: `word`, `hanja`, `meaning`, `hint`, `contextStory` 필드는 S10 스키마와 동일하다. `syllables` 배열은 S11 신규 필드이며 S10은 무시한다.

### 3.2 전역 상태 (`src/js/state.js`)

```js
const state = {
  settings: {
    fadingLevel: 1,          // 1 | 2 | 3  (현재 페이딩 레벨 고정값, 0 = 자동)
    autoFade: true,          // 자동 페이딩 진급 여부
    ttsEnabled: true,        // TTS 온/오프
    soundEnabled: true,      // 효과음 온/오프
  },
  session: {
    idioms: IdiomEntry[],    // 현재 세션 10개 문항 순서
    currentIdx: number,      // 현재 문항 인덱스 (0~9)
    slotLevels: number[],    // 슬롯별 현재 페이딩 레벨 [lv, lv, lv, lv] (슬롯 독립 적용)
    slotStates: string[],    // 'empty' | 'filled' | 'correct' | 'wrong'
    attempts: number,        // 현재 문항 시도 횟수
    wrongSlots: Set<number>, // 오답 슬롯 인덱스 집합
  },
  result: {
    totalCorrect: number,    // 1회 시도 정답 슬롯 수 (총 40슬롯)
    totalAttempts: number,   // 전체 시도 수
    wrongIdioms: string[],   // 오답이 발생한 사자성어 word 배열
    levelReached: number,    // 세션 중 도달한 최고 페이딩 레벨
  },
};
```

### 3.3 localStorage 스키마

모든 키는 `11ist_` 접두사를 사용한다 (11 Idiom Syllable Typer 약어). 동일 오리진의 다른 게임 키와 충돌하지 않는다.

| 키 | 타입 | 설명 |
|---|---|---|
| `11ist_settings` | `JSON` | 사용자 설정 (`settings` 객체 직렬화) |
| `11ist_leaderboard` | `JSON` | `LeaderboardEntry[]` 배열 (최대 50건, FIFO) |
| `11ist_progress` | `JSON` | 마지막 미완료 세션 자동저장 (재개용) |
| `11ist_completedIdioms` | `JSON` | `string[]` — S12 공유 스키마 호환용 완료 어휘 목록 |

#### LeaderboardEntry 스키마

```js
/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} date          - ISO 8601 날짜문자열
 * @property {number} correctRate   - 정답률 (0.0 ~ 1.0)
 * @property {number} levelReached  - 도달 최고 페이딩 레벨 (1~3)
 * @property {Object.<string, number>} idiomLevels
 *   - 사자성어 word → 해당 세션 최고 페이딩 레벨
 */
```

#### S12 공유 스키마 (`11ist_completedIdioms`)

S12(`12_four-character_idiom_crossword`)가 읽을 수 있도록, IME 표기를 내재화한 사자성어 목록을 별도 키에 기록한다.

```js
// 구조: string[]
// 예: ["일석이조", "이심전심", "동문서답", ...]
localStorage.setItem('11ist_completedIdioms', JSON.stringify([...completedSet]));
```

> S12 팀과 `learner.completedIdioms` 공유 스키마 컨벤션 사전 합의 필요 (오픈 이슈 — PRD §13 참조).

---

## 4. 디자인 시스템 정합성

### 4.1 원칙

게임 플레이 화면(`#game-screen`)을 제외한 **홈/시작·설정·리더보드·완료** 화면은 `1_chosung_quiz/src/css/`의 디자인 시스템을 **그대로** 따른다. 게임 플레이 화면만 `src/css/game.css`에서 고유 확장을 허용한다.

### 4.2 CSS 파일 전략

| 파일 | 출처 | 방식 |
|---|---|---|
| `src/css/tokens.css` | `1_chosung_quiz/src/css/tokens.css` 복사 | 수치 변경 금지. 새 토큰 추가 시 하단에 `/* S11 확장 */` 블록으로 분리 |
| `src/css/base.css` | `1_chosung_quiz/src/css/base.css` 기반 복사 | 리셋·body·container 공통값. 게임 고유 변경은 `game.css`로 위임 |
| `src/css/components.css` | `1_chosung_quiz/src/css/components.css` 복사 | `.btn`, `.chip`, `.toggle`, `.modal`, `.flash` 등 공용 컴포넌트. 수치 변경 금지 |
| `src/css/screens.css` | `1_chosung_quiz/src/css/screens.css` 기반 복사 | `start-screen`, `settings-screen`, `end-screen` 재사용. 리더보드 화면 추가 정의. 플레이 화면 전용 규칙은 제거 |
| `src/css/game.css` | 신규 작성 | `#game-screen` 전용 레이아웃·한자 카드·슬롯·도크·키패드·어원 팝업 |

`index.html`의 `<head>` CSS 로드 순서 (반드시 준수):

```html
<link rel="stylesheet" href="src/css/tokens.css">
<link rel="stylesheet" href="src/css/base.css">
<link rel="stylesheet" href="src/css/components.css">
<link rel="stylesheet" href="src/css/screens.css">
<link rel="stylesheet" href="src/css/game.css">
```

### 4.3 폰트 규격 (수치 그대로 준수)

```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

| 요소 | CSS 규격 |
|---|---|
| 시작 화면 제목 (`h1`) | `font-family: 'Jua', sans-serif; font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 (`h2`) | `font-family: 'Jua', sans-serif; font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 (`h2`) | `font-family: 'Jua', sans-serif; font-size: 2.1rem; color: var(--coral)` |
| 본문 / 설명 / 의미 텍스트 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 섹션 레이블 (설정 화면) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |
| 한자 카드 한자 | 시스템 CJK (Noto Sans CJK KR 권장), `font-size: clamp(2rem, 8vw, 3.2rem)` |
| 한글 독음 병기 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(1rem, 4vw, 1.4rem)` |

### 4.4 색상 토큰 (변경 금지)

```css
/* src/css/tokens.css — 1_chosung_quiz 원본 그대로 */
:root {
  --cream:      #FFF6E4;   /* 배경 */
  --coral:      #FF7757;   /* 주 강조, 제목, 버튼 */
  --coral-dark: #d45a40;   /* 버튼 그림자 */
  --mint:       #6BCAB8;   /* 보조 강조, 정답 피드백 */
  --mint-dark:  #4fa192;
  --navy:       #2D3047;   /* 기본 텍스트, 테두리 */
  --navy-dark:  #1a1c2b;
  --yellow:     #FFD166;   /* 배지, 힌트 강조 */
  --yellow-dark:#d4ad4e;
  --red:        #E84545;   /* 오답 피드백 */
  --red-dark:   #b63333;
  --gray:       #E5E1D6;
  --shadow:     rgba(45, 48, 71, 0.15);
}
```

게임 플레이 고유 확장 토큰은 `tokens.css` 하단 `/* S11 확장 */` 블록에 추가:

```css
/* S11 확장 */
:root {
  --slot-active-border: var(--coral);   /* 활성 슬롯 테두리 */
  --slot-correct-bg:    var(--mint);    /* 정답 슬롯 배경 */
  --slot-wrong-bg:      var(--red);     /* 오답 슬롯 배경 */
  --hanja-card-bg:      #FFFFFF;        /* 한자 카드 배경 */
}
```

### 4.5 버튼 규격 (수치 그대로 준수)

`src/css/components.css`를 복사하므로 아래 수치는 이미 포함된다. 게임 코드에서 임의 변경 금지.

| 클래스 | 규격 |
|---|---|
| `.btn` | `font-family: 'Jua'; letter-spacing: 0.5px; font-size: 1.2rem; padding: 14px 28px; border-radius: 100px; background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| `.btn.big` | `font-size: 1.45rem; padding: 16px 44px` |
| `.btn.small` | `font-size: 1rem; padding: 10px 20px` |
| `.btn:active` | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |
| `.btn:disabled` | `opacity: 0.4; cursor: not-allowed` |

### 4.6 배경 / 레이아웃

```css
body { background: var(--cream); }
.container { max-width: 480px; margin: 0 auto; padding: 16px; }
```

모든 화면은 `.container` 내부에 위치. 게임 플레이 화면도 동일 `max-width: 480px` 준수.

### 4.7 공용 화면별 적용 요소

| 화면 | 재사용 컴포넌트 | 비고 |
|---|---|---|
| `#start-screen` | `h1`(3rem/Jua/--coral), `.btn.big`(시작), `.chip`(레벨 선택 Lv.1~3) | 시리즈 공통 토큰·버튼 그대로 |
| `#settings-screen` | `h2`(1.8rem/Jua/--coral), `.settings-section`, `.section-label`, `.toggle-row`, `.toggle`, `.btn` | TTS·효과음·자동페이딩 토글 |
| `#leaderboard-screen` | `h2`(1.8rem/Jua/--coral), `.btn.small`, `Gowun Dodum` 본문, `--coral` 헤더 토큰 | 사자성어별 최고 레벨·정답률 표 |
| `#end-screen` | `h2`(2.1rem/Jua/--coral), `.btn.big`(다시 하기), `.btn.small`(리더보드), `.review-list` | 완료 사자성어 10개·오답 TTS |

---

## 5. 입력 / 상호작용

### 5.1 3단 페이딩 입력 방식

#### Lv.1 — 음절블록 탭 (IME 완전 회피)

- 하단 도크에 음절 블록 8개를 `grid-template-columns: repeat(4, 1fr)` 2행 배치
- 각 블록 최소 터치 타겟: **64 × 64dp** (유아 기준 적용)
- 탭(포인터 이벤트) → `game.selectSyllable(blockEl, syllable)` 호출
- `<input>` 또는 `contenteditable` 사용 안 함 — IME 회피

#### Lv.2 — 초성힌트+자모 조립 (IME 회피)

- 초성 힌트 배지 (`ㅇ`, `ㅅ` 등) 슬롯 상단 표시
- 자모 조합 키패드: `<button>` 그리드, 자모 탭 → 내부 조합기(JS)에서 음절 조립
- 조립 미리보기 슬롯에 실시간 반영
- 완성 음절 자동 확정 (종성 입력 완료 또는 다음 초성 탭 시)
- `<input>` 미사용, 키보드 IME 비노출

```js
// 자모 조합기 핵심 로직
// 초성 + 중성 → 음절 조립, 종성 유무 판별
// 한글 유니코드: 0xAC00 + (초성 idx * 21 + 중성 idx) * 28 + 종성 idx
function assembleSyllable(chosung, jungsung, jongsung = 0) {
  return String.fromCharCode(0xAC00 + (chosung * 21 + jungsung) * 28 + jongsung);
}
```

#### Lv.3 — 자유 IME 타이핑

- 각 슬롯에 `<input type="text" inputmode="text" maxlength="1">` 노출
- `input` 이벤트: `commitChar` 검증 (U+AC00~D7A3 완성형 한글만 허용)
- 자모 단독 입력 거부: `value.length === 1 && isCompleteHangul(value)` 통과 시만 채점
- `autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"` 설정
- S12(`12_four-character_idiom_crossword`) 입력 방식과 동일한 패러다임

```js
function isCompleteHangul(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}
```

### 5.2 슬롯 활성화 및 포커스

- 현재 활성 슬롯: `--slot-active-border` 테두리 + 부드러운 맥동 애니메이션
- 슬롯 탭(Lv.1·2) 또는 `<input>` 포커스(Lv.3) 시 해당 슬롯 활성화
- 정답 채움 후 다음 빈 슬롯으로 자동 이동 (좌→우)

### 5.3 채점 및 피드백

| 이벤트 | 시각 | 청각 |
|---|---|---|
| 정답 슬롯 채움 | 슬롯 녹색(`--slot-correct-bg`) + `slotPop` 애니메이션 → 어원 팝업 | `sound.playCorrect()` + TTS 해당 음절 |
| 오답 | 슬롯 빨강(`--slot-wrong-bg`) + `shake` 애니메이션 → 0.6초 후 리셋 | `sound.playWrong()` |
| 4슬롯 전체 정답 | 사자성어 완성 전체 팝 애니메이션 + 0.8초 후 다음 문항 진행 | TTS 사자성어 전체 발화 |

### 5.4 어원 팝업 (`#etymology-popup`)

- 정답 슬롯마다 즉시 표시: 한자 + 음·뜻 + `contextStory` 짧은 일화
- `2000ms` 후 자동 닫힘 (닫기 버튼으로 즉시 닫기도 가능)
- `.modal-overlay` + `.modal` 컴포넌트 재사용
- 팝업 표시 중에도 다음 슬롯 입력 가능 (논블로킹)

---

## 6. PWA / Service Worker

### 6.1 매니페스트 (`manifest.json`)

```json
{
  "name": "사자성어 음절 받아쓰기",
  "short_name": "음절 받아쓰기",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FFF6E4",
  "theme_color": "#FF7757",
  "icons": [
    { "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

- `start_url`과 `scope`를 `./`(상대경로)로 설정 — 동일 오리진 내 여러 게임 공존 허용

### 6.2 Service Worker (`sw.js`)

```js
const CACHE_VERSION = '11_idiom_syllable_typer-v1';
const CACHE_NAME = CACHE_VERSION;

// 캐시 대상 (정적 자산 전체)
const PRECACHE_URLS = [
  './',
  './index.html',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/data/idioms.js',
  './src/js/main.js',
  // … 나머지 JS 모듈
  './manifest.json',
];

// install: 사전 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// activate: 구 버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: Cache First 전략
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
```

### 6.3 SW 등록 (`index.html`)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
</script>
```

상대경로 `./sw.js` 사용 — 절대경로 금지.

### 6.4 캐시 / 스토리지 키 충돌 방지

| 항목 | 접두사 / 키 | 다른 게임과 충돌 여부 |
|---|---|---|
| Cache API | `11_idiom_syllable_typer-v1` | 고유 — 충돌 없음 |
| localStorage | `11ist_*` | 고유 접두사 — 충돌 없음 |
| Cache Storage 정리 | activate 핸들러에서 `CACHE_NAME` 불일치 항목 전부 삭제 | 타 게임 캐시는 자신의 SW가 관리 |

---

## 7. 모바일 우선 / 접근성

### 7.1 뷰포트 및 레이아웃

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

- 전체 높이: `min-height: 100dvh` (iOS Safari 주소창 변동 대응)
- 화면 방향: **세로 고정 권장** (AGENTS.md 기준) — 4×1 슬롯 + 키패드 수직 배치 최적
- 기본 컨테이너: `max-width: 480px; margin: 0 auto; padding: 16px`

### 7.2 터치 타겟

| 요소 | 최소 크기 | 근거 |
|---|---|---|
| `.btn` | 44 × 44dp | WCAG 2.5.5 (AA) |
| Lv.1 음절블록 | **64 × 64dp** | 12~13세 + 유아 기준 적용 |
| Lv.2 자모 키패드 버튼 | 48 × 48dp | 표준 키패드 크기 |
| TTS 버튼 | 44 × 44dp | 원형, 카드 우상단 고정 |

### 7.3 접근성

- 색상 대비: WCAG AA 기준 (`--navy`/`--cream` 조합 ≥ 4.5:1)
- 어원 팝업: `role="dialog"`, `aria-modal="true"`, `aria-label`
- TTS 버튼: `aria-label="발음 듣기"`, 재생 중 `aria-pressed="true"`
- 슬롯 상태: `aria-label`로 "1번 슬롯: 정답 일" 등 상태 반영
- `prefers-reduced-motion`: 슬롯 팝·셰이크 애니메이션 생략

### 7.4 한글 IME 회피 (Lv.1·2)

Lv.1·2에서는 `<input>` 요소를 DOM에 추가하지 않는다. 모든 입력은 `<button>` 탭 이벤트로 처리한다. 소프트 키보드 미노출로 모바일 레이아웃 안정성 보장.

---

## 8. 리더보드 / 영속화

### 8.1 localStorage 접근 패턴

```js
// storage.js
const PREFIX = '11ist_';

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) { /* Incognito 모드 무시 */ }
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
```

### 8.2 리더보드 갱신 로직

```js
// end.js → storage.js 흐름
function saveResult(sessionResult) {
  const board = storage.load('leaderboard', []);
  board.unshift({
    date: new Date().toISOString(),
    correctRate: sessionResult.totalCorrect / 40,
    levelReached: sessionResult.levelReached,
    idiomLevels: sessionResult.idiomLevels,
  });
  if (board.length > 50) board.length = 50;   // 최대 50건 FIFO
  storage.save('leaderboard', board);
}
```

### 8.3 리더보드 화면 구성 (`#leaderboard-screen`)

- 상단 헤더: `Jua 1.8rem / --coral` (공용 디자인 시스템 준수)
- 사자성어 10개 × 최고 도달 레벨(Lv.1~3 뱃지) + 최고 정답률 표
- 세션 이력 최근 5건 요약 카드 (날짜·정답률·최고 레벨)
- 하단: `.btn.small` "돌아가기" 버튼

### 8.4 S12 연동 (`completedIdioms` 공유 키)

세션 완료 시, 모든 슬롯을 1회 이상 정답 처리한 사자성어를 `11ist_completedIdioms`에 기록한다. S12가 이 키를 읽어 초기 어휘 풀 확정에 활용할 수 있다.

```js
export function markIdiomCompleted(word) {
  const completed = new Set(storage.load('completedIdioms', []));
  completed.add(word);
  storage.save('completedIdioms', [...completed]);
}
```

---

## 9. 핵심 알고리즘

### 9.1 방해 음절 풀 구성 (`utils.js`)

```js
// 각 문항 슬롯마다 idioms.js의 distractors 4개 + 정답 1개 = 5개 중
// 전체 도크 8개를 채우기 위해 나머지 3개는 다른 슬롯의 distractors에서 추가 샘플링
function buildDockPool(syllableEntry, allSyllables) {
  const answer = syllableEntry.syllable;
  const base = [answer, ...syllableEntry.distractors]; // 5개
  const extra = shuffle(
    allSyllables.filter(s => s !== answer && !base.includes(s))
  ).slice(0, 3);
  return shuffle([...base, ...extra]); // 8개
}
```

### 9.2 슬롯 독립 페이딩 레벨 조정

```js
// game.js
function onSlotWrong(slotIdx) {
  // 오답 슬롯만 Lv.1로 재강화, 나머지 슬롯은 현 레벨 유지
  state.session.slotLevels[slotIdx] = 1;
  state.session.wrongSlots.add(slotIdx);
}

function onSessionComplete() {
  if (!state.settings.autoFade) return;
  // 전체 슬롯 오답 없음 → 다음 문항 레벨 +1 (최대 3)
  const allClean = state.session.wrongSlots.size === 0;
  if (allClean) {
    state.settings.fadingLevel = Math.min(3, state.settings.fadingLevel + 1);
  }
}
```

### 9.3 자모 조합기 (Lv.2)

```js
// utils.js
const CHOSUNG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export function assembleSyllable(cho, jung, jong = 0) {
  return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

export function getChosung(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return syllable;
  return CHOSUNG[Math.floor(code / 588)];
}
```

---

## 10. TTS (Web Speech API)

```js
// tts.js
let koVoice = null;

function loadVoice() {
  const voices = speechSynthesis.getVoices();
  koVoice = voices.find(v => v.lang === 'ko-KR')
         || voices.find(v => v.lang.startsWith('ko'))
         || null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', loadVoice);
  loadVoice(); // 일부 브라우저는 즉시 로드
}

export function speak(text, rate = 0.9, pitch = 1.0) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'ko-KR';
  utt.rate  = rate;
  utt.pitch = pitch;
  if (koVoice) utt.voice = koVoice;
  speechSynthesis.speak(utt);
}

export function cancel() { speechSynthesis.cancel(); }
export const isSupported = () => 'speechSynthesis' in window;
```

TTS 미지원 시 설정 화면 토글 자동 비활성화 + "이 기기에서는 TTS를 지원하지 않아요" 안내.

---

## 11. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 초기 로드 | ES Module 분할 로딩, 파일당 < 10 KB 목표 |
| 애니메이션 | `transform` / `opacity` 만 사용 (compositor layer) |
| 슬롯 DOM | 4개 슬롯 정적 마크업, 재렌더링 없음 (클래스 토글만) |
| 폰트 | `preconnect` DNS 병렬화, `font-display: swap` |
| TTS | `speechSynthesis.cancel()` 선행 후 발화 (중복 발화 방지) |
| 사운드 | `AudioContext` 최초 사용자 인터랙션 후 생성 (브라우저 자동재생 정책) |

---

## 12. 보안

- 사용자 텍스트 입력(Lv.3)은 `isCompleteHangul()` 검증 후 `textContent`로만 렌더 — XSS 없음
- 어원 팝업 콘텐츠는 정적 데이터 — `innerHTML` 안전, `textContent` 권장
- localStorage 실패 시 `try/catch` 무시 — 앱은 정상 동작

---

## 13. 테스트 전략

### 수동 테스트 체크리스트

- [ ] Lv.1: 음절블록 8개 올바르게 표시, 정답·오답 즉각 피드백
- [ ] Lv.2: 초성 힌트 표시, 자모 키패드 조합 → 완성 음절 채점
- [ ] Lv.3: IME 타이핑, 완성형 한글만 채점, 자모 단독 입력 거부
- [ ] 슬롯 오답 → 해당 슬롯만 Lv.1 재강화, 나머지 슬롯 레벨 유지
- [ ] 자동 페이딩 진급: 오답 없는 문항 완료 후 다음 문항 레벨 +1
- [ ] 어원 팝업: 정답 슬롯마다 표시, 2초 자동 닫힘, 수동 닫기
- [ ] TTS 미지원 브라우저 → 토글 비활성화, 앱 정상 동작
- [ ] 10개 완료 → 완료 화면 정상 전환, localStorage 결과 저장
- [ ] 리더보드: 최근 세션 반영, 사자성어별 최고 레벨 정확히 표시
- [ ] PWA: 오프라인 상태에서 Service Worker 캐시로 정상 작동
- [ ] Incognito 모드 → localStorage 실패해도 게임 정상 동작
- [ ] iOS Safari 15+ / Chrome Android 최신: 레이아웃·TTS 확인

### 자동화 (추후)

- Vitest + jsdom: `assembleSyllable`, `getChosung`, `buildDockPool`, `isCompleteHangul` 유닛 테스트
- Playwright: 핵심 시나리오 E2E (Lv.1 전체 정답 → 레벨 진급, Lv.3 IME 입력)

---

## 14. 배포

```json
// package.json
{
  "scripts": {
    "dev":   "npx -y serve . -l 4332",
    "start": "npx -y serve . -l 4332",
    "live":  "npx -y live-server --port=4332"
  }
}
```

빌드 단계 없음 — 루트 디렉터리 그대로 정적 서버에 올리면 완료.

| 배포 옵션 | 명령 |
|---|---|
| 로컬 개발 | `npm run dev` |
| GitHub Pages | `gh-pages` 브랜치에 루트 디렉터리 푸시 |
| Netlify / Vercel | 루트 디렉터리 그대로 드래그 앤 드롭 또는 CLI |
