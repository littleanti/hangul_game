// decomp.js — 분해 애니메이션 컨트롤러 (M0 스텁 → M2 본 구현, TRD §5.3)
// 합성어 카드 → 두 한자 조각 분리 (CSS transform/opacity, pieceReveal 0.4s)

/** 정답 후 분해 결과 팝업 표시 (M2 본 구현) */
export function playDecomp(vocabItem) {
  // M2: .decomp-overlay + .decomp-card + .decomp-piece DOM 구성,
  //     각 조각에 음독·뜻 표시 + TTS 발화, "다음" 버튼 → 다음 라운드
  void vocabItem;
}

/** 팝업 닫기 (M2 본 구현) */
export function close() {
  const overlay = document.querySelector('.decomp-overlay');
  if (overlay) overlay.remove();
}
