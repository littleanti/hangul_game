# 🗂️ PLAN — 어휘력 세계수 v1

> 개발 계획 및 진행 상태
> Last updated: 2026-06-02
> Stage: **구현 완료 — 베타 검증 단계** (M0~M6 산출물 완성, M7 실기기 검증 잔여)

## 📊 마일스톤 진행 현황

| 마일스톤 | 상태 | 검증 근거 |
|---|---|---|
| M0 — 데이터 기초 | ✅ 완료 | `npm run validate` (errors=0, warnings=0 / 한자 100, 어휘 418, 학술 30) |
| M1 — 묘목 MVP | ✅ 완료 | 전체 모듈 구현 + 웹 봇 풀 사이클 통과(US-002) |
| M2 — 나무 성장 + 카메라 | 🟡 거의 완료 | overview/camera/minimap 구현 + 오버뷰 렌더 정합 수정, **Phase 2.4 viewport culling 미구현** |
| M3 — SRL + 락 | ✅ 완료 | `npm run test` (12/12 통과) |
| M4 — 학술 보스 | ✅ 완료 | 30어휘 게이트 + decompose 매칭(US-004) |
| M5 — 학부모 대시보드("학습 기록") | ✅ 완료 | 진척 시각화(US-005) — **PIN 잠금 제거(2026-06-02)** |
| M6 — PWA + 알림 | ✅ 완료 | manifest + sw.js (41 자산 precache, US-006) |
| M7 — 베타 | 🟡 진행 중 | 자동 봇 검증 통과, **실기기/Lighthouse 잔여** |
| 추가 구현 (PLAN/PRD 외) | ✅ 일부 | 설정 화면 + 웹 봇 검증 하니스 (아래 §추가 참고) |

> 상세 자가 점검은 `docs/STATUS.md` 참조. 체크박스 `[x]`는 구현·검증 완료, `[ ]`는 미완료/잔여를 의미한다.

## 🧱 M0 — 데이터 기초

- [x] 한자 마스터 스키마 정의 (`src/data/hanja.js`)
  - id, code(유니코드), 훈음, 급수, 부수, 획수, 학년 태그
- [x] 한자 100자(초3 23 + 초4 77) + 훈음 입력
- [x] 한자별 파생 어휘 데이터 (`src/data/words.js`)
  - hanjaId, text(어휘), 의미(아이 친화 재구성), 예문, 학년 태그
  - 한자당 4~8어휘 (검증: 모든 한자 4어휘 이상 보유)
- [x] 학술 어휘 분해 데이터 (`src/data/academic.js`)
  - 이등변삼각형, 용액, 분수, 평행사변형 등 30개
- [ ] 의미 재구성 원칙 검증: 교사 1인 자문 (외부 의존 — 미확인)
- [x] 데이터 유효성 자동 점검 스크립트 (`tools/validate-data.js`, `npm run validate`)
  - 한자 코드 ↔ 어휘 음 일관성 + 두음법칙 예외 처리

## 🌱 M1 — 묘목 MVP (코어 루프)

### Phase 1.1 — 골격
- [x] 디렉터리/모듈 구조 셋업 (TRD §2.1)
- [x] 정적 서버 진입 (`npm run dev` → `serve . -l 4325`)
- [x] `state.js` 싱글톤 + `config.js` 상수
- [x] Dexie 스키마 v1 + 기본 CRUD (`db.js`) — in-memory 폴백 포함
- [x] 화면 상태 머신 (`splash → today → play → leaf-modal`)

### Phase 1.2 — 묘목 시각화
- [x] SVG 묘목 베이스 일러스트 + 뿌리 한자 텍스트
- [x] 가지 후보 영역 표시 (4개 슬롯)
- [x] 한자 폰트 서브셋 로드 (`font-display: swap`, Noto Serif KR 폴백)

### Phase 1.3 — 음절 블록 + 매칭
- [x] `blocks/spawn.js` — 음절 블록 floating
- [x] `blocks/drag.js` — Pointer Events 기반 드래그
- [x] 자성 스냅 (60dp 가이드, 30dp 흡착)
- [x] `blocks/match.js` — 정답 판정
- [x] 정답 시 가지 자라기 + 잎 페이드인
- [x] 오답 시 블록 원위치 + 진동 피드백

