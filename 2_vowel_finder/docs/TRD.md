# TRD — 모음 찾기 (2_vowel_finder)

> Technical Requirements Document
> Last updated: 2026-06-10

---

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 의존성 없음, 시리즈 통일 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 지원, 빌드 불필요 |
| CSS | Vanilla CSS + CSS Variables | 토큰 공유, 게임별 확장 용이 |
| 폰트 | Google Fonts (Jua, Gowun Dodum) | 시리즈 공통 한글 폰트 |
| 개발 서버 | `npx serve -l 4328` | zero-config, 포트 충돌 없음 |
| 저장소 | `localStorage` (설정·점수), IndexedDB 준비 | localStorage 5MB 한도 고려 |
| TTS | Web Speech API (`ko-KR`) | 네이티브, 설치 불필요 |
| 드래그 | Pointer Events API | 마우스·터치·펜 통합 |

**의도적으로 제외한 것**:

- React/Vue 등 프레임워크 — 이 규모에서는 과함
- 빌드 도구 (Vite/Webpack) — ES Modules로 충분
- TypeScript — 프로토타입 속도 우선
- npm 의존성 — `node_modules` 없음

---

## 2. 아키텍처

### 2.1 디렉터리 구조

```
2_vowel_finder/
├── index.html
├── manifest.json
├── sw.js                        # Service Worker
├── package.json                 # { "scripts": { "dev": "npx serve -l 4328" } }
├── docs/
│   ├── PRD.md
│   ├── TRD.md                   # ← 본 문서
│   └── PLAN.md
└── src/
    ├── css/
    │   ├── tokens.css           # 공용 토큰 (1_chosung_quiz 복제·동기화)
    │   ├── base.css             # 리셋 + 전역 레이아웃
    │   ├── components.css       # 공용 컴포넌트 (1_chosung_quiz 복제·동기화)
    │   ├── screens.css          # 공용 화면: start / settings / leaderboard / end
    │   └── game.css             # 게임 고유 화면: level0 / level1 / drag-onboarding
    ├── js/
    │   ├── main.js              # 진입점 + window 전역 노출
    │   ├── config.js            # 순수 상수 (SNAP_RADIUS, LEVELS 등)
    │   ├── state.js             # 전역 상태 싱글톤
    │   ├── storage.js           # localStorage 래퍼
    │   ├── tts.js               # Web Speech API 래퍼
    │   ├── sound.js             # Web Audio API 효과음 (playCorrect / playWrong / playSnap)
    │   ├── ui.js                # 화면 전환 헬퍼 (goTo)
    │   ├── drag.js              # Pointer Events 드래그 + 자성 스냅 엔진
    │   ├── leaderboard.js       # 리더보드 렌더링 + 점수 읽기
    │   ├── settings.js          # 설정 화면 렌더링
    │   ├── level0.js            # Level 0 — 소리 매칭 게임 로직
    │   ├── level1.js            # Level 1 — 형태 분류 게임 로직
    │   └── onboarding.js        # 드래그 온보딩 1스텝 로직
    └── data/
        └── vowels.js            # 모음 데이터 + 문항 풀 (순수 데이터, 의존성 없음)
```

### 2.2 CSS 로드 순서

```html
<!-- index.html <head> -->
<link rel="stylesheet" href="src/css/tokens.css">
<link rel="stylesheet" href="src/css/base.css">
<link rel="stylesheet" href="src/css/components.css">
<link rel="stylesheet" href="src/css/screens.css">
<link rel="stylesheet" href="src/css/game.css">
```

토큰 → 베이스 → 컴포넌트 → 공용 화면 → 게임 고유 순으로 로드. 이후 레이어가 앞 레이어를 선택적으로 덮어쓴다.

### 2.3 모듈 의존성

```
main.js
  ├─ config.js         (최하위, 순수 상수)
  ├─ state.js    ─→ config.js, vowels.js
  ├─ storage.js  ─→ state.js, config.js
  ├─ tts.js            (Web Speech API, 독립)
  ├─ sound.js          (Web Audio API, 독립)
  ├─ ui.js       ─→ config.js, tts.js
  ├─ drag.js     ─→ config.js (SNAP_RADIUS 참조)
  ├─ settings.js ─→ state.js, storage.js, ui.js
  ├─ leaderboard.js ─→ storage.js, ui.js
  ├─ level0.js   ─→ state.js, config.js, tts.js, sound.js, ui.js, vowels.js
  ├─ level1.js   ─→ state.js, config.js, tts.js, sound.js, ui.js, drag.js, vowels.js
  └─ onboarding.js ─→ config.js, tts.js, sound.js, ui.js, drag.js

공통 의존:
  config.js  (순수, 최하위)
  vowels.js  (순수 데이터, 최하위)
  tts.js / sound.js (외부 API 래퍼, 단방향)
```

