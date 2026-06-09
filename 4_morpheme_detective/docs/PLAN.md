# 🗂️ PLAN — 형태소 탐정 게임

> 개발 계획 및 진행 상태
> Last updated: 2026-05-25
> Status: **M9 한자 풀 100자 + 사건 10건 데이터 레이어 완료** — M7·M8 위에 한자 100자(한국어문회 7·8급) / 사건 10건 / 어휘 429개(자동 생성) / 도감 100칸 + 급수 필터(F15) / F18 10초 미발견 강화 펄스 / PWA SW v8(auto-gen) / 자동 생성 스크립트 4종(`gen-hanja-json`·`gen-vocab`·`gen-stage-svg`·`gen-sw` + `gen-all`) / `hanzi-writer-data` 좌표계로 morph cross-fade 정합. 남은 작업: 실 일러스트 10장 손그림 / morph path 정식 자산(Make Me a Hanzi) / 실기기 매트릭스 / Noto Sans CJK 서브셋.

## 📌 현재 상태

본 게임은 부모 `AGENTS.md`(2026-04-25)의 7단계 로드맵 중 **4단계(형태소 인식)** 에 해당. M4 완료 시점 기준 데이터 코어 + 시작 화면 + 주차장 SVG + hit zone 3개 발광 펄스 + 탭/클릭 → 단어 음절 분리 + 핵심 한자 음절 하이라이트 + Web Speech TTS + 돋보기 자석(실기기 통과) + spring-back 거절 + **상형문자 변형(車/水/火 3단계 path lerp + cross-fade 폴백)** 동작. 검증 스크립트(`npm run validate`) 오류 0 / 경고 0, morph 토큰 보간 호환 100%(車 11/11, 水 11/11, 火 11/11), 신규 8개 JS 모듈 syntax-check 통과.

선행: `3_word_network` (구현 완료) — 일상 어휘 자동 읽기 졸업 가정
후행: `5_vocabulary_tree` (설계 단계) — 발견 한자를 어휘 가지로 확장

## 🧭 마일스톤 개요

| 마일스톤 | 핵심 산출 | 종료 기준 (Definition of Done) |
|---|---|---|
| M0 | 문서 합의 | PRD/TRD/PLAN 리뷰 완료, P0급 오픈 이슈 해소 |
| M1 | 데이터 코어 | 한자 8자 메타·morph path·어휘 매핑·1개 스테이지 데이터 |
| M2 | 일러스트 + Hit Zone | 1개 사건 SVG + 클릭 가능 객체 좌표·발광 힌트 동작 ✅ |
| M3 | 돋보기 + 단어 분리 | 객체 탭 → 단어 → 음절 분리 + 핵심 음절 하이라이트 + TTS ✅ (실기기 통과 2026-05-14) |
| M4 | 상형문자 변형 | 실루엣 → 갑골문 → 해서체 SVG morph 부드러운 1.5 ~ 2.5초 ✅ (車/水/火) |
| M5 | 어휘 카드 + TTS | 한자 공유 어휘 4 ~ 5개 카드 + 음·뜻 + 어휘 발음 |
| M6 | MVP 게임 루프 | F1 ~ F12 완성, 1개 사건 완주 + 미션 카드 출력 |
| M7 | 다중 사건 + 확장 | 사건 4개+, F13 ~ F19 확장 기능 |
| M8 | 모바일 QA + 출시 | 실기기 매트릭스 통과, PWA 배포 |
| M9 | 한자 풀 100자 + 사건 10건 | 한국어문회 7·8급 100자 / 사건 10건 / 어휘 429개 / 자동 생성 파이프라인 / F15·F18 ✅ |
| M10 | v2+ 로드맵 | SRL, 부모 대시보드, 발음 평가, 5단계 연동 |

## 🚧 M0 — 문서 합의 (현재)

- [x] PRD.md 작성 (제품 요구사항, 시나리오, P0/P1/P2)
- [x] TRD.md 작성 (스택, SVG morph, 모바일 정책, 테스트 전략)
- [x] PLAN.md 작성 (본 문서)
- [ ] 부모/교사 1차 리뷰 (시나리오 S1 ~ S4 현실성 검증)
- [x] MVP 디폴트 사건 결정 → **주차장** (2026-05-10)
- [x] 일러스트 자산 확보 전략 결정 → **자체 SVG 제작** (2026-05-10)
- [x] 한자 path 데이터 출처 결정 → **Make Me a Hanzi (GPL)** (2026-05-10)
- [x] 한자 폰트 서브셋 자동화 도구 결정 → **pyftsubset (fonttools)** (2026-05-10)
- [ ] 초1 ~ 초2 사용성 테스트 대상 1차 확보 계획

## 🧱 M1 — 데이터 코어 (완료 · 2026-05-10)

### P0 (필수)
- [x] **디렉터리 골격 생성** — TRD §2.1 구조
  - `src/{css,js,data,assets/{stages,hanja,fonts,icons}}` + `scripts/` + `.omc/{autopilot,plans}`
- [x] **`src/data/hanja.js`** — 한자 메타 8자
  - 車 / 水 / 火 / 木 / 山 / 日 / 月 / 人
  - 각 항목: `id` · `reading` · `meaning` · `grade` · `morphPathsRef` · `vocab[]`
