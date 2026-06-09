// 정답 판정 (음절이 어휘의 다음 필요 음절과 일치하는지)
// 단어 = ['수', '영'] 라면, 음절을 순서대로 가져와야 함.

export function isCorrectNext(neededRemainingSyllables, syllable) {
  if (!neededRemainingSyllables.length) return false;
  return neededRemainingSyllables[0] === syllable;
}

export function isComplete(neededRemainingSyllables) {
  return neededRemainingSyllables.length === 0;
}