**tts.js 한국어 음성 선택 우선순위** (`loadVoices()` 스코어링):

| 순위 | 조건 | 예시 |
|---|---|---|
| 1 | 이름에 `Google` 포함 + `lang`이 `ko`로 시작 | "Google 한국의" |
| 2 | 이름에 `Natural`/`Neural`/`Online` 포함 + `lang`이 `ko`로 시작 | "Microsoft SunHi Online (Natural)" |
| 3 | `lang === 'ko-KR'` 기타 음성 | "Microsoft Heami" (기존 fallback) |
| 4 | `lang`이 `ko`로 시작하는 기타 음성 | — |
| 없음 | `koVoice = null` — utterance `lang='ko-KR'`만으로 동작 (기존 동일) | — |

> 근거: Windows에서 목록 첫 번째로 잡히는 구형 SAPI 음성(Microsoft Heami)이 단음절 발화("아" 등)에서 아티팩트를 일으켜 "나/냐"처럼 들림 (BUG.md 참조). Chrome의 Google 음성은 비동기 로드되므로 `voiceschanged` 재평가로 늦게 로드된 고품질 음성으로 자동 승격된다. `rate`/`pitch` 등 다른 발화 설정은 변경 없음.

### 2.4 화면 상태 머신

```
start ──→ level0 ──→ level1 ──→ drag-onboarding ──→ end
  │           ↑                                       │
  ↓           │                               (다시하기/설정)
settings ─────┘
  │
leaderboard
```

모든 전이는 `goTo(screenId)` 경유. 전이 시 공통 부작용:

- `cancelSpeech()` — TTS 중단
- `stopDrag()` — 진행 중 드래그 이벤트 해제
- `clearFeedback()` — 피드백 오버레이 초기화

### 2.5 전역 노출 패턴

`main.js`가 각 모듈의 함수를 `window`에 노출. HTML `onclick=""` 속성에서 직접 호출. 이벤트 리스너 배선 없음 (시리즈 통일 패턴).

```js
// main.js 예시
import { tapChoice }   from './level0.js';
import { tapBucket }   from './level1.js';
import { goTo }        from './ui.js';
import { speakVowel }  from './tts.js';

window.tapChoice   = tapChoice;
window.tapBucket   = tapBucket;
window.goTo        = goTo;
window.speakVowel  = speakVowel;
```

---

## 3. 데이터 모델 / 스키마

### 3.1 vowels.js — 모음 데이터

```js
// src/data/vowels.js

export const VOWELS = [
  // id: 내부 식별자 (localStorage 키에도 사용)
  // char: 모음 자소 (한글 낱자)
  // sound: TTS 발화 텍스트 (단독 발음)
  // shape: 'vertical' | 'horizontal' (세로모음 / 가로모음)
  //   vertical   — 기본 획이 세로(ㅣ)로 뻗고 자음 오른쪽에 결합 (예: ㅏ+ㄱ=가)
  //   horizontal — 기본 획이 가로(ㅡ)로 뻗고 자음 아래쪽에 결합 (예: ㅗ+ㄱ=고)
  // order: 교육 자료 기준 제시 순서 (Level 0 풀 구성에 활용)
  { id: 'a',   char: 'ㅏ', sound: '아', shape: 'vertical',   order: 1 },
  { id: 'ya',  char: 'ㅑ', sound: '야', shape: 'vertical',   order: 2 },
  { id: 'eo',  char: 'ㅓ', sound: '어', shape: 'vertical',   order: 3 },
  { id: 'yeo', char: 'ㅕ', sound: '여', shape: 'vertical',   order: 4 },
  { id: 'o',   char: 'ㅗ', sound: '오', shape: 'horizontal', order: 5 },
  { id: 'yo',  char: 'ㅛ', sound: '요', shape: 'horizontal', order: 6 },
  { id: 'u',   char: 'ㅜ', sound: '우', shape: 'horizontal', order: 7 },
  { id: 'yu',  char: 'ㅠ', sound: '유', shape: 'horizontal', order: 8 },
  { id: 'eu',  char: 'ㅡ', sound: '으', shape: 'horizontal', order: 9 },
  { id: 'i',   char: 'ㅣ', sound: '이', shape: 'vertical',   order: 10 },
];

// Level 0 문항 풀: { answer: VowelId, distractors: VowelId[] }
// 오답은 발음 유사 또는 형태 유사 기준으로 수동 큐레이션
export const LEVEL0_ROUNDS = [
  { answer: 'a',   distractors: ['eo', 'o', 'u']   },
  { answer: 'i',   distractors: ['eu', 'a', 'eo']  },
  { answer: 'o',   distractors: ['yo', 'u', 'yu']  },
  { answer: 'ya',  distractors: ['a', 'yeo', 'eo'] },
  { answer: 'eu',  distractors: ['i', 'o', 'u']    },
  { answer: 'eo',  distractors: ['a', 'yeo', 'o']  },
  { answer: 'yo',  distractors: ['o', 'yu', 'u']   },
  { answer: 'u',   distractors: ['o', 'yu', 'eu']  },
  { answer: 'yeo', distractors: ['eo', 'ya', 'a']  },
  { answer: 'yu',  distractors: ['u', 'yo', 'o']   },
];
```

