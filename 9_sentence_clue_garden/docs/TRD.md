# TRD — 문장 단서 정원 (9_sentence_clue_garden)

> Technical Requirements Document  
> 버전: 1.0 | 작성일: 2026-06-10

---

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 의존성 없음, 빌드 불필요, 시리즈 전 게임 통일 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 지원, 트리 구조 명확 |
| CSS | Vanilla CSS + CSS Variables | 디자인 토큰 공유, 시리즈 정합 |
| 폰트 | Google Fonts — `Jua`, `Gowun Dodum` | 한글 아이 친화적, 시리즈 공통 |
| 개발 서버 | `npx serve -l 4331` | zero-config, 포트 4331 고정 |
| 저장소 | `localStorage` (기본) + `IndexedDB` (누적 기록) | 설정·단기 영속화/장기 학습 기록 분리 |
| TTS | Web Speech API (`ko-KR`) | 네이티브, 설치 불필요 |
| 오프라인 | Service Worker + Cache API | PWA, 홈 화면 추가 |

**의도적으로 제외한 것**:
- React / Vue 등 프레임워크
- Vite / Webpack 등 빌드 도구
- TypeScript (프로토타입 속도 우선)
- npm 런타임 의존성 (`node_modules` 없음)

---

## 2. 아키텍처

### 2.1 디렉터리 구조

```
9_sentence_clue_garden/
├── index.html              # 단일 HTML, 모든 화면 마크업
├── manifest.json           # PWA 매니페스트 (start_url·scope 모두 './')
├── sw.js                   # Service Worker (CACHE_VERSION: '9_sentence_clue_garden-v1')
├── docs/
│   ├── PRD.md
│   ├── TRD.md              ← 본 파일
│   └── PLAN.md
└── src/
    ├── css/
    │   ├── tokens.css      # 디자인 토큰 (1_chosung_quiz/src/css/tokens.css 복제·공유)
    │   ├── base.css        # 리셋, body, 공통 레이아웃
    │   ├── components.css  # 공용 컴포넌트 (1_chosung_quiz/src/css/components.css 복제·공유)
    │   ├── screens.css     # 홈·설정·완료·리더보드 화면 (시리즈 공통 규격)
    │   └── game.css        # 게임 플레이 화면 전용 확장 CSS
    ├── js/
    │   ├── main.js         # 진입점, window.* 노출
    │   ├── config.js       # 상수 (CACHE_VERSION, 스토리지 키 접두사 등)
    │   ├── state.js        # 전역 상태 싱글톤
    │   ├── storage.js      # localStorage / IndexedDB 래퍼
    │   ├── utils.js        # 순수 유틸 (셔플, 랜덤 등)
    │   ├── tts.js          # Web Speech API 래퍼
    │   ├── sound.js        # Web Audio API 효과음
    │   ├── ui.js           # 화면 전환 헬퍼 (goTo)
    │   ├── hint.js         # 3단 단서 페이딩 로직
    │   ├── dock.js         # 하단 도크 선택지 렌더링·탭·드래그
    │   ├── settings.js     # 설정 화면 렌더링
    │   ├── leaderboard.js  # 리더보드 화면 렌더링
    │   └── game.js         # 게임 코어 (출제·정답·진행)
    └── data/
        └── sentences.js    # 문제 데이터 (문장·빈칸·선택지·단서)
```

### 2.2 CSS 레이어 로드 순서

`index.html` 내 `<link>` 순서:

```html
<!-- 1. 디자인 토큰 -->
<link rel="stylesheet" href="src/css/tokens.css">
<!-- 2. 리셋·베이스 -->
<link rel="stylesheet" href="src/css/base.css">
<!-- 3. 공용 컴포넌트 (.btn, .chip, .toggle 등) -->
<link rel="stylesheet" href="src/css/components.css">
<!-- 4. 공용 화면 (홈·설정·완료·리더보드) -->
<link rel="stylesheet" href="src/css/screens.css">
<!-- 5. 게임 플레이 화면 전용 확장 -->
<link rel="stylesheet" href="src/css/game.css">
```

이 순서를 어기면 캐스케이드 우선순위가 무너진다. 5번 `game.css`만 이 게임 고유 스타일이며, 1~4번은 `1_chosung_quiz/src/css/`의 동일 파일을 **그대로 복제**한다.

