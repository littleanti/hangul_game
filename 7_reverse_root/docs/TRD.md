# 🔧 TRD — 한자 뿌리 역분해 게임

> Technical Requirements Document
> Last updated: 2026-06-12
> Status: **구현 완료** — M0~M5 완료, M6 점진 변환 UX 개편(한자 1개 단위 즉시 판정·음절 제자리 변환) 반영

---

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 빌드 없음, 시리즈 1~6단계와 일관 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 브라우저 지원, 정적 서빙 |
| CSS | Vanilla CSS + CSS Variables | 토큰 관리 용이, 시리즈 디자인 시스템 계승 |
| 렌더링 | DOM + CSS Transform | 분해 애니메이션은 CSS transform/opacity로 구현 |
| 입력 | Pointer Events API | 터치·마우스·드래그·스냅 통합, IME 완전 회피 |
| 오디오/음성 | Web Speech API(TTS) + Web Audio API(효과음) | 한자 음·뜻 자동 발화, 자동재생 정책 우회 |
| 폰트 | Google Fonts (`Jua`, `Gowun Dodum`) | 시리즈 공통 폰트, FOIT 회피 |
| 개발 서버 | `npx serve -l 4330` | 빌드 단계 없음, 루트 AGENTS.md 포트 컨벤션 |
| 영속화 | `localStorage` (P1), `IndexedDB` (P2 후보) | 진행률·점수·힌트 레벨 영속화, 서버 불필요 |
| 배포 | 정적 호스팅 + PWA Manifest + Service Worker | 홈 화면 설치, 오프라인 작동 |

**의도적으로 제외한 것**:
- React/Vue 등 프레임워크 — 이 규모·대상에서 과함, 시리즈 일관성 유지
- TypeScript — 프로토타입 속도 우선 (P2 시점 마이그레이션 고려)
- 빌드 도구(Vite/Webpack) — ES Modules로 충분
- npm 런타임 의존성 — `node_modules` 없음, 정적 자산만 포함
- Canvas/WebGL — CSS transform으로 분해 애니메이션 충분
- 한글/한자 IME 입력 — 시리즈 정책상 금지

---

## 2. 아키텍처

### 2.1 디렉터리 구조

```
7_reverse_root/
├── index.html                 # 단일 페이지 앱 진입점
├── manifest.webmanifest       # PWA 매니페스트
├── service-worker.js          # PWA 오프라인 캐시 (CACHE_VERSION: '7_reverse_root-v1')
├── docs/
│   ├── PRD.md
│   ├── TRD.md                 # 본 문서
│   └── PLAN.md
└── src/
    ├── css/
    │   ├── tokens.css         # 색상·간격·반경 변수 (1_chosung_quiz/src/css/tokens.css 복제)
    │   ├── base.css           # 리셋, 폰트 임포트, 100dvh, body 기본 스타일
    │   ├── components.css     # 버튼·칩·토글·플래시 컴포넌트 (1_chosung_quiz/src/css/components.css 복제)
    │   ├── screens.css        # 공용 화면 레이아웃: start/settings/leaderboard/end (1_chosung_quiz/src/css/screens.css 기반 복제)
    │   └── game.css           # 플레이 화면 고유 스타일 (play-screen, 한자 블록 도크, 분해 애니메이션, 힌트 레이어)
    ├── data/
    │   ├── hanja.js           # 한자 메타 데이터 (6_morpheme_detective/src/data/hanja.js 기반 서브셋)
    │   └── vocab.js           # 역분해 어휘 세트 (합성어 → 구성 한자 매핑)
    ├── assets/
    │   └── icons/             # PWA 아이콘 (192×192, 512×512 PNG)
    └── js/
        ├── main.js            # 진입점, AudioContext/SpeechSynthesis 활성화 게이트, window 함수 노출
        ├── config.js          # 상수 (포트, 힌트 레벨, 자석 거리, 애니메이션 duration, localStorage 접두사)
        ├── state.js           # 전역 상태 싱글톤
        ├── storage.js         # localStorage 래퍼 ('7rr:' 접두사 고정)
        ├── utils.js           # 순수 유틸 (clamp, shuffle, dist)
        ├── tts.js             # Web Speech API 래퍼 (한자 음·뜻·합성어 발화)
        ├── audio.js           # Web Audio API 효과음 (정답음, 오답음, 분해음)
        ├── pointer.js         # Pointer Events 통합 (드래그·탭·자석 스냅)
        ├── ui.js              # 화면 전환 헬퍼 (goTo), 공용 화면 렌더링
        ├── settings.js        # 설정 화면 렌더링·저장
        ├── leaderboard.js     # 리더보드 화면 렌더링·점수 조회
        ├── decomp.js          # 분해 애니메이션 컨트롤러 (합성어 → 두 한자 조각 분리)
        ├── hint.js            # 힌트 레이어 컨트롤러 (L1/L2/L3 상태, 뜻 라벨·하이라이트)
        ├── dock.js            # 한자 블록 도크 렌더링·탭·드래그·스냅 (6_morpheme_detective 자성 스냅 계승)
        └── game.js            # 라운드 컨트롤러 (어휘 선택 → 제시 → 정답 판정 → 결과 → 다음)
```

### 2.2 모듈 의존성

```
main.js
  ├─ tts.js      → config.js
  ├─ audio.js    → config.js
  ├─ storage.js  → state.js, config.js
  ├─ ui.js       → utils.js, tts.js
  ├─ settings.js → state.js, storage.js, ui.js
  ├─ leaderboard.js → storage.js, ui.js
  └─ game.js     → state.js, utils.js, tts.js, audio.js,
                   hint.js, dock.js, decomp.js, ui.js, storage.js

공통 최하위:
  config.js           (순수 상수, 의존성 없음)
  utils.js    → config.js
  state.js    → config.js
  pointer.js  → utils.js, config.js
  dock.js     → pointer.js, utils.js, config.js
  hint.js     → state.js, config.js
  decomp.js   → utils.js, config.js
```