- [x] **`src/data/vocab.js`** — 어휘 → 한자 매핑 (총 36개)
  - 형식: `{ hanja: [HanjaId], syllableMap: { 음절인덱스: HanjaId } }`
  - 예: `'주차장': { hanja: ['車'], syllableMap: { 1: '車' } }`
- [x] **`src/data/stages.js`** — 사건 메타 1개 (`parking-lot`)
  - `clickableObjects` 2개 (주차장 표지판, 자동차) — polygon 좌표는 M2 일러스트 제작 후 확정
  - `words` 2개 (`parking-lot-sign`, `car-word`) — 각 `targetSyllableIdx` + `targetHanjaId`
- [x] **車 morph path 추출** — `src/assets/hanja/車.json`
  - 3-step: 수레바퀴 실루엣 → 갑골문(甲骨文) → 해서체(楷書)
  - 각 path 명령어 수 일치 (M + 9L + Z = 11) — 보간 호환
  - ⚠️ **placeholder** — Make Me a Hanzi(GPL) 실 데이터로 교체 예정
- [x] **시작 화면 F1·F2** — PRD §10 디자인 공통 규격 준수
  - `index.html` — 6개 화면 섹션 골격 (start / stage-select / play / settings / mission / end)
  - `src/js/main.js` — `showScreen()` 내비게이션 + 4개 버튼 핸들러
  - `src/js/config.js` — 상수 (SCREENS, MAGNET_PX, HIT_MIN_DP, MORPH_DURATION)
  - `src/js/state.js` — 전역 상태 싱글톤 (settings/stage/detection/progress)
  - CSS 7종: `tokens` · `base` · `screens` · `stage` · `magnifier` · `word-blocks` · `morph`
  - Jua/Gowun Dodum, coral `≥64dp` 버튼, cream 배경 + radial-gradient 3개
  - `@media (orientation: portrait)` 분기로 가로/세로 모두 대응
- [x] **검증 스크립트** — `scripts/validate-data.js`
  - hanja 8자 필수 필드 검사 (reading/meaning/grade/morphPathsRef)
  - 車.json morphPaths 3개 + 명령어 수 일치 검사
  - vocab `syllableMap` 인덱스 범위 + HANJA 참조 정합성
  - stages `targetHanjaId` ↔ HANJA, `text` ↔ VOCAB 교차 검증
  - `npm run validate` → ✅ 오류 0개 / 경고 0개

### P1 (M2~M4 진입 전)
- [x] morph path 나머지 7자 — placeholder JSON 생성 완료 (2026-05-16)
  - 水/火: M4에서 placeholder 작성
  - 木/山/日/月/人: M8에서 placeholder 작성
  - ⚠️ 실 데이터 교체는 Make Me a Hanzi(GPL) 추출 필요 → M9
- [ ] 한자 폰트 서브셋 (Noto Sans CJK 100자) — `pyftsubset`, woff2 < 200KB (외부 폰트 파일 필요)

### 종료 기준 (Definition of Done) — 충족
- [x] `data/hanja.js` import → `'車'` 객체에서 음/뜻/morphPathsRef/vocab 접근 가능
- [x] `npm run validate` 정합성 검증 통과 (오류 0)
- [x] `npx serve -p 4324` HTTP 200 + 시작 화면 13개 핵심 요소 렌더링
- [x] code-reviewer CRITICAL 이슈 0건 (인라인 onclick → event listener 패턴 수정 완료)

## 🎨 M2 — 일러스트 + Hit Zone (완료 · 2026-05-12)

### P0 (필수)
- [x] **주차장 SVG 일러스트 자체 제작** — `src/assets/stages/parking-lot.svg`
  - viewBox `0 0 1600 900` (16:9, preserveAspectRatio meet)
  - 구성: 하늘 그래디언트 + 해/구름 + 원경 건물(창문) + 나무 + 아스팔트 + 주차선(원근) + 표지판 + 자동차 2대
- [x] **`src/js/stage.js`** — 일러스트 로드 + hit zone overlay 동적 삽입
  - `fetch(illustrationSrc)` → `innerHTML` 주입 → `<svg>` 추출 → `<g id="hit-zone-overlay">` 추가
  - `unloadStage()` 로 안전 해제 (pulse timer · listener 정리)
- [x] **hit zone 좌표 데이터** — `src/data/stages.js`
  - 3개: `sign-juchajang` (주차장 표지판 · 기둥 포함 L자형 polygon)
  - `car-body-1` (빨간 자동차 전경 · 사각형)
  - `car-body-2` (파란 자동차 배경 · 사각형)
  - 좌표 모두 viewBox(1600×900) 기준, 폴리곤 영역 ≥ 80×80dp 환산
- [x] **발광 힌트 펄스** (PRD F5)
  - `.hit-zone.pulse { animation: hitPulse 1.2s ease-in-out infinite }`
  - SVG polygon `fill`/`stroke` 보간 (rgba 황색)
  - 5초 후 `setTimeout(stopPulse)` 자동 중단
  - 첫 클릭 시 즉시 중단 (인지 학습 후 종료)
