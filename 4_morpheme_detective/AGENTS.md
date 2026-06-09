<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-05-25 -->

# 4_morpheme_detective — 형태소 탐정 게임

## Status
**M9 한자 풀 100자 + 사건 10건 데이터 레이어 완료** — Vanilla JS + 인라인 SVG + CSS, 빌드 단계 없음. 포트 **4324**. 한자 **100자(한국어문회 7·8급)** / 사건 **10건**(주차장·교실·가족 집·급식실·소방서·자연공원·시장·하늘·거리·숫자) / 어휘 **429개**(자동 생성) / 도감 100칸 + 급수 필터(F15) / F18 10초 미발견 강화 펄스 / PWA Service Worker v8 (auto-gen) / 설정 페이지(TTS·효과음·발광 힌트·글자 크기·다크 모드·진행 초기화) 동작. 자동 생성 스크립트 4종(`gen-hanja-json`·`gen-vocab`·`gen-stage-svg`·`gen-sw` + `gen-all`)으로 데이터 일관성 보장. 잔여 작업: 실 일러스트 10장 손그림 / morph path 정식 자산(Make Me a Hanzi) / 실기기 매트릭스 / Noto Sans CJK 서브셋.

## Purpose
이미 익숙하게 사용하던 한국어 단어 속에 한자(뜻글자)가 형태소로 숨어 있다는 사실을 시각적·서사적으로 깨닫게 하는 게임. 한자를 강제로 암기시키는 대신, 이미지 처리 우뇌와 논리 처리 좌뇌를 동시에 자극하여 형태소적 인식(morphological awareness)을 자연스럽게 형성한다.

## Target & Cognitive Goal

| 항목 | 내용 |
|------|------|
| 대상 연령 | 초등 1 ~ 2학년 |
| 발달 단계 | 형태소 인식 (Morphological Awareness) 진입 |
| 핵심 인지 목표 | 단어의 분해 가능성 인지, 음운(소리) ↔ 형태소(뜻) 통합 |
| 선행 게임 | `../3_word_network/` — 일상 어휘 자동 읽기 |
| 후행 게임 | `../5_vocabulary_tree/` — 형태소 1개 → 다수 어휘 파생 |

## Key Files

| File | Description |
|------|-------------|
| `index.html` | 앱 진입점 — start/stage-select/play/settings/mission/end/collection 화면 포함 |
| `package.json` | `npm run dev` → `npx serve -p 4324`, `npm run validate` (데이터 정합성), `npm run gen-all` (한자 JSON · 어휘 · 스테이지 SVG · SW 일괄 재생성) |
| `manifest.webmanifest` | PWA 매니페스트 (홈 화면 추가, orientation: any) |
| `service-worker.js` | **AUTO-GENERATED** — PWA 오프라인 캐시 v8, App Shell(Cache First) + Google Fonts(SWR). 직접 편집 금지 |

### Generation Scripts (`scripts/`)

| Script | 역할 |
|--------|------|
| `gen-hanja-json.mjs` | `hanja.js` → `src/assets/hanja/{id}.json` 100개 (placeholder 3-step path) |
| `gen-vocab.mjs` | `hanja.js` + `stages.js` → `src/data/vocab.js` (429 어휘 자동 매핑) |
| `gen-stage-svg.mjs` | `stages.js` → `src/assets/stages/{id}.svg` 10장 (grid placeholder) |
| `gen-sw.mjs` | 자산 list 동기화 + cache version bump → `service-worker.js` |
| `gen-icons.mjs` | PWA PNG 아이콘 (sharp) — `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` |
| `validate-data.js` | 한자/어휘/스테이지 교차 검증 (`npm run validate`, 오류 0 / 경고 0 유지) |

### Key JS Modules (`src/js/`)

