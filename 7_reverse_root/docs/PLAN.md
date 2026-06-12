# 🗂️ PLAN — 한자 뿌리 역분해 게임

> 개발 계획 및 진행 상태
> Last updated: 2026-06-12
> **현재 상태: 구현 완료 (M0~M4) — M5 QA 진행 중 (자동 검증 항목 점검 준비 완료, 실기기·인지 테스트는 수동 검증 대기)**

---

## 0. 현재 상태 요약

| 항목 | 상태 |
|------|------|
| PRD (제품 요구사항) | ✅ 완료 (`docs/PRD.md` — 구현 완료 상태 반영) |
| TRD (기술 요구사항) | ✅ 완료 (`docs/TRD.md` — 구현 완료 상태 반영) |
| PLAN (구현 계획) | ✅ 완료 (본 문서) |
| 게임 코드 구현 | ✅ M0~M4 전체 구현 완료 (M5 QA 진행 중 — 디자인 일관성·시리즈 연속성 코드 대조 완료, 실기기·인지 테스트는 수동 검증 대기) |
| HTML/CSS/JS 파일 | ✅ 전체 구현 완료 (`index.html`, CSS 5종, JS 모듈 15종, `hanja.js` 51자, `vocab.js` 15어휘, PWA manifest·SW·아이콘, `scripts/validate-data.mjs` 전 항목 PASS) |

> M0(디자인 시스템 스캐폴딩) 완료. 공용 CSS 복제 원본은 `5_compound_split/src/css/`(`1_chosung_quiz`에는 `src/css` 없음 — 인라인 CSS 단일 파일 게임). 이후 M1부터 마일스톤 순서대로 진행한다.

---

## 마일스톤 개요

| 마일스톤 | 내용 | 선행 조건 |
|---|---|---|
| M0 | 디자인 시스템 스캐폴딩 — 공용 화면 이식 | — |
| M1 | 데이터 레이어 — 한자·어휘 데이터 구축 | M0 |
| M2 | 게임 플레이 핵심 로직 — 라운드·판정·도크 | M1 |
| M3 | 힌트 페이딩·난이도 진행 — 비계 감소 흐름 | M2 |
| M4 | PWA·리더보드·영속화 — 배포 준비 | M3 |
| M5 | QA·디바이스 검증·인지 테스트 | M4 |

---

## M0 — 디자인 시스템 스캐폴딩

> 목표: 공용 화면(홈·설정·리더보드·완료)을 `1_chosung_quiz` 규격과 픽셀 단위로 일치시켜 이식. 게임 플레이 화면 골격 확보.

### 디렉터리 및 진입점

- [x] `7_reverse_root/` 폴더 생성, `index.html` 단일 페이지 진입점 작성
- [x] Google Fonts `<link>` 삽입 (`Jua`, `Gowun Dodum`) + `preconnect` 2개
- [x] `src/css/` 디렉터리 생성 및 CSS 파일 5종 생성 (`tokens.css`, `base.css`, `components.css`, `screens.css`, `game.css`)
- [x] `src/js/` 디렉터리 생성 및 JS 파일 스텁 생성 (14개 모듈)
- [x] `src/data/` 디렉터리 생성 (`hanja.js`, `vocab.js` 스텁)
- [x] `src/assets/icons/` 디렉터리 생성 (PWA 아이콘 플레이스홀더)

### 공용 CSS 이식 (`1_chosung_quiz/src/css/` → 복제)

- [x] `tokens.css` — 시리즈 공용 토큰 완전 복제 (실제 원본: `5_compound_split/src/css/tokens.css` — `1_chosung_quiz`에는 `src/css`가 없음). 게임 고유 추가 토큰 (`--hint-l1-bg`, `--hint-l2-bg`, `--decomp-card-bg`, `--decomp-card-radius`) `game.css` `:root` 확장으로 추가
- [x] `base.css` — 시리즈 공용 base 기반 복제. `touch-action: manipulation`, `100dvh`, 가로 overflow 차단 동일 적용
- [x] `components.css` — 시리즈 공용 components 복제. `.btn`, `.btn.big`, `.btn.small`, `.btn.mint`, `.btn.ghost`, `.toggle`, `.chip` 클래스 완전 동일 유지
- [x] `screens.css` — 시리즈 공용 screens 기반 복제. `start-screen`, `settings-screen`, `end-screen` 레이아웃 동일 유지. `leaderboard-screen` 클래스 포함

### 공용 화면 HTML 마크업

- [x] `#start-screen` — 제목(Jua, 3rem, `--coral`), `.btn.big` 시작 버튼, 리더보드 진입 `.btn.ghost`, 크레딧
- [x] `#settings-screen` — 제목(Jua, 1.8rem), TTS 토글, 효과음 토글, 힌트 표시 설정, 진행 초기화, `.btn.small` 저장/닫기
- [x] `#leaderboard-screen` — 제목(Jua, 1.8rem), 점수 목록 컨테이너, `.btn.small` 닫기
- [x] `#end-screen` — 제목(Jua, 2.1rem), 별 표시(--yellow), 정답률(Gowun Dodum), `.btn` 다시하기, `.btn.mint` 다음 단계
- [x] `#play-screen` — 진행률 바, 합성어 카드 영역, 힌트 오버레이 컨테이너, 한자 블록 도크 컨테이너

