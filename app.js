let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-game");
let msg = document.querySelector("#msg");

let turn0 = true;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (turn0) {
      box.innerText = "X";
      turn0 = false;
    } else {
      box.innerText = "O";
      turn0 = true;
    }
    box.disabled = true;

    checkWinner();
  });
});

const showWinner = (winner) => {
  msg.innerText = `Player ${winner} wins!`;
  msg.classList.remove("hide");

  boxes.forEach((box) => {
    box.disabled = true;
  });
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    let pos1val = boxes[pattern[0]].innerText;
    let pos2val = boxes[pattern[1]].innerText;
    let pos3val = boxes[pattern[2]].innerText;

    if (pos1val != "" && pos2val != "" && pos3val != "") {
      if (pos1val == pos2val && pos2val == pos3val) {
        showWinner(pos1val);
        return;
      }
    }
  }

  // Check for draw
  let allFilled = true;
  boxes.forEach((box) => {
    if (box.innerText === "") {
      allFilled = false;
    }
  });

  if (allFilled) {
    showDraw();
  }
};

const showDraw = () => {
  msg.innerText = "It's a draw!";
  msg.classList.remove("hide");

  boxes.forEach((box) => {
    box.disabled = true;
  });
};

resetBtn.addEventListener("click", () => {
  boxes.forEach((box) => {
    box.innerText = "";
    box.disabled = false;
  });
  turn0 = true;
  msg.classList.add("hide");
});

newGameBtn.addEventListener("click", () => {
  boxes.forEach((box) => {
    box.innerText = "";
    box.disabled = false;
  });
  turn0 = true;
  msg.classList.add("hide");
});
