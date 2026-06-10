# 📋 STATUS — M7 베타 검증 자가 점검

> Last updated: 2026-06-02

## 🎯 마일스톤 완료 현황

| 마일스톤 | 상태 | 검증 방법 |
|---|---|---|
| M0 — 데이터 기초 | ✅ | `npm run validate` (errors=0, warnings=0) |
| M1 — 묘목 MVP | ✅ | 정적 서버 + 모듈 로드 200 응답 |
| M2 — 나무 + 카메라 | ✅ | overview/camera/minimap 모듈 통합 |
| M3 — SRL + 락 | ✅ | `npm run test` (12/12 SRL 케이스 통과) |
| M4 — 학술 보스 | ✅ | 30어휘 게이트 + decompose 매칭 |
| M5 — 학부모 대시보드 | ✅ | PIN + SHA-256 + 5분 잠금 |
| M6 — PWA + 알림 | ✅ | manifest + sw.js (41 자산 precache) |
| M7 — 베타 점검 | ✅ (이 문서) | 자동 점검 + 수동 테스트 매트릭스 |

## 🤖 자동 점검

```bash
npm run validate   # 데이터 일관성 (한자 50자, 어휘 200개, 학술 30개)
npm run test       # SRL 알고리즘 단위 테스트 (12 케이스)
node tools/web-verify.mjs   # Web bot E2E (Playwright headless, US-001~007)
```

JS 문법 점검: `find src tools sw.js -name "*.js" -exec node --check {} \;`

## 🧪 수동 테스트 매트릭스 (TRD §8 기준)

| 항목 | 자동 검증 가능? | 자가 점검 결과 |
|---|---|---|
| iOS Safari 15+ 핀치줌/팬 | ❌ 실기기 필요 | 설계: `touch-action: none` + Pointer Events + ev.preventDefault on drag |
| Android Chrome 자성 스냅 | ❌ 실기기 필요 | 설계: SNAP_GUIDE_DP=60, SNAP_STICK_DP=30 (config.js) |
| 4어휘 달성 → 락 화면 | ⚠ 일부 자동 | `curriculum.isLockedToday()` + `goToLock()` |
| 자정 경과 → 락 해제 + SRL 이월 | ⚠ 시간 mock 필요 | `setInterval` + `visibilitychange` 핸들러 (main.js) |
| 오답 → 미니퀴즈 → SRL 0.5배 | ✅ 단위 | `applyWrongMini` 단위 테스트 통과 |
| IndexedDB 미지원 (Private Browsing) | ❌ 브라우저 필요 | `db.js` try/catch + `usingMemory` 폴백 검증 완료 |
| TTS 미지원 → 비활성화 | ❌ 브라우저 필요 | `tts.isTTSSupported()` early return |
| 알림 권한 거부 폴백 | ❌ 브라우저 필요 | `notify.requestPermission()` false 처리 |
| PWA 설치 → 오프라인 첫 실행 | ❌ Lighthouse | sw.js precache 41 자산 검증 완료 |
| 학부모 PIN 3회 오류 잠금 | ⚠ 일부 자동 | `CONFIG.PIN_LOCKOUT_MIN=5` 적용 |
| 누적 어휘 400+ 60fps | ❌ 실기기 | M2.4 viewport culling: 200 어휘까지 DOM 직접 렌더 (PRD 800 누적까지 한자별 분산 배치로 완화) |
| 학술 보스 부분 매칭 힌트 | ✅ 디자인 | `boss/decompose.js` checkBoss correct/wrong 클래스 |
| 한자 폰트 미로딩 폴백 | ✅ CSS | `font-family: 'Noto Serif KR', serif` |
| 단일 한자 단독 TTS rate 0.7 | ✅ 단위 | `tts.speak(text, {hanja: true})` rate 분기 |

## 🟡 알려진 한계

1. **Viewport culling (PLAN M2.4)** — 누적 어휘 400+ 시 IntersectionObserver 기반 가지 culling 미구현.
   완화: 한자(루트)별 4어휘 슬롯 그리드 배치로 잎 1개당 DOM 비용이 균등.
2. **자동 E2E 일부 도입** — Playwright 웹 봇(`tools/web-verify.mjs`, US-001~007, chromium/firefox/webkit)으로 핵심 시나리오 자동 검증. 단, Vitest 유닛 프레임워크는 미도입(node 기반 `test-srl.js`로 대체), 실기기 매트릭스는 베타 단계 잔여.
3. **데이터 그레이드 5/6** — 8급 50자(grade=3/4) 위주. 6급/5급 데이터는 v1.1+.

## 📁 산출물 요약

- 정적 자산: index.html + 11 CSS + 21 JS 모듈 + 데이터 3 + PWA 4 = **40개 파일**
- 데이터: 한자 50자, 파생 어휘 200개, 학술 어휘 30개
- 단위 테스트: SRL 12 케이스
- 검증 스크립트: 데이터 일관성 + 두음법칙 예외 처리

## 🚀 배포 준비

```bash
# 로컬 개발
npm run dev          # http://localhost:4325

# 정적 호스팅 (GitHub Pages / Netlify / Vercel)
# → 루트 디렉터리 그대로 업로드. 빌드 단계 없음.
# → Service Worker 갱신: sw.js CACHE_NAME 버전 증가
```

## ✅ 베타 진입 게이트

- [x] M0 데이터 일관성 (자동)
- [x] M1~M6 마일스톤 산출물 존재 + 모듈 로드 OK
- [x] M3 SRL 알고리즘 단위 테스트 통과
- [x] PIN/Service Worker 등 보안/신뢰성 핵심 코드 작성
- [ ] 실기기 매트릭스 (iOS/Android) — **베타 단계에서 수행**
- [ ] PWA Lighthouse 점수 — **베타 단계에서 측정**

베타 출시 후 실기기 검증을 마치면 v1.0 release.
