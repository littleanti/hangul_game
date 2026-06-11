# PLAN — 합성어 쪼개기 (5_compound_split)

> 구현 계획서
> Last updated: 2026-06-11
> **현재 상태: 구현 완료 (M0~M5 전 마일스톤 종료)**

---

## 현황 요약

| 항목 | 상태 |
|---|---|
| PRD | 완료 (`docs/PRD.md`) |
| TRD | 완료 (`docs/TRD.md`) |
| PLAN | 완료 (본 문서) |
| 구현 (HTML/CSS/JS) | **구현 완료** (M0~M5 — QA 포함) |
| 자산 (조각 그림·TTS) | 완료 — 이모지 방식 확정(R1 조치, 신규 그림 파일 불필요) + Web Speech API TTS |

---

## 마일스톤 개요

| 마일스톤 | 범위 | 선행 조건 |
|---|---|---|
| M0 | 디자인 시스템 스캐폴딩 — 공용 화면 이식 | 없음 |
| M1 | 콘텐츠 데이터 — words.js + 신규 자산 목록 확정 | M0 |
| M2 | 게임 플레이 로직 — 탭 검출·피드백·팝업 | M1 |
| M3 | 3단 페이딩 / 난이도 제어 | M2 |
| M4 | PWA + 리더보드 | M2 |
| M5 | QA — 수동 체크리스트 + 시리즈 연속성 검증 | M3, M4 |

---

## M0 — 디자인 시스템 스캐폴딩

> 목표: 공용 화면(홈/설정/리더보드/완료)이 1_chosung_quiz와 픽셀 단위로 일치하는 껍데기를 먼저 완성한다.

### 디렉터리 초기화

- [ ] `5_compound_split/` 루트 파일 생성: `index.html`, `manifest.json`, `sw.js`
- [ ] `src/css/` 디렉터리 생성 및 파일 스캐폴딩: `tokens.css`, `base.css`, `components.css`, `screens.css`, `game.css`
- [ ] `src/data/` 디렉터리 생성: `words.js` 플레이스홀더
- [ ] `src/js/` 디렉터리 생성 및 파일 스캐폴딩: `main.js`, `config.js`, `state.js`, `storage.js`, `utils.js`, `tts.js`, `sound.js`, `ui.js`, `settings.js`, `leaderboard.js`, `game.js`
- [ ] `icons/` 디렉터리: `icon-192.png`, `icon-512.png` 플레이스홀더

### CSS 이식 — 공용 토큰·컴포넌트

- [ ] `1_chosung_quiz/src/css/tokens.css` → `src/css/tokens.css` 복사 (내용 무수정)
- [ ] `1_chosung_quiz/src/css/components.css` → `src/css/components.css` 복사 (내용 무수정)
- [ ] `1_chosung_quiz/src/css/screens.css` 공용 섹션(start/settings/leaderboard/end) 발췌 → `src/css/screens.css` 복사 (play-screen 섹션 제외)
- [ ] `src/css/base.css` 신규 작성: body 리셋, `min-height: 100dvh`, `background: var(--cream)`, `font-family: 'Gowun Dodum'`, `max-width: 480px` 컨테이너
- [ ] `src/css/game.css` 빈 파일 생성 (M2에서 채움)

### index.html 기반 구조

- [ ] `<head>` Google Fonts `<link>` 삽입: Jua + Gowun Dodum (`preconnect` 포함)
- [ ] CSS 로드 순서 준수: `tokens.css` → `base.css` → `components.css` → `screens.css` → `game.css`
- [ ] 4개 공용 화면 HTML 마크업 작성: `#start-screen`, `#settings-screen`, `#leaderboard-screen`, `#end-screen`
- [ ] 게임 플레이 화면 HTML 마크업 스캐폴딩: `#game-screen` (M2에서 내용 채움)
- [ ] 초기 화면 표시: `#start-screen`만 `display: flex`, 나머지 `display: none`

### 공용 화면 JS 기반