- [x] **빈 영역 탭 무반응** — `e.target.closest('.hit-zone')` 가드
- [x] **`src/js/utils.js`** — `clamp` · `dist` · `dprPx` · `clientToViewBox` · `throttle`
- [x] **`src/js/pointer.js`** — Pointer Events 통합 attach/release (M3 확장 기반)
- [x] **`src/js/viewport.js`** — 줌/팬 스켈레톤 (P1, M7 활성화 예정)
- [x] **`main.js` 통합** — 시작 → 주차장 자동 로드 → 플레이 화면 + 홈 복귀 버튼
- [x] **`stage.css` 갱신** — SVG polygon 기반 `.hit-zone` 스타일 (focus/hover/pulse)
- [x] **`npm run dev`** 추가 (개발 서버 별칭)

### P1 (M3 진입 전)
- [ ] hit zone 80×80dp 실기기 검증 — iPad Mini / 갤럭시 탭 A8

### 종료 기준 (Definition of Done) — 충족
- [x] 1개 일러스트 위에 클릭 가능 객체 3개 발광 (3~5 범위 충족)
- [x] 객체 탭 시 콘솔 `[stage] hit objectId="…" wordId="…" label="…"` 출력
- [x] 빈 영역 탭 무반응 (closest 가드)
- [x] `npm run validate` 통과 (한자 8 / 어휘 36 / 스테이지 1)
- [x] 핵심 자산 6종 HTTP 200 + SVG viewBox·visual 그룹 5종 확인

## 🔍 M3 — 돋보기 + 단어 분리 (완료 · 2026-05-12)

### P0 (필수)
- [x] **`src/js/pointer.js`** — 통합 Pointer Events 강화
  - `down/move/up/cancel` + `setPointerCapture` + 자동 `releasePointerCapture`
  - `WeakMap<el, Set<pointerId>>` 기반 active pointer 추적
  - `releaseAll(el)` 구현 — 화면 전환 시 일괄 release (TRD §2.4)
- [x] **`src/js/hangul.js`** — 음절 분해 (TRD §3.1, 2단계와 동일)
  - `decompose(syllable)` → `{cho,jung,jong}` (0xAC00 기반)
  - `splitWord('주차장')` → `['주','차','장']`
  - `isHangulSyllable(ch)` 가드
- [x] **`src/js/tts.js`** — Web Speech API 래퍼 (TRD §3.6)
  - `unlock()` — 첫 사용자 제스처(`btn-start`)에서 빈 utterance 호출 → iOS Safari 활성화
  - `speakHanja({reading,meaning})` → "차, 수레 차" 패턴
  - `cancel()` — 화면 전환·언로드 시 정리
- [x] **`src/js/word-block.js`** — 단어 → 음절 분리 컴포넌트 (TRD §5.2 / PRD F7·F8)
  - `<span class="syllable">` 동적 렌더, `data-target="1"` 표시
  - `requestAnimationFrame` 후 `.spread` 클래스 → 음절 간격 트랜지션
  - 220ms 뒤 핵심 음절 `.hl` 추가 → 분리·하이라이트 단계감
  - `clearWord()` 로 안전 해제
- [x] **`src/js/magnifier.js`** — 돋보기 + 자석 흡착 (TRD §3.3 / PRD F6)
  - `attachMagnifier(stage)` — body 직속 `.magnifier` div, `pointer-events: none`
  - `pointermove` → 가장 가까운 `.hit-zone` 중심 거리 계산
  - `dist ≤ MAGNET_PX(=40 * devicePixelRatio)` 이면 `.snapped` + 중심으로 스냅
  - `detachMagnifier()` — 화면 전환 시 cleanup
- [x] **`stage.js` 확장** — hit → 단어 분리 + TTS 통합
  - `onHit` → `showWord({...})` + 260ms 뒤 `speakHanja` (하이라이트 트랜지션 직후)
  - 빈 영역 탭 → `springBackFlash` SVG 펄스 (PRD F4 부드러운 거절)
  - `unloadStage` → `cancelTts()` + `clearWord()` 정리 보강
- [x] **`main.js` 통합** — TTS unlock + magnifier 라이프사이클
  - `btn-start` click 안에서 `unlockTts()` 호출 (iOS 자동재생 정책)
  - `play` 진입 → `attachMagnifier(stage-canvas)`
  - `showScreen` → `releaseAll` + `detachMagnifier` + `cancelTts` 일괄 부작용
- [x] **CSS 마감**
  - `stage.css`: `.spring-back` 빈 영역 탭 시각 거절 펄스 (360ms)
  - `word-blocks.css`: spread/hl 트랜지션 (기존 스켈레톤 활용)
  - `magnifier.css`: snapped 시 coral 글로우 (기존 스켈레톤 활용)

### P1 (M4 진입 전)
- [x] **실기기 1차 점검** — iPad / 갤럭시 탭 — 자석 흡착 + 한국어 TTS 동작 확인 (2026-05-14)
- [x] 한국어 음성 미설치 환경 폴백 — `isAvailable()` false 시 `.tts-unavail` + 🔇 힌트 + `audio.js` 효과음 (M5에서 구현)
- [ ] 보급형 안드로이드 입력 지연 ≤ 16ms 확인 (Performance 패널)

### 종료 기준 (Definition of Done) — 데스크톱·정적 검증 통과
- [x] 객체 탭 → 1초 이내 단어 음절 분리 + 핵심 음절 하이라이트
- [x] `speakHanja` 호출 → "차, 수레 차" TTS (브라우저 한국어 보이스 존재 시)
- [x] 빈 영역 탭 → spring-back 펄스 표시 + 다른 부작용 없음
- [x] 돋보기 `.snapped` 토글 — hit zone 화면 좌표 기준 ≤ 40dp 시 스냅
- [x] 화면 전환 → pointer capture release + TTS cancel + magnifier hide
- [x] `npm run validate` 통과 (오류 0 / 경고 0) — 데이터 회귀 없음
- [x] 모든 신규/수정 모듈 `node --check` syntax OK
- [ ] iPad / 갤럭시 탭 영상 검증 (P1)

