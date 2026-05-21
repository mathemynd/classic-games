const dotsBoard = document.getElementById('dots-board');
const dotsResetBtn = document.getElementById('dots-reset-btn');
const dotsNewGameBtn = document.getElementById('dots-new-game');
const dotsBackBtn = document.getElementById('dots-back-btn');
const dotsMsg = document.getElementById('dots-msg');
const dotsScore1El = document.getElementById('dots-score-1');
const dotsScore2El = document.getElementById('dots-score-2');
const dotsTurnInfo = document.getElementById('dots-turn-info');

const DOTS_N = 3;
const DOTS_DOT_PX = 16;
const DOTS_GAP_PX = 80;

let dotsHLines;
let dotsVLines;
let dotsAllRects;
let dotsDotElements;
let dotsCurrentPlayer;
let dotsScores;
let dotsGameOver;

function initDotsGame() {
  const N = DOTS_N;
  const gridSize = 2 * N - 1;
  dotsBoard.innerHTML = '';
  dotsDotElements = [];

  const tracks = [];
  for (let i = 0; i < gridSize; i++) {
    tracks.push((i % 2 === 0 ? DOTS_DOT_PX : DOTS_GAP_PX) + 'px');
  }
  const template = tracks.join(' ');
  dotsBoard.style.gridTemplateColumns = template;
  dotsBoard.style.gridTemplateRows = template;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const rEven = r % 2 === 0;
      const cEven = c % 2 === 0;

      if (rEven && cEven) {
        const dot = document.createElement('div');
        dot.className = 'dots-dot';
        dotsBoard.appendChild(dot);
        dotsDotElements.push(dot);
      } else if (rEven && !cEven) {
        const line = document.createElement('button');
        line.className = 'dots-line dots-hline';
        const lr = r / 2;
        const lc = (c - 1) / 2;
        line.dataset.type = 'h';
        line.dataset.row = lr;
        line.dataset.col = lc;
        line.addEventListener('click', () => handleDotsClick('h', lr, lc));
        dotsBoard.appendChild(line);
      } else if (!rEven && cEven) {
        const line = document.createElement('button');
        line.className = 'dots-line dots-vline';
        const lr = (r - 1) / 2;
        const lc = c / 2;
        line.dataset.type = 'v';
        line.dataset.row = lr;
        line.dataset.col = lc;
        line.addEventListener('click', () => handleDotsClick('v', lr, lc));
        dotsBoard.appendChild(line);
      } else {
        const spacer = document.createElement('div');
        spacer.className = 'dots-spacer';
        dotsBoard.appendChild(spacer);
      }
    }
  }

  resetDotsGame();
}

function buildRectsList() {
  const N = DOTS_N;
  const rects = [];
  for (let h = 1; h < N; h++) {
    for (let w = 1; w < N; w++) {
      for (let r = 0; r <= N - 1 - h; r++) {
        for (let c = 0; c <= N - 1 - w; c++) {
          rects.push({ w, h, row: r, col: c, owner: 0 });
        }
      }
    }
  }
  return rects;
}

function handleDotsClick(type, row, col) {
  if (dotsGameOver) return;

  const lines = type === 'h' ? dotsHLines : dotsVLines;
  if (lines[row][col] !== 0) return;

  lines[row][col] = dotsCurrentPlayer;

  const lineEl = dotsBoard.querySelector(
    `.dots-line[data-type="${type}"][data-row="${row}"][data-col="${col}"]`
  );
  lineEl.classList.add(`p${dotsCurrentPlayer}`);
  lineEl.disabled = true;

  GameLogger.move(`P${dotsCurrentPlayer}`, type === 'h' ? 'hline' : 'vline', row, col);

  const completed = claimCompletedRects();
  if (completed > 0) {
    dotsScores[dotsCurrentPlayer] += completed;
    updateDotsScores();
  }

  if (completed === 0) {
    dotsCurrentPlayer = dotsCurrentPlayer === 1 ? 2 : 1;
  }

  if (!hasDrawableLines()) {
    endDotsGame();
    return;
  }

  dotsBoard.dataset.turn = dotsCurrentPlayer;
  updateDotsTurnInfo(completed > 0);
}

function claimCompletedRects() {
  let completed = 0;
  for (const rect of dotsAllRects) {
    if (rect.owner !== 0) continue;
    if (isDotsRectComplete(rect)) {
      rect.owner = dotsCurrentPlayer;
      renderClaimedRect(rect);
      blockInteriorLines(rect);
      completed++;
    }
  }
  return completed;
}

function isDotsRectComplete(rect) {
  const { w, h, row, col } = rect;
  for (let i = 0; i < w; i++) {
    if (dotsHLines[row][col + i] <= 0) return false;
    if (dotsHLines[row + h][col + i] <= 0) return false;
  }
  for (let i = 0; i < h; i++) {
    if (dotsVLines[row + i][col] <= 0) return false;
    if (dotsVLines[row + i][col + w] <= 0) return false;
  }
  return true;
}

