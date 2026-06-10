# 🗂️ PLAN — 3_word_network · 순우리말 어휘망 연결 게임

> 개발 계획 및 진행 상태
> Last updated: 2026-05-10
> Status: **Phase 1·2·3·4 완료 · Phase 5 대기**
> 참조: `./PRD.md`, `./TRD.md`, `../AGENTS.md`

## 🧭 마일스톤 개요

| 마일스톤 | 목표 | 게이트 |
|---------|------|-------|
| **M0** 설계 | PRD/TRD/PLAN 확정, 일러스트 자산 전략 결정 | 본 3문서 + 단어 50개 초안 |
| **M1** Walking Skeleton | 시작 → 1장면 클리어 → 종료, 단일 카테고리 | 한 명이 5분 안에 끝까지 플레이 |
| **M2** MVP (P0 완성) | F1~F10 전부 동작, 장면 8개·단어 50개 | 학부모·아이 실기기 검증 통과 |
| **M3** 확장 (P1) | 카테고리/난이도/힌트/복습 | 자동 힌트 사용률 < 30% 확인 |
| **M4** 데이터 확장 | 장면 20개, 단어 100개, 카테고리 5개 균형 | 4주 사용자가 모든 카테고리 노출 |
| **M5** PWA + 대시보드 | 홈 화면 설치, 부모 대시보드, 다크 모드 | Lighthouse PWA 90+ |
| **M6** 라이브러리화 | 2단계와 dnd/syllable-block 공유 모듈 추출 | 두 게임 모두 회귀 없음 |

---

## 📐 Phase 0 — 설계 ✅ 완료

| # | 작업 | 산출물 | 상태 |
|---|------|-------|------|
| 0.1 | PRD 작성 | `docs/PRD.md` | ✅ |
| 0.2 | TRD 작성 | `docs/TRD.md` | ✅ |
| 0.3 | PLAN 작성 | `docs/PLAN.md` | ✅ |
| 0.4 | 단어 데이터 초안 (50개) | `src/data/words.js` 초안 | ✅ |
| 0.5 | 장면 매핑 초안 (8개) | `src/data/scenes.js` 초안 + hotspot 좌표 | ✅ |
| 0.6 | 일러스트 자산 전략 결정 | **이모지 콜라주** (3단 폴백 최저층) — Phase 4에서 SVG 재검토 | ✅ |
| 0.7 | 카테고리 라벨 통일 | '자연' / '동물' / '일상' / '행동' / '감정(체언)' 확정 | ✅ |
| 0.8 | 디자인 토큰 차용 | 1단계 tokens.css 색상/폰트 차용 완료 (`tokens.css`) | ✅ |

**Exit 게이트**: ✅ 달성

---

## 🚶 Phase 1 — Walking Skeleton (M1) ✅ 완료

> 목표: "흐름이 끊기지 않는 1장면짜리 데모"

| # | 작업 | 의존 | 상태 |
|---|------|-----|------|
| 1.1 | `index.html` + 화면 3개 골격(start/play/end) | — | ✅ |
| 1.2 | `config.js` / `state.js` / `storage.js` 스텁 | — | ✅ |
| 1.3 | `main.js` 진입점 + 화면 전환 | 1.1, 1.2 | ✅ |
| 1.4 | `words.js` / `scenes.js` 8개 장면 전체 | 0.4, 0.5 | ✅ |
| 1.5 | 이모지 콜라주 + 실사 배경 이미지(Unsplash) | 1.4 | ✅ |
| 1.6 | 음절 도크 렌더 (탭 입력, 3줄 기본 높이) | 1.4 | ✅ |
| 1.7 | 슬롯 채움 + 정답 검증 + prefix 잠금 | 1.6 | ✅ |
| 1.8 | 정답 시 다음 장면 / 종료 화면 (점수·스티커·격려) | 1.7 | ✅ |

**Exit 게이트**: ✅ 달성 (2026-04-29)

---

## 🎯 Phase 2 — MVP P0 완성 (M2) ✅ 코드 완료 (실기기 검증 대기)

