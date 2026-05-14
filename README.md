# Classic Games

A collection of Tic-Tac-Toe variants built with vanilla JavaScript, HTML5, and CSS3.

## Games

### Classic Tic Tac Toe
Standard 3x3 grid. Get 3 in a row to win.

### Ultimate Tic Tac Toe
9 mini-boards in a 3x3 meta-grid. Your move's cell position dictates which board your opponent plays next. Win 3 mini-boards in a row to win the game.

### Weird Ultimate Tic Tac Toe
Ultimate TTT with 4 move types per turn:

- **Place** — standard placement in an empty cell
- **Flip** — swap an opponent's piece to yours (each cell can only be flipped once per game)
- **Transpose** — matrix transpose a mini-board along its diagonal
- **Rotate** — rotate a mini-board 90 degrees clockwise or counter-clockwise

Forced/free board rules carry over from Ultimate. Flip uses the flipped cell to determine the next forced board. Transpose and Rotate grant a free move.

## Built With

- **HTML5** — structure
- **CSS3** — styling, grid layout, responsive design
- **JavaScript** — game logic, DOM manipulation

## How to Run

1. Clone the repo: `git clone https://github.com/mathemynd/classic-games.git`
2. Open `index.html` in your browser

## Tests

```bash
npm install
npm test
```

Tests use [Vitest](https://vitest.dev/) with jsdom. See `tests/` for specs.
