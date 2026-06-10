> [!IMPORTANT]
> **이 저장소는 [`hangul_game`](https://github.com/littleanti/hangul_game) 모노레포로 통합되었습니다.**
> 앞으로 모든 개발·유지보수는 모노레포에서 진행되며, 이 저장소는 보관(archive)용입니다.
> 🎮 통합 플레이 사이트: https://littleanti.github.io/hangul_game/

# 🔍 형태소 탐정 (Morpheme Detective)

익숙한 한국어 단어 속에 형태소로 숨어 있는 한자(뜻글자)를 일상 공간 일러스트에서 시각적으로 발견하는 모바일 우선 학습 웹앱입니다.

![version](https://img.shields.io/badge/version-0.9.0-FF7757)
![license](https://img.shields.io/badge/license-MIT-6BCAB8)
![hanja](https://img.shields.io/badge/한자-100자-FFD166)
![stages](https://img.shields.io/badge/사건-10건-6BCAB8)

## 🎮 주요 기능

- **🕵️ 사건 10건**: 주차장 · 교실 · 가족 집 · 급식실 · 소방서 · 자연공원 · 시장 · 하늘 · 거리 · 숫자 — 각 사건당 한자 10자
- **🈯 한자 100자**: 한국어문회 **7·8급 100자**(8급 50 + 7급Ⅱ 50) 전체 데이터
- **📚 어휘 429개**: 한자 ↔ 어휘 매핑 자동 생성 (`familiarity` 1·2·3 정렬)
- **🔦 돋보기 인터랙션**: 손가락/마우스에 자석처럼 끌리는 돋보기 (`MAGNET_PX = 40·dpr`)
- **✨ 객체 발광 힌트**: 첫 5초간 클릭 가능 객체 펄스 (`opacity 0.6 ↔ 1.0`)
- **⚡ F18 강화 펄스**: 10초간 새 발견 없으면 미발견 객체에 코랄 톤 강화 펄스
- **🧩 단어 → 음절 분리**: 객체 탭 → 좌→우 음절 블록 + 핵심 한자 음절 하이라이트
- **🐉 상형문자 변형**: 객체 실루엣 → 갑골문 → 해서체 SVG path morph (좌표 lerp + cross-fade 폴백 + system CJK 글리프 fallback)
- **🃏 어휘 카드 5장**: 같은 한자를 공유하는 친숙 어휘 + 탭 시 발음 + **탭 시 위 음절 블록을 그 단어로 갱신**
- **🔍 줌·팬 (1x~3x)**: Pointer Events 기반 핀치/휠 줌 + 단일 포인터 드래그 팬, 경계 클램프
- **📚 도감 100칸**: 발견한 한자 누적 + **급수 필터**(전체 / 8급 / 7급Ⅱ), 5/8/10열 반응형
- **🎴 미션 카드**: 종료 시 "오늘은 'X' 한자를 발견했어요" — Web Share API + `<a download>` 폴백
- **🔊 TTS 자동 발음**: Web Speech API ko-KR — 한자 노출 시 "차, 수레 차" 자동 음성
- **🎵 효과음**: Web Audio API Oscillator (발견 / 변형 / 보상, 외부 파일 없음)
- **⚙️ 설정 화면**: TTS · 효과음 · 발광 힌트 · 글자 크기 · 다크 모드 · 진행 초기화
- **📱 가로/세로 모드**: 가로 풍경 / 세로 70-30 letterbox, 회전 안내 없음
- **💾 진척도 영속화**: `4md:` prefix localStorage (`settings`/`collected`/`stars`/`collectionFilter`)
- **📦 PWA**: Service Worker v8 (auto-gen) — App Shell(Cache First) + Google Fonts(SWR), 홈 화면 추가

## 🚀 빠른 시작

### 1. 로컬 개발 서버 실행

ES Modules를 사용하므로 `file://`로 열면 CORS 오류가 납니다. 반드시 로컬 서버로 실행해주세요.

**방법 1: npm script (권장)**
```bash
npm run dev
# → http://localhost:4324
```

**방법 2: VSCode Live Server 확장**
1. VSCode에서 Live Server 확장 설치
2. `index.html` 우클릭 → "Open with Live Server"

**방법 3: Python 기본 서버**
```bash
python3 -m http.server 4324
```

### 2. 브라우저에서 열기

- `http://localhost:4324`

### 3. 게임 시작

1. 시작 화면에서 **🔍 탐정 시작** 큰 버튼을 탭합니다 (TTS·AudioContext 활성화 게이트)
2. **사건 선택 화면**에서 10건 중 하나를 선택합니다
   - 🅿️ 주차장 — 車·場·道·動·力·立·方·自·全·工
   - 🏫 교실 — 教·校·學·生·室·先·父·母·兄·弟
   - 🏠 가족 집 — 家·人·父·母·女·男·子·寸·孝·姓
   - 🍽 급식실 — 食·物·手·活·氣·農·心·小·大·名
   - 🚒 소방서 — 火·水·安·全·後·中·上·下·内·外
   - 🌳 자연공원 — 山·川·土·林·花·草·靑·白·空·氣
   - 🛒 시장 — 市·場·物·金·門·答·問·正·全·一
   - 🌅 하늘 — 日·月·年·時·東·西·南·北·前·後
   - 🚸 거리 — 道·車·人·場·動·軍·王·主·民·韓
   - 🔢 숫자 — 一·二·三·四·五·六·七·八·九·十
3. 일러스트에서 발광·강화 펄스가 보이는 객체를 탭합니다
4. 단어가 음절로 분리되고 핵심 한자가 하이라이트 + TTS "X, 뜻 X"
5. 객체 실루엣이 한자로 변형되고, 같은 한자 공유 어휘 카드 5장이 등장합니다
6. 카드를 탭하면 발음 + 위 음절 블록이 그 단어로 갱신 (같은 한자가 다른 단어 어느 음절에 위치하는지 시각 비교)
7. 사건 종료 → 미션 카드 발급 → 도감에 발견 한자 누적

## 📁 프로젝트 구조

```
morpheme-detective/
├── index.html                  # 진입 HTML (start/stage-select/play/settings/mission/end/collection)
├── package.json                # 개발 서버 + 데이터 생성 스크립트
├── manifest.webmanifest        # PWA 매니페스트
├── service-worker.js           # AUTO-GENERATED — PWA 오프라인 캐시 v8
├── README.md                   # 이 파일
├── AGENTS.md
├── docs/                       # 기획 문서
│   ├── AGENTS.md
│   ├── PRD.md                  #   제품 요구사항
│   ├── TRD.md                  #   기술 요구사항 (SVG morph, 클릭 라우팅, TTS)
│   └── PLAN.md                 #   개발 계획 (M0 ~ M10)
├── scripts/                    # 데이터·자산 자동 생성
│   ├── gen-hanja-json.mjs      #   hanja.js → src/assets/hanja/*.json 100개
│   ├── gen-vocab.mjs           #   hanja.js + stages.js → src/data/vocab.js (429어휘)
│   ├── gen-stage-svg.mjs       #   stages.js → src/assets/stages/*.svg 10장 (grid placeholder)
│   ├── gen-sw.mjs              #   자산 list 동기화 + cache version bump → service-worker.js
│   ├── gen-icons.mjs           #   PWA PNG 아이콘 (sharp)
│   └── validate-data.js        #   한자/어휘/스테이지 교차 검증 (`npm run validate`)
└── src/
    ├── css/                    # 스타일
    │   ├── tokens.css          #   디자인 토큰 (변수)
    │   ├── base.css            #   리셋 + 100dvh + 다크 모드
    │   ├── components.css      #   재사용 컴포넌트
    │   ├── screens.css         #   화면별 스타일
    │   ├── stage.css           #   일러스트 캔버스, hit zone, 펄스
    │   ├── magnifier.css       #   돋보기 자석
    │   ├── word-blocks.css     #   음절 분리·하이라이트
    │   ├── morph.css           #   SVG path morph 컨테이너
    │   └── card-deck.css       #   어휘 카드 (가로=격자, 세로=수평 슬라이드)
    ├── data/
    │   ├── hanja.js            # 🈯 한자 100자 (한국어문회 7·8급, 여기 편집!)
    │   ├── vocab.js            # 📚 어휘 429개 (AUTO-GENERATED)
    │   └── stages.js           # 🗺 사건 10건 메타 (여기 편집!)
    ├── assets/
    │   ├── stages/             #   사건별 SVG 일러스트 10장 (grid placeholder)
    │   ├── hanja/              #   한자별 3-step morph path JSON 100개
    │   └── icons/              #   PWA 아이콘
    └── js/                     # 로직 모듈
        ├── main.js             #   진입점 + 이벤트 바인딩 + TTS unlock
        ├── config.js           #   상수 (DEV_PORT=4324, MAGNET_DP=40, HIT_MIN_DP=80, STORAGE_PREFIX='4md:')
        ├── state.js            #   전역 상태 (settings/stage/detection/progress/sessionCollected)
        ├── storage.js          #   localStorage 4md: prefix
        ├── utils.js            #   clamp/dist/dprPx/clientToViewBox/throttle
        ├── hangul.js           #   음절 분해 (0xAC00 기반, 2단계와 동일)
        ├── tts.js              #   Web Speech API 래퍼 (unlock/speakHanja/speak/isAvailable)
        ├── audio.js            #   Web Audio Oscillator 효과음
        ├── pointer.js          #   Pointer Events 통합 + releaseAll()
        ├── magnifier.js        #   돋보기 자석 흡착
        ├── stage.js            #   일러스트 로드 + hit zone overlay + 클릭 라우팅 4단계
        ├── viewport.js         #   핀치/휠 줌 + 단일 포인터 팬 (1x~3x)
        ├── morph.js            #   SVG path morph (lerp + cross-fade + 글리프 fallback)
        ├── word-block.js       #   단어 → 음절 분리
        ├── card-deck.js        #   어휘 카드 덱 (familiarity 정렬)
        ├── mission.js          #   종료 미션 카드 + Web Share API
        ├── collection.js       #   F14 도감 100칸 + F15 급수 필터
        ├── settings.js         #   F19 설정 페이지
        ├── progress.js         #   컬렉션·별 누적
        └── game.js             #   라운드 컨트롤러 (발견 → 진행률 → 미션 → 종료 → 도감)
```

## 📚 한자·어휘·사건 추가하기

### 한자 추가 — `src/data/hanja.js`

```js
'家': make('家', '가', '집', 7, ['가족', '국가', '가구', '가정', '농가']),
//        ↑    ↑     ↑    ↑   ↑
//        id   음    뜻   급  같은 한자 공유 어휘 4~5개
```

### 사건 추가 — `src/data/stages.js`

```js
'family-home': buildStage(
  {
    id:              'family-home',
    name:            '🏠 가족 집',
    description:     '집에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/family-home.svg',
    hanjaIds:        ['家', '人', '父', '母', '女', '男', '子', '寸', '孝', '姓'],
  },
  [
    { word: '가족', hanjaId: '家', syllableIdx: 0, label: '집 외관' },
    // ... 총 10개 객체 (gridPoly()가 2행×5열로 균등 분배)
  ]
)
```

### 어휘 자동 매핑

`vocab.js` 는 **자동 생성**됩니다. `hanja.js` / `stages.js` 수정 후:

```bash
npm run gen-vocab            # 어휘만 재생성
npm run gen-all              # 한자 JSON · 어휘 · 스테이지 SVG · SW 한번에 재생성
npm run validate             # 정합성 검증 (오류 0 / 경고 0 유지)
```

`familiarity` 는 자동으로 1·2·3 단계 배정되며 카드 등장 순서로 쓰입니다.

## 🔧 아키텍처

### 화면 상태 머신
```
start ──→ stage-select ──→ play ──→ mission ──→ end
  │              │           ↑   ↓               │
  ↓              ↓           │   │               ↓
settings ─────────────── (다음 사건 / 다시하기)
  │                                              │
  └──────────→ collection ←──────────────────────┘
```
전이 시 일괄 정리: `pointer.releaseAll()` + `tts.cancel()` + `audio.stopAll()` + `cancelMorph()` + `detachMagnifier()` + `clearCards()`

### 핵심 데이터 흐름
```
STAGES + HANJA + VOCAB (data/)
  ↓ 사건 선택
state.stage.currentStageId
  ↓
stage.load() → fetch(SVG) → hit zone overlay 삽입
  ↓ 객체 탭
클릭 라우팅 4단계 → onHit({wordId, label})
  ↓
showWord() → 음절 분리 + targetSyllableIdx 하이라이트
  ↓
speakHanja({reading, meaning})        # TTS "차, 수레 차"
  +
triggerMorph(hanjaId) → loadHanjaPaths → runMorph
  ↓ morph 완료
showCardDeck(hanjaId) → familiarity 순 카드 5장 등장
  ↓ 카드 탭
speak(word) + _updateWordBlockForCard(word)   # 위 음절 블록 단어 갱신
  ↓ 사건 모든 한자 발견
recordDiscovery → game.onComplete → mission → end → collection
```

### SVG path morph 알고리즘

```js
// 1차: 토큰 단위 좌표 보간
const fromTokens = tokenize(fromD);   // [{cmd:'M', args:[100,200]}, ...]
const toTokens   = tokenize(toD);
if (isInterpolatable(fromTokens, toTokens)) {
  // 명령 시퀀스·인자 개수 1:1 매칭 시 lerp
  pathEl.setAttribute('d', serialize(lerpTokens(from, to, easeInOutCubic(t))));
}

// 2차: 폴백 — 토큰 미스매치 또는 저사양 디바이스
//   isLowEndDevice = navigator.deviceMemory < 2 || hardwareConcurrency < 4
crossFadeSequence(container, paths, dur);   // .morph-stage.active opacity 시퀀싱

// 3차: 마지막 단계는 system CJK 글리프 <text> fallback
appendGlyphStage(container, hanjaId) → revealGlyphStage(opacity 0→1)
```

### 클릭 라우팅 4단계 (`stage.js`)

리스너는 inner `<svg>` 가 아니라 **`#stage-canvas` (div)** 에 등록. letterbox 여백 / `viewport.js` transform / SVG 내부 자식 등 어떤 환경에서도 hit 보장.

```
1. e.target.closest('.hit-zone')                — 가장 정확
2. findHitZoneByPoint(getScreenCTM().inverse()) — SVG 좌표로 변환 + polygon ray-casting
3. magnifier.getSnappedHitZone()                — 이미 자석 흡착한 zone
4. nearestHitZoneFromPoint(MAGNET_PX * 3)       — 최후 거리 폴백
```

### 한글 음절 분해 원리 (`hangul.js`)

한글 유니코드 범위: `가(0xAC00) ~ 힣(0xD7A3)` — 588 = 21(중성) × 28(종성)

```js
function decompose(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  return {
    cho:  Math.floor(code / 588),
    jung: Math.floor((code % 588) / 28),
    jong: code % 28,
  };
}
splitWord('주차장') // → ['주', '차', '장']
```

본 게임에서는 **분해보다 표시**가 핵심 — 음절 단위 시각 분리 후 핵심 한자 음절만 `class="hl"` + 살짝 확대(`scale(1.08)`).

## 🎨 디자인 시스템

색상은 `src/css/tokens.css`에서 CSS 변수로 관리됩니다. `1_chosung_quiz`의 디자인 시스템을 계승합니다.

| 용도 | 변수 | 색상 |
|---|---|---|
| 배경 | `--cream` | `#FFF6E4` |
| 주요 강조 | `--coral` | `#FF7757` |
| 성공/진행 | `--mint` | `#6BCAB8` |
| 경고/하이라이트 | `--yellow` | `#FFD166` |
| 오답 | `--red` | `#E84545` |
| 텍스트 | `--navy` | `#2D3047` |

폰트: `Jua` (제목·버튼), `Gowun Dodum` (본문)
다크 모드: `body[data-theme='dark']` CSS 변수 오버라이드 (설정에서 토글)
글자 크기: `body[data-font]` 0.9 / 1.0 / 1.15 전역 적용

## 🌐 브라우저 호환성

| 기능 | 요구사항 |
|---|---|
| ES Modules | Chrome 61+, Firefox 60+, Safari 11+ |
| Pointer Events API | Chrome 55+, Firefox 59+, Safari 13+ |
| SVG path morph | 모든 현대 브라우저 (저사양 시 cross-fade 자동 폴백) |
| Web Speech API (TTS) | Chrome, Safari, Edge (Firefox는 음성 제한적, 미설치 시 자막 폴백) |
| Web Audio API (효과음) | Chrome, Firefox, Safari, Edge |
| Service Worker (PWA) | 모든 현대 브라우저 |
| Web Share API (미션 카드) | iOS Safari, Chrome Android (미지원 시 `<a download>` 폴백) |
| localStorage | 모든 현대 브라우저 (Private Mode 폴백 포함) |

TTS 미지원 환경은 `.tts-unavail` 클래스 + 🔇 힌트로 자동 안내됩니다. 가로/세로 모드는 `@media (orientation)` 분기로 자동 전환.

## 🛠 확장 아이디어 (M10 로드맵)

- **IndexedDB SRL**: 발견 한자별 재노출 스케줄 (에빙하우스 곡선)
- **5단계 연동**: `4md:collected` → `5_vocabulary_tree` 학습 큐 자동 전달
- **부모 대시보드(웹)**: 발견 한자 · 취약 한자 · 세션 시간 시각화
- **발음 평가**: Web Speech API + Levenshtein 거리 → 어휘 카드 따라 읽기 채점
- **사용자 기여 어휘**: 부모/교사가 추가 어휘 등록 (JSON import)
- **상형 추리 모드**: 한자 → 실루엣 역방향 추리 (보상 연계)
- **클래스룸 모드**: 교사 PC에서 학생 태블릿 진척도 LAN 미러링

## 📄 라이선스

MIT