`settings.js` ↔ `game.js` 간 순환 의존은 런타임 시점 참조이므로 ES Module에서 안전.

### 2.3 화면 상태 머신

```
start ──→ play ──→ end
  │         ↑       │
  ↓         │       ↓
settings ───┘   (다시하기 / 다음 단계)
  │
  ↓
leaderboard
```

화면 전이 시 부작용:
- 모든 전이 → `pointer.releaseAll()` + `tts.cancel()` + `audio.stopAll()`
- `start` 화면 첫 탭 → `tts.unlock()` + `audio.unlock()` (사용자 제스처 게이트)
- `play` 화면 진입 → `game.startSession()` 호출 (어휘 풀 준비, 힌트 레벨 초기화)
- `play` → `end` 전이 → `storage.saveScore()` 호출

---

## 3. 데이터 모델 / 스키마

### 3.1 한자 메타 데이터 (`src/data/hanja.js`)

`6_morpheme_detective/src/data/hanja.js` 100자(한국어문회 7·8급) 서브셋을 기반으로 한다. 이 게임에서 필요한 필드만 사용하며, 신규 한자는 추가하지 않는다.

```js
// src/data/hanja.js
// 키: 한자 문자(UTF-8), 값: HanjaMeta 객체
export const HANJA = {
  '火': {
    id: '火',
    reading: '화',      // 음독 (한국 한자음)
    meaning: '불',      // 훈독 (뜻)
    grade: 8,           // 한국어문회 급수 (7 또는 8)
  },
  '山': {
    id: '山',
    reading: '산',
    meaning: '뫼',
    grade: 8,
  },
  // ... 이하 동일 구조로 100자
};
```

> 스키마 호환성: `6_morpheme_detective`의 `HANJA` 객체에서 `id`, `reading`, `meaning`, `grade` 필드만 사용. `morphPaths`, `vocab` 등 6단계 전용 필드는 이 게임에서 무시(참조하지 않음). 향후 통합 시 필드 충돌 없음.

### 3.2 역분해 어휘 세트 (`src/data/vocab.js`)

```js
// src/data/vocab.js
// VocabItem: 합성어 한 항목의 역분해 정의
/**
 * @typedef {Object} VocabItem
 * @property {string}   word          - 합성어 (예: '화산')
 * @property {string[]} components    - 구성 한자 ID 배열, 항상 길이 2 (예: ['火', '山'])
 * @property {string}   hanja         - 한자 표기 (예: '火山')
 * @property {string[]} distractors   - 이 라운드에서 도크에 추가할 오답 한자 ID 배열 (2~3개)
 *                                      distractors는 음독 유사·의미 근접·무관 한자 혼합
 * @property {number}   difficulty    - 1(쉬움) | 2(보통) | 3(어려움) — 도크 디스트랙터 수·유형으로 결정
 */

export const VOCAB = [
  {
    word: '화산',
    components: ['火', '山'],
    hanja: '火山',
    distractors: ['花', '岩', '水'],   // 花: 음독 동일(화), 岩: 의미 근접, 水: 무관
    difficulty: 1,
  },
  {
    word: '동물',
    components: ['動', '物'],
    hanja: '動物',
    distractors: ['童', '木', '人'],
    difficulty: 1,
  },
  // ... 총 15개 항목 (PRD §7.2 초기 설계 세트 기준)
];
```

### 3.3 런타임 상태 모델 (`src/js/state.js`)

```js
// src/js/state.js
export const state = {
  settings: {
    ttsEnabled: boolean,          // TTS 발화 on/off
    sfxEnabled: boolean,          // 효과음 on/off
    hintVisible: boolean,         // 설정에서 힌트 강제 표시 여부 (기본 true)
    audioReady: boolean,          // 사용자 제스처 후 AudioContext unlock 완료 플래그
    speechReady: boolean,         // SpeechSynthesis 활성화 플래그
  },
  session: {
    queue: VocabItem[],           // 이번 세션 출제 순서 (shuffle 후 고정)
    currentIdx: number,           // 현재 라운드 인덱스
    hintLevel: 1 | 2 | 3,         // 현재 힌트 레벨 (L1: 뜻라벨+하이라이트, L2: 하이라이트만, L3: 없음)
    correctCount: number,         // 세션 누적 정답 수
    wrongCount: number,           // 세션 누적 오답 수
    stars: number,                // 세션 획득 별 (정답률 기반 계산)
  },
  round: {
    phase: 'idle'                 // 현재 라운드 단계
           | 'presenting'        // 합성어 카드 제시 중
           | 'awaiting'          // 사용자 입력 대기 (부분 정답 포함)
           | 'result',           // 전 음절 변환 완료 → 음·뜻 확인 팝업 표시
    solvedComponents: boolean[],  // 음절별 한글→한자 변환 완료 여부 (M6 한자 1개 단위 판정)
    attemptCount: number,         // 현재 라운드 블록 제출 횟수 (정답·오답 합산)
  },
  progress: {
    totalSessions: number,        // 누적 세션 수 (localStorage 영속)
    bestScore: number,            // 최고 점수 (localStorage 영속)
    lastHintLevel: 1 | 2 | 3,     // 마지막 세션 종료 힌트 레벨 (영속, 다음 세션 초기값)
  },
};
```

### 3.4 힌트 레벨 전환 규칙 (`src/js/hint.js`)

