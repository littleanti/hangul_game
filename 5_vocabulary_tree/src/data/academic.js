// 학술 어휘 분해 데이터 — 보스 스테이지용
// 각 항목: id, text(어휘), breakdown[{ code, hun, eum, meaning }], meaning(전체 의미), subject(교과), grade
// breakdown은 어휘를 한자 단위로 분해한 순서 배열. UI에서 카드 셔플 → 슬롯 매칭에 사용.

export const ACADEMIC = [
  // ===== 수학 =====
  {
    id: 'a01',
    text: '삼각형',
    breakdown: [
      { code: '三', hun: '석',   eum: '삼', meaning: '셋' },
      { code: '角', hun: '뿔',   eum: '각', meaning: '모서리' },
      { code: '形', hun: '모양', eum: '형', meaning: '모양' },
    ],
    meaning: '세 모서리가 있는 모양',
    subject: 'math',
    grade: '3',
  },
  {
    id: 'a02',
    text: '사각형',
    breakdown: [
      { code: '四', hun: '넉',   eum: '사', meaning: '넷' },
      { code: '角', hun: '뿔',   eum: '각', meaning: '모서리' },
      { code: '形', hun: '모양', eum: '형', meaning: '모양' },
    ],
    meaning: '네 모서리가 있는 모양',
    subject: 'math',
    grade: '3',
  },
  {
    id: 'a03',
    text: '직각',
    breakdown: [
      { code: '直', hun: '곧을', eum: '직', meaning: '곧음' },
      { code: '角', hun: '뿔',   eum: '각', meaning: '모서리' },
    ],
    meaning: '곧게 꺾인 모서리(90도)',
    subject: 'math',
    grade: '3',
  },
  {
    id: 'a04',
    text: '이등변삼각형',
    breakdown: [
      { code: '二', hun: '두',   eum: '이', meaning: '둘' },
      { code: '等', hun: '같을', eum: '등', meaning: '같음' },
      { code: '邊', hun: '변',   eum: '변', meaning: '가장자리(변)' },
      { code: '三', hun: '석',   eum: '삼', meaning: '셋' },
      { code: '角', hun: '뿔',   eum: '각', meaning: '모서리' },
      { code: '形', hun: '모양', eum: '형', meaning: '모양' },
    ],
    meaning: '두 변의 길이가 같은 삼각형',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a05',
    text: '평행사변형',
    breakdown: [
      { code: '平', hun: '평평할', eum: '평', meaning: '나란함' },
      { code: '行', hun: '갈',     eum: '행', meaning: '나아감' },
      { code: '四', hun: '넉',     eum: '사', meaning: '넷' },
      { code: '邊', hun: '변',     eum: '변', meaning: '변' },
      { code: '形', hun: '모양',   eum: '형', meaning: '모양' },
    ],
    meaning: '마주 보는 변이 나란한 사각형',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a06',
    text: '분수',
    breakdown: [
      { code: '分', hun: '나눌', eum: '분', meaning: '나눔' },
      { code: '數', hun: '셈',   eum: '수', meaning: '수' },
    ],
    meaning: '전체를 나눠 표현한 수',
    subject: 'math',
    grade: '3',
  },
  {
    id: 'a07',
    text: '정수',
    breakdown: [
      { code: '整', hun: '가지런할', eum: '정', meaning: '완전함' },
      { code: '數', hun: '셈',       eum: '수', meaning: '수' },
    ],
    meaning: '0, 1, -1처럼 완전히 떨어지는 수',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a08',
    text: '약수',
    breakdown: [
      { code: '約', hun: '맺을', eum: '약', meaning: '약속(나눠떨어짐)' },
      { code: '數', hun: '셈',   eum: '수', meaning: '수' },
    ],
    meaning: '어떤 수를 나누어떨어지게 하는 수',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a09',
    text: '배수',
    breakdown: [
      { code: '倍', hun: '곱',   eum: '배', meaning: '곱함' },
      { code: '數', hun: '셈',   eum: '수', meaning: '수' },
    ],
    meaning: '어떤 수를 몇 배 곱한 수',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a10',
    text: '면적',
    breakdown: [
      { code: '面', hun: '낯',   eum: '면', meaning: '면' },
      { code: '積', hun: '쌓을', eum: '적', meaning: '쌓음' },
    ],
    meaning: '평평한 면의 넓이',
    subject: 'math',
    grade: '4',
  },
  {
    id: 'a11',
    text: '도형',
    breakdown: [
      { code: '圖', hun: '그림', eum: '도', meaning: '그림' },
      { code: '形', hun: '모양', eum: '형', meaning: '모양' },
    ],
    meaning: '점·선·면으로 만든 그림 모양',
    subject: 'math',
    grade: '3',
  },
  {
    id: 'a12',
    text: '시간',
    breakdown: [
      { code: '時', hun: '때',   eum: '시', meaning: '때' },
      { code: '間', hun: '사이', eum: '간', meaning: '사이' },
    ],
    meaning: '때와 때 사이',
    subject: 'math',
    grade: '3',
  },

  // ===== 과학 =====
  {
    id: 'a13',
    text: '화산',
    breakdown: [
      { code: '火', hun: '불', eum: '화', meaning: '불' },
      { code: '山', hun: '메', eum: '산', meaning: '산' },
    ],
    meaning: '불(마그마)을 내뿜는 산',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a14',
    text: '지진',
    breakdown: [
      { code: '地', hun: '땅',   eum: '지', meaning: '땅' },
      { code: '震', hun: '흔들', eum: '진', meaning: '흔들림' },
    ],
    meaning: '땅이 흔들리는 현상',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a15',
    text: '식물',
    breakdown: [
      { code: '植', hun: '심을', eum: '식', meaning: '심음' },
      { code: '物', hun: '물건', eum: '물', meaning: '생명' },
    ],
    meaning: '땅에 뿌리내려 자라는 생명',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a16',
    text: '동물',
    breakdown: [
      { code: '動', hun: '움직일', eum: '동', meaning: '움직임' },
      { code: '物', hun: '물건',   eum: '물', meaning: '생명' },
    ],
    meaning: '움직이며 살아가는 생명',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a17',
    text: '광물',
    breakdown: [
      { code: '鑛', hun: '쇳돌', eum: '광', meaning: '쇳돌' },
      { code: '物', hun: '물건', eum: '물', meaning: '물질' },
    ],
    meaning: '땅 속에서 캐내는 쇳돌·돌멩이',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a18',
    text: '액체',
    breakdown: [
      { code: '液', hun: '진', eum: '액', meaning: '흐르는 것' },
      { code: '體', hun: '몸', eum: '체', meaning: '상태' },
    ],
    meaning: '흐르는 상태 (물·우유 등)',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a19',
    text: '고체',
    breakdown: [
      { code: '固', hun: '굳을', eum: '고', meaning: '굳음' },
      { code: '體', hun: '몸',   eum: '체', meaning: '상태' },
    ],
    meaning: '굳어 있는 상태 (얼음·돌 등)',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a20',
    text: '기체',
    breakdown: [
      { code: '氣', hun: '기운', eum: '기', meaning: '공기' },
      { code: '體', hun: '몸',   eum: '체', meaning: '상태' },
    ],
    meaning: '공기처럼 떠다니는 상태',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a21',
    text: '용액',
    breakdown: [
      { code: '溶', hun: '녹을', eum: '용', meaning: '녹음' },
      { code: '液', hun: '진',   eum: '액', meaning: '액체' },
    ],
    meaning: '무언가가 녹아 있는 액체',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a22',
    text: '용해',
    breakdown: [
      { code: '溶', hun: '녹을', eum: '용', meaning: '녹음' },
      { code: '解', hun: '풀',   eum: '해', meaning: '풀어짐' },
    ],
    meaning: '녹아서 풀려 섞이는 것',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a23',
    text: '지구',
    breakdown: [
      { code: '地', hun: '땅', eum: '지', meaning: '땅' },
      { code: '球', hun: '공', eum: '구', meaning: '공' },
    ],
    meaning: '우리가 사는 둥근 땅(공 모양 행성)',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a24',
    text: '태양',
    breakdown: [
      { code: '太', hun: '클',   eum: '태', meaning: '큼' },
      { code: '陽', hun: '볕',   eum: '양', meaning: '햇빛' },
    ],
    meaning: '큰 햇빛을 내는 별 (해)',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a25',
    text: '우주',
    breakdown: [
      { code: '宇', hun: '집',   eum: '우', meaning: '공간' },
      { code: '宙', hun: '집',   eum: '주', meaning: '시간' },
    ],
    meaning: '모든 별이 들어 있는 큰 공간',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a26',
    text: '행성',
    breakdown: [
      { code: '行', hun: '갈', eum: '행', meaning: '돎' },
      { code: '星', hun: '별', eum: '성', meaning: '별' },
    ],
    meaning: '별 주위를 도는 별 (지구·화성 등)',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a27',
    text: '호흡',
    breakdown: [
      { code: '呼', hun: '부를',   eum: '호', meaning: '내쉼' },
      { code: '吸', hun: '마실',   eum: '흡', meaning: '들이쉼' },
    ],
    meaning: '숨을 내쉬고 들이쉬는 일',
    subject: 'science',
    grade: '4',
  },
  {
    id: 'a28',
    text: '운동',
    breakdown: [
      { code: '運', hun: '옮길',   eum: '운', meaning: '움직임' },
      { code: '動', hun: '움직일', eum: '동', meaning: '활동' },
    ],
    meaning: '몸이나 물체가 움직이는 것',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a29',
    text: '자연',
    breakdown: [
      { code: '自', hun: '스스로', eum: '자', meaning: '스스로' },
      { code: '然', hun: '그러할', eum: '연', meaning: '그러함' },
    ],
    meaning: '저절로 그러한 모든 것 (산·물·생명)',
    subject: 'science',
    grade: '3',
  },
  {
    id: 'a30',
    text: '환경',
    breakdown: [
      { code: '環', hun: '고리', eum: '환', meaning: '둘레' },
      { code: '境', hun: '지경', eum: '경', meaning: '경계' },
    ],
    meaning: '우리를 둘러싼 둘레의 모든 것',
    subject: 'science',
    grade: '4',
  },
];

export const ACADEMIC_BY_ID = new Map(ACADEMIC.map(a => [a.id, a]));