### CSS 로드 순서 확인

- [x] `index.html` `<head>` 내 CSS 링크 순서 고정: `tokens.css` → `base.css` → `components.css` → `screens.css` → `game.css`
- [x] `game.css`는 공용 CSS를 직접 수정하지 않고 선택자 확장만으로 덮어씀 원칙 준수 확인

---

## M1 — 데이터 레이어

> 목표: 역분해 게임에 필요한 한자 메타 데이터와 어휘 세트 확정·구현.

### 한자 데이터 (`src/data/hanja.js`)

- [x] `6_morpheme_detective/src/data/hanja.js` 파일 참조하여 사용 필드 확인 (`id`, `reading`, `meaning`, `grade`)
- [x] `vocab.js`에 등장하는 모든 한자 ID가 `6_morpheme_detective` 100자 풀 내에 있음을 교차 검증 (`scripts/validate-data.mjs` (b) 통과 — 51자, 코드포인트 단위 일치. '教' U+6559 사용, 이체자 '敎' U+654E 아님)
- [x] 신규 한자 0 원칙 확인 — `hanja.js`에 기지 100자 외 항목 없음
- [x] `HANJA` 객체 구조: 키=한자 문자, 값=`{ id, reading, meaning, grade }` 스키마로 작성

### 어휘 데이터 (`src/data/vocab.js`)

- [x] PRD §7.2 초기 설계 세트 15개 항목 전체 구현
  - ⚠ **교체 4건**: PRD §7.2 목록 중 100자 풀 밖 한자를 포함한 합성어를 풀 내 투명 2형태소 합성어로 교체 — 국어(國語, 語 풀 밖)→국민(國民), 도로(道路, 路 풀 밖)→학교(學校), 소방(消防, 消·防 풀 밖)→시장(市場), 인구(人口, 口 풀 밖)→전화(電話). 총 15개 유지. (R1 해소)
- [x] 각 항목 스키마: `{ word, components[2], hanja, distractors[2~3], difficulty }` 완성
- [x] 디스트랙터 3종 유형(음독 유사·의미 근접·무관) 각 항목에 배분 (음독 동음자가 풀에 없는 항목은 의미 근접 + 무관으로 구성, 항목별 유형 주석 명기)
- [x] `difficulty` 값(1/2/3) 배정 — 8급 기지 한자 위주 항목은 1, 의미 근접 디스트랙터 포함 항목은 2~3 (분포 5/5/5 = `ROUND_COUNTS_PER_LEVEL`)
- [x] 투명성 기준(각 형태소 뜻이 합성 결과에 직관적으로 반영) 재검토

### 데이터 유효성 자가 검사

- [x] `vocab.js`의 모든 `components` 값이 `hanja.js` 키로 존재함을 코드 주석 또는 별도 검증 스크립트로 확인 (`scripts/validate-data.mjs` 작성, `node scripts/validate-data.mjs` 전 항목 PASS)
- [x] `distractors`의 모든 항목도 `hanja.js` 키로 존재함을 확인 (참조 75건 전부 통과)
- [x] 중복 어휘 없음, 중복 컴포넌트 쌍 없음 확인 (순서 무관 쌍 비교 포함)

---

## M2 — 게임 플레이 핵심 로직

> 목표: 역분해 라운드 기본 흐름(제시 → 입력 → 판정 → 피드백 → 다음)이 작동하는 상태.

### 기반 모듈 (`config.js`, `state.js`, `utils.js`, `storage.js`)

- [x] `config.js` — 상수 정의: `PORT=4330`, `HINT_LEVELS=[1,2,3]`, `MAGNET_DP=40`, `SNAP_DIST=8`, `ROUND_COUNTS_PER_LEVEL=[5,5,5]`, `STORAGE_PREFIX='7rr:'`, `CACHE_VERSION='7_reverse_root-v1'`, 애니메이션 duration 상수
- [x] `state.js` — TRD §3.3 스키마(`settings`, `session`, `round`, `progress`) 그대로 구현 (+ `session.wrongPerRound` — TRD §9.1 calcScore 보너스 산정용)
- [x] `utils.js` — `clamp`, `shuffle`, `dist` 순수 유틸 함수 구현
- [x] `storage.js` — `'7rr:'` 접두사 강제 래퍼: `get`, `set`, `remove` 구현. Incognito 모드 try/catch 처리

### 오디오 모듈 (`tts.js`, `audio.js`)

- [x] `tts.js` — Web Speech API 래퍼: `unlock()`, `speak(text)`, `cancel()`, 한국어 보이스 우선 선택, `voiceschanged` 대기, 미지원 graceful fallback
- [x] `audio.js` — Web Audio API 오실레이터 효과음: `unlock()`, `playCorrect()`, `playWrong()`, `playDecomp()`, `stopAll()`

### 입력 모듈 (`pointer.js`, `dock.js`)

- [x] `pointer.js` — Pointer Events API 통합: `setPointerCapture`, 드래그 이동 추적, 탭 판별(이동 < 8px), `releaseAll()`
- [x] `dock.js` — 한자 블록 렌더링: `buildDockItems(vocabItem)` (정답 2 + 디스트랙터 2~3 shuffle), 탭 선택 토글(`.selected`), 드래그 + 자성 스냅(40dp), 2개 선택 완료 시 `game.onBlocksSelected()` 호출, `playWrongFeedback()` shake 애니메이션 (블록 `aria-label="화 (불 화)"` 형식 포함)

