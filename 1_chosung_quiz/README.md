> [!IMPORTANT]
> **이 저장소는 [`hangul_game`](https://github.com/littleanti/hangul_game) 모노레포로 통합되었습니다.**
> 앞으로 모든 개발·유지보수는 모노레포에서 진행되며, 이 저장소는 보관(archive)용입니다.
> 🎮 통합 플레이 사이트: https://littleanti.github.io/hangul_game/

# 🎨 초성 퀴즈 (Chosung Quiz)

그림을 보고 한글 초성 힌트로 단어를 맞히는 웹 기반 한글 공부 게임입니다.

![version](https://img.shields.io/badge/version-2.3.0-FF7757)
![license](https://img.shields.io/badge/license-MIT-6BCAB8)

## 🎮 주요 기능

- **🌱🌿🌳 레벨 선택**: 시작 화면에서 단어 길이 기반으로 레벨 1/2/3 즉시 선택
- **👤 다중 프로필**: 최대 8개 프로필 생성, 프로필별 설정 독립 저장
- **✕ 게임 중단**: 플레이 중 언제든 "그만" 버튼으로 중단 → 현재까지 결과 표시
- **🎯 카테고리 선택**: 과일 / 동물 / 탈것 / 음식 / 자연 / 채소 / 스포츠 / 악기 (복수 선택)
- **📏 난이도 조절**: 쉬움(1-2글자) / 보통(3글자) / 어려움(4글자+)
- **🎲 문제 수 선택**: 5 / 10 / 20 문제
- **⏱ 타이머 모드**: 끄기 / 5초 / 10초 / 15초
- **🔊 TTS 발음 듣기**: 정답 공개 시 단어 읽어주기 (Web Speech API)
- **🖼 사진 모드**: 이모지 대신 실제 이미지 표시 (선택, 일부 단어에 이미지 포함)
- **⌨️ 글자 선택 모드**: 섞인 초성 버튼 중 정답 글자를 순서대로 선택
- **💡 힌트 버튼**: 게임 중 글자를 한 개씩 확인 (설정에서 끄기 가능)
- **🎵 사운드 피드백**: 정답/오답 효과음 (Web Audio API, 외부 파일 없음)
- **📝 틀린 문제 복습**: 종료 화면에서 오답 리스트 확인 + 발음 듣기
- **💾 설정 자동 저장**: 프로필별 localStorage 저장
- **📱 가로 모드 적응형 레이아웃**: 가로 화면에서 자동으로 카드/입력영역 2컬럼 전환, viewport 비례 사이즈 (모바일~태블릿)

## 🚀 빠른 시작

### 1. 로컬 개발 서버 실행

ES Modules를 사용하므로 `file://`로 열면 CORS 오류가 납니다. 반드시 로컬 서버로 실행해주세요.

**방법 1: npm script (권장)**
```bash
npm run dev
# → http://localhost:4321
```

**방법 2: VSCode Live Server 확장**
1. VSCode에서 Live Server 확장 설치
2. `index.html` 우클릭 → "Open with Live Server"

**방법 3: Python 기본 서버**
```bash
python3 -m http.server 4321
```

### 2. 브라우저에서 열기

- `http://localhost:4321`

### 3. 게임 시작

1. 시작 화면에서 **레벨 1 / 2 / 3** 중 하나를 선택합니다
   - 🌱 레벨 1 — 1-2글자 (귤, 별, 배 등)
   - 🌿 레벨 2 — 3글자 (사과, 딸기, 강아지 등)
   - 🌳 레벨 3 — 4글자+ (자동차, 코끼리, 헬리콥터 등)
2. 그림과 초성 힌트를 보고 단어를 떠올립니다
3. **정답 확인** 버튼으로 정답을 공개한 후 맞혔는지 선택합니다
4. 게임 도중 그만두려면 화면 상단 **✕ 그만** 버튼을 누릅니다
5. 세부 설정(카테고리, 타이머 등)은 **⚙️ 세부 설정**에서 조정할 수 있습니다

## 📁 프로젝트 구조

```
chosung-quiz/
├── index.html                  # 진입 HTML
├── package.json                # 개발 서버 스크립트
├── README.md                   # 이 파일
├── .gitignore
├── .vscode/                    # VSCode 설정
│   ├── settings.json
│   └── extensions.json
├── docs/                       # 기획 문서
│   ├── PRD.md                  # 제품 요구사항
│   ├── TRD.md                  # 기술 요구사항
│   └── PLAN.md                 # 개발 계획
└── src/
    ├── css/                    # 스타일
    │   ├── tokens.css          #   디자인 토큰 (변수)
    │   ├── base.css            #   리셋 + 레이아웃
    │   ├── components.css      #   재사용 컴포넌트
    │   └── screens.css         #   화면별 스타일
    ├── data/
    │   └── words.js            # 📚 단어 DB (여기 편집!)
    └── js/                     # 로직 모듈
        ├── main.js             #   진입점
        ├── config.js           #   상수
        ├── state.js            #   전역 상태
        ├── storage.js          #   localStorage
        ├── profiles.js         #   다중 프로필 관리
        ├── profile-ui.js       #   프로필 칩 + 모달 UI
        ├── utils.js            #   getChosung, shuffle
        ├── tts.js              #   Web Speech API
        ├── sound.js            #   Web Audio API 효과음
        ├── timer.js            #   카운트다운
        ├── ui.js               #   화면전환, 플래시
        ├── settings.js         #   설정 화면
        └── game.js             #   게임 로직
```

## 📚 단어 추가하기

단어를 추가/수정하려면 `src/data/words.js` 파일만 편집하면 됩니다.

```js
// 기본 (이모지 사용)
{ emoji: '🦄', word: '유니콘', category: '동물' },

// 실제 사진 사용 (설정에서 사진 모드 켜야 동작)
{
  emoji: '🦄',
  word: '유니콘',
  category: '동물',
  imageUrl: 'https://example.com/unicorn.jpg'
  // 이미지 로드 실패 시 emoji로 자동 폴백됩니다
},
```

카테고리를 추가하려면 `CATEGORIES` 배열에도 추가하세요.

## 🔧 아키텍처

### 화면 상태 머신
```
start ──→ play ──→ end
  │        ↑        │
  ↓        │        ↓
settings ──┘    (다시하기)
```

### 핵심 데이터 흐름
```
WORDS (data/words.js)
  ↓ 카테고리 필터
  ↓ 난이도 필터
  ↓ 셔플 + slice(questionCount)
state.game.questions
  ↓
문제 표시 → getChosung() → 초성 힌트
  ↓
revealAnswer() → 전체 단어 + TTS 발음
  ↓
markAnswer(correct) → 점수 기록 or 오답 기록
  ↓ 반복
endGame() → 복습 리스트
```

### 한글 초성 추출 원리

한글 유니코드 범위: `가(0xAC00) ~ 힣(0xD7A3)`

```js
초성_인덱스 = Math.floor((코드 - 0xAC00) / 588)
// 588 = 21(중성) × 28(종성)
```

예: `사(0xC0AC)` → `(0xC0AC - 0xAC00) / 588 = 9` → `CHOSUNG[9] = 'ㅅ'`

## 🎨 디자인 시스템

색상은 `src/css/tokens.css`에서 CSS 변수로 관리됩니다.

| 용도 | 변수 | 색상 |
|---|---|---|
| 배경 | `--cream` | `#FFF6E4` |
| 주요 강조 | `--coral` | `#FF7757` |
| 성공/진행 | `--mint` | `#6BCAB8` |
| 경고/하이라이트 | `--yellow` | `#FFD166` |
| 오답 | `--red` | `#E84545` |
| 텍스트 | `--navy` | `#2D3047` |

폰트: `Jua` (제목), `Gowun Dodum` (본문)

## 🌐 브라우저 호환성

| 기능 | 요구사항 |
|---|---|
| ES Modules | Chrome 61+, Firefox 60+, Safari 11+ |
| Web Speech API (TTS) | Chrome, Safari, Edge (Firefox는 음성 제한적) |
| Web Audio API (효과음) | Chrome, Firefox, Safari, Edge |
| localStorage | 모든 현대 브라우저 |

TTS 미지원 브라우저에서는 설정에서 자동 비활성화됩니다.

## 🛠 확장 아이디어

- 맞힌 단어 도감 (수집 요소)
- 멀티플레이어 (같은 문제를 둘이 풀기)
- JSON 파일 업로드로 단어 커스터마이징
- 난이도 자동 조절 (연속 정답 시 상향)

## 📄 라이선스

MIT
