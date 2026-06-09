// SVG 나무 렌더 + 가지 슬롯 좌표 계산
// 묘목 단계: 중앙에 뿌리 한자 + 위로 트렁크 + 4개의 가지 슬롯 (부채꼴 배치)

import { state } from '../state.js';

// SVG viewBox 기준 좌표계 (0,0)~(1000,1000). 실제 px와 동기화.
const VB = { w: 1000, h: 1000 };

// 가지 슬롯 4개 — 각도(왼쪽-90 ~ 오른쪽 90), 가지 길이.
const SLOT_LAYOUTS = {
  4: [
    { angle: -55, len: 320 },
    { angle: -22, len: 360 },
    { angle:  22, len: 360 },
    { angle:  55, len: 320 },
  ],
};

const TRUNK_BASE_X = VB.w / 2;
const TRUNK_BASE_Y = VB.h * 0.78;     // 뿌리 위치
const TRUNK_TOP_Y  = VB.h * 0.55;     // 가지가 분기되는 지점

function polar(originX, originY, angleDeg, len) {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // -90 to start from top
  return {
    x: originX + Math.cos(rad) * len,
    y: originY + Math.sin(rad) * len,
  };
}

export function getSlotLayout(count = 4) {
  return SLOT_LAYOUTS[count] || SLOT_LAYOUTS[4];
}

// 가지 끝점(잎 위치) — viewBox 좌표
export function getSlotEnd(slotIdx, count = 4) {
  const layout = getSlotLayout(count)[slotIdx];
  return polar(TRUNK_BASE_X, TRUNK_TOP_Y, layout.angle, layout.len);
}

// 가지 중간 (제어점) — 부드러운 곡선용
function getBranchPath(slotIdx, count = 4) {
  const layout = getSlotLayout(count)[slotIdx];
  const start = { x: TRUNK_BASE_X, y: TRUNK_TOP_Y };
  const end = polar(TRUNK_BASE_X, TRUNK_TOP_Y, layout.angle, layout.len);
  const mid = polar(TRUNK_BASE_X, TRUNK_TOP_Y, layout.angle, layout.len * 0.55);
  // 약간 outward curl
  const curl = layout.angle > 0 ? 30 : -30;
  return `M ${start.x} ${start.y} Q ${mid.x + curl} ${mid.y} ${end.x} ${end.y}`;
}

// 묘목 SVG 마크업
export function renderSapling(svg, hanja, completedSlots = []) {
  svg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
  svg.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  // 지면(언덕)
  const ground = document.createElementNS(ns, 'ellipse');
  ground.setAttribute('cx', TRUNK_BASE_X);
  ground.setAttribute('cy', VB.h * 0.92);
  ground.setAttribute('rx', VB.w * 0.45);
  ground.setAttribute('ry', VB.h * 0.08);
  ground.classList.add('ground');
  svg.appendChild(ground);

  // 트렁크
  const trunk = document.createElementNS(ns, 'path');
  trunk.classList.add('trunk');
  trunk.setAttribute('d', `M ${TRUNK_BASE_X} ${TRUNK_BASE_Y} Q ${TRUNK_BASE_X - 8} ${(TRUNK_BASE_Y + TRUNK_TOP_Y) / 2} ${TRUNK_BASE_X} ${TRUNK_TOP_Y}`);
  svg.appendChild(trunk);

  // 4개의 가지 후보
  const layout = getSlotLayout(4);
  layout.forEach((_, i) => {
    const branch = document.createElementNS(ns, 'path');
    branch.classList.add('branch-segment');
    if (completedSlots.includes(i)) {
      branch.classList.add('grown');
    } else {
      branch.classList.add('candidate');
    }
    branch.setAttribute('d', getBranchPath(i));
    branch.setAttribute('data-slot', i);
    svg.appendChild(branch);
  });

  // 뿌리 한자 (밑부분 동그라미 + 글자)
  const rootCircle = document.createElementNS(ns, 'circle');
  rootCircle.classList.add('root-circle');
  rootCircle.setAttribute('cx', TRUNK_BASE_X);
  rootCircle.setAttribute('cy', TRUNK_BASE_Y + 5);
  rootCircle.setAttribute('r', 56);
  svg.appendChild(rootCircle);

  const rootLabel = document.createElementNS(ns, 'text');
  rootLabel.classList.add('root-label');
  rootLabel.setAttribute('x', TRUNK_BASE_X);
  rootLabel.setAttribute('y', TRUNK_BASE_Y + 19);
  rootLabel.textContent = hanja?.code || '?';
  svg.appendChild(rootLabel);
}

// 가지 끝 — 화면 좌표 (px) 변환
export function slotEndToScreen(stageEl, slotIdx) {
  const end = getSlotEnd(slotIdx);
  const rect = stageEl.getBoundingClientRect();
  const x = (end.x / VB.w) * rect.width;
  const y = (end.y / VB.h) * rect.height;
  return { x, y };
}

// 가지 활성화 표시 (드래그 hover 시)
export function highlightBranch(svg, slotIdx, on) {
  const path = svg.querySelector(`path[data-slot="${slotIdx}"]`);
  if (!path) return;
  if (on) path.classList.add('highlight');
  else path.classList.remove('highlight');
}

// 활성 가지 = 현재 어휘가 자랄 가지. 나머지 후보는 흐리게.
export function setActiveCandidate(svg, slotIdx) {
  if (!svg) return;
  svg.querySelectorAll('.branch-segment.candidate').forEach((p) => {
    const idx = Number(p.dataset.slot);
    p.classList.toggle('active-candidate', idx === slotIdx);
    p.classList.toggle('inactive-candidate', slotIdx != null && idx !== slotIdx);
  });
}

// 가지 성장 — 후보 → grown
export function growBranch(svg, slotIdx) {
  const path = svg.querySelector(`path[data-slot="${slotIdx}"]`);
  if (!path) return;
  path.classList.remove('candidate', 'highlight');
  // reflow trick for animation
  void path.getBoundingClientRect();
  path.classList.add('grown');
}
