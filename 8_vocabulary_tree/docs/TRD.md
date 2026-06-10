# 🔧 TRD — 어휘력 세계수 v1

> Technical Requirements Document
> Last updated: 2026-04-25

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2022+) | 의존성 최소, 인접 게임(`1_chosung_quiz`) 일관성 |
| 모듈 | ES Modules (`type="module"`) | 빌드 단계 없음 |
| 시각화 | SVG (나무·가지) + Canvas 2D (잎 파티클) | SVG는 DOM hit zone, Canvas는 다량 파티클 |
| CSS | Vanilla CSS + CSS Variables | 토큰 관리 일관성 |
| 폰트 | 한자 서브셋(Noto Sans KR/SC) + 본문(Gowun Dodum) | `font-display: swap` |
| 개발 서버 | `npx serve -p 4325` | zero-config |
| 영속화 | **IndexedDB via Dexie.js** | localStorage 5MB 한도 회피 (누적 학습 데이터) |
| TTS | Web Speech API | 네이티브 |
| 알림 | Notification API + (옵션) Service Worker `showNotification` | PWA 로컬 알림 |
| PWA | Web App Manifest + Service Worker | 홈 화면 설치, 오프라인 |
| 입력 | Pointer Events API | 마우스/터치/펜 통합 |

**의도적으로 제외한 것**:
- React/Vue/Svelte — 이 규모와 인접 게임 통일성에는 과함
- 빌드 도구 — ES Modules + 정적 서버로 충분
- TypeScript — v1 프로토타입 속도 우선 (P2에서 마이그레이션 검토)
- D3.js 풀 임포트 — 필요 시 `d3-hierarchy`만 부분 임포트

**예외**: Dexie.js는 ESM CDN 임포트(`https://esm.sh/dexie`) 사용 — IndexedDB 원시 API보다 안전하고 마이그레이션 용이.

## 2. 아키텍처

### 2.1 디렉터리 구조
```
src/
├── css/
│   ├── tokens.css       # 색·간격·z-index 변수
│   ├── base.css         # reset, body, 타이포
│   ├── tree.css         # 나무·가지·잎
│   ├── blocks.css       # 음절 블록
│   ├── modal.css        # 어휘 의미 카드
│   ├── dashboard.css    # 학부모 대시보드
│   └── screens.css      # 화면 전환 컨테이너
├── data/
│   ├── hanja.js         # 한자 마스터 (8~준4급)
│   ├── words.js         # 한자ID → 파생 어휘 배열
│   └── academic.js      # 학술 어휘 분해 (보스 데이터)
└── js/
    ├── main.js          # 진입점, 라우팅, Service Worker 등록
    ├── config.js        # 상수 (성장 임계치, SRL 간격 등)
    ├── state.js         # 메모리 상태 싱글톤
    ├── db.js            # Dexie 스키마 + CRUD
    ├── srl.js           # 간격 반복 학습 스케줄러
    ├── curriculum.js    # 1일 1자 분량 결정 로직
    ├── tree/
    │   ├── render.js    # SVG 나무·가지 렌더
    │   ├── grow.js      # 가지 분기 + 성장 애니메이션
    │   ├── leaves.js    # 어휘 잎 (Canvas 파티클)
    │   └── camera.js    # 핀치줌·팬·미니맵
    ├── blocks/
    │   ├── spawn.js     # 음절 블록 생성·플로팅
    │   ├── drag.js      # Pointer Events + 자성 스냅
    │   └── match.js     # 정답 판정
    ├── boss/
    │   └── decompose.js # 학술 어휘 분해 미션
    ├── ui/
    │   ├── modal.js     # 어휘 의미 카드
    │   ├── dashboard.js # 학부모 대시보드
    │   └── lock.js      # 1일 1자 락 화면
    ├── tts.js           # Web Speech API 래퍼
    ├── notify.js        # Notification API 래퍼
    └── utils.js         # 순수 유틸
```

### 2.2 모듈 의존성 (요약)
```
main.js
  ├─ db.js ─────────→ (Dexie ESM)
  ├─ curriculum.js ─→ db.js, srl.js, data/*
  ├─ tree/render.js ─→ tree/grow.js, tree/leaves.js
  ├─ tree/camera.js
  ├─ blocks/spawn.js ─→ blocks/drag.js, blocks/match.js
  ├─ ui/modal.js ────→ tts.js
  ├─ ui/dashboard.js ─→ db.js
  └─ notify.js

공통: config.js (최하위), state.js, utils.js
```

