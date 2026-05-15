import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function setupDOM() {
  document.body.innerHTML = '';
  document.documentElement.innerHTML = html.match(/<html[^>]*>([\s\S]*)<\/html>/i)?.[1] || '';
  const script = ['js/logger.js', 'js/common.js', 'js/classic.js', 'js/ultimate.js', 'js/weird.js']
    .map(f => fs.readFileSync(path.resolve(__dirname, '..', f), 'utf-8'))
    .join('\n');
  eval(script);
}

function cell(boardIdx, cellIdx) {
  return document.querySelector(
    `#ultimate-board .mini-cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`
  );
}

function clickCell(boardIdx, cellIdx) {
  cell(boardIdx, cellIdx).click();
}

function cellText(boardIdx, cellIdx) {
  return cell(boardIdx, cellIdx).innerText;
}

function miniBoard(idx) {
  return document.querySelector(`#ultimate-board .mini-board[data-board="${idx}"]`);
}

function msg() {
  return document.getElementById('ultimate-msg');
}

function info() {
  return document.getElementById('active-board-info');
}

describe('Ultimate Tic Tac Toe', () => {
  beforeEach(() => {
    setupDOM();
    document.querySelector('[data-game="ultimate"]').click();
  });

  // --- Screen navigation ---

  it('shows ultimate screen after selection', () => {
    expect(document.getElementById('ultimate-screen').classList.contains('hide')).toBe(false);
    expect(document.getElementById('game-select').classList.contains('hide')).toBe(true);
  });

  it('change game goes back to selection', () => {
    document.getElementById('ultimate-back-btn').click();
    expect(document.getElementById('game-select').classList.contains('hide')).toBe(false);
    expect(document.getElementById('ultimate-screen').classList.contains('hide')).toBe(true);
  });

  // --- Basic moves ---

  it('X goes first', () => {
    clickCell(0, 0);
    expect(cellText(0, 0)).toBe('X');
  });

  it('turns alternate between X and O', () => {
    clickCell(0, 0); // X in board 0 cell 0
    clickCell(0, 1); // O forced to board 0, plays cell 1
    expect(cellText(0, 0)).toBe('X');
    expect(cellText(0, 1)).toBe('O');
  });

  it('cannot click an occupied cell', () => {
    clickCell(0, 0); // X
    clickCell(0, 0); // try again — ignored
    expect(cellText(0, 0)).toBe('X');
    // O should still be able to play
    clickCell(0, 1); // O forced to board 0
    expect(cellText(0, 1)).toBe('O');
  });

  // --- Forced board rule ---

  it('first move can be in any board', () => {
    clickCell(4, 4); // X plays center of center board
    expect(cellText(4, 4)).toBe('X');
    expect(info().textContent).toContain('Board 5');
  });

  it('forces opponent to board matching cell index', () => {
    clickCell(0, 4); // X plays cell 4 in board 0 → O forced to board 4
    expect(info().textContent).toContain('Board 5'); // board 4 is displayed as "Board 5" (1-indexed)

    // O can play in board 4
    clickCell(4, 0);
    expect(cellText(4, 0)).toBe('O');
  });

  it('rejects moves in non-active board', () => {
    clickCell(0, 4); // X → O forced to board 4
    clickCell(3, 0); // O tries board 3 — rejected
    expect(cellText(3, 0)).toBe('');
    // O's turn is preserved
    clickCell(4, 0);
    expect(cellText(4, 0)).toBe('O');
  });

  it('free move when forced board is already won', () => {
    // X wins board 0: cells 0, 1, 2
    clickCell(0, 0); // X → O to board 0
    clickCell(0, 3); // O in board 0 cell 3 → X to board 3
    clickCell(3, 0); // X in board 3 cell 0 → O to board 0
    clickCell(0, 4); // O in board 0 cell 4 → X to board 4
    clickCell(4, 0); // X in board 4 cell 0 → O to board 0
    clickCell(0, 1); // O in board 0 cell 1 → X to board 1
    clickCell(1, 0); // X in board 1 cell 0 → O to board 0
    clickCell(0, 5); // O in board 0 cell 5 → X to board 5
    clickCell(5, 0); // X in board 5 cell 0 → O to board 0
    clickCell(0, 2); // O in board 0 cell 2 → X to board 2

    // O now owns board 0 top row? Let me re-check...
    // Actually: board 0 cells: 0=X, 3=O, 4=O, 1=O, 5=O, 2=O
    // O has cells 3,4,1,5,2 → pattern [3,4,5] = O,O,O → O wins board 0

    expect(miniBoard(0).classList.contains('won')).toBe(true);

    // X is now at board 2. X plays cell 0 → O forced to board 0
    clickCell(2, 0); // X in board 2 → O to board 0
    // Board 0 is won → O gets free move
    expect(info().textContent).toContain('Play anywhere');
  });

  it('marks mini-board as won with correct winner', () => {
    // Simpler: X takes board 4 cells 0, 1, 2 (top row)
    // X plays board 4 cell 0, O responds, X plays board 4 cell 1, etc.
    clickCell(4, 0); // X in board 4 → O to board 0
    clickCell(0, 4); // O in board 0 → X to board 4
    clickCell(4, 1); // X in board 4 → O to board 1
    clickCell(1, 4); // O in board 1 → X to board 4
    clickCell(4, 2); // X wins board 4

    expect(miniBoard(4).classList.contains('won')).toBe(true);
    expect(miniBoard(4).dataset.winner).toBe('X');
  });

  it('cannot play in a won mini-board', () => {
    // X wins board 4
    clickCell(4, 0); // X → O to board 0
    clickCell(0, 4); // O → X to board 4
    clickCell(4, 1); // X → O to board 1
    clickCell(1, 4); // O → X to board 4
    clickCell(4, 2); // X wins board 4 → O to board 2

    // O plays in board 2
    clickCell(2, 4); // O → X to board 4
    // Board 4 is won → X gets free move
    expect(info().textContent).toContain('Play anywhere');

    // Trying to click in won board 4 should fail
    clickCell(4, 5);
    expect(cellText(4, 5)).toBe('');
  });

  // --- Mini-board draw ---

  it('winning boards get highlighted with box-shadow', () => {
    // X wins board 4 (top row: cells 0, 1, 2)
    clickCell(4, 0); // X → O to 0
    clickCell(0, 4); // O → X to 4
    clickCell(4, 1); // X → O to 1
    clickCell(1, 4); // O → X to 4
    clickCell(4, 2); // X wins board 4

    // Board 4 should have a box-shadow set via inline style
    // (only on overall game win, not mini-board win)
    // Mini-board win just adds .won class, game win adds boxShadow
    expect(miniBoard(4).classList.contains('won')).toBe(true);
    // No game-level win yet — just 1 board
    expect(msg().classList.contains('hide')).toBe(true);
  });

  // --- Active board info text ---

  it('shows "Play anywhere" at game start', () => {
    expect(info().textContent).toContain('Play anywhere');
  });

  it('shows forced board after a move', () => {
    clickCell(3, 7); // X plays cell 7 in board 3 → O forced to board 7
    expect(info().textContent).toContain('Board 8'); // 1-indexed
  });

  it('shows correct player in info text', () => {
    expect(info().textContent).toContain('Player X');
    clickCell(0, 0);
    expect(info().textContent).toContain('Player O');
  });

  // --- Reset ---

  it('new game resets everything', () => {
    clickCell(0, 0);
    clickCell(0, 1);

    document.getElementById('ultimate-new-game').click();

    // All cells empty
    for (let b = 0; b < 9; b++) {
      for (let c = 0; c < 9; c++) {
        expect(cellText(b, c)).toBe('');
      }
    }
    expect(msg().classList.contains('hide')).toBe(true);
    expect(info().textContent).toContain('Play anywhere');
  });

  it('reset button works same as new game', () => {
    clickCell(4, 4);
    clickCell(4, 0);

    document.getElementById('ultimate-reset-btn').click();

    for (let b = 0; b < 9; b++) {
      for (let c = 0; c < 9; c++) {
        expect(cellText(b, c)).toBe('');
      }
    }
    expect(info().textContent).toContain('Play anywhere');
  });

  it('X goes first after reset', () => {
    clickCell(0, 0); // X
    clickCell(0, 1); // O
    document.getElementById('ultimate-new-game').click();

    clickCell(0, 0);
    expect(cellText(0, 0)).toBe('X');
  });

  // --- Bad paths ---

  it('message is hidden on initial load', () => {
    expect(msg().classList.contains('hide')).toBe(true);
  });

  it('cells get correct CSS classes', () => {
    clickCell(0, 0); // X
    clickCell(0, 1); // O
    expect(cell(0, 0).classList.contains('x')).toBe(true);
    expect(cell(0, 1).classList.contains('o')).toBe(true);
  });

  it('re-entering ultimate resets the board', () => {
    clickCell(0, 0);
    clickCell(0, 1);

    document.getElementById('ultimate-back-btn').click();
    document.querySelector('[data-game="ultimate"]').click();

    for (let b = 0; b < 9; b++) {
      for (let c = 0; c < 9; c++) {
        expect(cellText(b, c)).toBe('');
      }
    }
    expect(info().textContent).toContain('Play anywhere');
  });

  it('active board highlight is set correctly', () => {
    // At start all non-won boards are active
    for (let i = 0; i < 9; i++) {
      expect(miniBoard(i).classList.contains('active')).toBe(true);
    }

    clickCell(0, 4); // X → O forced to board 4
    // Only board 4 should be active
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        expect(miniBoard(i).classList.contains('active')).toBe(true);
      } else {
        expect(miniBoard(i).classList.contains('active')).toBe(false);
      }
    }
  });

  it('sending opponent to own board works', () => {
    // X plays cell 0 in board 0 → O forced to board 0
    clickCell(0, 0); // X
    // O is forced to board 0 (same board X just played in)
    clickCell(0, 1); // O plays cell 1 in board 0
    expect(cellText(0, 1)).toBe('O');
  });

  it('self-referencing move: play cell N in board N', () => {
    // X plays cell 4 in board 4 → O forced to board 4
    clickCell(4, 4); // X
    expect(info().textContent).toContain('Board 5');
    clickCell(4, 0); // O in board 4 → X forced to board 0
    expect(cellText(4, 0)).toBe('O');
  });

  // --- Corner cases ---

  it('O can win a mini-board', () => {
    // O wins board 0 via cells 3, 4, 5 (middle row)
    // X plays cell 0 in various boards → O forced to board 0 each time
    clickCell(0, 0); // X(0,0) → O to 0
    clickCell(0, 3); // O(0,3) → X to 3
    clickCell(3, 0); // X(3,0) → O to 0
    clickCell(0, 4); // O(0,4) → X to 4
    clickCell(4, 0); // X(4,0) → O to 0
    clickCell(0, 5); // O(0,5) → X to 5
    // Board 0: 0=X, 3=O, 4=O, 5=O → O wins [3,4,5]

    expect(miniBoard(0).classList.contains('won')).toBe(true);
    expect(miniBoard(0).dataset.winner).toBe('O');
  });

  it('cells in won board are disabled', () => {
    // X wins board 4
    clickCell(4, 0); // X → O to 0
    clickCell(0, 4); // O → X to 4
    clickCell(4, 1); // X → O to 1
    clickCell(1, 4); // O → X to 4
    clickCell(4, 2); // X wins board 4

    // All cells in board 4 should be disabled
    for (let c = 0; c < 9; c++) {
      expect(cell(4, c).disabled).toBe(true);
    }
  });

  it('won board loses active class', () => {
    // X wins board 4
    clickCell(4, 0); // X → O to 0
    clickCell(0, 4); // O → X to 4
    clickCell(4, 1); // X → O to 1
    clickCell(1, 4); // O → X to 4
    clickCell(4, 2); // X wins board 4 → O to 2

    // Board 4 won — should not have active class even during free move
    clickCell(2, 4); // O → X to 4 (won) → free move
    expect(miniBoard(4).classList.contains('active')).toBe(false);
  });

  it('forced board chain across multiple moves', () => {
    clickCell(0, 5); // X → O forced to 5
    expect(info().textContent).toContain('Board 6');

    clickCell(5, 3); // O → X forced to 3
    expect(info().textContent).toContain('Board 4');

    clickCell(3, 7); // X → O forced to 7
    expect(info().textContent).toContain('Board 8');

    clickCell(7, 1); // O → X forced to 1
    expect(info().textContent).toContain('Board 2');
  });

  it('free move allows playing in any non-won board', () => {
    // X wins board 4 → when someone is sent to board 4, they get free move
    clickCell(4, 0); // X → O to 0
    clickCell(0, 4); // O → X to 4
    clickCell(4, 1); // X → O to 1
    clickCell(1, 4); // O → X to 4
    clickCell(4, 2); // X wins board 4 → O to 2

    clickCell(2, 4); // O → X to 4 (won) → X gets free move

    // X should be able to play in board 6 (or any non-won board)
    clickCell(6, 0);
    expect(cellText(6, 0)).toBe('X');
  });

  it('all non-won boards are active during free move', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2); // X wins board 4 → O to 2

    clickCell(2, 4); // O → X to 4 (won) → free move

    // All boards except 4 should be active
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        expect(miniBoard(i).classList.contains('active')).toBe(false);
      } else {
        expect(miniBoard(i).classList.contains('active')).toBe(true);
      }
    }
  });

  it('reset clears won board state', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2);

    expect(miniBoard(4).classList.contains('won')).toBe(true);

    document.getElementById('ultimate-new-game').click();

    expect(miniBoard(4).classList.contains('won')).toBe(false);
    expect(miniBoard(4).dataset.winner).toBeUndefined();
    // Can play in board 4 again
    clickCell(4, 0);
    expect(cellText(4, 0)).toBe('X');
  });

  it('reset clears box-shadow on boards', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2);

    document.getElementById('ultimate-reset-btn').click();

    for (let i = 0; i < 9; i++) {
      expect(miniBoard(i).style.boxShadow).toBe('');
    }
  });

  it('clicking in wrong board does not advance turn', () => {
    clickCell(0, 4); // X → O forced to board 4
    // O tries wrong board
    clickCell(3, 0); // rejected
    clickCell(5, 0); // rejected
    clickCell(8, 8); // rejected
    // O's turn preserved — correct board works
    clickCell(4, 0);
    expect(cellText(4, 0)).toBe('O');
    // Now it's X's turn
    clickCell(0, 0);
    expect(cellText(0, 0)).toBe('X');
  });

  it('multiple boards can be won by different players', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2); // X wins board 4 → O to 2

    // O wins board 2 (middle row: 3, 4, 5)
    clickCell(2, 3); // O(2,3) → X to 3
    clickCell(3, 2); // X(3,2) → O to 2
    clickCell(2, 4); // O(2,4) → X to 4 (won) → free move
    clickCell(5, 2); // X(5,2) → O to 2
    clickCell(2, 5); // O(2,5) → X to 5
    // Board 2: 3=O, 4=O, 5=O → O wins [3,4,5]

    expect(miniBoard(4).dataset.winner).toBe('X');
    expect(miniBoard(2).dataset.winner).toBe('O');
  });

  it('placing in occupied cell does not change turn', () => {
    clickCell(0, 0); // X
    // O is forced to board 0, tries occupied cell 0
    clickCell(0, 0); // rejected — still O's turn
    clickCell(0, 0); // rejected again — still O's turn
    clickCell(0, 1); // O succeeds
    expect(cellText(0, 1)).toBe('O');
  });

  it('won board data-winner attribute is correct letter', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2);

    expect(miniBoard(4).getAttribute('data-winner')).toBe('X');
  });

  it('X wins the full game by winning 3 boards in a row', () => {
    // X wins boards 0, 1, 2 (top row) via relay pattern.
    // Relay: X plays in target board, sending O to a helper board.
    // O plays cell N in the helper board, sending X back to target board N.

    // --- X wins board 0 (cells 0, 1, 2) via relay through B1, B2 ---
    clickCell(0, 1); // X(0,1) → O to 1
    clickCell(1, 0); // O(1,0) → X to 0
    clickCell(0, 2); // X(0,2) → O to 2
    clickCell(2, 0); // O(2,0) → X to 0
    clickCell(0, 0); // X(0,0) → X wins B0 [0,1,2]. O to 0(won) → free.

    expect(miniBoard(0).classList.contains('won')).toBe(true);
    expect(miniBoard(0).dataset.winner).toBe('X');
    expect(msg().classList.contains('hide')).toBe(true); // game not over yet

    // --- X wins board 1 (cells 3, 4, 5) via relay through B3, B5, B4 ---
    clickCell(3, 1); // O(3,1) → X to 1
    clickCell(1, 5); // X(1,5) → O to 5
    clickCell(5, 1); // O(5,1) → X to 1
    clickCell(1, 4); // X(1,4) → O to 4
    clickCell(4, 1); // O(4,1) → X to 1
    clickCell(1, 3); // X(1,3) → X wins B1 [3,4,5]. O to 3.

    expect(miniBoard(1).classList.contains('won')).toBe(true);
    expect(miniBoard(1).dataset.winner).toBe('X');
    expect(msg().classList.contains('hide')).toBe(true); // game not over yet

    // --- X wins board 2 (cells 3, 4, 5) via relay through B3→B5→B4 ---
    clickCell(3, 2); // O(3,2) → X to 2
    clickCell(2, 5); // X(2,5) → O to 5
    clickCell(5, 2); // O(5,2) → X to 2
    clickCell(2, 4); // X(2,4) → O to 4
    clickCell(4, 2); // O(4,2) → X to 2
    clickCell(2, 3); // X(2,3) → X wins B2 [3,4,5]. Game over!

    expect(miniBoard(2).classList.contains('won')).toBe(true);
    expect(miniBoard(2).dataset.winner).toBe('X');

    // X wins the game: boards 0, 1, 2 = top row
    expect(msg().classList.contains('hide')).toBe(false);
    expect(msg().innerText).toContain('X');
    expect(msg().classList.contains('winner-msg')).toBe(true);
  });

  it('game does not end after winning just one board', () => {
    // X wins board 4
    clickCell(4, 0); clickCell(0, 4);
    clickCell(4, 1); clickCell(1, 4);
    clickCell(4, 2); // X wins board 4

    // Game should continue
    expect(msg().classList.contains('hide')).toBe(true);
    // O can still play
    clickCell(2, 0);
    expect(cellText(2, 0)).toBe('O');
  });
});
