/**
 * 게임 코어 — 출제·정답 판정·진행 (TRD §2.3, §9)
 * M0: 화면 전환이 동작할 정도의 스텁. M2에서 출제·렌더링·판정 완성.
 */

import { state, resetGameState } from './state.js';
import { saveSettings } from './storage.js';
import { goTo } from './ui.js';

/**
 * 게임 시작 — M2: 설정 기반 문제 풀 구성(pickQuestions) + 첫 문제 렌더링.
 * M0에서는 상태 초기화 후 플레이 화면 전환만 수행.
 */
export function startGame() {
  resetGameState();
  // TODO(M2): pickQuestions(난이도 필터 풀, questionCount, lastGameIds) → renderQuestion()
  goTo('play-screen');
}

/** 홈 화면 레벨 버튼 — 난이도 지정 후 즉시 시작 */
export function startGameWithDifficulty(difficulty) {
  state.settings.difficulty = difficulty;
  saveSettings();
  startGame();
}

/**
 * 문제 풀에서 needed개 선별 — fresh 우선, 부족 시 반복 채움 (TRD §9.1, M2)
 */
export function pickQuestions(pool, needed, lastIds) {
  // TODO(M2)
  void pool; void needed; void lastIds;
  return [];
}

/** 현재 문제 렌더링 — [ ] 마커 → .blank 슬롯 치환 (XSS 안전, M2) */
export function renderQuestion(item) {
  // TODO(M2): renderSentenceText + renderDock + resetHint
  void item;
}

/** 정답 판정 — trim() 정규화 (TRD §9.3) */
export function checkAnswer(chosen, item) {
  return String(chosen).trim() === String(item.answer).trim();
}

/** 다음 문제 진행 — 마지막 문제 후 완료 화면 (M2) */
export function nextQuestion() {
  // TODO(M2): currentIdx++ → renderQuestion | showEndScreen
}

/** 완료 화면 표시 — 점수·정답률·오답 목록 + saveSession/saveLeaderboard (M2) */
export function showEndScreen() {
  // TODO(M2)
  goTo('end-screen');
}

/** 문장 카드 TTS 버튼 — 문장 전체 읽기 (M2) */
export function speakSentence() {
  // TODO(M2): speak(현재 문제 sentence, rate 0.85)
}

/** 완료 화면 — 오답 목록 펼침/접힘 */
export function toggleReview() {
  const list = document.getElementById('review-list');
  if (list) list.classList.toggle('open');
}