### Phase 1.4 — 어휘 의미 카드
- [x] `ui/modal.js` — 잎 클릭 → 모달
- [x] 의미 + 예문 + 한자 분해 표시
- [x] TTS 발화 (`tts.js`)
- [x] 모달 닫기 시 다음 블록 등장

### Phase 1.5 — 일일 완료 처리
- [x] 4어휘 달성 감지 → 락 화면 진입
- [x] `daily` 테이블 업데이트
- [x] "내일 또 만나요!" 안내 + 다음 학습 시각 표시

## 🌳 M2 — 나무 성장 + 카메라

### Phase 2.1 — 누적 시각화
- [x] 한자(루트) 다수 배치 알고리즘 (자체 레이아웃, `tree/overview.js`)
- [x] 가지 분기 자연스러운 레이아웃
- [x] 성장 단계 시스템 (sapling/young/mature/world, `tree/grow.js`)
- [x] 단계 전환 시 축하 애니메이션

### Phase 2.2 — Viewport 카메라
- [x] `tree/camera.js` — affine matrix 기반
- [x] 핀치줌 (두 포인터)
- [x] 팬 (단일 포인터)
- [x] 줌 레벨에 따라 hit zone dp 일정 유지
- [x] iOS Safari `touch-action` 처리

### Phase 2.3 — 미니맵
- [x] 우상단 미니맵 thumbnail 렌더
- [x] 미니맵 탭 → 카메라 점프 애니메이션
- [x] 현재 viewport 영역 표시

### Phase 2.4 — Viewport Culling ⚠️ 미구현
- [ ] IntersectionObserver로 화면 밖 가지 culling
- [ ] DOM 노드 풀 재활용
- [ ] 누적 어휘 400+ 시나리오 60fps 측정 (실기기 필요)
  > 완화책: 한자(루트)별 4어휘 슬롯 그리드 배치로 잎 1개당 DOM 비용 균등화 (STATUS §알려진 한계 1)

## 🔁 M3 — SRL + 락

### Phase 3.1 — SRL 스케줄러
- [x] `srl.js` — SM-2 변형 알고리즘
- [x] `db.srl` 인덱스 기반 큐 조회
- [x] 노출 간격: 1·3·7·14·30일 검증 (단위 테스트)
- [x] 신규 어휘 vs 복습 우선순위 룰 (`curriculum.js`)

### Phase 3.2 — 오답 미니퀴즈
- [x] 오답 시 즉시 4지선다 등장
- [x] 오답 패턴별 SRL 간격 0.5배 적용 (`applyWrongMini`)
- [x] 정답 시 SRL 큐 업데이트

### Phase 3.3 — 1일 1자 락
- [x] `curriculum.js` — 자정 기준 락 판정 (`isLockedToday`)
- [x] 자정 경과 시 미완료 어휘 SRL 이월
- [x] 락 화면 UX (격려 메시지 + 다음 학습 시각)

### Phase 3.4 — 백그라운드 자동 저장
- [x] `visibilitychange` 핸들러 (`main.js`)
- [x] 진척도 자동 저장
- [x] 복귀 시 상태 복원

## 🏛️ M4 — 학술 어휘 분해 보스

- [x] 보스 진입 조건: 누적 어휘 ≥ 30 (`CONFIG.BOSS_UNLOCK_WORDS`)
- [x] `boss/decompose.js` — 어휘 분해 매칭 UI
- [x] 한자 카드 셔플 + 슬롯 매칭
- [x] 부분 정답 시각 힌트 (한자별 색상)
- [x] 보상: "골든 잎" 영구 보존
- [x] 학술 어휘 30개 보스 데이터 작성

## 👨‍👩‍👧 M5 — 학부모 대시보드("학습 기록")

- [x] 진척 시각화: 누적 한자/어휘/정답률/연속일
- [x] SRL 큐 잔여 어휘 수
- [x] 학습 시각 분포 차트(요일별)
- [x] 다음 알림 시각 조정 UI (설정 화면 연동)
- [x] ~~PIN 설정/해시(SHA-256+salt)/3회 오류 잠금~~ → **전체 제거(2026-06-02)**
  - 저학년 단독 사용 시 4자리 PIN이 진입 장벽이 되고, 데이터가 모두 디바이스 로컬이라 보호 실익이 낮음.
  - 제거 범위: `ui/dashboard.js`의 PIN 설정/입력/잠금 흐름 + "PIN 변경" 버튼, `config.js`의 `PIN_*` 상수, `state.js`의 `pinAttempts`/`pinLockedUntil`, `dashboard.css`의 PIN 키패드 스타일. 홈 → "학습 기록" 진입 시 바로 대시보드 콘텐츠 렌더.