## 🐢→🐉 M4 — 상형문자 변형 애니메이션 (완료 · 2026-05-14)

### P0 (필수)
- [x] **`src/js/morph.js`** — SVG path morph 엔진
  - `tokenize(d)` — `[A-Za-z]+숫자열` 정규식 기반 명령 토큰화
  - `isInterpolatable(a,b)` — 명령 시퀀스·인자 개수 1:1 매칭 검사
  - `lerpTokens(a,b,t)` — 인자 단위 선형 보간 + `serialize()` 직렬화
  - `animatePath(pathEl, fromD, toD, dur)` — `requestAnimationFrame` + `easeInOutCubic`
  - `morphSequence(pathEl, paths, dur)` — n단계 순차 보간(0→1→2)
  - `crossFadeSequence(container, paths, dur)` — 폴백: `.morph-stage.active` opacity 시퀀싱
  - `isLowEndDevice()` — `deviceMemory < 2 || hardwareConcurrency < 4`
  - `runMorph(container, data, dur)` — 호환·기기성능 자동 분기 (lerp ↔ cross-fade)
  - `loadHanjaPaths(meta)` — `morphPathsRef` lazy fetch + `Map` 캐시
  - `cancelMorph()` — rAF 취소 + cleanup
- [x] **`src/assets/hanja/水.json`** — 3-step path (M+9L+Z=11) placeholder
- [x] **`src/assets/hanja/火.json`** — 3-step path (M+9L+Z=11) placeholder
- [x] **`stage.js` 통합** — `onHit` → TTS와 병렬로 `triggerMorph(hanja)` 호출
  - 한자 JSON `loadHanjaPaths` → `runMorph` → `state.detection.morphPhase` 진행
  - `unloadStage` 에 `cancelMorph` + `.morph-stage` 클리어 + `aria-hidden` 복귀
- [x] **`index.html`** — `#morph-container.morph-container` + `.morph-backdrop` 도크 삽입
- [x] **`morph.css` 활용** — `.morph-stage`/`.morph-path`/`.morph-backdrop` 기존 스켈레톤
  - viewBox 0 0 200 200 고정, `preserveAspectRatio="xMidYMid meet"` → transform-origin 중앙 고정
- [x] **저사양 자동 폴백** — `runMorph` 가 토큰 미스매치 또는 `isLowEndDevice()` 시 cross-fade 분기
- [x] **검증 확장** — `scripts/validate-data.js` 가 車·水·火 명령 수 일치 검사
  - `npm run validate` → 車/水/火 각 11개 명령 일치, 오류 0 / 경고 0

### P1 (M5 진입 전)
- [ ] 보급형 안드로이드(2GB RAM) 30fps+ Performance 패널 측정
- [x] `flubber` 라이브러리 도입 여부 결정 — MVP 단계에서 자체 lerp 유지 결정 (2026-05-16). 실기기 30fps 미달 시 M9에서 재검토.
- [x] 木/山/日/月/人 morph path 5자 — placeholder JSON 생성 완료 (2026-05-16). Make Me a Hanzi 실데이터 교체는 M9.
- [ ] viewBox 200×200 ↔ stage SVG 1600×900 비례 시각 일관성(돋보기 멈춤 후 morph 등장 위치) 점검

### 종료 기준 (Definition of Done) — 정적·데스크톱 충족
- [x] 車/水/火 3자 morph 토큰 보간 호환 (`isInterpolatable` 100% 통과)
- [x] 객체 탭 → TTS 직후 morph 컨테이너에서 실루엣 → 갑골문 → 해서체 부드럽게 동작
- [x] 보간 불가 또는 저사양 시 cross-fade 자동 폴백
- [x] 화면 전환 → `cancelMorph` + `.morph-stage` 클리어
- [x] `npm run validate` 통과 (morph 확장 포함)
- [x] `node --check` × morph.js / stage.js 통과
- [ ] 보급형 안드로이드 30fps+ 영상 검증 (P1)

## ✅ M5 진입 전 점검 (Gate Checklist)

M5(어휘 카드 + TTS) 작업 시작 전 아래 항목을 일괄 확인한다.

### 데이터 정합성
- [x] `src/data/hanja.js` 의 각 한자 `vocab[]` 가 어휘 카드 4 ~ 5개 노출에 충분한지 확인 (5개 × 8자 확인)
- [x] `vocab.js` 항목과 한자 카드 텍스트가 동일하게 표기되는지 검사 (`'주차장'`/`'자동차'` 일치 확인)
- [x] 친숙도 순서 필드 추가 — `vocab.js` 36개 항목 전체에 `familiarity: 1|2|3` 추가 (2026-05-16)

### 모듈·UI 의존성
- [x] `tts.js` `speak(text)` 어휘 호출 안정적 — `isAvailable()` 폴백 포함
- [x] morph 종료 직후 카드 펼침 트리거 — `triggerMorph()` await 완료 → `showCardDeck()` Promise 체인
- [x] 세로 모드 레이아웃 — 단계별 순차 표시 (word-block → morph → card-deck 슬라이드업)
- [x] 카드 부채꼴(가로) ↔ 수평 슬라이드(세로) — `@media (orientation: portrait)` 분기 구현
- [x] 카드 TTS 중복 방지 — `speak()` 호출 전 `synth.cancel()` (tts.js 기존 동작)