- [ ] `config.js`: `STORAGE_PREFIX = 'compound_split_'`, `CACHE_VERSION = '5_compound_split-v1'`, `DEFAULT_QUESTION_COUNT = 6`, `DEFAULT_FADING_LEVEL = 1` 상수 정의
- [ ] `ui.js`: `goTo(screenName)` 화면 전환 함수 구현 (`cancelSpeech()` + 팝업 해제 포함)
- [ ] `storage.js`: `loadData(key, defaultValue)` / `saveData(key, value)` — `try/catch` 포함 localStorage 래퍼
- [ ] `settings.js`: 설정 화면 렌더링 (`renderSettings()`) — 문항 수(6·12·18), TTS·효과음 토글, 페이딩 레벨 선택
- [ ] `leaderboard.js`: 리더보드 화면 렌더링 (`renderLeaderboard()`) — 세션 기록 목록, 빈 상태 메시지
- [ ] `main.js`: 모든 공개 함수 `window.*` 노출, SW 등록 (`'./sw.js'`)

---

## M1 — 콘텐츠 데이터

> 목표: 도입 세트 6개 데이터 확정 및 words.js 완성. 신규 자산 목록 정직 등재.

### 데이터 스키마 구현

- [ ] `src/data/words.js`: `CompoundWord` 타입 JSDoc 작성 (TRD §3.1 스키마 그대로)
- [ ] `WORDS` 배열: 6개 항목 완전 작성

| id | word | part1 | part2 | sharedMorpheme |
|---|---|---|---|---|
| `raindrop` | 빗방울 | 비(빗) | 방울 | 방울 |
| `pinecone` | 솔방울 | 솔 | 방울 | 방울 |
| `starlight` | 별빛 | 별 | 빛 | 빛 |
| `moonlight` | 달빛 | 달 | 빛 | 빛 |
| `flower` | 꽃송이 | 꽃 | 송이 | 송이 |
| `snowflake` | 눈송이 | 눈 | 송이 | 송이 |

- [ ] `wrongSplits` 배열: 각 항목별 오답 분절 2~3종 정의 (TRD §3.1 형식)
- [ ] `SHARED_MORPHEME_PAIRS` 메타 객체: `방울/빛/송이` 페어링 정의
- [ ] `category` 필드: Stage 3 씬 ID(`rain_raindrop`, `mountain_pinecone`, `night_star`, `night_moon`, `meadow_flower`, `winter_snowflake`) 그대로 매핑

### 신규 자산 목록 확정 (구현 전 결정 필요)

- [ ] **조각 단위 그림 자산 방식 결정**: 이모지 우선 + `part1ImageUrl`/`part2ImageUrl` 선택적 추가 방식 확정
  - 이모지 후보 목록: 비🌧️ 방울💧 솔🌲 별⭐ 빛✨ 달🌙 꽃🌸 송이❄️ 눈❄️
  - 일러스트 의뢰 시 최소 단위: 9개 조각 × 2종(일러스트/이모지 폴백) = 최대 9개 신규 파일
- [ ] `sceneEmoji` 필드: Stage 3 씬 이모지 재사용 가능 목록 확인 (4_word_network/src/data/words.js 참조)
- [ ] `part1Meaning` / `part2Meaning` 뜻 라벨 문안 확정 (유아 친화 2~4자 이내)

---

## M2 — 게임 플레이 로직

> 목표: 핵심 루프(카드 표시 → 탭 검출 → 피드백 → 팝업 → 다음 카드) 완전 동작.

### 상태·유틸

- [ ] `state.js`: `state` 싱글톤 초기화 (TRD §3.2 스키마 — `settings`, `game`, `session` 세 블록)
- [ ] `utils.js`: `shuffle(arr)` Fisher-Yates 구현
- [ ] `tts.js`: Web Speech API 래퍼 — `speak(text)`, `cancelSpeech()`, `voiceschanged` 비동기 대기, `ko-KR` 우선 선택, 미지원 graceful fallback
- [ ] `sound.js`: Web Audio API 오실레이터 — `playCorrect()` (정답 톤), `playError()` (오류 톤)

### 출제 큐 구성

- [ ] `game.js` — `buildQueue(words, questionCount)`: 셔플 + 반복 채움 (TRD §5.5 알고리즘)
- [ ] `state.js` — `startGame()` 호출 시 큐 초기화 + 세션 타임스탬프 기록

### 카드 렌더링 (L1 고정, 페이딩은 M3)

- [ ] `game.js` — `renderCard(word)`: `.compound-card` 생성, 합성어 텍스트 표시, TTS 자동 재생
- [ ] `src/css/game.css` — `.compound-card` 스타일: `min-height: 120px`, `border-radius: 32px`, `font-family: 'Jua'`, 대형 텍스트
- [ ] 진행 인디케이터 `N / M` 렌더링 (`font-family: 'Jua'`)