### 2.3 모듈 의존성

```
main.js
  ├─ config.js          (상수, 최하위 — 의존성 없음)
  ├─ state.js     ─→ config.js
  ├─ storage.js   ─→ state.js, config.js
  ├─ utils.js     ─→ config.js
  ├─ tts.js             (Web Speech API 래퍼, 독립)
  ├─ sound.js           (Web Audio API 래퍼, 독립)
  ├─ ui.js        ─→ utils.js, tts.js
  ├─ hint.js      ─→ state.js, ui.js
  ├─ dock.js      ─→ state.js, ui.js, game.js (런타임 순환, 안전)
  ├─ settings.js  ─→ state.js, storage.js, ui.js
  ├─ leaderboard.js ─→ storage.js, ui.js
  └─ game.js      ─→ state.js, utils.js, tts.js, sound.js, ui.js,
                       hint.js, dock.js, sentences.js
```

`dock.js` ↔ `game.js` 간 런타임 순환 의존은 ES Module 지연 참조로 안전.

### 2.4 화면 상태 머신

```
home ──→ settings
  │            │
  └──→ play ←─┘
         │
         ↓
      end ──→ leaderboard
         │
         └──→ home / play (다시 하기)
```

모든 전이는 `goTo(screenName)` 경유. 전이 시 `cancelSpeech()` + 진행 중 타이머 중단.

---

## 3. 데이터 모델 / 스키마

### 3.1 문제 데이터 (`src/data/sentences.js`)

```js
// 단일 문제 항목
{
  id: 'scg_001',             // 고유 ID (문자열, 접두사 'scg_')
  sentence: '강아지가 [ ] 꼬리를 흔들며 반겼다.',
                             // 문장 원문. 빈칸 위치는 [ ] 마커로 표시
  answer: '기쁘게',          // 정답 어휘 (S8 한자어 또는 파생어)
  choices: [                 // 선택지 3~4개 (정답 포함)
    '기쁘게',
    '슬프게',
    '무섭게',
    '지루하게'
  ],
  hint: {
    level1: {                // 단계 1: 음뜻 라벨 + 하이라이트
      label: '기쁠 희(喜) — 즐거운 느낌',
      highlight: [0, 3]      // sentence 내 단서 구간 [시작, 끝] 문자 인덱스
    },
    level2: {                // 단계 2: 하이라이트만 (라벨 제거)
      highlight: [0, 3]
    }
                             // 단계 3: 단서 완전 제거 (no entry)
  },
  source: 'S8',              // 연계 단계 (S8 = 8_vocabulary_tree)
  difficulty: 'easy' | 'medium' | 'hard',
  tags: ['감정', '동작']     // 선택적 태그
}
```

**스키마 설계 원칙**:
- `sentence`의 빈칸 마커 `[ ]`는 렌더링 시 `<span class="blank">___</span>`으로 치환.
- 빈칸은 **항상 1개** — 다중 빈칸 항목은 데이터 유효성 검사에서 거부.
- `choices` 배열은 정답 1개 + distractor 2~3개로 구성. 정답은 배열 내 임의 위치.
- `hint.level1.highlight` 인덱스는 `sentence` 원문 기준(빈칸 마커 `[ ]` 포함 길이 계산).
- S8(`8_vocabulary_tree`)의 어휘 DB와 `answer`/`choices` 어휘가 호환 가능하도록 동일 어휘 ID 체계 사용 권장.

### 3.2 상태 모델 (`src/js/state.js`)

```js
const state = {
  settings: {
    difficulty: 'all' | 'easy' | 'medium' | 'hard',
    questionCount: 5 | 10 | 20,
    hintEnabled: true,         // 단서 페이딩 ON/OFF
    ttsEnabled: true,
    soundEnabled: true,
  },
  game: {
    questions: [],             // 이번 세션 문제 배열 (SentenceItem[])
    currentIdx: 0,
    score: 0,
    wrongItems: [],            // 오답 항목 { item, chosen }
    hintLevel: 0,              // 현재 문제의 단서 단계 (0=비표시, 1, 2, 3)
    answered: false,           // 현재 문제 응답 완료 여부
    selectedChoice: null,      // 탭·드래그로 선택된 선택지 텍스트
  },
  lastGameIds: new Set(),      // 직전 세션 문제 ID — 연속 중복 방지
}
```