힌트 레벨은 세션 내에서 자동 하향된다. 레벨 전환은 라운드 수 고정 방식을 사용한다(정답률 임계 방식은 불필요한 복잡성 유발).

| 세션 내 라운드 번호 | 힌트 레벨 | 힌트 내용 |
|---|---|---|
| 1~5번 라운드 | L1 | 색 하이라이트 + 각 형태소 뜻 라벨 |
| 6~10번 라운드 | L2 | 색 하이라이트만 (뜻 라벨 없음) |
| 11~15번 라운드 | L3 | 힌트 없음 (합성어 카드만 표시) |

> 총 어휘 수가 15개 미만인 경우, 전체를 3등분하여 각 구간에 L1/L2/L3 배정.
> 오답 시 힌트 레벨 유지 (강등 없음) — 비계 감소 원칙 준수.

### 3.5 도크 블록 구성 규칙 (`src/js/dock.js`)

```js
// 매 라운드 도크에 표시할 한자 블록 구성
// 정답 2개 + distractors 배열 항목(2~3개) = 총 4~5개 블록
function buildDockItems(vocabItem) {
  const answer = vocabItem.components;       // 항상 2개
  const decoys = vocabItem.distractors;      // 2~3개
  return shuffle([...answer, ...decoys]);    // 셔플 후 도크에 배치
}
```

---

## 4. 디자인 시스템 정합성

### 4.1 공용 화면 CSS 재사용 규칙

공용 화면(홈/시작·설정·리더보드·완료)은 `1_chosung_quiz`의 CSS를 **복제(copy)** 방식으로 재사용한다. 심볼릭 링크나 npm 패키지 없이 정적 파일로 관리하여 빌드 단계를 완전히 배제한다.

| CSS 파일 | 출처 | 이 게임에서의 처리 |
|---|---|---|
| `src/css/tokens.css` | `1_chosung_quiz/src/css/tokens.css` 복제 | 색상·그림자 변수 원본과 동일 유지 |
| `src/css/base.css` | `1_chosung_quiz/src/css/base.css` 기반 복제 | 리셋·폰트·100dvh 동일, 게임별 미세 조정 허용 |
| `src/css/components.css` | `1_chosung_quiz/src/css/components.css` 복제 | `.btn`, `.btn.big`, `.btn.small`, `.chip`, `.toggle` 완전 동일 |
| `src/css/screens.css` | `1_chosung_quiz/src/css/screens.css` 기반 복제 | `start-screen`, `settings-screen`, `end-screen` 레이아웃 동일 유지, `leaderboard-screen` 추가 |
| `src/css/game.css` | **이 게임 신규** | `play-screen`, `decomp-result`, `round-summary` 등 고유 화면만 정의 |

`index.html` 내 로드 순서:
```html
<link rel="stylesheet" href="src/css/tokens.css">
<link rel="stylesheet" href="src/css/base.css">
<link rel="stylesheet" href="src/css/components.css">
<link rel="stylesheet" href="src/css/screens.css">
<link rel="stylesheet" href="src/css/game.css">   <!-- 공용 위에 game.css로 덮어씀 -->
```

> `game.css`는 공용 CSS를 절대로 수정하지 않고 **추가·확장**만 한다. 공용 CSS 변경이 필요한 경우 반드시 `game.css`에서 선택자 덮어쓰기로 처리한다.

### 4.2 폰트 규격

| 요소 | 규격 |
|---|---|
| 폰트 로드 | `<link>` Google Fonts — `Jua`, `Gowun Dodum` (DNS preconnect 병행) |
| 시작 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 2.1rem; color: var(--coral)` |
| 설명·부제목·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 설정 섹션 레이블 | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |
| 합성어 카드 텍스트 | `font-family: 'Jua', sans-serif; font-size: clamp(2rem, 8vw, 3.5rem)` (game.css 고유) |
| 한자 블록 텍스트 | `font-family: 'Jua', sans-serif; font-size: clamp(1.6rem, 6vw, 2.8rem)` (game.css 고유) |

```html
<!-- index.html <head> 내 폰트 로드 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

### 4.3 색상 토큰

`src/css/tokens.css`에 정의된 변수를 사용한다. 하드코딩 금지.

| 변수 | 값 | 용도 |
|---|---|---|
| `--coral` | `#FF7757` | 주 강조색 — 버튼, 제목, 정답 하이라이트 |
| `--coral-dark` | `#d45a40` | 버튼 그림자, 눌림 효과 |
| `--navy` | `#2D3047` | 본문 텍스트, 테두리 |
| `--cream` | `#FFF6E4` | 전체 배경 |
| `--mint` | `#6BCAB8` | 보조 강조 — 힌트 하이라이트, 보조 버튼 |
| `--mint-dark` | `#4fa192` | mint 버튼 그림자 |
| `--yellow` | `#FFD166` | 별, 성취 배지 |
| `--yellow-dark` | `#d4ad4e` | yellow 그림자 |
| `--gray` | `#E5E1D6` | 비활성 도크 블록, 칩 기본 배경 |
| `--shadow` | `rgba(45, 48, 71, 0.15)` | 카드·블록 그림자 |

**게임 고유 추가 토큰** (`game.css` 내 `:root` 확장):
```css
:root {
  /* 힌트 레이어 색상 */
  --hint-l1-bg: rgba(107, 202, 184, 0.25);   /* L1 형태소 배경 하이라이트 (mint 계열) */
  --hint-l1-border: var(--mint);
  --hint-l2-bg: rgba(107, 202, 184, 0.15);   /* L2 하이라이트 (더 연함) */
  /* 분해 결과 팝업 */
  --decomp-card-bg: #FFFFFF;
  --decomp-card-radius: 20px;
}
```

### 4.4 버튼 컴포넌트 규격 (`src/css/components.css` 복제)

