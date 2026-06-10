/* =========================================================
   사자성어 크로스워드 — app.js
   Hidden-input architecture: one <input id="hidden-input">
   captures all keyboard / IME events. Cell divs use a
   <span class="cell-char"> for display only — no per-cell
   inputs, so Korean IME composition never breaks on focus
   switches and cursor direction is always driven by
   state.activeDirection.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- IME guards ---------- */
  var isComposing        = false;
  var pendingComposition = false;  // blocks `input` from re-firing after compositionend
  var sessionCommittedCount = 0;    // syllables committed inside current composition session

  /* ---------- Korean jongseong table (index 0 = none) ---------- */
  var JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  /* ---------- Mobile IME helpers ---------- */
  function isJamo(ch) {
    if (!ch) return false;
    var code = ch.charCodeAt(0);
    return (code >= 0x3131 && code <= 0x3163) || (code >= 0x1100 && code <= 0x11FF);
  }

  /* Scans raw from right, skipping trailing jamo, returns last complete char.
     Handles keyboards that append a leading consonant of the next syllable to
     compositionend data (e.g. "기ㄴ" → returns "기"). Returns '' if all jamo. */
  function extractCommitChar(raw) {
    if (!raw) return '';
    for (var i = raw.length - 1; i >= 0; i--) {
      if (!isJamo(raw[i])) return raw[i];
    }
    return '';
  }

  /* ---------- next-cell consonant preview ---------- */
  // Tracks which cell is currently showing a preview so we can restore it.
  var previewCell = null; // { r, c, prevText }

  function clearPreview() {
    if (!previewCell) return;
    var pd = getCellDiv(previewCell.r, previewCell.c);
    if (pd) {
      var ps = pd.querySelector('.cell-char');
      if (ps) {
        ps.textContent = previewCell.prevText;
        ps.classList.remove('cell-char-preview');
      }
    }
    previewCell = null;
  }

  /* ---------- State ---------- */
  var state = {
    crossword:       null,   // { grid, placements, width, height }
    userAnswers:     null,   // 2-D array of entered chars ('')
    revealed:        null,   // 2-D array of booleans
    activeRow:       -1,
    activeCol:       -1,
    activeDirection: 'across',
    score:           0,
    hintsUsed:       0,
    fullyRevealed:   false   // true after 정답(reveal-all) — blocks win modal/score
  };

  function isHangulSyllable(ch) {
    if (!ch) return false;
    var code = ch.codePointAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
  }

  function isModalOpen() {
    return !resultModal.classList.contains('hidden');
  }

  /* ---------- DOM refs ---------- */
  var gridEl       = document.getElementById('crossword-grid');
  var acrossClues  = document.getElementById('across-clues');
  var downClues    = document.getElementById('down-clues');
  var scoreEl      = document.getElementById('score');
  var checkBtn     = document.getElementById('check-btn');
  var hintBtn      = document.getElementById('hint-btn');
  var revealBtn    = document.getElementById('reveal-btn');
  var newGameBtn   = document.getElementById('new-game-btn');
  var resultModal  = document.getElementById('result-modal');
  var resultEmoji  = document.getElementById('result-emoji');
  var resultTitle  = document.getElementById('result-title');
  var resultMsg    = document.getElementById('result-message');
  var modalNewGame = document.getElementById('modal-new-game-btn');
  var wordPopup    = document.getElementById('word-popup');
  var popupNumber  = document.getElementById('popup-number');
  var popupHint    = document.getElementById('popup-hint');
  var hiddenInput  = document.getElementById('hidden-input');

  /* =====================================================
     INIT
     ===================================================== */
  function init() {
    var words = selectWords(SAJASUNGO_DATA, 6);
    var cw = generateCrossword(words);
    var tries = 0;
    while (cw.placements.length < 3 && tries++ < 6) {
      words = selectWords(SAJASUNGO_DATA, 6);
      cw = generateCrossword(words);
    }

    state.crossword       = cw;
    state.userAnswers     = make2D(cw.height, cw.width, '');
    state.revealed        = make2D(cw.height, cw.width, false);
    state.activeRow       = -1;
    state.activeCol       = -1;
    state.activeDirection = 'across';
    state.hintsUsed       = 0;
    state.fullyRevealed   = false;

    renderGrid();
    renderClues();
    hideModal();
    hidePopup();

    // Auto-select first placement
    var first = cw.placements.find(function (p) { return p.direction === 'across'; })
             || cw.placements[0];
    if (first) selectPlacement(first);
  }

  function make2D(rows, cols, val) {
    var a = [];
    for (var r = 0; r < rows; r++) {
      a[r] = [];
      for (var c = 0; c < cols; c++) a[r][c] = val;
    }
    return a;
  }

  /* =====================================================
     GRID RENDERING  (span-based, no per-cell inputs)
     ===================================================== */
  function renderGrid() {
    var cw = state.crossword;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + cw.width  + ', var(--cell-size))';
    gridEl.style.gridTemplateRows    = 'repeat(' + cw.height + ', var(--cell-size))';

    for (var r = 0; r < cw.height; r++) {
      for (var c = 0; c < cw.width; c++) {
        var cell = cw.grid[r][c];
        var div  = document.createElement('div');
        div.className  = 'cell';
        div.dataset.row = r;
        div.dataset.col = c;

        if (cell.char === null) {
          div.classList.add('black');
        } else {
          // Cell number badge
          if (cell.cellNumber) {
            var num = document.createElement('span');
            num.className   = 'cell-number';
            num.textContent = cell.cellNumber;
            div.appendChild(num);
          }
          // Character display span
          var cs = document.createElement('span');
          cs.className = 'cell-char';
          if (state.revealed[r][c]) {
            cs.textContent = cell.char;
            div.classList.add('revealed');
          } else if (state.userAnswers[r][c]) {
            cs.textContent = state.userAnswers[r][c];
          }
          div.appendChild(cs);
          div.addEventListener('click', onCellClick);
        }
        gridEl.appendChild(div);
      }
    }
  }

  /* =====================================================
     CLUES RENDERING
     ===================================================== */
  function renderClues() {
    acrossClues.innerHTML = '';
    downClues.innerHTML   = '';
    state.crossword.placements.forEach(function (pl) {
      var li    = document.createElement('li');
      li.className          = 'clue-item';
      li.dataset.number     = pl.number;
      li.dataset.direction  = pl.direction;

      var badge = document.createElement('span');
      badge.className   = 'clue-num-badge';
      badge.textContent = pl.number;

      var text = document.createElement('span');
      text.className   = 'clue-text';
      text.textContent = pl.hint;

      li.appendChild(badge);
      li.appendChild(text);
      li.addEventListener('click', function () { selectPlacement(pl); });

      (pl.direction === 'across' ? acrossClues : downClues).appendChild(li);
    });
  }

  /* =====================================================
     CELL HELPERS
     ===================================================== */
  function getCellDiv(r, c) {
    return gridEl.querySelector('.cell[data-row="' + r + '"][data-col="' + c + '"]');
  }

  function setCellChar(r, c, ch) {
    var div = getCellDiv(r, c);
    if (!div) return;
    var span = div.querySelector('.cell-char');
    if (span) span.textContent = ch;
  }

  /* =====================================================
     SELECTION  (direction lives in state, not in DOM)
     ===================================================== */
  /* Returns true if every cell of the placement has a correct answer */
  function isPlacementComplete(pl) {
    if (!pl) return false;
    var cw = state.crossword;
    for (var i = 0; i < pl.word.length; i++) {
      var r = pl.direction === 'across' ? pl.row     : pl.row + i;
      var c = pl.direction === 'across' ? pl.col + i : pl.col;
      if (state.userAnswers[r][c] !== cw.grid[r][c].char) return false;
    }
    return true;
  }

  /* Pick the best direction for a cell:
     - prefer 'across' when both are incomplete or both are complete
     - prefer the incomplete direction when only one is incomplete */
  function bestDirection(r, c) {
    var acrossPl = getPlacementAt(r, c, 'across');
    var downPl   = getPlacementAt(r, c, 'down');
    if (!acrossPl && !downPl) return state.activeDirection;
    if (!acrossPl) return 'down';
    if (!downPl)   return 'across';
    var acrossDone = isPlacementComplete(acrossPl);
    var downDone   = isPlacementComplete(downPl);
    if (acrossDone && !downDone) return 'down';
    if (downDone && !acrossDone) return 'across';
    return 'across'; // both same state → default across
  }

  function onCellClick(e) {
    focusHidden();  // call first — ensures virtual keyboard on foldable large screens
    var div = e.currentTarget;
    var r = parseInt(div.dataset.row);
    var c = parseInt(div.dataset.col);

    // Tap same cell → toggle only if other direction exists
    if (r === state.activeRow && c === state.activeCol) {
      var other = state.activeDirection === 'across' ? 'down' : 'across';
      if (getPlacementAt(r, c, other)) {
        state.activeDirection = other;
        refreshHighlights();
        return;
      }
    }
    selectCellAt(r, c);
  }

  function selectCellAt(r, c) {
    var acrossPl = getPlacementAt(r, c, 'across');
    var downPl   = getPlacementAt(r, c, 'down');
    if (!acrossPl && !downPl) {
      // no placement covers this cell — shouldn't happen for non-black cells
      state.activeRow = r; state.activeCol = c;
      refreshHighlights(); return;
    }
    // Choose direction by completion priority
    state.activeDirection = bestDirection(r, c);
    // Fallback: if chosen direction has no placement, flip
    if (!getPlacementAt(r, c, state.activeDirection)) {
      state.activeDirection = state.activeDirection === 'across' ? 'down' : 'across';
    }
    state.activeRow = r;
    state.activeCol = c;
    refreshHighlights();
  }

  function selectPlacement(pl) {
    state.activeRow       = pl.row;
    state.activeCol       = pl.col;
    state.activeDirection = pl.direction;
    refreshHighlights();
    focusHidden();
  }

  /* =====================================================
     HIGHLIGHTS
     ===================================================== */
  function refreshHighlights() {
    // Clear
    gridEl.querySelectorAll('.cell').forEach(function (d) {
      d.classList.remove('active', 'highlighted');
    });
    updateClueHighlight();
    showPopup();

    var pl = activePlacement();
    if (!pl) {
      var d = getCellDiv(state.activeRow, state.activeCol);
      if (d) d.classList.add('active');
      return;
    }
    for (var i = 0; i < pl.word.length; i++) {
      var r = pl.direction === 'across' ? pl.row     : pl.row + i;
      var c = pl.direction === 'across' ? pl.col + i : pl.col;
      var d = getCellDiv(r, c);
      if (d) d.classList.add(r === state.activeRow && c === state.activeCol ? 'active' : 'highlighted');
    }
  }

  function updateClueHighlight() {
    document.querySelectorAll('.clue-item').forEach(function (li) { li.classList.remove('active'); });
    var pl = activePlacement();
    if (!pl) return;
    var li = document.querySelector(
      '.clue-item[data-number="' + pl.number + '"][data-direction="' + pl.direction + '"]'
    );
    if (li) {
      li.classList.add('active');
      // Scroll within section only — prevents window-level scroll on foldable large screens
      var section = li.closest('#across-section') || li.closest('#down-section');
      if (section) {
        var sr = section.getBoundingClientRect();
        var lr = li.getBoundingClientRect();
        if (lr.top < sr.top) section.scrollTop -= (sr.top - lr.top) + 4;
        else if (lr.bottom > sr.bottom) section.scrollTop += (lr.bottom - sr.bottom) + 4;
      }
    }
  }

  /* =====================================================
     PLACEMENT HELPERS
     ===================================================== */
  function activePlacement() {
    if (state.activeRow < 0) return null;
    return getPlacementAt(state.activeRow, state.activeCol, state.activeDirection);
  }

  function getPlacementAt(r, c, dir) {
    var ps = state.crossword.placements;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p.direction !== dir) continue;
      if (dir === 'across') {
        if (p.row === r && c >= p.col && c < p.col + p.word.length) return p;
      } else {
        if (p.col === c && r >= p.row && r < p.row + p.word.length) return p;
      }
    }
    return null;
  }

  /* =====================================================
     HIDDEN INPUT — all keyboard / IME routed here
     ===================================================== */

  // Reposition input over the active cell — safe to call mid-composition
  // (CSS geometry only; does not restart focus or disrupt Samsung IME state).
  function repositionInput() {
    if (!hiddenInput) return;
    var cellDiv = (state.activeRow >= 0) ? getCellDiv(state.activeRow, state.activeCol) : null;
    if (cellDiv) {
      var rect = cellDiv.getBoundingClientRect();
      hiddenInput.style.left   = rect.left + 'px';
      hiddenInput.style.top    = rect.top  + 'px';
      hiddenInput.style.width  = Math.max(rect.width,  1) + 'px';
      hiddenInput.style.height = Math.max(rect.height, 1) + 'px';
    }
  }

  // Full reset — only for user-initiated focus (tap, clue click, button).
  // Clears stale composition state so each new cell starts clean.
  function focusHidden() {
    if (!hiddenInput) return;
    isComposing = false;
    pendingComposition = false;
    sessionCommittedCount = 0;
    hiddenInput.value = '';
    repositionInput();
    hiddenInput.focus({ preventScroll: true });
  }

  hiddenInput.addEventListener('compositionstart', function () {
    if (isModalOpen()) { hiddenInput.value = ''; return; }
    isComposing = true;
    sessionCommittedCount = 0;
  });

  // compositionupdate: show the character being composed in real-time.
  // Smart behaviour: if the IME produces 2 chars (e.g. "깃" → "기" + "ㅅ"),
  // the first char is the completed syllable for the current cell and the
  // trailing consonant is a preview shown faintly in the NEXT cell.
  hiddenInput.addEventListener('compositionupdate', function (e) {
    var data = e.data || '';
    if (!data) return;
    var r = state.activeRow, c = state.activeCol;
    if (r < 0 || c < 0) return;
    var cw = state.crossword;
    if (!cw || !cw.grid[r] || cw.grid[r][c].char === null) return;

    // Clear any previous next-cell preview
    clearPreview();

    if (data.length === 1) {
      // Normal: single syllable in progress (e.g. "기", "깃")
      // Show just the first char of the current composing data
      setCellChar(r, c, data[0]);

      // Check if the syllable has a jongseong that could become onset of next char.
      // We show it as a faint preview in the next cell.
      var code = data.charCodeAt(0) - 0xAC00;
      if (code >= 0 && code < 11172) {
        var jong = JONGSEONG[code % 28];
        if (jong) {
          // Find next cell coords
          var pl = getPlacementAt(r, c, state.activeDirection);
          if (pl) {
            var idx = pl.direction === 'across' ? c - pl.col : r - pl.row;
            if (idx + 1 < pl.word.length) {
              var nr = pl.direction === 'across' ? r : r + 1;
              var nc = pl.direction === 'across' ? c + 1 : c;
              var nd = getCellDiv(nr, nc);
              if (nd && cw.grid[nr] && cw.grid[nr][nc].char !== null) {
                var ns = nd.querySelector('.cell-char');
                if (ns) {
                  previewCell = { r: nr, c: nc, prevText: ns.textContent };
                  ns.textContent = jong;
                  ns.classList.add('cell-char-preview');
                }
              }
            }
          }
        }
      }
    } else {
      // Samsung-style multi-syllable session: data has N chars where the first
      // N-1 are already-complete syllables and the last is still in progress.
      // Commit the leading complete syllables immediately so the cursor advances
      // in real time. sessionCommittedCount prevents double-commits on subsequent
      // compositionupdate calls within the same session.
      for (var k = sessionCommittedCount; k < data.length - 1; k++) {
        var ch = data[k];
        if (isJamo(ch)) break;
        // Temporarily clear isComposing so commitChar's guard lets it through.
        // repositionInput (called inside advanceCursor) re-anchors without
        // calling .focus(), so the ongoing composition is not interrupted.
        isComposing = false;
        commitChar(ch);
        isComposing = true;
        sessionCommittedCount++;
      }
      // Display the trailing char (still composing) at the now-current active cell
      var lastCh = data[data.length - 1];
      var r2 = state.activeRow, c2 = state.activeCol;
      if (r2 >= 0 && c2 >= 0 && cw.grid[r2] && cw.grid[r2][c2].char !== null) {
        setCellChar(r2, c2, lastCh);
        // Jongseong preview for next cell (mirrors the length===1 path above)
        if (!isJamo(lastCh)) {
          var code2 = lastCh.charCodeAt(0) - 0xAC00;
          if (code2 >= 0 && code2 < 11172) {
            var jong2 = JONGSEONG[code2 % 28];
            if (jong2) {
              var pl2 = getPlacementAt(r2, c2, state.activeDirection);
              if (pl2) {
                var idx2 = pl2.direction === 'across' ? c2 - pl2.col : r2 - pl2.row;
                if (idx2 + 1 < pl2.word.length) {
                  var nnr = pl2.direction === 'across' ? r2 : r2 + 1;
                  var nnc = pl2.direction === 'across' ? c2 + 1 : c2;
                  var nnd = getCellDiv(nnr, nnc);
                  if (nnd && cw.grid[nnr] && cw.grid[nnr][nnc].char !== null) {
                    var nns = nnd.querySelector('.cell-char');
                    if (nns) {
                      previewCell = { r: nnr, c: nnc, prevText: nns.textContent };
                      nns.textContent = jong2;
                      nns.classList.add('cell-char-preview');
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // compositionend: full Korean syllable (e.g. '천') is ready — commit it
  hiddenInput.addEventListener('compositionend', function (e) {
    clearPreview();
    isComposing        = false;
    pendingComposition = true;
    var inputVal = (this.value || '').replace(/[\s﻿]/g, '');
    var eData    = (e.data    || '').replace(/[\s﻿]/g, '');
    // this.value checked first: Samsung keyboard puts only jamo in e.data
    // but always has the assembled syllable in value.
    var finalData = inputVal || eData;
    this.value = '';

    if (finalData.length > sessionCommittedCount) {
      // Commit only the chars that compositionupdate did NOT already commit.
      // Example: Samsung sends compositionend("심기"), sessionCommittedCount=1
      // → remaining="기" → commit "기" to cell 2. ✓
      var remaining = finalData.slice(sessionCommittedCount);
      var ch = extractCommitChar(remaining);
      if (ch) {
        commitChar(ch);
      } else {
        // remaining is pure jamo: restore display from state
        var r = state.activeRow, c = state.activeCol;
        if (r >= 0 && c >= 0) setCellChar(r, c, state.userAnswers[r][c] || '');
      }
    } else {
      // finalData is empty OR all chars were already committed during compositionupdate
      // (e.g. Samsung fires compositionend("심") when sessionCommittedCount=1,
      //  or fires compositionend("") on session boundary).
      // Check the active cell: if it shows a preview syllable that was never saved
      // to state.userAnswers (e.g. "기" from compositionupdate), commit it now.
      var r = state.activeRow, c = state.activeCol;
      if (r >= 0 && c >= 0) {
        var previewDiv = getCellDiv(r, c);
        var previewSpan = previewDiv && previewDiv.querySelector('.cell-char');
        var displayed = previewSpan ? previewSpan.textContent : '';
        if (displayed && !isJamo(displayed)
            && displayed !== (state.userAnswers[r][c] || '')) {
          commitChar(displayed);
        } else {
          setCellChar(r, c, state.userAnswers[r][c] || '');
        }
      }
    }
    sessionCommittedCount = 0;
    Promise.resolve().then(function () { pendingComposition = false; });
  });

  // input: handle non-IME input (Latin chars, hardware keyboard, etc.)
  hiddenInput.addEventListener('input', function (e) {
    if (isModalOpen()) { this.value = ''; return; }
    if (isComposing || e.isComposing || pendingComposition) return;
    var val = this.value;
    if (!val) return;
    // Surrogate-aware last codepoint extraction (이모지가 두 UTF-16 단위로 쪼개지지 않도록)
    var lastIdx = val.length - 1;
    if (lastIdx > 0) {
      var prevCode = val.charCodeAt(lastIdx - 1);
      if (prevCode >= 0xD800 && prevCode <= 0xDBFF) lastIdx -= 1;
    }
    var lastCh = String.fromCodePoint(val.codePointAt(lastIdx));
    // If value ends with jamo the browser is still composing (some keyboards
    // never fire compositionstart). Don't clear -- let it finish the syllable.
    if (isJamo(lastCh)) return;
    this.value = '';
    commitChar(lastCh);
  });

  hiddenInput.addEventListener('keydown', function (e) {
    if (isModalOpen()) {
      // Esc는 별도 document 리스너에서 처리 (모달 닫기)
      if (e.key !== 'Escape') e.preventDefault();
      return;
    }
    if (state.activeRow < 0) return;
    var r = state.activeRow, c = state.activeCol;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (state.userAnswers[r][c]) {
        state.userAnswers[r][c] = '';
        setCellChar(r, c, '');
        var d = getCellDiv(r, c);
        if (d) d.classList.remove('correct', 'wrong');
      } else {
        moveToPrev(r, c);
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp'    || e.key === 'ArrowDown') {
      e.preventDefault();
      navigateArrow(e.key);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      cycleWord(e.shiftKey);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isComposing) {
        checkAnswers();
        focusHidden();
      }
    }
  });

  /* ---------- commit a single character to the active cell ---------- */
  function commitChar(ch) {
    if (!ch || !ch.trim()) return;
    if (isJamo(ch)) return;
    // 한글 음절(U+AC00-U+D7A3)만 허용 — Latin/숫자/이모지/기호 거절
    if (!isHangulSyllable(ch)) return;
    var r = state.activeRow, c = state.activeCol;
    if (r < 0 || c < 0) return;
    var cw = state.crossword;
    if (!cw.grid[r] || cw.grid[r][c].char === null) return;
    // revealed 칸도 입력 허용.
    // 직접 타이핑하면 revealed 플래그를 해제하여 정답 채점이 정직하게 이뤄지도록 함.
    if (state.revealed[r][c]) {
      state.revealed[r][c] = false;
      var rd = getCellDiv(r, c);
      if (rd) rd.classList.remove('revealed');
    }

    state.userAnswers[r][c] = ch;
    setCellChar(r, c, ch);                  // update span display
    var d = getCellDiv(r, c);
    if (d) {
      var wasCorrect = d.classList.contains('correct');
      d.classList.remove('correct', 'wrong');
      if (ch === cw.grid[r][c].char) {
        d.classList.add('correct');
      } else if (wasCorrect) {
        // 정답으로 채워진 셀을 틀린 글자로 덮어쓰면 즉시 빨강으로 경고
        d.classList.add('wrong');
      }
    }

    advanceCursor(r, c);
    // If cursor didn't advance (last cell), ensure display is still correct
    if (state.activeRow === r && state.activeCol === c) {
      setCellChar(r, c, ch);
    }
  }

  /* ---------- move cursor forward within current word ---------- */
  function advanceCursor(r, c) {
    var pl = getPlacementAt(r, c, state.activeDirection);
    if (!pl) return;
    var idx = pl.direction === 'across' ? c - pl.col : r - pl.row;
    if (idx + 1 >= pl.word.length) return;         // already at end of word

    // Direction is fixed from pl.direction — never changes here
    if (pl.direction === 'across') {
      state.activeCol = c + 1;
    } else {
      state.activeRow = r + 1;
    }
    refreshHighlights();
    repositionInput();  // re-anchor IME without resetting composition state
  }

  /* ---------- backspace: move cursor back within current word ---------- */
  function moveToPrev(r, c) {
    var pl = getPlacementAt(r, c, state.activeDirection);
    if (!pl) return;
    var idx = pl.direction === 'across' ? c - pl.col : r - pl.row;
    if (idx <= 0) return;

    var pr = pl.direction === 'across' ? r : pl.row + idx - 1;
    var pc = pl.direction === 'across' ? pl.col + idx - 1 : c;

    if (!state.revealed[pr][pc]) {
      state.userAnswers[pr][pc] = '';
      setCellChar(pr, pc, '');
      var d = getCellDiv(pr, pc);
      if (d) d.classList.remove('correct', 'wrong');
    }
    state.activeRow = pr;
    state.activeCol = pc;
    refreshHighlights();
    repositionInput();  // re-anchor IME without resetting composition state
  }

  /* ---------- arrow-key navigation ---------- */
  function navigateArrow(key) {
    var r = state.activeRow, c = state.activeCol;
    var cw = state.crossword;
    var nr = r + (key === 'ArrowDown' ? 1 : key === 'ArrowUp'   ? -1 : 0);
    var nc = c + (key === 'ArrowRight'? 1 : key === 'ArrowLeft' ? -1 : 0);

    if (nr < 0 || nr >= cw.height || nc < 0 || nc >= cw.width) return;
    if (!cw.grid[nr] || cw.grid[nr][nc].char === null) return;

    // Update direction based on arrow axis
    if (key === 'ArrowLeft' || key === 'ArrowRight') state.activeDirection = 'across';
    if (key === 'ArrowUp'   || key === 'ArrowDown')  state.activeDirection = 'down';

    selectCellAt(nr, nc);
  }

  /* ---------- Tab cycles through words (완성된 placement은 스킵) ---------- */
  function cycleWord(reverse) {
    var ps  = state.crossword.placements;
    if (ps.length === 0) return;
    var cur = activePlacement();
    var idx = cur ? ps.indexOf(cur) : -1;
    var step = reverse ? -1 : 1;
    for (var i = 1; i <= ps.length; i++) {
      var n = ((idx + i * step) % ps.length + ps.length) % ps.length;
      if (!isPlacementComplete(ps[n])) { selectPlacement(ps[n]); return; }
    }
    // 모든 placement이 완성된 경우엔 그대로 stay (다음 칸 없음)
  }

  /* =====================================================
     CHECK / HINT / REVEAL
     ===================================================== */
  function checkAnswers() {
    // 정답(reveal-all) 후엔 채점/승리 모달을 막아 컨닝 점수를 0점으로 고정
    if (state.fullyRevealed) {
      state.score = 0;
      scoreEl.textContent = state.score;
      return;
    }

    var cw = state.crossword;
    var correct = 0, allCorrect = true, allFilled = true;

    for (var r = 0; r < cw.height; r++) {
      for (var c = 0; c < cw.width; c++) {
        if (cw.grid[r][c].char === null) continue;
        var d    = getCellDiv(r, c);
        var user = state.userAnswers[r][c];

        if (!user) {
          allFilled = allCorrect = false;
          if (d) d.classList.remove('correct', 'wrong');
          continue;
        }
        if (user === cw.grid[r][c].char || state.revealed[r][c]) {
          correct++;
          if (d) { d.classList.remove('wrong'); d.classList.add('correct'); }
        } else {
          allCorrect = false;
          if (d) { d.classList.remove('correct'); d.classList.add('wrong'); }
        }
      }
    }

    state.score = Math.max(0, correct * 10 - state.hintsUsed * 5);
    scoreEl.textContent = state.score;
    if (allCorrect && allFilled) setTimeout(showWin, 400);
  }

  function giveHint() {
    var cw = state.crossword, pl = activePlacement(), target = null;

    // Prefer an unfilled cell in the active word
    if (pl) {
      for (var i = 0; i < pl.word.length && !target; i++) {
        var r = pl.direction === 'across' ? pl.row     : pl.row + i;
        var c = pl.direction === 'across' ? pl.col + i : pl.col;
        if (!state.revealed[r][c] && state.userAnswers[r][c] !== cw.grid[r][c].char)
          target = { r: r, c: c };
      }
    }
    // Fallback: first unfilled cell in the whole grid
    if (!target) {
      outer: for (var r = 0; r < cw.height; r++) {
        for (var c = 0; c < cw.width; c++) {
          if (cw.grid[r][c].char !== null && !state.revealed[r][c]
              && state.userAnswers[r][c] !== cw.grid[r][c].char) {
            target = { r: r, c: c }; break outer;
          }
        }
      }
    }
    if (!target) return;

    state.hintsUsed++;
    state.revealed[target.r][target.c]    = true;
    state.userAnswers[target.r][target.c] = cw.grid[target.r][target.c].char;
    setCellChar(target.r, target.c, cw.grid[target.r][target.c].char);
    var d = getCellDiv(target.r, target.c);
    if (d) { d.classList.add('revealed'); d.classList.remove('correct', 'wrong'); }
  }

  function revealAll() {
    state.fullyRevealed = true;
    var cw = state.crossword;
    for (var r = 0; r < cw.height; r++) {
      for (var c = 0; c < cw.width; c++) {
        if (cw.grid[r][c].char === null) continue;
        state.revealed[r][c]    = true;
        state.userAnswers[r][c] = cw.grid[r][c].char;
        setCellChar(r, c, cw.grid[r][c].char);
        var d = getCellDiv(r, c);
        if (d) { d.classList.add('revealed'); d.classList.remove('correct', 'wrong'); }
      }
    }
  }

  /* =====================================================
     POPUP / MODAL
     ===================================================== */
  function showPopup() {
    var pl = activePlacement();
    if (!pl) { hidePopup(); return; }
    popupNumber.textContent = pl.number + (pl.direction === 'across' ? '가로' : '세로');
    popupHint.textContent   = pl.hint;
    wordPopup.classList.remove('hidden');
  }
  function hidePopup()  { wordPopup.classList.add('hidden'); }
  function hideModal()  { resultModal.classList.add('hidden'); }

  function showWin() {
    resultEmoji.textContent = state.score >= 50 ? '🏆' : '🎉';
    resultTitle.textContent = '완성! 대단해요!';
    resultMsg.textContent   = '점수: ' + state.score + '점  •  힌트: ' + state.hintsUsed + '회';
    resultModal.classList.remove('hidden');
  }

  /* =====================================================
     BUTTON EVENTS
     ===================================================== */
  checkBtn.addEventListener('click', function () {
    checkAnswers();
    focusHidden();
  });
  hintBtn.addEventListener('click', function () {
    giveHint();
    focusHidden();
  });
  revealBtn.addEventListener('click', revealAll);
  newGameBtn.addEventListener('click', function () {
    state.score = 0; scoreEl.textContent = '0'; init();
  });
  function closeModalAndRestart() {
    hideModal(); state.score = 0; scoreEl.textContent = '0'; init();
  }
  modalNewGame.addEventListener('click', closeModalAndRestart);
  // backdrop 클릭 시도 새 게임 시작 — 모달만 닫히고 revealed 상태로 잠기는 UX 막기
  resultModal.querySelector('.modal-backdrop').addEventListener('click', closeModalAndRestart);
  // Escape 키로 모달 닫기 + 새 게임
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isModalOpen()) {
      e.preventDefault();
      closeModalAndRestart();
    }
  });

  // touchstart fires before click — ensures keyboard on foldable large screens
  gridEl.addEventListener('touchstart', function (e) {
    var cell = e.target.closest ? e.target.closest('.cell') : null;
    if (cell && !cell.classList.contains('black')) focusHidden();
  });

  /* =====================================================
     START
     ===================================================== */
  init();

})();
