// 학술 어휘 분해 보스
// 어휘(예: '삼각형') 표시 + 셔플된 한자 카드 풀 → 사용자가 순서대로 슬롯에 매칭
// 부분 정답: 한자별 색상 힌트
// 정답: 골든 잎 보상

import { ACADEMIC, ACADEMIC_BY_ID } from '../../data/academic.js';
import { speak, cancel as cancelTTS } from '../tts.js';
import { shuffle, vibrate } from '../utils.js';
import { state } from '../state.js';
import { SCREENS } from '../config.js';

const STORAGE_KEY = 'boss_golden_leaves'; // db.profile에 저장될 키
let onCompleteCb = null;
let getDb = null;

// 어휘 선택: 학년 우선, 미해결 우선
async function pickBossWord(db) {
  const solved = new Set(await db.getProfile(STORAGE_KEY, []));
  const grade = state.profile.grade || '3';
  // 학년 일치 미해결 우선
  const unsolved = ACADEMIC.filter(a => !solved.has(a.id));
  const sameGrade = unsolved.filter(a => a.grade === grade);
  const pool = sameGrade.length > 0 ? sameGrade : (unsolved.length > 0 ? unsolved : ACADEMIC);
  return pool[Math.floor(Math.random() * pool.length)];
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${name}`);
  if (el) el.classList.add('active');
  state.ui.screen = name;
}

function fitCard(idx) {
  return `slot-${idx}`;
}

export async function startBoss({ onComplete, db } = {}) {
  onCompleteCb = onComplete;
  getDb = db;
  const word = await pickBossWord(db);
  state.ui.boss = { word, picks: [], finished: false };
  renderBoss(word);
  showScreen(SCREENS.BOSS);
}

function renderBoss(word) {
  const el = document.getElementById('screen-boss');
  const shuffled = shuffle(word.breakdown.map((b, i) => ({ ...b, originalIdx: i, uid: `${i}_${b.code}` })));
  el.innerHTML = `
    <div class="screen-header">
      <h2>🏛️ 학술 어휘 보스</h2>
      <button class="close-btn" id="boss-back">✕</button>
    </div>
    <div class="boss-card">
      <span class="boss-subject">${word.subject === 'math' ? '📐 수학' : '🔬 과학'}</span>
      <div class="boss-word">${word.text}</div>
      <p class="boss-prompt">한자를 순서대로 골라 분해해 봐요</p>
    </div>
    <div class="boss-slots" id="boss-slots">
      ${word.breakdown.map((b, i) => `
        <div class="boss-slot" data-idx="${i}" id="${fitCard(i)}">
          <span class="placeholder">?</span>
        </div>
      `).join('')}
    </div>
    <div class="boss-pool" id="boss-pool">
      ${shuffled.map(card => `
        <button class="boss-card-btn" data-uid="${card.uid}" data-code="${card.code}" data-original="${card.originalIdx}">
          <span class="glyph hanja">${card.code}</span>
          <span class="label">${card.hun} ${card.eum}</span>
        </button>
      `).join('')}
    </div>
    <div class="boss-actions">
      <button class="btn ghost small" id="boss-reset">↺ 다시</button>
      <button class="btn small" id="boss-check" disabled>✨ 확인</button>
    </div>
    <div class="boss-message" id="boss-message">한자 카드를 ${word.breakdown.length}개 골라 슬롯을 채워요</div>
  `;
  el.querySelector('#boss-back').addEventListener('click', exitBoss);
  el.querySelector('#boss-reset').addEventListener('click', () => resetBoss(word));
  el.querySelector('#boss-check').addEventListener('click', () => checkBoss(word));
  el.querySelectorAll('.boss-card-btn').forEach(btn => {
    btn.addEventListener('click', () => placeCard(btn, word));
  });
  el.querySelectorAll('.boss-slot').forEach(slot => {
    slot.addEventListener('click', () => removeCardFromSlot(slot, word));
  });
}

function placeCard(btn, word) {
  if (btn.classList.contains('used')) return;
  // 다음 빈 슬롯 찾기
  const slots = document.querySelectorAll('#boss-slots .boss-slot');
  const target = [...slots].find(s => !s.dataset.uid);
  if (!target) return;
  target.dataset.uid = btn.dataset.uid;
  target.dataset.code = btn.dataset.code;
  target.dataset.original = btn.dataset.original;
  target.innerHTML = `<span class="glyph hanja">${btn.dataset.code}</span>`;
  target.classList.add('filled');
  btn.classList.add('used');
  state.ui.boss.picks.push({ uid: btn.dataset.uid, code: btn.dataset.code, originalIdx: Number(btn.dataset.original) });
  updateCheckButton(word);
}

function removeCardFromSlot(slot, word) {
  if (!slot.dataset.uid) return;
  const uid = slot.dataset.uid;
  // remove from picks
  const idx = state.ui.boss.picks.findIndex(p => p.uid === uid);
  if (idx >= 0) state.ui.boss.picks.splice(idx, 1);
  // restore button
  const btn = document.querySelector(`.boss-card-btn[data-uid="${uid}"]`);
  if (btn) btn.classList.remove('used');
  slot.removeAttribute('data-uid');
  slot.removeAttribute('data-code');
  slot.removeAttribute('data-original');
  slot.innerHTML = `<span class="placeholder">?</span>`;
  slot.classList.remove('filled', 'correct', 'wrong');
  // 뒤 슬롯들도 후방 정렬 (compact)
  compactSlots();
  updateCheckButton(word);
}

function compactSlots() {
  const slots = [...document.querySelectorAll('#boss-slots .boss-slot')];
  const filled = slots.filter(s => s.dataset.uid);
  slots.forEach((s, i) => {
    if (i < filled.length) {
      const src = filled[i];
      if (src !== s) {
        s.dataset.uid = src.dataset.uid;
        s.dataset.code = src.dataset.code;
        s.dataset.original = src.dataset.original;
        s.innerHTML = src.innerHTML;
        s.classList.add('filled');
        src.removeAttribute('data-uid');
        src.removeAttribute('data-code');
        src.removeAttribute('data-original');
        src.innerHTML = `<span class="placeholder">?</span>`;
        src.classList.remove('filled');
      }
    } else {
      s.removeAttribute('data-uid');
      s.removeAttribute('data-code');
      s.removeAttribute('data-original');
      s.innerHTML = `<span class="placeholder">?</span>`;
      s.classList.remove('filled', 'correct', 'wrong');
    }
  });
}

function updateCheckButton(word) {
  const btn = document.getElementById('boss-check');
  if (!btn) return;
  const filled = state.ui.boss.picks.length;
  btn.disabled = filled !== word.breakdown.length;
}

function resetBoss(word) {
  state.ui.boss.picks = [];
  document.querySelectorAll('.boss-card-btn.used').forEach(b => b.classList.remove('used'));
  document.querySelectorAll('.boss-slot').forEach(s => {
    s.removeAttribute('data-uid');
    s.removeAttribute('data-code');
    s.removeAttribute('data-original');
    s.innerHTML = `<span class="placeholder">?</span>`;
    s.classList.remove('filled', 'correct', 'wrong');
  });
  setMessage(`한자 카드를 ${word.breakdown.length}개 골라 슬롯을 채워요`);
  updateCheckButton(word);
}

function setMessage(msg, className = '') {
  const el = document.getElementById('boss-message');
  if (!el) return;
  el.textContent = msg;
  el.className = 'boss-message ' + className;
}

async function checkBoss(word) {
  // 평가: 각 슬롯 위치에 original index 일치?
  const slots = [...document.querySelectorAll('#boss-slots .boss-slot')];
  let allCorrect = true;
  let partialCount = 0;
  slots.forEach((s, i) => {
    const orig = Number(s.dataset.original);
    const correctHere = orig === i;
    if (correctHere) {
      s.classList.add('correct'); s.classList.remove('wrong');
      partialCount++;
    } else {
      s.classList.add('wrong'); s.classList.remove('correct');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    state.ui.boss.finished = true;
    setMessage('🎉 정답! 학술 어휘를 마스터했어요', 'success');
    vibrate([20, 40, 20, 60, 20]);
    speak(word.text);
    // 골든 잎 영구 보존
    if (getDb) {
      const solved = new Set(await getDb.getProfile(STORAGE_KEY, []));
      solved.add(word.id);
      await getDb.setProfile(STORAGE_KEY, [...solved]);
    }
    showVictory(word);
  } else {
    vibrate([20, 30, 20]);
    setMessage(`${partialCount}개 정답! 다시 시도해 봐요`, 'partial');
  }
}

function showVictory(word) {
  const el = document.getElementById('screen-boss');
  setTimeout(() => {
    el.innerHTML = `
      <div class="boss-victory">
        <div class="victory-emoji">🌟✨🍃</div>
        <h2>학술 어휘 마스터!</h2>
        <div class="boss-word">${word.text}</div>
        <p class="boss-meaning">${word.meaning}</p>
        <div class="hanja-decompose" style="margin: 14px 0;">
          ${word.breakdown.map(b => `
            <div class="hanja-tile">
              <span class="glyph hanja">${b.code}</span>
              <span class="label">${b.hun} ${b.eum}</span>
            </div>
          `).join('')}
        </div>
        <p class="lock-message">골든 잎이 어휘 세계수에 영구 보존되었어요 🍃</p>
        <div class="splash-foot">
          <button class="btn small mint" id="boss-again">↺ 다른 어휘</button>
          <button class="btn small ghost" id="boss-home">🏠 홈</button>
        </div>
      </div>
    `;
    el.querySelector('#boss-again').addEventListener('click', async () => {
      await startBoss({ onComplete: onCompleteCb, db: getDb });
    });
    el.querySelector('#boss-home').addEventListener('click', exitBoss);
  }, 700);
}

function exitBoss() {
  cancelTTS();
  state.ui.boss = null;
  onCompleteCb?.();
}
