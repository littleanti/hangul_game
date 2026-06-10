/**
 * 합성어 콘텐츠 데이터 (TRD §3.1)
 * M0: 플레이스홀더 — M1에서 도입 세트 6개(빗방울·솔방울·별빛·달빛·꽃송이·눈송이) 완성.
 *
 * @typedef {Object} CompoundWord
 * @property {string}   id             - 고유 ID (예: 'raindrop')
 * @property {string}   word           - 합성어 전체 (예: '빗방울')
 * @property {string}   part1          - 첫 번째 형태소 (예: '비')
 * @property {string}   part2          - 두 번째 형태소 (예: '방울')
 * @property {string}   part1Emoji     - 첫 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part2Emoji     - 두 번째 조각 이모지 또는 그림 식별자
 * @property {string}   part1Meaning   - 첫 번째 조각 뜻 라벨 (예: '내리는 비')
 * @property {string}   part2Meaning   - 두 번째 조각 뜻 라벨 (예: '동그란 방울')
 * @property {string}   [part1ImageUrl] - 조각1 그림 URL (선택, 이모지 폴백)
 * @property {string}   [part2ImageUrl] - 조각2 그림 URL (선택, 이모지 폴백)
 * @property {string}   sceneEmoji     - 합성어 전체 대표 이모지 (카드 배경용)
 * @property {string}   sharedMorpheme - 공유 형태소 ID ('방울'|'빛'|'송이')
 * @property {string[][]} wrongSplits  - 잘못된 분절 예시 배열 [[part1오답, part2오답], ...]
 * @property {string}   category       - 씬 카테고리 (Stage 3 씬 ID 호환, 예: 'rain_raindrop')
 */

/** @type {CompoundWord[]} */
export const WORDS = [
  // M1에서 채움 — 도입 세트 6개 (PRD §7.1)
];

/**
 * 공유 형태소 페어링 메타 (Stage 4 payoff 보호용 참조, TRD §3.1)
 * @type {Record<string, string[]>}
 */
export const SHARED_MORPHEME_PAIRS = {
  // M1에서 채움: '방울': ['raindrop', 'pinecone'], '빛': [...], '송이': [...]
};