## 📲 M6 — PWA + 알림

### Phase 6.1 — PWA
- [x] `manifest.webmanifest` (아이콘, theme color, display)
- [x] Service Worker 등록 (`sw.js`)
- [x] precache: 핵심 JS/CSS, 한자 폰트 서브셋, 한자/어휘 데이터 (41 자산)
- [x] runtime cache: 외부 폰트
- [x] `skipWaiting` + `clients.claim`
- [x] 캐시 버스팅 전략 (CACHE_NAME 버전)

### Phase 6.2 — 알림
- [x] `notify.js` — 권한 요청 (설정에서만)
- [x] 일일 학습 알림 스케줄 (`scheduleDaily`)
- [x] SRL 복습 리마인드
- [x] 권한 거부 시 인앱 배지/토스트 폴백

## 🧪 M7 — 베타

- [ ] 1주일 누적 사용 시나리오 검증 (시간 mock)
- [ ] iOS Safari 15+ 디바이스 실기 테스트
- [ ] Android Chrome 저사양 디바이스 검증
- [ ] 학부모 대시보드 정확성 텔레메트리 (디바이스 내)
- [ ] 한자 폰트 로딩 누락 케이스 (CSS 폴백은 적용, 실기기 확인 잔여)
- [ ] 자정 경계 동작 (실기기)
- [ ] 미니맵 + 카메라 iOS 핀치 충돌 검증 (실기기)
- [ ] PWA 홈 화면 설치 흐름 검증 (Lighthouse)
- [x] 자동 봇 검증 (Playwright headless) — US-001~007 통과, `tools/web-verify.mjs`
  > 데스크톱/모바일 에뮬레이션 한정. 실기기 매트릭스는 베타 단계에서 별도 수행.

## ➕ 추가 구현 항목 (PLAN/PRD 외 — 실제 코드 반영)

> 최초 PLAN/PRD에 마일스톤으로 명시되지 않았으나 구현된 항목.

### 설정 화면 (Settings)
- [x] 설정 화면 라우트 (`SCREENS.SETTINGS`, `screen-settings`)
- [x] 학년 선택 (초3~초6 chip) → 한자 추천 반영
- [x] 자동 발음(TTS) 토글
- [x] 일일 학습 알림 토글 (권한 요청 연동)
  > 구현: `src/js/main.js openSettings()`. PRD §9 디자인 규격(설정 화면)을 충족.

### 자동 검증 하니스
- [x] Web bot 자동 검증 (`tools/web-verify.mjs`)
  - Playwright chromium/firefox/webkit, 모바일 뷰포트(Pixel 7) 에뮬
  - US-001~007: splash 로드 / M1 풀 사이클 / 누적 나무 / 학술 보스 / 대시보드 / PWA / 콘솔·네트워크 종합
    > US-005는 PIN 제거 후 "학습 기록 바로 진입 + KPI 렌더"로 재정의됨.
  - 결과 로그: `tools/web-verify.log`
- [x] 데이터 일관성 검증 (`tools/validate-data.js`)
- [x] SRL 알고리즘 단위 테스트 (`tools/test-srl.js`, node 기반 12 케이스)