### 자산·접근성
- [x] 한국어 음성 미설치 폴백 — `isAvailable()` false 시 `.tts-unavail` 클래스 + 🔇 힌트
- [x] `audio.js` Web Audio Oscillator 효과음 — unlock/play/stopAll 구현 (2026-05-16)
- [x] 카드 키보드 접근성 — `role="button"` + `tabindex="0"` + Enter/Space 처리
- [x] 카드 색맹 대응 — `border-bottom: 6px solid var(--navy)` 형태 패턴 병기

### 회귀 가드
- [x] `npm run validate` 통과 (오류 0 / 경고 0) — 2026-05-16
- [ ] M3 실기기 회귀 — 클릭/탭, 자석, TTS unlock, spring-back 모두 정상 (실기기 미확인)
- [x] M4 morph — `unloadStage` 시 잔여 `.morph-stage` / 백드롭 잔상 없음 (clearCards 추가)

> 위 4개 군 코드 기준 충족 → M5 구현 완료 (2026-05-16). 실기기 검증은 M8에서 수행.

## 🃏 M5 — 어휘 카드 + TTS (완료 · 2026-05-16)

| # | 작업 | 비고 |
|---|---|---|
| 1 | `card-deck.js` — 부채꼴 등장 애니메이션 | rotate + translate transition ✅ |
| 2 | 카드 탭 → 어휘 발음 (Web Speech) | TTS rate 0.95, ko-KR ✅ |
| 3 | 음·뜻 자동 발음 (한자 변형 직후) | "차, 수레 차" (기존 M3 동작) ✅ |
| 4 | 한국어 음성 미설치 폴백 | `.tts-unavail` + 🔇 힌트 ✅ |
| 5 | `audio.js` — 발견음/변형음/보상음 | Oscillator 기반, 외부 파일 없음 ✅ |
| 6 | 카드 등장 순서 = 친숙도 순 | `familiarity: 1|2|3` 36개 배정 ✅ |

종료 기준: 한자 발견 직후 카드 4개가 부드럽게 펼쳐지고, 각 카드 탭 시 발음. iOS Safari TTS unlock 검증.

## 🎮 M6 — MVP 게임 루프 (F1 ~ F12) ✅ 완료 · 2026-05-16

| # | 기능 | 상태 |
|---|---|---|
| 1 | 시작 화면 (F1, F2) — 가로/세로 모두 지원, 회전 안내 없음 | ✅ |
| 2 | 사건 카드 선택 화면 (F3) — MVP: 주차장 자동 진입 | ✅ |
| 3 | 일러스트 + 클릭 객체 + 발광 힌트 (F4, F5) | ✅ |
| 4 | 돋보기 자석 (F6) | ✅ |
| 5 | 단어 → 음절 분리 + 한자 음절 하이라이트 (F7, F8) | ✅ |
| 6 | 상형문자 변형 (F9) | ✅ |
| 7 | 어휘 카드 덱 (F10) | ✅ |
| 8 | 진행률 + 별 스티커 (F11) — `progress.js` / `game.js` | ✅ |
| 9 | 종료 화면 + 미션 카드 (F12) — `mission.js` SVG text 기반 | ✅ |
| 10 | `game.js` — 라운드 컨트롤러 통합 | ✅ |
| 11 | 사건 1개 = 한자 1개(車) 발견 시나리오 | ✅ |

### 구현 내용 (2026-05-16 · 1차)
- `src/js/progress.js` (신규): localStorage `4md:collected`/`4md:stars` 영속화, Private Mode 폴백
- `src/js/mission.js` (신규): 미션 카드 HTML 렌더 + SVG `<text>` 기반 다운로드 + Web Share API
- `src/js/game.js` (신규): 라운드 컨트롤러 — 발견 콜백, 진행률 UI, 미션/종료 화면 진입
- `src/js/stage.js` (수정): `setDiscoveryCallback()` + 발견 후 콜백 호출
- `src/js/state.js` (수정): `sessionCollected: new Set()` 추가
- `src/js/main.js` (수정): `initGame`, `btn-show-mission`, 종료 화면 이벤트 위임
- `index.html` (수정): 도크 상단 바 (진행률 + 미션 버튼), mission/end 화면 컨테이너
- `src/css/screens.css` (수정): 도크 상단 바, 미션 카드, 종료 화면 스타일

### 안정화 (2026-05-16 · 2차)
- **F3 사건 선택 화면 구현**: `btn-start` → stage-select 화면 → 사건 카드 클릭 → play
  - `stages.js` 기반 동적 렌더 (`_renderStageSelect()`), M7 다중 사건 확장 준비
  - `src/css/screens.css`: `.stage-card` / `.stage-card-list` / `.stage-select-wrap` 스타일
- **Portrait 도크 UX 개선**: `stage.css` 세로 도크를 `flex-direction: column` 세로 스택으로 변경
  - 도크 상단 바 고정, 나머지 콘텐츠 `overflow-y: auto` 스크롤
  - `card-deck.css`: 세로 도크 내 카드 덱 `overflow-x: auto` 독립 가로 스크롤
  - 오래된 portrait `dock-top-bar` 세로 스택 CSS 오버라이드 제거