### 3.3 리더보드 레코드 (`localStorage`)

스토리지 키: `9scg_leaderboard` (접두사 `9scg_`로 다른 게임과 충돌 방지)

```js
// localStorage.getItem('9scg_leaderboard') → JSON
[
  {
    name: '어린이1',           // 플레이어 이름 (설정에서 입력)
    score: 18,                 // 정답 수
    total: 20,                 // 총 문제 수
    accuracy: 0.90,            // 정답률
    difficulty: 'hard',
    ts: 1749600000000          // Unix ms timestamp
  },
  // ... 최대 50개 (초과 시 하위 항목 삭제)
]
```

### 3.4 설정 영속화 (`localStorage`)

스토리지 키: `9scg_settings`

```js
{
  difficulty: 'all',
  questionCount: 10,
  hintEnabled: true,
  ttsEnabled: true,
  soundEnabled: true,
  playerName: ''
}
```

### 3.5 누적 학습 기록 (`IndexedDB`)

DB명: `9scg_db` / 오브젝트 스토어: `sessions`

```js
// 세션 레코드
{
  id: 'auto_increment',
  ts: 1749600000000,
  difficulty: 'medium',
  questions: [
    { id: 'scg_001', correct: true,  hintLevelUsed: 1 },
    { id: 'scg_002', correct: false, hintLevelUsed: 2, chosen: '슬프게' }
  ],
  score: 9,
  total: 10,
  accuracy: 0.90           // S10 핸드오프 참조 필드 (PRD §9.2)
}
```

IndexedDB 접근은 `storage.js`가 전담. `try/catch` + Promise 래퍼로 실패 시 localStorage 폴백.

---

## 4. 디자인 시스템 정합성

> 이 절은 시리즈 공통 규격(`AGENTS.md` §"Series UI Design Standard" 및  
> `1_chosung_quiz/src/css/{tokens,screens,components}.css`)을 기준으로 한다.  
> **홈·설정·리더보드·완료 화면은 아래 수치를 그대로 따른다. 게임 플레이 화면만 고유 CSS(`game.css`)로 확장한다.**

### 4.1 CSS 파일 관리 방침

| 파일 | 방침 |
|---|---|
| `src/css/tokens.css` | `1_chosung_quiz/src/css/tokens.css` **복제** (내용 동일). 독립 파일로 유지해 SW 캐시 독립성 보장 |
| `src/css/components.css` | `1_chosung_quiz/src/css/components.css` **복제** (내용 동일) |
| `src/css/screens.css` | 시리즈 공통 화면 규격 구현. `1_chosung_quiz/src/css/screens.css`를 베이스로 이 게임용 화면명(`home-screen`, `settings-screen`, `end-screen`, `leaderboard-screen`)에 맞게 조정 |
| `src/css/game.css` | 이 게임 **고유** 스타일만. `tokens.css`의 변수 사용, 새 변수 추가 금지 |

`@import` 대신 `<link>` 직렬 로드를 사용한다. 브라우저 캐시 및 SW 캐시 granularity를 유지하기 위해서다.

### 4.2 색상 토큰

`src/css/tokens.css`에 정의된 변수 — 임의 하드코딩 금지:

| 변수 | 값 | 용도 |
|---|---|---|
| `--coral` | `#FF7757` | 주요 강조, 버튼, 제목 |
| `--coral-dark` | `#d45a40` | 버튼 하단 그림자 |
| `--navy` | `#2D3047` | 본문 텍스트, 테두리 |
| `--cream` | `#FFF6E4` | 배경 |
| `--mint` | `#6BCAB8` | 보조 강조, 정답 피드백 |
| `--mint-dark` | `#4fa192` | 민트 버튼 하단 그림자 |
| `--yellow` | `#FFD166` | 단서 하이라이트, 보조 |
| `--red` | `#E84545` | 오답 피드백, 경고 |
| `--gray` | `#E5E1D6` | 비활성 선택지, 구분선 |

### 4.3 폰트 규격

`index.html` `<head>` 내 Google Fonts 링크 필수:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

