<!-- Generated: 2026-04-25 | Updated: 2026-05-05 -->

# hangul_games

## Purpose
유아기 한글 파닉스부터 사자성어 형태 의미론까지, 인지 발달 단계에 따라 촘촘하게 설계된 한글 학습 게임 생태계. 음운론적 해독(Phonological Decoding) → 형태 의미론적 통합(Morpho-semantic Synthesis)으로 이어지는 7단계 로드맵을 구성한다. **모든 게임은 스마트폰·태블릿 우선(Mobile-First)으로 설계된다.**

## Learning Roadmap (Cognitive Progression)

```
[유아 후기]                                                                        [초등 고학년]
1_chosung_quiz ─→ 2_ ─→ 3_ ─→ 4_ ─→ 5_ ─→ 6_ ─→ 7_four-character_idiom_crossword
   (앵커: 시작)                                                            (앵커: 도착)
   초성 단서 인출                                                       비유적 4자성어 해독
```

| # | Directory | 단계 / 인지 목표 | 대상 연령 |
|---|-----------|----------------|----------|
| 1 | `1_chosung_quiz/` | **앵커 1** — 초성 단서 어휘 인출 (음운 인출 자동화) | 유아 ~ 초저학년 |
| 2 | `2_syllable_assembly/` | 자모 결합·파닉스 (공감각적 음절 조립) | 만 4 ~ 6세 |
| 3 | `3_word_network/` | 고유어 어휘 확장 (수평적 읽기) | 만 5 ~ 7세 |
| 4 | `4_morpheme_detective/` | 한자 형태소 인식 (단어 속 뜻글자 발견) | 초1 ~ 초2 |
| 5 | `5_vocabulary_tree/` | 1자 → N어휘 파생 (학술 어휘 분해) | 초3 ~ 초4 |
| 6 | `6_literacy_decoder/` | 문맥 추론 + 형태소 통합 (직독직해) | 초5 ~ 초6 |
| 7 | `7_four-character_idiom_crossword/` | **앵커 2** — 사자성어 비유적 의미 해독 | 초고학년 ~ 중1 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `1_chosung_quiz/` | 초성 퀴즈 (구현 완료, see `1_chosung_quiz/AGENTS.md`) |
| `2_syllable_assembly/` | 음절 조립 게임 (구현 완료, see `2_syllable_assembly/AGENTS.md`) |
| `3_word_network/` | 고유어 어휘망 게임 (구현 완료, see `3_word_network/AGENTS.md`) |
| `4_morpheme_detective/` | 형태소 탐정 게임 (설계 단계, see `4_morpheme_detective/AGENTS.md`) |
| `5_vocabulary_tree/` | 어휘력 세계수 게임 (설계 단계, see `5_vocabulary_tree/AGENTS.md`) |
| `6_literacy_decoder/` | 문해력 해독기 게임 (설계 단계, see `6_literacy_decoder/AGENTS.md`) |
| `7_four-character_idiom_crossword/` | 사자성어 크로스워드 (구현 완료, see `7_four-character_idiom_crossword/AGENTS.md`) |

## Port Allocation (Convention)

| Project | Port |
|---------|------|
| `1_chosung_quiz` | 4321 |
| `2_syllable_assembly` (예약) | 4322 |
| `3_word_network` (예약) | 4323 |
| `4_morpheme_detective` (예약) | 4324 |
| `5_vocabulary_tree` (예약) | 4325 |
| `6_literacy_decoder` (예약) | 4326 |
| `7_four-character_idiom_crossword` | 4327 |

## Mobile-First Design Principles (전 게임 공통)

본 생태계의 모든 게임은 **스마트폰·태블릿 환경**을 1순위 타겟으로 한다. PC 브라우저는 보조 환경.

### 핵심 원칙

| 원칙 | 적용 |
|------|------|
| 터치 우선 | Pointer Events API 사용, 마우스/터치/펜 통합 |
| 큰 터치 타겟 | **최소 44dp**, 유아 대상은 **64dp** 이상 |
| 자동재생 정책 | 첫 사용자 인터랙션 후 AudioContext / TTS 활성화 |
| 뷰포트 안정성 | `100dvh` 사용 (iOS Safari 주소창 변동 대응) |
| 입력 방식 | 한글 IME 회피 — 모든 입력은 **블록 선택/탭** 또는 **드래그** |
| 화면 회전 | 단계별 권장 모드 명시 (게임별 AGENTS.md 참조) |
| 자성 스냅 | 드래그 정밀도 보완 — 정답 영역 ±20dp 자동 흡착 |
| 폰트 로딩 | 한자 폰트는 **서브셋** 임베드, `font-display: swap` |
| 데이터 영속화 | localStorage 5MB 한도 주의 — 누적 학습 데이터는 IndexedDB |
| PWA | 모든 게임 PWA 매니페스트 + Service Worker 권장 (홈 화면 추가, 오프라인) |
| 접근성 | 다크 모드, 폰트 크기 조절, TTS 보조 |

### 단계별 화면 모드 권장

