# 🔧 TRD — 3_word_network · 순우리말 어휘망 연결 게임

> Technical Requirements Document
> Last updated: 2026-05-05
> Status: Phase 1 완료 · Phase 2 코드 완료 (실기기 검증 대기)
> 기준 패턴: `1_chosung_quiz/` (Vanilla JS · ES Modules · 정적 호스팅)

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 의존성 0, 1단계와 통일, 학습/유지보수 용이 |
| 모듈 시스템 | ES Modules (`type="module"`) | 빌드 불필요, 네이티브 지원 |
| CSS | Vanilla CSS + CSS Variables | 토큰 관리 용이, 1단계 패턴 재사용 |
| 폰트 | Google Fonts (Jua, Gowun Dodum) | 한글·아이 친화 |
| 개발 서버 | `npx serve` 또는 Live Server, **포트 4323** (예약됨) |
| 저장소 | `localStorage` (설정·진행 중 세션) + `IndexedDB` (누적 학습 데이터) |
| TTS | Web Speech API (`speechSynthesis`) |
| 입력 | Pointer Events API (마우스/터치/펜 통합) |
| 일러스트 | inline SVG (1순위) → `<img>` WebP (폴백) → 이모지 콜라주 (최후 폴백) |
| (선택) PWA | manifest + Service Worker — MVP 이후 |

**의도적으로 제외**:
- React/Vue/Lit — 이 규모에서 과함
- Vite/Webpack — ES Modules로 충분
- TypeScript — 프로토타입 속도 우선 (state가 커지면 마이그레이션 검토)
- Drag-and-drop 라이브러리 — Pointer Events로 직접 구현 (학습/제어성)

## 2. 아키텍처

### 2.1 디렉터리 구조

> ✅ = 구현 완료 / 🔲 = 미구현(계획)

```
3_word_network/
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── TRD.md           ← 본 문서
│   └── PLAN.md
├── index.html            ✅
├── package.json          ✅ (npx serve . -p 4323)
├── favicon.svg           ✅
└── src/
    ├── css/
    │   ├── tokens.css       ✅ 색·간격·폰트 토큰
    │   ├── base.css         ✅ 리셋·body·100dvh 뷰포트
    │   ├── components.css   ✅ 음절블록·슬롯·도크·scene-bg-photo·overlay
    │   └── screens.css      ✅ start/play/end 화면
    ├── data/
    │   ├── words.js         ✅ 50개 단어·카테고리·음절·hotspot·emoji
    │   └── scenes.js        ✅ 8개 장면 + bgImage(Unsplash) + bgColors + bgEmojis
    ├── images/
    │   └── scenes/          🔲 (현재 Unsplash URL 사용 — Phase 4에서 자체 에셋 전환)
    └── js/
        ├── main.js          ✅ DOMContentLoaded 진입점
        ├── config.js        ✅ 상수(카테고리, 난이도, SYLLABLE_POOL, STORAGE_KEYS)
        ├── state.js         ✅ 단일 상태 객체, getState/resetGame/getCurrentTargetWord
        ├── storage.js       ✅ localStorage 래퍼 (키 prefix `wn:`)
        ├── utils.js         ✅ shuffle, sampleDistinct, longestCommonPrefix, vibrate
        ├── tts.js           ✅ Web Speech API 래퍼 (ko-KR, rate 0.85)
        ├── ui.js            ✅ showScreen, showFlash, animateShake/Sparkle, updateProgress/Score
        ├── syllable-dock.js ✅ buildDock, renderDock, markUsed/unmarkUsed
        ├── slot.js          ✅ renderSlots, fillNextSlot, checkSlots, lockSlots,
        │                       clearSlotsFrom, markSlotsWrong, celebrateSlots, shakeSlots
        ├── scene.js         ✅ bgImage+overlay+이모지 콜라주 렌더, markWordMatched, TTS 재발화
        ├── game.js          ✅ startGame, 장면/단어 루프, onSyllableTap,
        │                       onFilledSlotTap(취소), validateAnswer, endGame, applyHintLevel1/2
        ├── settings.js      ✅ 카테고리·장면수·커스텀디코이 설정 화면
        ├── dnd.js           ✅ Pointer Events 이벤트 위임 + AbortController (Phase 2.A)
        └── hint.js          🔲 (힌트 로직은 game.js 내장 — applyHintLevel1/2)
```

### 2.2 모듈 의존성

**현재 구현**:
```
main.js
  ├─ game.js ─→ state.js, utils.js, tts.js, ui.js,
  │             scene.js, slot.js, syllable-dock.js, dnd.js, sound.js
  └─ settings.js ─→ state.js, storage.js, ui.js, game.js

공통(최하위):
  config.js
  utils.js  ─→ config.js
  state.js  ─→ config.js
  storage.js (독립)
```

