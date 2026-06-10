<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-05-25 -->

# docs

## Purpose
`4_morpheme_detective` 게임의 기획 및 설계 문서. 실제 코드에는 영향을 주지 않으며, 제품 요구사항·기술 설계·개발 계획을 기록한다. 본 게임은 **M7 + M8 코드 작업 완료** 상태이며, PRD/TRD/PLAN 은 구현된 동작을 기준으로 유지·관리한다.

## Key Files

| File | Description |
|------|-------------|
| `PRD.md` | 제품 요구사항 문서 (Product Requirements Document) — 사용자/시나리오/F1 ~ F19 기능 요구. M7 컬렉션·줌·팬 + M8 PWA·설정 완료 반영 |
| `TRD.md` | 기술 설계 문서 — SVG path morph(좌표 lerp + cross-fade + 글리프 fallback) / 돋보기 자석 / 클릭 라우팅 4단계 / TTS / §8 수동 테스트 체크리스트 |
| `PLAN.md` | 개발 계획 및 진행 상황 (M0 ~ M9 마일스톤) — M7 완료 / M8 코드 작업 완료, 실기기 매트릭스 · Noto Sans CJK 서브셋 · F15·F18 가 잔여 |

## For AI Agents

### Working In This Directory
- 본 게임은 **구현 완료 단계** — 사건 4종 / 한자 8자 / 컬렉션·설정·줌·팬·PWA SW v3 까지 동작. 잔여 항목(실기기 QA, 폰트 서브셋, F15·F18)은 PLAN.md M8/M9 절 참조.
- 부모 `../AGENTS.md` 의 게임 메커닉/모바일 정책이 1차 출처(SoT)이며, 본 docs는 이를 PRD/TRD/PLAN 형식으로 분해한 산출물.
- 핵심 인지 정책은 PRD §7 "Out of Scope" 에 명시: **한자 쓰기 입력 절대 금지**, **이미 아는 단어에서만 한자 노출**.
- 한자 morph 알고리즘, 자석 거리, hit zone 80dp, 클릭 라우팅 4단계 같은 핵심 상수·정책은 TRD §3에 명시.
- 수동 테스트 체크리스트는 `TRD.md` §8을 기준으로 한다 — 인지·정책 검증 항목이 일반 QA와 별개로 존재.
- 자동화 테스트 런너 없음 — 새 기능 추가 시 TRD에 체크리스트 항목도 추가 권장. 데이터 정합성은 `npm run validate` (`scripts/validate-data.js`) 로 보장.
- 인접 단계(`../3_word_network/docs/`, `../5_vocabulary_tree/`)와 한자/어휘 데이터 스키마 호환성 유지 — 발견 한자 컬렉션 키 `4md:collected` 는 5단계 학습 큐로 전달 예정.
- **시리즈 공통 UI**: `TRD.md §11 홈·설정·완료 화면 디자인 시스템`과 `PLAN.md` 디자인 일관성 체크리스트에 start/settings/mission/end/collection-screen 규격이 명시됨.

<!-- MANUAL: -->
