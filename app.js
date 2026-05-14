// Game Selection
const gameSelectScreen = document.getElementById('game-select');
const classicScreen = document.getElementById('classic-screen');
const ultimateScreen = document.getElementById('ultimate-screen');
const gameOptions = document.querySelectorAll('.game-option');

// Classic Game Elements
const classicBoxes = document.querySelectorAll('#classic-board .box');
const classicResetBtn = document.getElementById('reset-btn');
const classicNewGameBtn = document.getElementById('new-game');
const classicBackBtn = document.getElementById('back-btn');
const classicMsg = document.getElementById('msg');

// Ultimate Game Elements
const ultimateBoard = document.getElementById('ultimate-board');
const ultimateResetBtn = document.getElementById('ultimate-reset-btn');
const ultimateNewGameBtn = document.getElementById('ultimate-new-game');
const ultimateBackBtn = document.getElementById('ultimate-back-btn');
const ultimateMsg = document.getElementById('ultimate-msg');
const activeBoardInfo = document.getElementById('active-board-info');

// Game Selection - Handled below with all three games

// Back buttons
classicBackBtn.addEventListener('click', () => {
  classicScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetClassicGame();
});

ultimateBackBtn.addEventListener('click', () => {
  ultimateScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetUltimateGame();
});

// ==================== CLASSIC TIC TAC TOE ====================

let classicTurn0 = true;

const classicWinPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function initClassicGame() {
  classicBoxes.forEach((box, idx) => {
    box.onclick = () => handleClassicClick(idx);
  });
  resetClassicGame();
}

function handleClassicClick(idx) {
  const box = classicBoxes[idx];
  if (box.innerText !== '' || box.disabled) return;

  if (classicTurn0) {
    box.innerText = 'X';
    box.classList.add('x');
    classicTurn0 = false;
  } else {
    box.innerText = 'O';
    box.classList.add('o');
    classicTurn0 = true;
  }
  box.disabled = true;
  checkClassicWinner();
}

function checkClassicWinner() {
  for (let pattern of classicWinPatterns) {
    let pos1 = classicBoxes[pattern[0]].innerText;
    let pos2 = classicBoxes[pattern[1]].innerText;
    let pos3 = classicBoxes[pattern[2]].innerText;

    if (pos1 && pos1 === pos2 && pos2 === pos3) {
      showClassicWinner(pos1, pattern);
      return;
    }
  }

  // Check draw
  let allFilled = true;
  classicBoxes.forEach(box => {
    if (box.innerText === '') allFilled = false;
  });

  if (allFilled) {
    showClassicDraw();
  }
}

function showClassicWinner(winner, pattern) {
  classicMsg.innerText = `Player ${winner} wins!`;
  classicMsg.classList.remove('hide');
  classicMsg.classList.add('winner-msg');
  classicBoxes.forEach(box => box.disabled = true);
  pattern.forEach(idx => classicBoxes[idx].classList.add('winner'));
}

function showClassicDraw() {
  classicMsg.innerText = "It's a draw!";
  classicMsg.classList.remove('hide');
  classicMsg.classList.add('draw-msg');
  classicBoxes.forEach(box => box.disabled = true);
}

function resetClassicGame() {
  classicBoxes.forEach(box => {
    box.innerText = '';
    box.disabled = false;
    box.classList.remove('x', 'o', 'winner');
  });
  classicTurn0 = true;
  classicMsg.classList.add('hide');
  classicMsg.classList.remove('winner-msg', 'draw-msg');
}

classicResetBtn.addEventListener('click', resetClassicGame);
classicNewGameBtn.addEventListener('click', resetClassicGame);

// ==================== ULTIMATE TIC TAC TOE ====================

let ultimateBoards; // 9 boards, each with 9 cells
let ultimateBoardWinners; // Winner of each mini-board
let ultimateCurrentPlayer;
let ultimateActiveBoard; // Which board must be played in (null = any)
let ultimateGameOver;

const ultimateWinPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function initUltimateGame() {
  // Create 9 mini-boards
  ultimateBoard.innerHTML = '';
  for (let boardIdx = 0; boardIdx < 9; boardIdx++) {
    const miniBoard = document.createElement('div');
    miniBoard.className = 'mini-board';
    miniBoard.dataset.board = boardIdx;

    for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
      const cell = document.createElement('button');
      cell.className = 'mini-cell';
      cell.dataset.board = boardIdx;
      cell.dataset.cell = cellIdx;
      cell.onclick = () => handleUltimateClick(boardIdx, cellIdx);
      miniBoard.appendChild(cell);
    }

    ultimateBoard.appendChild(miniBoard);
  }

  resetUltimateGame();
}

function handleUltimateClick(boardIdx, cellIdx) {
  if (ultimateGameOver) return;

  // Check if this board is active
  if (ultimateActiveBoard !== null && ultimateActiveBoard !== boardIdx) {
    return;
  }

  // Check if board is already won
  if (ultimateBoardWinners[boardIdx]) {
    return;
  }

  const cell = document.querySelector(
    `.mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText !== '') return;

  // Make move
  cell.innerText = ultimateCurrentPlayer;
  cell.classList.add(ultimateCurrentPlayer.toLowerCase());
  cell.disabled = true;

  ultimateBoards[boardIdx][cellIdx] = ultimateCurrentPlayer;

  // Check if this mini-board is won
  const boardWinner = checkMiniBoardWinner(boardIdx);
  if (boardWinner) {
    ultimateBoardWinners[boardIdx] = boardWinner;
    const miniBoard = document.querySelector(`.mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won');
    miniBoard.dataset.winner = boardWinner;

    // Disable all cells in won board
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  } else if (ultimateBoards[boardIdx].every(c => c !== null)) {
    // Draw
    ultimateBoardWinners[boardIdx] = 'draw';
    const miniBoard = document.querySelector(`.mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won', 'draw');
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  }

  // Check for overall winner
  const result = checkUltimateWinner();
  if (result) {
    showUltimateWinner(result.winner, result.pattern);
    return;
  }

  // Check for draw
  if (ultimateBoardWinners.every(w => w !== null)) {
    showUltimateDraw();
    return;
  }

  // Set next active board
  ultimateActiveBoard = cellIdx;
  if (ultimateBoardWinners[ultimateActiveBoard]) {
    // Board is won/draw, can play anywhere
    ultimateActiveBoard = null;
  }

  // Switch player
  ultimateCurrentPlayer = ultimateCurrentPlayer === 'X' ? 'O' : 'X';

  updateUltimateUI();
}

function checkMiniBoardWinner(boardIdx) {
  const board = ultimateBoards[boardIdx];
  for (const pattern of ultimateWinPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function checkUltimateWinner() {
  for (const pattern of ultimateWinPatterns) {
    const [a, b, c] = pattern;
    if (
      ultimateBoardWinners[a] &&
      ultimateBoardWinners[a] !== 'draw' &&
      ultimateBoardWinners[a] === ultimateBoardWinners[b] &&
      ultimateBoardWinners[a] === ultimateBoardWinners[c]
    ) {
      return { winner: ultimateBoardWinners[a], pattern };
    }
  }
  return null;
}

function updateUltimateUI() {
  // Update active board highlighting
  document.querySelectorAll('.mini-board').forEach((board, idx) => {
    board.classList.remove('active');
    if (!ultimateBoardWinners[idx]) {
      if (ultimateActiveBoard === null || ultimateActiveBoard === idx) {
        board.classList.add('active');
      }
    }
  });

  // Update info text
  if (ultimateGameOver) {
    activeBoardInfo.textContent = '';
  } else if (ultimateActiveBoard === null) {
    activeBoardInfo.textContent = `Player ${ultimateCurrentPlayer}'s turn - Play anywhere`;
  } else {
    activeBoardInfo.textContent = `Player ${ultimateCurrentPlayer}'s turn - Board ${ultimateActiveBoard + 1}`;
  }
}

function showUltimateWinner(winner, pattern) {
  ultimateGameOver = true;
  ultimateMsg.innerText = `Player ${winner} wins the game!`;
  ultimateMsg.classList.remove('hide');
  ultimateMsg.classList.add('winner-msg');
  activeBoardInfo.textContent = '';
  document.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  document.querySelectorAll('.mini-board').forEach(b => b.classList.remove('active'));

  // Highlight winning boards
  pattern.forEach(idx => {
    const board = document.querySelector(`.mini-board[data-board="${idx}"]`);
    board.style.boxShadow = '0 0 0 4px #10b981, 0 0 20px rgba(16, 185, 129, 0.5)';
  });
}

function showUltimateDraw() {
  ultimateGameOver = true;
  ultimateMsg.innerText = "It's a draw!";
  ultimateMsg.classList.remove('hide');
  ultimateMsg.classList.add('draw-msg');
  activeBoardInfo.textContent = '';
  document.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  document.querySelectorAll('.mini-board').forEach(b => b.classList.remove('active'));
}

function resetUltimateGame() {
  ultimateBoards = Array(9).fill(null).map(() => Array(9).fill(null));
  ultimateBoardWinners = Array(9).fill(null);
  ultimateCurrentPlayer = 'X';
  ultimateActiveBoard = null;
  ultimateGameOver = false;

  document.querySelectorAll('.mini-cell').forEach(cell => {
    cell.innerText = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o');
  });

  document.querySelectorAll('.mini-board').forEach(board => {
    board.classList.remove('won', 'draw', 'active');
    board.removeAttribute('data-winner');
    board.style.boxShadow = '';
  });

  ultimateMsg.classList.add('hide');
  ultimateMsg.classList.remove('winner-msg', 'draw-msg');

  updateUltimateUI();
}

ultimateResetBtn.addEventListener('click', resetUltimateGame);
ultimateNewGameBtn.addEventListener('click', resetUltimateGame);

// ==================== WEIRD ULTIMATE TIC TAC TOE ====================

const weirdScreen = document.getElementById('weird-screen');
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
let weirdFlippedCells; // Set of "boardIdx-cellIdx" that have been flipped
let weirdCurrentAction; // 'place', 'flip', 'transpose', 'rotate'
let weirdRotateDirection;

// Game selection
document.querySelectorAll('.game-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const game = btn.dataset.game;
    gameSelectScreen.classList.add('hide');
    if (game === 'classic') {
      classicScreen.classList.remove('hide');
      initClassicGame();
    } else if (game === 'ultimate') {
      ultimateScreen.classList.remove('hide');
      initUltimateGame();
    } else if (game === 'weird') {
      weirdScreen.classList.remove('hide');
      initWeirdGame();
    }
  });
});