### 게임 로직 (`game.js`)

- [x] `buildSessionQueue(vocab)` — difficulty 오름차순 정렬 후 각 구간 내부 shuffle
- [x] `pickQueue(vocab)` — 직전 세션 어휘 중복 ≤ 20% 제한 (fresh 우선)
- [x] `startSession()` — 큐 구성, 힌트 레벨 초기화(`progress.lastHintLevel` 계승), `state.session` 초기화
- [x] `startRound(idx)` — 합성어 카드 렌더링, TTS 발화, 도크 구성, 힌트 레이어 적용 (M2는 합성어 텍스트만 — 힌트 DOM은 M3)
- [x] `onBlocksSelected(ids)` — `checkAnswer(ids, vocabItem)` 호출 → 정답/오답 분기
- [x] `checkAnswer(selectedIds, vocabItem)` — 순서 무관 집합 비교 (Set 기반)
- [x] 정답 처리: `state.round.phase = 'correct'`, 정답음 재생, `decomp.js` 분해 애니메이션 호출
- [x] 오답 처리: `state.round.phase = 'wrong'`, 오답음 재생, shake 피드백, 힌트 레벨 유지, 재시도
- [x] `endSession()` — `calcScore`, `calcStars`, `ui.goTo('end')` 연결 (`storage.saveScore()` 영속 저장은 M4에서 완성)

### 분해 애니메이션 (`decomp.js`)

- [x] `playDecomp(vocabItem)` — 합성어 카드에서 두 한자 조각으로 갈라지는 CSS transform/opacity 애니메이션 (`pieceReveal` keyframe, 0.4s ease-out)
- [x] `decomp-overlay` + `decomp-card` + `decomp-piece` DOM 구성
- [x] 각 한자 조각에 음독·뜻 표시, TTS 자동 발화 (reading + meaning)
- [x] "다음" 버튼(`.btn`) → 다음 라운드 진행

### 화면 전환 (`ui.js`)

- [x] `goTo(screenName)` — `pointer.releaseAll()` + `tts.cancel()` + `audio.stopAll()` 후 화면 전환 (+ 분해 팝업 잔존 시 `decomp.close()`)
- [x] `start` 화면 첫 탭 → `tts.unlock()` + `audio.unlock()` 사용자 제스처 게이트 (`main.js` pointerdown once)
- [x] `play` 화면 진입 → `game.startSession()` 호출 (`main.js startGame()` 경유 — 이중 호출 방지)

### game.css — 플레이 화면 고유 스타일

- [x] `#play-screen` flex column 레이아웃, 세로 모드 우선
- [x] `.compound-card` — 합성어 카드 (white bg, 20px radius, Jua `clamp(2rem, 8vw, 3.5rem)`)
- [x] `.hanja-dock` flex wrap, gap 12px
- [x] `.hanja-block` — `clamp(64px, 18vw, 88px)` 정방형, Jua `clamp(1.6rem, 6vw, 2.8rem)`, `touch-action: none`
- [x] `.hanja-block.selected`, `.hanja-block.snapped` 상태 스타일 (+ `.dragging` 드래그 중 z-index·그림자)
- [x] `@keyframes wrongShake` + `.hanja-block.wrong-shake`
- [x] 가로 모드 폴백 `@media (orientation: landscape) and (max-height: 600px)`

---

## M3 — 힌트 페이딩·난이도 진행

> 목표: 3단 힌트 페이딩(L1 → L2 → L3)과 라운드 간 전환 흐름 완성.

### 힌트 레이어 (`hint.js`)

- [x] `renderHint(vocabItem, hintLevel)` — 힌트 레벨에 따라 `.hint-overlay` DOM 렌더링
  - L1: `.hint-segment` 색 하이라이트(`--hint-l1-bg`) + `.hint-label` 뜻 라벨("불 화" / "뫼 산")
  - L2: `.hint-segment.l2` 하이라이트만 (`.hint-label` 없음)
  - L3: `.hint-overlay` 제거 (합성어 카드만 표시)
  - 설정 `hintVisible=false` 시에도 오버레이 비움 (설정 토글 연동)
- [x] `.hint-overlay` position absolute, pointer-events none — 기준을 카드(`inset: 0`)가 아닌 글자 래퍼 `.word-wrap`(inline-block shrink-wrap, `inset: -22px 0`)으로 변경. 카드 기준 분할은 카드 좌우 패딩 탓에 칩·하이라이트가 음절과 어긋났음. 세그먼트 크기는 음절 대칭 패딩(`0 0.4em`)으로 크게 유지해 큰 박스 정중앙에 글자 배치, 세그먼트 간격은 gap 대신 대칭 마진(`margin: 0 3px`)으로 음절 중심 보존 (버그픽스, TRD §5.2 정렬 원리)
- [x] `.hint-label` position absolute, Jua 0.9rem, `--mint` 배경, 100px border-radius — 자기 음절 위 정중앙 + 2행 지그재그(1음절 윗행 -58px / 2음절 아랫행 -26px)로 인접 칩 겹침 방지
- [x] L2→L1 CSS transition 0.3s (background, border-color)

### 힌트 레벨 전환 (`game.js` + `hint.js`)

