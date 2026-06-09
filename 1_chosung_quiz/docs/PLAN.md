# 🗂️ PLAN — 초성 퀴즈 v2

> 개발 계획 및 진행 상태

## ✅ v1 — MVP (완료)

| # | 작업 | 산출물 | 상태 |
|---|---|---|---|
| 1 | 기획 (PRD) | 기본 게임 흐름 정의 | ✅ |
| 2 | 화면 설계 | start / play / end 3개 화면 | ✅ |
| 3 | 초성 추출 로직 | `getChosung()` 함수 | ✅ |
| 4 | 기본 디자인 | 그림책 테마, Jua/Gowun Dodum 폰트 | ✅ |
| 5 | 단어 DB (30개) | 5개 카테고리 | ✅ |
| 6 | 자가 채점 UX | 맞혔어요/틀렸어요 버튼 | ✅ |
| 7 | 종료 화면 | 점수 + 격려 메시지 | ✅ |

## ✅ v2 — 확장 (완료)

### Phase 1 — 설정 시스템
- [x] 설정 화면 UI (카테고리/난이도/문제수/타이머 칩)
- [x] 토글 컴포넌트 (TTS, 이미지 모드)
- [x] 설정 상태 모델 (state.settings)
- [x] 유효성 검사 + 플래시 메시지

### Phase 2 — 문제 필터링
- [x] `filterWords()` 함수 (카테고리 + 난이도)
- [x] 단어 풀 부족 시 반복 채움
- [x] 단어 DB 확장 (30 → 44개, 글자수 균등)

### Phase 3 — TTS 통합
- [x] Web Speech API 래퍼 (`tts.js`)
- [x] 음성 로딩 비동기 대기 (`voiceschanged`)
- [x] 한국어 음성 우선 선택
- [x] 🔊 버튼 (문제 카드) + 애니메이션
- [x] 정답 공개 시 자동 발음
- [x] 미지원 브라우저 graceful fallback

### Phase 4 — 타이머
- [x] `timer.js` 모듈
- [x] 헤더 배지 (초록 → 노랑 → 빨강 펄스)
- [x] 0초 도달 시 자동 공개 + 오답 처리
- [x] 화면 전환 시 자동 정지

### Phase 5 — 이미지 모드
- [x] `imageUrl` 필드 지원 (데이터 확장)
- [x] `<img>` 렌더링 + `onerror` 폴백
- [x] 사진 모드 토글

### Phase 6 — 복습 & 영속화
- [x] 틀린 문제 리스트 (이유: wrong/timeout 구분)
- [x] 복습 항목별 🔊 TTS 버튼
- [x] localStorage 설정 저장/로드
- [x] 저장 실패 graceful 처리

### Phase 7 — 리팩토링
- [x] 단일 파일 → 모듈 분리
- [x] CSS 파일 역할별 분리 (tokens/base/components/screens)
- [x] JS 모듈 분리 (config/state/storage/utils/tts/timer/ui/settings/game/main)
- [x] VSCode 설정 + 문서화

## ✅ v2.1 — 사운드 + 프로필 (완료)

### Phase 8 — 사운드 & 프로필 시스템
- [x] `sound.js` — Web Audio API 오실레이터 기반 효과음 (외부 파일 불필요)
  - 정답: C5→E5→G5 삼화음 아르페지오 (`playCorrect`)
  - 오답: G3→D3 하강 톤 (`playIncorrect`)
- [x] `profiles.js` — 사용자 프로필 관리 (`chosung-quiz-profiles-v1` 키)
  - 최대 8개 프로필, emoji 아바타 선택, 프로필별 독립 설정
  - 기존 v2 단일 설정 → "게스트" 프로필 자동 마이그레이션
- [x] `profile-ui.js` — 프로필 선택·생성 UI 렌더링

## ✅ v2.2 — 입력 모드 확장 + 레벨 버튼 (완료)

### Phase 9 — 글자 선택 모드 / 힌트 / 레벨 버튼
- [x] `game.js` — `renderSyllableMode()` + `buildSyllablePool()`: 음절 버튼 탭으로 단어 입력
  - 정답 음절 + 방해 음절(8개) 풀 생성, 순서 입력, 자동 채점
- [x] `game.js` — `useHint()`: 두 가지 모드 힌트
  - 일반 모드: `buildHintWord`로 초성→글자 점진 공개
  - 글자 선택 모드: 다음 음절 자동 선택 (`hint-used` 표시)
- [x] `settings.js` — `inputMode` 토글 + `hintEnabled` 토글 설정 화면 반영
- [x] `config.js` — `LEVEL_DEFAULTS`: 레벨 버튼(1~4) 별 기본 난이도 매핑
- [x] `settings.js` — `startWithLevel(level)`: 레벨 버튼 클릭 시 난이도만 교체, 나머지 유저 설정 유지
- [x] `state.js` — `lastGameWords` + `userOverrides`: 연속 플레이 중복 ≤ 20% 제한 + 사용자 설정 우선권
- [x] `game.js` — `pickQuestions()`: fresh 우선 문제 선별 알고리즘

## ✅ v2.3 — 가로 모드 2컬럼 적응형 레이아웃 (완료)

### Phase 10 — 반응형 가로 모드
- [x] `screens.css` — `@media (orientation: landscape) and (max-height: 700px)` 추가
  - 플레이 화면을 CSS Grid 2컬럼으로 전환 (카드 좌 / 입력+버튼 우)
  - 글자 선택 모드 ON/OFF 모두 동일 CSS로 자동 적응 (그리드 auto-placement)
