// 어휘 카드 덱 컴포넌트 — TRD §5.4 / PRD F10
// showCardDeck(hanjaId): morph 완료 직후 호출 → familiarity 순 카드 펼침
// clearCards(): 화면 전환·언로드 시 정리
//
// UX: 카드 탭 시 발음 재생 + 위 음절 블록을 그 카드 단어로 갱신한다.
// 같은 한자가 다른 단어에서 어느 음절에 위치하는지를 학습자가 시각적으로
// 확인할 수 있도록 — 형태소 인식 학습의 핵심 루프.
import { HANJA }    from '../data/hanja.js';
import { VOCAB }    from '../data/vocab.js';
import { speak, isAvailable as ttsAvailable } from './tts.js';
import { showWord } from './word-block.js';

const CONTAINER_ID = 'card-deck-container';

// 현재 덱의 한자 ID — 카드 탭 시 단어 안 한자 위치를 찾기 위해 보관
let _currentHanjaId = null;

function getContainer() {
  return document.getElementById(CONTAINER_ID);
}

// 단어에서 currentHanjaId 가 차지하는 음절 인덱스를 찾는다.
// VOCAB 등록되지 않은 단어는 인덱스 -1 (하이라이트 없이 음절 분리만).
function _findHanjaSyllableIdx(word) {
  const entry = VOCAB[word];
  if (!entry?.syllableMap || !_currentHanjaId) return -1;
  for (const [idx, h] of Object.entries(entry.syllableMap)) {
    if (h === _currentHanjaId) return Number(idx);
  }
  return -1;
}

// 카드 탭 시 위 음절 블록을 카드 단어로 갱신 (UX: 형태소 인지 강화)
function _updateWordBlockForCard(word) {
  const targetIdx = _findHanjaSyllableIdx(word);
  showWord({
    wordId:            `card-${word}`,
    text:              word,
    syllables:         [...word],
    targetSyllableIdx: targetIdx,
    targetHanjaId:     _currentHanjaId,
  });
}

// vocab 항목을 familiarity 오름차순(친숙 → 낯선)으로 정렬, 최대 5개
function getSortedVocab(hanjaId) {
  const hanja = HANJA[hanjaId];
  if (!hanja?.vocab?.length) return [];

  return hanja.vocab
    .map(word => ({ word, familiarity: VOCAB[word]?.familiarity ?? 9 }))
    .sort((a, b) => a.familiarity - b.familiarity)
    .slice(0, 5)
    .map(v => v.word);
}

function buildCard(word, index) {
  const card = document.createElement('div');
  card.className = 'vocab-card';
  card.textContent = word;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${word} 발음 듣기`);
  card.dataset.word = word;

  if (!ttsAvailable()) card.classList.add('tts-unavail');

  function activate() {
    speak(word);
    card.classList.add('tapped');
    setTimeout(() => card.classList.remove('tapped'), 300);
    _updateWordBlockForCard(word);
    console.log(`[card-deck] 탭: "${word}"`);
  }

  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
  });

  return card;
}

export function showCardDeck(hanjaId) {
  const container = getContainer();
  if (!container) {
    console.warn('[card-deck] #card-deck-container 없음');
    return;
  }

  clearCards();
  _currentHanjaId = hanjaId;

  const words = getSortedVocab(hanjaId);
  if (!words.length) {
    console.warn(`[card-deck] ${hanjaId}: 어휘 없음`);
    return;
  }

  words.forEach((word, i) => {
    const card = buildCard(word, i);
    container.appendChild(card);
  });

  // 컨테이너 노출: portrait 모드에서는 translateY(100%→0) 트랜지션
  container.classList.add('revealed');

  // 카드를 순차적으로 .revealed 추가 (부채꼴/슬라이드 진입 효과)
  const cards = container.querySelectorAll('.vocab-card');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('revealed'), 80 + i * 60);
  });

  console.log(`[card-deck] showCardDeck ${hanjaId} — ${words.length}개 카드`);
}

export function clearCards() {
  const container = getContainer();
  _currentHanjaId = null;
  if (!container) return;
  container.innerHTML = '';
  container.classList.remove('revealed');
}
