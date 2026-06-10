// 학습 기록(학부모 대시보드) — 진척 시각화

import { CONFIG } from '../config.js';
import * as db from '../db.js';

// ==================== 대시보드 콘텐츠 ====================
async function renderDashboardContent(screenEl) {
  const contentDiv = document.createElement('div');
  contentDiv.style.paddingBottom = '20px';

  // Header
  const headerDiv = document.createElement('div');
  headerDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; margin-bottom: 16px;">
      <h2 style="font-family: 'Jua', sans-serif; font-size: 1.6rem; color: var(--coral); margin: 0;">📊 학습 기록</h2>
      <button class="close-btn" id="dashboard-close" style="padding: 0; font-size: 1.4rem;">✕</button>
    </div>
  `;
  contentDiv.appendChild(headerDiv);

  // KPIs section
  const learnedHanja = await db.listLearnedHanja();
  const learnedWords = await db.listLearnedWords();
  const recentDaily = await db.listRecentDaily(60);

  // 정답률 계산 (ease >= 2.0인 어휘 / 전체 SRL 항목)
  let answeredCorrect = 0;
  let totalSrlItems = 0;
  for (const word of learnedWords) {
    const srl = await db.getSrl(word.wordId);
    if (srl) {
      totalSrlItems++;
      if (srl.ease >= 2.0) answeredCorrect++;
    }
  }
  const accuracy = totalSrlItems > 0 ? Math.round((answeredCorrect / totalSrlItems) * 100) : 0;

  // 연속일 계산 (최근부터 역순, completedCount > 0인 날만)
  let consecutiveDays = 0;
  const today = new Date();
  for (let i = 0; i < 366; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daily = recentDaily.find(r => r.date === dateStr);
    if (daily && daily.completedCount > 0) {
      consecutiveDays++;
    } else if (i > 0) {
      break;
    }
  }

  const kpiSection = document.createElement('div');
  kpiSection.className = 'dashboard-section';
  kpiSection.innerHTML = `
    <h3>학습 현황</h3>
    <div class="kpi-grid">
      <div class="kpi">
        <div class="label">누적 한자 수</div>
        <div class="value">${learnedHanja.length}</div>
      </div>
      <div class="kpi">
        <div class="label">누적 어휘 수</div>
        <div class="value">${learnedWords.length}</div>
      </div>
      <div class="kpi">
        <div class="label">정답률</div>
        <div class="value">${accuracy}%</div>
      </div>
      <div class="kpi">
        <div class="label">연속일</div>
        <div class="value">${consecutiveDays}일</div>
      </div>
    </div>
  `;
  contentDiv.appendChild(kpiSection);

  // SRL 큐 잔여
  const dueSrlWords = await db.dueSrlWords();
  const srlSection = document.createElement('div');
  srlSection.className = 'dashboard-section';
  srlSection.innerHTML = `
    <h3>복습 대기</h3>
    <div style="text-align: center; padding: 10px 0;">
      <div style="font-family: 'Jua', sans-serif; font-size: 2rem; color: var(--coral);">${dueSrlWords.length}</div>
      <div style="font-family: 'Gowun Dodum', sans-serif; font-size: 0.9rem; color: var(--color-text-dim);">어휘 대기 중</div>
    </div>
  `;
  contentDiv.appendChild(srlSection);

  // 요일별 분포
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const weekCount = [0, 0, 0, 0, 0, 0, 0];
  for (const daily of recentDaily) {
    if (daily.completedCount > 0) {
      const d = new Date(daily.date + 'T00:00:00');
      weekCount[d.getDay()]++;
    }
  }
  const maxCount = Math.max(...weekCount, 1);

  const distSection = document.createElement('div');
  distSection.className = 'dashboard-section';
  distSection.innerHTML = `<h3>요일별 학습 분포</h3>`;
  const distContent = document.createElement('div');
  for (let i = 0; i < 7; i++) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const pct = (weekCount[i] / maxCount) * 100 || 0;
    row.innerHTML = `
      <div style="text-align: center; font-size: 0.85rem; font-weight: bold;">${dayOfWeek[i]}</div>
      <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
      <div style="text-align: right; font-size: 0.85rem;">${weekCount[i]}일</div>
    `;
    distContent.appendChild(row);
  }
  distSection.appendChild(distContent);
  contentDiv.appendChild(distSection);

  // 알림 설정
  const notifyEnabled = await db.getProfile('notify', false);
  const notifySection = document.createElement('div');
  notifySection.className = 'dashboard-section';
  notifySection.innerHTML = `
    <h3>알림 설정</h3>
    <div style="padding: 10px 0;">
      <label style="display: flex; align-items: center; gap: 10px; font-family: 'Gowun Dodum', sans-serif; font-size: 0.95rem;">
        <input type="checkbox" id="dashboard-notify-toggle" ${notifyEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <span>매일 ${CONFIG.NOTIFY_DEFAULT_HOUR}시에 알림</span>
      </label>
    </div>
  `;
  contentDiv.appendChild(notifySection);

  screenEl.appendChild(contentDiv);

  // 이벤트 리스너
  document.getElementById('dashboard-notify-toggle').addEventListener('change', async (e) => {
    await db.setProfile('notify', e.target.checked);
  });
}

function setupDashboardCloseHandler(screenEl, onClose) {
  const closeBtn = document.getElementById('dashboard-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      screenEl.innerHTML = '';
      if (onClose) {
        onClose();
      } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const splash = document.getElementById('screen-splash');
        if (splash) splash.classList.add('active');
      }
    });
  }
}

// ==================== 진입점 ====================
export async function openDashboard(opts = {}) {
  const screenEl = document.getElementById('screen-dashboard');
  if (!screenEl) {
    console.error('Dashboard screen element not found');
    return;
  }

  // 화면 전환
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screenEl.classList.add('active');

  // 대시보드 콘텐츠 렌더
  screenEl.innerHTML = '';
  await renderDashboardContent(screenEl);
  setupDashboardCloseHandler(screenEl, opts.onClose);
}
