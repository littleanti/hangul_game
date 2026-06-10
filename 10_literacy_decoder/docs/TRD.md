# 🔧 TRD — 문해력 해독기 (Literacy Decoder)

> Technical Requirements Document
> Last updated: 2026-06-08
> 본 문서 §2 (아키텍처) · §2.5 (코드 내비게이션 맵) 은 실제 소스(`src/`)와 1:1 일치하도록 유지한다.
> 코드 작업 시작 전 "어느 파일/함수를 고쳐야 하는가"는 **§2.5 코드 내비게이션 맵**에서 먼저 찾는다.

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2022+) | 1단계 / 7단계 컨벤션, 빌드 불필요 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브, 점진적 로딩 |
| CSS | Vanilla CSS + CSS Variables (디자인 토큰) | 1단계 토큰 체계 재사용 |
| 폰트 | Google Fonts (Pretendard 본문, Noto Sans CJK KR 한자) | 가독성 + 한자 서브셋 |
| 한자 폰트 | Noto Sans CJK KR **서브셋** | 8급 ~ 준4급 한자 + 사자성어 한자만 임베드 |
| 개발 서버 | `npm run dev` → `npx -y serve . -l 4326` | 포트 4326 (`package.json` scripts) |
| 저장소 | IndexedDB (자체 경량 래퍼, `src/js/storage.js`) | 누적 학습 데이터, localStorage 한도 회피. Dexie 미사용 |
| 설정 저장 | localStorage | 폰트 크기, 다크모드, 마지막 진행 위치 |
| TTS | Web Speech API | 지문 낭독, 한자 음 발음 |
| 그래프 | Vanilla SVG (대시보드용) | 의존성 최소화, 학습 곡선 단순 |

**의도적으로 제외한 것**:
- React / Vue / Svelte 프레임워크 — 1단계 / 7단계 컨벤션 일치, 학습 친화
- 빌드 도구 (Vite / Webpack) — ES Modules + 정적 서버로 충분
- TypeScript — 본 단계는 프로토타입 우선, 데이터 스키마는 JSDoc로 보강
- 외부 차트 라이브러리 — 대시보드 그래프는 SVG 직접 작성

## 2. 아키텍처

