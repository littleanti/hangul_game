/**
 * Level 1 — 모음 형태 분류 (PRD §5·§7.3, TRD §9.2·§9.4)
 * 모음 카드 1장 → 세로형 통 / 가로형 통에 탭 또는 드래그로 분류.
 * 비계(scaffold) 0~2단계: 문항 0~2 → 레이블+예시, 3~6 → 레이블만, 7~9 → 아이콘만.
 */

import { state, buildLevel1Queue, getScaffoldLevel } from './state.js';
import {
  FEEDBACK_DELAY_CORRECT,
  FEEDBACK_DELAY_WRONG,
  SNAP_FEEDBACK_DELAY,
} from './config.js';
import { speak } from './tts.js';
import { playCorrect, playWrong } from './sound.js';
import { goTo, updateHud } from './ui.js';
import { initDrag, resetCard } from './drag.js';
import { initOnboarding } from './onboarding.js';

let firstTry = true; // 첫 시도 기준 정답률 (level0과 동일 정책)

const HUD_LABEL = '🧺 모양 나누기';
const SHAPE_NAME = { vertical: '세로', horizontal: '가로' };

/** Level 1 시작 — 10개 모음 셔플 큐 + 비계 초기화 + 첫 문항 렌더링 */
export function initLevel1() {
  const g = state.game;
  g.phase = 'level1';
  g.l1Queue = buildLevel1Queue();
  g.l1Idx = 0;
  g.l1Correct = 0;
  g.answered = false;
  g.scaffoldLevel = 0;
  goTo('game-level1');
  renderBucketQuestion(0);
}

/** 문항 렌더링 — 모음 카드 + 세로형/가로형 통 2구역 + 비계 단계 반영 */
export function renderBucketQuestion(idx) {
  const g = state.game;
  g.l1Idx = idx;
  g.answered = false;
  firstTry = true;
  g.scaffoldLevel = getScaffoldLevel(idx); // 자동 전환 (TRD §9.4)

  const v = g.l1Queue[idx];

  updateHud(`${idx + 1} / ${g.l1Queue.length}`, HUD_LABEL, g.l1Correct);

  const card = document.getElementById('l1-card');
  card.textContent = v.char;
  card.setAttribute('aria-label', `${v.char} ${v.sound} 카드`);
  card.classList.remove('correct', 'snapping', 'dragging');
  card.style.transform = '';

  // 비계 단계 클래스 — game.css가 .bucket-example / .bucket-label 점진 숨김
  document.getElementById('l1-buckets').className = `buckets scaffold-${g.scaffoldLevel}`;
  document.querySelectorAll('#l1-buckets .bucket').forEach(b => {
    b.classList.remove('correct', 'wrong', 'shake', 'hover-active');
  });

  document.getElementById('l1-feedback').textContent = '';

  // 탭과 드래그 병행 — 카드를 통으로 끌어도 분류 가능 (PRD §5 Level 1)
  initDrag(card, [
    { id: 'vertical',   el: document.getElementById('bucket-vertical') },
    { id: 'horizontal', el: document.getElementById('bucket-horizontal') },
  ], {
    canDrag: () => g.phase === 'level1' && !g.answered,
    onDrop(zoneId) {
      // 스냅 흡착 600ms 후 정오답 판정 (TRD §5.4)
      g.answered = true;
      setTimeout(() => {
        if (g.phase !== 'level1') return;
        judge(zoneId, true);
      }, SNAP_FEEDBACK_DELAY);
    },
  });

  speak(v.sound);
}

/** 현재 문항 모음 다시 듣기 (TTS 버튼) */
export function speakCurrentL1() {
  const v = state.game.l1Queue[state.game.l1Idx];
  if (v) speak(v.sound);
}

/**
 * 통 탭 — answered 가드로 중복 탭 방지
 * @param {'vertical'|'horizontal'} shape
 */
export function tapBucket(shape) {
  const g = state.game;
  if (g.phase !== 'level1' || g.answered) return;
  judge(shape, false);
}

/** 정오답 판정 공통 (탭·드래그) */
function judge(shape, viaDrag) {
  const g = state.game;
  const v = g.l1Queue[g.l1Idx];
  const card = document.getElementById('l1-card');
  const bucket = document.getElementById(`bucket-${shape}`);
  const fb = document.getElementById('l1-feedback');

  if (shape === v.shape) {
    // ----- 정답 → 800ms 후 다음 문항 / 완료 시 드래그 온보딩 -----
    g.answered = true;
    if (firstTry) g.l1Correct += 1;
    card.classList.add('correct');
    bucket.classList.add('correct');
    playCorrect();
    speak(v.sound);
    fb.textContent = `딩동댕! ${v.char}는 ${SHAPE_NAME[shape]} 모음이에요!`;
    updateHud(`${g.l1Idx + 1} / ${g.l1Queue.length}`, HUD_LABEL, g.l1Correct);

    setTimeout(() => {
      if (g.phase !== 'level1') return;
      bucket.classList.remove('correct');
      const next = g.l1Idx + 1;
      if (next < g.l1Queue.length) {
        renderBucketQuestion(next);
      } else {
        initOnboarding(); // Level 1 완료 → goTo('drag-onboarding')
      }
    }, FEEDBACK_DELAY_CORRECT);
  } else {
    // ----- 오답: 통 흔들기 + 카드 원위치(드래그) → 1200ms 후 재시도 -----
    g.answered = true;
    firstTry = false;
    bucket.classList.add('wrong', 'shake');
    if (viaDrag) resetCard(card);
    playWrong();
    fb.textContent = '음… 다른 통에 들어갈 것 같아요!';

    setTimeout(() => {
      if (g.phase !== 'level1') return;
      bucket.classList.remove('wrong', 'shake');
      fb.textContent = '';
      g.answered = false;
    }, FEEDBACK_DELAY_WRONG);
  }
}
