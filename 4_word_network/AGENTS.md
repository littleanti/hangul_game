<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-05-05 -->

# 3_word_network — 순우리말 어휘망 연결 게임

## Status
**구현 완료** — Vanilla JS + CSS, 빌드 단계 없음. 포트 **4323**.

## Purpose
음절 단위 읽기가 가능해진 학습자에게 친숙한 고유어(순우리말) 어휘를 맥락 그림과 함께 제시하여, 음절들을 수평적으로 연결해 의미 있는 단어를 생성하는 능력을 기른다. 추상적 한자어로 진입하기 전, 일상 어휘 기반의 '읽기 자동화'를 완성하는 단계.

## Target & Cognitive Goal

| 항목 | 내용 |
|------|------|
| 대상 연령 | 만 5 ~ 7세 (유아 후기 ~ 초등 1학년) |
| 발달 단계 | 어휘 확장 + 수평적 읽기 |
| 핵심 인지 목표 | 시각적 맥락 ↔ 어휘 매칭, 음절 시퀀스 조립, 체언 우세 어휘 발달 |
| 선행 게임 | `../2_syllable_assembly/` — 음절 조립 능력 보유 |
| 후행 게임 | `../4_morpheme_detective/` — 단어 속 의미 단위 인지로 진입 |

## Key Files

| File | Description |
|------|-------------|
| `index.html` | 앱 진입점 — start/play/end 화면 포함 |
| `package.json` | `npm run dev` → npx serve . -l 4323 |

### Key JS Modules (`src/js/`)

| Module | 역할 |
|--------|------|
| `config.js` | 순수 상수 |
| `utils.js` | 범용 유틸 (`vibrate` 햅틱 피드백 포함) |
| `state.js` | 전역 상태 (`settings`, `game` — scenes, currentIdx, targetWordIdx, dock, slots) |
| `storage.js` | localStorage 영속화 (`loadSettings` / `saveSettings`) |
| `tts.js` | Web Speech API TTS 래퍼 (ko-KR) |
| `sound.js` | Web Audio API 정답/오답 효과음 (오실레이터 기반) |
| `ui.js` | 화면 전환 (`showScreen`), 플래시 메시지 (`showFlash`), 진척도/점수 업데이트 |
| `syllable-dock.js` | 음절 블록 도크 — `buildDock`, `renderDock`, `markUsed`, `unmarkUsed` |
| `slot.js` | 정답 슬롯 — `renderSlots`, `fillNextSlot`, `fillSlotAt`, `checkSlots`, `lockSlots`, `clearSlotsFrom`, `markSlotsWrong`, `celebrateSlots`, `shakeSlots` |
| `scene.js` | 장면 렌더링 — `renderScene`, `markWordMatched` |
| `dnd.js` | Pointer Events API 기반 드래그 앤 드롭 (`initDrag`, AbortController로 정리) |
| `game.js` | 게임 로직 — `pickScenes`, `startGame`, 단어 흐름 제어 |
| `main.js` | 진입점 — `DOMContentLoaded` 에서 `initApp()`, 버튼 이벤트 바인딩 |

### Key Data Files (`src/data/`)

| File | 역할 |
|------|------|
| `scenes.js` | `SCENES` 배열 — 장면 메타데이터 (id, category, 일러스트 정보) |
| `words.js` | `WORDS_BY_SCENE` — 장면 ID → 단어 배열 매핑 |

## Architecture

### Game Flow
```
main.js → initApp()
  └─ game.js: startGame()
       └─ pickScenes()   — settings.categories 기반 장면 필터링 + 셔플
       └─ renderScene()  — 장면 일러스트 + 탭 가능 객체 렌더링
       └─ buildDock()    — 현재 단어의 음절 블록 + 오답 블록 생성
       └─ renderSlots()  — 정답 슬롯 렌더링
       └─ initDrag()     — 드래그 앤 드롭 초기화 (AbortController)
            └─ onDrop()  → fillSlotAt() → checkSlots()
                 ├─ 정답: celebrateSlots() → speak() → playCorrect() → 다음 단어/장면
                 └─ 오답: shakeSlots() → playIncorrect()
```

