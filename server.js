const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let turn = null;
let board = Array(9).fill(null);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Assign player
  if (Object.keys(players).length < 2) {
    const symbol = Object.values(players).includes("X") ? "O" : "X";
    players[socket.id] = symbol;
    socket.emit("player-assigned", symbol);
    if (Object.keys(players).length === 2) {
      turn = "X";
      io.emit("start-game", { turn, board });
    }
  } else {
    socket.emit("full", "Room is full");
    return;
  }

  // Handle move
  socket.on("make-move", (index) => {
    const symbol = players[socket.id];
    if (symbol === turn && board[index] === null) {
      board[index] = symbol;
      turn = turn === "X" ? "O" : "X";
      io.emit("update-board", { board, turn });
      checkWinner();
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    board = Array(9).fill(null);
    turn = null;
    io.emit("reset");
  });

  function checkWinner() {
    const winPatterns = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let [a,b,c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        io.emit("game-over", { winner: board[a] });
        board = Array(9).fill(null);
        return;
      }
    }
    if (!board.includes(null)) {
      io.emit("game-over", { winner: null });
      board = Array(9).fill(null);
    }
  }
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