| 클래스 | font-size | padding | border-radius | 배경 | box-shadow |
|---|---|---|---|---|---|
| `.btn` | `1.2rem` | `14px 28px` | `100px` | `var(--coral)` | `0 5px 0 var(--coral-dark)` |
| `.btn.big` | `1.45rem` | `16px 44px` | `100px` | `var(--coral)` | `0 5px 0 var(--coral-dark)` |
| `.btn.small` | `1rem` | `10px 20px` | `100px` | `var(--coral)` | `0 5px 0 var(--coral-dark)` |
| `.btn.mint` | (`.btn` 동일) | (`.btn` 동일) | `100px` | `var(--mint)` | `0 5px 0 var(--mint-dark)` |
| `.btn.ghost` | (`.btn` 동일) | (`.btn` 동일) | `100px` | `transparent` | `inset 0 0 0 2px var(--navy)` |

공통 규칙:
- `font-family: 'Jua', sans-serif; letter-spacing: 0.5px; color: #fff; border: none; cursor: pointer; transition: all 0.12s`
- `:active` → `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)`

### 4.5 공용 화면별 레이아웃 규격

#### start-screen (홈/시작 화면)
```css
.start-screen {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 100dvh;
  background: var(--cream);
  gap: 24px; padding: 32px 20px;
}
/* 제목: Jua 3rem / letter-spacing 2px / color var(--coral) */
/* 시작 버튼: .btn.big */
/* 리더보드 진입: .btn.ghost 또는 텍스트 링크 */
```

#### settings-screen (설정 화면)
```css
/* 제목: Jua 1.8rem / color var(--coral) */
/* 섹션 레이블: Jua 1.05rem */
/* 토글 스위치, 설정 행: 1_chosung_quiz/src/css/components.css 복제 */
/* 저장/닫기: .btn.small */
```

#### leaderboard-screen (리더보드 화면)
```css
/* 제목: Jua 1.8rem / color var(--coral) */
/* 점수 행: Gowun Dodum, 상위 10개 */
/* 닫기 버튼: .btn.small */
/* 레이아웃: 카드형 컨테이너, 수직 목록 */
```
> 리더보드는 시리즈 공통 컴포넌트화를 권장하나, 이 게임에서는 `screens.css`에 `leaderboard-screen` 클래스를 추가하여 구현한다.

#### end-screen (완료 화면)
```css
/* 제목: Jua 2.1rem / color var(--coral) */
/* 별 표시: --yellow 색, 64dp+ 아이콘 */
/* 정답률·통계: Gowun Dodum clamp(0.9rem, 3vw, 1.2rem) */
/* "다시 하기" 버튼: .btn (coral) */
/* "다음 단계" 버튼: .btn.mint */
```

---

## 5. 게임 플레이 화면 — 고유 인터랙션 설계

### 5.1 play-screen 레이아웃 (game.css)

세로(Portrait) 모드 우선 단일 컬럼 레이아웃:

```
┌─────────────────────────────┐
│  진행률 바 + 힌트 레벨 배지   │  top: 8%
├─────────────────────────────┤
│                             │
│      합성어 카드             │  center: ~40%
│   (예: 화산 / 火山)          │
│   [힌트 레이어 오버레이]       │
│                             │
├─────────────────────────────┤
│  한자 블록 도크 (4~5개 블록)  │  bottom: 30%
│   [ 火 ] [ 花 ] [ 山 ] [ 水 ] │
└─────────────────────────────┘
```

```css
#play-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100dvh;
  padding: 16px 16px 32px;
  background: var(--cream);
}

.compound-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 0 var(--gray), 0 10px 24px var(--shadow);
  padding: 32px 48px;
  font-family: 'Jua', sans-serif;
  font-size: clamp(2rem, 8vw, 3.5rem);
  color: var(--navy);
}

.hanja-dock {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 8px;
}

.hanja-block {
  width: clamp(64px, 18vw, 88px);
  height: clamp(64px, 18vw, 88px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #fff;
  border: 3px solid var(--gray);
  border-radius: 16px;
  box-shadow: 0 4px 0 var(--gray);
  font-family: 'Jua', sans-serif;
  font-size: clamp(1.6rem, 6vw, 2.8rem);
  color: var(--navy);
  cursor: pointer;
  touch-action: none;   /* 드래그 처리 직접 */
  user-select: none;
}

.hanja-block.selected {
  border-color: var(--coral);
  box-shadow: 0 4px 0 var(--coral-dark);
  transform: translateY(-4px) scale(1.05);
}

.hanja-block.snapped {
  border-color: var(--mint);
  box-shadow: 0 4px 0 var(--mint-dark);
}
```

가로(Landscape) 모드 폴백:
```css
@media (orientation: landscape) and (max-height: 600px) {
  #play-screen {
    flex-direction: row;
    align-items: center;
    padding: 16px;
    gap: 24px;
  }
  .compound-card { flex: 1; }
  .hanja-dock { flex: 1; flex-wrap: wrap; max-width: 50vw; }
}
```

### 5.2 힌트 레이어 (`src/js/hint.js`)

합성어 글자 래퍼(`.word-wrap`) 위에 절대위치 오버레이로 렌더링된다.

