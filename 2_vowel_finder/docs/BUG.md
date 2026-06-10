# BUG — 모음 찾기

## M1 — 데이터 레이어

### [minor] sw.js 404 콘솔 에러 1건 — '콘솔 에러 0건' 기준 미충족

- **증상**: http://localhost:4328 접속 직후 콘솔에 `[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) @ http://localhost:4328/sw.js` 1건 기록. M1 검증 기준(페이지 로드 시 콘솔 에러 0건) 미충족.
- **원인**: `index.html`의 SW 등록 가드 스크립트가 `fetch('./sw.js', {method:'HEAD'})`로 존재 여부를 확인하는데, sw.js는 PLAN.md상 M4 산출물이라 아직 없어 서버가 404를 반환하고 브라우저가 이를 네트워크 에러로 콘솔에 기록함. JS 로직 자체는 `res.ok` 분기로 안전 처리되어 기능 영향은 없음(SW 미등록, 캐시 없음).
- **해결**: **해결됨** — index.html에서 SW 등록 스크립트를 제거(주석 처리)하고 M4에서 sw.js 작성과 함께 단순 register 방식으로 복원하도록 주석 표기.

### [minor] 첫 접속 시 favicon.ico 404 콘솔 에러 1건

- **증상**: 새 브라우저 프로필(캐시 비운 상태)로 http://localhost:4328 첫 접속 시 콘솔에 `Failed to load resource: the server responded with a status of 404 (Not Found) @ http://localhost:4328/favicon.ico` 에러 1건. 같은 세션 재로드 시 브라우저가 404 결과를 캐시해 재발하지 않음. M1 검증 기준(접속 시 콘솔 에러 0건) 미충족.
- **원인**: index.html에 `<link rel="icon">` 선언이 없어 브라우저가 `/favicon.ico`를 자동 요청하나 파일이 없음(icons/는 PLAN.md M4 산출물).
- **해결**: **해결됨** — index.html `<head>`에 인라인 SVG data-URI favicon(🔍 이모지) 1줄 추가로 `/favicon.ico` 자동 요청을 차단. M4 아이콘 제작 시 실제 아이콘 파일로 교체 예정(주석 표기).

## 콘텐츠 — 모음 분류 오류

### [major] 세로/가로 모음 분류가 한글 교육 기준과 정반대로 잘못 정의됨

- **증상**: Level 1(형태 분류)에서 ㅗ ㅛ ㅜ ㅠ ㅡ를 "세로 모음" 통에, ㅣ를 "가로 모음" 통에 넣어야 정답으로 처리됨(세로형 9개 / 가로형 1개). 한글 교육 기준과 정반대라 아동이 잘못된 분류 개념을 학습하게 됨. PRD §4.1 G2·§7.1·§7.3, TRD §3.1 VOWELS, PLAN.md R2, `src/data/vowels.js`, `index.html` 통 예시 모음이 모두 동일하게 오기재.
- **원인**: 기획 단계에서 분류 기준 출처를 확정하지 않은 채(PLAN.md R2 "미결") 글자의 시각적 인상만으로 shape를 잠정 부여 — ㅗ/ㅜ의 짧은 세로획, ㅡ의 가로선만 보고 분류함. 올바른 기준은 **기본 획 방향 + 자음 결합 위치**: 기본 획이 세로(ㅣ)로 뻗어 자음 **오른쪽**에 결합하면 세로모음(ㅏ ㅑ ㅓ ㅕ ㅣ — 예: 가, 너, 디), 기본 획이 가로(ㅡ)로 뻗어 자음 **아래쪽**에 결합하면 가로모음(ㅗ ㅛ ㅜ ㅠ ㅡ — 예: 고, 누, 므).
- **해결**: **해결됨** — ① `src/data/vowels.js` VOWELS shape 필드 정정(ㅏ ㅑ ㅓ ㅕ ㅣ=vertical / ㅗ ㅛ ㅜ ㅠ ㅡ=horizontal, 기준 주석 추가). ② `index.html` 통 예시 모음 교체(세로 통 "ㅏ ㅓ ㅣ" / 가로 통 "ㅗ ㅜ ㅡ") 및 aria-label에 자음 결합 위치 힌트 추가("세로 모음 통 — 자음 오른쪽에 와요" / "가로 모음 통 — 자음 아래에 와요"). ③ PRD §2.1·§4.1 G2·§7.1 표·§7.3 재작성, 오픈 이슈 해결 표시. ④ TRD §3.1 예시 코드·§7.3 aria-label 정정. ⑤ PLAN.md R2 해결됨 갱신. 정오답 판정 로직(`level1.js` judge)은 `v.shape` 데이터 주도라 코드 변경 불필요 — 데이터 정정만으로 정상 동작.
