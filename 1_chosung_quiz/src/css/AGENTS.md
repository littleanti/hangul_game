<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-06-12 -->

# src/css

## Purpose
앱 전체 스타일시트. 4개 레이어로 분리되어 `index.html`에서 순서대로 로드된다.

## Key Files

| File | Description |
|------|-------------|
| `tokens.css` | 디자인 토큰. 모든 색상(`--coral`, `--mint` 등), 간격, 폰트 크기를 CSS 변수로 정의 |
| `base.css` | reset, body, `*`, 공통 레이아웃 기반 스타일 |
| `components.css` | chip, button, toggle, card 등 재사용 컴포넌트 스타일 |
| `screens.css` | start-screen, settings-screen, play-screen, end-screen 각 화면별 스타일 |

## CSS Layer Load Order

```
index.html 로드 순서:
1. tokens.css   ← 변수 정의
2. base.css     ← 변수 사용 시작
3. components.css
4. screens.css
```

## For AI Agents

### Working In This Directory
- **색상은 반드시 `tokens.css`의 CSS 변수 사용** — 하드코딩 금지.
- 새 컴포넌트 추가 시 `components.css`에, 특정 화면 전용 스타일은 `screens.css`에.
- `tokens.css`에 새 변수 추가 시 적절한 네이밍 컨벤션 유지 (`--색상명`, `--색상명-dark`).

### Common Patterns
- 화면 전환: `.screen` 클래스에 `.active`가 추가되면 표시, 제거되면 숨김
- 타이머 배지: `.warn` / `.danger` 클래스로 색상 변화

### Series Design Reference (시리즈 UI 기준)
`tokens.css` 와 `components.css` 는 1 ~ 6단계 시리즈 전체의 **시작·설정·완료 화면 UI 기준**이다.  
형제 게임들이 이 게임의 디자인을 따르므로, 색상 팔레트·버튼 스타일·CSS 변수명을 변경할 때는 시리즈 전체 영향을 반드시 고려할 것.

<!-- MANUAL: -->
