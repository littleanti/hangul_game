// 1일 1자 락 화면
import { tomorrowMidnight } from '../utils.js';
import { listLearnedWords, listLearnedHanja } from '../db.js';

function fmtTime(ms) {
  const d = new Date(ms);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 오전 12시`;
}

export async function renderLockScreen(screenEl, { hanja, completedWords = [], onTreeView, onDashboard }) {
  const totalWords = await listLearnedWords();
  const totalHanja = await listLearnedHanja();
  const next = tomorrowMidnight();
  screenEl.innerHTML = `
    <div class="lock-emoji">🌱✨</div>
    <h2>오늘 학습 완료!</h2>
    <p class="lock-message">
      <strong style="color:var(--coral)">${hanja.code}(${hanja.hun} ${hanja.eum})</strong>의<br>
      어휘 <strong>${completedWords.length}개</strong>를 모두 익혔어요.<br>
      과학습 방지를 위해 오늘은 여기까지!
    </p>
    <div class="lock-stats">
      <div class="row"><span>오늘 학습</span><strong>${completedWords.length}어휘</strong></div>
      <div class="row"><span>누적 한자</span><strong>${totalHanja.length}자</strong></div>
      <div class="row"><span>누적 어휘</span><strong>${totalWords.length}어휘</strong></div>
    </div>
    <p class="lock-next">⏰ 내일 또 만나요! · ${fmtTime(next)} 해제</p>
    <div class="splash-foot">
      <button class="btn small mint" id="lock-tree">🌳 나무 보기</button>
      <button class="btn small ghost" id="lock-dash">📊 학습 기록</button>
    </div>
  `;
  screenEl.querySelector('#lock-tree')?.addEventListener('click', () => onTreeView?.());
  screenEl.querySelector('#lock-dash')?.addEventListener('click', () => onDashboard?.());
}