| 요소 | 규격 |
|---|---|
| 시작 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 2.1rem; color: var(--coral)` |
| 섹션 레이블 (설정) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |
| 본문·설명·부제목 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 게임 플레이 — 문장 본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(1.1rem, 4vw, 1.5rem)` |
| 게임 플레이 — 선택지 도크 | `font-family: 'Jua', sans-serif; font-size: clamp(1rem, 3.5vw, 1.3rem)` |

### 4.4 버튼 규격

`components.css`의 `.btn` 클래스를 그대로 사용. 커스텀 버튼 스타일은 `game.css`에서 `.btn` 확장으로만 추가.

| 클래스 | font-size | padding | border-radius |
|---|---|---|---|
| `.btn` (기본) | `1.2rem` | `14px 28px` | `100px` |
| `.btn.big` | `1.45rem` | `16px 44px` | `100px` |
| `.btn.small` | `1rem` | `10px 20px` | `100px` |

공통 색상:
- 배경: `background: var(--coral); color: #fff`
- 하단 그림자: `box-shadow: 0 5px 0 var(--coral-dark)`
- 눌림: `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)`
- 레이블: `font-family: 'Jua', sans-serif; letter-spacing: 0.5px`

### 4.5 공용 화면 규격 (홈·설정·리더보드·완료)

- 배경: `background: var(--cream)` 전체 화면
- 레이아웃: `100dvh`, 수직 Flex(`flex-direction: column`), 중앙 정렬 카드 컨테이너
- 카드 컨테이너: `background: white; border: 3px solid var(--navy); border-radius: 24px; box-shadow: 0 6px 0 var(--navy); padding: 24px`
- 최대 너비: `max-width: 480px; margin: auto`

**리더보드 화면** (`leaderboard-screen`): 시리즈 공통 토큰·폰트·버튼 규격 동일 적용. 점수 목록 각 행은 `.profile-item` 패턴 (white 배경, navy 테두리, 3px 하단 그림자)으로 렌더링.

### 4.6 게임 플레이 화면 고유 확장 (`game.css`)

공용 규격 위에 추가되는 게임 고유 요소:

| 요소 | 규격 |
|---|---|
| 문장 카드 | `background: white; border-radius: 20px; border: 2.5px solid var(--navy); padding: 20px 18px` |
| 빈칸 마커 | `display: inline-block; min-width: 80px; border-bottom: 3px solid var(--coral); background: var(--cream); border-radius: 6px` |
| 단서 하이라이트 (level1) | `background: var(--yellow); border-radius: 4px; padding: 0 2px` + 음뜻 라벨 `font-size: 0.75rem; color: var(--navy)` |
| 단서 하이라이트 (level2) | `background: var(--yellow); border-radius: 4px` (라벨 없음) |
| 도크 선택지 칩 | 최소 높이 `56px` (44dp 터치 타겟 이상), `border-radius: 100px`, `border: 2.5px solid var(--navy)` |
| 정답 피드백 칩 | `background: var(--mint); color: white; border-color: var(--mint-dark)` |
| 오답 피드백 칩 | `background: var(--red); color: white; border-color: var(--red-dark)` |

---

## 5. 입력 / 상호작용

### 5.1 IME 완전 회피 원칙

한글 IME 입력(`<input>`, `<textarea>` 직접 타이핑)을 **전혀 사용하지 않는다**. 모든 어휘 입력은 도크 선택지 칩의 **탭 또는 드래그+스냅**으로만 이루어진다. (`AGENTS.md` root §"Mobile-First Design Principles" 입력 방식 원칙 준수)

### 5.2 탭 (Tap) 입력

- 도크 선택지 칩 탭 → 즉시 빈칸 슬롯에 배치 + 시각 피드백
- 배치 후 500ms 내 자동으로 정답 판정 → 피드백 표시 → 1.5초 후 다음 문제
- `pointerdown` / `pointerup` 이벤트 사용 (마우스·터치·펜 통합)
- 최소 터치 타겟: **56dp** (도크 선택지 칩), **44dp** (기타 버튼)

### 5.3 드래그 + 자성 스냅

