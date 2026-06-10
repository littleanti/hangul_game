// 스테이지(사건) 메타 — TRD §2.1 data/stages.js
//
// 10 사건 × 10 한자 = 100자 (한국어문회 7·8급 100자, hanja.js 와 1:1 대응).
//
// clickableObjects[].polygon 은 viewBox 1600×900 안에서 2행×5열 grid 자리값
// (placeholder). SVG 일러스트가 다듬어지는 시점에 객체 위치에 맞춰 손으로 조정.
// `gridPoly(idx)` 헬퍼는 객체 10개를 균등 분포 사각형으로 깔아준다.

// ── grid placeholder polygon ──────────────────────────────────────
// 객체 인덱스(0~9) → 2행 × 5열, viewBox 1600×900
const GRID_CELL_W = 240;
const GRID_CELL_H = 260;
const GRID_START_X = 90;
const GRID_START_Y = 90;
const GRID_GAP_X = 295;
const GRID_GAP_Y = 410;

function gridPoly(idx) {
  const row = Math.floor(idx / 5);
  const col = idx % 5;
  const x = GRID_START_X + col * GRID_GAP_X;
  const y = GRID_START_Y + row * GRID_GAP_Y;
  return [
    [x,                  y],
    [x + GRID_CELL_W,    y],
    [x + GRID_CELL_W,    y + GRID_CELL_H],
    [x,                  y + GRID_CELL_H],
  ];
}

// ── stage 빌더: 객체 10개를 grid 자리에 균등 분배 ──────────────────
//
// entries: [{ word, hanjaId, syllableIdx, label }] 길이 10
//   word        — 카드/단어블록에 표시할 한국어 어휘
//   hanjaId     — 어휘 안 핵심 한자
//   syllableIdx — 어휘에서 한자가 차지하는 음절 인덱스
//   label       — 일러스트 객체 설명 (a11y)
function buildStage(meta, entries) {
  const clickableObjects = entries.map((e, i) => ({
    id:      `obj-${meta.id}-${i}`,
    wordId:  `${meta.id}-${i}`,
    label:   e.label,
    polygon: gridPoly(i),
  }));
  const words = {};
  entries.forEach((e, i) => {
    words[`${meta.id}-${i}`] = {
      text:              e.word,
      syllables:         [...e.word],
      targetSyllableIdx: e.syllableIdx,
      targetHanjaId:     e.hanjaId,
    };
  });
  return {
    id:               meta.id,
    name:             meta.name,
    description:      meta.description,
    illustrationSrc:  meta.illustrationSrc,
    viewBox:          '0 0 1600 900',
    hanjaIds:         entries.map(e => e.hanjaId),
    clickableObjects,
    words,
  };
}