### 2.1 디렉터리 구조 (실제 소스 기준)
```
6_literacy_decoder/
├── index.html               # 진입점. 7개 화면(section.screen) 슬롯 + #toast-layer
├── package.json             # dev/start: serve . -l 4326, live: live-server
├── manifest.json            # PWA 매니페스트 (이름/아이콘/theme color)
├── sw.js                    # Service Worker (지문/한자/폰트 캐시)
├── favicon.svg
├── src/
│   ├── css/
│   │   ├── tokens.css        # 색상·간격·타이포 토큰 (1단계 팔레트)
│   │   ├── base.css          # 리셋 + 기본 타이포 (한자 폰트 fallback)
│   │   ├── components.css    # 버튼·토스트·모달·라디오·토글 등 공통 컴포넌트
│   │   ├── screens.css       # start / settings / dashboard / end / composition
│   │   ├── reading.css       # 읽기·보스 화면 전용 (빈칸 셀, 형태소 도크, 어원 모달)
│   │   ├── collection.css    # 도감 전용 (그리드, 칩 필터, 상세 모달)
│   │   └── responsive.css    # 폰 ≤600px, 태블릿 ≥768px 분기
│   ├── data/
│   │   ├── corpus/
│   │   │   ├── grade5.json   # 입문(intro) 지문 5편 — pages[].text 에 [B1] 토큰 + blanks[]
│   │   │   ├── grade6.json   # 중급(mid) 5편 + 심화(advanced) 5편 (보스 연결)
│   │   │   └── manifest.json # 지문 메타 (id, grade, level, charCount, boss, source)
│   │   ├── hanja.js          # 한자 마스터 DB (~291자) + getHanjaByGrade/Category, lookupHanja
│   │   └── idioms.js         # 사자성어 보스 데이터 (EMBEDDED_FALLBACK + BOSS_META → BOSS_IDIOMS)
│   └── js/
│       ├── main.js           # 진입점 + 부트스트랩 + 시작/설정 화면 이벤트 바인딩
│       ├── config.js         # 상수 (STORAGE_KEYS, IDB_*, PAGINATION, SRL_INTERVALS_MS, FONT_SIZES)
│       ├── state.js          # 전역 상태 싱글톤 + window.literacyDecoderGateway (7단계 게이트웨이)
│       ├── storage.js        # IndexedDB 래퍼(메모리 폴백) + localStorage 래퍼(settings) + export/import
│       ├── utils.js          # parsePageText, buildCorpusMarkers, shuffle, uuid, extractHanja
│       ├── tts.js            # Web Speech API (speakPassage, speakWord, cancelAll)
│       ├── ui.js             # showScreen, el(), clear, toast, showModal, applyFontSize/DarkMode
│       ├── corpus.js         # 코퍼스 lazy-load (loadManifest/getCorpus/pickNextCorpus/listCorpora)
│       ├── morpheme.js       # 형태소 도크 후보 생성(buildMorphemeDock) + 난이도별 라벨(cardLabel)
│       ├── reading.js        # ★핵심 게임 루프 (지문 렌더·빈칸·채점·어원·SRL 기록·마무리)
│       ├── boss.js           # 사자성어 보스 스테이지 (4슬롯 배치·채점·게이트웨이 통과)
│       ├── end.js            # 종료 화면 (정답률·읽기속도·다음 지문·작문 진입)
│       ├── composition.js    # 응용 작문 미션 (학습 단어로 문장 짓기, 키워드 매칭)
│       ├── collection.js     # 한자 도감 (급수 필터 그리드 + 한자별 어휘 상세 모달)
│       ├── dashboard.js      # 학습 기록 대시보드 (Vanilla SVG 차트 + export/import)
│       └── install-prompt.js # PWA beforeinstallprompt 처리
├── scripts/
│   ├── build-corpus.js       # {{단어:漢字}} 마커 → 런타임 JSON 빌더 (Node, 코퍼스 확장용)
│   └── e2e-verify.mjs        # 헤드리스 Puppeteer E2E 검증
├── docs/                     # 본 문서 (PRD / TRD / PLAN / AGENTS)
└── AGENTS.md

⚠️ SRL 스케줄러는 별도 파일(`srl.js`)이 아니다 — `config.js`의 `SRL_INTERVALS_MS` 상수 +
   `reading.js`의 `recordHanjaResult()` 에 인라인 구현되어 있다.
```

### 2.2 모듈 의존성 (실제 import 기준)
```
main.js  (부트스트랩 + 시작/설정 화면)
  ├─ state.js, config.js, utils.js, ui.js
  ├─ storage.js     → IndexedDB(메모리 폴백) / localStorage(settings)
  ├─ corpus.js      → fetch(manifest/grade*.json)
  ├─ reading.js ───┐
  ├─ dashboard.js  │
  ├─ collection.js │
  └─ install-prompt.js

reading.js  (★핵심 루프)
  ├─ state, ui, utils, config, storage, tts
  ├─ morpheme.js    → hanja.js, utils, config
  ├─ boss.js        → state, ui, utils, hanja.js   (idioms.js 는 reading.js 가 lookupBoss import)
  └─ end.js         → corpus, composition.js, (동적 import: reading.js)

boss.js   → idioms 데이터는 reading.js 가 lookupBoss()로 조회해 startBoss()에 주입
dashboard.js  → storage (export/import 포함)
collection.js → hanja.js, idioms.js(BOSS_IDIOMS), corpus.js, storage(settings)
composition.js→ state, ui
```

- 순환 의존: `reading.js` → `end.js` → (동적 `import("./reading.js")`). 다음 지문 진입 시 동적 import로 끊어 안전.
- `boss.js` 는 `reading.js` 의 `finishReading()` 이 `lookupBoss()`로 idiom을 찾아 `startBoss(idiom, done)` 콜백으로 호출 — boss는 reading을 직접 import하지 않음.

