export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleDistinct(pool, n, exclude = []) {
  const filtered = pool.filter(s => !exclude.includes(s));
  const shuffled = shuffle(filtered);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

export function longestCommonPrefix(filledChars, targetSyllables) {
  let len = 0;
  for (let i = 0; i < Math.min(filledChars.length, targetSyllables.length); i++) {
    if (filledChars[i] === targetSyllables[i]) len++;
    else break;
  }
  return len;
}

export function splitSyllables(word) {
  return Array.from(word);
}

export function vibrate(ms = 20) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