- 도크 선택지 칩을 빈칸 슬롯으로 드래그하면 ±30dp 범위 내 자동 흡착
- 드래그 중: 칩 `opacity: 0.7` + `transform: scale(1.08)` (집어든 느낌)
- 스냅 성공: 칩이 빈칸 슬롯 위치로 애니메이션 이동 (`transition: all 0.15s ease-out`)
- 스냅 실패 (범위 밖 드롭): 칩이 원 위치로 부드럽게 복귀
- `pointermove` + `pointerup` 이벤트로 구현 (`touch-action: none` 필수)

### 5.4 단서 페이딩 상호작용

- 힌트 버튼(설정에서 ON일 때만 표시): 탭할 때마다 `hintLevel` 1씩 증가
  - `hintLevel 0` → 단서 없음 (초기)
  - `hintLevel 1` → 음뜻 라벨 + 노란 하이라이트 표시
  - `hintLevel 2` → 하이라이트만 (라벨 숨김)
  - `hintLevel 3` → 단서 완전 제거 (레벨 3 이후 힌트 버튼 비활성화)
- 힌트 사용 여부는 세션 기록에 저장 (`hintLevelUsed`)
- 힌트 버튼은 미응답 상태에서만 활성화; 응답 후 비활성화

### 5.5 선택 취소

- 빈칸에 배치된 칩을 다시 탭하면 도크로 반환 (응답 확정 전까지만)
- 응답 확정(정답 판정 시작) 후에는 취소 불가

---

## 6. PWA / Service Worker

### 6.1 매니페스트 (`manifest.json`)

```json
{
  "name": "문장 단서 정원",
  "short_name": "단서정원",
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

`start_url`과 `scope`는 **반드시 상대경로 `'./`'** 를 사용한다. 절대 경로 사용 시 같은 오리진에서 서브디렉터리로 서빙할 때 SW 스코프 충돌 발생.

### 6.2 Service Worker (`sw.js`)

```js
const CACHE_VERSION = '9_sentence_clue_garden-v1';
// 같은 오리진의 다른 게임 SW와 캐시 이름 충돌을 방지한다.
// 업데이트 시 버전 suffix를 올린다 (예: -v2)

const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/js/main.js',
  // ... 모든 JS 모듈 열거
  './src/data/sentences.js',
  'https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap'
];
```

- **전략**: Cache-First (정적 자산) + Network-Fallback (폰트 CDN)
- `install` 이벤트: 위 자산 전부 프리캐시 (`cache.addAll`)
- `activate` 이벤트: 이전 `CACHE_VERSION` 키 삭제 (`caches.delete`)
- SW 등록: `index.html` 내 `<script>` 상대경로 `'./sw.js'` 사용

### 6.3 스토리지 키 네임스페이스

같은 오리진에서 여러 게임이 실행될 때 `localStorage` / `IndexedDB` 충돌 방지:

| 키 | 접두사 | 예시 |
|---|---|---|
| localStorage 설정 | `9scg_` | `9scg_settings` |
| localStorage 리더보드 | `9scg_` | `9scg_leaderboard` |
| IndexedDB DB명 | `9scg_db` | — |
| IndexedDB 스토어명 | `sessions` | — |

---

## 7. 모바일 우선 / 접근성

### 7.1 뷰포트·레이아웃

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

- `height: 100dvh` 사용 (iOS Safari 주소창 변동 대응)
- 세로 모드 권장 (`portrait` 우선 설계). 가로 모드에서는 문장 카드와 도크를 2-column 그리드로 자동 전환 (순수 CSS 미디어 쿼리, JS 변경 없음)

```css
@media (orientation: landscape) and (max-height: 700px) {
  #play-screen.active {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  #play-screen.active .sentence-card { grid-column: 1; }
  #play-screen.active .hint-area,
  #play-screen.active .dock          { grid-column: 2; }
}
```

### 7.2 터치 타겟

| 요소 | 최소 크기 |
|---|---|
| 도크 선택지 칩 | 56dp 높이 (초등생 대상) |
| 힌트 버튼, 다음 버튼 | 44dp |
| 기타 버튼 | 44dp |

### 7.3 TTS 접근성

- 문장 카드 탭 → 문장 전체 TTS 읽기 (`rate: 0.85, lang: 'ko-KR'`)
- 정답 칩 탭 시 해당 어휘 TTS 재생
- TTS 미지원 브라우저: 설정 토글 자동 비활성화 + 안내 메시지

