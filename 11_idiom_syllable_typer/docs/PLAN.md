# PLAN — 사자성어 음절 받아쓰기 (Idiom Syllable Typer)

> 구현 계획서 및 진행 상태
> Last updated: 2026-06-10

---

## 현재 상태

**설계 완료, 구현 미착수**

| 문서 | 상태 |
|---|---|
| PRD.md | 완료 |
| TRD.md | 완료 |
| PLAN.md | 완료 |
| 코드 / HTML / CSS / JS | 미착수 |

---

## 마일스톤 개요

| 마일스톤 | 내용 | 선행 조건 |
|---|---|---|
| M0 | 디자인 시스템 스캐폴딩 — 공용 화면 이식 | 없음 |
| M1 | 데이터 레이어 | M0 |
| M2 | 게임 플레이 핵심 로직 (Lv.1) | M1 |
| M3 | 3단 페이딩 / 난이도 완성 (Lv.2·3) | M2 |
| M4 | PWA + 리더보드 | M3 |
| M5 | QA / 크로스브라우저 검증 | M4 |

---

## M0 — 디자인 시스템 스캐폴딩

> 목표: 공용 화면(홈·설정·리더보드·완료) 이식. 게임 플레이 화면 레이아웃 스켈레톤.

### 프로젝트 초기화

- [ ] `11_idiom_syllable_typer/` 루트 디렉터리 생성
- [ ] `package.json` 작성 (`dev: npx -y serve . -l 4332`, `live: npx -y live-server --port=4332`)
- [ ] `index.html` 뼈대 작성 — `<head>` Google Fonts preconnect + 5개 CSS `<link>` 순서 고정
- [ ] `favicon.svg` 추가
- [ ] `AGENTS.md` 작성 (게임 범위·포트·설계 참조 링크)

### CSS — 공용 디자인 시스템 이식

- [ ] `src/css/tokens.css` — `1_chosung_quiz/src/css/tokens.css` 원본 복사 후 하단에 `/* S11 확장 */` 블록 추가 (`--slot-active-border`, `--slot-correct-bg`, `--slot-wrong-bg`, `--hanja-card-bg`)
- [ ] `src/css/base.css` — `1_chosung_quiz/src/css/base.css` 기반 복사 (리셋·body·container)
- [ ] `src/css/components.css` — `1_chosung_quiz/src/css/components.css` 복사 (`.btn`, `.chip`, `.toggle`, `.modal`, `.flash`)
- [ ] `src/css/screens.css` — `1_chosung_quiz/src/css/screens.css` 기반 복사. `start-screen`, `settings-screen`, `end-screen` 재사용. `leaderboard-screen` 신규 정의. 플레이 전용 규칙은 `game.css`로 분리
- [ ] `src/css/game.css` — 신규 작성 스켈레톤 (`#game-screen` 레이아웃 placeholder)

### HTML 화면 슬롯

- [ ] `#start-screen` 마크업 — `h1` (Jua 3rem/--coral), `.btn.big` "바로 시작", `.btn` "설정하고 시작", 레벨 칩 Lv.1~3
- [ ] `#settings-screen` 마크업 — `h2` (Jua 1.8rem/--coral), 토글 섹션 (TTS·효과음·자동페이딩), `.btn` "저장 후 시작"
- [ ] `#leaderboard-screen` 마크업 — `h2` (Jua 1.8rem/--coral), 사자성어 10개 표 스켈레톤, `.btn.small` "돌아가기"
- [ ] `#end-screen` 마크업 — `h2` (Jua 2.1rem/--coral), 완료 사자성어 목록 스켈레톤, `.btn.big` "다시 하기", `.btn.small` "리더보드"
- [ ] `#game-screen` 마크업 스켈레톤 — 한자 카드 영역·4×1 슬롯·도크/키패드 오버레이·어원 팝업 자리

---

## M1 — 데이터 레이어

> 목표: 사자성어 10개 완전 데이터 + 상수·상태·스토리지 모듈.