| Module | 역할 |
|--------|------|
| `config.js` | 순수 상수 (DEV_PORT=4324, MAGNET_DP=40, HIT_MIN_DP=80, MORPH_DURATION, STORAGE_PREFIX=`4md:`) |
| `utils.js` | `clamp` · `dist` · `dprPx` · `clientToViewBox` · `throttle` |
| `state.js` | 전역 상태 (`settings`/`stage`/`detection`/`progress`/`sessionCollected`) |
| `storage.js` | localStorage `4md:` prefix 영속화 (`settings` / `collected` / `stars`) |
| `hangul.js` | 음절 분해 (`0xAC00` 기반, 2단계와 동일) |
| `tts.js` | Web Speech API 래퍼 — `unlock()` / `speakHanja()` / `speak()` / `isAvailable()` |
| `audio.js` | Web Audio API Oscillator 효과음 (발견/변형/보상, 외부 파일 없음) |
| `pointer.js` | Pointer Events 통합 + `setPointerCapture` + `releaseAll()` |
| `magnifier.js` | 돋보기 자석 흡착 (`MAGNET_PX` 이하 hit zone 중심 스냅, `getSnappedHitZone()`) |
| `stage.js` | 일러스트 로드 + hit zone overlay + 클릭 라우팅 4단계 + 발견 콜백 |
| `viewport.js` | 핀치/휠 줌 + 단일 포인터 팬 (1x ~ 3x, 경계 클램프) |
| `morph.js` | SVG path morph — `tokenize`/`lerpTokens`/`crossFadeSequence`/`appendGlyphStage` + 저사양 자동 폴백 |
| `word-block.js` | 단어 → 음절 분리 + `targetSyllableIdx` 하이라이트 |
| `card-deck.js` | 어휘 카드 덱 (5장, familiarity 정렬, 가로=격자/세로=수평 슬라이드) |
| `mission.js` | 종료 미션 카드 — SVG `<text>` 템플릿 + Web Share API + `<a download>` 폴백 |
| `collection.js` | F14 한자 도감 — 8칸 4×2 그리드, 미발견 잠금 표시 |
| `settings.js` | F19 설정 페이지 — TTS/효과음/발광/글자 크기/다크 모드/진행 초기화 |
| `progress.js` | 컬렉션·별 누적 + 세션 진척도 (`4md:` localStorage) |
| `game.js` | 라운드 컨트롤러 — 발견 콜백 → 진행률 → 미션 → 종료 → 도감 진입 |
| `main.js` | 진입점 — `DOMContentLoaded` 에서 `initApp()` + 화면 전환 + TTS unlock |

### Key Data Files (`src/data/`)

| File | 역할 |
|------|------|
| `hanja.js` | 한자 메타 **100자** (한국어문회 7·8급) — `{id, reading, meaning, grade, morphPathsRef, vocab[5]}` |
| `vocab.js` | 어휘 → 한자 매핑 **429개** (`gen-vocab.mjs` 자동 생성) — `{syllableMap: {idx: HanjaId}, familiarity: 1\|2\|3}` |
| `stages.js` | 사건 **10종** — 각 10자, `buildStage()` 헬퍼 + 2행×5열 grid placeholder polygon |

### Key Assets (`src/assets/`)

| Path | 내용 |
|------|------|
| `stages/*.svg` | 사건별 일러스트 **10장** (parking-lot · classroom · family-home · school-cafeteria · fire-station · nature-park · market · sky-time · street · numbers-class). 현재 grid placeholder — 실 손그림은 M9 잔여 |
| `hanja/*.json` | 한자별 3-step morph path **100개** (M+9L+Z=11 토큰, 보간 호환). placeholder — Make Me a Hanzi 실데이터 교체 잔여 |
| `icons/` | PWA 아이콘 — `icon.svg` / `icon-192.png` / `icon-512.png` / `apple-touch-icon.*` |

## Game Mechanics

### 핵심 루프
1. 친숙한 일상 공간 일러스트 제시 (예: 학교 급식실, 지하 주차장, 소방서)
2. 학습자가 '탐정 돋보기' 도구를 들고 화면을 탐색
3. 단어가 적힌 객체(표지판, 간판) 클릭 시 단어가 음절 블록으로 분리
4. 시스템이 핵심 한자를 하이라이트 (예: '주차장' → '차' 강조)
5. **상형문자 변형 애니메이션**: 객체의 실루엣(예: 수레바퀴)이 한자(車)로 점진적 변형
6. 같은 한자를 공유하는 친숙한 어휘 3 ~ 5개 동시 제시 (자동차, 기차, 자전거)

### 한자 풀 (한국어문회 7·8급 100자)
사건 10건 × 10자 = 100자 분배. 8급 50자(기초 한자 — 一二三四五六七八九十, 父母兄弟學校 등) + 7급Ⅱ 50자(생활 한자 — 車場道動方 등). 상세 분배는 `src/data/hanja.js` 사건별 주석 참조.

대표 한자 (모든 사건 공통 학습 사이클):

| 한자 | 음·뜻 | 어휘 예시 | 시각적 변형 소스 |
|------|-------|----------|-----------------|
| 車 | 차 / 수레 | 자동차, 기차, 마차, 주차장 | 수레바퀴 |
| 水 | 수 / 물 | 생수, 수영, 약수, 정수기 | 흐르는 물결 |
| 火 | 화 / 불 | 화산, 화재, 소화기, 불꽃 | 불꽃 |
| 木 | 목 / 나무 | 목요일, 식목일, 목재, 나무 | 가지 달린 나무 |
| 山 | 산 / 산 | 등산, 산악, 산림, 화산 | 세 봉우리 |
| 日 | 일 / 해·날 | 일요일, 생일, 매일, 일출 | 떠오르는 해 |
| 月 | 월 / 달 | 월요일, 월급, 매월, 달력 | 초승달 |
| 人 | 인 / 사람 | 인간, 인기, 외국인, 사람 | 서 있는 사람 |
| 學 | 학 / 배우다 | 학교, 학생, 학년, 입학 | 책상 위 책 |
| 教 | 교 / 가르치다 | 교실, 교사, 교과서, 교육 | 칠판 |

