# PLAN — 모음 찾기 (2_vowel_finder)

> 구현 계획서
> Last updated: 2026-06-10

---

## 현재 상태

**설계 완료 / 구현 미착수**

- PRD.md — 완료
- TRD.md — 완료
- PLAN.md — 완료 (본 문서)
- 게임 코드(HTML/CSS/JS) — **미착수**

---

## 마일스톤 개요

| 마일스톤 | 내용 | 선행 조건 |
|---|---|---|
| M0 | 디자인 시스템 스캐폴딩 — 공용 화면 이식 | 없음 |
| M1 | 데이터 레이어 — 모음 풀·문항 구성 | M0 |
| M2 | 게임 플레이 로직 — Level 0·Level 1·드래그 온보딩 | M1 |
| M3 | 페이딩·난이도 — 비계 단계·설정 연동 | M2 |
| M4 | PWA·리더보드 | M3 |
| M5 | QA — 수동 테스트·접근성·성능 | M4 |
| M6 | Level 0 음성 전용 페이딩 (기능 추가) | M2-B |

---

## M0 — 디자인 시스템 스캐폴딩

> `1_chosung_quiz/src/css/{tokens,screens,components}.css`를 복제·이식하여 공용 화면(홈·설정·리더보드·완료)을 먼저 구성한다. 게임 고유 화면 구현 전 디자인 토큰이 정합한지 확인한다.

- [x] 디렉터리 골격 생성: `2_vowel_finder/` 루트 + `src/css/`, `src/js/`, `src/data/`, `docs/`, `icons/`
- [x] `package.json` 작성 (`"dev": "npx serve -l 4328"`)
- [x] `index.html` 뼈대 작성 — Google Fonts `<link>`, CSS 5파일 순서 로드, SW 등록 스크립트
- [x] `src/css/tokens.css` — `1_chosung_quiz` 정본 복제 (색상 토큰 17개, 시맨틱 토큰 5개)
- [x] `src/css/base.css` — 리셋 + `min-height:100dvh` + `overflow-x:hidden` + 세로 고정
- [x] `src/css/components.css` — `.btn` / `.btn.big` / `.btn.small` / `.btn.mint` / `.btn.ghost` / `.toggle` 복제
- [x] `src/css/screens.css` — `#start-screen`, `#settings-screen`, `#leaderboard-screen`, `#end-screen` 복제
- [x] `src/css/game.css` — 빈 파일 생성 (M2에서 채움)
- [x] 홈/시작 화면 HTML 마크업 — 제목 "모음 찾기", 부제, `.btn.big` "시작하기" 버튼
- [x] 설정 화면 HTML 마크업 — TTS 토글, 효과음 토글, 난이도 칩(5개/10개)
- [x] 완료 화면 HTML 마크업 — 정답률 표시, 별점 1~3, "음절 조립소로 가기" CTA, "다시 하기" 버튼
- [x] 리더보드 화면 HTML 마크업 — 최근 5세션 막대 그래프 영역, 별점 아이콘, 날짜·소요시간
- [x] 포트 4328에서 4개 공용 화면 브라우저 확인 (게임 화면 없이)

---

## M1 — 데이터 레이어

- [x] `src/data/vowels.js` 작성 — `VOWELS` 배열 10항목 (`id`, `char`, `sound`, `shape`, `order`)
- [x] `src/data/vowels.js` — `LEVEL0_ROUNDS` 10항목 (정답 + 오답 3개, 발음·형태 유사 기준 수동 큐레이션)
- [x] `src/js/config.js` 작성 — `SNAP_RADIUS=20`, `L0_COUNT_DEFAULT=5`, `SCAFFOLD_THRESHOLDS`, `FEEDBACK_DELAY_CORRECT=800`, `FEEDBACK_DELAY_WRONG=1200`, `SNAP_FEEDBACK_DELAY=600`, `SCORE_MAX=20`
- [x] `src/js/state.js` 작성 — `settings` / `game` / `session` 3-레이어 싱글톤 (TRD §3.2 스키마)
- [x] `src/js/storage.js` 작성 — `vowel_finder_` 접두사, `loadSettings()` / `saveSettings()` / `saveScore()` / `loadScores()`, `try/catch` Incognito 대응
- [x] 별점 산출 함수 `calcStars(l0Acc, l1Acc, dragDone)` — 3점/2점/1점 규칙 (TRD §8.1)
- [x] `buildLevel0Questions(vowelCount)` 알고리즘 검증 — 셔플 후 `vowelCount`개 추출, 중복 없음
- [x] `buildLevel1Queue()` 알고리즘 검증 — 10개 전체 셔플