### 콘텐츠 데이터

- [ ] `src/data/idioms.js` — `IdiomEntry[]` + `SyllableEntry[]` 완전 작성
  - [ ] 10개 사자성어 전체 `word`, `hanja`, `meaning`, `hint`, `contextStory` 입력
  - [ ] 각 사자성어 4개 음절 × `syllable`, `hanjaChar`, `hanjaSound`, `hanjaMeaning` 입력
  - [ ] 각 음절 `distractors` 4개 — 초성 또는 모음 1자만 다른 유사 음절로 구성
  - [ ] `IDIOMS` 배열 `export` 확인 (S10 `BOSS_IDIOMS` 스키마 하위 호환)

### JS 모듈 — 기반

- [ ] `src/js/config.js` — `STORAGE_PREFIX = '11ist_'`, `CACHE_VERSION = '11_idiom_syllable_typer-v1'`, 애니메이션 지연 상수 (`SLOT_POP_DURATION`, `SHAKE_DURATION`, `POPUP_AUTO_CLOSE`, `IDIOM_COMPLETE_DELAY`)
- [ ] `src/js/state.js` — `settings`, `session`, `result` 싱글톤 초기값. `slotLevels`, `slotStates`, `wrongSlots` 포함
- [ ] `src/js/storage.js` — `save(key, value)` / `load(key, fallback)` 래퍼. `try/catch` Incognito 안전. `markIdiomCompleted(word)` 구현
- [ ] `src/js/utils.js` — `shuffle()`, `getChosung()`, `assembleSyllable()`, `isCompleteHangul()`, `buildDockPool()`, `CHOSUNG`·`JUNGSUNG`·`JONGSUNG` 배열

---

## M2 — 게임 플레이 핵심 로직 (Lv.1)

> 목표: Lv.1 음절블록 탭 기반 완전 플레이 루프. TTS + 효과음 + 어원 팝업 포함.

### 공용 JS 모듈

- [ ] `src/js/tts.js` — `speak(text, rate, pitch)`, `cancel()`, `isSupported()`. `voiceschanged` 비동기 대기. `ko-KR` 우선 → `ko*` → default 폴백
- [ ] `src/js/sound.js` — Web Audio API `playCorrect()` (상승 아르페지오), `playWrong()` (하강 톤). `AudioContext` 최초 인터랙션 이후 생성
- [ ] `src/js/ui.js` — `showScreen(name)`: 전환 전 `tts.cancel()` + `sound.stopAll()` 호출. `el(id)` 헬퍼, `showToast(msg)`, `updateProgress(current, total)`

### 게임 루프

- [ ] `src/js/game.js` — `startSession()`: 10개 문항 순서 확정, `slotLevels` 초기화
- [ ] `src/js/game.js` — `renderIdiom(idx)`: 한자 카드(4글자·한글독음·의미) 렌더링 + TTS 자동 발화
- [ ] `src/js/game.js` — `renderSlots()`: 4×1 슬롯 상태 클래스 토글 (`empty` → `correct`/`wrong`). 활성 슬롯 `--slot-active-border` 맥동 애니메이션
- [ ] `src/js/game.js` — `renderLv1Dock(slotIdx)`: `buildDockPool()` 호출 → 8개 블록 64dp 그리드 렌더링. `<button>` 탭 이벤트만 사용 (`<input>` 미사용)
- [ ] `src/js/game.js` — `selectSyllable(syllable, slotIdx)`: 채점 → 정답 시 `slotPop` 애니메이션 + `sound.playCorrect()` + TTS 음절 발화 + 어원 팝업. 오답 시 `shake` 애니메이션 + `sound.playWrong()` + 0.6초 후 리셋
- [ ] `src/js/game.js` — `showEtymologyPopup(syllableEntry)`: `.modal-overlay` + `.modal` 재사용. 2초 자동 닫힘. 수동 닫기 버튼. 논블로킹
- [ ] `src/js/game.js` — `onIdiomComplete()`: 4슬롯 전체 정답 팝 애니메이션 + TTS 사자성어 전체 발화 + 0.8초 후 다음 문항 또는 완료 화면 전환
- [ ] `src/js/end.js` — 완료 화면 렌더링: 정답률, 오답 목록, TTS 복습 버튼. `storage.saveResult()` 호출
- [ ] `src/js/main.js` — 진입점: 모듈 부트스트랩, 화면 전환 이벤트 바인딩, `window.*` 노출 (`onclick` 속성 연결용)