- [x] 라운드 번호 기반 자동 전환: 1~5번 L1, 6~10번 L2, 11~15번 L3 (TRD §3.4)
- [x] 어휘 수가 15개 미만이면 3등분 구간 배정 (`levelForRound` — `floor(idx×3/total)+1`, 15개 기준 5/5/5 정확 일치)
- [x] 오답 시 힌트 레벨 유지 (강등 없음) 확인 (레벨은 라운드 번호로만 결정 — 브라우저 검증 완료)
- [x] `state.session.hintLevel` 업데이트, `hint.renderHint()` 재호출 (`startRound`에서 매 라운드 갱신)

### 라운드 간 요약 화면 (`round-summary`)

- [x] 힌트 레벨 전환 직전 인터스티셜 표시: "이제 힌트를 줄여볼게요" 안내 텍스트 (5→6, 10→11 라운드 경계)
- [x] 별 누적 표시 (지금까지의 정답률 기반 `calcStars` — `--yellow` 별 3개 시각화)
- [x] 자동 또는 탭으로 다음 라운드 진입 (`ROUND_SUMMARY_MS`=2600ms 자동 + pointerdown 즉시)

### 점수·별 계산 (`game.js`)

- [x] `calcStars(correctCount, total)` — 정답률 ≥ 0.9 → ★★★, ≥ 0.7 → ★★☆, 그 외 → ★☆☆
- [x] `calcScore(session)` — 정답 수 × 10 + 오답 없는 라운드 수 × 5 (`wrongPerRound` 기반 — 15라운드 1오답 시 220점 검증)

### 완료 화면 연결

- [x] `#end-screen` 렌더링: 제목(Jua 2.1rem), 획득 별(--yellow), 정답률(Gowun Dodum), 라운드별 요약 (`#end-rounds` 칩: ★ 무오답 / ✓ 오답 후 정답 / – 미완료)
- [x] "다시 하기" `.btn` → `game.startSession()` (직전 세션 어휘 중복 ≤ 20% — `lastPlayedWords` 메모리 유지)
- [x] "다음 단계" `.btn.mint` → `8_vocabulary_tree` 링크 (상대경로 `../8_vocabulary_tree/`)

---

## M4 — PWA·리더보드·영속화

> 목표: 오프라인 지원, 점수 영속화, 리더보드 화면 완성.

### PWA 설정

- [x] `manifest.webmanifest` 작성: `name`, `short_name`, `start_url: './'`, `scope: './'`, `display: standalone`, `background_color: #FFF6E4`, `theme_color: #FF7757`, 아이콘 2종(192×192, 512×512)
- [x] PWA 아이콘 실제 PNG 생성 — `src/assets/icons/icon.svg`(火·山 카드 분해 모티프) → `scripts/gen-icons.mjs`(sharp, `6_morpheme_detective` devDependency 읽기 전용 재사용)로 `icon-192.png`·`icon-512.png` 렌더링
- [x] `service-worker.js` 작성: `CACHE_VERSION = '7_reverse_root-v1'`, `PRECACHE_ASSETS` 전체 파일 목록(27개 — html·manifest·CSS 5·JS 15·데이터 2·아이콘 2 포함), install/activate/fetch 핸들러 (TRD §7.2 그대로 cache-first)
- [x] `index.html` SW 등록 인라인 스크립트: `navigator.serviceWorker.register('./service-worker.js')`
- [x] 오프라인 동작 확인 — Playwright `context.setOffline(true)` 후 새로고침: 시작 화면 정상 렌더, 27개 자산 전부 캐시 적중 (크로스오리진 Google Fonts만 시스템 폰트 폴백)

### 리더보드 (`leaderboard.js`)

- [x] `storage.saveScore(scoreObj)` — `'7rr:leaderboard'` 키에 최대 10개 점수 목록 유지 (점수 내림차순, 초과 시 버림 — 11개 연속 저장 테스트로 확인)
- [x] `renderLeaderboard()` — `#leaderboard-screen`에 상위 10개 DOM 주입. 날짜 포맷 `M월 D일`, 별 `★★☆` 시각화(`--yellow`), 빈 경우 안내 텍스트("아직 기록이 없어요")
- [x] 리더보드 화면 `screens.css` `.leaderboard-screen` 클래스: 카드형 컨테이너, 수직 목록, 제목 Jua 1.8rem/`--coral` (M0 신설분에 `.lb-stars` 색 `--yellow` 정합 + best 카드 대비 보강)

### 영속화 (`storage.js`)

- [x] `'7rr:settings'` 저장·로드: `{ ttsEnabled, sfxEnabled, hintVisible }`
- [x] `'7rr:progress'` 저장·로드: `{ totalSessions, lastHintLevel, lastPlayedAt }` — `game.endSession()` 저장, `game.loadProgress()` 앱 시작 시 복원(다음 세션 `lastHintLevel` 계승 확인)
- [x] `'7rr:leaderboard'` 저장·로드: `Array<{ score, stars, correctCount, totalCount, hintLevel, playedAt }>`
- [x] localStorage 5MB 한도 초과 대비 try/catch graceful 처리 (`set/get/remove` 전부 try/catch — Private Mode 포함)

### 설정 화면 완성 (`settings.js`)

