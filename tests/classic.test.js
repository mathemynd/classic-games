import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function setupDOM() {
  document.body.innerHTML = '';
  document.documentElement.innerHTML = html.match(/<html[^>]*>([\s\S]*)<\/html>/i)?.[1] || '';
  const script = ['js/common.js', 'js/classic.js', 'js/ultimate.js', 'js/weird.js']
    .map(f => fs.readFileSync(path.resolve(__dirname, '..', f), 'utf-8'))
    .join('\n');
  eval(script);
}

function clickCell(idx) {
  const cells = document.querySelectorAll('#classic-board .box');
  cells[idx].click();
}

function cellText(idx) {
  return document.querySelectorAll('#classic-board .box')[idx].innerText;
}

function allCells() {
  return [...document.querySelectorAll('#classic-board .box')];
}

function msg() {
  return document.getElementById('msg');
}

describe('Classic Tic Tac Toe', () => {
  beforeEach(() => {
    setupDOM();
    // Select classic game
    document.querySelector('[data-game="classic"]').click();
  });

  it('shows classic screen after selection', () => {
    expect(document.getElementById('classic-screen').classList.contains('hide')).toBe(false);
    expect(document.getElementById('game-select').classList.contains('hide')).toBe(true);
  });

  it('X goes first', () => {
    clickCell(0);
    expect(cellText(0)).toBe('X');
  });

  it('turns alternate between X and O', () => {
    clickCell(0);
    clickCell(1);
    expect(cellText(0)).toBe('X');
    expect(cellText(1)).toBe('O');
  });

  it('cannot click an occupied cell', () => {
    clickCell(0); // X
    clickCell(0); // try again — should be ignored
    expect(cellText(0)).toBe('X');
    // O's turn should still be intact
    clickCell(1);
    expect(cellText(1)).toBe('O');
  });

  it('X wins with top row', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins

    expect(msg().innerText).toBe('Player X wins!');
    expect(msg().classList.contains('hide')).toBe(false);
    expect(msg().classList.contains('winner-msg')).toBe(true);
  });

  it('O wins with diagonal', () => {
    clickCell(1); // X
    clickCell(0); // O
    clickCell(2); // X
    clickCell(4); // O
    clickCell(5); // X
    clickCell(8); // O wins

    expect(msg().innerText).toBe('Player O wins!');
  });

  it('winning cells get highlighted', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins top row

    const cells = allCells();
    expect(cells[0].classList.contains('winner')).toBe(true);
    expect(cells[1].classList.contains('winner')).toBe(true);
    expect(cells[2].classList.contains('winner')).toBe(true);
    expect(cells[3].classList.contains('winner')).toBe(false);
    expect(cells[4].classList.contains('winner')).toBe(false);
  });

  it('detects a draw', () => {
    // X O X
    // X X O
    // O X O
    clickCell(0); // X
    clickCell(1); // O
    clickCell(2); // X
    clickCell(5); // O
    clickCell(3); // X
    clickCell(6); // O
    clickCell(4); // X
    clickCell(8); // O
    clickCell(7); // X — draw

    expect(msg().innerText).toBe("It's a draw!");
    expect(msg().classList.contains('hide')).toBe(false);
    expect(msg().classList.contains('draw-msg')).toBe(true);
  });

  it('disables all cells after win', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins

    // clicking an empty cell should have no effect
    clickCell(5);
    expect(cellText(5)).toBe('');
  });

  it('disables all cells after draw', () => {
    clickCell(0); // X
    clickCell(1); // O
    clickCell(2); // X
    clickCell(5); // O
    clickCell(3); // X
    clickCell(6); // O
    clickCell(4); // X
    clickCell(8); // O
    clickCell(7); // X — draw

    allCells().forEach(cell => {
      expect(cell.disabled).toBe(true);
    });
  });

  it('new game resets the board', () => {
    clickCell(0); // X
    clickCell(1); // O
    document.getElementById('new-game').click();

    allCells().forEach(cell => {
      expect(cell.innerText).toBe('');
      expect(cell.disabled).toBe(false);
    });
    expect(msg().classList.contains('hide')).toBe(true);
  });

  it('reset after win clears everything', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins

    document.getElementById('reset-btn').click();

    allCells().forEach(cell => {
      expect(cell.innerText).toBe('');
      expect(cell.disabled).toBe(false);
      expect(cell.classList.contains('winner')).toBe(false);
    });
    expect(msg().classList.contains('hide')).toBe(true);
    // X should go first again
    clickCell(4);
    expect(cellText(4)).toBe('X');
  });

  it('change game goes back to selection', () => {
    document.getElementById('back-btn').click();
    expect(document.getElementById('game-select').classList.contains('hide')).toBe(false);
    expect(document.getElementById('classic-screen').classList.contains('hide')).toBe(true);
  });

  it('X wins with left column', () => {
    clickCell(0); // X
    clickCell(1); // O
    clickCell(3); // X
    clickCell(4); // O
    clickCell(6); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with anti-diagonal', () => {
    clickCell(2); // X
    clickCell(0); // O
    clickCell(4); // X
    clickCell(1); // O
    clickCell(6); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with middle row', () => {
    clickCell(3); // X
    clickCell(0); // O
    clickCell(4); // X
    clickCell(1); // O
    clickCell(5); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with bottom row', () => {
    clickCell(6); // X
    clickCell(0); // O
    clickCell(7); // X
    clickCell(1); // O
    clickCell(8); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with middle column', () => {
    clickCell(1); // X
    clickCell(0); // O
    clickCell(4); // X
    clickCell(3); // O
    clickCell(7); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with right column', () => {
    clickCell(2); // X
    clickCell(0); // O
    clickCell(5); // X
    clickCell(3); // O
    clickCell(8); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('X wins with main diagonal', () => {
    clickCell(0); // X
    clickCell(1); // O
    clickCell(4); // X
    clickCell(2); // O
    clickCell(8); // X wins

    expect(msg().innerText).toBe('Player X wins!');
  });

  it('win on 9th cell takes priority over draw', () => {
    // X O X
    // O X O
    // O X X
    clickCell(0); // X
    clickCell(1); // O
    clickCell(2); // X
    clickCell(5); // O
    clickCell(4); // X
    clickCell(3); // O
    clickCell(7); // X
    clickCell(6); // O
    clickCell(8); // X wins on last cell (right column: 2,5,8... no. Let me recalc)

    // Board:     // 0:X 1:O 2:X
    // 3:O 4:X 5:O
    // 6:O 7:X 8:X
    // diagonal 0,4,8 = X,X,X → X wins
    expect(msg().innerText).toBe('Player X wins!');
    expect(msg().classList.contains('winner-msg')).toBe(true);
    expect(msg().classList.contains('draw-msg')).toBe(false);
  });

  it('placed cells get correct CSS classes', () => {
    clickCell(0); // X
    clickCell(1); // O

    const cells = allCells();
    expect(cells[0].classList.contains('x')).toBe(true);
    expect(cells[0].classList.contains('o')).toBe(false);
    expect(cells[1].classList.contains('o')).toBe(true);
    expect(cells[1].classList.contains('x')).toBe(false);
  });

  it('reset after draw clears everything', () => {
    clickCell(0); // X
    clickCell(1); // O
    clickCell(2); // X
    clickCell(5); // O
    clickCell(3); // X
    clickCell(6); // O
    clickCell(4); // X
    clickCell(8); // O
    clickCell(7); // X — draw

    expect(msg().classList.contains('draw-msg')).toBe(true);

    document.getElementById('reset-btn').click();

    allCells().forEach(cell => {
      expect(cell.innerText).toBe('');
      expect(cell.disabled).toBe(false);
    });
    expect(msg().classList.contains('hide')).toBe(true);
    expect(msg().classList.contains('draw-msg')).toBe(false);
  });

  it('can play multiple games in a row', () => {
    // Game 1: X wins
    clickCell(0); clickCell(3);
    clickCell(1); clickCell(4);
    clickCell(2);
    expect(msg().innerText).toBe('Player X wins!');

    // Reset and play game 2: O wins
    document.getElementById('new-game').click();
    clickCell(3); // X
    clickCell(0); // O
    clickCell(4); // X
    clickCell(1); // O
    clickCell(6); // X
    clickCell(2); // O wins top row
    expect(msg().innerText).toBe('Player O wins!');

    // Reset and play game 3: draw
    document.getElementById('reset-btn').click();
    clickCell(0); clickCell(1);
    clickCell(2); clickCell(5);
    clickCell(3); clickCell(6);
    clickCell(4); clickCell(8);
    clickCell(7);
    expect(msg().innerText).toBe("It's a draw!");
  });

  it('reset button works same as new game button', () => {
    clickCell(0); clickCell(3);
    clickCell(1); clickCell(4);
    clickCell(2); // X wins

    document.getElementById('reset-btn').click();

    allCells().forEach(cell => {
      expect(cell.innerText).toBe('');
      expect(cell.disabled).toBe(false);
    });
    expect(msg().classList.contains('hide')).toBe(true);
    clickCell(4);
    expect(cellText(4)).toBe('X');
  });

  // --- Bad paths ---

  it('message is hidden on initial load', () => {
    expect(msg().classList.contains('hide')).toBe(true);
    expect(msg().innerText || '').toBe('');
  });

  it('non-winning cells of the winner do not get highlighted', () => {
    // X plays 0, 1, 2, 4 — wins with top row (0,1,2)
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(6); // O
    clickCell(4); // X (non-winning X cell)
    clickCell(7); // O
    clickCell(2); // X wins top row

    const cells = allCells();
    expect(cells[0].classList.contains('winner')).toBe(true);
    expect(cells[1].classList.contains('winner')).toBe(true);
    expect(cells[2].classList.contains('winner')).toBe(true);
    expect(cells[4].classList.contains('winner')).toBe(false);
  });

  it('re-entering classic resets the board', () => {
    clickCell(0); // X
    clickCell(1); // O
    clickCell(4); // X

    // Go back to selection
    document.getElementById('back-btn').click();
    // Re-select classic
    document.querySelector('[data-game="classic"]').click();

    allCells().forEach(cell => {
      expect(cell.innerText).toBe('');
      expect(cell.disabled).toBe(false);
    });
    expect(msg().classList.contains('hide')).toBe(true);
    // X goes first again
    clickCell(0);
    expect(cellText(0)).toBe('X');
  });

  it('earliest possible win (5th move) does not trigger draw', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins on move 5

    expect(msg().innerText).toBe('Player X wins!');
    expect(msg().classList.contains('winner-msg')).toBe(true);
    expect(msg().classList.contains('draw-msg')).toBe(false);
  });

  it('clicking after game over does not change turn order on reset', () => {
    clickCell(0); // X
    clickCell(3); // O
    clickCell(1); // X
    clickCell(4); // O
    clickCell(2); // X wins

    // Spam clicks after game over
    clickCell(5);
    clickCell(6);
    clickCell(7);

    // Reset — X should still go first
    document.getElementById('new-game').click();
    clickCell(0);
    expect(cellText(0)).toBe('X');
    clickCell(1);
    expect(cellText(1)).toBe('O');
  });
});