### 2.3 상태 모델 (`src/js/state.js` — 실제)
```js
state = {
  user: {
    id: string,                    // UUID v4 로컬 생성 (settings: ld_user_id)
    grade: 5,                      // ⚠️ 통합 모드에서 사실상 미사용(레거시). 화면 분기 없음
    fontSize: 16 | 18 | 22,        // 기본 18
    darkMode: boolean,
  },
  session: {                       // resetSession()으로 초기화 (startReading 진입 시)
    corpusId: string | null,
    page: number,                  // 현재 페이지 인덱스 (코퍼스 pages 배열)
    blanks: Blank[],               // 전 페이지 빈칸 평탄화: { ...blank, page, filled, placedChars[] }
    activeBlankId: string | null,
    startedAt: number,             // 세션 시작 timestamp
    pageStartedAt: number,         // 페이지 진입 timestamp
    correctCount: number,
    wrongCount: number,
    perPagePlacedChars: [],        // [{ blankId, char, ts }] — 배치 로그
    bossPending: string | null,    // 지문 끝나면 진입할 사자성어 id
    inBoss: boolean,
    compositionAttempts: [],       // [{ word, hanja, text, ok, ts }]
  },
  progress: {
    completedCorpusIds: Set<string>,
    learnedHanja: Map<hanjaChar, { userId, hanja, exposureCount, correctCount, consecutiveCorrect, nextReview }>,
    learnedWords: Map<word, { firstSeenAt, masteryLevel }>,
    bossesPassed: Set<idiomId>,    // 7단계 게이트웨이용
  },
  ui: {
    screen: 'start'|'settings'|'read'|'boss'|'dashboard'|'collection'|'end'|'composition',
    dockExpanded: boolean,
    etymologyPopup: null,          // (현재 모달은 ui.showModal로 직접 생성, 이 슬롯은 미사용)
    overlayTooltip: null,          // 한자 long-press 툴팁 (슬롯만 정의, UI 미구현)
  }
}
```

**7단계 게이트웨이**: `state.js` 가 `window.literacyDecoderGateway = { bossesPassed(), grade(), version }` 를 노출.
`getBossesPassedSet()` 도 export. IndexedDB `bossPassed` 스토어가 영속 진실의 근원.

### 2.4 화면 상태 머신
```
        ┌───────────────── settings (설정) ────────────────┐
        │                                                   │
start ──┼──→ read ──(모든 빈칸 채움)──→ [boss?] ──→ end ──→ composition?(선택)
  │     │     ▲                                      │  └──→ 다음 지문 → read
  ├──→ dashboard (학습 기록)                          │
  ├──→ collection (도감)                              └──→ 시작 화면
  └──→ 이어하기 → read (마지막 corpus)
```

화면 전환은 모두 `ui.showScreen(name)` (`.screen.active` 토글) + `state.ui.screen` 갱신.

전이별 핵심 처리:
- `start → read`: `startReading(corpus)` → `resetSession()` → 전 페이지 빈칸 평탄화 → `renderPage(0)`
- `read` 내부: 페이지 이동(`navigatePage`)은 현재 페이지 빈칸이 모두 채워져야 다음으로 진행
- `read → boss`: 마지막 페이지 완료 후 `finishReading()` → `corpus.boss` 있으면 `lookupBoss()` → `startBoss()`
- `boss → end`: `onComplete(passed)` 콜백 → `markBossPassed()` flush → `showEndScreen()`
- `end → composition`: 선택적 작문 미션 (`showCompositionMission`), 완료 후 종료 화면 복귀
- TTS는 `speakPassage/speakWord` 호출 시 내부에서 `cancelAll()` 선행 (전역 cleanup 훅은 없음)

### 2.5 코드 내비게이션 맵 (기능 → 파일 → 핵심 함수)

> 작업 시작 시 이 표에서 대상 파일·함수를 먼저 찾는다. 경로는 모두 `src/` 기준.

