// vocab.js — 역분해 어휘 세트 (M0 스텁 → M1 본 구현, TRD §3.2)
// 스키마: { word, components[2], hanja, distractors[2~3], difficulty(1|2|3) }
// PRD §7.2 초기 설계 세트 15개 — 모든 한자 ID는 hanja.js 키여야 함.

export const VOCAB = [];