### 탭 히트 검출 — 분절 판정

- [ ] `game.js` — `onCardTap(tapX, tapY, card)`: `splitBoundaryOffset` 계산 + tolerance 28px 판정 (TRD §5.1 알고리즘)
- [ ] `touchstart` / `touchend` 이벤트: 이동 거리 < 10px → 탭, ≥ 10px + 수평 → 드래그 히트, 수직 → 스크롤 허용 (TRD §6.2)
- [ ] `mouse` 이벤트도 동일 로직 (데스크톱 테스트 지원)

### 정답 처리 — 팝업 흐름

- [ ] `game.js` — `triggerCorrectSplit(word)`: 카드 분리 애니메이션(`transform` only, < 100ms 시작) + `playCorrect()` + TTS 시퀀스(전체→part1→part2)
- [ ] `game.js` — `showSplitPopup(word)`: `.split-popup` 오버레이 표시, 조각 그림 2장 + 뜻 라벨, 팝업 오픈 타임스탬프 기록
- [ ] `src/css/game.css` — `.split-popup` / `.popup-piece` 스타일: `role="dialog"`, `aria-label` 부착
- [ ] 팝업 닫기: 팝업 탭 또는 "다음" 버튼 탭 → 체류 시간 누산 → 다음 카드 또는 end-screen

### 오답 처리

- [ ] `game.js` — `tryWrongSplit()`: 오류 카운트++ + `.shake` 애니메이션 + `.error-message` 표시(1500ms 후 자동 숨김) + `playError()` (TRD §5.2)
- [ ] `src/css/game.css` — `.error-message`: `var(--red)` 배경, `.shake` 키프레임 애니메이션
- [ ] 오답 후 카드 원위치 복귀 확인

### 완료 흐름

- [ ] 전체 큐 소진 → `goTo('end-screen')`: 정답 수·오류 수·소요 시간 표시, 격려 메시지
- [ ] `end-screen` 버튼: "다시 하기"(`startGame()`) / "홈으로"(`goTo('start-screen')`)

---

## M3 — 3단 페이딩 / 난이도 제어

> **[2026-06-11 변경] 3단→2모드 축소**
> 아래 체크리스트는 구현 당시(3단 페이딩) 이력으로 보존한다. **현행 설계는 2모드**다:
> - **연습하기** (fadingLevel 2, 구 L2 그대로): 점선 경계(`boundary-dashed`) + 첫 번째 조각 그림 힌트만
> - **도전하기** (fadingLevel 3, 구 L3 그대로): 경계 표시 없음(`boundary-hidden`) + 단서 없음, 뜻은 정답 팝업에서만 공개
>
> L1(실선+양쪽 단서)은 제거 — L1·L2 모두 경계 위치가 보여 비계가 중복되고, L1은 정답이 사실상 주어져 학습 과제가 없는 과잉 비계(2_vowel_finder 비계 3→2단 축소 선례와 일치). 기술 결정: `DEFAULT_FADING_LEVEL = 2`, 레거시 `fadingLevel === 1`(또는 무효값)은 로드 시 2로 마이그레이션, 리더보드 과거 기록은 표시 시 1·2→"연습하기"/3→"도전하기" 레이블 매핑, `boundary-solid` 클래스·L1 전용 분기 삭제, 시작/설정 화면 칩 3개→2개("1단계/2단계/3단계"·"실선" 표현은 UI·aria-label에서 제거), `AUTO_ADVANCE_STREAK` 자동 승급은 2→3 단 한 번만. 상세는 PRD §5·TRD §3.2/§5.3 참조.

> 목표(구현 당시): 경계 가시성·뜻 단서량만 조절하는 3단 페이딩 완전 구현. 입력·화면·어휘는 레벨 간 불변.

### CSS 경계 클래스

- [ ] `src/css/game.css` — `.boundary-solid`: `border-left: 3px solid var(--navy)` (L1)
- [ ] `src/css/game.css` — `.boundary-dashed`: `border-left: 3px dashed var(--coral)` (L2)
- [ ] `src/css/game.css` — `.boundary-hidden`: 선 없음 — 클래스만 차별화 (L3)

### 페이딩 렌더링 로직