| 단계 | 권장 모드 | 이유 |
|------|----------|------|
| 1_chosung_quiz | 세로 | 단순 카드 인터랙션 |
| 2_syllable_assembly | **가로 잠금** | 2D 자모 배치 영역 확보 |
| 3_word_network | 세로 | 일러스트 + 블록 도크 수직 |
| 4_morpheme_detective | 가로 | 일러스트 풍경감 |
| 5_vocabulary_tree | 세로 | 나무 수직 성장 |
| 6_literacy_decoder | 세로 | 지문 가독성 |
| 7_four-character_idiom_crossword | 세로 | 4×N 격자 + 키패드 |

## Common Patterns Across Projects

- **빌드 단계 없음** — Vanilla JS + CSS, 정적 서버로 즉시 실행
- **공통 컴포넌트 후보** — 드래그 앤 드롭(자성 스냅), 한글 IME, TTS(Web Speech API), 한자 SVG 변형, SRL 스케줄러, Viewport 카메라(핀치줌·팬)
- **데이터 호환** — 단어 DB는 `1_chosung_quiz/src/data/words.js` 형식을 출발점으로 확장 가능
- **localStorage / IndexedDB** — 학습 진척도와 SRL 큐를 단계 간 호환 가능한 스키마로 영속화 권장

## Series UI Design Standard (시리즈 공통 UI 규격)

1 ~ 6단계 모든 게임의 **시작 화면·설정 화면·게임 완료 화면**은 `1_chosung_quiz`의 디자인 시스템을 기준으로 통일한다. 아래 수치는 `1_chosung_quiz/src/css/screens.css` · `components.css`의 실제 값이며, 모든 형제 게임이 **그대로** 사용해야 한다.

### 폰트 규격

| 요소 | 규격 |
|---|---|
| 폰트 로드 | Google Fonts `Jua` + `Gowun Dodum` (`<link>` 태그) |
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·부제목·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 섹션 레이블 (설정) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |

### 버튼 규격

| 요소 | 규격 |
|---|---|
| 버튼 레이블 폰트 | `font-family: 'Jua', sans-serif; letter-spacing: 0.5px` |
| 버튼 기본 (`.btn`) | `font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 기본 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 효과 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |

### 색상·레이아웃

| 요소 | 규격 |
|---|---|
| 색상 변수 출처 | `1_chosung_quiz/src/css/tokens.css` |
| 주요 색상 | `--coral #FF7757` · `--navy #2D3047` · `--cream #FFF6E4` · `--mint #6BCAB8` · `--yellow #FFD166` |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 적용 화면 | `start-screen`, `settings-screen`, `end-screen` (또는 동등 화면) |

> 플레이 화면 등 게임 고유 콘텐츠 화면은 각 게임 특성에 맞게 확장 가능.  
> 상세 스펙: 각 게임 `docs/TRD.md` 디자인 시스템 절 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.

## Cross-Project Architecture (Future)

7단계 게임 생태계가 단절 없이 작동하려면 다음 시스템이 통합되어야 한다:

1. **단일 학습자 프로필 DB** — 모든 게임이 공유하는 학습자 ID + 진척도
2. **간격 반복 학습(SRL) 엔진** — 에빙하우스 망각 곡선 기반 어휘/한자 노출 스케줄
3. **학부모/교사 대시보드** — 단계별 성취도 시각화 (모바일/태블릿 친화)
4. **PWA 통합** — 모든 게임을 한 번 설치하면 홈 화면 런처에서 단계별 진입
5. **(선택) 발음 평가** — Web Speech API + Levenshtein 거리 기반 정밀 정렬

상세 설계는 각 단계별 `AGENTS.md` 의 "Theoretical Reference" 및 "Mobile-First Considerations" 섹션 참조.

## For AI Agents

### Working In This Repository
- **구현 완료** 게임: `1_chosung_quiz`, `2_syllable_assembly`, `3_word_network`, `7_four-character_idiom_crossword`
- **4_ ~ 6_** 디렉토리는 **설계 단계** — 각 AGENTS.md가 PRD 역할
- 새 게임 구현 착수 시: 해당 단계의 AGENTS.md를 PRD/TRD로 분해 → `docs/PRD.md`, `docs/TRD.md`, `docs/PLAN.md` 생성 권장 (`1_chosung_quiz/docs/` 패턴)
- 인접 단계의 AGENTS.md를 함께 읽어 데이터/컴포넌트 호환성 확보
- **모바일/태블릿 실기기 테스트 필수** — Chrome DevTools 에뮬레이터만으로는 부족

### Adding New Stages or Variants
- 본 7단계 사이에 마이크로 단계가 필요하면 `2.5_xxx`, `3.5_xxx` 식의 명명 권장 (정렬 유지)
- 동일 단계 변형은 `2a_`, `2b_` 형식

### Theoretical Foundation
설계 근거: 인지 발달 기반의 한글 학습 로드맵 보고서 (2026-04-25 작성). 본 보고서는 5단계 브릿지 프레임워크의 이론적 토대로, 각 단계의 인지 목표·메커니즘·평가 방식을 규정한다.

## Dependencies

### External (Per Project)
- `npx serve` / `npx http-server` — 정적 파일 서버 (개발용)
- (배포) PWA + Service Worker — 모바일 홈 화면 설치
- (단계별 추가 의존성은 각 AGENTS.md 참조)

<!-- MANUAL: -->