### 7.4 색각 접근성

- 정답/오답 피드백은 색상 단독이 아닌 텍스트 레이블(⭕ / ❌) 병기
- 단서 하이라이트는 yellow + 밑줄 조합 사용 (색각 이상 대비)

### 7.5 포커스 관리

- 화면 전환 시 새 화면의 첫 인터랙티브 요소에 `focus()` 이동
- 키보드 접근성: `tabindex` 순서 논리적 유지 (도크 선택지 → 힌트 버튼 → 다음 버튼)

---

## 8. 리더보드 / 영속화

### 8.1 localStorage 설계

**설정 키** (`9scg_settings`):
- 앱 시작 시 `loadSettings()` 호출 → 없으면 기본값 적용
- 설정 변경 시 즉시 `saveSettings()` (`try/catch` — Private 브라우징 실패 무시)

**리더보드 키** (`9scg_leaderboard`):
- 게임 완료 시 레코드 추가
- 배열 최대 50개. 초과 시 `accuracy` 기준 정렬 후 하위 항목 삭제
- 리더보드 화면: 상위 10개 렌더링, 정렬 옵션 (점수순 / 날짜순)

### 8.2 IndexedDB 설계

**DB**: `9scg_db`, 버전 `1`

**오브젝트 스토어**: `sessions`
- 키패스: `id` (autoIncrement)
- 인덱스: `ts` (timestamp), `difficulty`

**접근 패턴**:
- 쓰기: 게임 완료 시 세션 레코드 1건 저장
- 읽기: 통계 화면(향후 확장)에서 전체 이력 조회
- `storage.js`의 `saveSession(record)` / `loadSessions(filter)` 함수로 추상화

### 8.3 Private 브라우징 내성

```js
// storage.js 패턴
async function saveSettings(data) {
  try {
    localStorage.setItem('9scg_settings', JSON.stringify(data));
  } catch {
    // Incognito 등 localStorage 거부 — 세션 내 메모리에서만 유지
  }
}
```

IndexedDB 실패 시도 동일하게 `try/catch` 무시 → 게임 진행에 영향 없음.

---

## 9. 핵심 알고리즘

### 9.1 문제 풀 구성 및 중복 방지

```js
function pickQuestions(pool, needed, lastIds) {
  const fresh   = pool.filter(q => !lastIds.has(q.id));
  const repeats = pool.filter(q =>  lastIds.has(q.id));

  if (fresh.length >= needed) return shuffle(fresh).slice(0, needed);
  return [...shuffle(fresh), ...shuffle(repeats)].slice(0, needed);
}
// state.lastGameIds는 세션 내 메모리에만 유지 (localStorage 미저장)
```

풀이 `needed`보다 부족하면 반복 채움 (셔플 후 순환):

```js
while (pool.length < needed) pool = [...pool, ...shuffle(originalPool)];
return pool.slice(0, needed);
```

### 9.2 단서 하이라이트 렌더링

`hint.js`의 `renderHint(item, level)`:
1. `level === 0`: 단서 DOM 제거
2. `level === 1`: `item.hint.level1.highlight` 인덱스로 `sentence` 부분 문자열 `<mark class="hl">` 래핑 + 음뜻 라벨 `<span class="hint-label">` 삽입
3. `level === 2`: 라벨 `<span>` 숨김 처리 (`display:none`), `<mark>` 유지
4. `level === 3`: `<mark>` 제거 → 단서 완전 소거

문자 인덱스 기반 부분 문자열 치환은 `document.createTextNode` + `insertBefore` 조합으로 XSS 없이 안전하게 처리.

### 9.3 정답 판정

```js
function checkAnswer(chosen, item) {
  return chosen.trim() === item.answer.trim();
}
```

정규화: `String.prototype.trim()` 처리. 대소문자·공백 차이 외 추가 정규화는 이 단계(S9)에서는 불필요 (선택지가 고정 문자열이므로).

### 9.4 효과음 (Web Audio API)

`sound.js`의 `playCorrect()` / `playWrong()`:
- AudioContext는 첫 사용자 인터랙션 후 생성 (자동재생 정책 대응)
- 짧은 사인파 생성 (`OscillatorNode`) 기반 효과음 — 외부 오디오 파일 의존 없음

