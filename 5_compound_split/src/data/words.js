/**
 * 합성어 콘텐츠 데이터 (TRD §3.1) — 총 100개 체계 (PRD §7)
 * ① 도입 세트 6개 (§7.1 — 기존, 불변): S3(4_word_network) words.js에 합성어 전체가 실재하는 단어만 사용.
 *   빗방울(rain_raindrop) · 솔방울(mountain_pinecone) · 별빛(night_star)
 *   달빛(night_moon) · 꽃송이(meadow_flower) · 눈송이(winter_snowflake)
 * ② 확장 세트 94개 (§7.3): 순우리말 투명 합성어 — 두 조각 모두 자립 형태소,
 *   만 6~7세 친숙 어휘, 이모지 표현 가능, 파생어·굴절형 배제.
 *   category는 주제 카테고리(nature_*, body_*, season_*, food_*, daily_*, animal_*, play_*) 신규 부여.
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
 * @property {string}   sceneEmoji     - 합성어 전체 대표 이모지 (카드 배경용, 도입 세트는 Stage 3 씬 이모지 재사용)
 * @property {string|null} sharedMorpheme - 공유 형태소 ID (예: '방울'|'빛'|'송이'|'물' 등).
 *                                       공유 짝이 없는 단어는 null (확장 세트 — PRD §7.3)
 * @property {string[][]} wrongSplits  - 잘못된 분절 예시 배열 [[part1오답, part2오답], ...]
 *                                       빈 문자열('')은 미분절 쪽(경계 밖 탭)을 뜻함. 2음절어는 빈 배열 허용
 * @property {string}   category       - 카테고리. 도입 세트 6개는 Stage 3 씬 ID(예: 'rain_raindrop') 불변,
 *                                       확장 세트는 주제 카테고리(예: 'nature_*', 'body_*')
 */

/**
 * 조각 이모지 정책 (G3: 뜻 있는 조각마다 고유 그림 / G2: 재인 지원)
 * - 같은 형태소는 출현 단어가 달라도 항상 같은 이모지·뜻 라벨을 유지한다 (G2 재인 지원).
 * - 서로 다른 형태소는 서로 다른 이모지를 갖는다 — 전체 100개 단어의 모든 조각 이모지는 형태소별 1:1.
 * - 도입 세트 9개 조각(PLAN M1 후보 목록): 비🌧️ 방울💧 솔🌲 별⭐ 빛✨ 달🌙 꽃🌸 눈❄️ 송이💮.
 *   '송이'는 후보 목록의 ❄️가 '눈'(❄️)과 중복되어 눈송이 카드가 ❄️+❄️로 퇴화하므로 💮로 확정.
 * - 동음이의 형태소 혼입 금지: '눈'은 雪 의미로만, '배'는 (물 위) 배 의미로만 사용 등 —
 *   하나의 형태소 표기는 전체 데이터에서 단일 의미·단일 이모지·단일 뜻 라벨만 갖는다.
 *
 * 도입 세트 sceneEmoji는 4_word_network/src/data/scenes.js의 씬 대표 이모지를 재사용:
 *   rain 🌧️ · mountain ⛰️ · night 🌙 · meadow 🌸 · winter ⛄
 *
 * @type {CompoundWord[]}
 */