### 2.3 IndexedDB 스키마 (Dexie)
```js
db.version(1).stores({
  hanja:   '++id, code, level, learnedAt',          // 학습한 한자
  words:   '++id, hanjaId, text, learnedAt, srlBox', // 학습한 어휘
  srl:     '++id, wordId, dueAt, interval, ease',   // SRL 큐
  daily:   'date, hanjaId, completedCount',         // 일일 학습 락
  profile: 'key',                                   // 단일 학습자 메타
});
```

**왜 IndexedDB인가**: 누적 어휘 800~2000 + SRL 이력은 localStorage 5MB 한도 위험. 또한 인덱스 기반 SRL 큐 조회(`dueAt` 정렬)가 필수.

### 2.4 상태 모델 (메모리)
```js
state = {
  profile: {
    grade: '3' | '4' | '5' | '6',
    startedAt: ISOString,
  },
  today: {
    date: 'YYYY-MM-DD',
    hanjaId: number,
    targetCount: 4,                  // 일일 목표 어휘 수
    completed: Word[],               // 오늘 완료한 어휘
    locked: boolean,                 // 추가 학습 차단 여부
  },
  tree: {
    nodes: Map<wordId, TreeNode>,    // 잎 위치·상태
    branches: Branch[],              // 가지 segment
    stage: 'sapling'|'young'|'mature'|'world', // 성장 단계
    cumulativeWords: number,
  },
  camera: {
    scale: number,                   // 0.3 ~ 3.0
    tx: number, ty: number,          // 평행이동
  },
  session: {
    blocks: Block[],                 // 떠다니는 음절 블록
    activeBranch: BranchId|null,     // 드래그 중 후보
    srlQueue: Word[],                // 오늘 복습 대상
  },
}
```

### 2.5 화면 상태 머신
```
splash ──→ today (묘목)
            │
            ├─→ play  (블록 매칭) ──→ leaf-modal (의미 카드)
            │           │
            │           └─→ wrong-quiz (오답 미니퀴즈)
            │
            ├─→ boss  (학술 어휘 분해)
            │
            ├─→ tree-overview (전체 나무 + 카메라)
            │
            ├─→ lock  (4어휘 달성, 다음날 안내)
            │
            └─→ dashboard (학부모, PIN 보호)
```

전이 시 부작용:
- 모든 전이 → `tts.cancel()` + `pointer drag` 정리
- `play` 진입 → `blocks.spawn()` + 자성 스냅 활성화
- `leaf-modal` 진입 → 자동 TTS 재생 (옵션 ON 시)
- `lock` 진입 → 알림 스케줄링 (다음날 학습 시각)

## 3. 핵심 알고리즘

### 3.1 나무 성장 단계 결정
```js
const STAGE_THRESHOLD = {
  sapling: 0,
  young:   30,
  mature:  120,
  world:   400,
};

function stageFor(cumulativeWords) {
  return ['world','mature','young','sapling']
    .find(s => cumulativeWords >= STAGE_THRESHOLD[s]);
}
```

가지 분기 알고리즘은 d3-hierarchy의 `tree()` 또는 자체 BFS 레이아웃:
- 한자(루트) 1개 → 어휘(잎) N개를 부채꼴로 배치
- 인접 잎 간 최소 각도 12°, 가지 길이는 깊이별 가변

### 3.2 자성 스냅 (Pointer Events)
```js
// pointerdown → 블록 활성화
// pointermove → 가지 후보 거리 계산
//   distance < 60dp → 시각 가이드 + 진동(1.5배 hit zone)
//   distance < 30dp → 흡착 (블록 위치를 가지 끝으로 보간)
// pointerup → match.test(block, branch) → 결과
```

`distance` 산정은 화면 좌표 기준이 아닌 **카메라 좌표 역변환** 후 계산. 줌 레벨에 따라 hit zone을 일정 dp로 유지.

### 3.3 SRL 스케줄러 (SM-2 변형)
```js
function nextInterval(prev, correct) {
  if (!correct) return { interval: 1, ease: Math.max(prev.ease - 0.2, 1.3) };
  const days = prev.interval === 0 ? 1
             : prev.interval === 1 ? 3
             : Math.round(prev.interval * prev.ease);
  return { interval: days, ease: prev.ease + 0.1 };
}
// 노출 스케줄: 1일 → 3일 → 7일 → 14일 → 30일 (default ease 2.0)
```