### 2.A 인터랙션 강화 (탭 기본 / 드래그 옵션)
- [x] 2.A.1 `dnd.js` — Pointer Events 이벤트 위임, AbortController 생명주기 ✅
- [x] 2.A.2 음절 도크 → 슬롯 드래그 (threshold 8px, ghost clone, drag-over 하이라이트) ✅
- [ ] 2.A.3 단어 칩 → hotspot 드래그 매칭 ← Phase 3으로 이동
- [x] 2.A.4 탭 시 빈 슬롯 자동 배치 ✅

### 2.B 피드백
- [x] 2.B.1 정답 사운드 — `playCorrect()` C5→E5→G5 아르페지오 (Web Audio API) ✅
- [x] 2.B.2 오답 사운드 + prefix 잠금 — `playIncorrect()` G3→D3 하강 톤 ✅
- [x] 2.B.3 햅틱 vibrate(15/30/50) ✅

### 2.C 음성
- [x] 2.C.1 `tts.js` (ko-KR, rate 0.85) ✅
- [x] 2.C.2 정답 시 자동 발화 + 장면 단어 탭으로 재발화 ✅
- [x] 2.C.3 음성 미지원 graceful fallback ✅

### 2.D 종료 화면
- [x] 2.D.1 모은 스티커 컬렉션 표시 ✅
- [x] 2.D.2 격려 메시지(랜덤 풀 6개) ✅
- [x] 2.D.3 "다시 하기" / "홈" 분기 ✅

### 2.E 데이터
- [x] 2.E.1 장면 8개 완성 (자연 3 / 동물 3 / 일상 2) ✅
- [x] 2.E.2 playground 단어 보강 — 그네·시소·모래 추가 (총 5개) ✅

### 2.F 계획 외 추가 구현 (v0.1.x)
- [x] 2.F.1 슬롯 탭으로 음절 취소 ✅
- [x] 2.F.2 게임 중 홈 버튼 ✅
- [x] 2.F.3 장면 배경 이미지 (picsum.photos) + 가독성 오버레이 ✅
- [x] 2.F.4 음절 도크 3줄 기본 높이 ✅
- [x] 2.F.5 Android 호환 이모지 교체 ✅

### 2.G TTS·사운드 품질 개선 (v0.2.x)
- [x] 2.G.1 음절 입력 시 즉시 TTS 발화 ✅
- [x] 2.G.2 마지막 음절 TTS → 정답사운드 → 전체 단어 TTS 순서 보장 (`speakThen`) ✅
- [x] 2.G.3 마지막 음절 TTS → 오답사운드 순서 보장 ✅
- [x] 2.G.4 `AudioContext` 사용자 제스처 시점 사전 초기화 (`initAudio`) ✅
- [x] 2.G.5 `speakThen` onerror + 100ms setTimeout 폴백 (Chrome/Android onend 미발화 버그 대응) ✅

**Exit 게이트**: PRD §9 지표 측정 가능 + 학부모·아이 실기기 1회 이상 검증. ← 코드 완료 / **실기기 검증 미달성**

---

## 🧩 Phase 3 — 확장 P1 (M3)

### 3.A 설정 화면
- [x] 3.A.1 카테고리 복수 선택 ✅
- [x] 3.A.2 난이도 4단 (easy/medium/hard/custom) ✅
- [x] 3.A.3 세션 길이 3/5/8장면 ✅

### 3.B 자동 힌트
- [x] 3.B.1 망설임 감지 → hintLevel 1 (첫 음절 발광, 3초) ✅
- [x] 3.B.2 hintLevel 2 (슬롯 펄스 하이라이트, 6초) ✅

### 3.C 오답 복습
- [x] 3.C.1 종료 화면 오답 리스트 ✅
- [x] 3.C.2 TTS 재생 버튼 ✅

### 3.D 영속화
- [x] 3.D.1 localStorage 설정 저장 ✅

**Exit 게이트**: ✅ 달성 (2026-05-10)

---

## 📚 Phase 4 — 데이터 확장 (M4) ✅ 완료

