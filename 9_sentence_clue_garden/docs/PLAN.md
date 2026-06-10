# PLAN — 문장 단서 정원 (9_sentence_clue_garden)

> 구현 계획서 | 버전: 1.0 | 작성일: 2026-06-10  
> **현재 상태: 설계 완료, 구현 미착수**

---

## 개요

| 항목 | 내용 |
|---|---|
| 게임 ID | `9_sentence_clue_garden` |
| 대상 연령 | 초4~5 (만 9~11세) |
| 개발 포트 | `4331` |
| 이전 단계 | `8_vocabulary_tree` — 어휘력 세계수 |
| 다음 단계 | `10_literacy_decoder` — 문해력 해독기 |
| 핵심 메커닉 | 단문 클로즈(1문장·빈칸 1개) + 3단 단서 페이딩 + 도크 탭/드래그 |
| 보스 유무 | 없음 |
| 다중 빈칸 | 금지 (항상 빈칸 1개 고정) |

---

## 마일스톤

| 마일스톤 | 명칭 | 범위 요약 |
|---|---|---|
| M0 | 디자인 시스템 스캐폴딩 | 공용 화면·CSS 이식, 디렉터리 골격, index.html |
| M1 | 데이터 | 문제 데이터(sentences.js) 작성 및 유효성 검사 |
| M2 | 게임 플레이 로직 | 출제·정답 판정·도크 탭·피드백·진행 |
| M3 | 페이딩·난이도 시스템 | 3단 단서 페이딩, 드래그+스냅, 난이도 필터 |
| M4 | PWA·리더보드 | Service Worker, 매니페스트, 리더보드 화면 |
| M5 | QA | 수동 테스트 체크리스트 전 항목 통과, 크로스 디바이스 검증 |

---

## M0 — 디자인 시스템 스캐폴딩

> 공용 화면·CSS를 `1_chosung_quiz`에서 이식하는 것을 최우선으로 한다.  
> 게임 고유 코드는 M2 이후에 추가한다.

### 디렉터리 골격 생성

- [ ] `9_sentence_clue_garden/` 루트에 `index.html`, `manifest.json`, `sw.js` 파일 생성
- [ ] `src/css/` 디렉터리 생성
- [ ] `src/js/` 디렉터리 생성
- [ ] `src/data/` 디렉터리 생성
- [ ] `icons/` 디렉터리 생성 (`icon-192.png`, `icon-512.png` 플레이스홀더 포함)

### CSS 이식 (1_chosung_quiz → 9_sentence_clue_garden)

- [ ] `src/css/tokens.css` — `1_chosung_quiz/src/css/tokens.css` 내용 그대로 복제
- [ ] `src/css/base.css` — 리셋·body·공통 레이아웃 작성 (시리즈 기준 준수)
- [ ] `src/css/components.css` — `1_chosung_quiz/src/css/components.css` 내용 그대로 복제
- [ ] `src/css/screens.css` — 홈·설정·완료·리더보드 화면 (시리즈 공통 규격, 이 게임의 화면 ID에 맞게 조정)
- [ ] `src/css/game.css` — 게임 플레이 화면 전용 확장 CSS 파일 생성 (내용은 M2에서 채움)

### index.html 기초 마크업

- [ ] `<head>` — Google Fonts `Jua` + `Gowun Dodum` `<link>` 태그 삽입
- [ ] `<head>` — `<meta name="viewport">`, `<link rel="manifest">`, SW 등록 `<script>` 삽입
- [ ] CSS `<link>` 5개 직렬 로드 순서 고정: `tokens → base → components → screens → game`
- [ ] 홈 화면(`#home-screen`) 마크업 — 제목·레벨 버튼·설정 진입 버튼
- [ ] 설정 화면(`#settings-screen`) 마크업 — 난이도·문제수·힌트·TTS·효과음·이름 입력
- [ ] 플레이 화면(`#play-screen`) 마크업 — 문장 카드·빈칸·단서 영역·도크·힌트 버튼
- [ ] 완료 화면(`#end-screen`) 마크업 — 점수·정답률·오답 목록·다시하기·리더보드 버튼
- [ ] 리더보드 화면(`#leaderboard-screen`) 마크업 — 순위 목록·뒤로가기 버튼

