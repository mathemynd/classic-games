const weirdBoard = document.getElementById('weird-board');
const weirdResetBtn = document.getElementById('weird-reset-btn');
const weirdNewGameBtn = document.getElementById('weird-new-game');
const weirdBackBtn = document.getElementById('weird-back-btn');
const weirdMsg = document.getElementById('weird-msg');
const weirdActiveBoardInfo = document.getElementById('weird-active-board-info');
let weirdBoards;
let weirdBoardWinners;
let weirdCurrentPlayer;
let weirdActiveBoard;
let weirdGameOver;
let weirdFlippedCells;
let weirdCurrentAction;
let weirdRotateDirection;

weirdBackBtn.addEventListener('click', () => {
  weirdScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetWeirdGame();
});

document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weirdCurrentAction = btn.dataset.action;

    const rotateOptions = document.getElementById('rotate-options');
    rotateOptions.classList.toggle('hide', weirdCurrentAction !== 'rotate');

    weirdBoard.dataset.action = weirdCurrentAction;
    updateWeirdUI();
  });
});

document.querySelectorAll('.rotate-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rotate-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weirdRotateDirection = btn.dataset.dir;
  });
});

function initWeirdGame() {
  weirdBoard.innerHTML = '';
  for (let boardIdx = 0; boardIdx < 9; boardIdx++) {
    const miniBoard = document.createElement('div');
    miniBoard.className = 'mini-board';
    miniBoard.dataset.board = boardIdx;

    for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
      const cell = document.createElement('button');
      cell.className = 'mini-cell';
      cell.dataset.board = boardIdx;
      cell.dataset.cell = cellIdx;
      cell.onclick = () => handleWeirdClick(boardIdx, cellIdx);
      miniBoard.appendChild(cell);
    }

    weirdBoard.appendChild(miniBoard);
  }

  resetWeirdGame();
}

function handleWeirdClick(boardIdx, cellIdx) {
  if (weirdGameOver) return;

  if (weirdCurrentAction === 'place') {
    handleWeirdPlace(boardIdx, cellIdx);
  } else if (weirdCurrentAction === 'flip') {
    handleWeirdFlip(boardIdx, cellIdx);
  } else if (weirdCurrentAction === 'transpose') {
    handleWeirdTranspose(boardIdx);
  } else if (weirdCurrentAction === 'rotate') {
    handleWeirdRotate(boardIdx);
  }
}

function finishWeirdTurn(boardIdx, nextActiveBoard) {
  checkWeirdMiniBoard(boardIdx);

  const gameResult = checkWeirdWinner();
  if (gameResult) {
    showWeirdWinner(gameResult.winner, gameResult.pattern);
    return;
  }

  if (weirdBoardWinners.every(w => w !== null)) {
    showWeirdDraw();
    return;
  }

  weirdActiveBoard = nextActiveBoard;
  if (weirdActiveBoard !== null && weirdBoardWinners[weirdActiveBoard]) {
    weirdActiveBoard = null;
  }

  weirdCurrentPlayer = weirdCurrentPlayer === 'X' ? 'O' : 'X';
  updateWeirdUI();
}

function validateWeirdTarget(boardIdx) {
  if (weirdBoardWinners[boardIdx]) return false;
  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) return false;
  return true;
}

function handleWeirdPlace(boardIdx, cellIdx) {
  if (!validateWeirdTarget(boardIdx)) return;

  const cell = document.querySelector(
    `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText !== '') return;

  cell.innerText = weirdCurrentPlayer;
  cell.classList.add(weirdCurrentPlayer.toLowerCase());

  weirdBoards[boardIdx][cellIdx] = weirdCurrentPlayer;

  GameLogger.move(weirdCurrentPlayer, 'place', boardIdx, cellIdx);
  finishWeirdTurn(boardIdx, cellIdx);
}

function handleWeirdFlip(boardIdx, cellIdx) {
  if (!validateWeirdTarget(boardIdx)) return;

  const cell = document.querySelector(
    `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText === '') return;

  const flipKey = `${boardIdx}-${cellIdx}`;
  if (weirdFlippedCells.has(flipKey)) return;

  const currentVal = cell.innerText;
  const newVal = currentVal === 'X' ? 'O' : 'X';

  cell.innerText = newVal;
  cell.classList.remove('x', 'o');
  cell.classList.add(newVal.toLowerCase());
  cell.classList.add('flipped');

  weirdBoards[boardIdx][cellIdx] = newVal;
  weirdFlippedCells.add(flipKey);

  GameLogger.move(weirdCurrentPlayer, 'flip', boardIdx, cellIdx);
  finishWeirdTurn(boardIdx, cellIdx);
}

function remapFlippedCells(boardIdx, mapFn) {
  const newKeys = new Set();
  for (const key of weirdFlippedCells) {
    const [b, c] = key.split('-').map(Number);
    if (b === boardIdx) {
      newKeys.add(`${b}-${mapFn(c)}`);
    } else {
      newKeys.add(key);
    }
  }
  weirdFlippedCells = newKeys;
}