**Phase 3+ 추가 예정**:
```
hint.js (Phase 3) — 현재 game.js 내장, 분리 검토 중
settings.js ↔ game.js 순환 의존은 ES Module 런타임 참조로 허용. (현재 동작 중)
```

### 2.3 상태 모델

```js
state = {
  settings: {
    categories: Set<string>,      // 자연/동물/일상/행동/감정
    difficulty: 'easy'|'medium'|'hard',
    sceneCount: 3|5|10,
    ttsEnabled: boolean,
    hapticEnabled: boolean,
    hintMode: 'auto'|'off',
    coachingPrompt: boolean,      // 학부모 코칭 노출 여부
  },
  game: {
    scenes: Scene[],              // 이번 세션 장면들
    currentIdx: number,
    currentScene: {
      sceneId: string,
      targets: Target[],          // 한 장면의 정답 단어들
      activeTargetIdx: number,
    },
    slot: {
      filled: (Syllable|null)[],  // 현재 슬롯 상태
      lockedCorrect: boolean,
    },
    dock: Syllable[],             // 도크에 남은 음절들
    score: number,
    stickers: string[],           // 누적 보상
    wrongAnswers: Word[],
    hesitationTicks: number,
    hintLevel: 0|1|2,
  },
  meta: {
    sessionStartedAt: ISOString,
    lastSavedAt: ISOString,
  }
}
```

### 2.4 화면 상태 머신

```
start ──→ play ──→ end
  │        ↑   ↘    │
  ↓        │    ↘   │
settings ──┘     scene-transition (0.4s)
                    ↑
                  resume (이어하기)
```

**전이 부작용**:
- 모든 전이 → `cancelSpeech()` + `cancelDrag()` + 힌트 타이머 정지
- `play-screen` 진입 → `loadScene(currentIdx)` → `renderDock()` + `renderSlot()` + `renderScene()`
- `end-screen` 진입 → 진척도 IndexedDB 커밋 + 스티커 애니메이션

## 3. 핵심 알고리즘

### 3.1 음절 분리 (한글 자모 분해 없음, 음절 단위 그대로)

```js
// '우산' → ['우', '산']
function splitSyllables(word) {
  return Array.from(word);   // surrogate pair 안전
}
```

> 1단계의 `getChosung`과 달리, 본 게임은 자모가 아닌 **음절** 단위 분해.
> Array spread/`for...of`는 Code Point 기준 분해이므로 한글 음절 1개 = 항목 1개.

### 3.2 디코이 음절 생성

```js
function buildDock(targets, difficulty) {
  const correct = targets.flatMap(t => t.syllables);
  const decoyCount = { easy: 2, medium: 3, hard: 4 }[difficulty];
  const pool = SYLLABLE_POOL_BY_FREQUENCY;     // 한국어 고빈도 음절
  const decoys = sampleDistinct(pool, decoyCount, exclude=correct);
  return shuffle([...correct, ...decoys]);
}
```

**규칙**:
- 디코이는 정답과 **시각적·음운적으로 혼동 가능한 군**에서 우선 추출 (예: '우' 정답 → '오','수','구' 후보)
- 한 도크 동시 노출 음절 **최대 12개** (모바일 가독성 — AGENTS.md §성능)

### 3.3 슬롯 검증

```js
function checkSlot(slot, target) {
  if (slot.some(s => s === null)) return 'incomplete';
  const composed = slot.map(s => s.char).join('');
  if (composed === target.word) return 'correct';

  const correctPrefix = longestCommonPrefix(slot, target.syllables);
  return { status: 'wrong', correctPrefixLen: correctPrefix };
  // 부분 정답 → 정답 prefix까지는 슬롯에 잠금, 이후만 도크로 환원
}
```

**부분정답 처리**: 만 5세 좌절감 완화. 잠긴 음절은 시각적으로 "확정" 표시.

### 3.4 그림 매칭(Hotspot Hit Test)

```js
function hitTest(pointer, scene) {
  for (const t of scene.targets) {
    const dx = pointer.xRel - t.hotspot.x;
    const dy = pointer.yRel - t.hotspot.y;
    if (Math.hypot(dx, dy) < t.hotspot.r + SNAP_RADIUS) return t;
  }
  return null;
}
```

`SNAP_RADIUS = 0.05` (상대값) — 부모 AGENTS.md의 "자성 스냅 ±20dp" 와 일치.

### 3.5 슬롯 탭 음절 취소

```js
function onFilledSlotTap(idx) {
  if (idx < slot.lockedCount) return;  // 잠긴 prefix는 취소 불가
  for (let i = idx; i < slot.filled.length; i++) {
    if (slot.filled[i]) {
      slot.filled[i].used = false;
      unmarkUsed(slot.filled[i].id);
      slot.filled[i] = null;
    }
  }
  clearSlotsFrom(idx);  // idx 이후 슬롯 시각 초기화
  vibrate(10);
}
```