- [x] 장면 20개, 단어 106개로 확장 (자연 28/동물 22/일상 25/행동 18/감정 13)
- [x] 카테고리 5개 균형 (자연 10장면/동물 3장면/일상 6장면/행동 1장면/감정 1장면)
- [x] 기존 미등록 장면 6개 추가 (sky/winter/classroom/kitchen/actions/emotions)
- [x] 신규 장면 6개 추가 (mountain/river/garden/market/festival/night)
- [x] 계절·이벤트 테마 팩 — 추석 명절 장면 (송편·등불·보름달)
- [x] 장면 수 옵션 10 추가 (SCENE_COUNT_OPTIONS: [3, 5, 8, 10])

**Exit 게이트**: ✅ 달성 (2026-05-10)

---

## 🚧 P2/P3 백로그 (시점 미정)

### P2 후보
- [ ] **수집 도감** — 익힌 단어 카테고리 책장 시각화 (F20)
- [ ] **사용자 단어집 JSON 업로드** (F21 변형)
- [ ] **SRL 스케줄러 통합** — 1단계/4단계와 진척도 동기화 (F26)
- [ ] **카테고리 직접 편집** UI

### P3 (실험)
- [ ] **발음 평가** Web Speech Recognition + Levenshtein
- [ ] **이미지 AI 생성** 일러스트 부족 카테고리 보충
- [ ] **멀티플레이어** WebRTC 방 만들기

---

## 🔄 기술 부채·개선 후보

| 항목 | 우선순위 | 메모 |
|------|---------|------|
| TypeScript 마이그레이션 | Medium | state 모델이 커지면 (TRD §2.3) |
| Vitest 유닛 테스트 | Medium | `checkSlot`, `buildDock`, `hitTest` 우선 |
| Playwright E2E | Low | 핵심 시나리오 3개 |
| Vite 도입 | Low | 번들·미니파이 필요할 때만 |
| i18n | Low | 영어 UI 지원 시 |
| React/Lit 마이그레이션 | Low | 화면이 5개 이상 늘어나면 |

---

## 🎯 브랜치 전략 (제안)