> **정렬 원리 (오버레이↔음절 매핑 버그픽스):** 오버레이를 카드(`.compound-card`,
> padding 32px 48px) 기준 `inset: 0`으로 깔면 `.hint-segment{flex:1}`가 **카드 전폭**을
> 균등 분할한다. 세그먼트 중심(= `.hint-label` 칩 위치)이 카드 폭의 1/4·3/4 지점에
> 찍히는 반면 실제 음절 글리프는 카드 중앙 텍스트 영역에만 있으므로, 칩·하이라이트가
> 글자와 어긋난다(카드 좌우 패딩 48px만큼 바깥으로 퍼짐). 따라서 오버레이는 글자를
> shrink-wrap하는 `.word-wrap`(inline-block) 내부에 두고 **음절 영역만** 분할한다.
> 한글 음절 글리프는 전각(고정폭 advance)이므로 `flex: 1` 균등 분할이 음절 경계와
> 1:1로 일치하며, 폰트 로딩·뷰포트 리사이즈(clamp 폰트)에도 JS 측정 없이 정렬이 유지된다.
> 세그먼트 간 시각 간격은 `gap`/가로 `inset` 확장 대신 **세그먼트 자체의 대칭 마진**
> (`margin: 0 3px`)으로 만든다 — gap·inset은 세그먼트 중심을 음절 중심 바깥으로
> 밀어내지만(±6px 오차), 대칭 마진은 중심을 보존한다(실측 오차 0.2px 이내).
>
> **뜻 라벨 칩 겹침 방지:** 세그먼트가 음절 폭(전각 1자)으로 좁아지므로, 칩("시장·도시 시"
> 등 최대 7자)이 세그먼트보다 넓어 같은 높이에선 인접 칩이 반드시 겹친다. 칩은 항상
> 자기 음절 위 **정중앙**(매핑 신호)에 두되, 1음절 칩은 윗행·2음절 칩은 아랫행의
> 2행 지그재그(읽기 순서 = 위→아래)로 구조적으로 겹침을 차단한다.

```html
<div class="compound-card" id="compound-card">
  <span class="word-wrap">
    <span id="compound-word">화산</span>     <!-- game.js renderWord()가 .syllable span으로 분해 -->
    <div class="hint-overlay" id="hint-overlay"></div>
  </span>
</div>
```

```
L1 상태:
  [불 화]                    ← 뜻 라벨 배지 윗행 (1음절 위 정중앙, --mint 배경, Jua 0.9rem)
      [산 산]                ← 뜻 라벨 배지 아랫행 (2음절 위 정중앙 — 지그재그 겹침 방지)
  ┌───────┬───────┐
  │  화   │  산   │          ← 색 하이라이트 (--hint-l1-bg, 테두리 --hint-l1-border)
  └───────┴───────┘

L2 상태:
  ┌───────┬───────┐          ← 하이라이트만 (뜻 라벨 없음)
  │  화   │  산   │
  └───────┴───────┘

L3 상태:
  화산                       ← 힌트 없음, 합성어만 표시
```

```css
.word-wrap {
  position: relative;      /* .hint-overlay absolute 기준 — 글자 영역에 정렬 */
  display: inline-block;   /* 글자 폭만큼 shrink-wrap */
}
.hint-overlay {
  position: absolute; inset: -10px 0;  /* 세로만 확장 — 가로는 글자 폭과 1:1 */
  display: flex;
  pointer-events: none;
}
.hint-segment {
  flex: 1;
  margin: 0 3px;          /* 세그먼트 간 간격 — 대칭 마진이라 중심은 음절 중심 유지 */
  border-radius: 12px;
  background: var(--hint-l1-bg);
  border: 2px solid var(--hint-l1-border);
  transition: background 0.3s, border-color 0.3s;
}
.hint-segment.l2 {
  background: var(--hint-l2-bg);
  border-style: dashed;            /* §8.2 색맹 대응 — 색+형태 병기 (L1 실선 ↔ L2 점선) */
  border-color: var(--hint-l1-border);
  opacity: 0.85;
}
.hint-label {
  position: absolute;
  top: -58px;                      /* 윗행 (1음절 칩) */
  left: 50%;
  transform: translateX(-50%);     /* 자기 음절 위 정중앙 */
  white-space: nowrap;
  font-family: 'Jua', sans-serif;
  font-size: 0.9rem;
  background: var(--mint);
  color: #fff;
  padding: 2px 8px;
  border-radius: 100px;
}
.hint-segment:nth-child(even) .hint-label {
  top: -26px;                      /* 아랫행 (2음절 칩) — 지그재그 겹침 방지 */
}
```

### 5.3 음·뜻 확인 팝업 `decomp-result` (game.css)

전 음절 변환 완료 후 `WORD_COMPLETE_MS`(700ms — 마지막 음절 변환 연출 노출) 지연을 두고 play-screen 위에 오버레이로 표시. 분해 연출 자체는 카드 내 음절 제자리 변환(M6, §6.1)이 담당하므로, 팝업은 각 한자의 음·뜻 카드 확인 + TTS 발화 역할에 집중한다.

```css
.decomp-overlay {
  position: fixed; inset: 0;
  background: rgba(45, 48, 71, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.decomp-card {
  background: var(--decomp-card-bg);
  border-radius: var(--decomp-card-radius);
  padding: 32px 24px;
  display: flex; gap: 24px; align-items: center;
  box-shadow: 0 12px 40px var(--shadow);
}
.decomp-piece {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  animation: pieceReveal 0.4s ease-out both;
}
@keyframes pieceReveal {
  from { opacity: 0; transform: scale(0.7) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.decomp-piece .hanja-char {
  font-family: 'Jua', sans-serif;
  font-size: clamp(2.5rem, 10vw, 4rem);
  color: var(--coral);
}
.decomp-piece .reading { font-family: 'Jua', sans-serif; font-size: 1rem; color: var(--navy); }
.decomp-piece .meaning { font-family: 'Gowun Dodum', sans-serif; font-size: 0.9rem; color: #6b6e82; }
```

---

## 6. 입력 / 상호작용

### 6.1 터치·드래그·스냅 (`src/js/dock.js`, `src/js/pointer.js`)

