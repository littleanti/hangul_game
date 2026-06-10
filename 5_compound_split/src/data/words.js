/**
 * 합성어 콘텐츠 데이터 (TRD §3.1)
 * 도입 세트 6개 — PRD §7.1: S3(4_word_network) words.js에 합성어 전체가 실재하는 단어만 사용.
 *   빗방울(rain_raindrop) · 솔방울(mountain_pinecone) · 별빛(night_star)
 *   달빛(night_moon) · 꽃송이(meadow_flower) · 눈송이(winter_snowflake)
 *
 * 자산 방식 (R1 조치): 이모지 우선 — part1Emoji/part2Emoji 필수, part1ImageUrl/part2ImageUrl은
 * 일러스트 확정 시 선택적으로 추가(미제공 시 이모지 폴백).
 *
 * @typedef {Object} CompoundWord
 * @property {string}   id             - 고유 ID (예: 'raindrop')
 * @property {string}   word           - 합성어 전체 (예: '빗방울')
 * @property {string}   part1          - 첫 번째 형태소 (예: '비')
 * @property {string}   part2          - 두 번째 형태소 (예: '방울')
 * @property {string}   [part1Surface] - 조각1 표면형 (R7: 기저형과 표기가 다를 때만. 예: '빗'.
 *                                       팝업에서 '비(빗)' 병기 렌더링용. TTS는 part1('비') 발음 우선)
 * @property {string}   part1Emoji     - 첫 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part2Emoji     - 두 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part1Meaning   - 첫 번째 조각 뜻 라벨 (예: '내리는 비')
 * @property {string}   part2Meaning   - 두 번째 조각 뜻 라벨 (예: '동그란 방울')
 * @property {string}   [part1ImageUrl] - 조각1 그림 URL (선택, 이모지 폴백)
 * @property {string}   [part2ImageUrl] - 조각2 그림 URL (선택, 이모지 폴백)
 * @property {string}   sceneEmoji     - 합성어 전체 대표 이모지 (카드 배경용, Stage 3 씬 이모지 재사용)
 * @property {string}   sharedMorpheme - 공유 형태소 ID ('방울'|'빛'|'송이')
 * @property {string[][]} wrongSplits  - 잘못된 분절 예시 배열 [[part1오답, part2오답], ...]
 *                                       빈 문자열('')은 미분절 쪽(경계 밖 탭)을 뜻함
 * @property {string}   category       - 씬 카테고리 (Stage 3 씬 ID 호환, 예: 'rain_raindrop')
 */

/**
 * 조각 이모지 출처 (PLAN M1 후보 목록): 비🌧️ 방울💧 솔🌲 별⭐ 빛✨ 달🌙 꽃🌸 눈❄️
 * 단, '송이'는 후보 목록의 ❄️가 '눈'(❄️)과 중복되어 눈송이 카드가 ❄️+❄️로 퇴화하므로
 * 💮로 확정 — 9개 조각 모두 서로 다른 이모지를 갖는다(G3: 뜻 있는 조각마다 고유 그림).
 * 공유 형태소(방울·빛·송이)는 출현 단어가 달라도 같은 이모지·뜻 라벨을 유지한다(G2 재인 지원).
 *
 * sceneEmoji는 4_word_network/src/data/scenes.js의 씬 대표 이모지를 재사용:
 *   rain 🌧️ · mountain ⛰️ · night 🌙 · meadow 🌸 · winter ⛄
 *
 * @type {CompoundWord[]}
 */