---

## M2 — 게임 플레이 로직

### M2-A: 공통 인프라

- [x] `src/js/tts.js` — Web Speech API 래퍼, `ko-KR` 우선, `voiceschanged` 비동기 대기, `unlock()`, graceful fallback
- [x] `src/js/sound.js` — Web Audio API 오실레이터 기반 `playCorrect()` / `playWrong()` / `playSnap()` (외부 파일 없음)
- [x] `src/js/ui.js` — `goTo(screenId)`: 화면 전환 + `cancelSpeech()` + `stopDrag()` + `clearFeedback()` 공통 부작용
- [x] `src/js/main.js` — 진입점: 모듈 임포트, `window` 전역 노출 (`tapChoice`, `tapBucket`, `goTo`, `speakVowel` 등), 첫 `pointerdown`에서 AudioContext resume
- [x] 진행률 HUD (`#progress-hud`) HTML·CSS — 상단 고정, 현재 문항/전체, 정답 수, `.progress-hud` Jua 폰트 1rem

### M2-B: Level 0 — 소리 매칭

- [x] `src/css/game.css` — `.vowel-card`, `.choices-grid`, `.choice-btn` (64dp 최소 터치 타겟)
- [x] `src/js/level0.js` — `initLevel0()`: 문항 풀 빌드, 첫 문항 렌더링
- [x] `level0.js` — `renderQuestion(idx)`: 대형 모음 카드(Jua clamp 4rem~7rem) + TTS 자동 재생 + 보기 3~4개 격자
- [x] `level0.js` — `tapChoice(vowelId)`: `state.game.answered` 중복 탭 방지 → 정오답 판정 → 피드백 → 800/1200ms 후 진행
- [x] 정답 피드백: `.vowel-card` mint 테두리·배경 + `playCorrect()` + TTS 재발화
- [x] 오답 피드백: 흔들기 애니메이션(`keyframes shake`) + `playWrong()`
- [x] `aria-live="polite"` 피드백 텍스트 영역 — 정오답 텍스트 출력
- [x] Level 0 완료 → `state.game.phase = 'level1'` → `goTo('game-level1')`

### M2-C: Level 1 — 형태 분류

- [x] `src/css/game.css` — `.bucket`, `.bucket.hover-active`, `.bucket-label`, `.bucket-example`
- [x] `src/js/level1.js` — `initLevel1()`: 큐 빌드, 비계 단계 초기화, 첫 문항 렌더링
- [x] `level1.js` — `renderBucketQuestion(idx)`: 모음 카드 + 세로형 통 + 가로형 통 2구역
- [x] `level1.js` — `tapBucket(shape)`: 탭으로 통 배정 → 정오답 판정 → 피드백
- [x] 비계 단계(`scaffoldLevel`) 렌더링: `0`=통 이름+예시 모음, `1`=통 이름만, `2`=아이콘만
- [x] `scaffoldLevel` 자동 전환: 문항 인덱스 0~2 → 0단계, 3~6 → 1단계, 7~9 → 2단계
- [x] 드래그 분류 선택적 지원 — Level 1에서 탭과 드래그 병행 허용 (`drag.js` 호출)
- [x] Level 1 완료 → `goTo('drag-onboarding')`

### M2-D: 드래그 온보딩