- [ ] `game.js` — `renderCard(word, fadingLevel)`: 레벨별 경계 클래스 토글 (TRD §5.3 알고리즘)
- [ ] L1: 조각 양쪽 그림 + 뜻 라벨 모두 표시 (`showBothPartHints`)
- [ ] L2: 첫 번째 조각 그림만 표시 (`showPart1HintOnly`)
- [ ] L3: 그림 단서 없음 (`hideAllHints`), 정답 후 팝업에서만 뜻 공개

### 페이딩 레벨 선택 UI

- [ ] `start-screen`: 페이딩 레벨 선택 버튼 3개 (L1·L2·L3) — `.btn` 또는 `.btn.small` 규격, 선택된 레벨 시각 강조
- [ ] `settings-screen`: 페이딩 레벨 변경 가능 (설정 화면에서도 접근)
- [ ] `state.settings.fadingLevel` → `storage.saveData()` 영속화

### L3 승급 조건 (오픈 이슈 해소 후 구현)

- [ ] PRD 오픈 이슈 확정 후: 자동 승급(연속 정답 N회) vs 수동 선택 분기 구현
- [ ] `config.js` — `AUTO_ADVANCE_STREAK` 상수(플래그 ON/OFF 가능)

---

## M4 — PWA + 리더보드

> 목표: 오프라인 동작 + 학습 기록 영속화 완성.

### PWA 매니페스트

- [ ] `manifest.json` 완성: `start_url: './'`, `scope: './'`, `background_color: '#FFF6E4'`, `theme_color: '#FF7757'`, `orientation: 'portrait'` (TRD §7.1)
- [ ] `icons/icon-192.png` / `icon-512.png` 실제 아이콘 파일 준비
- [ ] `index.html` `<link rel="manifest" href="./manifest.json">` 삽입

### Service Worker

- [ ] `sw.js` 완성: `CACHE_VERSION = '5_compound_split-v1'`, `PRECACHE_URLS` 전체 파일 목록, install/activate/fetch 핸들러 (TRD §7.2)
- [ ] `main.js`: `navigator.serviceWorker.register('./sw.js')` 등록 (상대경로)
- [ ] 오프라인 동작 수동 확인: SW 설치 후 네트워크 차단 → 정상 로드 검증

### localStorage 영속화

- [ ] `storage.js` — 키 정의: `compound_split_settings`, `compound_split_progress`, `compound_split_leaderboard`
- [ ] 세션 완료 시 리더보드 기록 저장: 최대 20건, 초과 시 가장 오래된 항목 삭제 (TRD §3.3)
- [ ] 설정 변경 즉시 저장 / 앱 시작 시 로드

### 리더보드 화면

- [ ] `leaderboard.js` — `renderLeaderboard()`: 기록 목록 렌더링 (날짜·페이딩 레벨·문항 수·정답 수·오류 수), 빈 상태 메시지
- [ ] CSS: `screens.css` 공용 토큰·폰트·버튼 규격 그대로 사용 (별도 리더보드 CSS 신규 작성 금지)
- [ ] "홈으로" 버튼: `.btn` 규격

---

## M5 — QA

> 목표: 수동 체크리스트 전 항목 통과 + 시리즈 연속성 검증.

### 수동 테스트 체크리스트 (TRD §13 기반)

#### 게임 플레이 핵심 경로

- [x] L1(실선 경계) → 올바른 경계 탭 → 팝업 정상 출현, TTS 재생(전체→part1→part2), 뜻 라벨 표시
- [x] L2(점선 경계) → 첫 번째 조각 그림만 표시됨 확인
- [x] L3(경계 없음) → 그림 단서 없음, 정답 후 팝업에서 뜻 공개
- [x] 잘못된 경계 탭 → "그 조각은 뜻이 없네" 메시지 + 흔들림 애니메이션 + 카드 원위치 복귀
- [x] 6라운드 전체 완료 → end-screen 진입, 정답 수·오류 수 정확히 표시
- [x] 12·18 문항 설정 → 반복 채움 정상 동작

#### PWA / 오프라인

- [x] SW 등록 후 오프라인 → 캐시에서 정상 로드
- [x] 리더보드 → 기록 정상 저장·표시 (최대 20건 제한)
- [x] Incognito 모드 → localStorage 실패해도 게임 정상 동작
- [x] 설정 변경 후 새로고침 → 설정 유지

#### 호환성 · 접근성

