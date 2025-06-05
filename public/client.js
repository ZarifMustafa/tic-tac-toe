const socket = io();

let playerSymbol = null;
let myTurn = false;

const status = document.getElementById("status");
const board = document.getElementById("board");

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  cell.addEventListener("click", () => {
    if (myTurn && cell.textContent === "") {
      socket.emit("make-move", i);
    }
  });
  board.appendChild(cell);
}

socket.on("player-assigned", (symbol) => {
  playerSymbol = symbol;
  status.textContent = `You are '${symbol}'. Waiting for opponent...`;
});

socket.on("start-game", ({ turn, board: newBoard }) => {
  updateBoard(newBoard);
  myTurn = (turn === playerSymbol);
  status.textContent = myTurn ? "Your Turn" : "Opponent's Turn";
});

socket.on("update-board", ({ board: newBoard, turn }) => {
  updateBoard(newBoard);
  myTurn = (turn === playerSymbol);
  status.textContent = myTurn ? "Your Turn" : "Opponent's Turn";
});

socket.on("game-over", ({ winner }) => {
  if (winner === null) {
    alert("It's a draw!");
  } else if (winner === playerSymbol) {
    alert("You win!");
  } else {
    alert("You lose!");
  }
});

socket.on("reset", () => {
  Array.from(document.getElementsByClassName("cell")).forEach(cell => {
    cell.textContent = "";
  });
  status.textContent = "Opponent left. Waiting for a new one...";
});

socket.on("full", (msg) => {
  alert(msg);
  status.textContent = msg;
});

function updateBoard(newBoard) {
  newBoard.forEach((val, i) => {
    document.querySelector(`.cell[data-index='${i}']`).textContent = val || "";
  });
}