- [x] 버튼 stretch 방지: `align-items: start` + 버튼-row `align-self: center`
- [x] 카드 꽉 채우기: `align-self: stretch` + flex column + visual-area `flex: 1`
- [x] viewport 비례 사이즈: 이모지/이미지/단어/버튼에 `clamp()` + vh/vw 적용
- [x] 세로 모드 회귀 없음 검증 (Chrome MCP로 portrait/landscape 양쪽 동작 확인)

## 🚧 v3 — 다음 로드맵 (아이디어)

### P1 후보
- [ ] **타이핑 모드**: 초성 안 보고 직접 키보드로 입력
- [ ] **힌트 시스템**: 3초 후 첫 글자 공개, 7초 후 중성도 공개
- [ ] **단어 도감**: 맞힌 단어 컬렉션 시각화 (격려 효과)
- [ ] **연속 정답 보너스**: 콤보 카운트 + 시각 효과
- [ ] **난이도 자동 조절**: 정답률 기반 다음 문제 난이도 상향

### P2 후보
- [ ] **JSON 업로드**: 사용자가 자신만의 단어집 가져오기
- [ ] **카테고리 직접 편집**: UI에서 추가/삭제
- [ ] **PWA 변환**: 홈 화면 설치, 오프라인 지원
- [ ] **다크 모드**: 야간 학습용
- [ ] **통계 화면**: 누적 점수, 카테고리별 정답률 그래프

### P3 (실험)
- [ ] **음성 입력**: 마이크로 답하기 (Web Speech Recognition)
- [ ] **이미지 AI 생성**: 그림 대신 DALL-E/Stable Diffusion 호출
- [ ] **멀티플레이어**: WebRTC로 방 만들어 같이 풀기

## 🔄 기술 부채 / 개선점

| 항목 | 우선순위 | 메모 |
|---|---|---|
| TypeScript 마이그레이션 | Medium | state 타입이 커지면 이득 |
| Vitest 유닛 테스트 | Medium | getChosung, filterWords 우선 |
| Playwright E2E | Low | 주요 시나리오 3개 정도 |
| Vite 빌드 도구 도입 | Low | 번들링/미니파이 필요해질 때 |
| i18n 구조 | Low | 영어 UI 지원 시 |
| React 또는 Lit 마이그레이션 | Low | 화면이 5개 이상 되면 고려 |

## 🎯 브랜치 전략 (예시)

VSCode에서 이어 작업 시 추천 Git 워크플로:

```
main              # 배포 가능한 안정 버전
├── dev           # 통합 개발 브랜치
    ├── feat/typing-mode       # 기능 브랜치
    ├── feat/word-collection
    └── refactor/typescript
```

커밋 메시지 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`

## 📝 릴리즈 노트

### v2.3.0 (현재)
- 가로 모드 2컬럼 적응형 레이아웃: 가로 + 낮은 높이 환경에서 플레이 화면 자동 2컬럼 (카드 좌 / 입력+버튼 우)
- viewport 비례 사이즈: 이모지/이미지/단어/버튼이 `clamp()` + vh/vw로 작은 휴대폰부터 태블릿까지 자동 적응
- 카드가 row 높이만큼 stretch되어 빈 공백 없이 꽉 채움
- 글자 선택 모드 ON/OFF 모두 동일 CSS로 동작 (그리드 auto-placement)
- 세로 모드는 영향 없음 (미디어 쿼리 안에서만 적용)

### v2.2.0
- 글자 선택 모드 (`inputMode`): 초성 힌트 대신 음절 버튼 탭으로 직접 단어 조립
- 힌트 시스템 (`hintEnabled`): 설정 화면에서 힌트 버튼 표시 여부 토글
- 레벨 버튼 (1~4): 홈 화면에서 난이도 탭 → 즉시 게임 시작
- 연속 플레이 중복 제한: 직전 게임 단어 재출제 ≤ 20% (fresh 우선 알고리즘)

### v2.1.0
- Web Audio API 정답/오답 효과음 (`sound.js`) — 외부 오디오 파일 없이 오실레이터로 생성
- 다중 프로필 시스템 (`profiles.js`, `profile-ui.js`) — 최대 8개, emoji 아바타, 프로필별 독립 설정
- 기존 v2 단일 설정 → "게스트" 프로필 자동 마이그레이션

### v2.0.0
- 설정 화면 추가 (카테고리/난이도/문제수/타이머/TTS/이미지)
- TTS 발음 듣기
- 타이머 모드
- 틀린 문제 복습
- localStorage 설정 저장
- 이미지 모드 (URL 지원)
- 코드 모듈화 (CSS/JS 분리)

### v1.0.0
- MVP: 이모지 + 초성 + 정답 확인 기본 플로우
- 30개 단어, 5개 카테고리
- 10문제 고정, 자가 채점, 격려 메시지

---

## 디자인 기준 — 시리즈 공통 UI 레퍼런스

본 게임의 홈 화면·설정 화면·게임 완료 화면 디자인은 **7단계 시리즈 전체의 UI 디자인 기준**이다.  
형제 게임(2~6단계)은 시작·설정·완료 화면 구현 시 아래 항목을 준수한다.

- [ ] 제목에 `font-family: 'Jua', sans-serif` 적용
- [ ] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [ ] `src/css/tokens.css` CSS 변수 팔레트 동일 적용 (색상·배경·간격)
- [ ] 큰 라운드 버튼 스타일 (`src/css/components.css` 참조)
- [ ] 배경 색상 `--color-bg` 동일 사용
- [ ] 게임 완료 화면(end-screen)에도 동일 폰트·색상·버튼 스타일 적용
