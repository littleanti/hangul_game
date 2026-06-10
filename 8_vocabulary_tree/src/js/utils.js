// 순수 유틸 함수들

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function tomorrowMidnight() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function nextHourMs(hour) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// 진동 피드백 (지원 디바이스만)
export function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// SHA-256 (Web Crypto)
export async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 안전한 텍스트 렌더링용 헬퍼 (HTML 주입 방지)
export function setText(el, text) {
  if (el) el.textContent = text;
}

// 한자 폭 추정 (한국어 음절 width 1, 한자 width 1.2)
export function syllablesFromText(text) {
  return [...text];
}

// 음절 풀 (정답 + 가짜 분산)
const DUMMY_SYLLABLES = [
  '가','나','다','라','마','바','사','아','자','차','카','타','파','하',
  '강','경','과','광','구','국','금','기','난','내','녀','노','단','대',
  '도','동','등','람','로','류','마','만','명','목','문','민','반','법',
  '복','부','분','사','산','삼','상','색','생','석','선','성','세','소',
  '수','시','신','심','안','약','양','어','업','연','영','오','왕','외',
  '용','우','원','월','위','유','육','이','인','일','자','장','적','전',
  '점','정','조','종','주','중','지','직','진','집','차','천','초','촌',
  '추','출','평','풍','학','한','해','행','형','호','화','회','효',
];

export function buildSyllablePool(answerSyllables, dummyCount = 4) {
  const dummies = [];
  const seen = new Set(answerSyllables);
  while (dummies.length < dummyCount) {
    const s = pick(DUMMY_SYLLABLES);
    if (!seen.has(s)) {
      dummies.push(s);
      seen.add(s);
    }
  }
  return shuffle([...answerSyllables, ...dummies]);
}