function blockInteriorLines(rect) {
  const { w, h, row, col } = rect;
  for (let i = 1; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (dotsHLines[row + i][col + j] === 0) {
        dotsHLines[row + i][col + j] = -1;
        disableLine('h', row + i, col + j);
      }
    }
  }
  for (let i = 0; i < h; i++) {
    for (let j = 1; j < w; j++) {
      if (dotsVLines[row + i][col + j] === 0) {
        dotsVLines[row + i][col + j] = -1;
        disableLine('v', row + i, col + j);
      }
    }
  }
}

function disableLine(type, row, col) {
  const lineEl = dotsBoard.querySelector(
    `.dots-line[data-type="${type}"][data-row="${row}"][data-col="${col}"]`
  );
  if (lineEl) {
    lineEl.disabled = true;
    lineEl.classList.add('blocked');
  }
}

function hasDrawableLines() {
  for (const row of dotsHLines) {
    if (row.some(v => v === 0)) return true;
  }
  for (const row of dotsVLines) {
    if (row.some(v => v === 0)) return true;
  }
  return false;
}

function renderClaimedRect(rect) {
  const N = DOTS_N;
  const tlDot = dotsDotElements[rect.row * N + rect.col];
  const brDot = dotsDotElements[(rect.row + rect.h) * N + (rect.col + rect.w)];

  const boardRect = dotsBoard.getBoundingClientRect();
  const tlRect = tlDot.getBoundingClientRect();
  const brRect = brDot.getBoundingClientRect();

  const overlay = document.createElement('div');
  overlay.className = `dots-claimed p${dotsCurrentPlayer}`;
  overlay.style.left = (tlRect.right - boardRect.left) + 'px';
  overlay.style.top = (tlRect.bottom - boardRect.top) + 'px';
  overlay.style.width = (brRect.left - tlRect.right) + 'px';
  overlay.style.height = (brRect.top - tlRect.bottom) + 'px';
  dotsBoard.appendChild(overlay);
}

function endDotsGame() {
  dotsGameOver = true;
  dotsBoard.querySelectorAll('.dots-line').forEach(l => l.disabled = true);

  if (dotsScores[1] > dotsScores[2]) {
    dotsMsg.innerText = 'Player 1 wins!';
    dotsMsg.classList.remove('hide');
    dotsMsg.classList.add('winner-msg');
    GameLogger.gameWon('P1');
  } else if (dotsScores[2] > dotsScores[1]) {
    dotsMsg.innerText = 'Player 2 wins!';
    dotsMsg.classList.remove('hide');
    dotsMsg.classList.add('winner-msg');
    GameLogger.gameWon('P2');
  } else {
    dotsMsg.innerText = "It's a draw!";
    dotsMsg.classList.remove('hide');
    dotsMsg.classList.add('draw-msg');
    GameLogger.gameDraw();
  }

  dotsTurnInfo.textContent = '';
}

function updateDotsScores() {
  dotsScore1El.textContent = dotsScores[1];
  dotsScore2El.textContent = dotsScores[2];
}

function updateDotsTurnInfo(extraTurn) {
  if (dotsGameOver) {
    dotsTurnInfo.textContent = '';
    return;
  }
  const text = `Player ${dotsCurrentPlayer}'s turn`;
  dotsTurnInfo.textContent = extraTurn ? text + ' — Extra turn!' : text;
  dotsTurnInfo.className = `dots-turn-info p${dotsCurrentPlayer}`;
}

function resetDotsGame() {
  const N = DOTS_N;
  dotsHLines = Array.from({length: N}, () => Array(N - 1).fill(0));
  dotsVLines = Array.from({length: N - 1}, () => Array(N).fill(0));
  dotsAllRects = buildRectsList();
  dotsCurrentPlayer = 1;
  dotsScores = [0, 0, 0];
  dotsGameOver = false;

  dotsBoard.querySelectorAll('.dots-line').forEach(line => {
    line.classList.remove('p1', 'p2', 'blocked');
    line.disabled = false;
  });
  dotsBoard.querySelectorAll('.dots-claimed').forEach(el => el.remove());

  dotsBoard.dataset.turn = 1;
  dotsMsg.classList.add('hide');
  dotsMsg.classList.remove('winner-msg', 'draw-msg');
  updateDotsScores();
  updateDotsTurnInfo(false);
}

dotsBackBtn.addEventListener('click', () => {
  dotsScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetDotsGame();
});

dotsResetBtn.addEventListener('click', () => { GameLogger.reset('dots'); resetDotsGame(); });
dotsNewGameBtn.addEventListener('click', () => { GameLogger.reset('dots'); resetDotsGame(); });