export const WORDS = [
  // ════════════════════════════════════════════════════════════
  // 도입 세트 6개 (PRD §7.1) — 기존, 불변 (Stage 6 연속성 — 필드 변경 금지)
  // ════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════
  // 확장 세트 94개 (PRD §7.3) — 순우리말 투명 합성어, 주제 카테고리
  // 2음절어 wrongSplits는 빈 배열(경계 밖 탭은 게임 로직이 좌표로 검출),
  // 3음절 이상은 잘못된 경계 1~2종만 등재.
  // ════════════════════════════════════════════════════════════

  // ── 비·물 (rain & water) ──────────────────────────────────
  {
    id: 'springrain', word: '봄비', part1: '봄', part2: '비',
    part1Emoji: '🌷', part2Emoji: '🌧️', part1Meaning: '따뜻한 봄', part2Meaning: '내리는 비',
    sceneEmoji: '🌦️', sharedMorpheme: '비', wrongSplits: [], category: 'season_springrain',
  },
  {
    id: 'autumnrain', word: '가을비', part1: '가을', part2: '비',
    part1Emoji: '🍂', part2Emoji: '🌧️', part1Meaning: '시원한 가을', part2Meaning: '내리는 비',
    sceneEmoji: '🍂', sharedMorpheme: '비', wrongSplits: [['가', '을비']], category: 'season_autumnrain',
  },
  {
    id: 'rainwater', word: '빗물', part1: '비', part1Surface: '빗', part2: '물',
    part1Emoji: '🌧️', part2Emoji: '💦', part1Meaning: '내리는 비', part2Meaning: '맑은 물',
    sceneEmoji: '🌧️', sharedMorpheme: '물', wrongSplits: [], category: 'nature_rainwater',
  },
  {
    id: 'seawater', word: '바닷물', part1: '바다', part1Surface: '바닷', part2: '물',
    part1Emoji: '🌊', part2Emoji: '💦', part1Meaning: '넓은 바다', part2Meaning: '맑은 물',
    sceneEmoji: '🌊', sharedMorpheme: '물', wrongSplits: [['바', '닷물']], category: 'nature_seawater',
  },
  {
    id: 'riverwater', word: '강물', part1: '강', part2: '물',
    part1Emoji: '🏞️', part2Emoji: '💦', part1Meaning: '흐르는 강', part2Meaning: '맑은 물',
    sceneEmoji: '🏞️', sharedMorpheme: '물', wrongSplits: [], category: 'nature_riverwater',
  },
  {
    id: 'runnynose', word: '콧물', part1: '코', part1Surface: '콧', part2: '물',
    part1Emoji: '👃', part2Emoji: '💦', part1Meaning: '킁킁 코', part2Meaning: '맑은 물',
    sceneEmoji: '🤧', sharedMorpheme: '물', wrongSplits: [], category: 'body_runnynose',
  },
  {
    id: 'honeywater', word: '꿀물', part1: '꿀', part2: '물',
    part1Emoji: '🍯', part2Emoji: '💦', part1Meaning: '달콤한 꿀', part2Meaning: '맑은 물',
    sceneEmoji: '🍯', sharedMorpheme: '물', wrongSplits: [], category: 'food_honeywater',
  },
  {
    id: 'icewater', word: '얼음물', part1: '얼음', part2: '물',
    part1Emoji: '🧊', part2Emoji: '💦', part1Meaning: '꽁꽁 얼음', part2Meaning: '맑은 물',
    sceneEmoji: '🧊', sharedMorpheme: '물', wrongSplits: [['얼', '음물']], category: 'food_icewater',
  },
  {
    id: 'waterdrop', word: '물방울', part1: '물', part2: '방울',
    part1Emoji: '💦', part2Emoji: '💧', part1Meaning: '맑은 물', part2Meaning: '동그란 방울',
    sceneEmoji: '💧', sharedMorpheme: '방울', wrongSplits: [['물방', '울']], category: 'nature_waterdrop',
  },
  {
    id: 'soapbubble', word: '비눗방울', part1: '비누', part1Surface: '비눗', part2: '방울',
    part1Emoji: '🧼', part2Emoji: '💧', part1Meaning: '거품 비누', part2Meaning: '동그란 방울',
    sceneEmoji: '🫧', sharedMorpheme: '방울', wrongSplits: [['비', '눗방울'], ['비눗방', '울']], category: 'play_soapbubble',
  },
  {
    id: 'fish', word: '물고기', part1: '물', part2: '고기',
    part1Emoji: '💦', part2Emoji: '🐟', part1Meaning: '맑은 물', part2Meaning: '물속 고기',
    sceneEmoji: '🐠', sharedMorpheme: '물', wrongSplits: [['물고', '기']], category: 'animal_fish',
  },
  {
    id: 'wildduck', word: '물오리', part1: '물', part2: '오리',
    part1Emoji: '💦', part2Emoji: '🦆', part1Meaning: '맑은 물', part2Meaning: '꽥꽥 오리',
    sceneEmoji: '🦆', sharedMorpheme: '물', wrongSplits: [['물오', '리']], category: 'animal_wildduck',
  },
  {
    id: 'waterplay', word: '물놀이', part1: '물', part2: '놀이',
    part1Emoji: '💦', part2Emoji: '🎠', part1Meaning: '맑은 물', part2Meaning: '신나는 놀이',
    sceneEmoji: '🏊', sharedMorpheme: '놀이', wrongSplits: [['물놀', '이']], category: 'play_waterplay',
  },
  {
    id: 'watersound', word: '물소리', part1: '물', part2: '소리',
    part1Emoji: '💦', part2Emoji: '🔊', part1Meaning: '맑은 물', part2Meaning: '들리는 소리',
    sceneEmoji: '💦', sharedMorpheme: '소리', wrongSplits: [['물소', '리']], category: 'nature_watersound',
  },
  {
    id: 'waterfoam', word: '물거품', part1: '물', part2: '거품',
    part1Emoji: '💦', part2Emoji: '🫧', part1Meaning: '맑은 물', part2Meaning: '뽀글 거품',
    sceneEmoji: '🫧', sharedMorpheme: '물', wrongSplits: [['물거', '품']], category: 'nature_waterfoam',
  },
  {
    id: 'waterfun', word: '물장난', part1: '물', part2: '장난',
    part1Emoji: '💦', part2Emoji: '🤪', part1Meaning: '맑은 물', part2Meaning: '재미난 장난',
    sceneEmoji: '💦', sharedMorpheme: '물', wrongSplits: [['물장', '난']], category: 'play_waterfun',
  },

  // ── 가장자리·바람·구름 (edges, wind & clouds) ─────────────
  {
    id: 'seashore', word: '바닷가', part1: '바다', part1Surface: '바닷', part2: '가',
    part1Emoji: '🌊', part2Emoji: '🏖️', part1Meaning: '넓은 바다', part2Meaning: '가장자리',
    sceneEmoji: '🏖️', sharedMorpheme: '가', wrongSplits: [['바', '닷가']], category: 'nature_seashore',
  },
  {
    id: 'riverside', word: '강가', part1: '강', part2: '가',
    part1Emoji: '🏞️', part2Emoji: '🏖️', part1Meaning: '흐르는 강', part2Meaning: '가장자리',
    sceneEmoji: '🏞️', sharedMorpheme: '가', wrongSplits: [], category: 'nature_riverside',
  },
  {
    id: 'roadside', word: '길가', part1: '길', part2: '가',
    part1Emoji: '🛣️', part2Emoji: '🏖️', part1Meaning: '걸어가는 길', part2Meaning: '가장자리',
    sceneEmoji: '🛤️', sharedMorpheme: '가', wrongSplits: [], category: 'nature_roadside',
  },
  {
    id: 'raincloud', word: '비구름', part1: '비', part2: '구름',
    part1Emoji: '🌧️', part2Emoji: '☁️', part1Meaning: '내리는 비', part2Meaning: '뭉게구름',
    sceneEmoji: '🌧️', sharedMorpheme: '비', wrongSplits: [['비구', '름']], category: 'nature_raincloud',
  },
  {
    id: 'rainsound', word: '빗소리', part1: '비', part1Surface: '빗', part2: '소리',
    part1Emoji: '🌧️', part2Emoji: '🔊', part1Meaning: '내리는 비', part2Meaning: '들리는 소리',
    sceneEmoji: '🌧️', sharedMorpheme: '소리', wrongSplits: [['빗소', '리']], category: 'nature_rainsound',
  },
  {
    id: 'rainstorm', word: '비바람', part1: '비', part2: '바람',
    part1Emoji: '🌧️', part2Emoji: '💨', part1Meaning: '내리는 비', part2Meaning: '솔솔 바람',
    sceneEmoji: '🌬️', sharedMorpheme: '바람', wrongSplits: [['비바', '람']], category: 'nature_rainstorm',
  },
  {
    id: 'raincoat', word: '비옷', part1: '비', part2: '옷',
    part1Emoji: '🌧️', part2Emoji: '👕', part1Meaning: '내리는 비', part2Meaning: '입는 옷',
    sceneEmoji: '☔', sharedMorpheme: '옷', wrongSplits: [], category: 'daily_raincoat',
  },
  {
    id: 'seabreeze', word: '바닷바람', part1: '바다', part1Surface: '바닷', part2: '바람',
    part1Emoji: '🌊', part2Emoji: '💨', part1Meaning: '넓은 바다', part2Meaning: '솔솔 바람',
    sceneEmoji: '🌊', sharedMorpheme: '바람', wrongSplits: [['바', '닷바람'], ['바닷바', '람']], category: 'nature_seabreeze',
  },

  // ── 봄·계절 (spring & seasons) ────────────────────────────
  {
    id: 'springwind', word: '봄바람', part1: '봄', part2: '바람',
    part1Emoji: '🌷', part2Emoji: '💨', part1Meaning: '따뜻한 봄', part2Meaning: '솔솔 바람',
    sceneEmoji: '🌬️', sharedMorpheme: '바람', wrongSplits: [['봄바', '람']], category: 'season_springwind',
  },
  {
    id: 'springsun', word: '봄볕', part1: '봄', part2: '볕',
    part1Emoji: '🌷', part2Emoji: '🔆', part1Meaning: '따뜻한 봄', part2Meaning: '따스한 볕',
    sceneEmoji: '🌞', sharedMorpheme: '봄', wrongSplits: [], category: 'season_springsun',
  },
  {
    id: 'springflower', word: '봄꽃', part1: '봄', part2: '꽃',
    part1Emoji: '🌷', part2Emoji: '🌸', part1Meaning: '따뜻한 봄', part2Meaning: '예쁜 꽃',
    sceneEmoji: '🌷', sharedMorpheme: '꽃', wrongSplits: [], category: 'season_springflower',
  },
  {
    id: 'springday', word: '봄날', part1: '봄', part2: '날',
    part1Emoji: '🌷', part2Emoji: '🗓️', part1Meaning: '따뜻한 봄', part2Meaning: '하루',
    sceneEmoji: '🌼', sharedMorpheme: '봄', wrongSplits: [], category: 'season_springday',
  },
  {
    id: 'springherb', word: '봄나물', part1: '봄', part2: '나물',
    part1Emoji: '🌷', part2Emoji: '🥬', part1Meaning: '따뜻한 봄', part2Meaning: '조물조물 나물',
    sceneEmoji: '🥬', sharedMorpheme: '나물', wrongSplits: [['봄나', '물']], category: 'food_springherb',
  },

  // ── 밤 (night) ────────────────────────────────────────────
  {
    id: 'nightsky', word: '밤하늘', part1: '밤', part2: '하늘',
    part1Emoji: '🌃', part2Emoji: '🌤️', part1Meaning: '깜깜한 밤', part2Meaning: '파란 하늘',
    sceneEmoji: '🌌', sharedMorpheme: '밤', wrongSplits: [['밤하', '늘']], category: 'nature_nightsky',
  },
  {
    id: 'nightroad', word: '밤길', part1: '밤', part2: '길',
    part1Emoji: '🌃', part2Emoji: '🛣️', part1Meaning: '깜깜한 밤', part2Meaning: '걸어가는 길',
    sceneEmoji: '🌃', sharedMorpheme: '길', wrongSplits: [], category: 'daily_nightroad',
  },
  {
    id: 'moonnight', word: '달밤', part1: '달', part2: '밤',
    part1Emoji: '🌙', part2Emoji: '🌃', part1Meaning: '밤하늘 달', part2Meaning: '깜깜한 밤',
    sceneEmoji: '🌕', sharedMorpheme: '밤', wrongSplits: [], category: 'nature_moonnight',
  },
  {
    id: 'summernight', word: '여름밤', part1: '여름', part2: '밤',
    part1Emoji: '⛱️', part2Emoji: '🌃', part1Meaning: '더운 여름', part2Meaning: '깜깜한 밤',
    sceneEmoji: '🌌', sharedMorpheme: '밤', wrongSplits: [['여', '름밤']], category: 'season_summernight',
  },
  {
    id: 'winternight', word: '겨울밤', part1: '겨울', part2: '밤',
    part1Emoji: '☃️', part2Emoji: '🌃', part1Meaning: '추운 겨울', part2Meaning: '깜깜한 밤',
    sceneEmoji: '🌨️', sharedMorpheme: '밤', wrongSplits: [['겨', '울밤']], category: 'season_winternight',
  },

  // ── 빛·불 (light & fire) ──────────────────────────────────
  {
    id: 'sunlight', word: '햇빛', part1: '해', part1Surface: '햇', part2: '빛',
    part1Emoji: '🌞', part2Emoji: '✨', part1Meaning: '밝은 해', part2Meaning: '환한 빛',
    sceneEmoji: '🌞', sharedMorpheme: '빛', wrongSplits: [], category: 'nature_sunlight',
  },
  {
    id: 'firelight', word: '불빛', part1: '불', part2: '빛',
    part1Emoji: '🔥', part2Emoji: '✨', part1Meaning: '뜨거운 불', part2Meaning: '환한 빛',
    sceneEmoji: '💡', sharedMorpheme: '빛', wrongSplits: [], category: 'nature_firelight',
  },
  {
    id: 'fireflower', word: '불꽃', part1: '불', part2: '꽃',
    part1Emoji: '🔥', part2Emoji: '🌸', part1Meaning: '뜨거운 불', part2Meaning: '예쁜 꽃',
    sceneEmoji: '🎆', sharedMorpheme: '꽃', wrongSplits: [], category: 'nature_fireflower',
  },
  {
    id: 'candlelight', word: '촛불', part1: '초', part1Surface: '촛', part2: '불',
    part1Emoji: '🕯️', part2Emoji: '🔥', part1Meaning: '밝히는 초', part2Meaning: '뜨거운 불',
    sceneEmoji: '🕯️', sharedMorpheme: '불', wrongSplits: [], category: 'daily_candlelight',
  },

  // ── 송이·달 (clusters & moon) ─────────────────────────────
  {
    id: 'grapecluster', word: '포도송이', part1: '포도', part2: '송이',
    part1Emoji: '🍇', part2Emoji: '💮', part1Meaning: '보라 포도', part2Meaning: '한 송이',
    sceneEmoji: '🍇', sharedMorpheme: '송이', wrongSplits: [['포', '도송이'], ['포도송', '이']], category: 'food_grapecluster',
  },
  {
    id: 'fullmoon', word: '보름달', part1: '보름', part2: '달',
    part1Emoji: '📅', part2Emoji: '🌙', part1Meaning: '열다섯 날', part2Meaning: '밤하늘 달',
    sceneEmoji: '🌕', sharedMorpheme: '달', wrongSplits: [['보', '름달']], category: 'nature_fullmoon',
  },

  // ── 길 (roads) ────────────────────────────────────────────
  {
    id: 'mountainpath', word: '산길', part1: '산', part2: '길',
    part1Emoji: '⛰️', part2Emoji: '🛣️', part1Meaning: '높은 산', part2Meaning: '걸어가는 길',
    sceneEmoji: '⛰️', sharedMorpheme: '길', wrongSplits: [], category: 'nature_mountainpath',
  },
  {
    id: 'snowroad', word: '눈길', part1: '눈', part2: '길',
    part1Emoji: '❄️', part2Emoji: '🛣️', part1Meaning: '하얀 눈', part2Meaning: '걸어가는 길',
    sceneEmoji: '⛄', sharedMorpheme: '길', wrongSplits: [], category: 'nature_snowroad',
  },
  {
    id: 'flowerroad', word: '꽃길', part1: '꽃', part2: '길',
    part1Emoji: '🌸', part2Emoji: '🛣️', part1Meaning: '예쁜 꽃', part2Meaning: '걸어가는 길',
    sceneEmoji: '🌸', sharedMorpheme: '길', wrongSplits: [], category: 'nature_flowerroad',
  },

  // ── 눈 (snow) ─────────────────────────────────────────────
  {
    id: 'snowman', word: '눈사람', part1: '눈', part2: '사람',
    part1Emoji: '❄️', part2Emoji: '🧑', part1Meaning: '하얀 눈', part2Meaning: '서 있는 사람',
    sceneEmoji: '⛄', sharedMorpheme: '눈', wrongSplits: [['눈사', '람']], category: 'season_snowman',
  },
  {
    id: 'snowfield', word: '눈밭', part1: '눈', part2: '밭',
    part1Emoji: '❄️', part2Emoji: '🟫', part1Meaning: '하얀 눈', part2Meaning: '심는 밭',
    sceneEmoji: '🏔️', sharedMorpheme: '밭', wrongSplits: [], category: 'nature_snowfield',
  },
  {
    id: 'snowsled', word: '눈썰매', part1: '눈', part2: '썰매',
    part1Emoji: '❄️', part2Emoji: '🛷', part1Meaning: '하얀 눈', part2Meaning: '쌩쌩 썰매',
    sceneEmoji: '🛷', sharedMorpheme: '눈', wrongSplits: [['눈썰', '매']], category: 'play_snowsled',
  },
  {
    id: 'snowfight', word: '눈싸움', part1: '눈', part2: '싸움',
    part1Emoji: '❄️', part2Emoji: '🥊', part1Meaning: '하얀 눈', part2Meaning: '겨루는 싸움',
    sceneEmoji: '☃️', sharedMorpheme: '눈', wrongSplits: [['눈싸', '움']], category: 'play_snowfight',
  },

  // ── 밭·들 (fields) ────────────────────────────────────────
  {
    id: 'flowerfield', word: '꽃밭', part1: '꽃', part2: '밭',
    part1Emoji: '🌸', part2Emoji: '🟫', part1Meaning: '예쁜 꽃', part2Meaning: '심는 밭',
    sceneEmoji: '🌻', sharedMorpheme: '밭', wrongSplits: [], category: 'nature_flowerfield',
  },
  {
    id: 'grassfield', word: '풀밭', part1: '풀', part2: '밭',
    part1Emoji: '🌿', part2Emoji: '🟫', part1Meaning: '푸른 풀', part2Meaning: '심는 밭',
    sceneEmoji: '🌿', sharedMorpheme: '밭', wrongSplits: [], category: 'nature_grassfield',
  },
  {
    id: 'sandfield', word: '모래밭', part1: '모래', part2: '밭',
    part1Emoji: '🏜️', part2Emoji: '🟫', part1Meaning: '고운 모래', part2Meaning: '심는 밭',
    sceneEmoji: '🏖️', sharedMorpheme: '밭', wrongSplits: [['모', '래밭']], category: 'nature_sandfield',
  },
  {
    id: 'sandcastle', word: '모래성', part1: '모래', part2: '성',
    part1Emoji: '🏜️', part2Emoji: '🏰', part1Meaning: '고운 모래', part2Meaning: '튼튼한 성',
    sceneEmoji: '🏰', sharedMorpheme: '모래', wrongSplits: [['모', '래성']], category: 'play_sandcastle',
  },
  {
    id: 'wildflower', word: '들꽃', part1: '들', part2: '꽃',
    part1Emoji: '🌾', part2Emoji: '🌸', part1Meaning: '넓은 들', part2Meaning: '예쁜 꽃',
    sceneEmoji: '🌼', sharedMorpheme: '꽃', wrongSplits: [], category: 'nature_wildflower',
  },
  {
    id: 'wildgrass', word: '들풀', part1: '들', part2: '풀',
    part1Emoji: '🌾', part2Emoji: '🌿', part1Meaning: '넓은 들', part2Meaning: '푸른 풀',
    sceneEmoji: '🌾', sharedMorpheme: '풀', wrongSplits: [], category: 'nature_wildgrass',
  },

  // ── 잎·나무 (leaves & trees) ──────────────────────────────
  {
    id: 'grassleaf', word: '풀잎', part1: '풀', part2: '잎',
    part1Emoji: '🌿', part2Emoji: '🍃', part1Meaning: '푸른 풀', part2Meaning: '초록 잎',
    sceneEmoji: '🍃', sharedMorpheme: '잎', wrongSplits: [], category: 'nature_grassleaf',
  },
  {
    id: 'petal', word: '꽃잎', part1: '꽃', part2: '잎',
    part1Emoji: '🌸', part2Emoji: '🍃', part1Meaning: '예쁜 꽃', part2Meaning: '초록 잎',
    sceneEmoji: '🌸', sharedMorpheme: '잎', wrongSplits: [], category: 'nature_petal',
  },
  {
    id: 'treeleaf', word: '나뭇잎', part1: '나무', part1Surface: '나뭇', part2: '잎',
    part1Emoji: '🌳', part2Emoji: '🍃', part1Meaning: '큰 나무', part2Meaning: '초록 잎',
    sceneEmoji: '🍃', sharedMorpheme: '잎', wrongSplits: [['나', '뭇잎']], category: 'nature_treeleaf',
  },
  {
    id: 'pineneedle', word: '솔잎', part1: '솔', part2: '잎',
    part1Emoji: '🌲', part2Emoji: '🍃', part1Meaning: '소나무', part2Meaning: '초록 잎',
    sceneEmoji: '🌲', sharedMorpheme: '잎', wrongSplits: [], category: 'nature_pineneedle',
  },
  {
    id: 'pinetree', word: '소나무', part1: '솔', part1Surface: '소', part2: '나무',
    part1Emoji: '🌲', part2Emoji: '🌳', part1Meaning: '소나무', part2Meaning: '큰 나무',
    sceneEmoji: '🌲', sharedMorpheme: '나무', wrongSplits: [['소나', '무']], category: 'nature_pinetree',
  },
  {
    id: 'flowertree', word: '꽃나무', part1: '꽃', part2: '나무',
    part1Emoji: '🌸', part2Emoji: '🌳', part1Meaning: '예쁜 꽃', part2Meaning: '큰 나무',
    sceneEmoji: '🌳', sharedMorpheme: '나무', wrongSplits: [['꽃나', '무']], category: 'nature_flowertree',
  },

  // ── 동물 (animals) ────────────────────────────────────────
  {
    id: 'mountainrabbit', word: '산토끼', part1: '산', part2: '토끼',
    part1Emoji: '⛰️', part2Emoji: '🐰', part1Meaning: '높은 산', part2Meaning: '깡충 토끼',
    sceneEmoji: '🐇', sharedMorpheme: '산', wrongSplits: [['산토', '끼']], category: 'animal_mountainrabbit',
  },
  {
    id: 'honeybee', word: '꿀벌', part1: '꿀', part2: '벌',
    part1Emoji: '🍯', part2Emoji: '🐝', part1Meaning: '달콤한 꿀', part2Meaning: '윙윙 벌',
    sceneEmoji: '🐝', sharedMorpheme: '벌', wrongSplits: [], category: 'animal_honeybee',
  },
  {
    id: 'beehive', word: '벌집', part1: '벌', part2: '집',
    part1Emoji: '🐝', part2Emoji: '🏠', part1Meaning: '윙윙 벌', part2Meaning: '포근한 집',
    sceneEmoji: '🍯', sharedMorpheme: '집', wrongSplits: [], category: 'animal_beehive',
  },
  {
    id: 'flowershop', word: '꽃집', part1: '꽃', part2: '집',
    part1Emoji: '🌸', part2Emoji: '🏠', part1Meaning: '예쁜 꽃', part2Meaning: '포근한 집',
    sceneEmoji: '💐', sharedMorpheme: '집', wrongSplits: [], category: 'daily_flowershop',
  },
  {
    id: 'spiderweb', word: '거미줄', part1: '거미', part2: '줄',
    part1Emoji: '🕷️', part2Emoji: '🪢', part1Meaning: '줄 치는 거미', part2Meaning: '기다란 줄',
    sceneEmoji: '🕸️', sharedMorpheme: '줄', wrongSplits: [['거', '미줄']], category: 'animal_spiderweb',
  },
  {
    id: 'clothesline', word: '빨랫줄', part1: '빨래', part1Surface: '빨랫', part2: '줄',
    part1Emoji: '🧺', part2Emoji: '🪢', part1Meaning: '깨끗한 빨래', part2Meaning: '기다란 줄',
    sceneEmoji: '🧺', sharedMorpheme: '줄', wrongSplits: [['빨', '랫줄']], category: 'daily_clothesline',
  },

  // ── 종이·만들기 (paper & crafts) ──────────────────────────
  {
    id: 'paperboat', word: '종이배', part1: '종이', part2: '배',
    part1Emoji: '📄', part2Emoji: '⛵', part1Meaning: '얇은 종이', part2Meaning: '둥둥 배',
    sceneEmoji: '⛵', sharedMorpheme: '종이', wrongSplits: [['종', '이배']], category: 'play_paperboat',
  },
  {
    id: 'colorpaper', word: '색종이', part1: '색', part2: '종이',
    part1Emoji: '🎨', part2Emoji: '📄', part1Meaning: '알록달록 색', part2Meaning: '얇은 종이',
    sceneEmoji: '🎨', sharedMorpheme: '종이', wrongSplits: [['색종', '이']], category: 'play_colorpaper',
  },

  // ── 음식 (food) ───────────────────────────────────────────
  {
    id: 'ricecakesoup', word: '떡국', part1: '떡', part2: '국',
    part1Emoji: '🍡', part2Emoji: '🍲', part1Meaning: '쫄깃한 떡', part2Meaning: '뜨끈한 국',
    sceneEmoji: '🍲', sharedMorpheme: '국', wrongSplits: [], category: 'food_ricecakesoup',
  },
  {
    id: 'honeyricecake', word: '꿀떡', part1: '꿀', part2: '떡',
    part1Emoji: '🍯', part2Emoji: '🍡', part1Meaning: '달콤한 꿀', part2Meaning: '쫄깃한 떡',
    sceneEmoji: '🍡', sharedMorpheme: '떡', wrongSplits: [], category: 'food_honeyricecake',
  },
  {
    id: 'soupbowl', word: '국그릇', part1: '국', part2: '그릇',
    part1Emoji: '🍲', part2Emoji: '🥣', part1Meaning: '뜨끈한 국', part2Meaning: '담는 그릇',
    sceneEmoji: '🍲', sharedMorpheme: '그릇', wrongSplits: [['국그', '릇']], category: 'food_soupbowl',
  },
  {
    id: 'ricebowl', word: '밥그릇', part1: '밥', part2: '그릇',
    part1Emoji: '🍚', part2Emoji: '🥣', part1Meaning: '맛있는 밥', part2Meaning: '담는 그릇',
    sceneEmoji: '🍚', sharedMorpheme: '그릇', wrongSplits: [['밥그', '릇']], category: 'food_ricebowl',
  },
  {
    id: 'gimbap', word: '김밥', part1: '김', part2: '밥',
    part1Emoji: '🍘', part2Emoji: '🍚', part1Meaning: '바삭한 김', part2Meaning: '맛있는 밥',
    sceneEmoji: '🍙', sharedMorpheme: '밥', wrongSplits: [], category: 'food_gimbap',
  },
  {
    id: 'riceball', word: '주먹밥', part1: '주먹', part2: '밥',
    part1Emoji: '✊', part2Emoji: '🍚', part1Meaning: '꽉 쥔 주먹', part2Meaning: '맛있는 밥',
    sceneEmoji: '🍙', sharedMorpheme: '밥', wrongSplits: [['주', '먹밥']], category: 'food_riceball',
  },
  {
    id: 'beansprout', word: '콩나물', part1: '콩', part2: '나물',
    part1Emoji: '🫘', part2Emoji: '🥬', part1Meaning: '동글동글 콩', part2Meaning: '조물조물 나물',
    sceneEmoji: '🌱', sharedMorpheme: '나물', wrongSplits: [['콩나', '물']], category: 'food_beansprout',
  },
  {
    id: 'peanut', word: '땅콩', part1: '땅', part2: '콩',
    part1Emoji: '🌍', part2Emoji: '🫘', part1Meaning: '단단한 땅', part2Meaning: '동글동글 콩',
    sceneEmoji: '🥜', sharedMorpheme: '콩', wrongSplits: [], category: 'food_peanut',
  },

  // ── 몸 (body) ─────────────────────────────────────────────
  {
    id: 'handmirror', word: '손거울', part1: '손', part2: '거울',
    part1Emoji: '✋', part2Emoji: '🪞', part1Meaning: '잡는 손', part2Meaning: '비추는 거울',
    sceneEmoji: '🪞', sharedMorpheme: '손', wrongSplits: [['손거', '울']], category: 'daily_handmirror',
  },
  {
    id: 'palm', word: '손바닥', part1: '손', part2: '바닥',
    part1Emoji: '✋', part2Emoji: '⬜', part1Meaning: '잡는 손', part2Meaning: '평평한 바닥',
    sceneEmoji: '🖐️', sharedMorpheme: '바닥', wrongSplits: [['손바', '닥']], category: 'body_palm',
  },
  {
    id: 'sole', word: '발바닥', part1: '발', part2: '바닥',
    part1Emoji: '🦶', part2Emoji: '⬜', part1Meaning: '걷는 발', part2Meaning: '평평한 바닥',
    sceneEmoji: '🦶', sharedMorpheme: '바닥', wrongSplits: [['발바', '닥']], category: 'body_sole',
  },
  {
    id: 'handsfeet', word: '손발', part1: '손', part2: '발',
    part1Emoji: '✋', part2Emoji: '🦶', part1Meaning: '잡는 손', part2Meaning: '걷는 발',
    sceneEmoji: '🙌', sharedMorpheme: '발', wrongSplits: [], category: 'body_handsfeet',
  },
  {
    id: 'armslegs', word: '팔다리', part1: '팔', part2: '다리',
    part1Emoji: '💪', part2Emoji: '🦵', part1Meaning: '힘센 팔', part2Meaning: '긴 다리',
    sceneEmoji: '🤸', sharedMorpheme: null, wrongSplits: [['팔다', '리']], category: 'body_armslegs',
  },
  {
    id: 'footprint', word: '발자국', part1: '발', part2: '자국',
    part1Emoji: '🦶', part2Emoji: '👣', part1Meaning: '걷는 발', part2Meaning: '남은 자국',
    sceneEmoji: '👣', sharedMorpheme: '발', wrongSplits: [['발자', '국']], category: 'body_footprint',
  },
  {
    id: 'nostril', word: '콧구멍', part1: '코', part1Surface: '콧', part2: '구멍',
    part1Emoji: '👃', part2Emoji: '🕳️', part1Meaning: '킁킁 코', part2Meaning: '뻥 뚫린 구멍',
    sceneEmoji: '👃', sharedMorpheme: '구멍', wrongSplits: [['콧구', '멍']], category: 'body_nostril',
  },
  {
    id: 'earhole', word: '귓구멍', part1: '귀', part1Surface: '귓', part2: '구멍',
    part1Emoji: '👂', part2Emoji: '🕳️', part1Meaning: '듣는 귀', part2Meaning: '뻥 뚫린 구멍',
    sceneEmoji: '👂', sharedMorpheme: '구멍', wrongSplits: [['귓구', '멍']], category: 'body_earhole',
  },
  {
    id: 'humming', word: '콧노래', part1: '코', part1Surface: '콧', part2: '노래',
    part1Emoji: '👃', part2Emoji: '🎵', part1Meaning: '킁킁 코', part2Meaning: '부르는 노래',
    sceneEmoji: '🎶', sharedMorpheme: '코', wrongSplits: [['콧노', '래']], category: 'body_humming',
  },

  // ── 소리·잠 (sounds & sleep) ──────────────────────────────
  {
    id: 'birdsong', word: '새소리', part1: '새', part2: '소리',
    part1Emoji: '🐦', part2Emoji: '🔊', part1Meaning: '짹짹 새', part2Meaning: '들리는 소리',
    sceneEmoji: '🐦', sharedMorpheme: '소리', wrongSplits: [['새소', '리']], category: 'animal_birdsong',
  },
  {
    id: 'wintersleep', word: '겨울잠', part1: '겨울', part2: '잠',
    part1Emoji: '☃️', part2Emoji: '😴', part1Meaning: '추운 겨울', part2Meaning: '쿨쿨 잠',
    sceneEmoji: '🐻', sharedMorpheme: '잠', wrongSplits: [['겨', '울잠']], category: 'animal_wintersleep',
  },
  {
    id: 'nap', word: '낮잠', part1: '낮', part2: '잠',
    part1Emoji: '☀️', part2Emoji: '😴', part1Meaning: '해 뜬 낮', part2Meaning: '쿨쿨 잠',
    sceneEmoji: '😴', sharedMorpheme: '잠', wrongSplits: [], category: 'daily_nap',
  },
  {
    id: 'pajamas', word: '잠옷', part1: '잠', part2: '옷',
    part1Emoji: '😴', part2Emoji: '👕', part1Meaning: '쿨쿨 잠', part2Meaning: '입는 옷',
    sceneEmoji: '🛏️', sharedMorpheme: '옷', wrongSplits: [], category: 'daily_pajamas',
  },

  // ── 꿈·놀이 (dreams & play) ───────────────────────────────
  {
    id: 'dreamland', word: '꿈나라', part1: '꿈', part2: '나라',
    part1Emoji: '💭', part2Emoji: '🗺️', part1Meaning: '신기한 꿈', part2Meaning: '커다란 나라',
    sceneEmoji: '🛌', sharedMorpheme: '나라', wrongSplits: [['꿈나', '라']], category: 'play_dreamland',
  },
  {
    id: 'starland', word: '별나라', part1: '별', part2: '나라',
    part1Emoji: '⭐', part2Emoji: '🗺️', part1Meaning: '반짝이는 별', part2Meaning: '커다란 나라',
    sceneEmoji: '🪐', sharedMorpheme: '나라', wrongSplits: [['별나', '라']], category: 'play_starland',
  },
  {
    id: 'constellation', word: '별자리', part1: '별', part2: '자리',
    part1Emoji: '⭐', part2Emoji: '💺', part1Meaning: '반짝이는 별', part2Meaning: '앉는 자리',
    sceneEmoji: '🌌', sharedMorpheme: '별', wrongSplits: [['별자', '리']], category: 'nature_constellation',
  },
  {
    id: 'ballplay', word: '공놀이', part1: '공', part2: '놀이',
    part1Emoji: '⚽', part2Emoji: '🎠', part1Meaning: '둥근 공', part2Meaning: '신나는 놀이',
    sceneEmoji: '⚽', sharedMorpheme: '놀이', wrongSplits: [['공놀', '이']], category: 'play_ballplay',
  },
  {
    id: 'flowerviewing', word: '꽃구경', part1: '꽃', part2: '구경',
    part1Emoji: '🌸', part2Emoji: '👀', part1Meaning: '예쁜 꽃', part2Meaning: '두리번 구경',
    sceneEmoji: '🌸', sharedMorpheme: '꽃', wrongSplits: [['꽃구', '경']], category: 'play_flowerviewing',
  },
  {
    id: 'stonewall', word: '돌담', part1: '돌', part2: '담',
    part1Emoji: '🪨', part2Emoji: '🧱', part1Meaning: '딱딱한 돌', part2Meaning: '낮은 담',
    sceneEmoji: '🧱', sharedMorpheme: null, wrongSplits: [], category: 'nature_stonewall',
  },
];