export const STAGES = {
  // ── 1. 🅿️ 주차장 (7급II 10자) ──────────────────────────────────
  'parking-lot': buildStage(
    {
      id:              'parking-lot',
      name:            '🅿️ 주차장 사건',
      description:     '주차장에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/parking-lot.svg',
    },
    [
      { word: '자동차',  hanjaId: '車', syllableIdx: 2, label: '자동차' },
      { word: '주차장',  hanjaId: '場', syllableIdx: 2, label: '주차장 표지판' },
      { word: '차도',    hanjaId: '道', syllableIdx: 1, label: '차도 표시' },
      { word: '운동',    hanjaId: '動', syllableIdx: 1, label: '운동하는 사람' },
      { word: '동력',    hanjaId: '力', syllableIdx: 1, label: '전기차 충전기' },
      { word: '국립',    hanjaId: '立', syllableIdx: 1, label: '국립공원 안내' },
      { word: '방향',    hanjaId: '方', syllableIdx: 0, label: '방향 안내판' },
      { word: '자전거',  hanjaId: '自', syllableIdx: 0, label: '자전거' },
      { word: '안전',    hanjaId: '全', syllableIdx: 1, label: '안전 표지' },
      { word: '공사',    hanjaId: '工', syllableIdx: 0, label: '공사 표시' },
    ],
  ),

  // ── 2. 🏫 학교 교실 (8급 10자) ─────────────────────────────────
  'classroom': buildStage(
    {
      id:              'classroom',
      name:            '🏫 학교 교실',
      description:     '교실에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/classroom.svg',
    },
    [
      { word: '교과서',  hanjaId: '教', syllableIdx: 0, label: '교과서' },
      { word: '등교',    hanjaId: '校', syllableIdx: 1, label: '등교 표지' },
      { word: '학생',    hanjaId: '學', syllableIdx: 0, label: '학생' },
      { word: '인생',    hanjaId: '生', syllableIdx: 1, label: '생활 안내' },
      { word: '화장실',  hanjaId: '室', syllableIdx: 2, label: '화장실 표지' },
      { word: '선생',    hanjaId: '先', syllableIdx: 0, label: '선생님' },
      { word: '형님',    hanjaId: '兄', syllableIdx: 0, label: '형 사진' },
      { word: '제자',    hanjaId: '弟', syllableIdx: 0, label: '제자 명찰' },
      { word: '국기',    hanjaId: '國', syllableIdx: 0, label: '국기' },
      { word: '한글',    hanjaId: '韓', syllableIdx: 0, label: '한글 포스터' },
    ],
  ),

  // ── 3. 🏠 가족 집 (8급 5 + 7급II 5) ─────────────────────────────
  'family-home': buildStage(
    {
      id:              'family-home',
      name:            '🏠 가족 집',
      description:     '거실에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/family-home.svg',
    },
    [
      { word: '가족',    hanjaId: '家', syllableIdx: 0, label: '가족 사진' },
      { word: '부친',    hanjaId: '父', syllableIdx: 0, label: '아버지' },
      { word: '모국',    hanjaId: '母', syllableIdx: 0, label: '어머니' },
      { word: '남자',    hanjaId: '男', syllableIdx: 0, label: '남자아이' },
      { word: '여자',    hanjaId: '女', syllableIdx: 0, label: '여자아이' },
      { word: '자녀',    hanjaId: '子', syllableIdx: 0, label: '아이' },
      { word: '사촌',    hanjaId: '寸', syllableIdx: 1, label: '사촌 사진' },
      { word: '성명',    hanjaId: '姓', syllableIdx: 0, label: '문패' },
      { word: '별명',    hanjaId: '名', syllableIdx: 1, label: '별명 메모' },
      { word: '효도',    hanjaId: '孝', syllableIdx: 0, label: '효도 액자' },
    ],
  ),

  // ── 4. 🍽 학교 급식실 (기존 확장) ──────────────────────────────
  'school-cafeteria': buildStage(
    {
      id:              'school-cafeteria',
      name:            '🍽 학교 급식실',
      description:     '급식실에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/school-cafeteria.svg',
    },
    [
      { word: '식사',    hanjaId: '食', syllableIdx: 0, label: '식판' },
      { word: '식목일',  hanjaId: '木', syllableIdx: 1, label: '나무 탁자' },
      { word: '인기',    hanjaId: '人', syllableIdx: 0, label: '학생' },
      { word: '생수',    hanjaId: '水', syllableIdx: 1, label: '생수병' },
      { word: '박수',    hanjaId: '手', syllableIdx: 1, label: '손 그림' },
      { word: '안심',    hanjaId: '安', syllableIdx: 0, label: '안전 표지' },
      { word: '대답',    hanjaId: '答', syllableIdx: 1, label: '대답 칠판' },
      { word: '사실',    hanjaId: '事', syllableIdx: 0, label: '안내문' },
      { word: '우측',    hanjaId: '右', syllableIdx: 0, label: '우측 표지' },
      { word: '좌측',    hanjaId: '左', syllableIdx: 0, label: '좌측 표지' },
    ],
  ),

  // ── 5. 🚒 소방서 (기존 확장) ───────────────────────────────────
  'fire-station': buildStage(
    {
      id:              'fire-station',
      name:            '🚒 소방서 사건',
      description:     '소방서에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/fire-station.svg',
    },
    [
      { word: '화재',    hanjaId: '火', syllableIdx: 0, label: '불꽃' },
      { word: '군인',    hanjaId: '軍', syllableIdx: 0, label: '소방관' },
      { word: '시민',    hanjaId: '民', syllableIdx: 1, label: '시민 안내' },
      { word: '정직',    hanjaId: '直', syllableIdx: 1, label: '정직 표어' },
      { word: '정의',    hanjaId: '正', syllableIdx: 0, label: '정의 표어' },
      { word: '불안',    hanjaId: '不', syllableIdx: 0, label: '경보등' },
      { word: '평안',    hanjaId: '平', syllableIdx: 0, label: '평안 포스터' },
      { word: '옥상',    hanjaId: '上', syllableIdx: 1, label: '옥상' },
      { word: '지하',    hanjaId: '下', syllableIdx: 1, label: '지하실 안내' },
      { word: '오후',    hanjaId: '後', syllableIdx: 1, label: '시간표' },
    ],
  ),

  // ── 6. 💧 자연공원 (기존 약수터 확장) ────────────────────────────
  'nature-park': buildStage(
    {
      id:              'nature-park',
      name:            '🏞 자연공원',
      description:     '공원에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/nature-park.svg',
    },
    [
      { word: '등산',    hanjaId: '山', syllableIdx: 1, label: '산봉우리' },
      { word: '강물',    hanjaId: '江', syllableIdx: 0, label: '강' },
      { word: '해변',    hanjaId: '海', syllableIdx: 0, label: '바다' },
      { word: '한자',    hanjaId: '漢', syllableIdx: 0, label: '한자 비석' },
      { word: '만세',    hanjaId: '萬', syllableIdx: 0, label: '만세 동상' },
      { word: '집중',    hanjaId: '中', syllableIdx: 1, label: '안내문' },
      { word: '소형',    hanjaId: '小', syllableIdx: 0, label: '작은 새' },
      { word: '대형',    hanjaId: '大', syllableIdx: 0, label: '큰 나무' },
      { word: '토양',    hanjaId: '土', syllableIdx: 0, label: '흙더미' },
      { word: '농장',    hanjaId: '農', syllableIdx: 0, label: '농장' },
    ],
  ),

  // ── 7. 🛒 시장 ─────────────────────────────────────────────────
  'market': buildStage(
    {
      id:              'market',
      name:            '🛒 시장 사건',
      description:     '시장에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/market.svg',
    },
    [
      { word: '시장',    hanjaId: '市', syllableIdx: 0, label: '시장 간판' },
      { word: '사물',    hanjaId: '物', syllableIdx: 1, label: '물건들' },
      { word: '현금',    hanjaId: '金', syllableIdx: 1, label: '돈' },
      { word: '매일',    hanjaId: '每', syllableIdx: 0, label: '영업 안내' },
      { word: '세상',    hanjaId: '世', syllableIdx: 0, label: '광고판' },
      { word: '공간',    hanjaId: '間', syllableIdx: 1, label: '안내 간판' },
      { word: '시계',    hanjaId: '時', syllableIdx: 0, label: '시계' },
      { word: '오전',    hanjaId: '午', syllableIdx: 0, label: '시간 안내' },
      { word: '사전',    hanjaId: '前', syllableIdx: 1, label: '사전 책' },
      { word: '실내',    hanjaId: '內', syllableIdx: 1, label: '실내 표지' },
    ],
  ),

  // ── 8. 🌅 하늘·시간 ────────────────────────────────────────────
  'sky-time': buildStage(
    {
      id:              'sky-time',
      name:            '🌅 하늘과 시간',
      description:     '하늘에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/sky-time.svg',
    },
    [
      { word: '일출',    hanjaId: '日', syllableIdx: 0, label: '해' },
      { word: '달력',    hanjaId: '月', syllableIdx: 0, label: '달' },
      { word: '매년',    hanjaId: '年', syllableIdx: 1, label: '연도 포스터' },
      { word: '공기',    hanjaId: '氣', syllableIdx: 1, label: '구름' },
      { word: '공항',    hanjaId: '空', syllableIdx: 0, label: '비행기' },
      { word: '장남',    hanjaId: '長', syllableIdx: 0, label: '키 큰 사람' },
      { word: '청년',    hanjaId: '靑', syllableIdx: 0, label: '청년' },
      { word: '백색',    hanjaId: '白', syllableIdx: 0, label: '흰 구름' },
      { word: '서양',    hanjaId: '西', syllableIdx: 0, label: '서쪽 표지' },
      { word: '동쪽',    hanjaId: '東', syllableIdx: 0, label: '동쪽 표지' },
    ],
  ),

  // ── 9. 🛣 거리·외출 ────────────────────────────────────────────
  'street': buildStage(
    {
      id:              'street',
      name:            '🛣 거리 사건',
      description:     '거리에 숨겨진 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/street.svg',
    },
    [
      { word: '대문',    hanjaId: '門', syllableIdx: 1, label: '대문' },
      { word: '외출',    hanjaId: '外', syllableIdx: 0, label: '외출 표지' },
      { word: '전화',    hanjaId: '電', syllableIdx: 0, label: '공중전화' },
      { word: '대화',    hanjaId: '話', syllableIdx: 1, label: '말풍선' },
      { word: '기록',    hanjaId: '記', syllableIdx: 0, label: '기록 게시판' },
      { word: '생활',    hanjaId: '活', syllableIdx: 1, label: '생활 포스터' },
      { word: '왕자',    hanjaId: '王', syllableIdx: 0, label: '왕자 동상' },
      { word: '북쪽',    hanjaId: '北', syllableIdx: 0, label: '북쪽 표지' },
      { word: '남쪽',    hanjaId: '南', syllableIdx: 0, label: '남쪽 표지' },
      { word: '족발',    hanjaId: '足', syllableIdx: 0, label: '족발 간판' },
    ],
  ),

  // ── 10. 🔢 숫자·수업 (8급 10자) ────────────────────────────────
  'numbers-class': buildStage(
    {
      id:              'numbers-class',
      name:            '🔢 숫자 사건',
      description:     '숨겨진 숫자 한자를 찾아라!',
      illustrationSrc: 'src/assets/stages/numbers-class.svg',
    },
    [
      { word: '일등',     hanjaId: '一', syllableIdx: 0, label: '1등 깃발' },
      { word: '이등',     hanjaId: '二', syllableIdx: 0, label: '2등 깃발' },
      { word: '삼각형',   hanjaId: '三', syllableIdx: 0, label: '삼각형' },
      { word: '사월',     hanjaId: '四', syllableIdx: 0, label: '달력 4월' },
      { word: '오각형',   hanjaId: '五', syllableIdx: 0, label: '오각형' },
      { word: '유월',     hanjaId: '六', syllableIdx: 0, label: '달력 6월' },
      { word: '칠석',     hanjaId: '七', syllableIdx: 0, label: '7석 안내' },
      { word: '팔도',     hanjaId: '八', syllableIdx: 0, label: '팔도 지도' },
      { word: '구구단',   hanjaId: '九', syllableIdx: 0, label: '구구단 표' },
      { word: '시월',     hanjaId: '十', syllableIdx: 0, label: '달력 10월' },
    ],
  ),
};

export const STAGE_IDS = Object.keys(STAGES);