### 버그 픽스 (검증 과정 발견)
- [x] 화면 전환 시 홈이 아래로 쌓이는 레이아웃 버그 + 홈 버튼 정렬 (commit `54997e3`)
- [x] 웹 봇 검증 발견 버그 3건 픽스 (commit `8276557`)
- [x] **어휘 세계수(누적 나무) 오버뷰 렌더 깨짐 수정** (`tree/overview.js`, `tree/minimap.js`)
  - **증상**: 오버뷰의 SVG 트리와 DOM 잎이 어긋나 화면 밖으로 밀리고, 잎이 겹쳐 깨져 보임. 미니맵 썸네일은 빈 상태.
  - **원인**: 오버뷰가 `#screen-tree`(`display:none`, 0×0)인 상태에서 렌더되어 `viewBox`(fallback `360×580`)와 카메라 `fit()`(scale `0.3`, tx `-288`/ty `-72`)이 stale 값으로 고정. 화면 표시 후 `ResizeObserver` 재맞춤이 타이밍에 따라 발화하지 않아(레이스) 미수정 상태로 남음. 미니맵은 직렬화된 `<g>`에 stale 카메라 matrix가 남아 콘텐츠가 viewBox 밖으로 밀림.
  - **수정**: ① 화면이 보인 다음 프레임에 실제 스테이지 크기로 `viewBox`+카메라를 재맞춤하는 `settle()`을 `requestAnimationFrame`으로 보장(+`ResizeObserver`는 이후 리사이즈 대비로 유지), ② 실제 채워진 열 수(`usedCols`)만큼만 콘텐츠 폭으로 잡아 fit 배율 확대, ③ 미니맵 썸네일 `<g>`의 stale `transform` 제거.
  - **검증**: Chrome 실측 — `viewBox`=실 스테이지(500×440) 정합, 잎 12/12·루트 3/3 모두 스테이지 내부, 잎이 루트 위에 정렬, 미니맵 콘텐츠 표시(27 elements). `npm run validate`/`npm run test` 통과.

### 드롭존 힌트 UX
- [x] 드롭존 힌트 UX 개선 — 활성 가지 안내 + 후보 가지 강약 표시 (`main.js`, `tree/render.js`, `tree.css`, commit `fd1fa24`)

### 한자 도감(컬렉션) — F14b
- [x] `ui/collection.js` + `css/collection.css` — 학습한 한자/어휘 카드 컬렉션 화면
- [x] 홈 → `📚 도감` 진입 / 닫기 시 홈 복귀 (`main.js openCollection()`)

### 홈 화면 `6_literacy_decoder` 정렬 (2026-06-02)
- [x] 중제목(`.subtitle`) 폰트를 Jua로 정렬 + 문구 `한자 한 글자가 키워내는 어휘 나무 🌳`
- [x] 소제목 진행 요약(`.splash-progress-summary`) 추가 — `학습한 한자 N자 · 어휘 N개` (홈 진입/복귀 시 `db.listLearnedHanja/Words` 카운트로 갱신)
- [x] 하단 보조 버튼을 pill 스타일(`.splash-sub-row`/`.btn-settings`)로 교체 + 문구 변경: `📚 도감`, `📊 학습 기록`, `⚙ 설정` (← 한자 도감/학부모 대시보드/설정)
- [x] `renderSplash` async화 + `goSplash()` 헬퍼로 홈 복귀 시 카운트 재렌더 (`main.js`)
- [x] "학부모 대시보드" 명칭을 **"📊 학습 기록"** 으로 통일 — 홈 버튼, 대시보드 화면 헤더(`ui/dashboard.js`), 일일 완료(lock) 화면 버튼(`ui/lock.js`), 실패 토스트(`main.js`)
  > PRD §9.1 홈 화면 규격 참조.

## 🚧 v2 — 다음 로드맵 (아이디어)

### P1 후보
- [x] ~~**어휘 도감**: 누적 어휘 컬렉션 시각화 (격려)~~ → F14b 한자 도감으로 구현 완료
- [ ] **연속일 보너스**: 7/14/30일 스트릭 보상
- [ ] **한자 어원 애니메이션**: 갑골문 → 현대 자형 전환
- [ ] **다국어 보조 라벨**: 영/일/중 의미 (외국인 학습자)

### P2 후보
- [ ] **친구/형제 비교**: 로컬 가족 모드
- [ ] **한자 손글씨 입력**: Stroke 인식 (마이크/카메라 없음)
- [ ] **교사 모드**: 반 단위 진척 CSV 내보내기
- [ ] **성인 모드**: 1일 1자 락 해제 옵션

### P3 (실험)
- [ ] **한자 음성 입력**: Web Speech Recognition
- [ ] **AI 예문 생성**: 학년 수준 맞춤 예문 자동 생성
- [ ] **학습자 간 어휘 교환**: WebRTC P2P

## 🔄 기술 부채 / 개선점

