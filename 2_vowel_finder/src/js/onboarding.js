/**
 * 드래그 온보딩 1스텝 (PRD §7.4, TRD §5.2)
 * ㅏ 카드 1장 + 목표 네모 칸 (이동 거리 ≈ 화면 폭 20%).
 * 점선 화살표 + TTS "이쪽으로 끌어봐요!" 안내.
 * 스냅 성공 → 완료 애니메이션 → 세션 기록 저장 → end-screen.
 * 스냅 실패(±20dp 초과) → 카드 원위치 + 재시도 안내.
 */

import { state } from './state.js';
import { saveScore, calcStars } from './storage.js';
import { speak } from './tts.js';
import { playCorrect } from './sound.js';
import { goTo } from './ui.js';
import { initDrag } from './drag.js';

const GUIDE_TEXT = '이쪽으로 끌어봐요!';
const RETRY_TEXT = '조금만 더! 네모 칸까지 끌어봐요!';

/** 드래그 온보딩 시작 */
export function initOnboarding() {
  const g = state.game;
  g.phase = 'onboarding';
  g.answered = false;
  goTo('drag-onboarding');

  const card = document.getElementById('ob-card');
  const target = document.getElementById('ob-target');
  card.classList.remove('correct', 'snapping', 'dragging');
  card.style.transform = '';
  target.classList.remove('done', 'hover-active');
  document.getElementById('ob-feedback').textContent = GUIDE_TEXT;

  initDrag(card, [{ id: 'target', el: target }], {
    canDrag: () => g.phase === 'onboarding' && !g.answered,
    onDrop() {
      g.answered = true;
      completeOnboarding();
    },
    onMiss() {
      // 카드 원위치 복귀는 drag.js resetCard가 수행 — 재시도 안내만
      document.getElementById('ob-feedback').textContent = RETRY_TEXT;
      speak(RETRY_TEXT);
    },
  });

  speak(GUIDE_TEXT);
}

/** 스냅 성공 — 완료 애니메이션 + 칭찬 → 완료 화면 */
function completeOnboarding() {
  document.getElementById('ob-target').classList.add('done');
  document.getElementById('ob-card').classList.add('correct');
  document.getElementById('ob-feedback').textContent = '참 잘했어요!';
  playCorrect();
  speak('참 잘했어요!');
  setTimeout(finishGame, 900);
}

/** 세션 마감 — 기록 저장 + 완료 화면 렌더링 (드래그 온보딩 완료 = dragDone true) */
function finishGame() {
  const g = state.game;
  if (g.phase !== 'onboarding') return; // 도중 이탈 가드
  g.phase = 'end';

  const l0Total = g.l0Questions.length || 1;
  const l1Total = g.l1Queue.length || 1;
  const l0Acc = g.l0Correct / l0Total;
  const l1Acc = g.l1Correct / l1Total;
  const stars = calcStars(l0Acc, l1Acc, true);
  const durationMs = Date.now() - state.session.startedAt;

  saveScore({
    ts: Date.now(),
    l0Accuracy: l0Acc,
    l1Accuracy: l1Acc,
    dragDone: true,
    durationMs,
    stars,
  });

  renderEndScreen(g, l0Total, l1Total, l0Acc, stars);
  goTo('end-screen');
}

/** 완료 화면 — 실제 정답률·별점 표시 */
function renderEndScreen(g, l0Total, l1Total, l0Acc, stars) {
  const overall = Math.round(((g.l0Correct + g.l1Correct) / (l0Total + l1Total)) * 100);
  document.getElementById('end-accuracy').textContent = `${overall}%`;

  const starsEl = document.getElementById('end-stars');
  starsEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const span = document.createElement('span');
    span.textContent = '★';
    if (i >= stars) span.className = 'off';
    starsEl.appendChild(span);
  }
  starsEl.setAttribute('aria-label', `별 3개 중 ${stars}개`);

  // 정답률 ≥ 80% → Stage 2 직행 권장, 미달 → 반복 권장 (PRD §9.2)
  document.getElementById('end-feedback').textContent =
    l0Acc >= 0.8
      ? '정말 멋져요! 이제 음절 조립소로 가볼까요?'
      : '한 번 더 연습하면 더 잘할 수 있어요!';
}