`6_morpheme_detective`의 자성 스냅(40dp) 패러다임을 직접 계승한다.

```js
// config.js
export const MAGNET_DP = 40;    // 자성 스냅 흡착 거리 (dp 단위)
export const MAGNET_PX = () => MAGNET_DP * (window.devicePixelRatio || 1);

// dock.js — 한자 블록 상호작용 (M6: 블록 1개 단위 즉시 판정)
// 1. pointerdown: 블록 선택, setPointerCapture
// 2. pointermove: 블록 드래그, 합성어 카드 영역 근접 시 자석 스냅
// 3. pointerup:   스냅 상태로 드롭 → game.js onBlockSelected(hanjaId) 호출
// 4. 단순 탭(pointermove 없음, 이동 < 8px): 즉시 제출 → onBlockSelected(hanjaId)
```

입력 방식 (M6 — 한자 1개 단위 즉시 판정):
- **탭(발견)**: 한자 블록 탭 → 즉시 판정. 정답이면 카드의 해당 음절이 한글→한자 제자리 변환(`.syllable.solved`, 한글 루비 병기) + 블록 비활성(`.hanja-block.solved`)
- **드래그+스냅**: 블록 드래그 → 합성어 카드 영역 40dp 이내 접근 시 자성 스냅 효과 → 손 떼면 제출
- 두 방식 모두 동일한 판정 경로(`onBlockSelected`)로 라우팅. 음절↔한자 1:1 대응이므로 선택 순서 무관 — 어느 한자를 먼저 골라도 대응 음절이 변환된다
- 전 음절 변환 완료 → `phase: 'result'` 전환 후 음·뜻 확인 팝업(§5.3)

IME 완전 회피:
- 모든 대화형 요소는 `<button>`, `<div role="button">` 또는 커스텀 Pointer Events 처리
- `<input>`, `<textarea>`, `contenteditable` 없음
- 모바일 키보드 트리거 없음

### 6.2 오답 피드백

```js
// dock.js
function playWrongFeedback(blockEl) {
  blockEl.classList.add('wrong-shake');
  blockEl.addEventListener('animationend', () => {
    blockEl.classList.remove('wrong-shake', 'selected');
  }, { once: true });
}
```

```css
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-8px); }
  75%       { transform: translateX(8px); }
}
.hanja-block.wrong-shake {
  animation: wrongShake 0.35s ease-in-out;
  border-color: var(--red);
}
```

---

## 7. PWA / Service Worker

### 7.1 manifest.webmanifest

```json
{
  "name": "한자 뿌리 역분해",
  "short_name": "역분해",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FFF6E4",
  "theme_color": "#FF7757",
  "icons": [
    { "src": "src/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "src/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

`start_url`과 `scope` 모두 상대경로 `'./'` 사용 — 하위 디렉터리 배포 및 동일 오리진 내 다른 게임과의 공존을 위해 필수.

### 7.2 Service Worker (`service-worker.js`)

```js
// service-worker.js

// 이 게임 고유 CACHE_VERSION — 다른 게임 SW와 충돌 없음 (자산 변경 시 bump)
const CACHE_VERSION = '7_reverse_root-v2';
const CACHE_NAME = `hangul-games-${CACHE_VERSION}`;

// 캐시할 정적 자산 목록 (릴리즈 시 수동 또는 스크립트로 갱신)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/css/tokens.css',
  './src/css/base.css',
  './src/css/components.css',
  './src/css/screens.css',
  './src/css/game.css',
  './src/js/main.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/utils.js',
  './src/js/tts.js',
  './src/js/audio.js',
  './src/js/pointer.js',
  './src/js/ui.js',
  './src/js/settings.js',
  './src/js/leaderboard.js',
  './src/js/decomp.js',
  './src/js/hint.js',
  './src/js/dock.js',
  './src/js/game.js',
  './src/data/hanja.js',
  './src/data/vocab.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

SW 등록 (index.html 내 인라인 스크립트):
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js');
    });
  }
</script>
```

### 7.3 localStorage 키 충돌 방지

모든 localStorage 접근은 `storage.js`를 통해서만 이루어지며, 접두사 `'7rr:'`를 강제한다.

```js
// config.js
export const STORAGE_PREFIX = '7rr:';

// storage.js
import { STORAGE_PREFIX } from './config.js';

function key(k) { return `${STORAGE_PREFIX}${k}`; }