### JS 모듈 파일 생성 (내용은 이후 마일스톤에서 채움)

- [ ] `src/js/config.js` — 상수(CACHE_VERSION, 스토리지 키 접두사 등) 정의
- [ ] `src/js/state.js` — 전역 상태 싱글톤 초기 구조 정의
- [ ] `src/js/storage.js` — localStorage / IndexedDB 래퍼 스텁
- [ ] `src/js/utils.js` — 순수 유틸(셔플, 랜덤) 스텁
- [ ] `src/js/tts.js` — Web Speech API 래퍼 스텁
- [ ] `src/js/sound.js` — Web Audio API 효과음 스텁
- [ ] `src/js/ui.js` — `goTo()` 화면 전환 헬퍼 스텁
- [ ] `src/js/hint.js` — 3단 단서 페이딩 로직 스텁
- [ ] `src/js/dock.js` — 도크 선택지 렌더링·탭·드래그 스텁
- [ ] `src/js/settings.js` — 설정 화면 렌더링 스텁
- [ ] `src/js/leaderboard.js` — 리더보드 화면 렌더링 스텁
- [ ] `src/js/game.js` — 게임 코어 스텁
- [ ] `src/js/main.js` — 진입점, 모든 모듈 import, `window.*` 노출

---

## M1 — 데이터

### 문제 데이터 설계 및 작성

- [ ] `src/data/sentences.js` 파일 생성 — 스키마 정의 주석 포함
- [ ] easy 난이도 문제 최소 15개 작성 (`S8` 한자어 기반, 1~2문장 20~60자)
- [ ] medium 난이도 문제 최소 15개 작성
- [ ] hard 난이도 문제 최소 10개 작성
- [ ] 각 문제 `choices` 배열: 정답 1개 + distractor 2~3개 (근접 의미 교란어)
- [ ] 각 문제 `hint.level1.highlight` 인덱스: `sentence` 원문 기준 정확한 구간 지정
- [ ] 빈칸 마커 `[ ]` 개수 유효성 검사 스크립트 작성 (다중 빈칸 항목 거부)
- [ ] S8 어휘 ID 체계와 `answer`/`choices` 어휘 호환성 검토 메모 작성

---

## M2 — 게임 플레이 로직

### 상태 및 저장소

- [ ] `state.js` — `state.settings`, `state.game`, `state.lastGameIds` 완전 구현
- [ ] `storage.js` — `loadSettings()`, `saveSettings()` (localStorage, `try/catch`)
- [ ] `storage.js` — `loadLeaderboard()`, `saveLeaderboard()` (최대 50개 관리)
- [ ] `storage.js` — `saveSession()`, `loadSessions()` (IndexedDB, Promise 래퍼, localStorage 폴백)

### 문제 선별 알고리즘

- [ ] `utils.js` — `shuffle(arr)` 구현
- [ ] `game.js` — `pickQuestions(pool, needed, lastIds)` — fresh 우선, 부족 시 반복 채움
- [ ] `game.js` — 난이도 필터: `state.settings.difficulty === 'all'` 이면 전체 풀 사용

### 게임 플레이 화면 렌더링