> `LEVEL0_ROUNDS`는 10항목 전체 정의. 게임 시작 시 셔플하여 5문항 추출. 같은 세션 내 정답 중복 없음.

### 3.2 상태 모델 (state.js)

```js
state = {
  settings: {
    ttsEnabled:    boolean,   // TTS 켜기/끄기 (기본 true)
    sfxEnabled:    boolean,   // 효과음 켜기/끄기 (기본 true)
    vowelCount:    5 | 10,    // Level 0 출제 모음 수 (난이도 조절)
  },
  game: {
    phase:         'idle' | 'level0' | 'level1' | 'onboarding' | 'end',
    // Level 0
    l0Questions:   VowelRound[],   // 이번 세션 Level 0 문항 (셔플 후 추출)
    l0Idx:         number,         // 현재 문항 인덱스
    l0Correct:     number,         // 정답 수
    // Level 1
    l1Queue:       Vowel[],        // 10개 모음 셔플 큐
    l1Idx:         number,
    l1Correct:     number,
    // 공통
    answered:      boolean,        // 현재 문항 답변 완료 여부 (중복 탭 방지)
    scaffoldLevel: 0 | 1,          // Level 1 비계 단계 (0=아이콘+레이블+예시, 1=아이콘+레이블)
    // Level 0 음성 전용 모드는 별도 상태 필드 없음 —
    // l0Idx와 l0Questions.length에서 문항마다 파생 계산 (§9.5)
  },
  session: {
    startedAt:     number,         // Date.now() — 세션 시작 타임스탬프
  },
}
```

### 3.3 localStorage 영속화 스키마

접두사 `vowel_finder_` — `syllable_assembly_` 등 타 게임과 네임스페이스 충돌 없음.

```js
// 설정
'vowel_finder_settings'  →  JSON: { ttsEnabled, sfxEnabled, vowelCount }

// 리더보드 (최근 20세션)
'vowel_finder_scores'    →  JSON: SessionRecord[]

// SessionRecord 스키마
{
  ts:          number,   // Date.now() 타임스탬프
  l0Accuracy:  number,   // Level 0 정답률 0.0~1.0
  l1Accuracy:  number,   // Level 1 정답률 0.0~1.0
  dragDone:    boolean,  // 드래그 온보딩 완료 여부
  durationMs:  number,   // 세션 소요 시간 (ms)
  stars:       1 | 2 | 3 // 별점 (완료 화면 표시용)
}
```

> 누적 세션 수가 많아질 경우 최신 20건만 유지. IndexedDB 마이그레이션 경로는 §8 참조.

---

## 4. 디자인 시스템 정합성

### 4.1 원칙

`1_chosung_quiz/src/css/{tokens,screens,components}.css`의 수치와 토큰이 **시리즈 정본(canonical)**이다. 본 게임은 이 파일들을 `src/css/` 아래에 **복제·동기화**하여 사용한다. 공용 화면(홈·설정·리더보드·완료)은 복제된 파일만으로 구성하며 재정의 금지. 게임 플레이 고유 화면만 `game.css`로 확장한다.

> **복제 vs import**: 정적 서버 환경(빌드 없음)에서 상위 디렉터리 `../1_chosung_quiz/src/css/` 경로는 보안상 차단될 수 있음. 각 게임 디렉터리 내에 사본을 두고, 시리즈 규격 변경 시 모든 게임에 수동 동기화한다.

### 4.2 색상 토큰 (`src/css/tokens.css` — 복제)

