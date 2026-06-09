import { longestCommonPrefix } from './utils.js';
import { animateShake, animateSparkle } from './ui.js';

export function renderSlots(word) {
  const area = document.getElementById('slot-area');
  if (!area) return;
  area.innerHTML = '';

  const hint = document.createElement('div');
  hint.className = 'word-hint';
  hint.textContent = word.hint ?? '';
  area.appendChild(hint);

  const row = document.createElement('div');
  row.className = 'slot-row';
  row.id = 'slot-row';
  for (let i = 0; i < word.syllables.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'syllable-slot empty';
    slot.dataset.idx = i;
    row.appendChild(slot);
  }
  area.appendChild(row);
}

export function fillNextSlot(char, lockedCount) {
  const slots = [...document.querySelectorAll('.syllable-slot')];
  for (let i = lockedCount; i < slots.length; i++) {
    if (slots[i].classList.contains('empty')) {
      slots[i].textContent = char;
      slots[i].classList.remove('empty');
      slots[i].classList.add('filled');
      return i;
    }
  }
  return -1;
}

export function getFilledChars() {
  return [...document.querySelectorAll('.syllable-slot')].map(s =>
    s.classList.contains('empty') ? null : s.textContent
  );
}

export function checkSlots(targetWord) {
  const chars = getFilledChars();
  if (chars.some(c => c === null)) return 'incomplete';
  const word = chars.join('');
  if (word === targetWord.word) return 'correct';
  const prefixLen = longestCommonPrefix(chars, targetWord.syllables);
  return { status: 'wrong', correctPrefixLen: prefixLen };
}

export function lockSlots(count) {
  const slots = [...document.querySelectorAll('.syllable-slot')];
  for (let i = 0; i < count; i++) {
    if (slots[i]) slots[i].classList.add('locked');
  }
}

export function fillSlotAt(char, idx) {
  const slot = document.querySelector(`.syllable-slot[data-idx="${idx}"]`);
  if (!slot || !slot.classList.contains('empty')) return;
  slot.textContent = char;
  slot.classList.remove('empty');
  slot.classList.add('filled');
}

export function clearSlotsFrom(fromIndex) {
  const slots = [...document.querySelectorAll('.syllable-slot')];
  for (let i = fromIndex; i < slots.length; i++) {
    slots[i].textContent = '';
    slots[i].classList.remove('filled', 'wrong');
    slots[i].classList.add('empty');
  }
}

export function markSlotsWrong(fromIndex) {
  const slots = [...document.querySelectorAll('.syllable-slot')];
  for (let i = fromIndex; i < slots.length; i++) {
    if (!slots[i].classList.contains('empty')) {
      slots[i].classList.add('wrong');
    }
  }
}

export function celebrateSlots() {
  const row = document.getElementById('slot-row');
  if (row) animateSparkle(row);
}

export function shakeSlots() {
  const row = document.getElementById('slot-row');
  if (row) animateShake(row);
}
