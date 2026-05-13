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

// Game Selection
gameOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const game = btn.dataset.game;
    gameSelectScreen.classList.add('hide');
    if (game === 'classic') {
      classicScreen.classList.remove('hide');
      initClassicGame();
    } else {
      ultimateScreen.classList.remove('hide');
      initUltimateGame();
    }
  });
});

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
