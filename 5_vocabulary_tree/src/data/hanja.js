// 한자 마스터 — 3·4학년 중간 난이도 (7급~6급 중심 + 5급 소수)
// 4_morpheme_detective(8급·7급II) + 6_literacy_decoder(6급·5급) 혼합.
// 너무 쉬운 8급 기초자(숫자 一~十, 人女子寸, 兄弟, 上下, 東西南北, 門長白)는 제외.
// 각 항목: id, code(유니코드), 훈(뜻), 음(소리), level(급수 8/7/6/5), 부수, 획수, 학년 태그(3/4)
// 주의: 기존 학습 데이터 호환을 위해 잔존 한자의 id는 보존(삭제분 id는 결번).

export const HANJA = [
  // ── 8급 유지분 (고빈도 기초자 25) ───────────────────────────
  // 자연
  { id: 11, code: '日', hun: '날',     eum: '일', level: 8, radical: '日', strokes: 4,  grade: '3' },
  { id: 12, code: '月', hun: '달',     eum: '월', level: 8, radical: '月', strokes: 4,  grade: '3' },
  { id: 13, code: '火', hun: '불',     eum: '화', level: 8, radical: '火', strokes: 4,  grade: '3' },
  { id: 14, code: '水', hun: '물',     eum: '수', level: 8, radical: '水', strokes: 4,  grade: '3' },
  { id: 15, code: '木', hun: '나무',   eum: '목', level: 8, radical: '木', strokes: 4,  grade: '3' },
  { id: 16, code: '金', hun: '쇠',     eum: '금', level: 8, radical: '金', strokes: 8,  grade: '3' },
  { id: 17, code: '土', hun: '흙',     eum: '토', level: 8, radical: '土', strokes: 3,  grade: '3' },
  { id: 18, code: '山', hun: '메',     eum: '산', level: 8, radical: '山', strokes: 3,  grade: '3' },

  // 크기
  { id: 19, code: '中', hun: '가운데', eum: '중', level: 8, radical: '丨', strokes: 4,  grade: '3' },
  { id: 20, code: '大', hun: '큰',     eum: '대', level: 8, radical: '大', strokes: 3,  grade: '3' },
  { id: 21, code: '小', hun: '작을',   eum: '소', level: 8, radical: '小', strokes: 3,  grade: '3' },

  // 가족
  { id: 28, code: '父', hun: '아비',   eum: '부', level: 8, radical: '父', strokes: 4,  grade: '3' },
  { id: 29, code: '母', hun: '어미',   eum: '모', level: 8, radical: '毋', strokes: 5,  grade: '3' },

  // 학교 / 시간
  { id: 36, code: '學', hun: '배울',   eum: '학', level: 8, radical: '子', strokes: 16, grade: '3' },
  { id: 37, code: '校', hun: '학교',   eum: '교', level: 8, radical: '木', strokes: 10, grade: '3' },
  { id: 38, code: '敎', hun: '가르칠', eum: '교', level: 8, radical: '攴', strokes: 11, grade: '3' },
  { id: 39, code: '室', hun: '집',     eum: '실', level: 8, radical: '宀', strokes: 9,  grade: '3' },
  { id: 40, code: '生', hun: '날',     eum: '생', level: 8, radical: '生', strokes: 5,  grade: '3' },
  { id: 41, code: '年', hun: '해',     eum: '년', level: 8, radical: '干', strokes: 6,  grade: '3' },
  { id: 42, code: '先', hun: '먼저',   eum: '선', level: 8, radical: '儿', strokes: 6,  grade: '3' },

  // 나라
  { id: 43, code: '韓', hun: '한국',   eum: '한', level: 8, radical: '韋', strokes: 17, grade: '3' },
  { id: 44, code: '國', hun: '나라',   eum: '국', level: 8, radical: '囗', strokes: 11, grade: '3' },
  { id: 45, code: '民', hun: '백성',   eum: '민', level: 8, radical: '氏', strokes: 5,  grade: '4' },
  { id: 46, code: '軍', hun: '군사',   eum: '군', level: 8, radical: '車', strokes: 9,  grade: '4' },
  { id: 47, code: '王', hun: '임금',   eum: '왕', level: 8, radical: '玉', strokes: 4,  grade: '3' },

  // ── 7급II 50자 (id 51~100) — 중간 난이도 핵심 ───────────────
  // 교통 / 장소
  { id: 51,  code: '車', hun: '수레',   eum: '차', level: 7, radical: '車', strokes: 7,  grade: '4' },
  { id: 52,  code: '場', hun: '마당',   eum: '장', level: 7, radical: '土', strokes: 12, grade: '4' },
  { id: 53,  code: '道', hun: '길',     eum: '도', level: 7, radical: '辶', strokes: 13, grade: '4' },
  { id: 54,  code: '動', hun: '움직일', eum: '동', level: 7, radical: '力', strokes: 11, grade: '4' },
  { id: 55,  code: '力', hun: '힘',     eum: '력', level: 7, radical: '力', strokes: 2,  grade: '4' },
  { id: 56,  code: '立', hun: '설',     eum: '립', level: 7, radical: '立', strokes: 5,  grade: '4' },
  { id: 57,  code: '方', hun: '모',     eum: '방', level: 7, radical: '方', strokes: 4,  grade: '4' },
  { id: 58,  code: '自', hun: '스스로', eum: '자', level: 7, radical: '自', strokes: 6,  grade: '4' },
  { id: 59,  code: '全', hun: '온전할', eum: '전', level: 7, radical: '入', strokes: 6,  grade: '4' },
  { id: 60,  code: '工', hun: '장인',   eum: '공', level: 7, radical: '工', strokes: 3,  grade: '4' },

  // 사람 / 가족
  { id: 61,  code: '家', hun: '집',     eum: '가', level: 7, radical: '宀', strokes: 10, grade: '4' },
  { id: 62,  code: '男', hun: '사내',   eum: '남', level: 7, radical: '田', strokes: 7,  grade: '4' },
  { id: 63,  code: '姓', hun: '성씨',   eum: '성', level: 7, radical: '女', strokes: 8,  grade: '4' },
  { id: 64,  code: '名', hun: '이름',   eum: '명', level: 7, radical: '口', strokes: 6,  grade: '4' },
  { id: 65,  code: '孝', hun: '효도',   eum: '효', level: 7, radical: '子', strokes: 7,  grade: '4' },
  { id: 66,  code: '食', hun: '먹을',   eum: '식', level: 7, radical: '食', strokes: 9,  grade: '4' },
  { id: 67,  code: '手', hun: '손',     eum: '수', level: 7, radical: '手', strokes: 4,  grade: '4' },

  // 상태 / 성질
  { id: 68,  code: '安', hun: '편안할', eum: '안', level: 7, radical: '宀', strokes: 6,  grade: '4' },
  { id: 69,  code: '答', hun: '대답할', eum: '답', level: 7, radical: '竹', strokes: 12, grade: '4' },
  { id: 70,  code: '事', hun: '일',     eum: '사', level: 7, radical: '亅', strokes: 8,  grade: '4' },
  { id: 71,  code: '右', hun: '오른쪽', eum: '우', level: 7, radical: '口', strokes: 5,  grade: '4' },
  { id: 72,  code: '左', hun: '왼쪽',   eum: '좌', level: 7, radical: '工', strokes: 5,  grade: '4' },
  { id: 73,  code: '直', hun: '곧을',   eum: '직', level: 7, radical: '目', strokes: 8,  grade: '4' },
  { id: 74,  code: '正', hun: '바를',   eum: '정', level: 7, radical: '止', strokes: 5,  grade: '4' },
  { id: 75,  code: '不', hun: '아닐',   eum: '불', level: 7, radical: '一', strokes: 4,  grade: '4' },
  { id: 76,  code: '平', hun: '평평할', eum: '평', level: 7, radical: '干', strokes: 5,  grade: '4' },
  { id: 77,  code: '後', hun: '뒤',     eum: '후', level: 7, radical: '彳', strokes: 9,  grade: '4' },

  // 자연 / 지리
  { id: 78,  code: '江', hun: '강',     eum: '강', level: 7, radical: '水', strokes: 6,  grade: '4' },
  { id: 79,  code: '海', hun: '바다',   eum: '해', level: 7, radical: '水', strokes: 10, grade: '4' },
  { id: 80,  code: '漢', hun: '한수',   eum: '한', level: 7, radical: '水', strokes: 14, grade: '4' },
  { id: 81,  code: '萬', hun: '일만',   eum: '만', level: 7, radical: '艸', strokes: 13, grade: '4' },
  { id: 82,  code: '農', hun: '농사',   eum: '농', level: 7, radical: '辰', strokes: 13, grade: '4' },
  { id: 83,  code: '市', hun: '저자',   eum: '시', level: 7, radical: '巾', strokes: 5,  grade: '4' },
  { id: 84,  code: '物', hun: '물건',   eum: '물', level: 7, radical: '牛', strokes: 8,  grade: '4' },

  // 시간
  { id: 85,  code: '每', hun: '매양',   eum: '매', level: 7, radical: '毋', strokes: 7,  grade: '4' },
  { id: 86,  code: '世', hun: '세상',   eum: '세', level: 7, radical: '一', strokes: 5,  grade: '4' },
  { id: 87,  code: '間', hun: '사이',   eum: '간', level: 7, radical: '門', strokes: 12, grade: '4' },
  { id: 88,  code: '時', hun: '때',     eum: '시', level: 7, radical: '日', strokes: 10, grade: '4' },
  { id: 89,  code: '午', hun: '낮',     eum: '오', level: 7, radical: '十', strokes: 4,  grade: '4' },
  { id: 90,  code: '前', hun: '앞',     eum: '전', level: 7, radical: '刀', strokes: 9,  grade: '4' },
  { id: 91,  code: '內', hun: '안',     eum: '내', level: 7, radical: '入', strokes: 4,  grade: '4' },

  // 자연 현상
  { id: 92,  code: '氣', hun: '기운',   eum: '기', level: 7, radical: '气', strokes: 10, grade: '4' },
  { id: 93,  code: '空', hun: '빌',     eum: '공', level: 7, radical: '穴', strokes: 8,  grade: '4' },
  { id: 94,  code: '靑', hun: '푸를',   eum: '청', level: 7, radical: '靑', strokes: 8,  grade: '4' },

  // 생활
  { id: 95,  code: '外', hun: '바깥',   eum: '외', level: 7, radical: '夕', strokes: 5,  grade: '4' },
  { id: 96,  code: '電', hun: '번개',   eum: '전', level: 7, radical: '雨', strokes: 13, grade: '4' },
  { id: 97,  code: '話', hun: '말씀',   eum: '화', level: 7, radical: '言', strokes: 13, grade: '4' },
  { id: 98,  code: '記', hun: '기록할', eum: '기', level: 7, radical: '言', strokes: 10, grade: '4' },
  { id: 99,  code: '活', hun: '살',     eum: '활', level: 7, radical: '水', strokes: 9,  grade: '4' },
  { id: 100, code: '足', hun: '발',     eum: '족', level: 7, radical: '足', strokes: 7,  grade: '4' },

  // ── 6급 (id 101~117) — 6_literacy_decoder 출처, 중간 난이도 핵심 ──
  { id: 101, code: '戰', hun: '싸움',   eum: '전', level: 6, radical: '戈', strokes: 16, grade: '4' },
  { id: 102, code: '作', hun: '지을',   eum: '작', level: 6, radical: '人', strokes: 7,  grade: '4' },
  { id: 103, code: '發', hun: '필',     eum: '발', level: 6, radical: '癶', strokes: 12, grade: '4' },
  { id: 104, code: '表', hun: '겉',     eum: '표', level: 6, radical: '衣', strokes: 8,  grade: '4' },
  { id: 105, code: '會', hun: '모일',   eum: '회', level: 6, radical: '曰', strokes: 13, grade: '4' },
  { id: 106, code: '光', hun: '빛',     eum: '광', level: 6, radical: '儿', strokes: 6,  grade: '4' },
  { id: 107, code: '線', hun: '줄',     eum: '선', level: 6, radical: '糸', strokes: 15, grade: '4' },
  { id: 108, code: '行', hun: '다닐',   eum: '행', level: 6, radical: '行', strokes: 6,  grade: '4' },
  { id: 109, code: '向', hun: '향할',   eum: '향', level: 6, radical: '口', strokes: 6,  grade: '4' },
  { id: 110, code: '習', hun: '익힐',   eum: '습', level: 6, radical: '羽', strokes: 11, grade: '4' },
  { id: 111, code: '消', hun: '사라질', eum: '소', level: 6, radical: '水', strokes: 10, grade: '4' },
  { id: 112, code: '感', hun: '느낄',   eum: '감', level: 6, radical: '心', strokes: 13, grade: '4' },
  { id: 113, code: '樂', hun: '노래',   eum: '악', level: 6, radical: '木', strokes: 15, grade: '4' },
  { id: 114, code: '音', hun: '소리',   eum: '음', level: 6, radical: '音', strokes: 9,  grade: '4' },
  { id: 115, code: '和', hun: '화할',   eum: '화', level: 6, radical: '口', strokes: 8,  grade: '4' },
  { id: 116, code: '野', hun: '들',     eum: '야', level: 6, radical: '里', strokes: 11, grade: '4' },
  { id: 117, code: '對', hun: '마주할', eum: '대', level: 6, radical: '寸', strokes: 14, grade: '4' },

  // ── 5급 소수 (id 118~125) — 도전 한자 ──────────────────────
  { id: 118, code: '知', hun: '알',     eum: '지', level: 5, radical: '矢', strokes: 8,  grade: '4' },
  { id: 119, code: '能', hun: '능할',   eum: '능', level: 5, radical: '肉', strokes: 10, grade: '4' },
  { id: 120, code: '種', hun: '씨',     eum: '종', level: 5, radical: '禾', strokes: 14, grade: '4' },
  { id: 121, code: '爭', hun: '다툴',   eum: '쟁', level: 5, radical: '爪', strokes: 8,  grade: '4' },
  { id: 122, code: '質', hun: '바탕',   eum: '질', level: 5, radical: '貝', strokes: 15, grade: '4' },
  { id: 123, code: '敬', hun: '공경',   eum: '경', level: 5, radical: '攴', strokes: 13, grade: '4' },
  { id: 124, code: '練', hun: '익힐',   eum: '련', level: 5, radical: '糸', strokes: 15, grade: '4' },
  { id: 125, code: '馬', hun: '말',     eum: '마', level: 5, radical: '馬', strokes: 10, grade: '4' },
];

// 빠른 lookup
export const HANJA_BY_ID = new Map(HANJA.map(h => [h.id, h]));
export const HANJA_BY_CODE = new Map(HANJA.map(h => [h.code, h]));

export function getHanja(idOrCode) {
  if (typeof idOrCode === 'number') return HANJA_BY_ID.get(idOrCode);
  return HANJA_BY_CODE.get(idOrCode);
}