---

## 10. 성능

| 영역 | 최적화 |
|---|---|
| 초기 로드 | ES Module 분할, 각 파일 < 10KB |
| 애니메이션 | `transform` / `opacity`만 사용 (compositor layer) |
| 폰트 | `preconnect` DNS 병렬화, `font-display: swap` |
| 드래그 | `pointermove` passive event 사용 불가 (`touch-action: none`) → `will-change: transform`으로 레이어 승격 |
| DOM 업데이트 | `innerHTML = ''` 후 `createElement` 루프 (프레임워크 없음) |

---

## 11. 보안

- 사용자 자유 텍스트 입력 없음 → XSS 표면 최소
- 선택지는 정적 데이터 → `textContent` 또는 안전한 `createElement` 사용
- SW 등록 실패 시 게임은 온라인으로 정상 동작 (오프라인만 불가)

---

## 12. 수동 테스트 체크리스트

- [ ] 포트 4331에서 `npx serve -l 4331` 실행 → 홈 화면 정상 로드
- [ ] 설정 → 난이도·문제 수 변경 후 새로고침 → 설정 유지
- [ ] Incognito 모드 → localStorage 실패해도 게임 진행 가능
- [ ] 힌트 버튼 탭 3회 → level1 → level2 → level3(단서 제거) 순서 정상
- [ ] 도크 선택지 드래그 → ±30dp 스냅 흡착 동작 확인
- [ ] 도크 선택지 드래그 → 범위 밖 드롭 → 원 위치 복귀 확인
- [ ] 정답 탭 → mint 피드백 + 정답 TTS → 1.5초 후 다음 문제
- [ ] 오답 탭 → red 피드백 + 오답 TTS → 1.5초 후 다음 문제
- [ ] 게임 완료 → 완료 화면 점수·정답률 정상 표시
- [ ] 완료 화면 → 리더보드 진입 → 최신 기록 상단 표시
- [ ] 다시 하기 → 직전 문제 중복 ≤ 20%
- [ ] TTS 미지원 브라우저 → 설정 토글 비활성화
- [ ] PWA 설치 → 홈 화면 추가 → 오프라인 실행
- [ ] 세로·가로 모드 전환 → 레이아웃 정상 (가로: 2-column 그리드)
- [ ] 빈칸에 배치된 칩 재탭 → 도크 반환 (응답 확정 전)

---

## 13. 배포

정적 파일 — 빌드 단계 없음. 루트 디렉터리 그대로 업로드:

| 옵션 | 명령 |
|---|---|
| 로컬 개발 | `npx serve -l 4331` |
| GitHub Pages | `gh-pages` 브랜치 푸시 |
| Netlify | `netlify deploy --dir=9_sentence_clue_garden` |
| Vercel | `vercel --prod` |

---

## 14. 디자인 시스템 체크리스트

구현 시 아래 항목을 모두 통과해야 한다:

- [ ] Google Fonts `Jua` + `Gowun Dodum` `<link>` 태그 포함
- [ ] 시작 제목 `3rem / letter-spacing 2px / var(--coral)` 적용
- [ ] 설정 제목 `1.8rem / var(--coral)` 적용
- [ ] 완료 제목 `2.1rem / var(--coral)` 적용
- [ ] 본문 `clamp(0.9rem, 3vw, 1.2rem)` / `Gowun Dodum` 적용
- [ ] `.btn` 기본 `1.2rem / 14px 28px / 100px / coral / coral-dark shadow` 적용
- [ ] `.btn.big` `1.45rem / 16px 44px` 적용
- [ ] `.btn.small` `1rem / 10px 20px` 적용
- [ ] 버튼 눌림 `translateY(4px) / box-shadow 0 1px 0 var(--coral-dark)` 적용
- [ ] 배경 `var(--cream)` 전체 화면 적용
- [ ] 리더보드 화면 동일 토큰·폰트·버튼 규격 사용
- [ ] `tokens.css` / `components.css` 커스텀 값 하드코딩 없음
- [ ] `game.css`에서 새 CSS 변수 추가 없음 (기존 토큰 변수만 참조)