- [x] TTS 미지원 브라우저 → 토글 자동 비활성화, 뜻 텍스트 표시 유지
- [x] 320px 최소 너비 → 카드·버튼 레이아웃 깨짐 없음
- [x] iOS Safari 15+ → 탭 이벤트 정상 동작, 100dvh 적용 확인 *(M5 정적 검토: touchstart/touchend 핸들러·`min-height:100dvh`·safe-area 패딩 코드 확인. 실기 검증은 R5·R6 후속 과제로 유지)*
- [x] `.split-popup` `role="dialog"` + `aria-label` 적용 확인

---

## 디자인 일관성 체크리스트

> 1_chosung_quiz 정본과의 픽셀 단위 일치 검증 항목. M0 완료 후 M5 QA 전 두 차례 실행한다.

### 폰트 검증

- [x] `<head>` Google Fonts `<link>`: `family=Jua` + `family=Gowun+Dodum` + `display=swap` — 1_chosung_quiz/index.html과 동일
- [x] `<link rel="preconnect" href="https://fonts.googleapis.com">` + `crossorigin` 버전 2행 존재
- [x] 시작 화면 제목: `font-family: 'Jua'`, `font-size: 3rem`, `letter-spacing: 2px`, `color: var(--coral)` — 브라우저 개발자 도구 계산값 확인
- [x] 설정 화면 제목: `font-family: 'Jua'`, `font-size: 1.8rem`, `color: var(--coral)`
- [x] 완료 화면 제목: `font-family: 'Jua'`, `font-size: 2.1rem`, `color: var(--coral)`
- [x] 본문·부제목: `font-family: 'Gowun Dodum'`, `font-size: clamp(0.9rem, 3vw, 1.2rem)`
- [x] 설정 섹션 레이블: `font-family: 'Jua'`, `font-size: 1.05rem`
- [x] 진행 인디케이터(N/M): `font-family: 'Jua'`

### 색상 토큰 검증

- [x] `tokens.css` 내 `--cream: #FFF6E4` 수치 1_chosung_quiz 정본과 동일
- [x] `tokens.css` 내 `--coral: #FF7757` 동일
- [x] `tokens.css` 내 `--coral-dark: #d45a40` 동일
- [x] `tokens.css` 내 `--navy: #2D3047` 동일
- [x] `tokens.css` 내 `--mint: #6BCAB8` 동일
- [x] `tokens.css` 내 `--yellow: #FFD166` 동일
- [x] 모든 화면 배경: `background: var(--cream)` 단독 사용, 하드코딩된 색상값 없음
- [x] `tokens.css` 파일 diff: 1_chosung_quiz 정본 대비 토큰 추가만 허용, 기존 값 변경 없음

### 버튼 규격 검증

- [x] `.btn`: `font-size: 1.2rem`, `padding: 14px 28px`, `border-radius: 100px`, `background: var(--coral)`, `box-shadow: 0 5px 0 var(--coral-dark)`, `color: #fff`
- [x] `.btn.big`: `font-size: 1.45rem`, `padding: 16px 44px`
- [x] `.btn.small`: `font-size: 1rem`, `padding: 10px 20px`
- [x] 모든 버튼 `font-family: 'Jua'`, `letter-spacing: 0.5px`
- [x] `:active` 눌림 효과: `transform: translateY(4px)`, `box-shadow: 0 1px 0 var(--coral-dark)`
- [x] `.btn.mint`: `background: var(--mint)`, `box-shadow: 0 5px 0 var(--mint-dark)`
- [x] `.btn.ghost`: `background: transparent`, `color: var(--navy)`, `box-shadow: inset 0 0 0 2px var(--navy)`
- [x] `components.css` 파일 diff: 1_chosung_quiz 정본 대비 수정 없음

### 공용 화면 레이아웃 검증

- [x] **홈/시작 화면**: 게임 제목 "합성어 쪼개기"가 `h1` + Jua 3rem + coral, 부제목 Gowun Dodum, 시작 버튼 `.btn.big`, 모드 선택 2버튼(연습하기·도전하기 — 2026-06-11 3버튼→2버튼 축소), 배경 `--cream`
- [x] **설정 화면**: Jua 1.8rem 제목, 섹션 레이블 Jua 1.05rem, `.btn` 버튼, `--cream` 배경 — 1_chosung_quiz 설정 화면과 레이아웃 골격 동일
- [x] **리더보드 화면**: 공용 토큰·폰트·버튼 규격 사용, 별도 신규 CSS 변수 없음
- [x] **완료 화면**: Jua 2.1rem 제목, Gowun Dodum 본문, `.btn` 버튼, `--cream` 배경
- [x] 모든 공용 화면: 인터랙티브 요소 최소 터치 타겟 44dp 이상 *(.btn 계열·카드·팝업 조각 충족. 페이딩/문항 칩은 정본 components.css `.chip` 규격 그대로 — 수정 금지 원칙(시리즈 정합) 우선, 2_vowel_finder와 동일 선례)*
- [x] 게임 플레이 화면: 합성어 카드 `min-height: 120px`(64dp 이상), 탭 영역 경계 양옆 각 28px(총 56dp)