- [ ] `game.js` — `startGame()` — 설정 기반 문제 풀 구성, `state.game` 초기화
- [ ] `game.js` — `renderQuestion(item)` — 문장 원문에서 `[ ]` → `<span class="blank">` 치환
- [ ] `game.js` — `renderSentenceText(sentence)` — 빈칸 마커 HTML 변환 (XSS 안전, `createTextNode` 사용)
- [ ] `dock.js` — `renderDock(choices)` — 선택지 칩 렌더링 (`Jua`, 56dp 터치 타겟)
- [ ] `game.js` — `checkAnswer(chosen, item)` — `trim()` 정규화 후 정답 판정
- [ ] `game.js` — 정답 피드백: mint 칩 + TTS + 효과음 → 1500ms 후 다음 문제
- [ ] `game.js` — 오답 피드백: red 칩 + TTS + 효과음 → 1500ms 후 다음 문제
- [ ] `game.js` — `nextQuestion()` — `currentIdx` 증가, 마지막 문제 후 `goTo('end')`

### 탭 입력

- [ ] `dock.js` — `pointerdown`/`pointerup` 이벤트로 선택지 칩 탭 처리
- [ ] `dock.js` — 탭 후 빈칸 슬롯 배치 + 500ms 내 정답 판정 트리거
- [ ] `dock.js` — 배치된 칩 재탭 → 도크 반환 (응답 확정 전까지만)

### 완료 화면

- [ ] `game.js` — `showEndScreen()` — 점수·총 문제수·정답률 표시
- [ ] `game.js` — 오답 목록 렌더링 (틀린 문장·선택한 답·정답 병기)
- [ ] `game.js` — 세션 완료 시 `saveSession()` + `saveLeaderboard()` 호출

### TTS / 효과음

- [ ] `tts.js` — `speak(text, rate=0.85, lang='ko-KR')`, `cancelSpeech()` 구현
- [ ] `tts.js` — 미지원 브라우저 감지 → 설정 토글 자동 비활성화
- [ ] `sound.js` — `playCorrect()` — 정답 효과음 (OscillatorNode)
- [ ] `sound.js` — `playWrong()` — 오답 효과음
- [ ] `sound.js` — AudioContext 첫 인터랙션 후 생성 (자동재생 정책 대응)

### UI 유틸

- [ ] `ui.js` — `goTo(screenName)` — `cancelSpeech()` + 타이머 중단 후 화면 전환
- [ ] `ui.js` — 화면 전환 시 새 화면 첫 인터랙티브 요소 `focus()` 이동

---

## M3 — 페이딩·난이도 시스템

### 3단 단서 페이딩

- [ ] `hint.js` — `renderHint(item, level)` 구현
  - level 0: 단서 DOM 제거
  - level 1: `highlight` 인덱스 기반 `<mark class="hl">` 래핑 + 음뜻 라벨 `<span class="hint-label">` 삽입
  - level 2: 라벨 `display:none`, `<mark>` 유지
  - level 3: `<mark>` 제거 → 단서 완전 소거, 힌트 버튼 비활성화
- [ ] `hint.js` — 힌트 버튼 클릭 핸들러: `hintLevel` 1씩 증가, 응답 후 비활성화
- [ ] `hint.js` — 힌트 사용 여부 `hintLevelUsed` 세션 기록 저장
- [ ] `hint.js` — `hintEnabled === false` 설정 시 힌트 버튼 미표시

### 드래그 + 자성 스냅

- [ ] `dock.js` — `pointermove` + `pointerup` 이벤트로 드래그 구현 (`touch-action: none`)
- [ ] `dock.js` — 드래그 중 칩: `opacity: 0.7` + `transform: scale(1.08)`
- [ ] `dock.js` — ±30dp 범위 내 빈칸 슬롯 스냅 흡착 (`transition: all 0.15s ease-out`)
- [ ] `dock.js` — 범위 밖 드롭 → 칩 원 위치 복귀 애니메이션
- [ ] `game.css` — `will-change: transform` 드래그 칩 레이어 승격

### 가로 모드 대응

- [ ] `game.css` — `@media (orientation: landscape) and (max-height: 700px)` 2-column 그리드
  - 문장 카드: `grid-column: 1`
  - 단서 영역 + 도크: `grid-column: 2`

### 난이도 설정 화면

