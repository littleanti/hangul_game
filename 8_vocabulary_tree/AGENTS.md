<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# 5_vocabulary_tree — 어휘력 세계수 게임

## Purpose
하나의 기초 한자(형태소)를 뿌리로 두고, 그로부터 파생되는 다수의 교과 어휘를 가지처럼 뻗어 나가게 하는 게임. "한 글자를 알면 열 단어를 깨친다"는 한자어의 파생 원리를 시뮬레이션 메커니즘으로 체득시키며, 모르는 어휘의 뜻을 **유추**하는 능력을 길러낸다.

## Target & Cognitive Goal

| 항목 | 내용 |
|------|------|
| 대상 연령 | 초등 3 ~ 4학년 (확장: 5 ~ 6학년) |
| 발달 단계 | 형태소 기반 어휘 파생 + 유추 능력 형성 |
| 핵심 인지 목표 | 1자 → N어휘 파생, 학술 어휘(이등변삼각형, 용액 등) 분해 능력 |
| 선행 게임 | `../4_morpheme_detective/` — 형태소 인식 보유 |
| 후행 게임 | `../6_literacy_decoder/` — 문맥 속 미지 어휘 추론 |

## Game Mechanics

### 핵심 루프 (나무 시뮬레이션)
1. 화면 중앙에 뿌리 한자가 새겨진 묘목 등장 (예: '水(물 수)')
2. 화면을 떠다니는 음절 블록 중 알맞은 것을 끌어와 가지에 붙임
3. 정답 조합 시 가지가 자라며 새 어휘 잎이 생성 ('수영', '생수', '약수', '수돗물')
4. 어휘 잎 클릭 시 의미 + 예문 + TTS 발화
5. 일정 어휘 수 도달 시 나무가 다음 단계로 성장 (묘목 → 청년목 → 거목 → 세계수)

### 커리큘럼 구조 (1일 1자 4어휘)
하루 학습 분량을 한 한자 + 4개의 파생 어휘로 한정하여 인지 과부하 방지.

| 학년군 | 한자 수준 | 일일 분량 | 누적 어휘 목표 |
|-------|----------|----------|--------------|
| 초3 ~ 초4 | 8급 ~ 6급 (약 200자) | 1자 + 4어휘 | 약 800 어휘 |
| 초5 ~ 초6 | 5급 ~ 준4급 (약 300자 추가) | 1자 + 5 ~ 6어휘 | 약 2000 어휘 |

### 학술 어휘 분해 미션 (심화)
교과서에서 마주치는 학술 어휘를 형태소 단위로 분해하는 보스 스테이지:
- `이등변삼각형` → `異(다를 이)는 아니지만, 二(두 이) + 等(같을 등) + 邊(변 변) + 三(석 삼) + 角(뿔 각) + 形(모양 형)`
- `용액` → `溶(녹을 용) + 液(진 액)` — "녹아있는 액체"

### 간격 반복 학습 (SRL) 통합
- 정답: 다음 노출 간격 1.5배 ↑
- 오답: 노출 간격 0.5배 ↓ + 미니 퀴즈 즉시 등장
- 에빙하우스 망각 곡선 기반 (1일, 3일, 7일, 14일, 30일 리마인드)

## Mobile-First Considerations

| 항목 | 권장 사양 |
|------|----------|
| 화면 모드 | **세로(Portrait) 권장** — 나무는 수직 성장 |
| 어휘 잎 터치 타겟 | 최소 **44×44dp** |
| 권장 세션 길이 | 모바일 1세션 = 10 ~ 15분 (1일 1자 커리큘럼과 일치) |

### 무한 확장 나무의 모바일 처리
- **Viewport 카메라**: 나무 전체를 볼 수 있는 핀치-투-줌 + 팬 (자체 transform 매트릭스)
- **포커스 모드**: 현재 학습 중인 가지를 자동 화면 중앙 정렬 (`scrollIntoView` 또는 transform 보간)
- **미니맵**: 우측 상단에 나무 전체 thumbnail — 탭 시 해당 위치 점프
- **레벨별 culling**: 현재 보이는 가지만 DOM에 렌더, 나머지는 가상화 (Canvas 또는 IntersectionObserver)