| 기능 / 관심사 | 파일 | 핵심 export·함수 |
|---|---|---|
| 앱 부트스트랩·라우팅 | `js/main.js` | `bootstrap()`, `renderStartScreen()`, `bindGlobalEvents()` |
| 시작 화면 버튼(시작/이어하기/도감/기록/설정) | `js/main.js` | `bindGlobalEvents()` 내 click 핸들러 |
| 폰트 크기·다크모드 설정 | `js/main.js` + `js/ui.js` | `applyFontSize()`, `applyDarkMode()` |
| **읽기 핵심 루프** | `js/reading.js` | `startReading()`, `renderPage()`, `renderBlankContents()` |
| 빈칸 활성화·도크 표시 | `js/reading.js` | `activateBlank()`, `renderDock()` |
| 형태소 카드 배치(탭/드래그) | `js/reading.js` | `placeCharOnActiveBlank()`, `attachDropTargets()` |
| 채점·정답 처리 | `js/reading.js` | `checkAnswer()`, `rerenderBlank()`, `showWrongFeedback()` |
| 어원 풀이 모달 | `js/reading.js` | `showEtymology()` |
| 페이지 이동(스와이프/키보드) | `js/reading.js` | `navigatePage()`, `bindReadingEvents()` |
| SRL 망각곡선 기록 | `js/reading.js` + `js/config.js` | `recordHanjaResult()`, `SRL_INTERVALS_MS` |
| 마무리·세션 저장 | `js/reading.js` | `maybeFinish()`, `finishReading()`, `endReadingEarly()` |
| 형태소 도크 후보 생성·디스트랙터 | `js/morpheme.js` | `buildMorphemeDock()`, `cardLabel()` |
| 사자성어 보스 | `js/boss.js` | `startBoss()`, `placeInSlot()`, `submitAnswer()`, `celebrate()` |
| 종료 화면 | `js/end.js` | `showEndScreen()`, `nextCorpus()` |
| 응용 작문 미션 | `js/composition.js` | `showCompositionMission()`, `submitComposition()` |
| 한자 도감 | `js/collection.js` | `showCollection()`, `draw()`, `openDetail()`, `buildWordIndex()` |
| 학습 기록 대시보드·차트 | `js/dashboard.js` | `showDashboard()`, `renderAccuracyChart()`, `renderReadingSpeedChart()`, `renderTopMistakes()` |
| 데이터 내보내기/불러오기 | `js/dashboard.js` + `js/storage.js` | `downloadJSON()`, `triggerImport()`, `exportAll()`, `importAll()` |
| 코퍼스 로드·다음 지문 선택 | `js/corpus.js` | `loadManifest()`, `getCorpus()`, `pickNextCorpus()`, `listCorpora()` |
| 지문 텍스트·마커 파싱 | `js/utils.js` | `parsePageText()`, `buildCorpusMarkers()` |
| IndexedDB CRUD | `js/storage.js` | `save*/get*/list*` (users·progress·hanjaMastery·bossPassed·sessions) |
| localStorage 설정 | `js/storage.js` | `settings.get/set/remove` |
| 화면 전환·DOM 헬퍼·토스트·모달 | `js/ui.js` | `showScreen()`, `el()`, `clear()`, `toast()`, `showModal()` |
| TTS | `js/tts.js` | `speakPassage()`, `speakWord()`, `cancelAll()` |
| PWA 설치 안내 | `js/install-prompt.js` | `showInstallPrompt()` |
| 7단계 게이트웨이 노출 | `js/state.js` | `window.literacyDecoderGateway`, `getBossesPassedSet()` |
| 한자 마스터 DB | `data/hanja.js` | `HANJA`, `getHanjaByGrade()`, `getHanjaByCategory()`, `lookupHanja()` |
| 사자성어 보스 데이터 | `data/idioms.js` | `BOSS_IDIOMS`, `BOSS_META`, `lookupBoss()` |
| 지문 코퍼스 | `data/corpus/{manifest,grade5,grade6}.json` | — |
| 전역 상수 | `js/config.js` | `STORAGE_KEYS`, `IDB_*`, `PAGINATION`, `DIFFICULTY`, `FONT_SIZES`, `SRL_INTERVALS_MS`, `DOCK_DISTRACTOR_TOTAL` |