- **별 표시 정책 명시**: 8한자 기준 최대 8별 (의도된 상한) — `progress.js`/`game.js` 주석 추가

종료 기준: 시작 → 사건 선택 → 주차장 → 탭 → 음절 분리 → morph → 카드 → 별 갱신 → 미션 보기 → 종료 → 다시하기/홈. `npm run validate` + `node --check` 통과.

## 🌐 M7 — 다중 사건 + 확장 기능 ✅ 완료 · 2026-05-16

| # | 작업 | 우선 | 상태 |
|---|---|---|---|
| 1 | 사건 4개 (학교 급식실, 주차장, 소방서, 약수터) | High | ✅ |
| 2 | F13 줌/팬 모드 (폰 우선) | High | ✅ |
| 3 | F14 도감(컬렉션) 화면 | High | ✅ |
| 4 | F15 한자 풀 필터 (교사·부모 설정) | Med | ⏳ M9 |
| 5 | F16 진척도 영속화 (`4md:` localStorage) | High | ✅ (M6에서 완료) |
| 6 | F17 음·뜻 자동 TTS 정책 정리 | High | ✅ (M8 설정 토글에서 흡수) |
| 7 | F18 부분 힌트 (펄스 강화) | Med | ⏳ M9 |
| 8 | F19 다크 모드 + 폰트 크기 | Low | ✅ (M8에서 완료) |
| 9 | 한자 8자 모두 적어도 1 사건에서 발견 가능 | High | ✅ |

### 구현 내용 (2026-05-16)
- `src/data/stages.js` (수정): school-cafeteria/fire-station/water-spring 사건 3개 추가
- `src/assets/stages/school-cafeteria.svg` (신규): 木/人/水 한자 hit zone SVG
- `src/assets/stages/fire-station.svg` (신규): 火/水 한자 hit zone SVG
- `src/assets/stages/water-spring.svg` (신규): 水/山/日/月 한자 hit zone SVG
- `src/js/viewport.js` (수정): 핀치 줌 + 드래그 팬 완전 구현 (1x~3x, 경계 보정)
- `src/js/collection.js` (신규): 8칸 한자 도감 그리드, 미발견 잠금 표시
- `src/js/config.js` (수정): SCREENS.COLLECTION 추가
- `src/js/main.js` (수정): viewport/collection 연결, 화면 전환 핸들러
- `src/js/game.js` (수정): 종료 화면 '도감 보기' 버튼 추가
- `src/css/screens.css` (수정): 컬렉션 화면 4×2 그리드 스타일

### 한자 커버리지 (4개 사건)
- 車: 주차장 (기존)
- 木/人/水: 학교 급식실
- 火/水: 소방서
- 水/山/日/月: 약수터

종료 기준: 사건 4종 모두에서 한자 발견 → 컬렉션 누적 → 다음 세션에 별·컬렉션 유지. `npm run validate` 오류 0 / `node --check` ALL PASS.

## 🧪 M8 — 모바일 QA + 출시

> Last updated: 2026-05-22 — SW v3, 설정 페이지 풀 구현, 카드 5장 격자, 한자 글리프 fallback, 클릭 라우팅 4단계, 가로 모드 카드 가시성, dev port 4324

### 구현 완료 (2026-05-22 · 3차 — 안정화)
- [x] **설정 페이지 풀 구현** — `src/js/settings.js` + `index.html#settings-screen`
  - TTS 토글(미설치 디바이스는 `disabled` + ⚠️ 힌트), 효과음 토글, 발광 힌트 토글
  - 글자 크기 chip (0.9/1.0/1.15) → `body[data-font]` 전역 적용
  - 다크 모드 토글 → `body[data-theme='dark']` CSS 변수 오버라이드 (`base.css`)
  - 진행 데이터(도감·별) 초기화 with `window.confirm` 안전 가드
  - 기본값 복원 / 홈으로 / 닫기 버튼
- [x] **카드 5장 격자 레이아웃** — `card-deck.css`
  - 가로 모드: 부채꼴 → `flex-wrap` 격자로 전환, 5장 모두 한눈에 표시
  - 세로 모드: `nowrap` + `overflow-x: auto` 수평 스크롤 유지
  - 친숙도 정렬 + staggered 등장 트랜지션 보존
- [x] **한자 글리프 fallback** — `morph.js#appendGlyphStage/revealGlyphStage`
  - placeholder path 의 시각적 한계 보완 — 마지막 단계에 system CJK `<text>` 글리프 페이드인
  - `intermediatePaths = morphPaths.slice(0, -1)` 로 마지막 한 칸을 양보
- [x] **클릭 라우팅 견고화** — `stage.js` 4단계
  - `e.target.closest('.hit-zone')` → `findHitZoneByPoint` (좌표 → SVG ctm.inverse + ray-casting) → `magnifier.getSnappedHitZone()` → `nearestHitZoneFromPoint(MAGNET_PX * 3)`
  - 리스너는 inner `<svg>` 가 아닌 `#stage-canvas` div 에 등록 → letterbox / transform / 자식 가로채기 무관
- [x] **dev port 4324** — `package.json` (`npx serve -p 4324`)
- [x] **service-worker v3** — `CACHE_VERSION = 'morpheme-detective-v3'`, 도감/설정 모듈 포함 47개 프리캐시