- [x] 설정 로드·저장 연동 (`storage.get/set`)
- [x] TTS 미지원 시 TTS 토글 자동 비활성화 (graceful degradation — `speechSynthesis` 제거 시뮬레이션으로 토글 `.disabled`·안내 문구 확인)
- [x] "진행 초기화" — `'7rr:progress'` + `'7rr:leaderboard'` 삭제, 인페이지 확인 단계(`#reset-confirm` — 브라우저 `confirm()` 모달 미사용)
- [x] PWA 설치 프롬프트 — `beforeinstallprompt` 저장(`settings.initInstallPrompt`) 후 세션 최초 완료 시 완료 화면 `#install-slot`에 "홈 화면에 추가" 버튼 표시(`settings.maybeOfferInstall`)

---

## M5 — QA·디바이스 검증·인지 테스트

> 목표: 만 8세 대상 품질 검증 완료, 시리즈 연속성 확인.

### 핵심 시나리오 수동 테스트

- [ ] 첫 진입 → "시작" 탭 → TTS + Audio unlock 성공 확인
- [ ] L1 라운드: 하이라이트 + 뜻 라벨 표시 확인 (화산 → "불 화" / "뫼 산")
- [ ] 정답 블록 2개 탭 → 분해 애니메이션(0.4s) + TTS 발화 → 팝업 표시
- [ ] 정답 블록 드래그 → 40dp 자성 스냅 → 손 떼면 정답 판정
- [ ] 오답 블록 탭 → shake 애니메이션 + 오답음 → 힌트 레벨 유지 재시도
- [ ] 5라운드 → L2 전환 (뜻 라벨 사라지고 하이라이트만)
- [ ] 10라운드 → L3 전환 (힌트 없음, 합성어 카드만)
- [ ] 세션 완료 → 완료 화면 별·점수·"다시 하기"·"다음 단계"
- [ ] 리더보드 진입 → 최대 10개 점수 목록, 닫기
- [ ] 설정 → TTS 끄기 → 재시작 → TTS 없이 정상 진행
- [ ] Private Mode → localStorage 실패해도 게임 정상 동작 (코드 경로 재점검 완료 — `storage.js` get/set/remove 전 함수 try/catch, `saveScore`도 동 래퍼 경유)
- [ ] PWA 설치 후 오프라인 → 전체 게임 정상 동작 (PWA 설치는 수동 검증 필요 — 자동화 범위 밖. 오프라인 캐시 동작 자체는 M4에서 자동 검증 완료)

### 디바이스 매트릭스

- [ ] iPhone SE (소형) — 64dp 블록 탭 정확도, 자성 스냅 거리 (수동 검증 필요 — 자동화 범위 밖)
- [ ] iPad Mini / Air (iOS 15+) — 세로 모드 레이아웃, TTS unlock (수동 검증 필요 — 자동화 범위 밖)
- [ ] 갤럭시 탭 A (Android 12+) — 보급형 애니메이션 60fps 확인 (수동 검증 필요 — 자동화 범위 밖)
- [ ] 보급형 안드로이드 폰 (2GB RAM) — 메모리·렌더 안정성 (수동 검증 필요 — 자동화 범위 밖)

### 접근성 검증