- [ ] `settings.js` — 난이도(easy/medium/hard/all)·문제수(5/10/20)·힌트·TTS·효과음·이름 입력 UI 렌더링
- [ ] `settings.js` — 설정 변경 시 즉시 `saveSettings()` 호출
- [ ] `settings.js` — `loadSettings()` on 앱 시작, 없으면 기본값 적용

---

## M4 — PWA·리더보드

### Service Worker

- [ ] `sw.js` — `CACHE_VERSION = '9_sentence_clue_garden-v1'` 설정
- [ ] `sw.js` — `install` 이벤트: `CACHE_ASSETS` 전체 프리캐시 (`cache.addAll`)
- [ ] `sw.js` — `activate` 이벤트: 이전 `CACHE_VERSION` 캐시 삭제
- [ ] `sw.js` — `fetch` 이벤트: Cache-First + Network-Fallback 전략
- [ ] `index.html` — SW 등록 `<script>` 상대경로 `'./sw.js'` 사용

### 매니페스트

- [ ] `manifest.json` — `start_url: './'`, `scope: './'` (상대 경로 필수)
- [ ] `manifest.json` — `theme_color: '#FF7757'`, `background_color: '#FFF6E4'`
- [ ] `icons/icon-192.png`, `icons/icon-512.png` 실제 아이콘 이미지 준비

### 리더보드 화면

- [ ] `leaderboard.js` — `renderLeaderboard()` — 상위 10개 렌더링
- [ ] `leaderboard.js` — 정렬 옵션: 점수순 / 날짜순 토글
- [ ] `leaderboard.js` — 각 행: `.profile-item` 패턴 (white 배경, navy 테두리, 3px 하단 그림자)
- [ ] `leaderboard.js` — 점수 0이면 "기록 없음" 빈 상태 표시

---

## M5 — QA

### 기능 검증

- [ ] 포트 4331 `npx serve -l 4331` → 홈 화면 정상 로드
- [ ] 설정 → 난이도·문제수 변경 후 새로고침 → 설정 유지
- [ ] Incognito 모드 → localStorage 실패해도 게임 진행 가능
- [ ] 힌트 버튼 탭 3회 → level1 → level2 → level3(단서 제거) 순서 정상
- [ ] 힌트 버튼: 응답 완료 후 비활성화 확인
- [ ] 도크 선택지 드래그 → ±30dp 스냅 흡착 동작 확인
- [ ] 도크 선택지 드래그 → 범위 밖 드롭 → 원 위치 복귀 확인
- [ ] 정답 탭 → mint 피드백 + TTS → 1.5초 후 다음 문제
- [ ] 오답 탭 → red 피드백 + TTS → 1.5초 후 다음 문제
- [ ] 빈칸에 배치된 칩 재탭 → 도크 반환 (응답 확정 전)
- [ ] 게임 완료 → 완료 화면 점수·정답률 정상 표시
- [ ] 완료 화면 → 리더보드 진입 → 최신 기록 상단 표시
- [ ] 다시 하기 → 직전 문제 중복 ≤ 20%
- [ ] 빈칸 2개 이상 문제 데이터 → 유효성 검사에서 거부 확인
- [ ] TTS 미지원 브라우저 → 설정 토글 비활성화
- [ ] PWA 설치 → 홈 화면 추가 → 오프라인 실행
- [ ] 세로·가로 모드 전환 → 레이아웃 정상 (가로: 2-column 그리드)

---

## 디자인 일관성 체크리스트

> `1_chosung_quiz/src/css/{tokens,screens,components}.css`와 픽셀 단위 일치 여부를 구현 완료 후 검증한다.

### 폰트