### 구현 완료 (2026-05-16 · 1·2차)
- [x] **Service Worker 캐시 전략** — `service-worker.js`
  - Cache First: App Shell (CSS/JS/Data/SVG/JSON) — 오프라인 지원
  - Stale While Revalidate: Google Fonts CDN
  - Network First: 기타 요청
  - install: APP_SHELL_URLS 프리캐시 + skipWaiting
  - activate: 이전 버전 캐시 삭제 + clients.claim
- [x] **PWA 아이콘 SVG** — `src/assets/icons/icon.svg` + `apple-touch-icon.svg`
  - 돋보기 + 車 한자 조합 디자인 (coral 배경, navy 렌즈)
  - `scripts/gen-icons.mjs` — sharp로 PNG 변환 스크립트 (`npm run gen-icons`)
- [x] **manifest.webmanifest 보완** — SVG 아이콘 + categories + maskable purpose
- [x] **index.html PWA 메타 태그 강화** — apple-touch-icon, apple-mobile-web-app-title, icon link

### PNG 아이콘 생성 필요 (사용자 수동 작업)
```bash
npm install --save-dev sharp
npm run gen-icons   # icon-192.png, icon-512.png, apple-touch-icon.png 생성
```

### 디바이스 매트릭스 (TRD §8 동기화) — 실기기 필요
- [ ] iPad Mini (iOS 15+)
- [ ] iPad Pro 12.9"
- [ ] 갤럭시 탭 A8 (Android 12+)
- [ ] iPhone SE (가로/세로 + 줌/팬)
- [ ] 보급형 안드로이드 (2GB RAM)

### 인지·정책 검증
- [x] **게임 내 한자 쓰기 입력 부재** 확인 (PRD §7 정책 준수 — 구현됨)
- [x] 학습자가 **이미 아는 단어**에서만 한자 노출 확인 (PRD §7 정책 준수 — 구현됨)
- [ ] "한자가 어렵다" 부정 반응 < 10% (사용자 시범 5 ~ 10명)
- [ ] 미션 카드 발급 → 일주일 후 학부모 인터뷰: 일상 한자 발견 행동 30%+

### 출시 체크리스트
- [x] PWA 매니페스트 — icons, theme color, orientation: any, categories
- [x] Service Worker 캐시 — `app-shell` + `stages` + `hanja-paths` + `fonts` 분리
- [ ] **PNG 아이콘 생성** — `npm run gen-icons` (sharp 설치 후)
- [ ] Lighthouse 모바일 PWA 스코어 ≥ 90 (PNG 아이콘 생성 후 측정)
- [ ] 첫 로드 < 3초 (3G 시뮬레이션), 첫 사건 진입 < 5초
- [ ] 한자 폰트 서브셋 < 200KB (pyftsubset + Noto Sans CJK 필요)
- [ ] 사용자 시범 (만 7·8세 각 2 ~ 3명) 1개 사건 완주 가능 확인

## 🌳 M9 — 한자 풀 100자 + 사건 10건 (진행 중 · 2026-05-25)

### P0 (필수) — 데이터 레이어 ✅
- [x] **한자 100자 메타** (`src/data/hanja.js`) — 한국어문회 7·8급(8급 50 + 7급Ⅱ 50)
- [x] **사건 10건 메타** (`src/data/stages.js`) — 각 10자 분배, `buildStage()` 헬퍼 + 2행×5열 grid placeholder polygon
  - parking-lot · classroom · family-home · school-cafeteria · fire-station · nature-park · market · sky-time · street · numbers-class
- [x] **어휘 429개 자동 매핑** (`scripts/gen-vocab.mjs` → `src/data/vocab.js`)
- [x] **한자 JSON 100개 placeholder** (`scripts/gen-hanja-json.mjs` → `src/assets/hanja/*.json`)
- [x] **일러스트 10장 grid placeholder** (`scripts/gen-stage-svg.mjs` → `src/assets/stages/*.svg`)
- [x] **PWA SW 자동 생성** (`scripts/gen-sw.mjs` → `service-worker.js` v8, 자산 list 동기화 + cache version bump)
- [x] **`hanzi-writer-data` 좌표계 정합** — morph cross-fade viewBox 일치 (커밋 `eaba9b6`)
- [x] **`npm run gen-all`** — 4개 생성 스크립트 한 번에 실행
- [x] **F15 도감 급수 필터** — 전체 / 8급 / 7급Ⅱ 칩, `4md:collectionFilter` localStorage 영속
- [x] **F18 강화 펄스** — 10초 미발견 시 미발견 hit zone 에 `.pulse-strong` (코랄 톤 + drop-shadow + 0.9s 주기), 설정 발광 힌트 OFF 시 비활성
- [x] **도감 100칸 반응형 그리드** — 5/8/10열 분기

### P1 (잔여) — 자산 + 폴리시
- [ ] **실 일러스트 10장 손그림** — 현재 grid placeholder. 사건별 맥락 일러스트 제작 필요
- [ ] **morph path 정식 자산** — Make Me a Hanzi(GPL) 100자 실데이터로 placeholder 교체
- [ ] **Noto Sans CJK Korean 서브셋** — `pyftsubset` woff2 < 200KB (사용 한자 100자 한정)
- [ ] **실기기 매트릭스** — iPad Mini / iPad Pro / 갤럭시 탭 A8 / iPhone SE / 보급형 안드로이드