- [x] `src/js/drag.js` — `initDrag(cardEl, dropZones)`: Pointer Events 기반, `setPointerCapture`, `requestAnimationFrame` 래핑
- [x] `drag.js` — `findNearestBucket(dropZones, px, py)`: `devicePixelRatio` 적용 ±20dp 스냅 계산 (TRD §9.3)
- [x] `drag.js` — `snapToZone(cardEl, zone)`: transform 애니메이션 + `playSnap()` + `onDrop(zoneId)` 콜백
- [x] `drag.js` — `resetCard(cardEl)`: 카드 원위치 복귀
- [x] `src/css/game.css` — `.onboarding-arrow` (점선 dashed + `arrowPulse` 키프레임)
- [x] `src/js/onboarding.js` — 화면: ㅏ 카드 고정 + 목표 네모 칸, 거리 화면 폭 20% 이내
- [x] `onboarding.js` — TTS "이쪽으로 끌어봐요!" + 점선 화살표 가이드
- [x] 스냅 성공 → `playSnap()` + 완료 애니메이션 → `goTo('end-screen')`
- [x] 스냅 실패(±20dp 초과) → 카드 원위치 + 재시도 안내 텍스트

---

## M3 — 페이딩·난이도

- [x] `src/js/settings.js` — 설정 화면 렌더링: TTS·효과음 토글 바인딩, 난이도 칩(`vowelCount` 5/10) 선택
- [x] 설정 변경 → `saveSettings()` 즉시 반영
- [x] Level 0 `vowelCount` 설정값 → `buildLevel0Questions(vowelCount)` 연동 확인
- [x] `scaffoldLevel` 단계별 UI 전환 시각 확인 — 비계 항목이 점진 제거되는지
- [x] 정답률 ≥ 80% 달성 시 완료 화면 Stage 2 Level 1 직행 안내 메시지 표시
- [x] 정답률 미달 시 Level 0 반복 권장 안내 메시지 표시
- [x] 완료 화면 — 가로 전환 예고 문구 "다음 게임은 가로 화면을 써요!" 1줄 삽입

---

## M4 — PWA·리더보드

- [x] `manifest.json` 작성 — `name`, `short_name`, `start_url:"./"`, `scope:"./"`, `display:"standalone"`, `background_color:"#FFF6E4"`, `theme_color:"#FF7757"`, `orientation:"portrait"`
- [x] `icons/icon-192.png` + `icons/icon-512.png` 준비 (placeholder 포함)
- [x] `sw.js` 작성 — `CACHE_VERSION = '2_vowel_finder-v1'`, `STATIC_ASSETS` 전체 목록, install/activate/fetch 핸들러
- [x] SW 등록 스크립트 `index.html` 삽입 — `'./sw.js'` 상대 경로
- [x] 오프라인 동작 확인: DevTools Network "Offline" → 캐시된 정적 에셋으로 게임 실행 (캐시 `2_vowel_finder-v1`에 24개 에셋 적재·`caches.match` 응답 확인)
- [x] `src/js/leaderboard.js` — `renderLeaderboard()`: `vowel_finder_scores` 읽어 최근 5세션 DOM 생성
- [x] 리더보드 — L0·L1 정답률 CSS 폭 비례 막대, 별점 아이콘, 날짜·소요시간, 최고 기록 하이라이트
- [x] 세션 완료 시 `saveScore(sessionRecord)` → `vowel_finder_scores` 배열 최신 20건 유지

> **개발 시 SW 캐시 해제 방법**: fetch가 cache-first(TRD §6.2)라 코드 수정 후에도 구버전이 응답될 수 있다.
> DevTools → Application → Service Workers에서 "Update on reload" 체크 + "Unregister", 또는 Application → Storage → "Clear site data".
> 콘솔: `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())); caches.keys().then(ks => ks.forEach(k => caches.delete(k)));` 후 강력 새로고침(Ctrl+Shift+R).
> 배포 시 코드 변경이 있으면 `CACHE_VERSION` 숫자를 올려 activate 단계에서 구캐시를 정리한다.

---

## M5 — QA

- [ ] TRD §12 수동 테스트 체크리스트 전항목 통과 (13개 항목)
- [ ] Level 0 탭 정답/오답 피드백 타이밍 확인 (800ms / 1200ms)
- [ ] Level 1 탭·드래그 분류 정오답 판정 확인
- [ ] 드래그 온보딩 ±20dp 스냅 성공·실패 양쪽 확인
- [ ] TTS 미지원 브라우저 — 설정 토글 비활성화, 게임 정상 동작
- [ ] Incognito 모드 — localStorage 실패해도 게임 정상 동작
- [ ] 리더보드 — 세션 완료 후 점수 저장 + 화면 반영
- [ ] PWA 오프라인 — TTS 제외 게임 실행 확인
- [ ] 세로 모드 유지 — 가로 전환 시 레이아웃 깨짐 없음
- [ ] `aria-label` / `aria-live` 스크린 리더 출력 확인
- [ ] iOS Safari 100dvh + 주소창 대응 확인
- [ ] 성능: 초기 로드 각 JS 파일 < 10KB, 애니메이션 `transform`/`opacity` 전용 확인