- [ ] 더블탭 줌 비활성 (`touch-action: manipulation`) — 코드 확인: `base.css` body 적용
- [ ] 색맹 시뮬레이터 — 힌트 하이라이트 형태 패턴으로 식별 가능 (수동 검증 필요 — 자동화 범위 밖. 코드측 대응: L1 실선 테두리+뜻 라벨, L2 점선 테두리 — 색+형태 병기, TRD §8.2)
- [ ] 시스템 음소거 → 시각 피드백만으로 게임 진행 가능 (수동 검증 필요 — 자동화 범위 밖. 코드측 대응: shake·하이라이트·분해 팝업 등 시각 피드백이 오디오와 독립)
- [ ] 한자 블록 `aria-label="화 (불 화)"` 형식 레이블 확인 — 코드 확인: `dock.js` makeBlock
- [ ] WCAG AA 색상 대비 (`--navy` on `--cream` ≥ 4.5:1) — 산출값 약 12:1 (#2D3047 on #FFF6E4)

### 인지·사용성 테스트

- [ ] 만 8세 시범 사용자 5명 — L1 힌트 하에 합성어 카드 이해 여부 관찰 (수동 검증 필요 — 자동화 범위 밖)
- [ ] L3(무힌트) 정답률 ≥ 70% 목표 달성 여부 확인 (5명 평균) (수동 검증 필요 — 자동화 범위 밖)
- [ ] 힌트 레벨 전환 안내 텍스트("이제 힌트를 줄여볼게요") 이해 여부 확인 (수동 검증 필요 — 자동화 범위 밖)
- [ ] 자성 스냅 거리(40dp) 아동 손가락 크기 대비 적합성 확인 (수동 검증 필요 — 자동화 범위 밖)

---

## 디자인 일관성 체크리스트

> `1_chosung_quiz`와 픽셀 단위 일치 여부를 구현 후 항목별로 검증한다.

### 폰트

- [x] `<head>` Google Fonts `<link>` — `Jua` + `Gowun Dodum` + `preconnect` 2개 포함 여부 (`index.html` L14-16)
- [x] 시작 화면 제목: `font-family: 'Jua'`, `font-size: 3rem`, `letter-spacing: 2px`, `color: var(--coral)` 일치 (`screens.css .start-screen h1`)
- [x] 설정 화면 제목: `font-family: 'Jua'`, `font-size: 1.8rem`, `color: var(--coral)` 일치 (`screens.css .settings-header h2`)
- [x] 완료 화면 제목: `font-family: 'Jua'`, `font-size: 2.1rem`, `color: var(--coral)` 일치 (`screens.css .end-screen h2`)
- [x] 본문·부제목: `font-family: 'Gowun Dodum'`, `font-size: clamp(0.9rem, 3vw, 1.2rem)` 일치 (`.subtitle`, `.end-message`)
- [x] 버튼 레이블: `font-family: 'Jua'`, `letter-spacing: 0.5px` 일치 (`components.css .btn`)
- [x] 설정 섹션 레이블: `font-family: 'Jua'`, `font-size: 1.05rem` 일치 (`screens.css .section-label`)

### 색상 토큰

- [x] `--coral: #FF7757` 정확한 헥스값 일치
- [x] `--coral-dark` 버튼 그림자 색 일치 (`#d45a40`, `.btn box-shadow`)
- [x] `--navy: #2D3047` 정확한 헥스값 일치
- [x] `--cream: #FFF6E4` 배경 전체 적용 일치 (`base.css body::before`)
- [x] `--mint: #6BCAB8` 정확한 헥스값 일치
- [x] `--yellow: #FFD166` 별·배지 색 일치 (`.end-stars`, `.lb-stars`, `.hint-level-badge`)
- [x] 하드코딩 색상값 없음 — `tokens.css` 변수만 사용 (팔레트 헥스값은 `tokens.css` 정의부에만 존재. `white`/`#fff` 리터럴·rgba 그라디언트는 시리즈 원본 `5_compound_split` CSS와 동일 관례 — `tokens.css` diff 결과 토큰 값 완전 일치)
- [x] `game.css`에 추가한 고유 토큰(`--hint-l1-bg` 등)이 기존 변수를 재정의하지 않음 (신규 이름 6종만 — `--hint-l1-bg`, `--hint-l1-border`, `--hint-l2-bg`, `--decomp-card-bg`, `--decomp-card-radius`)

### 버튼 규격

- [x] `.btn` — `font-size: 1.2rem`, `padding: 14px 28px`, `border-radius: 100px`, `background: var(--coral)`, `box-shadow: 0 5px 0 var(--coral-dark)` 일치
- [x] `.btn.big` — `font-size: 1.45rem`, `padding: 16px 44px` 일치
- [x] `.btn.small` — `font-size: 1rem`, `padding: 10px 20px` 일치
- [x] `.btn:active` — `transform: translateY(4px)`, `box-shadow: 0 1px 0 var(--coral-dark)` 일치
- [x] 터치 타겟 최소 44dp(일반) / 64dp(한자 블록 도크) 준수 (`.hanja-block` `clamp(64px, 18vw, 88px)`, 주 동작 버튼 `.btn`/`.btn.big` ≥ 44dp. `.btn.small`·`.close-btn`(40px)은 보조 버튼으로 시리즈 공통 규격 그대로)

### 홈/시작 화면 레이아웃

- [x] `display: flex; flex-direction: column; align-items: center; justify-content: center` 일치 (`#start-screen.active` flex column + 수직 중앙은 시리즈 공통 `base.css` body 레벨에서 처리 — `5_compound_split` 원본과 픽셀 동일)
- [x] `min-height: 100dvh`, `background: var(--cream)`, `gap: 24px`, `padding: 32px 20px` 일치 (`100dvh`·cream 배경은 body 레벨, 화면 자체는 `gap: 24px; padding: 24px` — 시리즈 원본 `5_compound_split` `#start-screen.active`와 동일 값)
- [x] 시작 버튼 `.btn.big` 사용
- [x] 리더보드 진입 버튼 `.btn.ghost` 또는 텍스트 링크 (`.btn.ghost` "🏆 기록 보기")

### 설정 화면 레이아웃

- [x] 토글 컴포넌트 `1_chosung_quiz/src/css/components.css` 복제 클래스 사용 (실제 복제 원본 `5_compound_split/src/css/components.css` — `.toggle`/`.toggle-row` 동일)
- [x] 저장/닫기 버튼 `.btn.small` 사용
- [x] 설정 행 간격·패딩 `1_chosung_quiz` 설정 화면 동일 (`.settings-section`/`.section-label`/`.section-hint` — `5_compound_split` 원본과 문자 단위 일치 확인)

### 리더보드 화면 레이아웃

- [x] `screens.css`에 `.leaderboard-screen` 클래스 신규 추가
- [x] 제목 Jua 1.8rem / `--coral`, 점수 행 Gowun Dodum (`.settings-header h2` 공용, `.lb-date` Gowun Dodum)
- [x] 닫기 버튼 `.btn.small` 사용 (`.btn.ghost.small` + `.close-btn`)
- [x] 별 `★★☆` 형식, `--yellow` 색 적용 (`leaderboard.js` `'★'.repeat(stars) + '☆'.repeat(3-stars)`, `.lb-stars color: var(--yellow)`)

### 완료 화면 레이아웃

- [x] 별 표시 64dp+ 아이콘, `--yellow` 색 (`.end-stars font-size: 4rem` = 64px)
- [x] 정답률·통계 Gowun Dodum `clamp(0.9rem, 3vw, 1.2rem)` (`.end-message`)
- [x] "다시 하기" `.btn` (coral), "다음 단계" `.btn.mint` 분리

### 모바일 우선 원칙

- [x] `overflow: hidden` 전체 화면 게임 세로 스크롤 차단 (`base.css` `overflow-x: hidden` — 세로는 시리즈 공통 규격대로 콘텐츠가 100dvh 내 수용, 원본과 동일)
- [x] `-webkit-tap-highlight-color: transparent` 탭 하이라이트 제거 (`base.css *` 전역)
- [x] `touch-action: manipulation` body 적용 (더블탭 줌 비활성, 탭 딜레이 제거) (`base.css` body)
- [x] 한자 블록 `touch-action: none` (드래그 직접 처리) (`game.css .hanja-block`)

### PWA

- [x] `manifest.webmanifest` `start_url: './'`, `scope: './'` 상대경로 확인
- [x] `CACHE_VERSION: '7_reverse_root-v1'` — 타 게임 SW와 충돌 없음 확인 (전 게임 SW 전수 grep: `morpheme-detective-v9`만 존재 — 유일)
- [x] localStorage 접두사 `'7rr:'` — 타 게임(`cq:`, `6md:`) 키와 충돌 없음 확인 (전수 grep 결과: `4md:`(6_morpheme), `compound_split_`(5), `9scg_`(9)만 존재, `1_chosung_quiz`는 localStorage 미사용 — `'7rr:'` 유일)

---

## 시리즈 연속성 체크

### 이전 단계 (`6_morpheme_detective`) 데이터·난이도 핸드오프

- [x] `6_morpheme_detective/src/data/hanja.js` 100자(7·8급) 풀을 이 게임 한자 풀의 출발점으로 사용 (`validate-data.mjs` (b) PASS — 51자 전부 원본 풀 내, reading/meaning/grade 일치)
- [x] 이 게임 `vocab.js` 15개 항목 전체가 `6_morpheme_detective` 기지 100자 내 한자만 사용 (`validate-data.mjs` (a)(b) PASS — 참조 75건 전부 풀 내)
- [x] 신규 한자 0 원칙 재확인 — 이 게임 진입 시 처음 보는 한자 없음 (`validate-data.mjs` (b) "신규 한자 0" PASS)
- [x] 탭-발견 + 자성 스냅(40dp) 패러다임 계승 — `6_morpheme_detective`와 조작 방식 동일 (`dock.js` 탭 토글 + `MAGNET_DP=40` 자성 흡착, 탭/드래그 동일 제출 경로)
- [x] localStorage 접두사 `'7rr:'` — `6_morpheme_detective` 스토리지(`6md:` 또는 `4md:`)와 격리 (실측: 6_morpheme는 `'4md:'` 사용 — 충돌 없음)
- [x] `6_morpheme_detective` 완료 화면 "다음 단계" 링크가 `7_reverse_root/` 상대경로 지향 여부 확인(참고) (확인 결과: 6_morpheme에 `7_reverse_root` 링크 없음 — 해당 폴더는 읽기 전용이라 본 게임 범위에서 수정 불가, 참고 기록만 남김)

### 다음 단계 (`8_vocabulary_tree`) 데이터·난이도 핸드오프

- [x] L3(무힌트) 졸업 기준(정답률 ≥ 70%) 완료 화면에 시각적으로 표시 (완료 화면에 정답률 % 명시 + `calcStars` 별 시각화: ★★ 이상 = 정답률 ≥ 70% 졸업 기준 충족)
- [x] 이 게임 졸업 어휘 세트(투명 2형태소 15개)를 `8_vocabulary_tree` 워밍업 재료로 권장함을 `docs/PRD.md` §9.2 기반으로 인수인계 문서화 (PRD §9.2 "어휘 연속성" 행에 명시)
- [x] 이 게임이 유보한 항목 명시 (PRD §3 유보 표 + §9.2 "유보된 기술 인수" 행):
  - 무힌트 보스 → `8_vocabulary_tree`
  - SRL 스케줄링 → `8_vocabulary_tree`
  - level-6/5 신규 한자(知·能·種·爭·質·敬·練·馬 등) → `8_vocabulary_tree`
  - 5~6형태소 학술어 분해 → `8_vocabulary_tree`
- [x] 이 게임 완료 화면 "다음 단계" `.btn.mint` 링크가 `../8_vocabulary_tree/` 상대경로 지향 준비 (`main.js goNextStage()` — `window.location.href = '../8_vocabulary_tree/'`)

### 시리즈 연속성 확인

- [x] localStorage 접두사 계열 충돌 없음: `cq:` / `6md:` / **`7rr:`** / `8vt:`(권장) (전수 grep 실측: `4md:`(6단계) / `compound_split_`(5단계) / `9scg_`(9단계) / `'7rr:'` — 충돌 없음, 1단계는 localStorage 미사용)
- [x] `CACHE_VERSION` 계열 충돌 없음: 각 게임 SW 고유 버전 문자열 사용 (SW 보유 게임은 6단계 `morpheme-detective-v9`와 본 게임 `7_reverse_root-v1` 뿐 — 유일)
- [x] 포트 충돌 없음: 이 게임 `4330`, 타 게임 포트와 중복 없음 (전수 grep 실측: 4321·4322·4324·4326·4328·4332 사용 중 — `4330`은 본 게임 유일)

---

## 리스크·오픈 이슈

| # | 이슈 | 영향 | 해결 방안 | 우선순위 |
|---|------|------|-----------|---------|
| R1 | ~~최종 어휘 세트 교차 검증 미완~~ ✅ 해소(M1) | PRD §7.2 중 4개 합성어(국어·도로·소방·인구)가 풀 밖 한자(語·路·消·防·口) 포함 → 국민·학교·시장·전화로 교체, 총 15개 유지 | `scripts/validate-data.mjs` 로 100자 풀 대조 자동 검증 — 전 항목 통과 | ~~High~~ 완료 |
| R2 | iOS Safari `speechSynthesis` 한국어 보이스 디바이스별 미지원 | L1 뜻 라벨 TTS 발화 불가 시 시각 자막으로만 게임 진행 | TTS graceful fallback(자동 비활성화 + 시각 자막) 구현으로 대응, M5 실기기 검증 | High |
| R3 | 힌트 L1 뜻 라벨 위치 (카드 위 vs 내부 오버레이) | 만 8세 가독성 영향 | M2 단계 프로토타입 제작 후 M5 인지 테스트에서 결정 | Medium |
| R4 | 분해 애니메이션 구현 수준 결정 미확정 | CSS clip-path split 효과 vs transform 이동 분기 선택에 따라 개발 난이도 차이 | M2 착수 시 transform 이동 방식 우선 구현, clip-path는 P2 고도화 | Medium |
| R5 | 리더보드 공통 컴포넌트화 미결 | 시리즈 전체 공통 `leaderboard-screen` 추출 여부 미결정 | M4 단계에서 이 게임 내 `screens.css` 신규 추가로 우선 구현. 추출은 P2 | Low |
| R6 | cross-stage 프로파일 게이팅 미구현 | `8_vocabulary_tree` 진입 조건 추적 불가 | 상위 생태계 SRL 엔진 구현에 의존. 현재 로드맵 외 — 이 게임 범위 밖 | Low |
| R7 | IndexedDB 마이그레이션 기준 미정 | `'7rr:leaderboard'` localStorage 5KB 초과 시 데이터 유실 위험 | M4 단계 구현 후 용량 측정. 초과 시 M4 내 IndexedDB 전환 검토 | Low |
| R8 | 디스트랙터 자동 생성 스크립트 부재 | 어휘 풀 확장 시 수동 디스트랙터 설계 병목 | `6_morpheme_detective/gen-vocab.mjs` 패턴 참조하여 P2에서 스크립트화 | Low |

---

## 기술 부채 / 개선점

| 항목 | 우선순위 | 메모 |
|------|---------|------|
| TypeScript 마이그레이션 | Medium | `state.js` 타입이 커지면 이득. P2 시점 검토 |
| Vitest 유닛 테스트 | Medium | `checkAnswer`, `buildDockItems`, `calcScore`, `calcStars` 우선 대상 |
| Playwright E2E | Low | 핵심 3개 시나리오 모바일 에뮬레이션 |
| 어휘 풀 확장 (15→30개) | Low | 재플레이 다양성 확보. P2에서 `gen-vocab` 스크립트 활용 |
| 분해 애니메이션 고도화 | Low | CSS clip-path 물리적 split 효과. P2 |
| 다크 모드 | Low | 야간 학습용. 시리즈 공통 적용 시 고려 |

---

## 브랜치 전략

```
main              # 배포 가능한 안정 버전
└── dev           # 통합 개발 브랜치
    ├── feat/m0-scaffold      # M0 스캐폴딩
    ├── feat/m1-data          # M1 데이터
    ├── feat/m2-gameplay      # M2 게임플레이
    ├── feat/m3-hint-fading   # M3 힌트 페이딩
    ├── feat/m4-pwa           # M4 PWA·리더보드
    └── fix/...               # 버그 수정
```

커밋 메시지 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `data:`

---

## 디자인 기준 — 시리즈 공통 UI 레퍼런스

본 게임의 홈 화면·설정 화면·리더보드 화면·게임 완료 화면 디자인은 **시리즈 전체 공통 UI 기준** (`1_chosung_quiz` 규격)을 따른다. 형제 게임과의 일관성 체크 항목:

- [x] 제목에 `font-family: 'Jua', sans-serif` 적용 (h1·h2·버튼·배지 전부 Jua)
- [x] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용 (body 기본 + `.subtitle`/`.end-message` 등)
- [x] `src/css/tokens.css` CSS 변수 팔레트 동일 적용 (색상·배경·간격) (`5_compound_split/src/css/tokens.css`와 diff — 토큰 값 완전 일치, 주석만 상이)
- [x] 큰 라운드 버튼 스타일 `.btn.big` 사용 (`src/css/components.css` 복제 기준) (시작하기 버튼)
- [x] 배경 `var(--cream)` 전체 일관 적용 (`base.css body::before` fixed 레이어)
- [x] 게임 완료 화면(`end-screen`)에도 동일 폰트·색상·버튼 스타일 적용 (Jua 2.1rem coral 제목, `--yellow` 별, `.btn`/`.btn.mint`)
- [x] 리더보드 화면(`leaderboard-screen`) 동일 토큰·폰트·버튼 규격 신설 (`screens.css` 신설 — tokens 변수만 사용)
