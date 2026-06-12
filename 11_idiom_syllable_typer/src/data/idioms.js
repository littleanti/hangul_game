/**
 * idioms.js — 사자성어 10개 콘텐츠 데이터 (순수 데이터, import 없음)
 *
 * S10(`10_literacy_decoder/src/data/idioms.js`)의 BOSS_IDIOMS 와 호환 구조.
 * `word`, `hanja`, `meaning`, `hint`, `contextStory` 필드는 S10 스키마와 동일하며,
 * `syllables` 배열은 S11 신규 필드다 (S10은 무시).
 *
 * distractors 규칙: 정답 음절과 초성 또는 중성(모음) 1자만 다른 유사 음절 4개.
 * 정답과 동일한 음절·배열 내 중복 금지.
 */

/**
 * @typedef {Object} IdiomEntry
 * @property {string}   word          - 한글 사자성어  예: "일석이조"
 * @property {string[]} hanja         - 한자 배열 (4개)  예: ["一","石","二","鳥"]
 * @property {string}   meaning       - 한 줄 의미  예: "두 가지 이득"
 * @property {string}   hint          - Lv.1 도크 툴팁용 어원 힌트
 * @property {string}   contextStory  - 어원 팝업용 짧은 일화 (1~2문장)
 * @property {SyllableEntry[]} syllables - 음절 분해 + 방해 음절
 */

/**
 * @typedef {Object} SyllableEntry
 * @property {string}   syllable      - 정답 음절  예: "일"
 * @property {string}   hanjaChar     - 해당 위치 한자  예: "一"
 * @property {string}   hanjaSound    - 한자 음  예: "일"
 * @property {string}   hanjaMeaning  - 한자 뜻  예: "하나"
 * @property {string[]} distractors   - 방해 음절 4개 (정답과 초성·모음 1자만 다름)
 */