### CSS — 게임 플레이 고유

- [ ] `src/css/game.css` 완성 — 한자 카드 (`clamp(2rem,8vw,3.2rem)` 한자, Gowun Dodum 독음), 4×1 슬롯 행 레이아웃, Lv.1 도크 `grid 4×2` 64dp 블록, 어원 팝업, `slotPop`·`shake` 키프레임, `prefers-reduced-motion` 분기

---

## M3 — 3단 페이딩 / 난이도 완성 (Lv.2·3)

> 목표: Lv.2 초성힌트+자모 조립, Lv.3 자유 IME. 슬롯 독립 페이딩 + 자동 진급.

### Lv.2 자모 키패드

- [ ] `src/css/game.css` — Lv.2 키패드 그리드 (48dp 버튼), 초성 힌트 배지, 조립 미리보기 영역
- [ ] `src/js/game.js` — `renderLv2Pad(slotIdx)`: 초성 힌트 배지 표시 + 자모 키패드 렌더링 (`<button>` 그리드, IME 비노출)
- [ ] `src/js/utils.js` — `assembleSyllable(cho, jung, jong)` 조합기 완성 및 단위 테스트 케이스 주석
- [ ] `src/js/game.js` — 자모 탭 → 내부 조합기 호출 → 완성 음절 미리보기 실시간 반영 → 종성 완료/다음 초성 탭 시 확정 채점

### Lv.3 자유 IME

- [ ] `src/js/game.js` — `renderLv3Input(slotIdx)`: `<input type="text" inputmode="text" maxlength="1">` 노출 + `autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"` 설정
- [ ] `src/js/game.js` — `input` 이벤트 핸들러: `isCompleteHangul(value)` 통과 시만 채점 (자모 단독 입력 거부)

### 슬롯 독립 페이딩

- [ ] `src/js/game.js` — `onSlotWrong(slotIdx)`: 해당 슬롯만 `slotLevels[slotIdx] = 1` 재강화, 나머지 슬롯 레벨 유지
- [ ] `src/js/game.js` — `onSessionComplete()`: `autoFade` ON + `wrongSlots.size === 0` 조건 시 `fadingLevel = Math.min(3, fadingLevel + 1)` 진급

### 설정 화면 연동

- [ ] `src/js/settings.js` — 설정 화면 렌더링 + 토글 이벤트 (TTS·효과음·자동페이딩·레벨 고정)
- [ ] `src/js/settings.js` — `startWithLevel(level)`: 레벨 칩 탭 → `fadingLevel` 교체 → 즉시 게임 시작
- [ ] TTS 미지원 기기 감지 → 토글 자동 비활성화 + 안내 메시지 표시

---

## M4 — PWA + 리더보드

> 목표: 오프라인 작동, 리더보드 화면, S12 연동 스키마 완성.

### PWA

- [ ] `manifest.json` 작성 — `name`, `short_name`, `start_url: "./"`, `scope: "./"`, `background_color: "#FFF6E4"`, `theme_color: "#FF7757"`, `icons`
- [ ] `sw.js` 작성 — `CACHE_VERSION = '11_idiom_syllable_typer-v1'`. `install`: `PRECACHE_URLS` 전체 캐시. `activate`: 구버전 캐시 삭제. `fetch`: Cache First 전략
- [ ] `index.html` `<script>` SW 등록 — 상대경로 `./sw.js` 사용 (절대경로 금지)
- [ ] 오프라인 작동 검증 — 개발자 도구 Network: Offline 전환 후 페이지 재로드 확인

