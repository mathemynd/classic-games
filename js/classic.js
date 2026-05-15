const classicBoxes = document.querySelectorAll('#classic-board .box');
const classicResetBtn = document.getElementById('reset-btn');
const classicNewGameBtn = document.getElementById('new-game');
const classicBackBtn = document.getElementById('back-btn');
const classicMsg = document.getElementById('msg');

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

  const player = classicTurn0 ? 'X' : 'O';
  box.innerText = player;
  box.classList.add(player.toLowerCase());
  classicTurn0 = !classicTurn0;
  box.disabled = true;
  GameLogger.move(player, 'place', 0, idx);
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
  GameLogger.gameWon(winner);
}

function showClassicDraw() {
  classicMsg.innerText = "It's a draw!";
  classicMsg.classList.remove('hide');
  classicMsg.classList.add('draw-msg');
  classicBoxes.forEach(box => box.disabled = true);
  GameLogger.gameDraw();
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

classicBackBtn.addEventListener('click', () => {
  classicScreen.classList.add('hide');
  gameSelectScreen.classList.remove('hide');
  resetClassicGame();
});

classicResetBtn.addEventListener('click', () => { GameLogger.reset('classic'); resetClassicGame(); });
classicNewGameBtn.addEventListener('click', () => { GameLogger.reset('classic'); resetClassicGame(); });