weirdBackBtn.addEventListener('click', () => {
  weirdScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetWeirdGame();
});

// Action buttons
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weirdCurrentAction = btn.dataset.action;

    // Show/hide rotate options
    const rotateOptions = document.getElementById('rotate-options');
    rotateOptions.classList.toggle('hide', weirdCurrentAction !== 'rotate');

    weirdBoard.dataset.action = weirdCurrentAction;
    updateWeirdUI();
  });
});

// Rotate direction buttons
document.querySelectorAll('.rotate-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rotate-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weirdRotateDirection = btn.dataset.dir;
  });
});

function initWeirdGame() {
  // Create 9 mini-boards
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

function handleWeirdPlace(boardIdx, cellIdx) {
  // Check active board rule
  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) {
    return;
  }

  if (weirdBoardWinners[boardIdx]) return;

  const cell = document.querySelector(
    `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText !== '') return;

  // Place symbol (current player's symbol)
  cell.innerText = weirdCurrentPlayer;
  cell.classList.add(weirdCurrentPlayer.toLowerCase());

  weirdBoards[boardIdx][cellIdx] = weirdCurrentPlayer;

  // Check mini-board win
  checkWeirdMiniBoard(boardIdx);

  // Check game win
  const gameResult = checkWeirdWinner();
  if (gameResult) {
    showWeirdWinner(gameResult.winner, gameResult.pattern);
    return;
  }

  if (weirdBoardWinners.every(w => w !== null)) {
    showWeirdDraw();
    return;
  }

  // Set next active board
  weirdActiveBoard = cellIdx;
  if (weirdBoardWinners[weirdActiveBoard]) {
    weirdActiveBoard = null;
  }

  // Switch player
  weirdCurrentPlayer = weirdCurrentPlayer === 'X' ? 'O' : 'X';
  updateWeirdUI();
}

function handleWeirdFlip(boardIdx, cellIdx) {
  if (weirdBoardWinners[boardIdx]) return;

  // Check active board rule
  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) {
    return;
  }

  const cell = document.querySelector(
    `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText === '') return;

  const flipKey = `${boardIdx}-${cellIdx}`;
  if (weirdFlippedCells.has(flipKey)) return;

  // Flip the cell
  const currentVal = cell.innerText;
  const newVal = currentVal === 'X' ? 'O' : 'X';

  cell.innerText = newVal;
  cell.classList.remove('x', 'o');
  cell.classList.add(newVal.toLowerCase());
  cell.classList.add('flipped');

  weirdBoards[boardIdx][cellIdx] = newVal;
  weirdFlippedCells.add(flipKey);

  // Check mini-board win
  checkWeirdMiniBoard(boardIdx);

  // Check game win
  const gameResult = checkWeirdWinner();
  if (gameResult) {
    showWeirdWinner(gameResult.winner, gameResult.pattern);
    return;
  }

  if (weirdBoardWinners.every(w => w !== null)) {
    showWeirdDraw();
    return;
  }

  // Flipped cell determines next forced board
  weirdActiveBoard = cellIdx;
  if (weirdBoardWinners[weirdActiveBoard]) {
    weirdActiveBoard = null;
  }

  // Switch player
  weirdCurrentPlayer = weirdCurrentPlayer === 'X' ? 'O' : 'X';
  updateWeirdUI();
}