```css
:root {
  --cream:        #FFF6E4;   /* 전체 배경 */
  --coral:        #FF7757;   /* 주조색 — 제목·버튼·강조 */
  --coral-dark:   #d45a40;   /* 버튼 그림자·눌림 */
  --mint:         #6BCAB8;   /* 보조색 — 정답 피드백·토글 ON */
  --mint-dark:    #4fa192;
  --navy:         #2D3047;   /* 텍스트·테두리 */
  --navy-dark:    #1a1c2b;
  --yellow:       #FFD166;   /* 점수 배지·하이라이트 */
  --yellow-dark:  #d4ad4e;
  --pink:         #FFB5B5;
  --red:          #E84545;   /* 오답 피드백·경고 */
  --red-dark:     #b63333;
  --gray:         #E5E1D6;   /* 비활성 칩·구분선 */
  --shadow:       rgba(45,48,71,0.15);
  /* 시맨틱 토큰 */
  --color-text:        var(--navy);
  --color-text-dim:    #6b6e82;
  --color-surface:     #FFFFFF;
  --color-surface2:    #F5EDD8;
  --color-border:      var(--gray);
}
```

### 4.3 폰트 규격

```html
<!-- index.html <head> — Google Fonts 로드 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

| 요소 | 규격 |
|---|---|
| 시작 화면 제목 | `font-family:'Jua',sans-serif; font-size:3rem; letter-spacing:2px; color:var(--coral)` |
| 설정 화면 제목 | `font-family:'Jua',sans-serif; font-size:1.8rem; color:var(--coral)` |
| 완료 화면 제목 | `font-family:'Jua',sans-serif; font-size:2.1rem; color:var(--coral)` |
| 섹션 레이블 (설정) | `font-family:'Jua',sans-serif; font-size:1.05rem` |
| 본문·부제 | `font-family:'Gowun Dodum',sans-serif; font-size:clamp(0.9rem,3vw,1.2rem)` |
| 버튼 레이블 | `font-family:'Jua',sans-serif; letter-spacing:0.5px` |

### 4.4 버튼 규격 (`src/css/components.css` — 복제)

| 클래스 | font-size | padding | border-radius | 배경 | box-shadow |
|---|---|---|---|---|---|
| `.btn` | 1.2rem | 14px 28px | 100px | `var(--coral)` | `0 5px 0 var(--coral-dark)` |
| `.btn.big` | 1.45rem | 16px 44px | 100px | 동일 | 동일 |
| `.btn.small` | 1rem | 10px 20px | 100px | 동일 | 동일 |
| 눌림(`:active`) | — | — | — | — | `translateY(4px); box-shadow:0 1px 0 var(--coral-dark)` |

색상 변형: `.btn.mint` → `var(--mint)` / `var(--mint-dark)`, `.btn.ghost` → 투명 배경 + navy 테두리.

### 4.5 배경 및 레이아웃

- 전체 배경: `background: var(--cream)` (`#FFF6E4`)
- 뷰포트: `min-height: 100dvh` (iOS Safari 주소창 대응)
- 컨테이너: `max-width: 480px; margin: 0 auto; padding: 20px 16px`
- 화면 카드(`.settings-section`): `background: white; border: 2px solid var(--navy); border-radius: 20px; box-shadow: 0 4px 0 var(--navy)`

### 4.6 공용 화면별 CSS 클래스 매핑

| 화면 | HTML id | 적용 CSS 파일 | 핵심 클래스 |
|---|---|---|---|
| 홈/시작 | `#start-screen` | `screens.css` | `.start-screen h1`, `.btn.big`, `.subtitle` |
| 설정 | `#settings-screen` | `screens.css` + `components.css` | `.settings-header h2`, `.settings-section`, `.section-label`, `.toggle-row` |
| 리더보드 | `#leaderboard-screen` | `screens.css` | 동일 토큰·폰트·버튼 규격 적용 (신설 섹션, 아래 §8 참조) |
| 완료 | `#end-screen` | `screens.css` | `.end-screen h2`, `.btn.big`, `.end-buttons` |

### 4.7 게임 플레이 고유 CSS (`src/css/game.css`)

`game.css`는 `tokens.css`에서 정의된 변수만 참조하여 확장. 공용 클래스(`.btn`, `.toggle` 등) 재정의 금지.

게임 고유 요소 예시:

```css
/* 모음 카드 (Level 0 / Level 1 공통) */
.vowel-card {
  font-family: 'Jua', sans-serif;
  font-size: clamp(4rem, 18vw, 7rem);
  width: clamp(96px, 28vw, 144px);
  height: clamp(96px, 28vw, 144px);
  background: white;
  border: 3px solid var(--navy);
  border-radius: 24px;
  box-shadow: 0 6px 0 var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy);
  touch-action: none;   /* 드래그 전용 — 스크롤 차단 */
}

/* 분류 통 (Level 1) */
.bucket {
  min-height: 96px;
  border: 3px dashed var(--navy);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-surface2);
  transition: background 0.2s, border-color 0.2s;
}
.bucket.hover-active {
  background: var(--yellow);
  border-color: var(--coral);
}

/* 진행률 HUD */
.progress-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  font-family: 'Jua', sans-serif;
  font-size: 1rem;
}

/* 드래그 온보딩 가이드 */
.onboarding-arrow {
  border: 3px dashed var(--coral);
  border-radius: 100px;
  animation: arrowPulse 1.2s ease-in-out infinite;
}
@keyframes arrowPulse {
  0%, 100% { opacity: 0.5; transform: scaleX(0.95); }
  50%       { opacity: 1;   transform: scaleX(1.05); }
}
```

---

## 5. 입력 / 상호작용

### 5.1 탭(Tap) — Level 0 보기 선택 + Level 1 통 탭

```js
// 터치·마우스 통합: pointerdown 단일 이벤트
element.addEventListener('pointerdown', onTap);

// 중복 탭 방지: state.game.answered === true 이면 즉시 반환
// 유아 대상 최소 터치 타겟: 64dp × 64dp (모음 카드), 44dp × 44dp (보기 버튼)
```

### 5.2 드래그 엔진 (`src/js/drag.js`)

```js
// Pointer Events 기반 — 마우스/터치/펜 통합
// touch-action: none 을 드래그 대상 요소에 설정 (CSS에서)

const SNAP_RADIUS = 20; // dp — config.js에서 관리

function initDrag(cardEl, dropZones) {
  let startX, startY, originX, originY;

  cardEl.addEventListener('pointerdown', e => {
    cardEl.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY;
    originX = cardEl.offsetLeft; originY = cardEl.offsetTop;
  });

  cardEl.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    cardEl.style.transform = `translate(${dx}px,${dy}px)`;
    highlightNearestZone(dropZones, e.clientX, e.clientY, SNAP_RADIUS);
  });

  cardEl.addEventListener('pointerup', e => {
    const zone = findZoneInRadius(dropZones, e.clientX, e.clientY, SNAP_RADIUS);
    if (zone) snapToZone(cardEl, zone);
    else resetCard(cardEl);
  });
}
```

**자성 스냅 동작**:
1. `pointerup` 시점에서 드롭 존과의 거리를 계산.
2. ±20dp 이내이면 `snapToZone()` 호출 → `transform` 애니메이션으로 중앙에 흡착.
3. ±20dp 초과이면 카드를 원래 위치로 복귀(`resetCard()`).
4. 스냅 성공 시 `playSnap()` 효과음 + `onDrop(zoneId)` 콜백 호출.

### 5.3 IME 회피

- 모든 입력은 **블록 탭** 또는 **드래그** — 텍스트 필드 없음.
- `<input>`, `<textarea>` 요소 사용 금지 (게임 플레이 화면).
- 설정 화면 내 프로필 이름 입력이 추후 필요할 경우 `inputmode="none"` + 커스텀 키패드 사용.

### 5.4 피드백 타이밍

| 이벤트 | 즉시 | 지연 후 |
|---|---|---|
| 정답 탭 | 정답 애니메이션 + `playCorrect()` (TTS 재발화 없음 — 다음 문항 발화와 혼동 방지) | 800ms 후 다음 문항 |
| 오답 탭 | 흔들기 애니메이션 + `playWrong()` | 1200ms 후 재시도 허용 |
| 스냅 성공 | `playSnap()` + 흡착 애니메이션 | 600ms 후 정오답 판정 |
| 스냅 실패 | 카드 원위치 복귀 | — |

---

## 6. PWA / Service Worker

### 6.1 manifest.json

```json
{
  "name": "모음 찾기",
  "short_name": "모음찾기",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FFF6E4",
  "theme_color": "#FF7757",
  "orientation": "portrait",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- `start_url`과 `scope` 모두 `'./'` — 상대 경로. 서브디렉터리 배포 대응.
- `orientation: "portrait"` — 세로 모드 고정 (Stage 1과 동일, Stage 2 가로 전환 직전).

### 6.2 Service Worker (`sw.js`)

```js
const CACHE_VERSION = '2_vowel_finder-v1';
// 타 게임 캐시와 충돌 없음:
//   1_chosung_quiz: 'chosung-quiz-v*'
//   3_syllable_assembly: '3_syllable_assembly-v*'

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/tts.js',
  './src/js/sound.js',
  './src/js/ui.js',
  './src/js/drag.js',
  './src/js/leaderboard.js',
  './src/js/settings.js',
  './src/js/level0.js',
  './src/js/level1.js',
  './src/js/onboarding.js',
  './src/data/vowels.js',
  // Google Fonts는 온라인 필요 — 캐시에서 제외 (TTS도 마찬가지)
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