**자주 헷갈리는 지점**
- 같은 단어가 본문에 여러 번 나오면 `[B1]` 토큰도 여러 번 등장하지만 **blank 객체는 1개**다. 따라서 DOM 갱신은 항상 `querySelectorAll('.blank[data-blank-id="…"]')` 로 **모든 occurrence**를 동기화해야 한다 (`renderBlankContents`/`placeCharOnActiveBlank`/`rerenderBlank` 참고).
- 페이지 분할은 런타임이 아니라 **코퍼스 JSON에 이미 `pages[]` 로 저장**되어 있다. `paginateForMobile` 같은 런타임 분할 함수는 존재하지 않는다 (§4.3 참고).
- SRL은 `srl.js` 가 아니라 `reading.js` + `config.js` 인라인이다.

## 3. 데이터 모델

### 3.1 지문 코퍼스 스키마 (`corpus/grade5.json`)
```jsonc
{
  "version": 1,
  "corpora": [
    {
      "id": "g5-001",
      "title": "농부와 도깨비",
      "grade": 5,
      "level": "intro",          // intro | mid | advanced
      "charCount": 156,
      "estimatedReadingMs": 90000,
      "pages": [
        {
          "text": "옛날 옛적, 한 [B1]가 살았는데, 매일 [B2]에서 일했어요.",
          "blanks": [
            {
              "id": "B1",
              "answer": { "word": "농부", "hanja": "農夫" },
              "etymology": [
                { "char": "農", "sound": "농", "meaning": "농사" },
                { "char": "夫", "sound": "부", "meaning": "사내" }
              ],
              "morphemeHints": ["農", "夫", "山", "水", "火", "木"],
              "contextClues": ["일했어요", "옛날"]
            }
          ]
        }
      ],
      "boss": null               // 또는 사자성어 보스 ID 참조
    }
  ]
}
```

### 3.2 한자 마스터 DB (`data/hanja.js` — 5단계와 호환, 현재 ~291자)
```js
// 필드: sound(음) / meaning(뜻) / strokes(획수) / grade(급수) / category(의미 카테고리)
export const HANJA = {
  "農": { sound: "농", meaning: "농사", strokes: 13, grade: "준4급", category: "직업" },
  "夫": { sound: "부", meaning: "사내", strokes: 4,  grade: "7급",  category: "인간" },
  // ... (~291자)
};

// 헬퍼 export
export function getHanjaByGrade(grade) { /* 급수별 배열 */ }
export function getHanjaByCategory(category, excludeSet) { /* 카테고리별, 제외셋 적용 */ }
export function lookupHanja(char) { /* { char, sound, meaning, ... } (없으면 ?) */ }
```

### 3.3 사자성어 데이터 (`data/idioms.js` — 7단계 호환, 실제)
```js
// 기본은 임베디드 fallback(10개). 7단계가 같은 사이트로 배포된 경우
// ?seventh-stage=1 쿼리로 원본 SAJASUNGO_DATA 를 옵트인 동적 import.
const EMBEDDED_FALLBACK = [ { word:"일석이조", meaning:"두 가지 이득", hint:"…" }, /* …10개 */ ];
let SAJASUNGO_DATA = EMBEDDED_FALLBACK;
try {
  if (new URL(location.href).searchParams.get("seventh-stage") === "1") {
    const mod = await import("../../../7_four-character_idiom_crossword/data.js");
    if (Array.isArray(mod?.SAJASUNGO_DATA)) SAJASUNGO_DATA = mod.SAJASUNGO_DATA;
    else if (Array.isArray(globalThis.SAJASUNGO_DATA)) SAJASUNGO_DATA = globalThis.SAJASUNGO_DATA;
  }
} catch { /* 인접 디렉터리 부재 → fallback */ }
export { SAJASUNGO_DATA };

// 보스 스테이지용 추가 메타 (hanja 4글자 + 유도 일화). 7단계가 진실의 근원.
export const BOSS_META = {
  "동문서답": { hanja: ["東","問","西","答"], contextStory: "철수가 영희에게 … 동쪽을 물었는데 …" },
  // … BOSS_META 가 정의된 사자성어만 보스로 사용 가능
};

// BOSS_IDIOMS = SAJASUNGO_DATA ∩ BOSS_META 합성 ({ id, word, meaning, hint, hanja, contextStory })
export const BOSS_IDIOMS = SAJASUNGO_DATA.filter(it => BOSS_META[it.word]).map(it => ({ id: it.word, ...it, ...BOSS_META[it.word] }));
export function lookupBoss(id) { return BOSS_IDIOMS.find(b => b.id === id) || null; }
```