function handleWeirdTranspose(boardIdx) {
  if (weirdBoardWinners[boardIdx]) return;

  // Check active board rule
  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) {
    return;
  }

  // Transpose the board
  const board = weirdBoards[boardIdx];
  const newBoard = Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      newBoard[j * 3 + i] = board[i * 3 + j];
    }
  }
  weirdBoards[boardIdx] = newBoard;

  // Update UI
  updateWeirdBoardUI(boardIdx);

  // Check mini-board win
  checkWeirdMiniBoard(boardIdx);

  // Check game win
  const gameResult = checkWeirdWinner();
  if (gameResult) {
    showWeirdWinner(gameResult.winner, gameResult.pattern);
    return;
  }

  if (weirdBoardWinners.every(w => w !== null)) {
    showWeirdDraw();
    return;
  }

  // No cell targeted — next player plays anywhere
  weirdActiveBoard = null;

  // Switch player
  weirdCurrentPlayer = weirdCurrentPlayer === 'X' ? 'O' : 'X';
  updateWeirdUI();
}

function handleWeirdRotate(boardIdx) {
  if (weirdBoardWinners[boardIdx]) return;

  if (weirdActiveBoard !== null && weirdActiveBoard !== boardIdx) {
    return;
  }

  // Rotate the board
  const board = weirdBoards[boardIdx];
  const newBoard = Array(9);
  if (weirdRotateDirection === 'cw') {
    // Clockwise: (i,j) -> (j, 2-i)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newBoard[j * 3 + (2 - i)] = board[i * 3 + j];
      }
    }
  } else {
    // Counter-clockwise: (i,j) -> (2-j, i)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newBoard[(2 - j) * 3 + i] = board[i * 3 + j];
      }
    }
  }
  weirdBoards[boardIdx] = newBoard;

  // Update UI
  updateWeirdBoardUI(boardIdx);

  // Check mini-board win
  checkWeirdMiniBoard(boardIdx);

  // Check game win
  const gameResult = checkWeirdWinner();
  if (gameResult) {
    showWeirdWinner(gameResult.winner, gameResult.pattern);
    return;
  }

  if (weirdBoardWinners.every(w => w !== null)) {
    showWeirdDraw();
    return;
  }

  // No cell targeted — next player plays anywhere
  weirdActiveBoard = null;

  // Switch player
  weirdCurrentPlayer = weirdCurrentPlayer === 'X' ? 'O' : 'X';
  updateWeirdUI();
}