---

## M6 — Level 0 음성 전용 페이딩

> 후반 50% 문항에서 모음 카드 글자를 숨기고 청각 단서만 제공 — Level 1 `scaffoldLevel`과 동일한 페이딩 패턴으로 G1(자소-음소 재인 자동화) 평가 정밀화 (PRD §7.2, TRD §9.5)

- [x] `src/js/config.js` — `L0_AUDIO_ONLY_RATIO = 0.5` 상수 추가 (임계값 하드코딩 금지)
- [x] `src/js/level0.js` — `renderQuestion`: `idx >= Math.ceil(전체 문항 수 * L0_AUDIO_ONLY_RATIO)` 이고 TTS 사용 가능 시 카드 글자 숨김 + 🔊 placeholder
- [x] TTS fallback — `TTS_AVAILABLE`(tts.js 기존 감지 로직 재사용) `&& state.settings.ttsEnabled` 미충족 시 모든 문항에서 카드 글자 항상 표시 (게임이 풀 수 없는 상태 방지)
- [x] 접근성 — 음성 전용 카드 `aria-label="소리를 듣고 같은 모음을 찾아요"`, 다시 듣기 버튼 `aria-label="소리 듣기"` 유지
- [x] 정답 시 숨겨졌던 글자 공개 후 `correct` 피드백 (자소-음소 연결 재강화)
- [x] `src/css/game.css` — `.vowel-card.audio-only` placeholder 스타일 (tokens 변수만: `--color-surface2`, `--color-text-dim`, dashed 테두리)
- [x] 다시 듣기 버튼(`.tts-btn`, 48dp) 양쪽 모드 항상 표시 — 기존 마크업 유지 확인
- [x] 문항 시작 시 TTS 자동 재생 기존 동작 유지 확인
- [x] 문서 갱신 — PRD §5·§7.2 / TRD §3.2·§9.5·§12 / PLAN 본 섹션

---

## 디자인 일관성 체크리스트

> 공용 화면(홈·설정·리더보드·완료)이 `1_chosung_quiz`와 픽셀 단위로 일치하는지 구현 완료 후 검증한다.

### 폰트

- [ ] `<link>` Google Fonts — Jua + Gowun Dodum 양쪽 모두 로드 (`display=swap`)
- [ ] 홈 화면 제목: `font-family:'Jua',sans-serif; font-size:3rem; letter-spacing:2px; color:var(--coral)`
- [ ] 설정 화면 제목: `font-family:'Jua',sans-serif; font-size:1.8rem; color:var(--coral)`
- [ ] 완료 화면 제목: `font-family:'Jua',sans-serif; font-size:2.1rem; color:var(--coral)`
- [ ] 본문·부제: `font-family:'Gowun Dodum',sans-serif; font-size:clamp(0.9rem,3vw,1.2rem)`
- [ ] 버튼 레이블: `font-family:'Jua',sans-serif; letter-spacing:0.5px`
- [ ] 설정 섹션 레이블: `font-family:'Jua',sans-serif; font-size:1.05rem`

### 색상 토큰

- [ ] `--cream: #FFF6E4` 전체 배경으로 사용
- [ ] `--coral: #FF7757` 주조색 — 제목·버튼·강조
- [ ] `--coral-dark: #d45a40` 버튼 그림자·눌림
- [ ] `--mint: #6BCAB8` 정답 피드백·토글 ON
- [ ] `--navy: #2D3047` 텍스트·테두리
- [ ] `--yellow: #FFD166` 점수 배지·하이라이트
- [ ] `--red: #E84545` 오답 피드백·경고
- [ ] `tokens.css`에 없는 커스텀 색상값 직접 사용 없음 (하드코딩 금지)

