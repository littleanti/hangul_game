<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# docs

## Purpose
어휘력 세계수 게임의 기획 및 설계 문서. 실제 코드에는 영향을 주지 않으며, 제품 요구사항·기술 설계·개발 계획을 기록한다. 부모 `../AGENTS.md`의 게임 설계 문서를 PRD/TRD/PLAN 3종으로 분해한 결과물이다.

## Key Files

| File | Description |
|------|-------------|
| `PRD.md` | 제품 요구사항 문서 (Product Requirements Document) — 타겟·시나리오·기능·성공 지표 |
| `TRD.md` | 기술 설계 문서 — 스택·아키텍처·알고리즘·테스트. §8에 수동 테스트 체크리스트 |
| `PLAN.md` | 개발 계획 — M0~M7 마일스톤·검증 게이트 |

## For AI Agents

### Working In This Directory
- 코드 변경과 무관하게 문서만 업데이트하는 것은 자유롭게 가능.
- 수동 테스트 체크리스트는 `TRD.md` §8을 기준으로 한다.
- 자동화 테스트 런너 없음 — 새 기능 추가 시 TRD에 체크리스트 항목도 추가 권장.
- 부모 `../AGENTS.md`가 변경되면 PRD/TRD를 동기화한다.
- 인접 게임(`../../1_chosung_quiz/docs/`) 패턴을 따른다.
- **시리즈 공통 UI**: `TRD.md §10 홈·설정·완료 화면 디자인 시스템`과 `PLAN.md` 디자인 일관성 체크리스트에 시작/설정/lock-screen 규격이 명시됨.

<!-- MANUAL: -->