### 6.3 SW 등록 (index.html)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
</script>
```

`'./sw.js'` 상대 경로 등록 — `1_chosung_quiz/sw.js`와 스코프 분리.

### 6.4 스토리지 키 충돌 방지

| 게임 | localStorage 접두사 | SW CACHE_VERSION |
|---|---|---|
| 1_chosung_quiz | `chosung_` | `chosung-quiz-v*` |
| **2_vowel_finder** | **`vowel_finder_`** | **`2_vowel_finder-v1`** |
| 3_syllable_assembly | `syllable_assembly_` | `3_syllable_assembly-v*` |

---

## 7. 모바일 우선 / 접근성

### 7.1 뷰포트 및 터치 타겟

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

| 요소 | 최소 크기 | 근거 |
|---|---|---|
| 모음 카드 (보기 탭) | 64dp × 64dp | 유아 대상 (AGENTS.md §Mobile-First) |
| 분류 통 (탭 영역) | 가로 100% / 높이 80dp 이상 | 유아 소근육 정밀도 보완 |
| TTS 재생 버튼 | 44dp × 44dp | 일반 터치 타겟 하한 |
| 설정 토글 | 52px × 30px (thumb 22px) | components.css 그대로 |

### 7.2 세로 모드 고정

```css
/* base.css */
html, body {
  height: 100%;
  min-height: 100dvh;
  overflow-x: hidden;
}
```

manifest `orientation: "portrait"` + CSS `min-height: 100dvh` 조합으로 세로 고정. JS `screen.orientation.lock()` 추가 가능(지원 여부 체크 후).

### 7.3 접근성

- 모음 카드에 `aria-label="[모음] [발음] 버튼"` 제공 (예: `aria-label="ㅏ 아 버튼"`).
- 분류 통에 `role="region"` + `aria-label="세로 모음 통 — 자음 오른쪽에 와요"` / `"가로 모음 통 — 자음 아래에 와요"`.
- TTS 버튼에 `aria-label="소리 듣기"`.
- 정답/오답 피드백은 `aria-live="polite"` 영역에 텍스트로도 출력.
- 색상만으로 정오답 구별하지 않음 — 아이콘 + 색 + 소리 3중 피드백.

### 7.4 자동재생 정책

Web Speech API / Web Audio API는 첫 사용자 인터랙션(pointerdown) 이후에만 활성화.

```js
// main.js
document.addEventListener('pointerdown', () => {
  AudioContext && audioCtx.resume();
  tts.unlock(); // voiceschanged 초기화
}, { once: true });
```

---

## 8. 리더보드 / 영속화

### 8.1 localStorage 스키마 (상세)

```js
// 키: 'vowel_finder_settings'
{
  ttsEnabled: true,
  sfxEnabled: true,
  vowelCount: 5       // 5 | 10
}

// 키: 'vowel_finder_scores'  (배열, 최신 20건 유지)
[
  {
    ts:         1749516000000,
    l0Accuracy: 0.80,           // Level 0 정답률
    l1Accuracy: 0.90,           // Level 1 정답률
    dragDone:   true,           // 드래그 온보딩 완료
    durationMs: 187000,         // 세션 소요 ms
    stars:      3               // 1~3 (완료 화면 표시)
  }
]
```

별점 산출 규칙:
- 3점: L0 ≥ 80% AND L1 ≥ 75% AND dragDone = true
- 2점: L0 ≥ 60% AND L1 ≥ 50%
- 1점: 게임 완료 (정답률 미달)

### 8.2 리더보드 화면 (`#leaderboard-screen`)

공용 디자인 시스템 토큰 적용. 별도 스타일 재정의 없음.

표시 항목:
- 최근 5세션의 L0·L1 정답률 막대 그래프 (CSS 폭 비례)
- 별점 아이콘 (1~3)
- 세션 날짜·소요 시간
- "최고 기록" 하이라이트 (최고 L0+L1 합산 정답률 세션)

렌더링: `leaderboard.js`가 `vowel_finder_scores` 읽어 순수 DOM 생성 (`innerHTML = ''` 후 루프).

### 8.3 IndexedDB 마이그레이션 경로

localStorage 5MB 한도 초과 가능성 대비. 세션 기록 누적이 20건을 초과하면 오래된 항목을 자동 삭제하여 localStorage 내에서 해결. 향후 시리즈 공통 진척도 대시보드 구현 시 IndexedDB 스토어 `hangul_games_progress`로 마이그레이션.

