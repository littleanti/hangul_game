# BUG — 합성어 쪼개기 (5_compound_split)

## M0

- **M0-1** (minor)
  - 증상: 320px 최소 지원 너비에서 시작 화면 제목 "합성어 쪼개기"가 단어 중간에서 줄바꿈되어 "합성어 쪼개" / "기" 두 줄로 표시됨. 문해력 학습 게임 제목이 어절 중간에서 쪼개져 보임. (가로 오버플로·버튼 깨짐은 없음)
  - 재현 절차: ① http://localhost:4329/ 접속 ② 브라우저 뷰포트를 320×680으로 리사이즈 ③ 시작 화면 제목 확인 — "쪼개기"가 "쪼개"+"기"로 분리되어 렌더링됨
  - 원인 추정: 시작 화면 h1(Jua 3rem, letter-spacing 2px)의 텍스트 폭이 320px 컨테이너(패딩 제외 약 256px)를 초과하는데 `word-break: keep-all`이 없어 한글 기본 줄바꿈 규칙(음절 단위)으로 단어 중간에서 꺾임. 정본 1_chosung_quiz는 `.word-display`에만 `keep-all`을 적용하며 제목은 4자라 노출되지 않던 문제. 본 게임 `src/css/screens.css` 시작 화면 제목에 `word-break: keep-all` 추가 시 "합성어" / "쪼개기" 어절 단위 줄바꿈으로 해소 가능.
  - [원인] 확정: `src/css/screens.css`의 `.start-screen h1`에 `word-break: keep-all`이 없어, 제목 텍스트 폭(약 223px + letter-spacing 2px, Jua 3rem)이 320px 뷰포트의 콘텐츠 폭을 초과할 때 CJK 기본 줄바꿈 규칙(음절 단위)에 따라 "쪼개기" 단어 중간에서 줄이 꺾임. 정본(1_chosung_quiz) 복제 시 `.word-display`에만 있던 keep-all이 제목에는 없었던 것이 근본 원인.
  - [수정 내용] `src/css/screens.css` `.start-screen h1` 규칙에 `word-break: keep-all;` 1줄 추가. 검증: Playwright로 http://localhost:4329/ 접속 → 뷰포트 320×680 리사이즈(SW 캐시 삭제 후 재로드) → h1이 "합성어" / "쪼개기" 어절 단위 2줄(각 약 124px/126px)로 렌더링됨을 확인. scrollWidth=clientWidth=320으로 가로 오버플로 없음.
  - [재검증] M0 검증 라운드 2(2026-06-10, Playwright): 뷰포트 320×680에서 h1이 "합성어"(124px) / "쪼개기"(126px) 어절 단위 2줄로 렌더링, `word-break: keep-all` 계산값 확인, scrollWidth=clientWidth=320으로 가로 오버플로 없음. 수정 확인 완료.
  - 상태: 해결

## M1

