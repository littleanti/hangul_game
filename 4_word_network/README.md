> [!IMPORTANT]
> **이 저장소는 [`hangul_game`](https://github.com/littleanti/hangul_game) 모노레포로 통합되었습니다.**
> 앞으로 모든 개발·유지보수는 모노레포에서 진행되며, 이 저장소는 보관(archive)용입니다.
> 🎮 통합 플레이 사이트: https://littleanti.github.io/hangul_game/

# 🌈 낱말 이어라 (Word Network)

장면 그림 속 사물을 보고, 음절 블록을 이어 순우리말 단어를 완성하는 웹 기반 한글 어휘 게임입니다.

![version](https://img.shields.io/badge/version-0.1.0-FF7757)
![license](https://img.shields.io/badge/license-MIT-6BCAB8)

## 🎮 주요 기능

- **🌱🌿🌳🔥 4단계 레벨**: 디코이 음절 개수에 따른 난이도 — 2개 / 3개 / 4개 / 커스텀
- **🖼 장면 일러스트**: 자연·동물·일상·행동·감정 카테고리의 30+ 장면 이미지
- **🎯 카테고리 필터**: 자연 / 동물 / 일상 사물 / 행동 / 감정 (복수 선택)
- **🗺 장면 수 선택**: 게임당 풀 장면 수 조정
- **🖱 드래그 앤 드롭**: Pointer Events API 기반 음절 블록 → 정답 슬롯 끌어다 놓기
- **👆 탭 모드**: 음절 블록 탭 → 다음 빈 슬롯 자동 배치
- **🔊 TTS 발음 듣기**: 정답 완성 시 단어 읽어주기 (Web Speech API, ko-KR)
- **🎵 사운드 피드백**: 정답/오답 효과음 (Web Audio API 오실레이터, 외부 파일 없음)
- **📳 햅틱 피드백**: `navigator.vibrate(20)` — 안드로이드 한정
- **✨ 정답 연출**: `celebrateSlots` 애니메이션 + 흔들기(`shakeSlots`) 오답 표시
- **💡 핫스팟 힌트**: 장면 속 단어 객체 위치를 좌표로 매핑 (탭 시 강조)
- **📱 세로 모드 우선**: 일러스트 + 음절 도크 수직 레이아웃, 56dp 터치 타겟
- **💾 설정 자동 저장**: 카테고리·레벨·장면 수 localStorage 저장

## 🚀 빠른 시작

### 1. 로컬 개발 서버 실행

ES Modules를 사용하므로 `file://`로 열면 CORS 오류가 납니다. 반드시 로컬 서버로 실행해주세요.

**방법 1: npm script (권장)**
```bash
npm run dev
# → http://localhost:4323
```

**방법 2: VSCode Live Server 확장**
1. VSCode에서 Live Server 확장 설치
2. `index.html` 우클릭 → "Open with Live Server"

**방법 3: Python 기본 서버**
```bash
python3 -m http.server 4323
```

### 2. 브라우저에서 열기

- `http://localhost:4323`

### 3. 게임 시작

1. 시작 화면에서 **레벨 1 / 2 / 3 / 4** 중 하나를 선택합니다
   - 🌱 레벨 1 — 디코이 음절 2개 (가장 쉬움)
   - 🌿 레벨 2 — 디코이 음절 3개
   - 🌳 레벨 3 — 디코이 음절 4개
   - 🔥 레벨 4 — 디코이 개수 커스텀 (설정에서 지정)
2. 장면 일러스트와 단어 슬롯을 확인합니다
3. 하단 음절 도크에서 필요한 음절을 **드래그하거나 탭**해 슬롯에 배치합니다
4. 슬롯이 모두 채워지면 자동 검증 — 정답이면 TTS 발음 + 효과음 + 햅틱
5. 장면 내 모든 단어를 완성하면 다음 장면으로 진행합니다
6. 세부 설정(카테고리, 장면 수 등)은 **⚙️ 설정**에서 조정할 수 있습니다

## 📁 프로젝트 구조

```
word-network/
├── index.html                  # 진입 HTML (start/settings/play/end)
├── package.json                # 개발 서버 스크립트
├── favicon.svg
├── README.md                   # 이 파일
├── AGENTS.md
├── assets/                     # 장면 일러스트 이미지
│   └── scenes/                 #   {sceneId}.jpg
├── docs/                       # 기획 문서
│   ├── PRD.md                  #   제품 요구사항
│   ├── TRD.md                  #   기술 요구사항
│   └── PLAN.md                 #   개발 계획
└── src/
    ├── css/                    # 스타일
    │   ├── tokens.css          #   디자인 토큰 (변수)
    │   ├── base.css            #   리셋 + 레이아웃
    │   ├── components.css      #   재사용 컴포넌트
    │   └── screens.css         #   화면별 스타일
    ├── data/
    │   ├── scenes.js           # 🗺 장면 메타데이터 (여기 편집!)
    │   └── words.js            # 📚 장면별 단어 DB (여기 편집!)
    └── js/                     # 로직 모듈
        ├── main.js             #   진입점 + 이벤트 바인딩
        ├── config.js           #   상수
        ├── state.js            #   전역 상태
        ├── storage.js          #   localStorage
        ├── utils.js            #   범용 유틸 (vibrate 포함)
        ├── tts.js              #   Web Speech API TTS
        ├── sound.js            #   Web Audio API 효과음
        ├── ui.js               #   화면전환, 플래시, 진척도
        ├── scene.js            #   장면 일러스트 렌더링
        ├── slot.js             #   정답 슬롯 (fillSlotAt/checkSlots)
        ├── syllable-dock.js    #   음절 블록 도크
        ├── dnd.js              #   드래그 앤 드롭 (Pointer Events)
        ├── settings.js         #   설정 화면
        └── game.js             #   게임 로직 (pickScenes/startGame)
```

## 📚 단어·장면 추가하기

### 장면 추가 — `src/data/scenes.js`

```js
{
  id: 'forest',
  name: '숲 속',
  emoji: '🌲',
  description: '초록 나무가 가득한 숲이에요.',
  category: '자연',
  bgEmojis: ['🌲', '🌳', '🍃', '🌱', '🍀'],
  bgColors: ['#c8e6c9', '#81c784'],
  bgImage: 'assets/scenes/forest.jpg',
},
```

### 단어 추가 — `src/data/words.js`

```js
{
  id: 'forest_tree',
  word: '나무',
  syllables: ['나', '무'],
  category: '자연',
  sceneId: 'forest',
  emoji: '🌳',
  hint: '숲에 있는 큰 식물',
  hotspot: { x: 0.30, y: 0.45, r: 0.15 }   // 장면 내 좌표 (0~1)
},
```

새 카테고리를 추가하려면 설정 화면 카테고리 칩 목록도 함께 갱신하세요. `hotspot` 좌표는 장면 일러스트 기준의 비율(0~1)로 지정합니다.

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
SCENES + WORDS_BY_SCENE (data/)
  ↓ 카테고리 필터
  ↓ 셔플 + slice(sceneCount)
state.game.scenes
  ↓
renderScene() → 장면 일러스트 + 핫스팟 객체
  ↓
buildDock() → 정답 음절 + 디코이 음절 셔플
  ↓
사용자 배치(드래그/탭) → fillSlotAt() → checkSlots()
  ↓
정답: celebrateSlots() → TTS + 효과음 + 햅틱 → markWordMatched()
오답: shakeSlots() → 효과음
  ↓ 장면 내 모든 단어 완성
다음 장면 → 반복
  ↓
endGame() → 결과 화면
```

### 드래그 컨트롤러 라이프사이클

드래그 리스너는 `initDrag()`에서 `AbortController`로 등록되며, `startGame()` 호출 시 항상 이전 컨트롤러를 `_dragController.abort()`로 정리합니다. 다시 시작·장면 전환 시 리스너 누수가 발생하지 않습니다.

### 핫스팟 좌표 변환

장면 일러스트는 반응형이므로 `hotspot.x/y/r`은 0~1 비율로 저장되고, 렌더 시 컨테이너 크기에 곱해 픽셀 좌표로 변환됩니다.

```js
left = hotspot.x * sceneWidth
top  = hotspot.y * sceneHeight
size = hotspot.r * Math.min(sceneWidth, sceneHeight)
```

## 🎨 디자인 시스템

색상은 `src/css/tokens.css`에서 CSS 변수로 관리됩니다. `1_chosung_quiz`의 디자인 시스템을 계승합니다.

| 용도 | 변수 | 색상 |
|---|---|---|
| 배경 | `--cream` | `#FFF6E4` |
| 주요 강조 | `--coral` | `#FF7757` |
| 성공/진행 | `--mint` | `#6BCAB8` |
| 경고/하이라이트 | `--yellow` | `#FFD166` |
| 오답 | `--red` | `#E84545` |
| 텍스트 | `--navy` | `#2D3047` |

폰트: `Jua` (제목·버튼), `Gowun Dodum` (본문)

## 🌐 브라우저 호환성

| 기능 | 요구사항 |
|---|---|
| ES Modules | Chrome 61+, Firefox 60+, Safari 11+ |
| Pointer Events API | Chrome 55+, Firefox 59+, Safari 13+ |
| Web Speech API (TTS) | Chrome, Safari, Edge (Firefox는 음성 제한적) |
| Web Audio API (효과음) | Chrome, Firefox, Safari, Edge |
| `navigator.vibrate` | Chrome/Android — iOS Safari 미지원 (정상 동작 시 무시) |
| localStorage | 모든 현대 브라우저 |

TTS 미지원 브라우저에서는 발음 듣기가 자동으로 비활성화됩니다.

## 🛠 확장 아이디어

- 단어 도감 (완성한 단어 수집 + 일러스트 갤러리)
- 장면 편집기 (이미지 업로드 + 핫스팟 좌표 GUI 지정)
- 학습자 진척도 그래프 (카테고리별 정답률)
- 멀티 프로필 지원 (`1_chosung_quiz` 와 동일 패턴)
- 한자어 도입 단계로의 자연스러운 연결 (`../4_morpheme_detective/`)

## 📄 라이선스

MIT © Wondeuk Yoon