---

## 9. 핵심 알고리즘

### 9.1 Level 0 문항 풀 구성

```js
function buildLevel0Questions(vowelCount) {
  // LEVEL0_ROUNDS 셔플 후 vowelCount 개 추출
  const shuffled = shuffle([...LEVEL0_ROUNDS]);
  const selected = shuffled.slice(0, vowelCount);
  // 각 문항: 정답 + 오답 3개 셔플
  return selected.map(r => ({
    ...r,
    choices: shuffle([r.answer, ...r.distractors])
  }));
}
```

### 9.2 Level 1 모음 큐 구성

```js
function buildLevel1Queue() {
  return shuffle([...VOWELS]); // 10개 모음 전체 셔플
}
```

### 9.3 자성 스냅 거리 계산

```js
function distanceToBucket(pointerX, pointerY, bucketEl) {
  const rect = bucketEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  return Math.hypot(pointerX - cx, pointerY - cy);
}

function findNearestBucket(dropZones, px, py) {
  return dropZones
    .map(z => ({ zone: z, dist: distanceToBucket(px, py, z.el) }))
    .filter(({ dist }) => dist <= SNAP_RADIUS * devicePixelRatio)
    .sort((a, b) => a.dist - b.dist)[0]?.zone ?? null;
}
```

> `devicePixelRatio` 적용으로 고해상도(Retina) 화면에서도 실제 물리 픽셀 기준 20dp 스냅 유지.

### 9.4 비계 단계 (`scaffoldLevel`) 전환

Level 1 진행 중 `scaffoldLevel`을 자동 강등 (2단계):

| 조건 (문항 인덱스 idx, 0-based) | scaffoldLevel |
|---|---|
| idx < ⌈전체 문항 수 / 2⌉ — 전반 50% | 0 — 통 아이콘 + 이름 레이블 + 예시 모음 표시 |
| idx ≥ ⌈전체 문항 수 / 2⌉ — 후반 50% | 1 — 통 아이콘 + 이름 레이블 (예시 모음 숨김) |

> 10문항 기준: idx 0~4 = 0단계, idx 5~9 = 1단계. 임계값은 `Math.ceil(전체 문항 수 / 2)`.
> 변경 이력: 기존 3단(레이블+예시 → 레이블 → 아이콘만)에서 2단으로 축소 — 레이블이 사라져도 아이콘이 같은 범주 정보를 계속 제공하므로 "아이콘만" 단계는 의미 있는 페이딩이 아니어서 제거. §9.5의 Level 0 페이딩과 동일한 전반/후반 ⌈N/2⌉ 임계 패턴으로 통일.

### 9.5 Level 0 음성 전용 페이딩

Level 1의 `scaffoldLevel`(§9.4)과 동일한 페이딩 패턴 — 후반 50% 문항에서 모음 카드의 글자를 숨기고 청각 단서만 제공한다 (PRD §7.2 "Level 0 비계 페이딩").

```js
// config.js — 후반 음성 전용 구간 비율 (하드코딩 금지)
export const L0_AUDIO_ONLY_RATIO = 0.5;

// level0.js — renderQuestion(idx) 내부에서 문항마다 평가
const audioOnlyStart = Math.ceil(g.l0Questions.length * L0_AUDIO_ONLY_RATIO);
// = Math.ceil(전체/2) — 5문항이면 idx 3~4, 10문항이면 idx 5~9가 음성 전용
const audioOnly = idx >= audioOnlyStart
  && TTS_AVAILABLE                 // tts.js 기존 감지 로직 재사용 (재구현 금지)
  && state.settings.ttsEnabled;    // 설정 TTS ON
```

**렌더링 규칙 (`renderQuestion`)**

| 모드 | 카드 표시 | aria-label | CSS 클래스 |
|---|---|---|---|
| 일반 (전반 또는 fallback) | 정답 모음 글자 | `"[글자] [발음] 카드"` | `.vowel-card` |
| 음성 전용 (후반) | 물음표(?) placeholder | `"소리를 듣고 같은 모음을 찾아요"` | `.vowel-card.audio-only` |

**TTS fallback 조건**: `speak()`의 가드(`TTS_AVAILABLE && state.settings.ttsEnabled`)와 동일 조건을 `renderQuestion`에서 문항마다 재평가한다. 조건 미충족(설정 OFF, Web Speech API 미지원) 시 음성 전용 모드를 비활성화하고 모든 문항에서 글자를 표시 — 게임이 풀 수 없는 상태가 되는 것을 방지. 게임 도중 설정을 끄고 돌아와도 다음 `renderQuestion`에서 즉시 반영된다.