### 3.4 IndexedDB 스키마 (`storage.js` — 네이티브 IndexedDB, Dexie 미사용)
`IDB_NAME="literacy-decoder"`, `IDB_VERSION=1`. `openDB()` 가 `onupgradeneeded` 에서 스토어 생성.
private browsing / quota 초과 / 미지원 시 **메모리 폴백**(`initMemoryFallback`)으로 graceful degrade.

| 스토어 | keyPath | 인덱스 | 비고 |
|---|---|---|---|
| `users` | `id` | `grade` | UUID v4 |
| `progress` | `[userId, corpusId]` | `userId`, `completedAt` | `accuracy`, `partial` 플래그 |
| `hanjaMastery` | `[userId, hanja]` | `userId`, `nextReview` | SRL (`exposureCount`, `correctCount`, `consecutiveCorrect`) |
| `bossPassed` | `[userId, idiomId]` | `userId` | 7단계 게이트웨이 (`passedAt`) |
| `sessions` | `id` (autoIncrement) | `userId` | 읽기 속도 (`charsRead`, `elapsedMs`, `accuracy`) |

export/import: `exportAll(userId)` → `{ exportedAt, schemaVersion, user, progress, hanjaMastery, bossPassed, sessions }`,
`importAll(payload)` 로 복원. (대시보드 "데이터 내보내기/불러오기" 버튼)

## 4. 핵심 알고리즘

### 4.1 빈칸 추출 (저작 시)
지문 작성자가 마커 문법으로 빈칸 지정:
```
원문: 옛날 옛적, 한 {{농부:農夫}}가 살았는데...
빌드: build-corpus.js 가 마커를 [B1] 토큰으로 치환 + JSON 메타 생성
```
런타임에서는 이미 토큰화된 JSON만 로드 (성능).

### 4.2 디스트랙터 형태소 생성
```js
function buildMorphemeDock(blank, learnedHanja) {
  const correct = blank.answer.hanja.split("");                // 정답 형태소
  const distractors = sampleDistractors({
    pool: learnedHanja,                                        // 5단계까지 학습한 한자만
    excludeSet: new Set(correct),
    count: 6 - correct.length,
    weighting: "byContextSimilarity"                           // 의미 카테고리 인접 우선
  });
  return shuffle([...correct, ...distractors]);
}
```

**디스트랙터 원칙**:
- 학습자가 모르는 한자는 절대 등장 금지 (좌절 방지)
- 시각적으로 비슷한 한자 (`日` vs `白`) 한 번에 둘 다 출현 금지
- 의미 카테고리 같은 한자 1 ~ 2개 포함 (난이도 조절)

### 4.3 페이지네이션 (모바일)
```js
// 기준 1: 폰의 경우 빈칸 단위 분할 — 빈칸이 항상 화면 상단 절반에 위치
function paginateForMobile(corpus) {
  const pages = [];
  let buffer = "";
  let pageBlanks = [];
  for (const segment of corpus.segments) {
    if (segment.type === "blank") {
      if (pageBlanks.length >= 1 && buffer.length > 200) {     // 폰 1페이지 한도
        pages.push({ text: buffer, blanks: pageBlanks });
        buffer = ""; pageBlanks = [];
      }
      pageBlanks.push(segment.blank);
    }
    buffer += segment.text;
  }
  if (buffer) pages.push({ text: buffer, blanks: pageBlanks });
  return pages;
}
```

### 4.4 채점 + 어원 풀이
```js
function checkAnswer(blank, droppedMorphemes) {
  const userWord = droppedMorphemes.map(m => m.char).join("");
  if (userWord === blank.answer.hanja) {
    showEtymology(blank.answer.etymology);                     // 형태소 분해 팝업
    state.session.correctCount++;
    srl.recordSuccess(blank.answer.hanja);
    return "correct";
  }
  // 부분 정답: 형태소 단위 피드백
  const feedback = blank.answer.hanja.split("").map((expected, i) => ({
    expected, got: droppedMorphemes[i]?.char,
    match: droppedMorphemes[i]?.char === expected
  }));
  showMorphemeFeedback(feedback);
  state.session.wrongCount++;
  srl.recordFailure(blank.answer.hanja);
  return "wrong";
}
```