- [ ] Google Fonts `<link>` — `Jua` + `Gowun Dodum` 두 폰트 모두 포함 (`display=swap`)
- [ ] 홈 화면 제목: `font-family: 'Jua'`, `font-size: 3rem`, `letter-spacing: 2px`, `color: var(--coral)`
- [ ] 설정 화면 제목: `font-family: 'Jua'`, `font-size: 1.8rem`, `color: var(--coral)`
- [ ] 완료 화면 제목: `font-family: 'Jua'`, `font-size: 2.1rem`, `color: var(--coral)`
- [ ] 섹션 레이블(설정): `font-family: 'Jua'`, `font-size: 1.05rem`
- [ ] 본문·설명·부제목: `font-family: 'Gowun Dodum'`, `font-size: clamp(0.9rem, 3vw, 1.2rem)`
- [ ] 게임 문장 본문: `font-family: 'Gowun Dodum'`, `font-size: clamp(1.1rem, 4vw, 1.5rem)`
- [ ] 도크 선택지 칩: `font-family: 'Jua'`, `font-size: clamp(1rem, 3.5vw, 1.3rem)`

### 색상 토큰

- [ ] `--coral: #FF7757` — 주요 강조·버튼·제목에 사용, 하드코딩 없음
- [ ] `--coral-dark: #d45a40` — 버튼 그림자 전용
- [ ] `--navy: #2D3047` — 본문 텍스트·테두리
- [ ] `--cream: #FFF6E4` — 전체 배경, 배경에 직접 hex 사용 금지
- [ ] `--mint: #6BCAB8` — 정답 피드백·보조 강조
- [ ] `--yellow: #FFD166` — 단서 하이라이트
- [ ] `--red: #E84545` — 오답 피드백·경고
- [ ] `--gray: #E5E1D6` — 비활성 선택지·구분선
- [ ] `tokens.css` / `components.css` 내 임의 하드코딩 값 없음 (복제 내용 원본과 diff 검사)
- [ ] `game.css` 내 새 CSS 변수 추가 없음 (기존 토큰 변수만 참조)

### 버튼 규격

- [ ] `.btn` 기본: `font-size: 1.2rem`, `padding: 14px 28px`, `border-radius: 100px`
- [ ] `.btn` 기본 배경: `background: var(--coral); color: #fff`
- [ ] `.btn` 기본 그림자: `box-shadow: 0 5px 0 var(--coral-dark)`
- [ ] `.btn.big`: `font-size: 1.45rem`, `padding: 16px 44px`
- [ ] `.btn.small`: `font-size: 1rem`, `padding: 10px 20px`
- [ ] 버튼 눌림 상태: `transform: translateY(4px)`, `box-shadow: 0 1px 0 var(--coral-dark)`
- [ ] 버튼 레이블: `font-family: 'Jua'`, `letter-spacing: 0.5px`

### 홈·설정·리더보드·완료 화면 레이아웃

- [ ] 전체 배경: `background: var(--cream)`
- [ ] 레이아웃: `height: 100dvh`, `flex-direction: column`, 중앙 정렬
- [ ] 카드 컨테이너: `background: white`, `border: 3px solid var(--navy)`, `border-radius: 24px`, `box-shadow: 0 6px 0 var(--navy)`, `padding: 24px`
- [ ] 최대 너비: `max-width: 480px; margin: auto`
- [ ] 리더보드 각 행: `.profile-item` — white 배경, navy 테두리, 3px 하단 그림자
- [ ] 터치 타겟: 도크 선택지 칩 최소 `56dp`, 기타 버튼 최소 `44dp`

### 공통 UX 원칙