export function get(k, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key(k))) ?? fallback; }
  catch { return fallback; }
}
export function set(k, v) {
  try { localStorage.setItem(key(k), JSON.stringify(v)); }
  catch { /* Incognito 모드 등 실패 시 무시, 앱 정상 동작 */ }
}
export function remove(k) {
  try { localStorage.removeItem(key(k)); }
  catch { /* 무시 */ }
}
```

| 게임 | 접두사 | 충돌 여부 |
|---|---|---|
| `1_chosung_quiz` | `cq:` / 기본 | 없음 |
| `6_morpheme_detective` | `4md:` (또는 `6md:`) | 없음 |
| **`7_reverse_root`** | **`7rr:`** | 없음 |
| `8_vocabulary_tree` | `8vt:` (권장) | 없음 |

---

## 8. 모바일 우선 / 접근성

### 8.1 모바일 우선 레이아웃

```css
/* base.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  min-height: 100dvh;
  overflow: hidden;            /* 세로 스크롤 차단 — 전체 화면 게임 */
}
body {
  background: var(--cream);
  font-family: 'Gowun Dodum', sans-serif;
  color: var(--navy);
  touch-action: manipulation;  /* 더블탭 줌 비활성, 탭 딜레이 제거 */
  -webkit-tap-highlight-color: transparent;
}
```

터치 타겟 최소 기준:
- 일반 버튼: 최소 44dp (WCAG 2.1 기준)
- 한자 블록 도크 버튼: 최소 **64dp** (만 8세 아동 대상 — 루트 AGENTS.md Mobile-First 원칙)

### 8.2 접근성

| 항목 | 구현 방식 |
|---|---|
| 색상 대비 | 모든 텍스트/배경 조합 WCAG AA 준수 (`--navy` on `--cream`: 9.5:1 이상) |
| TTS graceful degradation | `'speechSynthesis' in window` 체크 → 미지원 시 설정 토글 자동 비활성화 + 시각 자막만 표시 |
| 포커스 가능 요소 | `<button>` 사용 또는 `role="button" tabindex="0"` + Enter/Space 키보드 핸들러 |
| 한자 블록 접근성 레이블 | `aria-label="화 (불 화)"` 형식으로 음독+뜻 명시 |
| 색맹 대응 | 힌트 하이라이트는 색상 + 테두리 형태 패턴 병기 (색만으로 정보 전달 금지) |
| 가로 모드 | 가로 모드 자연스러운 폴백 레이아웃 제공, 회전 강제 없음 |

---

## 9. 리더보드 / 영속화

### 9.1 점수 계산 방식

```js
// game.js — 세션 종료 시 점수 계산
// 별 1~3개 배정
function calcStars(correctCount, total) {
  const rate = correctCount / total;
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  return 1;
}
// 점수 = (정답 수 × 10) + (오답 없는 라운드 수 × 5)
// wrongPerRound는 블록 탭 단위 오답 수 (M6) — 무오답 보너스 기준 동일
function calcScore(session) {
  const bonus = session.queue.filter((_, i) => session.wrongPerRound[i] === 0).length;
  return session.correctCount * 10 + bonus * 5;
}
```

### 9.2 localStorage 스키마

```js
// storage.js — 저장하는 키 목록 (모두 '7rr:' 접두사 적용)

// 설정
'7rr:settings'  →  { ttsEnabled: boolean, sfxEnabled: boolean, hintVisible: boolean }

// 진행률
'7rr:progress'  →  {
  totalSessions: number,
  lastHintLevel: 1 | 2 | 3,     // 다음 세션 힌트 레벨 초기값
  lastPlayedAt: number,          // Unix timestamp (ms)
}

