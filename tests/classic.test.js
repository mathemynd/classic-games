import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function setupDOM() {
  document.body.innerHTML = '';
  document.documentElement.innerHTML = html.match(/<html[^>]*>([\s\S]*)<\/html>/i)?.[1] || '';
  const script = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf-8');
  eval(script);
}

function classicBoxes() {
  return document.querySelectorAll('#classic-board .box');
}

describe('Classic Tic Tac Toe', () => {
  beforeEach(() => {
    setupDOM();
    document.querySelector('[data-game="classic"]').click();
  });

  it('back-btn from classic mid-game resets state on re-entry', () => {
    const boxes = classicBoxes();
    boxes[0].click(); // X
    boxes[4].click(); // O
    boxes[1].click(); // X — game in progress

    // Leave mid-game via back button
    document.getElementById('back-btn').click();
    expect(document.getElementById('classic-screen').classList.contains('hide')).toBe(true);
    expect(document.getElementById('game-select').classList.contains('hide')).toBe(false);

    // Re-enter classic
    document.querySelector('[data-game="classic"]').click();

    const boxesAfter = classicBoxes();
    for (const box of boxesAfter) {
      expect(box.innerText).toBe('');
      expect(box.disabled).toBe(false);
      expect(box.classList.contains('x')).toBe(false);
      expect(box.classList.contains('o')).toBe(false);
      expect(box.classList.contains('winner')).toBe(false);
    }
    // X plays first after reset
    boxesAfter[0].click();
    expect(boxesAfter[0].innerText).toBe('X');
  });
});
