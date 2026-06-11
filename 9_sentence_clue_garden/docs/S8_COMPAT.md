# S8 어휘 호환성 검토 메모

> M1 데이터 작성 시 검토 (2026-06-11) | 관련: PRD §9.1, PLAN "S8 핸드오프", 오픈 이슈 I1·R2

## 검토 결과

| 항목 | 결과 |
|---|---|
| 어휘 출처 | S9 전 항목(52개)의 `answer`·`choices` 어휘가 `8_vocabulary_tree/src/data/{words,hanja,academic}.js`의 `text` 필드(총 398어휘)에 **전수 포함**됨을 스크립트로 확인 (누락 0건). 신규 어휘 없음 |
| ID 체계 | S8은 숫자 ID(`hanjaId` 기반 4자리, 예: `5501` = 力·노력). S9는 **문장 단위** 데이터이므로 어휘 ID를 직접 참조하지 않고 어휘 **문자열(text)** 로 연계한다. S9 문제 ID는 자체 체계 `scg_NNN` 사용 (PRD I1의 임시 체계에 해당 — S8 어휘 ID 체계 확정 시 `answer`에 S8 word id를 병기하는 필드 추가로 마이그레이션 가능) |
| 난이도 매핑 | S8 `grade: '3'` 수준 고빈도 어휘(생활·가족·학교) → S9 easy. S8 `grade: '4'` 어휘 → S9 medium. 추상도 높은 어휘(성질·본능·조화·공평 등 5~6급 한자 파생어) → S9 hard. S9 난이도는 어휘 자체 + **문맥 추론 부하**(단서와 빈칸의 거리, 근접 distractor 변별)로 결정 |
| distractor 중복 | S8 distractor와 S9 distractor의 어휘 중복은 **허용**으로 결정. 두 게임 모두 동일 어휘 풀(S8 800어휘권) 안에서 출제하는 것이 학습 연속성 원칙(신규 어휘 없음)에 부합하기 때문. S9 distractor는 형태소 공유형(발명/발견/발표, 불안/불만/불편 등)을 우선 사용해 S8의 한자 형태소 분해 학습을 재활성화 |
| 음뜻 라벨 | `hint.level1.label`은 S8 hanja.js의 훈·음 표기 관례(`훈 음(漢)`)를 따름. 예: `힘 력(力) — 힘을 다해 애씀` |

## 재검증 방법

```bash
node tools/validate-sentences.mjs   # 스키마·빈칸·길이·highlight·난이도 분포 검사
```

S8 어휘 포함 여부는 S8 데이터의 `text:` 값 목록과 S9 `answer`/`choices`를 대조하면 된다(M1에서 1회 수행, 누락 0건).