function updateWeirdBoardUI(boardIdx) {
  const board = weirdBoards[boardIdx];
  for (let i = 0; i < 9; i++) {
    const cell = document.querySelector(
      `#weird-board .mini-cell[data-board="${boardIdx}"][data-cell="${i}"]`
    );
    cell.innerText = board[i] || '';
    cell.classList.remove('x', 'o');
    if (board[i]) {
      cell.classList.add(board[i].toLowerCase());
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
      miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
      return;
    }
  }

  if (board.every(c => c !== null)) {
    weirdBoardWinners[boardIdx] = 'draw';
    const miniBoard = document.querySelector(`#weird-board .mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won', 'draw');
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
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

function updateWeirdUI() {
  document.querySelectorAll('#weird-board .mini-board').forEach((board, idx) => {
    board.classList.remove('active');
    if (!weirdBoardWinners[idx]) {
      if (weirdActiveBoard === null || weirdActiveBoard === idx) {
        board.classList.add('active');
      }
    }
  });

  if (weirdGameOver) {
    weirdActiveBoardInfo.textContent = '';
  } else if (weirdActiveBoard === null) {
    weirdActiveBoardInfo.textContent = `Player ${weirdCurrentPlayer}'s turn - Play anywhere`;
  } else {
    weirdActiveBoardInfo.textContent = `Player ${weirdCurrentPlayer}'s turn - Board ${weirdActiveBoard + 1}`;
  }

  // Enable/disable action buttons based on what's valid in the target board(s)
  const boardsToCheck = weirdActiveBoard !== null
    ? [weirdActiveBoard]
    : Array.from({length: 9}, (_, i) => i).filter(i => !weirdBoardWinners[i]);

  const canPlace = !weirdGameOver && boardsToCheck.some(b =>
    weirdBoards[b].some(cell => cell === null)
  );
  const canFlip = !weirdGameOver && boardsToCheck.some(b =>
    weirdBoards[b].some((cell, ci) => cell !== null && !weirdFlippedCells.has(`${b}-${ci}`))
  );
  const canTranspose = !weirdGameOver && boardsToCheck.some(b =>
    weirdBoards[b].filter(cell => cell !== null).length >= 2
  );
  const canRotate = canTranspose;

  const actionAvail = { place: canPlace, flip: canFlip, transpose: canTranspose, rotate: canRotate };

  document.querySelectorAll('.action-btn').forEach(btn => {
    const action = btn.dataset.action;
    const disabled = !actionAvail[action];
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

  // Set per-cell disabled state based on current action
  document.querySelectorAll('#weird-board .mini-board').forEach((miniBoard, boardIdx) => {
    const isTarget = !weirdBoardWinners[boardIdx] &&
      (weirdActiveBoard === null || weirdActiveBoard === boardIdx);

    miniBoard.querySelectorAll('.mini-cell').forEach((cell, cellIdx) => {
      if (weirdGameOver || weirdBoardWinners[boardIdx] || !isTarget) {
        cell.disabled = true;
        return;
      }

      switch (weirdCurrentAction) {
        case 'place':
          cell.disabled = cell.innerText !== '';
          break;
        case 'flip':
          cell.disabled = cell.innerText === '' || weirdFlippedCells.has(`${boardIdx}-${cellIdx}`);
          break;
        case 'transpose':
        case 'rotate':
          cell.disabled = false;
          break;
      }
    });
  });
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
}

function showWeirdDraw() {
  weirdGameOver = true;
  weirdMsg.innerText = "It's a draw!";
  weirdMsg.classList.remove('hide');
  weirdMsg.classList.add('draw-msg');
  weirdActiveBoardInfo.textContent = '';
  document.querySelectorAll('#weird-board .mini-cell').forEach(c => c.disabled = true);
  document.querySelectorAll('#weird-board .mini-board').forEach(b => b.classList.remove('active'));
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

  // Reset action buttons
  document.querySelectorAll('.action-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  document.getElementById('rotate-options').classList.add('hide');
  document.querySelectorAll('.rotate-opt').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  updateWeirdUI();
}

weirdResetBtn.addEventListener('click', resetWeirdGame);
weirdNewGameBtn.addEventListener('click', resetWeirdGame);