/**
 * 공유 형태소 그룹 메타 (Stage 4 payoff 보호용 참조, TRD §3.1)
 * { 형태소: [id, ...] } — 같은 part1 또는 part2 형태소를 공유하는 단어가
 * 2개 이상인 그룹만 등재하며, 그룹당 2개 이상의 id를 허용한다(쌍 한정 아님).
 * 기존 3키(방울·빛·송이)는 키·기존 값 순서를 유지한 채 확장 세트 id를 뒤에 추가
 * (PLAN 시리즈 연속성 — Stage 6(형태소 탐정)이 참조 가능한 형태).
 * id 순서는 WORDS 배열 등재 순서를 따른다.
 * 시각 연출 ON/OFF는 config.js의 SHOW_SHARED_MORPHEME_HIGHLIGHT 플래그로 제어 (R3: 기본 OFF).
 * @type {Record<string, string[]>}
 */
export const SHARED_MORPHEME_PAIRS = {
  '방울': ['raindrop', 'pinecone', 'waterdrop', 'soapbubble'],
  '빛': ['starlight', 'moonlight', 'sunlight', 'firelight'],
  '송이': ['flower', 'snowflake', 'grapecluster'],
  '비': ['raindrop', 'springrain', 'autumnrain', 'rainwater', 'raincloud', 'rainsound', 'rainstorm', 'raincoat'],
  '솔': ['pinecone', 'pineneedle', 'pinetree'],
  '별': ['starlight', 'starland', 'constellation'],
  '달': ['moonlight', 'moonnight', 'fullmoon'],
  '꽃': ['flower', 'springflower', 'fireflower', 'flowerroad', 'flowerfield', 'wildflower', 'petal', 'flowertree', 'flowershop', 'flowerviewing'],
  '눈': ['snowflake', 'snowroad', 'snowman', 'snowfield', 'snowsled', 'snowfight'],
  '봄': ['springrain', 'springwind', 'springsun', 'springflower', 'springday', 'springherb'],
  '물': ['rainwater', 'seawater', 'riverwater', 'runnynose', 'honeywater', 'icewater', 'waterdrop', 'fish', 'wildduck', 'waterplay', 'watersound', 'waterfoam', 'waterfun'],
  '바다': ['seawater', 'seashore', 'seabreeze'],
  '강': ['riverwater', 'riverside'],
  '코': ['runnynose', 'nostril', 'humming'],
  '꿀': ['honeywater', 'honeybee', 'honeyricecake'],
  '놀이': ['waterplay', 'ballplay'],
  '소리': ['watersound', 'rainsound', 'birdsong'],
  '가': ['seashore', 'riverside', 'roadside'],
  '길': ['roadside', 'nightroad', 'mountainpath', 'snowroad', 'flowerroad'],
  '바람': ['rainstorm', 'seabreeze', 'springwind'],
  '옷': ['raincoat', 'pajamas'],
  '나물': ['springherb', 'beansprout'],
  '밤': ['nightsky', 'nightroad', 'moonnight', 'summernight', 'winternight'],
  '겨울': ['winternight', 'wintersleep'],
  '불': ['firelight', 'fireflower', 'candlelight'],
  '산': ['mountainpath', 'mountainrabbit'],
  '밭': ['snowfield', 'flowerfield', 'grassfield', 'sandfield'],
  '풀': ['grassfield', 'wildgrass', 'grassleaf'],
  '모래': ['sandfield', 'sandcastle'],
  '들': ['wildflower', 'wildgrass'],
  '잎': ['grassleaf', 'petal', 'treeleaf', 'pineneedle'],
  '나무': ['treeleaf', 'pinetree', 'flowertree'],
  '벌': ['honeybee', 'beehive'],
  '집': ['beehive', 'flowershop'],
  '줄': ['spiderweb', 'clothesline'],
  '종이': ['paperboat', 'colorpaper'],
  '떡': ['ricecakesoup', 'honeyricecake'],
  '국': ['ricecakesoup', 'soupbowl'],
  '그릇': ['soupbowl', 'ricebowl'],
  '밥': ['ricebowl', 'gimbap', 'riceball'],
  '콩': ['beansprout', 'peanut'],
  '손': ['handmirror', 'palm', 'handsfeet'],
  '바닥': ['palm', 'sole'],
  '발': ['sole', 'handsfeet', 'footprint'],
  '구멍': ['nostril', 'earhole'],
  '잠': ['wintersleep', 'nap', 'pajamas'],
  '나라': ['dreamland', 'starland'],
};