### 버튼

- [ ] `.btn`: `font-size:1.2rem; padding:14px 28px; border-radius:100px; background:var(--coral); color:#fff; box-shadow:0 5px 0 var(--coral-dark)`
- [ ] `.btn.big`: `font-size:1.45rem; padding:16px 44px`
- [ ] `.btn.small`: `font-size:1rem; padding:10px 20px`
- [ ] `:active` 눌림: `transform:translateY(4px); box-shadow:0 1px 0 var(--coral-dark)`
- [ ] 공용 화면에서 `.btn` 클래스 재정의 없음 (`game.css`에서만 확장 허용)

### 홈/시작 화면

- [ ] 배경 `var(--cream)`, 제목 Jua 3rem coral, 부제 Gowun Dodum, `.btn.big` "시작하기"
- [ ] 설정·리더보드 진입 링크 존재
- [ ] `1_chosung_quiz` 홈 화면과 레이아웃 구조 동일 (세로 중앙 정렬, 컨테이너 max-width 480px)

### 설정 화면

- [ ] 제목 Jua 1.8rem coral, 섹션 카드 `background:white; border:2px solid var(--navy); border-radius:20px; box-shadow:0 4px 0 var(--navy)`
- [ ] 토글 컴포넌트 규격: `width:52px; height:30px; thumb:22px` — `components.css` 복제값 그대로
- [ ] 난이도 칩 스타일 `1_chosung_quiz` 칩과 동일

### 리더보드 화면

- [ ] 동일 토큰·폰트·버튼 규격 적용 — 별도 스타일 재정의 없음
- [ ] 막대 그래프: CSS `width` 비례 (외부 차트 라이브러리 미사용)
- [ ] 별점 아이콘 색상 `var(--yellow)`

### 완료 화면

- [ ] 제목 Jua 2.1rem coral, 배경 `var(--cream)`
- [ ] `.btn.big` "다시 하기" + `.btn.big` "음절 조립소로 가기" 두 버튼
- [ ] 가로 전환 예고 문구 Gowun Dodum clamp(0.9rem,3vw,1.2rem) navy

### 공통 레이아웃

- [ ] `max-width:480px; margin:0 auto; padding:20px 16px` 컨테이너 동일
- [ ] `min-height:100dvh` iOS Safari 주소창 대응
- [ ] 유아 터치 타겟 최소 64dp (모음 카드), 44dp (기타 버튼)

---

## 시리즈 연속성 체크

### 이전 단계 — Stage 1 (1_chosung_quiz)

- [ ] Stage 1 미경험 아동도 독립 진입 가능 — 모음 전용 콘텐츠, 초성 데이터 의존 없음
- [ ] `1_chosung_quiz/src/data/words.js` 임포트 없음 (의존성 단절 확인)
- [ ] CSS 토큰 값이 `1_chosung_quiz/src/css/tokens.css` 정본과 수치 일치
- [ ] 화면 모드: 세로 유지 (Stage 1과 동일 — Stage 2 가로 전환 직전 마지막 세로 단계)
- [ ] 입력 패러다임: 탭 계승 + 드래그 온보딩 1스텝 추가 (Stage 1 탭 전용에서 점진 확장)

### 다음 단계 — Stage 2 (3_syllable_assembly)

- [ ] 출구 기술 G1(모음 10개 재인) + G2(세로/가로 형태 범주) + G3(±20dp 드래그 체험) 모두 커버
- [ ] 드래그 스냅 반경 `SNAP_RADIUS=20` — Stage 2 자모 슬롯 드래그와 동일 반경 유지
- [ ] localStorage 접두사 `vowel_finder_` — `syllable_assembly_` 네임스페이스 충돌 없음
- [ ] SW `CACHE_VERSION = '2_vowel_finder-v1'` — 타 게임 캐시 키와 충돌 없음
- [ ] 완료 화면에 "다음 게임은 가로 화면을 써요!" 1줄 가로 전환 예고 포함
- [ ] 정답률 ≥ 80% 시 "음절 조립소로 가기" CTA 강조 (Stage 2 Level 1 직행 안내)
- [ ] 정답률 미달 시 반복 권장 메시지 (SRL 게이팅 미구현 — 메시지로 대체)

