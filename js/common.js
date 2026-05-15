const gameSelectScreen = document.getElementById('game-select');
const classicScreen = document.getElementById('classic-screen');
const ultimateScreen = document.getElementById('ultimate-screen');
const weirdScreen = document.getElementById('weird-screen');

document.querySelectorAll('.game-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const game = btn.dataset.game;
    gameSelectScreen.classList.add('hide');
    GameLogger.startGame(game);
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
