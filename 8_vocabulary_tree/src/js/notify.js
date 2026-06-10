// Notification API + 일일 알림 스케줄 (간단)
// 권한 거부 → 인앱 배지 폴백 (settings에서)

import { nextHourMs } from './utils.js';

let dailyTimer = null;

export function isSupported() {
  return 'Notification' in window;
}

export async function requestPermission() {
  if (!isSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

function fire(title, body) {
  if (!isSupported() || Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon: './favicon.svg' }); } catch {}
}

export function scheduleDaily(hour) {
  if (dailyTimer) clearTimeout(dailyTimer);
  const ms = nextHourMs(hour) - Date.now();
  dailyTimer = setTimeout(() => {
    fire('🌱 오늘의 한자가 기다려요', '잠깐 들러서 어휘 나무를 키워볼까요?');
    scheduleDaily(hour); // 다음 날 재예약
  }, ms);
  return ms;
}

export function cancelDaily() {
  if (dailyTimer) {
    clearTimeout(dailyTimer);
    dailyTimer = null;
  }
}