### 리더보드

- [ ] `src/js/leaderboard.js` — `render()`: `11ist_leaderboard` 로드 → 사자성어별 최고 레벨·정답률 표 + 최근 5건 세션 요약 카드 렌더링
- [ ] `src/js/storage.js` — `saveResult(sessionResult)`: `LeaderboardEntry` 생성, `board.unshift()`, 최대 50건 FIFO 유지
- [ ] `src/js/storage.js` — `markIdiomCompleted(word)`: `11ist_completedIdioms` 갱신 (S12 공유 스키마)
- [ ] 리더보드 화면 CSS 검증 — `Jua 1.8rem/--coral` 헤더, `Gowun Dodum` 본문, `.btn.small` 버튼

### localStorage 전체 검증

- [ ] `11ist_settings`, `11ist_leaderboard`, `11ist_progress`, `11ist_completedIdioms` 4개 키 정상 읽기/쓰기 확인
- [ ] Incognito 모드 — `try/catch` 무시 후 게임 정상 동작 확인

---

## M5 — QA / 크로스브라우저 검증

> 목표: TRD §13 수동 테스트 체크리스트 전항목 통과.

### 게임 로직 QA

- [ ] Lv.1: 8개 음절블록 정상 표시, 정답·오답 즉각 피드백 (녹색/흔들림)
- [ ] Lv.2: 초성 힌트 배지 표시, 자모 키패드 조합 → 완성 음절 채점
- [ ] Lv.3: IME 타이핑, 완성형 한글만 채점, 자모 단독 입력 거부
- [ ] 슬롯 오답 → 해당 슬롯만 Lv.1 재강화, 나머지 슬롯 레벨 유지 확인
- [ ] 자동 페이딩 진급: 오답 없는 문항 완료 후 다음 문항 레벨 +1 확인
- [ ] 어원 팝업: 정답 슬롯마다 즉시 표시 → 2초 자동 닫힘 → 수동 닫기
- [ ] 10개 완료 → 완료 화면 전환 + localStorage 결과 저장 확인

### 영속화 QA

- [ ] 리더보드: 세션 완료 후 최고 레벨·정답률 정확히 반영
- [ ] `11ist_completedIdioms`: 완료 어휘 누적 저장 확인
- [ ] Incognito 모드: localStorage 실패해도 게임 정상 동작

### 크로스브라우저 / 반응형 QA

- [ ] Chrome (최신), Safari, Edge — 기본 플레이 플로 확인
- [ ] iOS Safari 15+ — TTS, 소프트 키보드 미노출(Lv.1·2), 레이아웃
- [ ] Chrome Android 최신 — 터치 타겟 64dp 검증, Lv.3 IME 입력
- [ ] 320px 너비(최소) ~ 768px 모바일 — 레이아웃 overflow 없음
- [ ] `prefers-reduced-motion` 적용 시 애니메이션 생략 확인
- [ ] TTS 미지원 브라우저 — 토글 비활성화 + 앱 정상 동작

### PWA QA

- [ ] Lighthouse PWA 점수 확인 (installable, offline 통과)
- [ ] `start_url` `./`, `scope` `./` — 동일 오리진 타 게임과 독립 작동 확인
- [ ] 오프라인 상태 재로드 → Service Worker 캐시 응답 확인

---

## 디자인 일관성 체크리스트

> `1_chosung_quiz`와의 픽셀 단위 일치 여부를 구현 완료 후 대조 검증한다.

### 폰트

- [ ] Google Fonts `<link>` — `Jua` + `Gowun+Dodum` `preconnect` 포함 여부
- [ ] 시작 화면 `h1` — `font-family: 'Jua'`, `font-size: 3rem`, `letter-spacing: 2px`, `color: var(--coral)`
- [ ] 설정 화면 `h2` — `font-family: 'Jua'`, `font-size: 1.8rem`, `color: var(--coral)`
- [ ] 완료 화면 `h2` — `font-family: 'Jua'`, `font-size: 2.1rem`, `color: var(--coral)`
- [ ] 본문/설명 텍스트 — `font-family: 'Gowun Dodum'`, `font-size: clamp(0.9rem, 3vw, 1.2rem)`
- [ ] 섹션 레이블(설정) — `font-family: 'Jua'`, `font-size: 1.05rem`
- [ ] 리더보드 본문 — `Gowun Dodum` 적용 확인