### 입력 인터랙션
- 음절 블록을 가지에 정확히 붙이는 정밀 작업 → 모바일은 **자성 스냅 + 시각적 가이드라인**
- 가지 hit zone은 시각 영역보다 1.5배 넓게 (touch fuzziness 보정)
- **드래그 vs 탭 양립**: 블록 탭 → 활성화된 가지 후보 하이라이트 → 가지 탭 → 결합

### 성능 / 데이터
- IndexedDB(또는 Dexie)로 누적 학습 데이터 저장 — localStorage 5MB 한도 초과 위험
- 네트워크 의존 최소화 — 첫 로드 후 PWA 오프라인 캐시 (Service Worker)
- 어휘 DB는 한자 단위로 lazy-load (전체 JSON 한 번에 로드 금지)

### 학습 흐름
- 세션 시작 시 **알림 권한** 요청 — SRL 리마인더 push (오늘의 한자, 복습 시각)
- 백그라운드 복귀 시 진척도 자동 저장 (`visibilitychange` 이벤트)

## For AI Agents

### Working In This Directory
- 미구현 설계 단계
- 권장 스택: Vanilla JS + CSS + Canvas/SVG (나무 시각화), 포트 **4325**
- IndexedDB로 SRL 스케줄 영속화 (학습 데이터가 누적됨, localStorage 한도 위험)

### Implementation Priorities
1. **한자-어휘 파생 DB** — 한자 ID → 파생 어휘 배열 + 의미 + 예문 + 학년 태그
2. **나무 성장 시각화** — 어휘 수에 따라 가지 분기, 자연스러운 성장 애니메이션
3. **SRL 스케줄러** — 어휘별 다음 노출 시각 계산 + 큐 관리
4. **드래그 앤 드롭** — 음절 블록을 가지에 정확히 붙이는 인터랙션
5. **학습 대시보드** — 누적 어휘 수, 한자 수, 정답률 시각화 (학부모용)
6. **Viewport 카메라 컴포넌트** — 핀치줌·팬·미니맵 통합

### Key Behaviors to Preserve
- **하루 학습량은 시스템이 강제 제한** — 더 하고 싶어도 다음 날까지 대기 (과학습 방지)
- 어휘 의미는 항상 **이미 아는 어휘로 재구성** (예: '약수'는 '약처럼 몸에 좋은 물')
- 추상 어휘 진입 전 반드시 구체 어휘로 한자 의미 정착시킴

### Testing Requirements
- 1주일 이상 누적 사용 시 SRL 스케줄이 적절히 작동하는지 검증
- 학습 대시보드 데이터 정확성 검증 (Telemetry)
- 핀치-투-줌 / 팬이 iOS Safari, 안드로이드 Chrome에서 모두 작동하는지 검증

## Dependencies (Planned)

### External
- IndexedDB 래퍼 (Dexie.js 등) — 누적 학습 데이터
- (선택) D3.js 또는 자체 Canvas — 나무/네트워크 시각화
- Service Worker — PWA 오프라인 캐시

### Data
- 한자 마스터 DB: 8급 ~ 준4급 약 500자
- 한자-어휘 파생 DB: 한자당 4 ~ 8 어휘 + 학년군 태그
- 학술 어휘 분해 DB: 초등 교과서 핵심 한자어

## Design Consistency (홈·설정·완료 화면)

시작 화면(`splash`/`today` 진입 전), 설정 화면, 일일 완료 화면(`lock-screen`)은 `1_chosung_quiz`의 디자인 시스템을 계승한다.

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

> 나무 성장 화면·학부모 대시보드 등 게임 고유 화면은 이 게임 특성에 맞게 확장 가능.  
> 상세 스펙: `docs/TRD.md §10` 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.

## Theoretical Reference
- 보고서 §"제4단계: 어휘력 세계수 게임" 참조
- 한자어의 형태소적 파생 원리 + 에빙하우스 망각 곡선
- 초등 교과서 어휘 70%+ 한자어 — 형태소 분해가 학습 결손 방지의 핵심

<!-- MANUAL: -->
