# AGENTS.md — 사자성어 받아쓰기 (11_idiom_syllable_typer)

> 에이전트/개발자용 작업 가이드. 설계 근거는 `docs/` 참조.

## 게임 범위

- 시리즈 11번째 브릿지 게임: `10_literacy_decoder` → **S11** → `12_four-character_idiom_crossword`
- S10 보스 사자성어 **10개**(일석이조 ~ 백발백중)를 4×1 슬롯에 한 음절씩 받아쓰는 IME 산출 비계 게임
- 3단 페이딩: Lv.1 음절블록 탭 → Lv.2 초성힌트+자모 조립 → Lv.3 자유 IME (S12 동일 패러다임)
- 신규 어휘 부하 0 정책 — 어휘 DB 는 10개 고정, 확장 금지
- 비목표: 크로스워드 공간 추론, 신규 어휘, 멀티플레이어 (PRD §4.2)

## 기술 스택 / 제약

- Vanilla JS (ES Modules) + Vanilla CSS — **빌드 도구 없음, npm 런타임 의존성 없음**
- 개발 서버: `npm run dev` → `npx -y serve . -l 4332` (**포트 4332**)
- localStorage 접두사: `11ist_` / SW 캐시 키: `11_idiom_syllable_typer-v1`
- PWA: 상대경로 SW 등록(`./sw.js`), manifest `start_url`/`scope` = `./`

## 디자인 시스템

- 원본: `../1_chosung_quiz/src/css/` (tokens / base / components / screens)
- `tokens.css`·`components.css` 는 원본 복사 — **수치 임의 변경 금지**
- S11 고유 토큰은 `tokens.css` 하단 `/* S11 확장 */` 블록에만 추가
- 게임 플레이 고유 스타일은 `src/css/game.css` 에만 작성
- CSS 로드 순서 고정: tokens → base → components → screens → game
- 폰트: Google Fonts `Jua`(제목) + `Gowun Dodum`(본문), 한자는 시스템 CJK fallback

## 화면 구조

`index.html` 의 5개 `.screen` 섹션을 `.active` 클래스 토글로 전환 (1_chosung_quiz 동일 컨벤션):
`#start-screen` / `#settings-screen` / `#leaderboard-screen` / `#end-screen` / `#game-screen`

## 데이터

- `src/data/idioms.js` — S10 `BOSS_IDIOMS`(`../10_literacy_decoder/src/data/idioms.js`) 스키마 호환
  (`word`/`hanja`/`meaning`/`hint`/`contextStory`) + S11 신규 `syllables[]` 필드

## 설계 문서

| 문서 | 내용 |
|---|---|
| [docs/PRD.md](docs/PRD.md) | 제품 요구사항 — 학습 갭, 게임 루프, 기능 목록 |
| [docs/TRD.md](docs/TRD.md) | 기술 요구사항 — 아키텍처, 스키마, 알고리즘 |
| [docs/PLAN.md](docs/PLAN.md) | 마일스톤 M0~M5 체크리스트 (작업 완료 시 갱신 필수) |

## 작업 규칙

- 작업 완료 시 `docs/PLAN.md` 해당 마일스톤 체크박스 `[x]` 갱신
- 커밋 메시지: `feat:` / `fix:` / `refactor:` / `docs:` / `style:` / `data:`