### 부모-자녀 연계 활동
게임 종료 화면에서 "오늘은 'ㅇㅇ' 한자를 발견했어요. 집에 가는 길에 함께 찾아보세요"라는 미션 카드 발급 — 일상 환경으로 학습 전이.

## Mobile-First Considerations

| 항목 | 권장 사양 |
|------|----------|
| 화면 모드 | **가로(Landscape) 우선** — 일러스트의 풍경감 살리기 |
| 권장 디바이스 | 태블릿(8인치+) 권장, 폰은 7"+ 패블릿급 |
| 클릭 가능 객체 | 일러스트 내 최소 **80×80dp** 영역 |

### 모바일에서의 핵심 도전
원본 설계의 "돋보기 탐색"은 좁은 폰 화면에서 hit zone 식별이 어려워짐. 다음과 같이 보완:
- **객체 발광 힌트**: 처음 5초간 클릭 가능 객체가 부드럽게 펄스(opacity 0.6 ↔ 1.0)
- **돋보기 자석**: 손가락 근처 hit zone에 돋보기가 자성처럼 끌림
- **줌 모드**: 폰의 경우 일러스트를 **2x 줌 + 팬(드래그)** 으로 탐색

### 상형문자 변형 애니메이션 — 모바일 성능
- **CSS transform / opacity 전환**으로 GPU 가속 (transform-origin 주의)
- 단계별 PNG 시퀀스보다 **SVG path morph** 우선 — 해상도 자유, 파일 작음
- 저사양 디바이스 감지 시 (`navigator.deviceMemory < 2`) 단순 페이드 폴백

### 한자 폰트 로드
- `font-display: swap` — 한자 폰트(2 ~ 3MB) 로드 동안 시스템 폰트 표시
- 사용 한자만 서브셋 폰트로 추출 (전체 CJK 폰트 임베드 금지)

## For AI Agents

### Working In This Directory
- 런타임 npm 의존성 없음. `package.json` 은 dev 서버 + 데이터 검증 + 아이콘 생성 스크립트만 보유 (`devDependencies: sharp`).
- Vanilla JS + 인라인 SVG + CSS, 빌드 단계 없음. ES Modules 사용 — `file://` 로 열면 CORS 오류, 반드시 `npm run dev` (포트 **4324**).
- 한자 폰트는 현재 시스템 CJK 글리프(`<text>` fallback) 사용 — Noto Sans CJK 서브셋 임베드는 M9 잔여 항목.
- 데이터 추가:
  - 한자: `src/data/hanja.js` + `src/assets/hanja/{id}.json` (3-step path, M+9L+Z 토큰 일치 필수)
  - 어휘: `src/data/vocab.js` (`syllableMap` 인덱스가 HANJA 참조와 정합해야 함)
  - 사건: `src/data/stages.js` + `src/assets/stages/{id}.svg` (viewBox `0 0 1600 900`, polygon 좌표 ≥ 80×80dp)
- 데이터 변경 후 반드시 `npm run validate` (오류 0 / 경고 0 유지) — `scripts/validate-data.js` 가 한자/어휘/스테이지 교차 검증.

### Implementation Status (이미 구현된 항목)
1. **상형문자 변형 애니메이션** ✅ — `morph.js` 좌표 lerp + cross-fade 폴백 + system CJK 글리프 fallback. `isLowEndDevice()` 자동 분기. `hanzi-writer-data` 좌표계 정합.
2. **한자-어휘 매핑 데이터** ✅ — 한자 **100자** × 어휘 평균 4.3개 = **429개** 어휘 (`gen-vocab.mjs` 자동 생성, `familiarity` 정렬)
3. **돋보기 인터랙션** ✅ — `magnifier.js` 자석 흡착(`MAGNET_PX=40·dpr`) + 화면 좌표 기준 일정 거리
4. **일러스트 자산** ✅ — 사건 **10종** SVG (`gen-stage-svg.mjs` grid placeholder, `viewBox 1600×900`) — 실 손그림은 잔여
5. **줌·팬 컨트롤** ✅ — `viewport.js` Pointer Events 기반 핀치/휠 줌(1x~3x) + 단일 포인터 팬, 경계 클램프
6. **F15 도감 급수 필터** ✅ — 전체 / 8급 / 7급Ⅱ 칩, `4md:collectionFilter` localStorage 영속
7. **F18 강화 펄스** ✅ — 10초 미발견 시 미발견 hit zone 에 `.pulse-strong` (코랄 톤 + drop-shadow + 0.9s 주기), 설정 발광 힌트 OFF 시 비활성
8. **PWA 자동 생성** ✅ — `gen-sw.mjs` 가 자산 list 동기화 + cache version bump → SW v8