### 종료 기준 (Definition of Done)
- [x] `npm run validate` 통과 — 한자 100 / 어휘 429 / 사건 10 교차 검증
- [x] `npm run gen-all` 일관성 보장 — 데이터 변경 시 한자 JSON / 어휘 / 스테이지 SVG / SW 한 번에 재생성
- [ ] 사용자 시범 (만 7·8세) 사건 10건 중 임의 1건 완주 가능 확인
- [ ] Lighthouse 모바일 PWA 스코어 ≥ 90

## 🔭 M10 — v2+ 로드맵 (아이디어)

### P2
- [ ] **IndexedDB SRL**: 발견 한자별 재노출 스케줄 (에빙하우스 곡선)
- [ ] **5단계 연동**: 발견 한자 → `5_vocabulary_tree` 학습 큐 자동 전달 (`4md:collected` → `5vt:queue`)
- [ ] **부모 대시보드(웹)**: 발견 한자, 취약 한자, 세션 시간 시각화
- [ ] **발음 평가**: Web Speech API + Levenshtein 거리 → 어휘 카드 따라 읽기 채점
- [ ] **사용자 기여 어휘**: 부모/교사가 추가 어휘 등록(JSON import)

### P3 (실험)
- [ ] **상형 추리 모드**: 한자 → 실루엣 역방향 추리(보상 연계)
- [ ] **클래스룸 모드**: 교사 PC에서 학생 태블릿 진척도 LAN 미러링
- [ ] **사건 자동 생성기**: 학습자 어휘 풀 기반 일러스트 추천
- [ ] **음·뜻 사전 녹음 음성**: TTS 품질 부족 디바이스 폴백

## 🔄 기술 부채 / 개선점 (예상)

| 항목 | 우선순위 | 메모 |
|---|---|---|
| TypeScript 마이그레이션 | Medium | state·hanja 데이터 타입 안정성 |
| Vitest 단위 테스트 | Medium | morph path 정합성 우선 |
| Playwright 모바일 E2E | Low | 실기기 검증 보조용 |
| Vite 빌드 도구 | Medium | 한자 폰트 서브셋·SW precache 자동화 시 |
| `flubber` 라이브러리 도입 | Medium | 자체 morph 보간 부족 시 |
| 한자 path 데이터 통합 도구 | High | Make Me a Hanzi 라이선스 검토 + 변환 파이프라인 |
| i18n | Low | 한국어 학습 외국인 영어 UI |
| Canvas 렌더 | 매우 낮음 | SVG morph 30fps 미달 시에만 |

## 🎯 브랜치 전략 (제안)

```
main                 # 배포 안정 버전 (M8 이후)
├── dev              # 통합 개발 브랜치
    ├── feat/m1-data-core
    ├── feat/m2-stage-hitzone
    ├── feat/m3-magnifier
    ├── feat/m4-svg-morph
    ├── feat/m5-card-deck
    ├── feat/m6-mvp-loop
    ├── feat/m7-stages-extensions
    └── feat/m8-pwa-release
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `perf:`, `a11y:`, `data:`(한자/어휘 데이터 변경)

## 📝 릴리즈 노트 (예정)

### v0.1.0 — M6 MVP (예정)
- 사건 1개(주차장) 완주 가능
- 한자 1 ~ 2자 발견 + 어휘 카드 + 미션 카드
- iPad / 갤럭시 탭 가로/세로 모드 동작
- SVG morph + Web Speech TTS

### v0.5.0 — M7
- 사건 4개 + 한자 8자 모두 발견 가능
- 컬렉션·필터·진척도 영속화
- 줌/팬 모드 (폰)

### v1.0.0 — M8
- PWA 정식 배포
- 실기기 매트릭스 통과
- 한자 폰트 서브셋 < 200KB

## 📚 참고 문서

- 부모 `../AGENTS.md` — 7단계 로드맵, 모바일 정책, 포트 컨벤션
- 본 디렉토리 `../AGENTS.md` — 게임 메커닉 1차 출처 (한자 풀, 인지 목표)
- `docs/PRD.md` — 제품 요구사항
- `docs/TRD.md` — 기술 설계, SVG morph 알고리즘, 수동 테스트 체크리스트
- 인접: `../../2_syllable_assembly/docs/`, `../../5_vocabulary_tree/AGENTS.md` — 데이터/패턴 호환
- 이론: 보고서 §"제3단계: 형태소 탐정 게임" — 양뇌 활성화, 만 6세 전후 형태소 인식 임계점

---

## 디자인 일관성 체크리스트 (홈·설정·완료 화면)

시작·설정·완료 화면 구현 전·후 아래 항목을 확인한다 (기준: `1_chosung_quiz`).

- [ ] 제목에 `font-family: 'Jua', sans-serif` 적용
- [ ] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [ ] `tokens.css` CSS 변수 팔레트 — 1단계 기준 색상·배경·간격 동일 적용
- [ ] 큰 라운드 버튼 스타일 (`1_chosung_quiz/src/css/components.css` 참조)
- [ ] 배경 색상 `--color-bg` 동일 사용
- [ ] 미션 완료 화면(mission-screen)에도 동일 폰트·색상·버튼 스타일 적용
- [ ] 1단계 홈·설정·완료 화면과 나란히 놓고 시각적 통일감 육안 확인