- **M1-1** (major)
  - 증상: M0 시점에 설치된 Service Worker(Cache First)가 M0 플레이스홀더 `words.js`(`WORDS = []`)를 계속 서빙하여, M1에서 완성된 6개 합성어 데이터가 기존 방문 클라이언트에 영구히 반영되지 않음. 실제 브라우저에서 `import('./src/data/words.js')` 결과 `WORDS.length === 0`, `SHARED_MORPHEME_PAIRS === {}` 확인. 디스크 파일은 정상(6개 항목 완비)이나 캐시가 구버전을 반환.
  - 재현 절차: ① M0 시점에 http://localhost:4329/ 방문(SW 설치·프리캐시) ② M1에서 words.js 갱신 ③ 페이지 재방문 후 `(await import('./src/data/words.js')).WORDS.length` 평가 → 0 반환. `fetch('./src/data/words.js', {cache:'no-store'})`도 M0 플레이스홀더(1,359바이트)를 반환 — SW fetch 핸들러가 가로채기 때문. SW 등록 해제 + `caches.delete('5_compound_split-v1')` 후 재로드하면 정상 데이터(6개) 로드됨.
  - 원인 추정: `sw.js`가 Cache First 전략으로 `./src/data/words.js`를 PRECACHE_URLS에 포함해 프리캐시하는데, M1에서 words.js 내용이 바뀌었음에도 `sw.js` 자체는 1바이트도 변경되지 않아(CACHE_VERSION `'5_compound_split-v1'` 유지) 브라우저가 SW 갱신(install 재실행)을 트리거하지 않음 → 프리캐시가 영구 고착. 콘텐츠(프리캐시 대상 파일) 변경 시 CACHE_VERSION 빌드 접미사 갱신 등 `sw.js` 바이트 변경을 동반하는 배포 규칙이 필요(또는 개발 중 network-first/stale-while-revalidate 전략 검토). M2 이후 갱신마다 동일하게 재발하는 구조적 문제.
  - [원인] 확정: `sw.js`의 fetch 핸들러가 Cache First(`caches.match()` 우선)로 프리캐시를 서빙하는데, 캐시 무효화 수단이 "sw.js 바이트 변경 → SW 재설치 → CACHE_VERSION 변경에 따른 구캐시 폐기" 하나뿐이었음. 콘텐츠 파일(words.js)만 갱신되고 sw.js가 무변경이면 브라우저는 SW를 갱신하지 않으므로 install이 재실행되지 않아 M0 시점 프리캐시(플레이스홀더 `WORDS = []`)가 영구 서빙됨. 매 갱신마다 CACHE_VERSION을 수동으로 올리는 규칙은 한 번이라도 누락되면 동일 버그가 재발하는 사람 의존적 절차이므로, 캐시 최신성이 sw.js 바이트 변경에 결합되어 있는 전략 자체가 근본 원인.
  - [수정 내용] `sw.js` fetch 전략을 **Network First, 캐시 폴백**으로 전환(콘텐츠 갱신 반영이 sw.js 변경과 분리됨 — 구조적 해결): ① 온라인 시 항상 네트워크 최신 응답을 서빙하고 성공 응답(`res.ok`)을 `cache.put()`으로 덮어써 캐시를 상시 최신화 ② 오프라인 시 `caches.match()` 폴백(navigate 요청은 `./index.html` 추가 폴백)으로 PWA 오프라인 동작 유지 ③ 같은 오리진 GET만 처리(외부 리소스·비GET은 브라우저 기본 동작) ④ `CACHE_VERSION`을 `'5_compound_split-v2'`로 올려 기존 클라이언트의 고착된 v1 캐시를 activate 단계에서 폐기(이번 수정으로 sw.js 바이트가 변경되므로 기존 설치 클라이언트도 자동 재설치됨). install 프리캐시는 유지(최초 방문 직후 오프라인 보장). `docs/TRD.md` §7.2도 동일 전략으로 갱신. 검증: Playwright로 http://localhost:4329/ 접속 → 신규 SW activated, `caches.keys() === ['5_compound_split-v2']`(v1 폐기 확인), `import('./src/data/words.js')` 결과 `WORDS.length === 6`, `SHARED_MORPHEME_PAIRS` 키 3개. 추가로 v2 캐시에 M0식 플레이스홀더(65바이트)를 주입해 고착 상황을 재현한 뒤 SW 경유 `fetch('./src/data/words.js')` → 최신 디스크 내용(4,839바이트) 반환 및 캐시가 최신 내용으로 자동 덮어써짐을 확인. 콘솔 에러 0건.
  - [재검증] M1 검증 라운드 2(2026-06-10, Playwright): http://localhost:4329/ 접속 → SW activated, `caches.keys() === ['5_compound_split-v2']`(v1 폐기 확인), SW 경유 `fetch('./src/data/words.js')` 4,839바이트(6개 항목) 반환, `import('./src/data/words.js')` 결과 `WORDS.length === 6`·`SHARED_MORPHEME_PAIRS` 3키 정상. 콘솔 에러 0건. 수정 확인 완료.
  - 상태: 해결

## M5

- **M5-1** (minor, 문서 불일치)
  - 증상: `docs/PLAN.md` "PWA·스토리지 격리 검증" 체크리스트의 `CACHE_VERSION` 기준값이 `'5_compound_split-v1'`로 잔존. 실제 코드(`sw.js`·`src/js/config.js`)와 `docs/TRD.md` §7.2는 M1-1 수정(프리캐시 고착 해소를 위한 v1 캐시 일괄 폐기) 시점에 `'5_compound_split-v2'`로 상향됨 — 문서 간 기준값 불일치.
  - 원인: M1-1 수정 시 sw.js·config.js·TRD §7.2는 v2로 갱신했으나 PLAN.md 체크리스트의 기준값 갱신이 누락됨.
  - [수정 내용] `docs/PLAN.md` 해당 항목을 `'5_compound_split-v2'`로 갱신하고 M1-1 상향 이력을 병기. 코드 변경 없음(코드는 이미 정합 — `sw.js`와 `config.js`의 `CACHE_VERSION` 동일값 확인).
  - 상태: 해결