- [ ] 한글 IME 입력 없음 — 모든 어휘 입력은 탭·드래그로만
- [ ] `height: 100dvh` 사용 (iOS Safari 주소창 대응)
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` 포함
- [ ] 정답/오답 피드백: 색상 + 텍스트 레이블(⭕/❌) 병기 (색각 접근성)
- [ ] 단서 하이라이트: yellow + 밑줄 조합 (색각 이상 대비)

---

## 시리즈 연속성 체크

### S8 (이전: 8_vocabulary_tree) 핸드오프

- [ ] `sentences.js`의 `answer`·`choices` 어휘가 S8 한자어 DB와 동일 어휘 ID 체계 사용 확인
- [ ] S8 easy 수준 어휘가 S9 easy 문제에 출제됨 — 난이도 연계 매핑 문서화
- [ ] S8에서 학습한 한자어가 S9 문장 문맥 안에서 자연스럽게 사용되었는지 리뷰
- [ ] S8 distractor와 S9 distractor 어휘 중복 허용 여부 결정 및 기록

### S10 (다음: 10_literacy_decoder) 데이터 핸드오프

- [ ] S9 완료 플레이어의 `difficulty` 수준 정보를 S10에서 참조할 수 있도록 스토리지 키 설계 검토
- [ ] S9 IndexedDB `sessions` 데이터 구조가 S10에서 이어받을 수 있는 포맷인지 확인
- [ ] S9 `hard` 도달 기준(정답률 기준점)을 S10 시작 난이도와 연결하는 방안 오픈 이슈로 등록

### 시리즈 공통 PWA 충돌 방지

- [ ] `CACHE_VERSION = '9_sentence_clue_garden-v1'` — 타 게임 SW 캐시 이름과 중복 없음 확인
- [ ] localStorage 접두사 `9scg_` — 타 게임(예: S8 접두사) 충돌 없음 확인
- [ ] IndexedDB DB명 `9scg_db` — 타 게임 DB명과 충돌 없음 확인
- [ ] `manifest.json` `start_url: './'`, `scope: './'` 상대 경로 — 서브디렉터리 서빙 시 스코프 충돌 없음 확인

---

## 리스크 / 오픈 이슈

| # | 항목 | 분류 | 내용 | 우선순위 |
|---|---|---|---|---|
| R1 | 단서 하이라이트 인덱스 오류 | 기술 리스크 | `[ ]` 마커 포함 길이 기준 인덱스 계산이 렌더링 후 치환과 불일치할 수 있음. 유닛 테스트 필수 | 높음 |
| R2 | S8 어휘 DB 미정의 | 데이터 의존성 | S8 게임의 어휘 ID 체계가 아직 확정되지 않아 S9 데이터 설계 시 임시 체계 사용 가능성 | 높음 |
| R3 | iOS Safari 드래그 이벤트 | 브라우저 호환 | `touch-action: none` 설정 후에도 Safari에서 `pointermove` 발화 지연 보고 사례 있음. 실기 검증 필요 | 중간 |
| R4 | IndexedDB Private 브라우징 | 저장소 호환 | iOS Safari Incognito에서 IndexedDB 완전 차단 가능. `try/catch` 무시 전략으로 처리하되 실기 확인 필요 | 중간 |
| R5 | 문제 수 부족 | 데이터 리스크 | hard 문제 10개로 `questionCount: 20` 설정 시 반복 출제 비율 높음. 최소 20개로 확충 검토 | 중간 |
| R6 | S10 핸드오프 스펙 미확정 | 설계 의존성 | S10 게임의 입력 데이터 요구사항이 미정. S9 IndexedDB 스키마 변경 가능성 있음 | 낮음 |
| R7 | PWA 아이콘 미제작 | 에셋 | `icon-192.png`, `icon-512.png` 실제 아이콘 이미지 제작 미착수 | 낮음 |
| R8 | 보스 없음으로 인한 동기부여 저하 | UX 리스크 | 보스 스테이지 없이 난이도 상승만으로 학습 긴장감 유지 가능한지 플레이테스트 필요 | 낮음 |

---

## 현재 상태

**설계 완료, 구현 미착수**

| 문서 | 상태 |
|---|---|
| PRD.md | 미작성 (TRD 기반 기획 내용 참조) |
| TRD.md | 완료 (v1.0, 2026-06-10) |
| PLAN.md | 완료 (v1.0, 2026-06-10) — 본 파일 |
| 코드 구현 | **미착수** |

다음 작업 시작점: **M0 디자인 시스템 스캐폴딩** — `1_chosung_quiz/src/css/` 파일 복제부터.