### PWA·스토리지 격리 검증

- [x] `CACHE_VERSION`: `'5_compound_split-v2'` — 타 게임(`chosung-quiz-v*` 등)과 충돌 없음 (M1-1 수정으로 v1→v2 상향 — BUG.md M1-1·TRD §7.2 참조)
- [x] `localStorage` 접두사: `compound_split_` — `chosung_` 등 타 게임 접두사와 충돌 없음
- [x] `manifest.json` `start_url: './'`, `scope: './'` (절대경로 아닌 상대경로)
- [x] SW 등록: `navigator.serviceWorker.register('./sw.js')` 상대경로

---

## 시리즈 연속성 체크

### 이전 단계 — 4_word_network (순우리말 어휘망) 핸드오프

- [x] `words.js` `id` 필드: `4_word_network/src/data/words.js` 표제어 ID 네이밍 규칙(`씬_표제어`) 준수 확인 *(TRD §3.1·M1 표 확정안대로 `id`는 단축형(`raindrop` 등), `씬_표제어` 전체 ID는 `category` 필드가 그대로 보유 — Stage 3 상호 참조는 `category`로 성립)*
- [x] `words.js` `category` 필드: Stage 3 씬 카테고리 ID(`rain_raindrop`, `mountain_pinecone`, `night_star`, `night_moon`, `meadow_flower`, `winter_snowflake`)와 일치 확인
- [x] 도입 세트 6개 합성어 전체가 `4_word_network/src/data/words.js`에 표제어로 실재하는지 재확인
- [x] 입력 방식: 세로·탭/드래그 56dp — Stage 3과 동일 패러다임 유지(운동 협응 cliff 없음) 확인
- [x] Stage 3 씬 배경 이모지(rain·mountain·night·meadow·winter) `sceneEmoji`로 재사용 여부 확인

### 다음 단계 — 6_morpheme_detective (형태소 탐정) 핸드오프

- [x] `CompoundWord` 스키마 `part1`·`part2`·`sharedMorpheme` 필드명 고정 (Stage 6 참조 예정 — 변경 금지)
- [x] `sharedMorpheme` 필드: `config.js` 플래그(`SHOW_SHARED_MORPHEME_HIGHLIGHT`)로 시각 연출 ON/OFF 제어 가능하도록 설계 확인
- [x] D3 잔존 도약 미처방 명시: 돋보기·핀치/가로 UI 미구현 상태 `PLAN.md` 오픈 이슈에 기록 — Stage 6 Level 0 온보딩 담당팀과 협력 일정 별도 조율 필요
- [x] `SHARED_MORPHEME_PAIRS` 메타 객체 Stage 6 참조 가능 형태로 export 확인

### 단일 차원 완충 원칙 준수 확인 (PRD §2.2)

- [x] D6(형태소성 통찰)만 완충 — 게임 플레이 화면에 한자 기호·돋보기·핀치/가로 UI 일절 없음
- [x] D1 동결: 어휘는 Stage 3과 동일 고유어 친숙 어휘 6개로 고정
- [x] D2 단일 조작: 분해-인식만 구현, 능동 재구성(두 조각 합치기)·역분해 미구현
- [x] D3 동결: 세로·탭/드래그 56dp만, 가로 전환·핀치/팬 미구현
- [x] 비목표 항목(PRD §4.2) 미구현 확인: 한자 기호·파생어·문장 추론·공유 형태소 "모으기" 미션 없음

---

## 리스크 / 오픈 이슈