### State Shape
```js
{
  settings: { categories: Set, sceneCount, difficulty },
  game: {
    scenes: [],          // pickScenes() 결과
    currentIdx,          // 현재 장면 인덱스
    targetWordIdx,       // 현재 장면 내 단어 인덱스
    dock: [],            // 음절 블록 배열 { id, syllable, used }
    slots: [],           // 정답 슬롯 배열
  }
}
```

## Game Mechanics

### 핵심 루프
1. 장면 일러스트 제시 (카테고리 필터링 + 셔플)
2. 하단 음절 도크에서 블록을 탭하거나 정답 슬롯으로 드래그
3. 슬롯이 채워지면 자동 검증 — 정답 시 `celebrateSlots` + TTS + 효과음
4. 장면 내 모든 단어 완성 → 다음 장면으로 진행
5. 모든 장면 완성 → end 화면

### 어휘 카테고리 (고유어 우선)
| 카테고리 | 예시 단어 |
|---------|----------|
| 자연 | 하늘, 바람, 구름, 나무, 별빛 |
| 동물 | 강아지, 고양이, 토끼, 다람쥐 |
| 일상 사물 | 우산, 신발, 가방, 우유 |
| 행동 | 달리다, 먹다, 자다, 웃다 |
| 감정 (체언) | 기쁨, 슬픔, 무서움 |

## Mobile-First Considerations

| 항목 | 권장 사양 |
|------|----------|
| 최소 터치 타겟 | **56×56dp** (음절 블록) |
| 화면 모드 | **세로(Portrait) 우선** — 일러스트 + 블록 도크 수직 레이아웃 |
| 햅틱 피드백 | `navigator.vibrate(20)` — 안드로이드만, iOS Safari 무시됨 |
| TTS 발화 | 사용자 탭 직후에만 트리거 (자동재생 정책 회피) |

## For AI Agents

### Working In This Directory
- 런타임 npm 의존성 없음. `package.json`은 dev 서버 스크립트만 보유.
- ES Modules 사용 — 브라우저가 직접 import. `file://`로 열면 CORS 오류 발생하므로 반드시 dev 서버 사용.
- 드래그 앤 드롭은 `dnd.js`의 `initDrag()` 사용 — Pointer Events API 기반, `AbortController`로 이전 게임 리스너 정리.
- 단어 데이터 추가: `src/data/words.js`의 `WORDS_BY_SCENE` 수정.
- 장면 추가: `src/data/scenes.js`의 `SCENES` 배열에 메타데이터 추가.
- 설정 화면은 현재 "준비 중" 상태 — `showFlash`로 안내 메시지만 표시.

### Key Behaviors to Preserve
- 드래그 컨트롤러는 `startGame()` 호출 시 이전 것을 `_dragController.abort()`로 항상 정리
- `fillSlotAt` 호출 후 즉시 `checkSlots` — 부분 채움 상태에서 즉각 검증하지 않음 (마지막 슬롯 채움 시점에 검증)
- 햅틱(`vibrate`) + TTS + 효과음 세 가지를 정답 시 함께 실행

### Testing Requirements
- `npm run dev` 실행 후 http://localhost:4323 에서 수동 테스트
- 드래그 앤 드롭: 음절 블록 → 정답 슬롯 드래그 확인 (데스크탑 + 모바일)
- 탭 방식: 음절 블록 탭 → 자동 슬롯 배치 확인
- 장면 전환: 모든 단어 완성 후 다음 장면으로 이동 확인
- 자동화 테스트 없음 — 수동 체크리스트로 검증

## Dependencies

### External
- `npx serve` — 정적 파일 서버
- Web Speech API — TTS (ko-KR)

## Design Consistency (홈·설정·완료 화면)

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 게임 완료 화면(`end-screen`)은 `1_chosung_quiz`의 디자인 시스템을 계승한다.

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

> 플레이 화면(장면 일러스트·음절 도크)은 이 게임 특유의 방식을 사용.  
> 상세 스펙: `docs/TRD.md §12` 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.

## Theoretical Reference
- 보고서 §"제2단계: 순우리말 어휘망 연결 게임" 참조
- 유아기 체언(명사·대명사·수사) 우세 발달 → 동사·형용사 확장 순서

<!-- MANUAL: -->