function transposeCellIdx(cellIdx) {
  const i = Math.floor(cellIdx / 3);
  const j = cellIdx % 3;
  return j * 3 + i;
}

function rotateCellIdx(cellIdx, direction) {
  const i = Math.floor(cellIdx / 3);
  const j = cellIdx % 3;
  if (direction === 'cw') return j * 3 + (2 - i);
  return (2 - j) * 3 + i;
}

function handleWeirdTranspose(boardIdx) {
  if (!validateWeirdTarget(boardIdx)) return;

  const board = weirdBoards[boardIdx];
  const newBoard = Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      newBoard[j * 3 + i] = board[i * 3 + j];
    }
  }
  weirdBoards[boardIdx] = newBoard;

  remapFlippedCells(boardIdx, transposeCellIdx);
  updateWeirdBoardUI(boardIdx);

  GameLogger.move(weirdCurrentPlayer, 'transpose', boardIdx, null);
  finishWeirdTurn(boardIdx, null);
}

function rotateBoard(board, direction) {
  const newBoard = Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (direction === 'cw') {
        newBoard[j * 3 + (2 - i)] = board[i * 3 + j];
      } else {
        newBoard[(2 - j) * 3 + i] = board[i * 3 + j];
      }
    }
  }
  return newBoard;
}

function handleWeirdRotate(boardIdx) {
  if (!validateWeirdTarget(boardIdx)) return;

  const dir = weirdRotateDirection;
  weirdBoards[boardIdx] = rotateBoard(weirdBoards[boardIdx], dir);
  remapFlippedCells(boardIdx, c => rotateCellIdx(c, dir));
  updateWeirdBoardUI(boardIdx);

  GameLogger.move(weirdCurrentPlayer, 'rotate_' + dir, boardIdx, null);
  finishWeirdTurn(boardIdx, null);
}

function updateWeirdBoardUI(boardIdx) {
  const board = weirdBoards[boardIdx];
  for (let i = 0; i < 9; i++) {
    const cell = document.querySelector(
      `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${i}"]`
    );
    cell.innerText = board[i] || '';
    cell.classList.remove('x', 'o', 'flipped');
    if (board[i]) {
      cell.classList.add(board[i].toLowerCase());
      if (weirdFlippedCells.has(`${boardIdx}-${i}`)) {
        cell.classList.add('flipped');
      }
    }
  }
}

function checkWeirdMiniBoard(boardIdx) {
  const board = weirdBoards[boardIdx];
  for (const pattern of ultimateWinPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      weirdBoardWinners[boardIdx] = board[a];
      const miniBoard = document.querySelector(`#weird-board .mini-board[data-board="${boardIdx}"]`);
      miniBoard.classList.add('won');
      miniBoard.dataset.winner = board[a];
      miniBoard.querySelectorAll('.mini-cell').forEach(cell => cell.disabled = true);
      GameLogger.boardWon(board[a], boardIdx);
      return;
    }
  }

  if (board.every(cell => cell !== null)) {
    weirdBoardWinners[boardIdx] = 'draw';
    const miniBoard = document.querySelector(`#weird-board .mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won', 'draw');
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
    GameLogger.boardDraw(boardIdx);
  }
}

function checkWeirdWinner() {
  for (const pattern of ultimateWinPatterns) {
    const [a, b, c] = pattern;
    if (
      weirdBoardWinners[a] &&
      weirdBoardWinners[a] !== 'draw' &&
      weirdBoardWinners[a] === weirdBoardWinners[b] &&
      weirdBoardWinners[a] === weirdBoardWinners[c]
    ) {
      return { winner: weirdBoardWinners[a], pattern };
    }
  }
  return null;
}

function getWeirdBoardsToCheck() {
  return weirdActiveBoard !== null
    ? [weirdActiveBoard]
    : Array.from({length: 9}, (_, i) => i).filter(i => !weirdBoardWinners[i]);
}

function getWeirdActionAvail() {
  const boards = getWeirdBoardsToCheck();
  return {
    place: !weirdGameOver && boards.some(b =>
      weirdBoards[b].some(cell => cell === null)
    ),
    flip: !weirdGameOver && boards.some(b =>
      weirdBoards[b].some((cell, ci) => cell !== null && !weirdFlippedCells.has(`${b}-${ci}`))
    ),
    transpose: !weirdGameOver && boards.some(b =>
      weirdBoards[b].filter(cell => cell !== null).length >= 2
    ),
    get rotate() { return this.transpose; },
  };
}

function updateWeirdInfoText() {
  if (weirdGameOver) {
    weirdActiveBoardInfo.textContent = '';
  } else if (weirdActiveBoard === null) {
    weirdActiveBoardInfo.textContent = `Player ${weirdCurrentPlayer}'s turn - Play anywhere`;
  } else {
    weirdActiveBoardInfo.textContent = `Player ${weirdCurrentPlayer}'s turn - Board ${weirdActiveBoard + 1}`;
  }
}