---

## 리스크·오픈 이슈

| # | 이슈 | 유형 | 현황 |
|---|---|---|---|
| R1 | Level 0·Level 1 세션 경계 UX — 한 세션에서 연속 진행 vs 별도 버튼 구분 | UX 결정 | 미결 |
| R2 | ㅡ/ㅣ 형태 분류 기준 교육 출처 — 한때 `vowels.js`에서 ㅡ=vertical, ㅣ=horizontal로 잘못 설정했었음 | 콘텐츠 | **해결됨** — 기본 획 방향 + 자음 결합 위치 기준 확정: 세로모음 ㅏ ㅑ ㅓ ㅕ ㅣ(자음 오른쪽, 예: 가·디), 가로모음 ㅗ ㅛ ㅜ ㅠ ㅡ(자음 아래, 예: 고·므). vowels.js·index.html·PRD §7.1 정정 완료 (BUG.md 참조) |
| R3 | 드래그 온보딩 위치 — Level 1 마지막 문항에 붙일지 Level 0~1 사이 독립 화면으로 둘지 | 구조 결정 | 미결 |
| R4 | Stage 2 내장(Level 0 모듈) vs 독립 실행 URL 라우팅 전략 | 아키텍처 | 미결 |
| R5 | Web Speech API TTS 온라인 의존 — 오프라인 시 TTS 침묵, graceful degradation 범위 | 기술 | SW 캐시 제외 확정, 토글 자동 비활성화로 대응 예정 |
| R6 | iOS Safari `screen.orientation.lock()` 미지원 — JS 세로 잠금 불가 시 CSS+manifest 조합으로만 처리 | 기술 | 알려진 제약, 우회 방안 문서화 |
| R7 | Level 1 `scaffoldLevel` 전환 임계값(0~2→3~6→7~9) 유아 학습 효과 — 실제 사용 데이터 없음 | 학습 효과 | 출시 후 성공 지표(정답률 ≥ 75%)로 검증 |

---

## 기술 부채·개선 후보

| 항목 | 우선순위 | 메모 |
|---|---|---|
| Vitest 유닛 테스트 | Medium | `buildLevel0Questions`, `findNearestBucket`, `scaffoldLevel` 우선 |
| Playwright E2E | Low | Level 0 탭 시나리오 3개 |
| IndexedDB 마이그레이션 | Low | localStorage 20건 초과 누적 시 |
| 시리즈 공통 CSS 패키지화 | Low | 수동 동기화 제거 — monorepo 구조 또는 공유 심볼릭 링크 |
| TypeScript 마이그레이션 | Low | state/drag 모듈 타입 이득 |

---

## 디렉터리 구조 (목표)

```
2_vowel_finder/
├── index.html
├── manifest.json
├── sw.js
├── package.json
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   └── PLAN.md          ← 본 문서
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── css/
    │   ├── tokens.css       (1_chosung_quiz 복제·동기화)
    │   ├── base.css
    │   ├── components.css   (1_chosung_quiz 복제·동기화)
    │   ├── screens.css      (1_chosung_quiz 복제·동기화)
    │   └── game.css         (게임 고유 확장)
    ├── js/
    │   ├── main.js
    │   ├── config.js
    │   ├── state.js
    │   ├── storage.js
    │   ├── tts.js
    │   ├── sound.js
    │   ├── ui.js
    │   ├── drag.js
    │   ├── leaderboard.js
    │   ├── settings.js
    │   ├── level0.js
    │   ├── level1.js
    │   └── onboarding.js
    └── data/
        └── vowels.js
```

---

## 브랜치 전략 (예시)

```
main                        # 배포 가능한 안정 버전
├── dev                     # 통합 개발 브랜치
    ├── feat/m0-scaffold    # M0 디자인 시스템 이식
    ├── feat/m1-data        # M1 데이터 레이어
    ├── feat/m2-gameplay    # M2 게임 플레이 로직
    ├── feat/m3-difficulty  # M3 페이딩·난이도
    ├── feat/m4-pwa         # M4 PWA·리더보드
    └── fix/qa              # M5 QA 수정
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