| 항목 | 우선순위 | 상태 | 메모 |
|---|---|---|---|
| TypeScript 마이그레이션 | High | ⬜ 미착수 | state/db 스키마가 빠르게 커짐 |
| Vitest 유닛 테스트 | High | 🟡 부분 | node 기반 `test-srl.js`(12케이스)로 대체 중, Vitest 미도입 |
| Playwright E2E | Medium | ✅ 도입 | `web-verify.mjs` — US-001~007, chromium/firefox/webkit |
| Vite 빌드 도구 | Medium | ⬜ 미착수 | Service Worker 캐시 버스팅 자동화 |
| d3-hierarchy 부분 임포트 | Low | ⬜ 미착수 | 현재 자체 레이아웃 사용, 복잡도 증가 시 검토 |
| 다국어 i18n 구조 | Low | ⬜ 미착수 | 외국인 학습자 모드 진입 시 |
| Viewport culling (M2.4) | Medium | ⬜ 미착수 | 누적 400+ 성능 — 현재 그리드 분산 배치로 완화 |

## 🎯 브랜치 전략

```
main                                # 배포 가능한 안정 버전
└── dev                             # 통합 개발 브랜치
    ├── feat/data-hanja-50          # M0 데이터
    ├── feat/sapling-mvp            # M1 묘목 MVP
    ├── feat/tree-camera            # M2 카메라
    ├── feat/srl-scheduler          # M3 SRL
    ├── feat/boss-decompose         # M4 보스
    ├── feat/parent-dashboard       # M5 대시보드
    ├── feat/pwa-notifications      # M6 PWA
    └── refactor/typescript         # 기술 부채
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `data:`(데이터 추가), `test:`(검증)

## ✅ 검증 게이트 (각 마일스톤 종료 조건)

- [x] M0: 데이터 일관성 자동 점검 통과 ( + 교사 1인 검토는 외부 의존 잔여)
- [x] M1: 1자 4어휘 풀 사이클 통과 (자동 봇 US-002)
- [ ] M2: 누적 어휘 400 시뮬레이션 60fps 측정 (실기기 잔여)
- [x] M3: SRL 시뮬레이션 정확성 검증 (단위 테스트 12/12)
- [x] M4: 보스 어휘 30개 매칭 (US-004)
- [x] M5: 학습 기록(대시보드) 진입 + KPI 렌더 (US-005, PIN 제거 후 재정의)
- [ ] M6: PWA Lighthouse 점수 90+ (측정 잔여) — manifest/sw 응답·등록은 US-006 통과
- [ ] M7: 실기기 매트릭스 전부 통과 (베타 단계)

## 📝 릴리즈 노트 (예정)

### v1.0.0 (목표 — M7 종료)
- 1자 4어휘 일일 학습 풀 사이클
- 누적 시각화 + 핀치줌·팬·미니맵
- SRL 간격 반복 학습
- 학술 어휘 분해 보스
- 학습 기록(학부모 대시보드, 잠금 없음) + 한자 도감
- PWA 오프라인 + 일일 알림
- 한자 100자(초3~초4) + 418어휘 + 학술 30어휘

### v0.x (마일스톤별 내부 빌드)
- v0.1: M1 묘목 MVP
- v0.2: M2 나무 + 카메라
- v0.3: M3 SRL + 락
- v0.4: M4 보스
- v0.5: M5 대시보드
- v0.6: M6 PWA
- v0.7: 자동 봇 검증 하니스 + 설정 화면 + 버그 픽스
- v0.8: 한자 도감 + 드롭존 힌트 UX + 홈 화면 `6_literacy_decoder` 정렬 + 학습 기록 PIN 제거 (현재)

---

## 디자인 일관성 체크리스트 (홈·설정·완료 화면)

시작·설정·완료 화면 구현 전·후 아래 항목을 확인한다 (기준: `1_chosung_quiz`).

- [x] 제목에 `font-family: 'Jua', sans-serif` 적용
- [x] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [x] `tokens.css` CSS 변수 팔레트 — 1단계 기준 색상·배경·간격 동일 적용
- [x] 큰 라운드 버튼 스타일 (`components.css` 참조)
- [x] 배경 색상 `--color-bg`/`--cream` 동일 사용
- [x] 일일 완료 화면(lock-screen)에도 동일 폰트·색상·버튼 스타일 적용
- [x] 홈 화면 중제목/소제목/보조 버튼을 후행작 `6_literacy_decoder` 홈과 동일 레이아웃·스타일로 정렬 (PRD §9.1)
- [ ] 1단계 홈·설정·완료 화면과 나란히 놓고 시각적 통일감 육안 확인 (수동 검토 잔여)