**규칙**: 탭한 슬롯부터 이후 모든 슬롯의 음절을 한꺼번에 도크로 환원. prefix 잠금(lockedCount) 이전은 취소 불가.

### 3.6 망설임 감지·자동 힌트

```
hesitationTicks++ at every 1s of no input
  - 3 ticks (3s) AND wrongAttempts >= 3   → hintLevel 1: 첫 음절 발광
  - 6 ticks (6s)                          → hintLevel 2: 정답 위치 화살표
정답 입력 시 hesitationTicks = 0
```

설정 `hintMode === 'off'` 면 비활성화. 평균 힌트 사용률은 PRD §9 지표로 추적.

## 4. 외부 API

### 4.1 Web Speech API (TTS) — 1단계와 공유

```js
speak({ text, lang: 'ko-KR', rate: 0.85, pitch: 1.05, voice: koVoice });
```

호환성·미지원 fallback은 `1_chosung_quiz/src/js/tts.js` 패턴 그대로 재사용.

### 4.2 Pointer Events (드래그)

```js
el.addEventListener('pointerdown', onDown);
el.setPointerCapture(e.pointerId);
el.addEventListener('pointermove', onMove);
el.addEventListener('pointerup',   onUp);
```

- 마우스/터치/펜 통합. 멀티 터치는 `pointerId` 별 추적.
- 자성 스냅 거리 도달 시 `pointermove` 단계에서 ghost 위치 보정.
- 드래그 임계값 8px — 그 이하면 **탭으로 해석**(자동 슬롯 배치).

### 4.3 햅틱

```js
if (state.settings.hapticEnabled && 'vibrate' in navigator) navigator.vibrate(20);
```

iOS Safari에서는 무시됨 — graceful, 토글 자체는 표시하되 비활성 라벨 부여.

### 4.4 localStorage / IndexedDB

| 저장소 | 용도 | Key |
|--------|------|-----|
| localStorage | 설정·진행 중 세션 스냅샷 | `wn:settings`, `wn:resume` |
| IndexedDB | 누적 학습 데이터(단어별 노출/정답률) | DB `word_network`, store `progress` |

Private mode·할당량 초과 시 `try/catch` 후 in-memory로 graceful fallback.

## 5. 렌더링 전략

### 5.1 일러스트 (현재 구현 + 장기 계획)

**현재 (Phase 1~2)**:
```
bgImage (picsum.photos seed URL) → <img class="scene-bg-photo"> (배경 전체 커버)
  + .scene-overlay (가독성 보정 반투명 레이어)
  + .scene-bg (이모지 콜라주 — 분위기 연출용)
  + .target-item (hotspot 위치에 이모지+라벨 절대 배치)
```

URL 형식: `https://picsum.photos/seed/{seed}/800/600`  
— 동일 seed는 항상 동일 이미지, API 키 불필요, 안정적 서비스.

**장기 폴백 계획 (Phase 4)**:
```
1순위: 자체 제작 SVG (hotspot은 SVG 좌표계의 <use>/<g> 그룹)
2순위: bgImage (라이센스 사진 WebP 로컬 저장)
3순위: 이모지 콜라주만 (네트워크 없음)
```

`img.onerror` → 그라디언트 배경(`bgColors`)으로 자동 폴백. picsum.photos URL은 Phase 4에서 자체 에셋으로 교체 예정.

### 5.2 DOM 업데이트

- 직접 DOM 조작(프레임워크 없음).
- 음절 도크/슬롯 재렌더는 `replaceChildren()` 단일 호출로 batch.
- 애니메이션은 `transform`/`opacity`만 사용 (compositor layer 유지).

### 5.3 반응형/뷰포트

- `100dvh` 사용 (iOS Safari 주소창 변동 대응 — 부모 AGENTS.md §모바일 우선).
- `matchMedia('(orientation: portrait)')` 로 세로/가로 분기.
- 화면 회전 시 진행 상태 유지(레이아웃 전환만, state 변동 없음).
- 한 화면 동시 노출 음절 **최대 12개** 제한.

## 6. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 초기 로드 | 첫 장면만 즉시 로드, 다음 장면 1개 prefetch |
| 일러스트 | SVG는 inline (네트워크 0), WebP는 lazy `<img loading="lazy">` |
| 폰트 | `font-display: swap`, `preconnect` (1단계와 동일) |
| 애니메이션 | `transform`/`opacity` only, `will-change` 신중 사용 |
| 드래그 | `pointermove` 안에서 DOM 측정 금지 (사전 캐시) |
| 타이머 | 망설임 감지는 1s 간격 `setInterval` (정확도 충분) |

## 7. 보안 / 프라이버시

