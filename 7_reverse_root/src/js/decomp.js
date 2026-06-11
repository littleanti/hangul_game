// decomp.js — 분해 애니메이션 컨트롤러 (M2 본 구현, TRD §5.3)
// 합성어 → 두 한자 조각 분리: .decomp-overlay + .decomp-card + .decomp-piece DOM,
// pieceReveal 0.4s ease-out (transform/opacity만 사용 — compositor 친화, TRD §11).

import * as tts from './tts.js';
import * as audio from './audio.js';
import { HANJA } from '../data/hanja.js';

/**
 * 정답 후 분해 결과 팝업 표시.
 * 각 조각에 음독·뜻 표시 + TTS 자동 발화, "다음" 버튼 → onNext 콜백.
 * @param {object} vocabItem
 * @param {() => void} onNext — "다음" 버튼 탭 시 호출 (다음 라운드 진행)
 */
export function playDecomp(vocabItem, onNext) {
  close(); // 중복 방지

  const overlay = document.createElement('div');
  overlay.className = 'decomp-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', `${vocabItem.word} 분해 결과`);

  const card = document.createElement('div');
  card.className = 'decomp-card';

  // 합성어 헤더 — "화산 = 火 + 山"
  const title = document.createElement('div');
  title.className = 'decomp-word';
  title.textContent = `${vocabItem.word} (${vocabItem.hanja})`;
  card.appendChild(title);

  // 두 한자 조각 — pieceReveal 0.4s, 두 번째 조각은 살짝 지연
  const pieces = document.createElement('div');
  pieces.className = 'decomp-pieces';
  vocabItem.components.forEach((id, i) => {
    const h = HANJA[id];

    if (i > 0) {
      const plus = document.createElement('div');
      plus.className = 'decomp-plus';
      plus.textContent = '+';
      pieces.appendChild(plus);
    }

    const piece = document.createElement('div');
    piece.className = 'decomp-piece';
    piece.style.animationDelay = `${i * 0.15}s`;

    const char = document.createElement('span');
    char.className = 'hanja-char';
    char.textContent = id;

    const reading = document.createElement('span');
    reading.className = 'reading';
    reading.textContent = h.reading;

    const meaning = document.createElement('span');
    meaning.className = 'meaning';
    meaning.textContent = `${h.meaning} ${h.reading}`;

    piece.append(char, reading, meaning);
    pieces.appendChild(piece);
  });
  card.appendChild(pieces);

  // "다음" 버튼 → 다음 라운드
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn';
  nextBtn.textContent = '다음 ▶';
  nextBtn.addEventListener('click', () => {
    close();
    onNext?.();
  });
  card.appendChild(nextBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // 효과음 + 각 조각 음독·뜻 TTS 발화 (reading + meaning)
  audio.playDecomp();
  const parts = vocabItem.components
    .map(id => `${HANJA[id].meaning} ${HANJA[id].reading}`)
    .join(', ');
  tts.speak(`${vocabItem.word}! ${parts}`);
}

/** 팝업 닫기 */
export function close() {
  const overlay = document.querySelector('.decomp-overlay');
  if (overlay) overlay.remove();
}