| # | 분류 | 내용 | 영향 | 조치 방향 |
|---|---|---|---|---|
| R1 | 자산 | 조각 단위 신규 그림 자산(9개 형태소) 이모지 vs 일러스트 방식 미확정 | M1 차단 | 이모지 우선(`part1Emoji`·`part2Emoji`) + `part1ImageUrl` 선택 추가로 점진 확장 허용 |
| R2 | 설계 | 도전하기 승급 조건 — 자동 승급(연습하기 연속 정답 N회) vs 수동 선택 PRD 미확정. *(2026-06-11 2모드 축소 반영: 승급 경로는 2→3 단 한 번만 존재, `AUTO_ADVANCE_STREAK` 플래그 ON 시에만 자동)* | M3 차단 가능성 | `config.js` 플래그로 양쪽 구현 후 A/B 검증; 기본값은 수동 선택 |
| R3 | 설계 | 공유 형태소(방울·빛·송이) 두 번째 출현 시 시각 연결 연출 여부 미확정 | M2 UI 영향 | `sharedMorpheme` 플래그로 제어 가능하도록 설계만 해두고 연출 OFF가 기본값; Stage 4 payoff 보호 원칙 우선 |
| R4 | 연속성 | Stage 4 Level 0 In-stage 온보딩(D3 처방) 담당팀과 설계 협력 일정 미조율 | 시리즈 완성도 | 본 게임 출시 전 Stage 6 담당팀과 D3 미처방 범위 서면 합의 필요 |
| R5 | 성능 | 탭 → 분리 애니메이션 < 100ms 시작 요건 — 저사양 모바일(구형 Android) 미검증 | M5 QA | `transform`/`opacity`만 사용(compositor layer), M5에서 저사양 기기 실기 검증 |
| R6 | 호환성 | iOS Safari 15+ `100dvh` + `user-scalable=no` 툴바 겹침 | M0 레이아웃 | `min-height: 100dvh` + `padding-bottom: env(safe-area-inset-bottom)` 적용, M5에서 실기 확인 |
| R7 | 데이터 | `빗방울`의 `part1` 표기: 기저형 '비' vs 표면형 '빗' — TTS 발음과 카드 텍스트 표기 불일치 가능 | UX | 카드 텍스트: '빗방울' 전체 표시; 팝업 조각1 텍스트: '비(빗)' 병기 또는 '비'만 표시; TTS: '비' 발음 우선 |

---

## 기술 부채 / 후속 개선 후보

| 항목 | 우선순위 | 메모 |
|---|---|---|
| Vitest 유닛 테스트 | Medium | `buildQueue`, `onCardTap`, `loadData`, `saveData` 우선 |
| Playwright E2E | Low | 연습하기·도전하기 두 모드 전체 라운드 완주 시나리오 2개 |
| 확장 세트 구현 | Low | PRD §7.3 후보어(봄비·들꽃·눈밭·봄볕) — 도입 세트 숙달 지표 충족 후 |
| `part1ImageUrl` 일러스트 추가 | Low | 이모지 폴백 충분하면 저우선 |
| 도전하기 자동 승급 알고리즘(2→3 단 한 번) | Low | R2 오픈 이슈 해소 후 |
| SRL 게이팅 연동 | Low | 본 게임 완료 기록 → Stage 6 진입 게이팅 조건 (미래 통합) |

---

## 브랜치 전략 (권고)

```
main                    # 배포 가능한 안정 버전
└── dev/5-compound-split
    ├── feat/m0-scaffold        # M0: 디자인 시스템 + 공용 화면
    ├── feat/m1-data            # M1: words.js 데이터
    ├── feat/m2-gameplay        # M2: 게임 플레이 로직
    ├── feat/m3-fading          # M3: 3단 페이딩
    ├── feat/m4-pwa             # M4: PWA + 리더보드
    └── fix/m5-qa               # M5: QA 수정 사항
```

커밋 메시지 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `chore:`

---

## 개발 환경

| 항목 | 내용 |
|---|---|
| 개발 서버 | `npx serve -l 4329` |
| 포트 | **4329** |
| 빌드 도구 | 없음 (ES Modules 네이티브) |
| npm 의존성 | `npx serve` 외 없음 (런타임 의존성 0) |
| 브라우저 대상 | Chrome / Safari / Edge 최신, iOS Safari 15+ |

---

## 변경 이력

- 2026-06-11: 정답 팝업 제목 조사 병기('은(는)') → 받침 유무 기반 자동 선택으로 변경 — `utils.js`에 `josa()` 순수 함수 추가, TRD §5.4 규칙 명시

---

*본 문서는 설계 완료 시점(2026-06-10) 기준으로 작성되었다. 구현 착수 전 오픈 이슈 R1·R2·R3 해소를 권고한다.*