function updateWeirdActionButtons(actionAvail) {
  document.querySelectorAll('.action-btn').forEach(btn => {
    const disabled = !actionAvail[btn.dataset.action];
    btn.disabled = disabled;
    btn.style.opacity = disabled ? '0.5' : '1';
    btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
  });

  if (!actionAvail[weirdCurrentAction]) {
    const fallback = Object.keys(actionAvail).find(a => actionAvail[a]);
    if (fallback) {
      weirdCurrentAction = fallback;
      document.querySelectorAll('.action-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.action === fallback);
      });
      document.getElementById('rotate-options').classList.toggle('hide', fallback !== 'rotate');
      weirdBoard.dataset.action = fallback;
    }
  }
}

function isCellDisabled(boardIdx, cellIdx, cell) {
  switch (weirdCurrentAction) {
    case 'place':
      return cell.innerText !== '';
    case 'flip':
      return cell.innerText === '' || weirdFlippedCells.has(`${boardIdx}-${cellIdx}`);
    default:
      return false;
  }
}

function updateWeirdCellStates() {
  document.querySelectorAll('#weird-board .mini-board').forEach((miniBoard, boardIdx) => {
    const isTarget = !weirdBoardWinners[boardIdx] &&
      (weirdActiveBoard === null || weirdActiveBoard === boardIdx);

    miniBoard.querySelectorAll('.mini-cell').forEach((cell, cellIdx) => {
      cell.disabled = (weirdGameOver || !isTarget) ? true : isCellDisabled(boardIdx, cellIdx, cell);
    });
  });
}

function boardHasValidAction(boardIdx) {
  const board = weirdBoards[boardIdx];
  switch (weirdCurrentAction) {
    case 'place':
      return board.some(cell => cell === null);
    case 'flip':
      return board.some((cell, ci) => cell !== null && !weirdFlippedCells.has(`${boardIdx}-${ci}`));
    case 'transpose':
    case 'rotate':
      return board.filter(cell => cell !== null).length >= 2;
    default:
      return true;
  }
}

function isBoardValidForAction(boardIdx) {
  if (weirdBoardWinners[boardIdx]) return false;
  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) return false;
  return boardHasValidAction(boardIdx);
}

function updateWeirdUI() {
  document.querySelectorAll('#weird-board .mini-board').forEach((board, idx) => {
    board.classList.remove('active');
    if (isBoardValidForAction(idx)) {
      board.classList.add('active');
    }
  });

  updateWeirdInfoText();
  updateWeirdActionButtons(getWeirdActionAvail());
  updateWeirdCellStates();
}

function showWeirdWinner(winner, pattern) {
  weirdGameOver = true;
  weirdMsg.innerText = `Player ${winner} wins the game!`;
  weirdMsg.classList.remove('hide');
  weirdMsg.classList.add('winner-msg');
  weirdActiveBoardInfo.textContent = '';
  document.querySelectorAll('#weird-board .mini-cell').forEach(c => c.disabled = true);
  document.querySelectorAll('#weird-board .mini-board').forEach(b => b.classList.remove('active'));

  pattern.forEach(idx => {
    const board = document.querySelector(`#weird-board .mini-board[data-board="${idx}"]`);
    board.style.boxShadow = '0 0 0 4px #10b981, 0 0 20px rgba(16, 185, 129, 0.5)';
  });
  GameLogger.gameWon(winner);
}

function showWeirdDraw() {
  weirdGameOver = true;
  weirdMsg.innerText = "It's a draw!";
  weirdMsg.classList.remove('hide');
  weirdMsg.classList.add('draw-msg');
  weirdActiveBoardInfo.textContent = '';
  document.querySelectorAll('#weird-board .mini-cell').forEach(c => c.disabled = true);
  document.querySelectorAll('#weird-board .mini-board').forEach(b => b.classList.remove('active'));
  GameLogger.gameDraw();
}

function resetWeirdGame() {
  weirdBoards = Array(9).fill(null).map(() => Array(9).fill(null));
  weirdBoardWinners = Array(9).fill(null);
  weirdCurrentPlayer = 'X';
  weirdActiveBoard = null;
  weirdGameOver = false;
  weirdFlippedCells = new Set();
  weirdCurrentAction = 'place';
  weirdRotateDirection = 'cw';
  weirdBoard.dataset.action = 'place';

  document.querySelectorAll('#weird-board .mini-cell').forEach(cell => {
    cell.innerText = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o', 'flipped');
  });

  document.querySelectorAll('#weird-board .mini-board').forEach(board => {
    board.classList.remove('won', 'draw', 'active');
    board.removeAttribute('data-winner');
    board.style.boxShadow = '';
  });

  weirdMsg.classList.add('hide');
  weirdMsg.classList.remove('winner-msg', 'draw-msg');

  document.querySelectorAll('.action-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  document.getElementById('rotate-options').classList.add('hide');
  document.querySelectorAll('.rotate-opt').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  updateWeirdUI();
}

weirdResetBtn.addEventListener('click', () => { GameLogger.reset('weird'); resetWeirdGame(); });
weirdNewGameBtn.addEventListener('click', () => { GameLogger.reset('weird'); resetWeirdGame(); });