export const WORDS = [
  {
    id: 'raindrop',
    word: '빗방울',
    part1: '비',            // R7: 기저형 '비' — TTS 발음 기준
    part1Surface: '빗',     // R7: 카드 표면형 — 팝업에서 '비(빗)' 병기 가능
    part2: '방울',
    part1Emoji: '🌧️',
    part2Emoji: '💧',
    part1Meaning: '내리는 비',
    part2Meaning: '동그란 방울',
    sceneEmoji: '🌧️',
    sharedMorpheme: '방울',
    wrongSplits: [
      ['빗방', '울'],       // 잘못된 경계(둘째 음절 뒤) — '비(빗)+방울'이 정답
      ['빗방울', ''],       // 오른쪽 끝 탭 — 미분절
      ['', '빗방울'],       // 왼쪽 끝 탭 — 미분절
    ],
    category: 'rain_raindrop',
  },
  {
    id: 'pinecone',
    word: '솔방울',
    part1: '솔',
    part2: '방울',
    part1Emoji: '🌲',
    part2Emoji: '💧',
    part1Meaning: '소나무',
    part2Meaning: '동그란 방울',
    sceneEmoji: '⛰️',
    sharedMorpheme: '방울',
    wrongSplits: [
      ['솔방', '울'],       // 잘못된 경계 — '솔+방울'이 정답
      ['솔방울', ''],       // 미분절
      ['', '솔방울'],       // 미분절
    ],
    category: 'mountain_pinecone',
  },
  {
    id: 'starlight',
    word: '별빛',
    part1: '별',
    part2: '빛',
    part1Emoji: '⭐',
    part2Emoji: '✨',
    part1Meaning: '반짝이는 별',
    part2Meaning: '환한 빛',
    sceneEmoji: '🌙',
    sharedMorpheme: '빛',
    wrongSplits: [
      ['별빛', ''],         // 미분절(PRD §7.2) — '별+빛'이 정답, 경계 탭 안내 강조
      ['', '별빛'],         // 미분절
    ],
    category: 'night_star',
  },
  {
    id: 'moonlight',
    word: '달빛',
    part1: '달',
    part2: '빛',
    part1Emoji: '🌙',
    part2Emoji: '✨',
    part1Meaning: '밤하늘 달',
    part2Meaning: '환한 빛',
    sceneEmoji: '🌙',
    sharedMorpheme: '빛',
    wrongSplits: [
      ['달빛', ''],         // 미분절 — '달+빛'이 정답
      ['', '달빛'],         // 미분절
    ],
    category: 'night_moon',
  },
  {
    id: 'flower',
    word: '꽃송이',
    part1: '꽃',
    part2: '송이',
    part1Emoji: '🌸',
    part2Emoji: '💮',
    part1Meaning: '예쁜 꽃',
    part2Meaning: '한 송이',
    sceneEmoji: '🌸',
    sharedMorpheme: '송이',
    wrongSplits: [
      ['꽃송', '이'],       // 잘못된 경계(PRD §7.2) — '꽃+송이'가 정답
      ['꽃송이', ''],       // 미분절
      ['', '꽃송이'],       // 미분절
    ],
    category: 'meadow_flower',
  },
  {
    id: 'snowflake',
    word: '눈송이',
    part1: '눈',
    part2: '송이',
    part1Emoji: '❄️',
    part2Emoji: '💮',
    part1Meaning: '하얀 눈',
    part2Meaning: '한 송이',
    sceneEmoji: '⛄',
    sharedMorpheme: '송이',
    wrongSplits: [
      ['눈송', '이'],       // 잘못된 경계 — '눈+송이'가 정답
      ['눈송이', ''],       // 미분절
      ['', '눈송이'],       // 미분절
    ],
    category: 'winter_snowflake',
  },
];

/**
 * 공유 형태소 페어링 메타 (Stage 4 payoff 보호용 참조, TRD §3.1)
 * Stage 6(형태소 탐정)이 참조 가능한 형태 — 키·값 변경 금지 (PLAN 시리즈 연속성).
 * 시각 연출 ON/OFF는 config.js의 SHOW_SHARED_MORPHEME_HIGHLIGHT 플래그로 제어 (R3: 기본 OFF).
 * @type {Record<string, string[]>}
 */
export const SHARED_MORPHEME_PAIRS = {
  '방울': ['raindrop', 'pinecone'],
  '빛': ['starlight', 'moonlight'],
  '송이': ['flower', 'snowflake'],
};