### 잔여 작업 (PLAN.md M9 P1 참조)
- [ ] 실 일러스트 10장 손그림 (현재 grid placeholder)
- [ ] Make Me a Hanzi(GPL) 실 morph path 데이터로 100개 placeholder 교체
- [ ] Noto Sans CJK 서브셋 woff2 < 200KB (`pyftsubset` 운영 스크립트, 사용 한자 100자 한정)
- [ ] 실기기 매트릭스 (iPad Mini / iPad Pro / 갤럭시 탭 A8 / iPhone SE / 보급형 안드로이드)

### Key Behaviors to Preserve
- **한자 자체의 암기를 강요하지 않음** — 게임 내 한자 쓰기 입력 절대 금지 (PRD §7 정책)
- 학습자가 **이미 아는 단어**에서 시작 — 새 단어로 한자 노출하지 않음 (PRD §7 정책)
- 한자의 음·뜻은 부드러운 TTS로 함께 제공 (시각만으로 부족) — `speakHanja({reading, meaning})`
- 화면 전환 시 `pointer.releaseAll()` + `tts.cancel()` + `audio.stopAll()` + `cancelMorph()` + `detachMagnifier()` + `clearCards()` 일괄 정리
- 클릭 라우팅 4단계 (`stage.js`): `closest('.hit-zone')` → polygon point-in → magnifier snap → nearest fallback. 리스너는 `#stage-canvas` div 에 등록 (letterbox/transform 무관)
- 한자 morph 마지막 단계는 system CJK 글리프 `<text>` fallback 으로 양보 (`intermediatePaths = morphPaths.slice(0, -1)`)

### Testing Requirements
- 데이터 회귀 가드: `npm run validate` 오류 0 / 경고 0 유지
- 한자에 대한 거부감 없이 게임 플레이가 자연스러운지 사용자 테스트 (만 7 ~ 8세, 부정 반응 < 10%)
- SVG 변형 애니메이션이 모바일에서 부드럽게 재생되는지 검증 (보급형 안드로이드 30fps+ 목표)
- 폰(5.5") / 태블릿(10") 양쪽에서 객체 식별성 검증 — 줌·팬 동작 포함

## Dependencies

### Runtime
- 외부 npm 의존성 **없음** — 모든 인터랙션은 표준 Web API 직접 사용 (Pointer Events / Web Speech / Web Audio / Service Worker)
- 한자 폰트는 현재 시스템 CJK 글리프 사용 — Noto Sans CJK Korean 서브셋(< 200KB) 임베드는 잔여

### Dev
- `npx serve` — 정적 파일 서버 (포트 4324)
- `sharp` (devDependency) — PWA PNG 아이콘 생성 (`npm run gen-icons`)
- `hanzi-writer-data` (devDependency) — 한자 path 좌표계 참조 (`gen-hanja-json.mjs`, morph cross-fade viewBox 정합)
- `pyftsubset` (외부, 운영 스크립트) — 한자 폰트 서브셋 추출 (잔여)

### Data
- 한자 메타 **100자** (한국어문회 7·8급) + Make Me a Hanzi(GPL) 실 path 교체 잔여
- 사건 **10종** 일러스트 SVG (grid placeholder, 실 손그림 잔여)

## Design Consistency (홈·설정·완료 화면)

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 미션 완료 화면(`mission-screen`)은 `1_chosung_quiz`의 디자인 시스템을 계승한다.

| 요소 | 규격 |
|------|------|
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 버튼 기본 (`.btn`) | `font-family: 'Jua', sans-serif; font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 색상 변수 | `1_chosung_quiz/src/css/tokens.css` 팔레트 동일 적용 |

> 플레이 화면(가로 일러스트·돋보기 인터랙션)은 이 게임 특유의 방식을 사용.  
> 상세 스펙: `docs/TRD.md §11` 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.

## Theoretical Reference
- 보고서 §"제3단계: 형태소 탐정 게임" 참조
- 우뇌 이미지 처리 + 좌뇌 논리 처리의 양뇌 활성화 (만 6세 전후가 적기)
- 표준국어대사전 어휘의 70%+가 한자어 — 형태소 인식이 학습 어휘 폭발의 키

<!-- MANUAL: -->
