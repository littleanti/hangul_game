/**
 * 3단 단서 페이딩 (TRD §5.4, §9.2)
 *
 * 페이딩 단계:
 *   0 — 단서 없음 (초기)
 *   1 — 음뜻 라벨 + 노란 하이라이트
 *   2 — 하이라이트만 (라벨 display:none)
 *   3 — 단서 완전 제거 + 힌트 버튼 비활성화
 *
 * highlight 인덱스는 sentence 원문([ ] 마커 포함) 기준이며 끝 인덱스는 미포함.
 * 부분 문자열 치환은 createTextNode + insertBefore 조합 — XSS 없이 안전 (TRD §9.2).
 */

import { state } from './state.js';
import { MAX_HINT_LEVEL } from './config.js';

// sentence 원문 속 빈칸 마커 — 렌더링 시 .blank 스팬으로 치환되지만
// highlight 인덱스 계산에는 마커 길이(3)를 그대로 사용한다.
const BLANK_MARKER = '[ ]';

/**
 * 현재 문제의 단서를 level에 맞게 렌더링 (멱등 — 어떤 단계에서 호출해도 동일 결과)
 * @param {object} item  현재 문제 (SentenceItem)
 * @param {number} level 0 | 1 | 2 | 3
 */
export function renderHint(item, level) {
  const p = document.getElementById('sentence-text');
  const area = document.getElementById('hint-area');
  if (!p || !area || !item) return;

  // 기존 하이라이트 제거 후 단계별로 다시 적용
  removeHighlight(p);
  area.innerHTML = '';

  // level 1·2 — highlight 인덱스 기반 <mark class="hl"> 래핑
  if (level === 1 || level === 2) {
    const conf =
      level === 1
        ? item.hint && item.hint.level1
        : (item.hint && (item.hint.level2 || item.hint.level1));
    if (conf && Array.isArray(conf.highlight)) {
      applyHighlight(p, item.sentence, conf.highlight);
    }
  }

  // 음뜻 라벨 — level 1 표시, level 2는 DOM 유지 + display:none (PLAN M3)
  const labelText = item.hint && item.hint.level1 && item.hint.level1.label;
  if ((level === 1 || level === 2) && labelText) {
    const label = document.createElement('span');
    label.className = 'hint-label';
    label.textContent = `💡 ${labelText}`;
    if (level === 2) label.style.display = 'none';
    area.appendChild(label);
  }

  updateHintButton();
}

/**
 * 새 문제 진입 시 단서 상태 초기화
 * (game.renderQuestion이 문장을 다시 그리므로 hintLevel·버튼·라벨 영역만 복원)
 */
export function resetHint() {
  state.game.hintLevel = 0;
  const area = document.getElementById('hint-area');
  if (area) area.innerHTML = '';
  const p = document.getElementById('sentence-text');
  if (p) removeHighlight(p);
  updateHintButton();
}

/**
 * 힌트 버튼 탭 — hintLevel 1씩 증가 → renderHint (TRD §5.4)
 * - 응답 후·MAX 도달 후 무시 (버튼도 비활성화됨)
 * - 사용한 단계는 game.judgeAnswer가 hintLevelUsed로 세션 기록에 저장
 */
export function onHintButton() {
  const g = state.game;
  if (g.answered) return;
  if (g.hintLevel >= MAX_HINT_LEVEL) return;
  const item = g.questions[g.currentIdx];
  if (!item) return;
  g.hintLevel += 1;
  renderHint(item, g.hintLevel);
}

/**
 * 힌트 버튼 표시·활성 상태 동기화
 * - hintEnabled === false → 미표시 (TRD §5.4)
 * - 응답 후 또는 level 3 도달 → 비활성화
 */
export function updateHintButton() {
  const btn = document.getElementById('hint-button');
  if (!btn) return;
  btn.style.display = state.settings.hintEnabled ? '' : 'none';
  btn.disabled = state.game.answered || state.game.hintLevel >= MAX_HINT_LEVEL;
}

/* ========== 내부 — 하이라이트 DOM 조작 ========== */

/**
 * 문장 DOM(#sentence-text)에 [start, end) 구간 <mark class="hl"> 래핑.
 * 텍스트 노드만 분할 대상 — .blank 스팬은 마커 길이(3)만큼 커서만 전진.
 * createTextNode 기반이라 데이터에 마크업이 섞여도 안전 (TRD §9.2, R1).
 */
function applyHighlight(p, sentence, range) {
  const max = String(sentence).length;
  let start = Math.max(0, Math.min(Number(range[0]) || 0, max));
  let end = Math.max(start, Math.min(Number(range[1]) || 0, max));
  if (start === end) return;

  let cursor = 0;
  // 분할 중 childNodes가 변하므로 스냅숏 순회
  Array.from(p.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const len = text.length;
      const s = Math.max(start, cursor);
      const e = Math.min(end, cursor + len);
      if (s < e) {
        const frag = document.createDocumentFragment();
        const before = text.slice(0, s - cursor);
        const middle = text.slice(s - cursor, e - cursor);
        const after = text.slice(e - cursor);
        if (before) frag.appendChild(document.createTextNode(before));
        const mark = document.createElement('mark');
        mark.className = 'hl';
        mark.appendChild(document.createTextNode(middle));
        frag.appendChild(mark);
        if (after) frag.appendChild(document.createTextNode(after));
        p.insertBefore(frag, node);
        p.removeChild(node);
      }
      cursor += len;
    } else if (node.classList && node.classList.contains('blank')) {
      cursor += BLANK_MARKER.length;
    }
  });
}

/** <mark class="hl"> 언래핑 — 텍스트 노드로 환원 후 normalize */
function removeHighlight(p) {
  p.querySelectorAll('mark.hl').forEach(mark => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  p.normalize();
}
