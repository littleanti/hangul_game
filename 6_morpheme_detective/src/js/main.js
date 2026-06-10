// 진입점 — 화면 전환·TTS/Audio unlock·스테이지 로드
import { SCREENS }                      from './config.js';
import { STAGES, STAGE_IDS }           from '../data/stages.js';
import { HANJA_IDS }                   from '../data/hanja.js';
import { state }                       from './state.js';
import { loadStage, unloadStage }       from './stage.js';
import { unlock as unlockTts,
         cancel as cancelTts }          from './tts.js';
import { unlock as unlockAudio,
         stopAll as stopAudio }         from './audio.js';
import { attachMagnifier,
         detachMagnifier }              from './magnifier.js';
import { releaseAll }                   from './pointer.js';
import { clearCards }                   from './card-deck.js';
import { initGame, showMission,
         showEnd, restartGame,
         startNewSession }              from './game.js';
import { attachViewport, detachViewport } from './viewport.js';
import { renderCollectionScreen }         from './collection.js';
import { loadSettings }                   from './storage.js';
import { initSettings, renderSettings }   from './settings.js';

let activeScreen   = null;
let selectedStageId = null;
let _collectionReturnTo = null; // 도감 진입 직전 화면 → 돌아가기에서 사용

// 홈 화면 진행률 — "찾은 한자 N / 전체" (도감 수집 현황과 동일 소스)
function _renderHomeProgress() {
  const found = document.getElementById('home-progress-found');
  const total = document.getElementById('home-progress-total');
  if (found) found.textContent = String(state.progress.collected.size);
  if (total) total.textContent = String(HANJA_IDS.length);
}

export function showScreen(id) {
  cancelTts();
  stopAudio();
  const stageCanvas = document.getElementById('stage-canvas');
  if (stageCanvas) releaseAll(stageCanvas);
  if (id !== SCREENS.PLAY) {
    detachMagnifier();
    detachViewport();
    clearCards();
  }
  // 홈 진입 시 최신 수집 현황 반영 (게임·도감을 거쳐 돌아와도 갱신)
  if (id === SCREENS.START) _renderHomeProgress();

  if (activeScreen) activeScreen.classList.remove('active');
  activeScreen = document.getElementById(id);
  if (activeScreen) activeScreen.classList.add('active');
}

async function _loadAndPlay(stageId) {
  selectedStageId = stageId ?? selectedStageId ?? 'parking-lot';
  startNewSession();
  try {
    await loadStage(selectedStageId);
    showScreen(SCREENS.PLAY);
    attachMagnifier(document.getElementById('stage-canvas'));
    attachViewport(document.getElementById('stage-canvas'));
  } catch (e) {
    console.error('[main] stage 로드 실패:', e);
  }
}

// F3: stages.js 기반 동적 렌더 — 카드 마크업만 갱신. click listener 는 _bindStageSelectOnce 가 단 한 번 등록.
function _renderStageSelect() {
  const list = document.getElementById('stage-card-list');
  if (!list) return;

  list.innerHTML = STAGE_IDS.map(id => {
    const s = STAGES[id];
    return `
      <button class="stage-card" data-stage-id="${id}" role="listitem"
              aria-label="${s.label ?? s.name} 사건 선택">
        <div class="stage-card-name">${s.name}</div>
        <div class="stage-card-desc">${s.description}</div>
      </button>
    `;
  }).join('');
}

let _stageSelectBound = false;
function _bindStageSelectOnce() {
  if (_stageSelectBound) return;
  const list = document.getElementById('stage-card-list');
  if (!list) return;
  list.addEventListener('click', async e => {
    const card = e.target.closest('.stage-card');
    if (!card) return;
    await _loadAndPlay(card.dataset.stageId);
  });
  _stageSelectBound = true;
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initSettings();
  initGame(showScreen);
  showScreen(SCREENS.START);

  // 첫 사용자 제스처 안에서 TTS + AudioContext unlock (iOS Safari 자동재생 정책)
  document.getElementById('btn-start')?.addEventListener('click', () => {
    unlockTts();
    unlockAudio();
    _renderStageSelect();
    _bindStageSelectOnce();
    showScreen(SCREENS.STAGE_SELECT);
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    renderSettings();
    showScreen(SCREENS.SETTINGS);
  });

  // 홈 → 도감 바로가기 (돌아가면 홈)
  document.getElementById('btn-home-collection')?.addEventListener('click', () => {
    _collectionReturnTo = SCREENS.START;
    renderCollectionScreen();
    showScreen(SCREENS.COLLECTION);
  });

  document.getElementById('btn-stage-select-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-settings-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-settings-close')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-play-back')?.addEventListener('click', () => {
    unloadStage();
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-show-mission')?.addEventListener('click', showMission);

  // 이벤트 위임: 종료 화면 버튼 (game.js가 동적으로 렌더링)
  document.getElementById('end-screen')?.addEventListener('click', e => {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target.id === 'btn-end-replay') {
      restartGame(() => {
        unloadStage();
        _loadAndPlay(selectedStageId);
      });
    } else if (target.id === 'btn-end-collection') {
      _collectionReturnTo = SCREENS.END;
      renderCollectionScreen();
      showScreen(SCREENS.COLLECTION);
    } else if (target.id === 'btn-end-home') {
      unloadStage();
      showScreen(SCREENS.START);
    }
  });

  document.getElementById('collection-screen')?.addEventListener('click', e => {
    if (e.target.id === 'btn-collection-back') {
      showScreen(_collectionReturnTo ?? SCREENS.START);
    }
  });
});