매일 학습 시작 시 `db.srl.where('dueAt').belowOrEqual(today)` 쿼리로 복습 큐 구성. 복습 어휘는 신규 4어휘 *전에* 노출.

### 3.4 학술 어휘 분해 매칭
```js
// 어휘 = ['二', '等', '邊', '三', '角', '形']
// UI: 어휘 이미지 + 한자 카드 6개 (셔플)
// 사용자가 순서대로 한자를 어휘 슬롯에 매칭
// 정답: 슬롯 인덱스와 카드 한자 일치
// 부분 정답 시 시각적 힌트 (해당 한자만 색상 변경)
```

### 3.5 1일 1자 락
```js
// 로컬 자정(00:00) 기준 'YYYY-MM-DD' 키
// 락 해제 조건: 오늘 날짜 != daily.date
// 자정 직전 시작 시 미완료 어휘는 다음날 SRL 큐로 이월
```

## 4. 외부 API

### 4.1 Web Speech API (TTS)
- `lang: 'ko-KR'`, `rate: 0.85`, 한자 단독 발화 시 `rate: 0.7`
- `voiceschanged` 이벤트로 한국어 음성 비동기 로딩
- 미지원 브라우저: 설정에서 토글 비활성화 + 안내 메시지

### 4.2 Notification API
- 권한 요청은 사용자 인터랙션(설정 화면 토글)에서만
- 일일 알림: PWA Service Worker `setTimeout` (백그라운드 한계 인정)
- 권한 거부 시: 인앱 배지로 우회

### 4.3 IndexedDB / Dexie
- 트랜잭션 단위는 의미 단위(예: "어휘 학습 완료" = words insert + srl insert + daily update)
- Private Browsing에서 IndexedDB 실패 시 in-memory 폴백 (세션 한정)

### 4.4 Service Worker
- precache: 핵심 JS/CSS, 한자 서브셋 폰트, hanja/words JSON
- runtime cache: TTS 음성(시스템), 외부 폰트 CDN
- 업데이트: `skipWaiting` + `clients.claim`로 즉시 갱신

## 5. 렌더링 전략

### 5.1 나무 (SVG)
- 가지: `<path>` Bézier curve, `stroke-dasharray` 애니메이션으로 성장 표현
- 잎: `<g>` 그룹 (hit zone 확보), 클릭 시 모달
- 거대 트리(어휘 400+) 시 **viewport culling**: IntersectionObserver로 화면 밖 가지 `display: none`

### 5.2 잎 파티클 (Canvas 2D)
- 새 잎 생성 시 5~10개 파티클 (꽃잎 효과)
- 별도 Canvas 레이어, `requestAnimationFrame` 30fps로 충분

### 5.3 카메라 변환
```js
// 자체 affine matrix [a, b, c, d, e, f]
// SVG에는 root <g transform="matrix(...)">, Canvas에는 ctx.setTransform()
// 핀치줌: 두 포인터 거리 비율 → scale, 중점 기준 zoom
// 팬: 단일 포인터 이동량 → tx/ty
// 미니맵 클릭: 정규화 좌표 → 카메라 중심 보간
```

### 5.4 DOM 업데이트
- 잎 추가는 SVG `appendChild` 단발 (재렌더 없음)
- 가지 성장은 CSS transition (`stroke-dashoffset`)
- 학부모 대시보드는 `requestIdleCallback`으로 차트 지연 렌더

## 6. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 초기 로드 | hanja/words를 학년군별 JSON으로 분할 → lazy import |
| 폰트 | 한자 서브셋 임베드, `font-display: swap` |
| SVG 노드 | 누적 잎 400+ 시 viewport culling 필수 |
| Canvas 파티클 | 동시 파티클 ≤ 50개 cap |
| 카메라 변환 | `transform` matrix만 변경, 리렌더 회피 |
| IndexedDB | 인덱스 활용(`dueAt`, `hanjaId`) — 풀스캔 금지 |
| TTS | 큐에 누적 시 `cancel()` 후 새 utterance |
| 메모리 | tree culling 시 DOM 노드 풀 재활용 |

## 7. 보안 / 개인정보

