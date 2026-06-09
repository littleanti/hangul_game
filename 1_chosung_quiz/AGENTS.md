<!-- Generated: 2026-04-25 | Updated: 2026-05-05 -->

# chosung-quiz

## Purpose
초성 퀴즈 웹 게임. 이모지(또는 사진)를 보고 한글 단어의 초성을 맞히는 교육용 게임으로, 미취학 아동 대상의 한글 학습을 목적으로 한다. Vanilla JS + CSS 기반, 빌드 도구 없음.

## Key Files

| File | Description |
|------|-------------|
| `index.html` | 앱 전체 HTML — 4개 화면(start/settings/play/end)이 단일 파일에 존재 |
| `package.json` | dev 서버 스크립트만 정의 (`npm run dev` → npx serve :4321) |
| `favicon.svg` | SVG 파비콘 |
| `CLAUDE.md` | Claude Code용 프로젝트 가이드 (아키텍처, 명령어, 구현 노트) |
| `README.md` | 프로젝트 소개 |

### Key JS Modules (`src/js/`)

| Module | 역할 |
|--------|------|
| `config.js` | 순수 상수 (DEFAULT_SETTINGS, STORAGE_KEY 등) |
| `words.js` | 단어 데이터 + CATEGORIES (순수 데이터, import 없음) |
| `utils.js` | chosung 추출 등 범용 유틸 |
| `state.js` | 단일 전역 state 싱글톤 |
| `storage.js` | localStorage 영속화 (`loadSettings` / `saveSettings`) |
| `tts.js` | Web Speech API TTS 래퍼 |
| `timer.js` | setInterval 기반 카운트다운 타이머 |
| `sound.js` | Web Audio API 정답/오답 효과음 (오실레이터, 외부 파일 불필요) |
| `profiles.js` | 사용자 프로필 관리 — 최대 8개, `chosung-quiz-profiles-v1` 키 |
| `profile-ui.js` | 프로필 선택·생성 UI 렌더링 |
| `ui.js` | 화면 전환 (`goTo`), TTS/타이머 정지 통합 |
| `settings.js` | 설정 화면 로직 (`filterWords` 포함) |
| `game.js` | 게임 루프 — 문제 생성, 채점, 타임아웃 처리 |
| `main.js` | 진입점 — 모든 모듈 import + `window` 노출 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | 소스코드 전체 (see `src/AGENTS.md`) |
| `docs/` | 기획/설계 문서 (see `docs/AGENTS.md`) |

## Screen State Machine

```
start ──→ play ──→ end
  │        ↑        │
  ↓        │        ↓
settings ──┘    (replay/settings)
```

모든 화면 전환은 `src/js/ui.js`의 `goTo(screenName)`를 통해 이루어지며, 전환 시 항상 타이머 정지 + TTS 중단 처리가 포함된다.

## For AI Agents

### Working In This Directory
- 런타임 npm 의존성 없음. `package.json`은 dev 서버 스크립트만 보유.
- HTML `onclick="..."` 패턴 사용 — JS에서 이벤트 리스너를 직접 붙이지 않음. 새 버튼 추가 시 `main.js`에서 `window.함수명 = 함수명` 노출 필요.
- ES Modules 사용 — 브라우저가 직접 import. `file://`로 열면 CORS 오류 발생하므로 반드시 dev 서버 사용.

### Testing Requirements
- `npm run dev` 실행 후 http://localhost:4321 에서 수동 테스트
- 자동화 테스트 없음 (docs/TRD.md §8 수동 체크리스트 참조)

### Common Patterns
- 단일 전역 state 객체 (`src/js/state.js`)
- localStorage 영속화는 `src/js/storage.js`에서만 처리
- 단어 데이터 추가/수정은 `src/data/words.js` 에서만

## Design Reference — 시리즈 공통 UI 기준

본 게임의 홈 화면·설정 화면·게임 완료 화면 디자인은 **7단계 시리즈 전체의 UI 디자인 기준**이다.  
2 ~ 6단계 게임의 시작·설정·완료 화면은 아래 파일과 수치를 그대로 사용해야 한다.

| 파일 | 역할 |
|------|------|
| `src/css/tokens.css` | CSS 변수 팔레트 (`--coral #FF7757`, `--navy #2D3047`, `--cream #FFF6E4` 등) |
| `src/css/components.css` | 버튼·카드·모달 등 공통 컴포넌트 스타일 (`.btn`, `.btn.big`, `.btn.small`) |
| `src/css/screens.css` | 화면별 스타일 (`.start-screen h1`, `.settings-header h2`, `.end-screen h2`) |
| `index.html` `<link>` | Google Fonts `Jua`(제목), `Gowun Dodum`(설명·본문) 로드 패턴 |

**핵심 수치 (형제 게임 준수 필수)**:

| 요소 | 규격 |
|------|------|
| 시작 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 | `font-family: 'Jua', sans-serif; font-size: 2.1rem; color: var(--coral)` |
| 설명·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 버튼 기본 | `font-family: 'Jua', sans-serif; font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |

> 상세 스펙: `docs/TRD.md §10 홈·설정·완료 화면 디자인 시스템` 및 `docs/PLAN.md ##디자인 기준` 참조.

## Dependencies

### External
- `npx serve` — 로컬 정적 파일 서버 (devDependency, 설치 불필요)

<!-- MANUAL: -->