// 리더보드 — 상위 10개 점수 목록
'7rr:leaderboard'  →  Array<{
  score: number,
  stars: 1 | 2 | 3,
  correctCount: number,
  totalCount: number,
  hintLevel: 1 | 2 | 3,         // 세션 종료 시점 힌트 레벨
  playedAt: number,              // Unix timestamp (ms)
}>
// 최대 10개 유지 — 점수 내림차순 정렬, 11번째 이하 버림
```

### 9.3 리더보드 렌더링 (`src/js/leaderboard.js`)

```js
export function renderLeaderboard() {
  const scores = storage.get('leaderboard', []);
  // 공용 leaderboard-screen 컨테이너에 DOM 주입
  // 상위 10개, 날짜 포맷: 'M월 D일'
  // 별 개수 시각화: ★★☆ 형식 (--yellow 색)
  // 빈 경우: "아직 기록이 없어요" 안내 텍스트
}
```

---

## 10. 핵심 알고리즘

### 10.1 정답 판정 (M6 — 한자 1개 단위)

```js
// game.js — 블록 1개 제출마다 즉시 판정
// 아직 변환되지 않은 음절 중 id와 일치하는 인덱스 반환 (순서 무관), 불일치면 -1
function componentIndexFor(vocabItem, id, solved) {
  return vocabItem.components.findIndex((c, i) => c === id && !solved[i]);
}
// ≥ 0  → 부분 정답: solved[i] = true, 해당 음절 한글→한자 변환
//        solved 전부 true → 라운드 완성 (correctCount++, 음·뜻 확인 팝업)
// -1   → 오답: wrongCount++, wrongPerRound[idx]++, 해당 블록만 shake
```

> 오답 카운트는 **블록 탭 단위**다. 즉시 판정으로 인한 대입(hill-climbing) 시도는
> 무오답 보너스(`wrongPerRound === 0` × 5점) 상실로 점수에서 상쇄된다 (§9.1).

### 10.2 어휘 풀 세션 배열

```js
// game.js
function buildSessionQueue(vocab, hintLevel) {
  // 난이도 순(difficulty 1 → 2 → 3) 정렬 후
  // 각 난이도 구간 내에서 shuffle
  const sorted = [...vocab].sort((a, b) => a.difficulty - b.difficulty);
  return sorted;  // 힌트 레벨 전환은 라운드 번호로 결정 (§3.4 참조)
}
```

### 10.3 연속 플레이 중복 제한

```js
// game.js
// state.session.lastPlayedWords: Set<string> — 직전 세션 어휘 (메모리 내 유지, 미영속)
function pickQueue(vocab) {
  const lastWords = state.session.lastPlayedWords || new Set();
  const fresh = vocab.filter(v => !lastWords.has(v.word));
  const repeat = vocab.filter(v => lastWords.has(v.word));
  // fresh가 충분하면 fresh만, 부족하면 repeat으로 채움
  // 직전 세션 단어 재출제 비율 ≤ 20% 목표 (어휘 풀 15개 기준 최대 3개 중복)
  return [...shuffle(fresh), ...shuffle(repeat)].slice(0, vocab.length);
}
```

---

## 11. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 애니메이션 | `transform` / `opacity`만 사용 — compositor layer, layout 트리거 없음 |
| 60fps 보장 | 분해 애니메이션 CSS 전용, JS requestAnimationFrame 최소화 |
| 초기 로드 | 정적 파일 < 10KB/모듈, 폰트 `preconnect`으로 DNS 병렬화 |
| 이미지 없음 | 합성어·한자 표현은 순수 텍스트+CSS — 이미지 로드 없음, 즉시 렌더 |
| 메모리 | 어휘 15개 × 블록 5개 DOM — 수십 노드, 누수 위험 없음 |
| TTS 지연 | `speechSynthesis.cancel()` 후 즉시 `speak()` — 이전 발화 끊기 처리 |

---

## 12. 보안 / 프라이버시

- 외부 서버 통신 없음, 광고 없음, 사용자 데이터 외부 전송 없음
- 사용자 입력은 블록 탭/드래그뿐 — XSS 표면 없음
- `innerHTML` 사용 시 정적 데이터(`hanja.js`, `vocab.js`)만 — 사용자 입력 주입 없음
- localStorage/IndexedDB 키 접두사 `7rr:` — 동일 오리진 내 다른 게임과 완전 격리

---

## 13. 테스트 전략

### 수동 테스트 체크리스트

#### 디바이스 매트릭스
- [ ] iPhone SE (소형 화면, iOS 15+) — 64dp 블록 탭 정확도, 자성 스냅 거리
- [ ] iPad Mini / Air (iOS 15+) — 세로 모드 레이아웃, TTS unlock
- [ ] 갤럭시 탭 A (Android 12+) — 보급형 CSS 애니메이션 60fps 확인
- [ ] 보급형 안드로이드 폰 (2GB RAM) — 메모리·렌더 프레임 안정성

#### 핵심 시나리오
- [ ] 첫 진입 → "시작" 탭 → SpeechSynthesis + AudioContext unlock 성공
- [ ] L1 라운드: 힌트 하이라이트 + 뜻 라벨 표시 확인 (화산 → 불 화 / 뫼 산)
- [ ] 정답 블록 1개 탭 → 카드 음절 한글→한자 제자리 변환(한글 루비) + 음·뜻 TTS, 블록 비활성
- [ ] 정답 블록 2개째 탭 → 전 음절 변환 → 음·뜻 확인 팝업 + TTS 표시
- [ ] 오답 블록 탭 → 해당 블록만 shake 애니메이션 + 오답 효과음 → 재시도
- [ ] L1 5라운드 → L2 전환 (뜻 라벨 사라지고 하이라이트만)
- [ ] L2 5라운드 → L3 전환 (힌트 없음)
- [ ] 세션 완료 → 완료 화면, 별 표시, 점수 계산
- [ ] 리더보드 진입 → 점수 목록 확인, 닫기
- [ ] 설정 → TTS 끄기 → 재시작 → TTS 없이 게임 진행
- [ ] Private Mode → localStorage 저장 실패해도 게임 정상 동작
- [ ] PWA 설치 후 오프라인 → 게임 정상 작동
- [ ] "다시 하기" → 직전 세션 단어 ≤ 3개 중복 확인 (15개 풀 기준)

#### 인지·접근성
- [ ] 만 8세 시범 사용자 5명 — 힌트 없이 합성어 카드 이해 여부 관찰
- [ ] L3 정답률 ≥ 70% 목표 달성 여부 (5명 평균)
- [ ] 더블탭 줌 비활성 확인
- [ ] 색맹 시뮬레이터에서 힌트 하이라이트 형태 패턴으로 식별 가능
- [ ] 시스템 음소거 → 시각 피드백만으로 게임 진행 가능

### 자동화 (P2 후보)
- Vitest + jsdom: `componentIndexFor`, `buildDockItems`, `calcScore`, `calcStars` 유닛 테스트
- Playwright (모바일 에뮬레이션): 핵심 3개 시나리오 E2E

---

## 14. 배포

```bash
# 로컬 개발 서버
npx serve -l 4330

# 또는 live-server (자동 새로고침)
npx live-server --port=4330
```

정적 파일이므로 어디든 호스팅 가능:

| 옵션 | 명령 | 비고 |
|---|---|---|
| GitHub Pages | `gh-pages` 브랜치 푸시 | HTTPS 자동, 상대경로 SW 필수 |
| Netlify | 드래그 앤 드롭 또는 `netlify deploy --dir=.` | PWA 헤더 자동 |
| Cloudflare Pages | Git 연동 | 한국 latency 양호 |
| Vercel | `vercel --prod` | 정적 배포 |

빌드 단계 불필요. Service Worker 캐시 파일 목록(`PRECACHE_ASSETS`)은 파일 추가·삭제 시 수동 갱신 + `CACHE_VERSION` bump 필수.

---

## 15. 미해결 기술 이슈

- [ ] 최종 어휘 세트 교차 검증 — `6_morpheme_detective/src/data/hanja.js` 100자 목록으로 `vocab.js` 15개 항목의 한자 ID 일치 여부 확인
- [ ] 힌트 L1 뜻 라벨 위치 — 합성어 카드 위(above) vs 형태소 영역 내부 오버레이 UX 검증 필요 (만 8세 가독성 테스트)
- [ ] 분해 애니메이션 세부 — "합성어 카드 → 두 조각으로 갈라지는" 물리적 split 효과 구현 수준 결정 (CSS clip-path vs transform 분기 이동)
- [ ] 리더보드 공통 컴포넌트화 — 시리즈 전체 공통 `leaderboard-screen` CSS + JS를 별도 공유 디렉터리로 추출 여부 (P2)
- [ ] iOS Safari `speechSynthesis` 한국어 보이스 가용성 디바이스별 점검
- [ ] PWA 설치 프롬프트 노출 시점 — 세션 최초 완료 후 권장
- [ ] IndexedDB 전환 기준 — localStorage `7rr:leaderboard` 항목이 5KB 초과 시 IndexedDB 마이그레이션 검토 (P2)