- 다시 듣기 버튼(`.tts-btn`, 48dp)은 모드와 무관하게 항상 표시. 문항 시작 시 TTS 자동 재생도 기존 유지.
- 정답 시 `audio-only` 카드의 글자를 공개(자소-음소 재강화)한 뒤 `correct` 피드백 적용.
- 상태 모델 필드 추가 없음 — `l0Idx` 파생값 (§3.2 참조).
- `.vowel-card.audio-only`는 `game.css`에서 tokens 변수만으로 변형 (dashed 테두리 + `--color-surface2` 배경 + 물음표 색 `--coral`). 물음표 글자 크기는 `.vowel-card` 기본 clamp를 그대로 상속 — 모음 글자와 동일 체계.

---

## 10. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 초기 로드 | ES Module 파일 각 < 10KB, 순차 로드 허용 |
| 애니메이션 | `transform` / `opacity` 전용 (compositor layer) |
| 드래그 | `pointermove`에서 `requestAnimationFrame` 래핑으로 60fps 유지 |
| TTS | `voiceschanged` 비동기 대기, 준비 전 버튼 비활성화 — 재평가 시 음성 선택 우선순위(§2.3) 재적용으로 늦게 로드된 고품질 음성으로 자동 승격 |
| 폰트 | `<link rel="preconnect">` DNS 병렬화, `font-display: swap` |
| 이미지 | 모음 글자는 텍스트 렌더링 — 이미지 에셋 없음 (초기 로드 0바이트) |

---

## 11. 보안

- 사용자 입력 없음 — XSS 표면 최소
- 모든 동적 DOM 생성 시 `textContent` 사용 (`innerHTML` 사용 시 정적 데이터만)
- localStorage 읽기는 `try/catch`로 감쌈 (Incognito 모드 대응)
- 외부 서버 전송 없음 — 모든 데이터 로컬

---

## 12. 테스트 전략

### 수동 테스트 체크리스트

- [ ] Level 0: 정답 탭 → 정답 애니메이션(TTS 재발화 없음) + 800ms 후 다음 문항 진행
- [ ] Level 0: 오답 탭 → 흔들기 + 재시도 허용 (1200ms 후)
- [ ] Level 0: 후반 50% 문항 → 카드 글자 숨김(물음표 ? placeholder) + 다시 듣기 버튼으로 재생 가능
- [ ] Level 0: TTS OFF 또는 미지원 → 모든 문항에서 카드 글자 항상 표시 (음성 전용 모드 비활성화)
- [ ] Level 1: 탭으로 분류 → 올바른 통에 배정 시 정답 피드백
- [ ] Level 1: 드래그로 분류 → ±20dp 내 스냅 성공 + 효과음
- [ ] Level 1: ±20dp 초과 드롭 → 카드 원위치 복귀
- [ ] 드래그 온보딩: ±20dp 내 드롭 → 자성 스냅 + 완료 화면 진행
- [ ] 드래그 온보딩: ±20dp 초과 → 재시도 안내
- [ ] TTS 미지원 브라우저 → 설정 토글 비활성화, 게임은 정상 동작
- [ ] 설정 변경 후 새로고침 → 설정값 유지 (localStorage)
- [ ] Incognito 모드 → localStorage 실패해도 게임 정상 동작
- [ ] 리더보드: 세션 완료 후 점수 저장 + 리더보드 화면에 반영
- [ ] PWA: 오프라인 접속 → 캐시된 정적 에셋으로 게임 실행 (TTS 제외)
- [ ] 세로 모드 유지: 가로 전환 시 레이아웃 깨짐 없음 (세로 고정)

### 자동화 (추후)

- Vitest + jsdom으로 `buildLevel0Questions`, `findNearestBucket`, `scaffoldLevel` 유닛 테스트
- Playwright로 Level 0 탭 시나리오 E2E

---

## 13. 배포

정적 파일 — 빌드 단계 없음. 루트 디렉터리(`2_vowel_finder/`) 그대로 업로드.

```bash
# 로컬 개발
npx serve -l 4328

# 빠른 확인 (Live Server)
npx live-server --port=4328 --open
```

| 옵션 | 명령 |
|---|---|
| GitHub Pages | `gh-pages` 브랜치에 `2_vowel_finder/` 내용 푸시 |
| Netlify | `netlify deploy --dir=2_vowel_finder` |
| Vercel | `vercel --prod` (루트를 `2_vowel_finder`로 지정) |
| Cloudflare Pages | 드래그 앤 드롭 |
