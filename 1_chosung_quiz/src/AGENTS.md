<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# src

## Purpose
앱의 모든 소스 자산이 들어있는 디렉토리. JavaScript 모듈, CSS 레이어, 단어 데이터, 이미지 파일로 구성된다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `js/` | 게임 로직, UI, 상태, 유틸 등 모든 JS 모듈 (see `js/AGENTS.md`) |
| `css/` | 토큰 → 베이스 → 컴포넌트 → 화면 순서의 CSS 레이어 (see `css/AGENTS.md`) |
| `data/` | 단어 데이터베이스 (see `data/AGENTS.md`) |
| `images/` | 사진 모드용 로컬 과일 이미지 (see `images/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 단어 추가는 `data/words.js`만 수정.
- 스타일 변경은 CSS 레이어 순서를 지킬 것 (`tokens.css` → `base.css` → `components.css` → `screens.css`).
- 새 JS 모듈 추가 시 `js/main.js`에서 import 및 `window` 노출 필요.

<!-- MANUAL: -->
