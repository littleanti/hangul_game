// 라운드 컨트롤러 — TRD §2.1 / PRD F11·F12 / PLAN M6
// initGame(showScreenFn): main.js에서 호출, showScreen 콜백 주입
// showMission(), showEnd(), restartGame(loadAndPlayFn)
import { SCREENS }                      from './config.js';
import { HANJA }                        from '../data/hanja.js';
import { setDiscoveryCallback }         from './stage.js';
import { recordDiscovery, loadProgress,
         resetSession, getSessionData } from './progress.js';
import { renderMissionScreen }          from './mission.js';
import { play as playAudio }            from './audio.js';

let _showScreen = null;

export function initGame(showScreenFn) {
  _showScreen = showScreenFn;
  loadProgress();
  setDiscoveryCallback(_onHanjaDiscovered);
  resetSession();
}

function _onHanjaDiscovered(hanjaId) {
  const isNew = recordDiscovery(hanjaId);
  if (isNew) playAudio('reward');

  _updateProgressUI();

  const hint = document.getElementById('dock-hint');
  if (hint) {
    hint.textContent = isNew
      ? `✨ 새 한자 '${hanjaId}' 발견! 카드를 탭해보세요`
      : '어휘 카드를 탭해보세요';
  }

  const btnMission = document.getElementById('btn-show-mission');
  if (btnMission) btnMission.hidden = false;
}

function _updateProgressUI() {
  const data = getSessionData();

  const countEl = document.getElementById('progress-count');
  if (countEl) countEl.textContent = String(data.sessionDiscoveries);

  const trophyEl = document.getElementById('progress-trophy');
  if (trophyEl) trophyEl.setAttribute('aria-label', `트로피 ${data.sessionDiscoveries}개`);
}

export function showMission() {
  const data = getSessionData();
  // Race 안전망: morph 중 미션 버튼이 (디버그/자동화로) 트리거된 경우
  // sessionDiscoveries 는 갱신되었지만 recordDiscovery 콜백 직전이라
  // sessionCollected 가 비어있을 수 있다. 짧게 대기 후 재시도.
  if (data.sessionDiscoveries > 0 && data.sessionCollected.length === 0) {
    setTimeout(showMission, 150);
    return;
  }
  renderMissionScreen(data.sessionCollected, { onEnd: showEnd });
  _showScreen?.(SCREENS.MISSION);
}

export function showEnd() {
  _renderEndScreen();
  _showScreen?.(SCREENS.END);
}

// 새 스테이지 진입·재시작 공통: 세션·dock UI를 초기 상태로 되돌림
export function startNewSession() {
  resetSession();
  _updateProgressUI();

  const hint = document.getElementById('dock-hint');
  if (hint) hint.textContent = '반짝이는 곳을 탭하거나 클릭하세요!';

  const btnMission = document.getElementById('btn-show-mission');
  if (btnMission) btnMission.hidden = true;
}

// loadAndPlayFn: main.js가 제공하는 stage 재로드 + showScreen(PLAY) 콜백
export function restartGame(loadAndPlayFn) {
  startNewSession();
  loadAndPlayFn();
}

function _renderEndScreen() {
  const data      = getSessionData();
  const container = document.querySelector('#end-screen .card-screen');
  if (!container) return;

  const starsStr = data.totalStars > 0
    ? '⭐'.repeat(Math.min(data.totalStars, 10)) + (data.totalStars > 10 ? ` +${data.totalStars - 10}` : '')
    : '아직 별이 없어요';

  const hanjaItems = data.sessionCollected
    .map(id => {
      const h = HANJA[id];
      return h ? `<div class="end-hanja-item">${id} <span>${h.reading}·${h.meaning}</span></div>` : '';
    })
    .join('');

  const discoveryMsg = data.sessionDiscoveries
    ? `이번 세션에 <strong>${data.sessionDiscoveries}개</strong> 한자를 발견했어요!`
    : '한자를 발견하지 못했어요. 다시 도전해보세요!';

  container.innerHTML = `
    <div class="celebration-emojis" aria-hidden="true">🎉✨🎊</div>
    <h2 class="end-title">오늘의 탐정 활동</h2>
    <div class="end-summary">
      <div class="end-stars" aria-label="누적 별 ${data.totalStars}개">${starsStr}</div>
      <div class="end-stat">${discoveryMsg}</div>
      ${hanjaItems ? `<div class="end-hanja-list">${hanjaItems}</div>` : ''}
    </div>
    <div class="end-actions">
      <button id="btn-end-replay"      class="btn big">🔄 다시하기</button>
      <button id="btn-end-collection"  class="btn mint">📚 도감 보기</button>
      <button id="btn-end-home"        class="btn ghost">🏠 홈으로</button>
    </div>
  `;
}
