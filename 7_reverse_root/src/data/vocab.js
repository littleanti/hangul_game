// vocab.js — 역분해 어휘 세트 (M1 본 구현, TRD §3.2)
// 스키마: { word, components[2], hanja, distractors[2~3], difficulty(1|2|3) }
// PRD §7.2 초기 설계 세트 15개 기준 — 모든 한자 ID는 hanja.js 키이자
// 6_morpheme_detective 100자 풀 내 한자여야 한다 (신규 한자 0 원칙).
//
// ⚠ PRD §7.2 대비 교체 4건 (6_morpheme_detective 100자 풀 밖 한자 포함 항목):
//   국어(國語) → 국민(國民)   — 語 풀 밖
//   도로(道路) → 학교(學校)   — 路 풀 밖
//   소방(消防) → 시장(市場)   — 消·防 풀 밖
//   인구(人口) → 전화(電話)   — 口 풀 밖
//   (PLAN.md 리스크·오픈 이슈 R1 해결 주석 참조)
//
// distractors 주석 표기: [음독] 음독 유사 / [의미] 의미 근접 / [무관] 무관 기지 한자
// difficulty: 1 = 8급 기지 위주 5개, 2 = 보통 5개, 3 = 의미 근접·음독 혼동 디스트랙터 강화 5개
//   (config.ROUND_COUNTS_PER_LEVEL = [5,5,5] 과 1:1 대응)

export const VOCAB = [
  // ── difficulty 1 (8급 기지 한자 위주) ────────────────────────────
  {
    word: '화산',
    components: ['火', '山'],
    hanja: '火山',
    distractors: ['話', '土', '水'], // 話:[음독] 화 / 土:[의미] 흙~산 / 水:[무관]
    difficulty: 1,
  },
  {
    word: '산수',
    components: ['山', '水'],
    hanja: '山水',
    distractors: ['手', '江', '木'], // 手:[음독] 수 / 江:[의미] 강~물 / 木:[무관]
    difficulty: 1,
  },
  {
    word: '부모',
    components: ['父', '母'],
    hanja: '父母',
    distractors: ['不', '女', '金'], // 不:[음독] 부 / 女:[의미] 여자~어머니 / 金:[무관]
    difficulty: 1,
  },
  {
    word: '일월',
    components: ['日', '月'],
    hanja: '日月',
    distractors: ['一', '年', '白'], // 一:[음독] 일 / 年:[의미] 해(시간) / 白:[무관]
    difficulty: 1,
  },
  {
    word: '대문',
    components: ['大', '門'],
    hanja: '大門',
    distractors: ['小', '家', '五'], // 小:[의미] 크다↔작다 / 家:[의미] 집~문 / 五:[무관]
    difficulty: 1,
  },

  // ── difficulty 2 (보통) ──────────────────────────────────────────
  {
    word: '수문',
    components: ['水', '門'],
    hanja: '水門',
    distractors: ['手', '海', '道'], // 手:[음독] 수 / 海:[의미] 바다~물 / 道:[무관]
    difficulty: 2,
  },
  {
    word: '강산',
    components: ['江', '山'],
    hanja: '江山',
    distractors: ['海', '土', '車'], // 海:[의미] 바다~강 / 土:[의미] 흙~산 / 車:[무관]
    difficulty: 2,
  },
  {
    word: '형제',
    components: ['兄', '弟'],
    hanja: '兄弟',
    distractors: ['父', '子', '東'], // 父:[의미] 가족 / 子:[의미] 아들~아우 / 東:[무관]
    difficulty: 2,
  },
  {
    word: '남녀',
    components: ['男', '女'],
    hanja: '男女',
    distractors: ['南', '母', '車'], // 南:[음독] 남 / 母:[의미] 어머니~여자 / 車:[무관]
    difficulty: 2,
  },
  {
    word: '학교',
    components: ['學', '校'],
    hanja: '學校',
    distractors: ['教', '室', '萬'], // 教:[음독] 교(자형도 유사) / 室:[의미] 방~교실 / 萬:[무관]
    difficulty: 2,
  },

  // ── difficulty 3 (의미 근접·음독 혼동 강화) ──────────────────────
  {
    word: '동물',
    components: ['動', '物'],
    hanja: '動物',
    distractors: ['東', '事', '金'], // 東:[음독] 동 / 事:[의미] 일·것~물건 / 金:[무관]
    difficulty: 3,
  },
  {
    word: '교실',
    components: ['教', '室'],
    hanja: '教室',
    distractors: ['校', '家', '水'], // 校:[음독] 교(자형도 유사) / 家:[의미] 집~방 / 水:[무관]
    difficulty: 3,
  },
  {
    word: '국민', // PRD '국어(國語)' 교체 — 語 가 100자 풀 밖
    components: ['國', '民'],
    hanja: '國民',
    distractors: ['韓', '人', '木'], // 韓:[의미] 한국~나라 / 人:[의미] 사람~백성 / 木:[무관]
    difficulty: 3,
  },
  {
    word: '시장', // PRD '소방(消防)' 교체 — 消·防 이 100자 풀 밖
    components: ['市', '場'],
    hanja: '市場',
    distractors: ['時', '長', '物'], // 時:[음독] 시 / 長:[음독] 장 / 物:[의미] 물건~시장
    difficulty: 3,
  },
  {
    word: '전화', // PRD '인구(人口)' 교체 — 口 가 100자 풀 밖
    components: ['電', '話'],
    hanja: '電話',
    distractors: ['全', '火', '答'], // 全:[음독] 전 / 火:[음독] 화 / 答:[의미] 대답~말씀
    difficulty: 3,
  },
];
// 참고: PRD '도로(道路)' 는 路 가 100자 풀 밖이라 '학교(學校)' 로 교체 (difficulty 2 구간).