### 색상 토큰

- [ ] `--cream: #FFF6E4` — 배경 `body { background: var(--cream) }` 적용
- [ ] `--coral: #FF7757` — 제목·버튼 배경 사용 확인
- [ ] `--coral-dark: #d45a40` — 버튼 그림자 확인
- [ ] `--mint: #6BCAB8` — 정답 피드백 슬롯 배경 (`--slot-correct-bg`) 참조 확인
- [ ] `--navy: #2D3047` — 기본 텍스트·테두리 사용 확인
- [ ] `--yellow: #FFD166` — 힌트 배지·초성 힌트 강조 사용 확인
- [ ] `--red: #E84545` — 오답 피드백 슬롯 배경 (`--slot-wrong-bg`) 참조 확인
- [ ] `tokens.css` 내 수치를 임의 변경하지 않았는지 원본과 diff 대조

### 버튼 규격

- [ ] `.btn` — `font-family: 'Jua'`, `letter-spacing: 0.5px`, `font-size: 1.2rem`, `padding: 14px 28px`, `border-radius: 100px`, `background: var(--coral)`, `color: #fff`, `box-shadow: 0 5px 0 var(--coral-dark)`
- [ ] `.btn.big` — `font-size: 1.45rem`, `padding: 16px 44px`
- [ ] `.btn.small` — `font-size: 1rem`, `padding: 10px 20px`
- [ ] `.btn:active` — `transform: translateY(4px)`, `box-shadow: 0 1px 0 var(--coral-dark)`
- [ ] `components.css` 원본 수치와 diff 대조 (임의 변경 없음 확인)

### 레이아웃

- [ ] `body { background: var(--cream) }` 전 화면 동일
- [ ] `.container { max-width: 480px; margin: 0 auto; padding: 16px }` — 게임 플레이 화면 포함 전 화면 적용
- [ ] `min-height: 100dvh` — iOS Safari 주소창 변동 대응 확인

### 공용 화면 레이아웃 (`1_chosung_quiz` 동일 구조)

- [ ] `#start-screen` — `h1` + `.btn.big` + `.btn` + `.chip` 그룹 순서·여백 동일
- [ ] `#settings-screen` — `h2` + `.settings-section` + `.section-label` + `.toggle-row` 구조 동일
- [ ] `#leaderboard-screen` — `h2` + 표/목록 + `.btn.small` 배치. `1_chosung_quiz` 완료 화면 여백 기준 준수
- [ ] `#end-screen` — `h2` + 결과 요약 + `.review-list` + `.btn.big` + `.btn.small` 순서 동일

---

## 시리즈 연속성 체크

### 이전 단계 (S10 — 문해력 해독기) 핸드오프

- [ ] `src/data/idioms.js`의 `word`, `hanja`, `meaning`, `hint`, `contextStory` 필드가 S10 `BOSS_IDIOMS` 스키마와 동일 구조인지 확인
- [ ] 10개 사자성어 목록이 S10 보스 스테이지 노출 목록과 완전 일치하는지 대조
  - 일석이조, 이심전심, 동문서답, 오리무중, 일취월장, 청출어람, 천고마비, 화룡점정, 대기만성, 백발백중
- [ ] S10 → S11 진입 시 신규 어휘 부하 0 정책 — 어휘 DB 항목 수 10개 고정 확인
- [ ] 난이도 연속성 — S10 탭/드래그(수용)에서 S11 Lv.1 탭(수용+산출 비계)으로 1칸 전진만 이루어지는지

### 다음 단계 (S12 — 사자성어 크로스워드) 핸드오프

