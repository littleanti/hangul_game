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