- 사용자 입력 없음(블록 선택만) → XSS 표면 작음.
- 단어·장면 데이터는 정적이므로 `textContent` / SVG `<use>` 안전 사용.
- 외부 서버 통신 없음 — 모든 데이터 로컬.
- 미래에 사용자 단어집(JSON 업로드, P2)을 받을 경우 `JSON.parse` 후 스키마 검증 + `textContent`만 사용.

## 8. 테스트 전략

### 수동 테스트 체크리스트 (MVP 종료 게이트)

- [ ] 카테고리 전부 해제 → 시작 시 플래시 메시지
- [ ] 동일 음절이 두 번 등장하는 단어("바바…") 슬롯 검증 정확
- [ ] 부분 정답 → 잠긴 prefix만 슬롯 유지, 나머지 환원
- [ ] hotspot 매칭에서 자성 스냅 동작 (가까운 객체 자동 흡착)
- [ ] 일러스트 로드 실패 → WebP → 이모지 폴백 단계별 확인
- [ ] TTS 미지원 브라우저 → 토글 비활성, 게임은 정상
- [ ] iOS Safari 햅틱 무시 → 토글은 보이되 비활성 라벨
- [ ] 세로 ↔ 가로 회전 → 진행 상태 보존
- [ ] localStorage 실패 (Private mode) → in-memory로 정상 동작
- [ ] **실기기**: iPad (세로/가로), 갤럭시 탭, 보급형 안드로이드

### 자동화 (Phase 7 이후)

- Vitest + jsdom — `splitSyllables`, `checkSlot`, `buildDock`, `hitTest` 유닛
- Playwright — 장면 1개 클리어 / 부분정답 / 힌트 발현 E2E

## 9. 배포

정적 파일이므로 어디든 호스팅 가능 (1단계와 동일):

| 옵션 | 명령 |
|---|---|
| GitHub Pages | `gh-pages` 브랜치 push |
| Netlify | `netlify deploy --dir=.` |
| Vercel | `vercel --prod` |
| Cloudflare Pages | 드래그 앤 드롭 |

빌드 단계 없음 — 루트 그대로 업로드.

## 10. 1단계와의 호환성·재사용

| 자산 | 1단계 → 3단계 재사용 방식 |
|------|--------------------------|
| `tts.js` | 파일 그대로 복사, 또는 향후 공유 라이브러리화 |
| `storage.js` 패턴 | 키 prefix만 `wn:` 로 변경, try/catch graceful 동일 |
| `utils.js` (shuffle/rng) | 그대로 |
| `words.js` 스키마 | 상위 호환 — `syllables` 필드만 추가 |
| CSS 토큰 | tokens.css 색·간격은 형제 게임과 통일 (브랜드 일관성) |

## 11. 컴포넌트 라이브러리화 (장기 검토)

2단계(`2_syllable_assembly`)와 3단계는 **드래그+자성 스냅+음절 블록**을 공유한다.
3단계 MVP 안정화 이후, 다음을 `../shared/` 디렉토리로 추출 검토:

- `dnd.js` (Pointer Events + 자성 스냅)
- `syllable-block` 컴포넌트(스타일 토큰만 외부 주입)
- `tts.js`
- `storage.js`

추출 시점은 "두 게임 모두 안정 동작" 이후, 일관 API 설계 1회로 끝낸다 (조기 추상화 금지).

## 12. 홈·설정·완료 화면 디자인 시스템

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 게임 완료 화면(`end-screen`)은 `1_chosung_quiz` 의 디자인 시스템을 계승한다. 아래 수치는 `1_chosung_quiz/src/css/screens.css` · `components.css` 의 실제 값이다.

### 폰트

| 요소 | 규격 |
|---|---|
| 폰트 로드 | `<link>` Google Fonts — `Jua`, `Gowun Dodum` (1단계와 동일) |
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·부제목·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 섹션 레이블 (설정) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |

### 버튼

| 요소 | 규격 |
|---|---|
| 버튼 레이블 폰트 | `font-family: 'Jua', sans-serif; letter-spacing: 0.5px` |
| 버튼 기본 (`.btn`) | `font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 기본 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 효과 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |

### 색상·레이아웃

| 요소 | 규격 |
|---|---|
| 색상 변수 출처 | `1_chosung_quiz/src/css/tokens.css` (`--coral #FF7757`, `--navy #2D3047`, `--cream #FFF6E4`, `--mint #6BCAB8`, `--yellow #FFD166`) |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 레이아웃 | 수직 중앙 정렬, 카드형 컨테이너 (`start-screen`, `settings-screen`, `end-screen`) |

> 플레이 화면은 이 게임 특유의 장면 일러스트·음절 도크 레이아웃을 사용한다.  
> 시작·설정·완료 화면만 위 규격을 의무 준수한다.

<!-- MANUAL: -->
