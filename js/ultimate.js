const ultimateBoard = document.getElementById('ultimate-board');
const ultimateResetBtn = document.getElementById('ultimate-reset-btn');
const ultimateNewGameBtn = document.getElementById('ultimate-new-game');
const ultimateBackBtn = document.getElementById('ultimate-back-btn');
const ultimateMsg = document.getElementById('ultimate-msg');
const activeBoardInfo = document.getElementById('active-board-info');

let ultimateBoards;
let ultimateBoardWinners;
let ultimateCurrentPlayer;
let ultimateActiveBoard;
let ultimateGameOver;

const ultimateWinPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function initUltimateGame() {
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

function checkUltimateMiniBoard(boardIdx) {
  const boardWinner = checkMiniBoardWinner(boardIdx);
  if (boardWinner) {
    ultimateBoardWinners[boardIdx] = boardWinner;
    const miniBoard = document.querySelector(`.mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won');
    miniBoard.dataset.winner = boardWinner;
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  } else if (ultimateBoards[boardIdx].every(c => c !== null)) {
    ultimateBoardWinners[boardIdx] = 'draw';
    const miniBoard = document.querySelector(`.mini-board[data-board="${boardIdx}"]`);
    miniBoard.classList.add('won', 'draw');
    miniBoard.querySelectorAll('.mini-cell').forEach(c => c.disabled = true);
  }
}

function finishUltimateTurn(boardIdx, nextActiveBoard) {
  checkUltimateMiniBoard(boardIdx);

  const result = checkUltimateWinner();
  if (result) {
    showUltimateWinner(result.winner, result.pattern);
    return;
  }

  if (ultimateBoardWinners.every(w => w !== null)) {
    showUltimateDraw();
    return;
  }

  ultimateActiveBoard = nextActiveBoard;
  if (ultimateActiveBoard !== null && ultimateBoardWinners[ultimateActiveBoard]) {
    ultimateActiveBoard = null;
  }

  ultimateCurrentPlayer = ultimateCurrentPlayer === 'X' ? 'O' : 'X';
  updateUltimateUI();
}

function handleUltimateClick(boardIdx, cellIdx) {
  if (ultimateGameOver) return;
  if (ultimateActiveBoard !== null && ultimateActiveBoard !== boardIdx) return;
  if (ultimateBoardWinners[boardIdx]) return;

  const cell = document.querySelector(
    `.mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );

  if (cell.innerText !== '') return;

  cell.innerText = ultimateCurrentPlayer;
  cell.classList.add(ultimateCurrentPlayer.toLowerCase());
  cell.disabled = true;

  ultimateBoards[boardIdx][cellIdx] = ultimateCurrentPlayer;

  finishUltimateTurn(boardIdx, cellIdx);
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
  document.querySelectorAll('.mini-board').forEach((board, idx) => {
    board.classList.remove('active');
    if (!ultimateBoardWinners[idx]) {
      if (ultimateActiveBoard === null || ultimateActiveBoard === idx) {
        board.classList.add('active');
      }
    }
  });

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

ultimateBackBtn.addEventListener('click', () => {
  ultimateScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetUltimateGame();
});

ultimateResetBtn.addEventListener('click', resetUltimateGame);
ultimateNewGameBtn.addEventListener('click', resetUltimateGame);