- 사용자 입력 폼 없음 → XSS 표면 작음
- 어휘 의미 텍스트는 정적 데이터 → `textContent`로 일관 처리
- 학부모 대시보드 PIN: 단방향 해시(SHA-256, salt 디바이스 ID) 후 IndexedDB 저장
- 외부 전송 없음 — 모든 분석은 디바이스 내
- Service Worker는 동일 origin 자원만 캐시
- 알림 권한·마이크 등 민감 권한은 명시적 인터랙션 후에만 요청

## 8. 테스트 전략

### 수동 테스트 체크리스트 (기준)
- [ ] iOS Safari 15+ 핀치줌·팬 정상 동작 (preventDefault 처리)
- [ ] Android Chrome 100+ 자성 스냅 동작
- [ ] 4어휘 달성 → 락 화면 진입 + 추가 입력 차단
- [ ] 자정 경과 → 락 해제, SRL 큐에 어제 미완료 이월
- [ ] 오답 → 미니퀴즈 등장 → 정답 시 SRL 간격 0.5배
- [ ] IndexedDB 미지원 (Private Browsing) → in-memory 폴백 동작
- [ ] TTS 미지원 → 토글 비활성화 + 안내
- [ ] 알림 권한 거부 → 인앱 배지로 우회
- [ ] PWA 설치 → 홈 화면 진입 → 오프라인 첫 실행 가능
- [ ] 학부모 대시보드 PIN 3회 오류 → 일정 시간 잠금
- [ ] 누적 어휘 400+ 시 60fps 유지 (viewport culling 검증)
- [ ] 학술 어휘 보스: 부분 매칭 시 시각 힌트
- [ ] 한자 폰트 미로딩 시 본문 폰트 폴백 (`font-display: swap`)
- [ ] 단일 한자 단독 학습 시 TTS rate 0.7 적용

### 디바이스 매트릭스
- iPhone SE (작은 화면), iPhone 15 (Dynamic Island), iPad mini
- Android: Galaxy A (저사양), Pixel 7 (표준)
- 데스크톱: 보조 환경 검증만

### 자동화 (추후)
- Vitest + jsdom: `nextInterval`, `stageFor`, `getChosung`, 자성 스냅 거리 계산 유닛 테스트
- Playwright: 일일 학습 1자 4어휘 풀 시나리오 + 락 진입
- 1주일 누적 시뮬레이션: SRL 큐 정확성 (시간 mock)

## 9. 배포

| 옵션 | 명령 |
|---|---|
| 로컬 개발 | `npx serve -p 4325` |
| GitHub Pages | `gh-pages` 브랜치 푸시 |
| Netlify / Vercel / Cloudflare Pages | 정적 업로드 |
| PWA 설치 | manifest + Service Worker 자동 인식 |

빌드 단계 없음 — 루트 디렉터리 그대로 업로드. Service Worker만 캐시 버스팅을 위해 빌드 시각/버전 해시 갱신 필요.

## 10. 홈·설정·완료 화면 디자인 시스템

시작 화면(`splash`, `today` 진입 전), 설정 화면, 일일 완료 화면(`lock-screen`)은 `1_chosung_quiz` 의 디자인 시스템을 계승한다. 아래 수치는 `1_chosung_quiz/src/css/screens.css` · `components.css` 의 실제 값이다.

### 폰트

| 요소 | 규격 |
|---|---|
| 폰트 로드 | `<link>` Google Fonts — `Jua`, `Gowun Dodum` (1단계와 동일) |
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·부제목·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 섹션 레이블 (설정) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |

### 버튼

| 요소 | 규격 |
|---|---|
| 버튼 레이블 폰트 | `font-family: 'Jua', sans-serif; letter-spacing: 0.5px` |
| 버튼 기본 (`.btn`) | `font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 기본 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 효과 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |

### 색상·레이아웃

| 요소 | 규격 |
|---|---|
| 색상 변수 출처 | `1_chosung_quiz/src/css/tokens.css` (`--coral #FF7757`, `--navy #2D3047`, `--cream #FFF6E4`, `--mint #6BCAB8`, `--yellow #FFD166`) |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 레이아웃 | 수직 중앙 정렬, 카드형 컨테이너 (`lock-screen` 포함) |

> 나무 성장 화면·학부모 대시보드 등 게임 고유 화면은 이 게임 특성에 맞게 확장 가능하다.  
> 시작·설정·완료 화면만 위 규격을 의무 준수한다.