### 4.5 사자성어 보스 스테이지
```js
function startBoss(idiom) {
  const morphemes = shuffle(idiom.hanja);                      // 4개 형태소
  // 학습자는 4개의 슬롯에 배치, 순서까지 일치해야 정답
  // 정답 시 7단계 게이트웨이 플래그 set: bossPassed[idiom.id] = true
}
```

### 4.6 SRL 스케줄러 (5단계와 호환)
```js
// 에빙하우스 망각 곡선 기반: 1일, 3일, 7일, 14일, 30일
const REVIEW_INTERVALS_MS = [1, 3, 7, 14, 30].map(d => d * 86400000);

function nextReview(mastery) {
  const idx = Math.min(mastery.consecutiveCorrect, REVIEW_INTERVALS_MS.length - 1);
  return Date.now() + REVIEW_INTERVALS_MS[idx];
}
```

## 5. 외부 API

### 5.1 Web Speech API (TTS)
```js
function readPassage(text) {
  if (!('speechSynthesis' in window)) return;                  // 미지원 graceful
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR'; u.rate = 0.9; u.pitch = 1.0;
  u.voice = pickKoVoice();                                     // ko-KR > ko* > default
  speechSynthesis.speak(u);
}
```

**자동재생 정책**: 사용자가 명시적으로 🔊 버튼 탭 시에만 재생 (모바일 정책 준수).

### 5.2 IndexedDB
```js
try {
  await db.progress.put({ userId, corpusId, completedAt: Date.now(), accuracy });
} catch (e) {
  // private browsing 또는 storage quota 초과 시 메모리 폴백
  fallbackProgress.push({ userId, corpusId, completedAt: Date.now() });
}
```

## 6. 렌더링 전략

### 6.1 한자 루비 텍스트
```html
<ruby>農夫<rt>농부</rt></ruby>
```
- 정답 공개 후에만 ruby 노출 (학습 전에는 빈칸)
- 학습자가 한자 위 길게 누르기(long-press) 시 음·뜻 툴팁

### 6.2 빈칸 셀
```html
<span class="blank" data-blank-id="B1" tabindex="0">
  <span class="blank-char">□</span>
  <span class="blank-char">□</span>
</span>
```
- 활성화 시 `aria-current="true"` + 펄스 애니메이션
- 도크에서 형태소 카드 드래그 → drop 영역 ±20dp 자성 스냅

### 6.3 형태소 도크 (모바일 sticky)
```css
.morpheme-dock {
  position: sticky; bottom: 0; left: 0; right: 0;
  height: 96px;                  /* 기본 */
  height: 200px;                 /* 빈칸 활성 시 확장 */
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
}
```

### 6.4 무한 스크롤 / 가상화
힌트 풀이 누적 어휘로 100+ 형태소가 되어도, 보이는 가시영역 + 좌우 1화면 분만 DOM 렌더 (IntersectionObserver).

## 7. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 초기 로드 | 진입 시 학년별 manifest.json만 로드, 지문 본문은 lazy |
| 폰트 | Noto Sans CJK KR을 본 게임 사용 한자만 서브셋 (실제 < 200KB 목표) |
| TTS | speechSynthesis 인스턴스 재사용, voiceschanged 1회 캐싱 |
| 애니메이션 | `transform`/`opacity`만 사용 (compositor layer) |
| IndexedDB | 트랜잭션 batch (페이지 단위 1회 commit) |
| 어원 팝업 | 정답 시점까지 lazy fetch (라우트 prefetch 금지) |
| 가상 스크롤 | 도크 형태소가 50개 이상일 때 활성화 |

## 8. 테스트 전략

### 8.1 수동 테스트 체크리스트

**핵심 루프**
- [ ] 입문 지문 (100자, 빈칸 1) 진입 → 정답 도달 → 어원 팝업 표시
- [ ] 중급 지문 (300자, 빈칸 2) 페이지네이션 → 모든 빈칸 채움 → 다음 지문
- [ ] 심화 지문 (800자, 빈칸 4 + 보스) → 보스 통과 → 7단계 게이트웨이 플래그 set