```
main                  # 배포 가능한 안정 버전
└── dev               # 통합 개발 브랜치
    ├── feat/skeleton            # Phase 1
    ├── feat/dnd                 # Phase 2.A
    ├── feat/tts                 # Phase 2.C
    ├── feat/settings-and-hint   # Phase 3
    └── refactor/shared-dnd      # Phase 6
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `data:` (단어/장면 추가 전용)

---

## 📝 릴리즈 노트

### v0.1.0 (2026-04-29 — Phase 0+1 완료)
- Walking Skeleton: 8장면, 탭 입력, 정답 검증, 종료 화면(점수·스티커·격려)
- 모바일 viewport 100dvh 고정

### v0.1.1 ~ v0.1.5 (2026-04-29 ~ 2026-05-04)
- 음절 도크 3줄 기본 높이 확장
- 게임 중 홈 버튼 추가
- Android 호환 이모지 교체
- TTS 정답 발화 + 장면 단어 탭 재발화 활성화
- 장면 실사 배경 이미지(Unsplash) + 가독성 오버레이 적용
- 슬롯 탭으로 음절 취소 기능 추가

### v0.2.0 (2026-05-05 — Phase 2 코드 완성)
- 드래그 입력(`dnd.js`) — Pointer Events + AbortController ✅
- 정답 사운드(`sound.js`) — Web Audio API C5→E5→G5 아르페지오 / G3→D3 하강 ✅
- playground 장면 단어 보강 (그네·시소·모래, 총 5개) ✅
- 슬롯 탭으로 음절 취소 ✅
- 장면 배경 이미지(picsum.photos) + 가독성 오버레이 ✅

### v0.2.1 ~ v0.2.4 (2026-05-06 — TTS·사운드 품질 개선)
- 마지막 음절 TTS → 정답/오답사운드 → 전체 단어 TTS 순서 보장 (`speakThen` 구현)
- `AudioContext` 음절 탭/드롭 시점 사전 초기화 (`initAudio`) — TTS 콜백 내 사운드 재생 보장
- `speakThen` onerror + 100ms fallback — Chrome/Android `onend` 미발화 버그 대응
- `tone()` async resume 지원 — suspended 컨텍스트에서도 안전하게 스케줄

### v0.3.0 (2026-05-06 — Phase 3 완료)
- 설정 화면 (1_chosung 스타일 레이아웃 + 레벨 버튼)
- 난이도 4단: 🌱레벨1(디코이2) / 🌿레벨2(디코이3) / 🌳레벨3(디코이4) / 🔥레벨4(커스텀)
- 자동 힌트: 3초 → 첫 음절 발광(hintLevel 1), 6초 → 슬롯 펄스(hintLevel 2)
- 오답 복습: 종료화면 틀린 단어 리스트 + TTS 재생
- localStorage 설정 영속화 (카테고리·난이도·장면수·커스텀 디코이)

### v0.3.1 (2026-05-10 — 버그 수정 + 설정 화면 완성)
- 설정 화면에 난이도 선택 추가 (3.A.2 설정 화면 내 완성)
- 홈 화면 레벨 버튼 선택 상태 시각화 (저장된 난이도 반영)
- 진행 표시 버그 수정: "장면 0 / N" → "장면 1 / N"으로 시작
- 홈 복귀 시 선택 난이도 자동 갱신 (`goHome()` 통합)

### v0.4.0 (2026-05-10 — Phase 4 완료)
- 장면 8개 → 20개 확장 (자연 9/동물 3/일상 6/행동 1/감정 1)
- 단어 53개 → 106개 확장 (자연 28/동물 22/일상 25/행동 18/감정 13)
- 기존 미등록 장면 6개 추가: sky·winter·classroom·kitchen·actions·emotions
- 신규 장면 6개: mountain·river·garden·market·festival·night
- 추석 명절 테마팩: 송편·등불·보름달
- 장면 수 선택 옵션에 10 추가 (최대 10장면 세션)

### v0.4.1 (2026-05-10 — 모바일 TTS 음절 누락 수정)
- 모바일 Chrome에서 마지막 음절 TTS 발화 누락 버그 수정
- 원인: `speakThen` fallback `setTimeout(fire, 100)`이 너무 짧아 모바일에서 발화 시작 전에 callback 실행됨
- 수정: fallback을 글자수 비례(`text.length * 400 + 200`)로 변경, `onstart` 시 추가 연장
- 추가: `cancel()` 직후 `speak()` race condition 회피 (30ms 지연)

### v1.0.0 (예정 — Phase 5)
- 장면 20개, PWA, 부모 대시보드, 다크 모드

---

## 🔗 참고 문서

- `../AGENTS.md` — 게임 단계 정의 (PRD 원본)
- `../../AGENTS.md` — 7단계 로드맵 + 모바일 우선 원칙
- `../../1_chosung_quiz/docs/` — 패턴 레퍼런스 (PRD/TRD/PLAN 형식)
- `../../1_chosung_quiz/src/data/words.js` — 단어 스키마 출발점
- `../../1_chosung_quiz/src/js/tts.js` — TTS 패턴 재사용 원본

---

## 디자인 일관성 체크리스트 (홈·설정·완료 화면)

시작·설정·완료 화면 구현 전·후 아래 항목을 확인한다 (기준: `1_chosung_quiz`).

- [x] 제목에 `font-family: 'Jua', sans-serif` 적용
- [x] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [x] `tokens.css` CSS 변수 팔레트 — 1단계 기준 색상·배경·간격 동일 적용
- [x] 큰 라운드 버튼 스타일 (`1_chosung_quiz/src/css/components.css` 참조)
- [x] 배경 색상 `--color-bg` 동일 사용
- [x] 게임 완료 화면(end-screen)에도 동일 폰트·색상·버튼 스타일 적용
- [ ] 1단계 홈·설정·완료 화면과 나란히 놓고 시각적 통일감 육안 확인

<!-- MANUAL: -->