- **M5 QA 정적 검토 결과 요약** (2026-06-10 — PLAN "M5 — QA"·"디자인 일관성 체크리스트"·"시리즈 연속성 체크" 전 항목 점검, 코드 수정 0건)
  - `tokens.css`·`components.css`: 1_chosung_quiz 정본과 diff 결과 **완전 동일**(0 byte 차이) — 색상 토큰·버튼 규격(.btn/.big/.small/.mint/.ghost, :active 눌림) 전 항목 충족.
  - `screens.css`: 공용 섹션 발췌 복제 확인. 정본 대비 차이는 ① `.start-screen h1`의 `word-break: keep-all`(M0-1 수정, 해결 이력 있음) ② `.start-screen .subtitle`을 `'Gowun Dodum'`으로 적용(정본 파일은 Jua이나 루트 AGENTS.md "Series UI Design Standard"·PRD §6.1·TRD §4.3·PLAN 체크리스트가 모두 "부제목 = Gowun Dodum, clamp(0.9rem,3vw,1.2rem)"로 명시 — 표준 문서 우선) ③ play-screen·가로 모드(landscape) 섹션 제외(발췌 원칙 + D3 동결: 가로 UI 미포함) ④ `.start-links`·`.lb-*`(리더보드) 신설 — 신규 CSS 변수 없이 기존 토큰만 사용. 모두 의도된 차이로 판정.
  - 하드코딩 색상: `base.css`/`screens.css`/`game.css`에 hex 색상값 0건 — 배경은 `var(--cream)` 단독.
  - PWA·스토리지 격리: `CACHE_VERSION = '5_compound_split-v2'`(sw.js·config.js 일치, 타 게임 접두사와 충돌 없음), localStorage 접두사 `compound_split_`(settings/progress/leaderboard 3키), manifest `start_url`·`scope` `'./'` 상대경로 + `orientation: 'portrait'`, SW 등록 `register('./sw.js')` 상대경로 — 전부 충족.
  - 시리즈 연속성(4_word_network): `category` 6종(`rain_raindrop`·`mountain_pinecone`·`night_star`·`night_moon`·`meadow_flower`·`winter_snowflake`)이 4_word_network/src/data/words.js 표제어 id와 1:1 일치(6개 합성어 전부 실재 확인), `sceneEmoji` 5종(🌧️⛰️🌙🌸⛄)이 scenes.js 씬 대표 이모지와 일치.
  - 시리즈 연속성(6_morpheme_detective): `part1`/`part2`/`sharedMorpheme` 필드명 고정 유지, `SHARED_MORPHEME_PAIRS` export 확인(방울/빛/송이 × 각 2개 id), `SHOW_SHARED_MORPHEME_HIGHLIGHT` 플래그 존재(기본 OFF — R3), `AUTO_ADVANCE_STREAK` 플래그 존재(기본 0=수동 — R2).
  - 단일 차원 완충(PRD §2.2): 전체 소스에서 한자 기호·돋보기·핀치/제스처·가로 모드 미디어쿼리 0건(grep 검증), 조작은 분해-인식 탭/드래그 단일(재구성·역분해 없음), 어휘는 Stage 3 동일 6개 고정.
  - 게임 플레이 경로(정적): 3단 페이딩(boundary-solid/dashed/hidden + L1 양쪽 단서/L2 첫 조각만/L3 무단서), 오답 "그 조각은 뜻이 없네" + shake(키프레임 0%/100% translateX(0) → 원위치 복귀) + 1500ms 자동 숨김, buildQueue 반복 채움(12·18), end-screen 정답·오류·소요시간 표시, `.split-popup` `role="dialog"`+`aria-label`, 리더보드 20건 상한, localStorage 전 호출 try/catch(Incognito 안전), TTS 미지원 시 토글 비활성화 — 모두 코드 확인.
  - 판단 기록: 페이딩 레벨 선택 UI는 PLAN M3 초안의 ".btn/.btn.small" 대신 정본 공용 컴포넌트 `.chip`(components.css, 선택 상태 `.active` 내장)을 채택 — 1_chosung_quiz·2_vowel_finder 설정 화면 선택 UI와 동일 패턴(시리즈 정합 우선). iOS Safari 실기·저사양 Android 검증(R5·R6)은 정적 검토로 갈음, 실기 확인은 후속 과제로 유지.
  - 상태: 해결 (수정 1건 — M5-1 문서 정합화; 코드 불일치 0건)