- [ ] `11ist_completedIdioms` — S12가 읽을 공유 스키마 `string[]` 정상 기록 확인
- [ ] S11 Lv.3 자유 IME 패러다임이 S12 `commitChar` (U+AC00~D7A3) 방식과 동일하게 구현되었는지 코드 레벨 확인
- [ ] 크로스워드 공간 추론(교차 슬롯·Tab 순환·단어 방향)이 S11 코드에 진입하지 않았는지 검토
- [ ] S12 팀과 `learner.completedIdioms` 공유 스키마 키 컨벤션 합의 여부 (오픈 이슈)

---

## 리스크 / 오픈 이슈

| # | 항목 | 심각도 | 대응 방안 |
|---|---|---|---|
| R1 | S10 `BOSS_IDIOMS` 직접 import vs. 복사 | 중 | 개발 환경에서 상대경로 동적 import 호환성 우선 검토. 불가 시 `src/data/idioms.js`에 동일 구조 복사 사용 |
| R2 | Lv.2 자모 키패드 배열 선택 | 중 | 천지인·QWERTY 중 12~13세 친숙도 사용자 테스트 필요. 결정 전까지 QWERTY 계열로 임시 구현 |
| R3 | 한자 폰트 기기별 렌더링 차이 | 중 | 시스템 CJK(Noto Sans CJK KR) 우선. Android 4.x 이하 누락 시 `<link rel="stylesheet" href="noto-cjk-kr-subset">` 서브셋 임베드 선택 |
| R4 | S12 `learner.completedIdioms` 공유 스키마 미합의 | 중 | S12 개발 착수 전 localStorage 키 컨벤션 문서화 및 S12 팀 사전 합의 필요 |
| R5 | iOS Safari Lv.3 IME 소프트 키보드 레이아웃 밀림 | 중 | `100dvh` + `env(safe-area-inset-*)` 활용. 슬롯 고정 포지셔닝 방지 |
| R6 | Web Audio API 자동재생 정책 (iOS) | 저 | `AudioContext` 생성을 최초 사용자 탭 이벤트 후로 지연. S1 `sound.js` 패턴 참조 |
| R7 | TTS `voiceschanged` 타이밍 — 일부 브라우저 즉시 미로드 | 저 | `loadVoice()` 이중 호출(이벤트 + 즉시) 패턴 유지. 미지원 시 토글 자동 비활성화 |
| R8 | S12 어휘 ~90개 미습득 잔존 갭 | 정보 | 본 게임 범위 밖. LEARNING_PROGRESSION_ANALYSIS.md §3.6·§4 명시된 공백. S12 내 별도 어휘 습득 경로 필요 |

---

## 기술 부채 / 향후 개선

| 항목 | 우선순위 | 메모 |
|---|---|---|
| Vitest 유닛 테스트 | Medium | `assembleSyllable`, `getChosung`, `buildDockPool`, `isCompleteHangul` 우선 |
| Playwright E2E | Low | Lv.1 전체 정답 → 레벨 진급, Lv.3 IME 입력 시나리오 |
| TypeScript 마이그레이션 | Low | `IdiomEntry`·`SyllableEntry` 타입 안전성 이득 클 때 |
| 다중 프로필 (P2) | Low | S1 `profiles.js` 패턴 참조. 사용자 요청 시 착수 |
| 학습 기록 대시보드 (P2) | Low | 사자성어별 숙달 곡선 시각화 |

---

## 브랜치 전략 (권장)

```
main              # 배포 가능한 안정 버전
├── dev           # 통합 개발 브랜치
    ├── feat/m0-scaffold        # 디자인 시스템 이식
    ├── feat/m1-data            # 데이터 레이어
    ├── feat/m2-gameplay-lv1    # 게임 플레이 Lv.1
    ├── feat/m3-fading          # Lv.2·3 + 페이딩
    ├── feat/m4-pwa-leaderboard # PWA + 리더보드
    └── fix/qa-crossbrowser     # QA 수정
```

커밋 메시지 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `data:`