**오답 / 엣지 케이스**
- [ ] 형태소 카드 드롭 위치 빗나감 (±20dp 밖) → 카드 원위치
- [ ] 정답 형태소 + 디스트랙터 1개 조합 → 부분 정답 피드백
- [ ] 빈칸 활성 상태에서 다른 빈칸 탭 → 컨텍스트 전환
- [ ] 학습한 적 없는 한자가 디스트랙터에 등장 → 알고리즘 버그 (절대 발생 금지)

**모바일 / 반응형**
- [ ] 폰 (375×667) 세로 — 지문 상단 50%, 도크 하단 sticky
- [ ] 폰 (375×667) 가로 — 회전 시 강제 세로 토스트
- [ ] 태블릿 (768×1024) — 좌측 지문 65%, 우측 도크 35% 분할
- [ ] iOS Safari 100dvh — 주소창 변동 시 도크 가려지지 않음
- [ ] Samsung Galaxy Chrome — 한자 폰트 폴백 정상

**접근성 / 가독성**
- [ ] 폰트 크기 16/18/22px 전환 → 빈칸 셀 폭 자동 재계산
- [ ] 다크 모드 — 한자 가독성, 빈칸 색 대비 WCAG AA
- [ ] TTS 미지원 브라우저 → 🔊 버튼 비활성화 + 힌트 툴팁
- [ ] 한자 long-press → 음·뜻 툴팁 (모바일)

**영속화**
- [ ] IndexedDB 정상 저장 후 새로고침 → 진척도 유지
- [ ] private browsing → 메모리 폴백 동작, 게임 자체는 정상
- [ ] localStorage 폰트 / 다크모드 설정 유지
- [ ] 5단계 게임의 한자 마스터 데이터와 스키마 호환 (수동 import 검증)

**7단계 통합**
- [ ] 보스 스테이지 통과 → 7단계 게임에서 해당 사자성어 정답률 향상 (대조군 비교)
- [ ] `idioms.js`가 7단계 `data.js`의 `SAJASUNGO_DATA`를 직접 import 가능

### 8.2 자동화 (추후)
- Vitest + jsdom: `paginateForMobile`, `buildMorphemeDock`, `nextReview` 유닛
- Playwright: S1 / S2 시나리오 E2E (모바일 에뮬레이션)
- Lighthouse: 모바일 PWA 점수 90+ 목표

## 9. 보안

- 사용자 입력은 응용 작문 미션 (P2)에서만 발생 — `textContent` 사용 필수, `innerHTML` 금지
- 지문 / 형태소 / 사자성어는 정적 데이터 → XSS 표면 작음
- IndexedDB 데이터는 학습자 ID(UUID v4)로만 식별, 외부 송신 없음
- 학부모 대시보드 (Future) PIN 잠금 — localStorage 저장 시 SHA-256 해시

## 10. 배포

정적 파일이므로 어디든 호스팅 가능 (1단계 컨벤션):

| 옵션 | 명령 |
|---|---|
| GitHub Pages | `gh-pages` 브랜치 푸시 |
| Netlify | `netlify deploy --dir=.` |
| Vercel | `vercel --prod` |
| Cloudflare Pages | 드래그 앤 드롭 |
| 자체 호스팅 | `npx http-server . -p 4326` |

빌드 단계 불필요 — 루트 디렉터리 그대로 업로드. 서비스워커 도입 시 `sw.js` 캐시 버전 갱신만 주의.

## 11. 홈·설정·완료 화면 디자인 시스템

시작 화면(`start-screen`), 설정 화면, 게임 완료 화면(`end-screen`)은 `1_chosung_quiz` 의 디자인 시스템을 계승한다. 아래 수치는 `1_chosung_quiz/src/css/screens.css` · `components.css` 의 실제 값이다.

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
| 레이아웃 | 수직 중앙 정렬, 카드형 컨테이너 (`start-screen`, `end-screen`) |

> 지문 읽기 화면·대시보드 등 게임 고유 화면은 이 게임 특성에 맞게 확장 가능하다.  
> 시작·설정·완료 화면만 위 규격을 의무 준수한다.
