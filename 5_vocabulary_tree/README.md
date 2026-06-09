> [!IMPORTANT]
> **이 저장소는 [`hangul_game`](https://github.com/littleanti/hangul_game) 모노레포로 통합되었습니다.**
> 앞으로 모든 개발·유지보수는 모노레포에서 진행되며, 이 저장소는 보관(archive)용입니다.
> 🎮 통합 플레이 사이트: https://littleanti.github.io/hangul_game/

# 어휘력 세계수 (Vocabulary Tree)

> 한자 한 글자가 키워내는 어휘 나무. 1일 1자 4어휘로 인지 과부하 없이 어휘력을 키우는 모바일·태블릿 우선 학습 게임.

5단계 한국어 학습 게임 시리즈 중 5단계. 형태소 인식 보유 학습자를 대상으로 한자(형태소) 1개를 뿌리로 둔 어휘 나무를 키우며 학술 어휘 분해 능력을 길러낸다.

## 빠른 시작

```bash
npm run dev
# → http://localhost:4325
```

빌드 도구 없음. 정적 파일 그대로 서빙.

## 핵심 메커니즘

- **1일 1자 4어휘 락**: 4어휘 달성 시 추가 학습 차단 (과학습 방지)
- **음절 블록 드래그**: 떠다니는 음절 → 가지에 자성 스냅
- **어휘 잎**: 정답 시 가지 자라기 + 잎 페이드인 + 의미·예문·TTS
- **SRL (SM-2 변형)**: 1·3·7·14·30일 간격 반복
- **나무 성장 단계**: sapling → young → mature → world (누적 어휘 0/30/120/400)
- **학술 어휘 보스**: 누적 30어휘 도달 시 다형태소 어휘 분해
- **학부모 대시보드**: PIN 보호, SHA-256 + salt
- **PWA 오프라인**: Service Worker precache + 일일 알림

## 디렉터리 구조

```
src/
├── css/        # tokens.css, base.css, tree.css, blocks.css, modal.css, ...
├── data/       # hanja.js, words.js, academic.js
└── js/
    ├── main.js, config.js, state.js, db.js, srl.js, curriculum.js
    ├── tree/   # render, grow, leaves, camera
    ├── blocks/ # spawn, drag, match
    ├── boss/   # decompose
    ├── ui/     # modal, dashboard, lock
    ├── tts.js, notify.js, utils.js
tools/          # validate-data.js
sw.js           # Service Worker (PWA)
manifest.webmanifest
```

## 데이터 검증

```bash
npm run validate
```

한자 ↔ 어휘 ID 일관성, 학년 태그, 의미 누락 등을 자동 점검.

## 디자인 시스템

`1_chosung_quiz`의 토큰을 계승. 시작·설정·완료 화면은 시리즈 공통 폰트(`Jua`, `Gowun Dodum`) + 코랄 컬러 팔레트.

## 문서

- [docs/PRD.md](docs/PRD.md) — 제품 요구사항
- [docs/TRD.md](docs/TRD.md) — 기술 설계
- [docs/PLAN.md](docs/PLAN.md) — 마일스톤
- [docs/STATUS.md](docs/STATUS.md) — M7 베타 진입 자가 점검
- [AGENTS.md](AGENTS.md) — AI 에이전트 가이드

## 라이선스

MIT
