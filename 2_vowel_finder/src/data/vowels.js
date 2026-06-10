/**
 * 모음 데이터 + Level 0 문항 풀 (TRD §3.1)
 * 순수 데이터 — 의존성 없음
 */

// id: 내부 식별자 (localStorage 키에도 사용)
// char: 모음 자소 (한글 낱자)
// sound: TTS 발화 텍스트 (단독 발음)
// shape: 'vertical' | 'horizontal' (세로모음 / 가로모음)
//   vertical   — 기본 획이 세로(ㅣ)로 뻗고 자음 오른쪽에 결합 (예: ㅏ+ㄱ=가)
//   horizontal — 기본 획이 가로(ㅡ)로 뻗고 자음 아래쪽에 결합 (예: ㅗ+ㄱ=고)
// order: 교육 자료 기준 제시 순서 (Level 0 풀 구성에 활용)
export const VOWELS = [
  { id: 'a',   char: 'ㅏ', sound: '아', shape: 'vertical',   order: 1 },
  { id: 'ya',  char: 'ㅑ', sound: '야', shape: 'vertical',   order: 2 },
  { id: 'eo',  char: 'ㅓ', sound: '어', shape: 'vertical',   order: 3 },
  { id: 'yeo', char: 'ㅕ', sound: '여', shape: 'vertical',   order: 4 },
  { id: 'o',   char: 'ㅗ', sound: '오', shape: 'horizontal', order: 5 },
  { id: 'yo',  char: 'ㅛ', sound: '요', shape: 'horizontal', order: 6 },
  { id: 'u',   char: 'ㅜ', sound: '우', shape: 'horizontal', order: 7 },
  { id: 'yu',  char: 'ㅠ', sound: '유', shape: 'horizontal', order: 8 },
  { id: 'eu',  char: 'ㅡ', sound: '으', shape: 'horizontal', order: 9 },
  { id: 'i',   char: 'ㅣ', sound: '이', shape: 'vertical',   order: 10 },
];

// Level 0 문항 풀: { answer: VowelId, distractors: VowelId[] }
// 오답은 발음 유사 또는 형태 유사 기준으로 수동 큐레이션
// 게임 시작 시 셔플하여 vowelCount개 추출 — 같은 세션 내 정답 중복 없음 (TRD §9.1)
export const LEVEL0_ROUNDS = [
  { answer: 'a',   distractors: ['eo', 'o', 'u']   },
  { answer: 'i',   distractors: ['eu', 'a', 'eo']  },
  { answer: 'o',   distractors: ['yo', 'u', 'yu']  },
  { answer: 'ya',  distractors: ['a', 'yeo', 'eo'] },
  { answer: 'eu',  distractors: ['i', 'o', 'u']    },
  { answer: 'eo',  distractors: ['a', 'yeo', 'o']  },
  { answer: 'yo',  distractors: ['o', 'yu', 'u']   },
  { answer: 'u',   distractors: ['o', 'yu', 'eu']  },
  { answer: 'yeo', distractors: ['eo', 'ya', 'a']  },
  { answer: 'yu',  distractors: ['u', 'yo', 'o']   },
];

/** id → Vowel 객체 빠른 조회 맵 */
export const VOWEL_BY_ID = Object.fromEntries(VOWELS.map(v => [v.id, v]));