/** @type {IdiomEntry[]} */
export const IDIOMS = [
  {
    word: "일석이조",
    hanja: ["一", "石", "二", "鳥"],
    meaning: "두 가지 이득",
    hint: "돌 하나로 새 두 마리를 잡아요",
    contextStory: "철수가 빨래를 널다가 떨어진 사과를 주웠어요. 마침 강아지가 그 사과 옆 공도 물어 왔답니다. 한 번에 두 가지 좋은 일이 생긴 거예요.",
    syllables: [
      { syllable: "일", hanjaChar: "一", hanjaSound: "일", hanjaMeaning: "하나", distractors: ["월", "알", "길", "밀"] },
      { syllable: "석", hanjaChar: "石", hanjaSound: "석", hanjaMeaning: "돌", distractors: ["삭", "숙", "적", "벅"] },
      { syllable: "이", hanjaChar: "二", hanjaSound: "이", hanjaMeaning: "둘", distractors: ["아", "어", "니", "리"] },
      { syllable: "조", hanjaChar: "鳥", hanjaSound: "조", hanjaMeaning: "새", distractors: ["도", "초", "주", "저"] },
    ],
  },
  {
    word: "이심전심",
    hanja: ["以", "心", "傳", "心"],
    meaning: "마음이 통함",
    hint: "말하지 않아도 서로 마음이 통해요",
    contextStory: "엄마와 딸이 동시에 같은 노래를 흥얼거렸어요. 말하지 않아도 마음이 통한 거랍니다.",
    syllables: [
      { syllable: "이", hanjaChar: "以", hanjaSound: "이", hanjaMeaning: "~로써", distractors: ["미", "기", "아", "의"] },
      { syllable: "심", hanjaChar: "心", hanjaSound: "심", hanjaMeaning: "마음", distractors: ["삼", "섬", "김", "님"] },
      { syllable: "전", hanjaChar: "傳", hanjaSound: "전", hanjaMeaning: "전할", distractors: ["천", "건", "잔", "준"] },
      { syllable: "심", hanjaChar: "心", hanjaSound: "심", hanjaMeaning: "마음", distractors: ["힘", "짐", "숨", "솜"] },
    ],
  },
  {
    word: "동문서답",
    hanja: ["東", "問", "西", "答"],
    meaning: "엉뚱한 대답",
    hint: "동쪽을 물었는데 서쪽으로 대답해요",
    contextStory: "철수가 영희에게 '오늘 점심 뭐 먹을래?'라고 물었더니, 영희는 '내일 비가 올 것 같아'라고 답했어요. 동쪽을 물었는데 엉뚱하게 서쪽을 대답한 셈이지요.",
    syllables: [
      { syllable: "동", hanjaChar: "東", hanjaSound: "동", hanjaMeaning: "동녘", distractors: ["통", "공", "둥", "당"] },
      { syllable: "문", hanjaChar: "問", hanjaSound: "문", hanjaMeaning: "물을", distractors: ["분", "눈", "먼", "몬"] },
      { syllable: "서", hanjaChar: "西", hanjaSound: "서", hanjaMeaning: "서녘", distractors: ["저", "너", "사", "수"] },
      { syllable: "답", hanjaChar: "答", hanjaSound: "답", hanjaMeaning: "대답할", distractors: ["탑", "갑", "덥", "돕"] },
    ],
  },
  {
    word: "오리무중",
    hanja: ["五", "里", "霧", "中"],
    meaning: "갈피를 못 잡음",
    hint: "짙은 안개 속에서 길을 잃었어요",
    contextStory: "산에서 길을 잃은 등산객은 사방이 짙은 안개로 가득해 어디로 가야 할지 알 수 없었어요.",
    syllables: [
      { syllable: "오", hanjaChar: "五", hanjaSound: "오", hanjaMeaning: "다섯", distractors: ["어", "우", "고", "노"] },
      { syllable: "리", hanjaChar: "里", hanjaSound: "리", hanjaMeaning: "마을", distractors: ["니", "미", "라", "루"] },
      { syllable: "무", hanjaChar: "霧", hanjaSound: "무", hanjaMeaning: "안개", distractors: ["부", "누", "모", "머"] },
      { syllable: "중", hanjaChar: "中", hanjaSound: "중", hanjaMeaning: "가운데", distractors: ["충", "둥", "장", "정"] },
    ],
  },
  {
    word: "일취월장",
    hanja: ["日", "就", "月", "將"],
    meaning: "날로 발전함",
    hint: "날마다 달마다 실력이 쑥쑥 자라요",
    contextStory: "민지는 매일 한 문제씩 푸는 습관을 들였더니, 한 달이 지나자 또래 친구들이 깜짝 놀랄 만큼 실력이 자랐어요.",
    syllables: [
      { syllable: "일", hanjaChar: "日", hanjaSound: "일", hanjaMeaning: "날", distractors: ["밀", "실", "열", "울"] },
      { syllable: "취", hanjaChar: "就", hanjaSound: "취", hanjaMeaning: "나아갈", distractors: ["치", "추", "귀", "쥐"] },
      { syllable: "월", hanjaChar: "月", hanjaSound: "월", hanjaMeaning: "달", distractors: ["궐", "왈", "열", "울"] },
      { syllable: "장", hanjaChar: "將", hanjaSound: "장", hanjaMeaning: "장차", distractors: ["창", "강", "정", "중"] },
    ],
  },
  {
    word: "청출어람",
    hanja: ["靑", "出", "於", "藍"],
    meaning: "제자가 스승보다 나음",
    hint: "쪽빛이 남빛보다 더 파래요",
    contextStory: "스승이 가르친 제자가, 어느덧 스승보다 더 깊은 색을 내는 그림을 그리게 되었어요.",
    syllables: [
      { syllable: "청", hanjaChar: "靑", hanjaSound: "청", hanjaMeaning: "푸를", distractors: ["정", "성", "창", "총"] },
      { syllable: "출", hanjaChar: "出", hanjaSound: "출", hanjaMeaning: "날(나갈)", distractors: ["줄", "굴", "촐", "철"] },
      { syllable: "어", hanjaChar: "於", hanjaSound: "어", hanjaMeaning: "어조사", distractors: ["아", "오", "너", "더"] },
      { syllable: "람", hanjaChar: "藍", hanjaSound: "람", hanjaMeaning: "쪽빛", distractors: ["남", "감", "럼", "롬"] },
    ],
  },
  {
    word: "천고마비",
    hanja: ["天", "高", "馬", "肥"],
    meaning: "가을 하늘과 살찐 말",
    hint: "하늘은 높고 말은 살이 쪄요",
    contextStory: "가을이 깊어지자 하늘은 한층 더 높아 보이고, 풀을 마음껏 먹은 말은 통통하게 살이 올랐어요.",
    syllables: [
      { syllable: "천", hanjaChar: "天", hanjaSound: "천", hanjaMeaning: "하늘", distractors: ["전", "선", "찬", "춘"] },
      { syllable: "고", hanjaChar: "高", hanjaSound: "고", hanjaMeaning: "높을", distractors: ["교", "구", "도", "보"] },
      { syllable: "마", hanjaChar: "馬", hanjaSound: "마", hanjaMeaning: "말", distractors: ["나", "바", "머", "모"] },
      { syllable: "비", hanjaChar: "肥", hanjaSound: "비", hanjaMeaning: "살찔", distractors: ["미", "기", "바", "부"] },
    ],
  },
  {
    word: "화룡점정",
    hanja: ["畵", "龍", "點", "睛"],
    meaning: "마지막 마무리",
    hint: "용 그림에 눈동자를 찍어 완성해요",
    contextStory: "화가가 용을 다 그린 뒤 마지막으로 눈동자를 찍자, 그림 속 용이 살아 움직이는 듯했어요.",
    syllables: [
      { syllable: "화", hanjaChar: "畵", hanjaSound: "화", hanjaMeaning: "그림", distractors: ["하", "회", "과", "좌"] },
      { syllable: "룡", hanjaChar: "龍", hanjaSound: "룡", hanjaMeaning: "용", distractors: ["용", "뇽", "롱", "량"] },
      { syllable: "점", hanjaChar: "點", hanjaSound: "점", hanjaMeaning: "점찍을", distractors: ["검", "첨", "잠", "좀"] },
      { syllable: "정", hanjaChar: "睛", hanjaSound: "정", hanjaMeaning: "눈동자", distractors: ["장", "종", "성", "덩"] },
    ],
  },
  {
    word: "대기만성",
    hanja: ["大", "器", "晚", "成"],
    meaning: "늦게 이루는 큰 인물",
    hint: "큰 그릇은 오래 걸려야 만들어져요",
    contextStory: "오래 빚은 큰 항아리는 시간이 더디지만, 마침내 단단하고 멋진 형태로 완성되었어요.",
    syllables: [
      { syllable: "대", hanjaChar: "大", hanjaSound: "대", hanjaMeaning: "큰", distractors: ["내", "배", "다", "도"] },
      { syllable: "기", hanjaChar: "器", hanjaSound: "기", hanjaMeaning: "그릇", distractors: ["니", "디", "가", "구"] },
      { syllable: "만", hanjaChar: "晚", hanjaSound: "만", hanjaMeaning: "늦을", distractors: ["반", "난", "먼", "문"] },
      { syllable: "성", hanjaChar: "成", hanjaSound: "성", hanjaMeaning: "이룰", distractors: ["정", "청", "상", "송"] },
    ],
  },
  {
    word: "백발백중",
    hanja: ["百", "發", "百", "中"],
    meaning: "항상 맞힘",
    hint: "백 번 쏘면 백 번 다 맞혀요",
    contextStory: "활쏘기 명수는 백 번을 쏘아도 백 번 모두 과녁 한가운데를 정확히 맞혔답니다.",
    syllables: [
      { syllable: "백", hanjaChar: "百", hanjaSound: "백", hanjaMeaning: "일백", distractors: ["맥", "객", "박", "북"] },
      { syllable: "발", hanjaChar: "發", hanjaSound: "발", hanjaMeaning: "쏠", distractors: ["말", "달", "벌", "볼"] },
      { syllable: "백", hanjaChar: "百", hanjaSound: "백", hanjaMeaning: "일백", distractors: ["택", "핵", "벡", "복"] },
      { syllable: "중", hanjaChar: "中", hanjaSound: "중", hanjaMeaning: "맞힐", distractors: ["둥", "궁", "징", "종"] },
    ],
  },
];
