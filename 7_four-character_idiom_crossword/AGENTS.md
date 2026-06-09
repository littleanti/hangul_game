<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# four-character_idiom_crossword

## Purpose
한국 사자성어(四字成語) 크로스워드 퍼즐 웹 게임. 순수 Vanilla JS + CSS로 구성된 단일 페이지 앱이며, 별도 빌드 없이 정적 파일 서버로 즉시 실행된다. 한글 IME(입력기) 처리가 핵심 난이도로, Samsung Galaxy 키보드의 단일 세션 누적 compositionupdate 방식을 포함한 모바일 가상 키보드 전용 처리 로직이 구현되어 있다.

## Key Files

| File | Description |
|------|-------------|
| `index.html` | 게임 진입점. hidden-input 아키텍처 구조 및 DOM 골격 정의 |
| `app.js` | 게임 핵심 로직. IME 이벤트 처리, 셀 입력/커서 이동, 채점, 힌트/정답 공개 |
| `crossword.js` | 크로스워드 레이아웃 생성 알고리즘. `selectWords`, `generateCrossword` 함수 포함 |
| `data.js` | 사자성어 데이터셋. `SAJASUNGO_DATA` 배열 (word, meaning, hint 구조) |
| `style.css` | 전체 스타일. CSS 변수, 반응형 레이아웃(모바일/태블릿), 셀 상태 애니메이션 |
| `package.json` | `npm start` → `npx http-server . -p 4327 --cors -o` |

## Architecture

### Hidden-Input IME 아키텍처
모든 키보드/IME 이벤트를 단일 `<input id="hidden-input">`으로 수집한다. 셀은 `<div>` + `<span class="cell-char">`으로 표시 전용이며 직접 포커스를 받지 않는다. 이 구조로 한글 IME composition이 셀 전환 시 깨지는 문제를 방지한다.

### Samsung IME 세션 처리
`sessionCommittedCount`로 단일 composition 세션 내 이미 commit된 글자 수를 추적한다. Samsung 키보드는 compositionstart를 한 번만 발화하고 compositionupdate에 누적 data를 보낸다 (예: "기" → "기나" → "기나다").

### 커서 이동
`repositionInput()`: CSS geometry만 변경, IME 세션 유지 (mid-composition 안전)  
`focusHidden()`: 완전 초기화, 사용자 탭/클릭 시에만 호출

## For AI Agents

### Working In This Directory
- 빌드 단계 없음. 파일 수정 후 브라우저 새로고침으로 즉시 확인 가능
- 서버 실행: `npm start` (포트 4327)
- 모바일 테스트 필요 시 같은 Wi-Fi에서 로컬 IP로 접속

### IME 코드 수정 시 주의사항
- `compositionstart / compositionupdate / compositionend` 세 핸들러는 강하게 결합됨. 하나만 수정 시 다른 두 핸들러와의 상호작용 반드시 검토
- `isComposing`, `pendingComposition`, `sessionCommittedCount` 세 플래그의 상태 전이를 함께 추적할 것
- `repositionInput()`은 mid-composition에서 호출 가능하지만 `focusHidden()`은 composition을 리셋하므로 mid-composition에서 호출 금지
- Samsung Galaxy 키보드: compositionupdate else-branch (누적 세션), iOS 기본 키보드: compositionupdate length===1 branch (글자별 세션)

### Testing Requirements
- 데스크탑: Chrome에서 기본 동작 확인
- 모바일: Samsung Galaxy (Chrome) + iOS Safari 양쪽 테스트 권장
- 모바일 로그 수집 필요 시 `log-server.js` 패턴 참고 (이전 디버깅 이력)

### Common Patterns
- 셀 내용 변경: 항상 `setCellChar(r, c, ch)` 사용, span.textContent 직접 수정 금지
- 글자 확정: `commitChar(ch)` — jamo 가드 + state 저장 + display 업데이트 + 커서 이동 일괄 처리
- 셀 좌표 이동: `state.activeRow / state.activeCol` 변경 후 반드시 `refreshHighlights()` 호출
- 크로스워드 데이터: `state.crossword.grid[r][c].char` (정답), `state.userAnswers[r][c]` (사용자 입력)

## Dependencies

### Internal
모든 스크립트는 전역 스코프 공유 (빌드 없음):
- `data.js` → `SAJASUNGO_DATA` 전역 변수
- `crossword.js` → `selectWords`, `generateCrossword` 전역 함수
- `app.js` → 위 두 파일에 의존, IIFE로 자체 스코프 격리

### External
- `http-server` (devDependency, npx로 설치) — 정적 파일 서빙

## Series Context

본 게임은 7단계 시리즈의 앵커 2(최종 단계)로, `1 ~ 6단계` 게임과 달리 자체 `style.css`를 사용한다.  
1 ~ 6단계 게임의 시작·설정·완료 화면은 `1_chosung_quiz` 디자인 시스템(`tokens.css`, `components.css`, `Jua`/`Gowun Dodum` 폰트)을 공통으로 따른다. 본 게임에 인접 단계 디자인 통합이 필요하다면 상위 `../AGENTS.md § Series UI Design Standard` 참조.

<!-- MANUAL: -->
