/**
 * Selects words that share characters with each other (greedy).
 * Falls back to random if no matches found.
 */
function selectWords(data, count) {
  count = count || 6;
  var shuffled = data.slice().sort(function() { return Math.random() - 0.5; });
  var selected = [shuffled[0]];
  var remaining = shuffled.slice(1);

  while (selected.length < count && remaining.length > 0) {
    // Build set of all chars in selected words
    var selectedChars = {};
    for (var s = 0; s < selected.length; s++) {
      var w = selected[s].word;
      for (var k = 0; k < w.length; k++) selectedChars[w[k]] = true;
    }

    // Pick the remaining word that shares the most characters
    var bestIdx = 0;
    var bestScore = -1;
    for (var i = 0; i < remaining.length; i++) {
      var score = 0;
      var rw = remaining[i].word;
      for (var k = 0; k < rw.length; k++) {
        if (selectedChars[rw[k]]) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected;
}

/**
 * Internal single-attempt crossword generation.
 */
function _tryGenerate(wordObjects, maxSize) {
  maxSize = maxSize || 13;
  var SIZE = maxSize + 10;
  var OFFSET = Math.floor(SIZE / 2);

  // Working grid: null = empty
  var grid = [];
  for (var i = 0; i < SIZE; i++) {
    grid[i] = [];
    for (var j = 0; j < SIZE; j++) {
      grid[i][j] = null;
    }
  }

  var placements = [];

  function canPlace(word, row, col, direction) {
    var len = word.length;
    if (direction === 'across') {
      if (col < 0 || col + len > SIZE || row < 0 || row >= SIZE) return false;
      // Check cells before and after the word
      if (col > 0 && grid[row][col - 1] !== null) return false;
      if (col + len < SIZE && grid[row][col + len] !== null) return false;
    } else {
      if (row < 0 || row + len > SIZE || col < 0 || col >= SIZE) return false;
      if (row > 0 && grid[row - 1][col] !== null) return false;
      if (row + len < SIZE && grid[row + len][col] !== null) return false;
    }

    var hasIntersection = false;

    for (var i = 0; i < len; i++) {
      var r = direction === 'across' ? row : row + i;
      var c = direction === 'across' ? col + i : col;
      var ch = word[i];

      if (grid[r][c] !== null) {
        if (grid[r][c] !== ch) return false;
        hasIntersection = true;
      } else {
        // Empty cell: adjacent parallel cells must be empty
        if (direction === 'across') {
          if (r > 0 && grid[r - 1][c] !== null) return false;
          if (r < SIZE - 1 && grid[r + 1][c] !== null) return false;
        } else {
          if (c > 0 && grid[r][c - 1] !== null) return false;
          if (c < SIZE - 1 && grid[r][c + 1] !== null) return false;
        }
      }
    }

    return placements.length === 0 || hasIntersection;
  }

  function placeWord(word, row, col, direction) {
    for (var i = 0; i < word.length; i++) {
      var r = direction === 'across' ? row : row + i;
      var c = direction === 'across' ? col + i : col;
      grid[r][c] = word[i];
    }
  }

  function findCandidates(wordObj) {
    var word = wordObj.word;
    var candidates = [];
    for (var p = 0; p < placements.length; p++) {
      var placed = placements[p];
      var placedWord = placed.word;
      var oppDir = placed.direction === 'across' ? 'down' : 'across';
      for (var i = 0; i < word.length; i++) {
        for (var j = 0; j < placedWord.length; j++) {
          if (word[i] === placedWord[j]) {
            var row, col;
            if (oppDir === 'across') {
              row = placed.row + j;
              col = placed.col - i;
            } else {
              row = placed.row - i;
              col = placed.col + j;
            }
            if (canPlace(word, row, col, oppDir)) {
              candidates.push({ row: row, col: col, direction: oppDir });
            }
          }
        }
      }
    }
    return candidates;
  }

  // Place words
  for (var w = 0; w < wordObjects.length; w++) {
    var wordObj = wordObjects[w];
    var word = wordObj.word;

    if (placements.length === 0) {
      var startRow = OFFSET;
      var startCol = OFFSET - Math.floor(word.length / 2);
      placeWord(word, startRow, startCol, 'across');
      placements.push({
        word: word, row: startRow, col: startCol,
        direction: 'across', number: 0,
        meaning: wordObj.meaning, hint: wordObj.hint
      });
    } else {
      var candidates = findCandidates(wordObj);
      if (candidates.length > 0) {
        var chosen = candidates[Math.floor(Math.random() * candidates.length)];
        placeWord(word, chosen.row, chosen.col, chosen.direction);
        placements.push({
          word: word, row: chosen.row, col: chosen.col,
          direction: chosen.direction, number: 0,
          meaning: wordObj.meaning, hint: wordObj.hint
        });
      }
    }
  }

  if (placements.length === 0) {
    return { grid: [[]], placements: [], width: 0, height: 0 };
  }

  // Find bounding box
  var minRow = SIZE, maxRow = 0, minCol = SIZE, maxCol = 0;
  for (var r = 0; r < SIZE; r++) {
    for (var c = 0; c < SIZE; c++) {
      if (grid[r][c] !== null) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }

  // Add 1-cell border
  minRow = Math.max(0, minRow - 1);
  minCol = Math.max(0, minCol - 1);
  maxRow = Math.min(SIZE - 1, maxRow + 1);
  maxCol = Math.min(SIZE - 1, maxCol + 1);

  var height = maxRow - minRow + 1;
  var width = maxCol - minCol + 1;

  // Trim grid and adjust coordinates
  var trimmed = [];
  for (var tr = 0; tr < height; tr++) {
    trimmed[tr] = [];
    for (var tc = 0; tc < width; tc++) {
      trimmed[tr][tc] = grid[minRow + tr][minCol + tc];
    }
  }
  for (var p = 0; p < placements.length; p++) {
    placements[p].row -= minRow;
    placements[p].col -= minCol;
  }

  // Assign clue numbers
  var cellNumbers = {};
  var clueNum = 1;
  for (var tr = 0; tr < height; tr++) {
    for (var tc = 0; tc < width; tc++) {
      if (trimmed[tr][tc] === null) continue;
      var startsAcross = (tc === 0 || trimmed[tr][tc - 1] === null) &&
                         (tc + 1 < width && trimmed[tr][tc + 1] !== null);
      var startsDown   = (tr === 0 || trimmed[tr - 1][tc] === null) &&
                         (tr + 1 < height && trimmed[tr + 1][tc] !== null);
      if (startsAcross || startsDown) {
        var key = tr + ',' + tc;
        if (!cellNumbers[key]) {
          cellNumbers[key] = clueNum++;
        }
      }
    }
  }

  // Assign numbers to placements
  for (var p = 0; p < placements.length; p++) {
    var pl = placements[p];
    var key = pl.row + ',' + pl.col;
    pl.number = cellNumbers[key] || clueNum++;
  }
  placements.sort(function(a, b) { return a.number - b.number; });

  // Build final grid
  var finalGrid = [];
  for (var tr = 0; tr < height; tr++) {
    finalGrid[tr] = [];
    for (var tc = 0; tc < width; tc++) {
      var key = tr + ',' + tc;
      finalGrid[tr][tc] = {
        char: trimmed[tr][tc],
        cellNumber: cellNumbers[key] || null
      };
    }
  }

  return { grid: finalGrid, placements: placements, width: width, height: height };
}

/**
 * Generates a crossword layout, retrying with shuffled word order to maximise placements.
 * @param {Array} wordObjects - Array of {word, meaning, hint}
 * @param {number} maxSize - Max grid dimension (default 13)
 * @returns {Object} { grid, placements, width, height }
 */
function generateCrossword(wordObjects, maxSize) {
  maxSize = maxSize || 13;
  var best = null;
  var attempts = 8;

  for (var t = 0; t < attempts; t++) {
    // Shuffle word order each attempt so intersections vary
    var shuffled = wordObjects.slice().sort(function() { return Math.random() - 0.5; });
    var result = _tryGenerate(shuffled, maxSize);
    if (!best || result.placements.length > best.placements.length) {
      best = result;
    }
    if (best.placements.length >= wordObjects.length) break; // Can't do better
  }

  return best || { grid: [[]], placements: [], width: 0, height: 0 };
}
