# BUG — 합성어 쪼개기 (5_compound_split)

## M0

- **M0-1** (minor)
  - 증상: 320px 최소 지원 너비에서 시작 화면 제목 "합성어 쪼개기"가 단어 중간에서 줄바꿈되어 "합성어 쪼개" / "기" 두 줄로 표시됨. 문해력 학습 게임 제목이 어절 중간에서 쪼개져 보임. (가로 오버플로·버튼 깨짐은 없음)
  - 재현 절차: ① http://localhost:4329/ 접속 ② 브라우저 뷰포트를 320×680으로 리사이즈 ③ 시작 화면 제목 확인 — "쪼개기"가 "쪼개"+"기"로 분리되어 렌더링됨
  - 원인 추정: 시작 화면 h1(Jua 3rem, letter-spacing 2px)의 텍스트 폭이 320px 컨테이너(패딩 제외 약 256px)를 초과하는데 `word-break: keep-all`이 없어 한글 기본 줄바꿈 규칙(음절 단위)으로 단어 중간에서 꺾임. 정본 1_chosung_quiz는 `.word-display`에만 `keep-all`을 적용하며 제목은 4자라 노출되지 않던 문제. 본 게임 `src/css/screens.css` 시작 화면 제목에 `word-break: keep-all` 추가 시 "합성어" / "쪼개기" 어절 단위 줄바꿈으로 해소 가능.
  - [원인] 확정: `src/css/screens.css`의 `.start-screen h1`에 `word-break: keep-all`이 없어, 제목 텍스트 폭(약 223px + letter-spacing 2px, Jua 3rem)이 320px 뷰포트의 콘텐츠 폭을 초과할 때 CJK 기본 줄바꿈 규칙(음절 단위)에 따라 "쪼개기" 단어 중간에서 줄이 꺾임. 정본(1_chosung_quiz) 복제 시 `.word-display`에만 있던 keep-all이 제목에는 없었던 것이 근본 원인.
  - [수정 내용] `src/css/screens.css` `.start-screen h1` 규칙에 `word-break: keep-all;` 1줄 추가. 검증: Playwright로 http://localhost:4329/ 접속 → 뷰포트 320×680 리사이즈(SW 캐시 삭제 후 재로드) → h1이 "합성어" / "쪼개기" 어절 단위 2줄(각 약 124px/126px)로 렌더링됨을 확인. scrollWidth=clientWidth=320으로 가로 오버플로 없음.
  - [재검증] M0 검증 라운드 2(2026-06-10, Playwright): 뷰포트 320×680에서 h1이 "합성어"(124px) / "쪼개기"(126px) 어절 단위 2줄로 렌더링, `word-break: keep-all` 계산값 확인, scrollWidth=clientWidth=320으로 가로 오버플로 없음. 수정 확인 완료.
  - 상태: 해결
