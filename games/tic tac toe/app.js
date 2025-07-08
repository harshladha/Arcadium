<<<<<<< HEAD
let gameMode = ""; // "computer" or "multiplayer"

const boxes = document.querySelectorAll(".box");
const newGameBtn = document.querySelector("#new-btn");
const resetBtn = document.querySelector("#reset-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");

let turnO = true;
let count = 0;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8]
];

function startVsComputer() {
  gameMode = "computer";
  document.getElementById("modeSelection").style.display = "none";
  resetGameLogic();
}

function startMultiplayer() {
  gameMode = "multiplayer";
  document.getElementById("modeSelection").style.display = "none";
  resetGameLogic();
}

function resetGameLogic() {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
}

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText !== "") return;
    if (gameMode === "multiplayer") {
      handleMultiplayerMove(box);
    } else if (gameMode === "computer") {
      handlePlayerMove(box);
    }
  });
});

function handleMultiplayerMove(box) {
  box.innerText = turnO ? "O" : "X";
  box.disabled = true;
  count++;
  if (checkWinner()) return;
  if (count === 9) return gameDraw();
  turnO = !turnO;
}

function handlePlayerMove(box) {
  box.innerText = "O";
  box.disabled = true;
  count++;
  if (checkWinner()) return;
  if (count === 9) return gameDraw();
  setTimeout(computerMove, 500);
}

function computerMove() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    if (values.filter((v) => v === "X").length === 2 && values.includes("")) {
      const emptyIndex = [a, b, c][values.indexOf("")];
      boxes[emptyIndex].innerText = "X";
      boxes[emptyIndex].disabled = true;
      count++;
      if (checkWinner()) return;
      if (count === 9) gameDraw();
      return;
    }
  }
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    if (values.filter((v) => v === "O").length === 2 && values.includes("")) {
      const emptyIndex = [a, b, c][values.indexOf("")];
      boxes[emptyIndex].innerText = "X";
      boxes[emptyIndex].disabled = true;
      count++;
      if (checkWinner()) return;
      if (count === 9) gameDraw();
      return;
    }
  }
  if (boxes[4].innerText === "") {
    boxes[4].innerText = "X";
    boxes[4].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
    return;
  }
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter((i) => boxes[i].innerText === "");
  if (emptyCorners.length) {
    const idx = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    boxes[idx].innerText = "X";
    boxes[idx].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
    return;
  }
  const emptyBoxes = Array.from(boxes).filter((b) => b.innerText === "");
  if (emptyBoxes.length) {
    const randIdx = Math.floor(Math.random() * emptyBoxes.length);
    emptyBoxes[randIdx].innerText = "X";
    emptyBoxes[randIdx].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
  }
}

function gameDraw() {
  msg.innerText = "Game was a Draw.";
  msgContainer.classList.remove("hide");
  disableBoxes();
  if (gameMode === "computer") {
    Stats.incrementStat("tictactoe", "computer", "draw");
  } else if (gameMode === "multiplayer") {
    Stats.incrementStat("tictactoe", "multiplayer", "draw");
  }
}

function disableBoxes() {
  boxes.forEach((box) => (box.disabled = true));
}

function enableBoxes() {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
  });
}

function showWinner(winner) {
  msg.innerText = `Winner: ${winner}`;
  msgContainer.classList.remove("hide");
  disableBoxes();

  if (gameMode === "computer") {
    if (winner === "O") {
      Stats.incrementStat("tictactoe", "computer", "win");
    } else {
      Stats.incrementStat("tictactoe", "computer", "loss");
    }
  } else if (gameMode === "multiplayer") {
    Stats.incrementStat("tictactoe", "multiplayer", "win", winner);
  }
}

function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[b].innerText === boxes[c].innerText
    ) {
      showWinner(boxes[a].innerText);
      return true;
    }
  }
  return false;
}

newGameBtn.addEventListener("click", resetGameLogic);
resetBtn.addEventListener("click", resetGameLogic);

window.addEventListener("pageshow", () => {
  document.getElementById("modeSelection").style.display = "flex";
});
=======
let gameMode = ""; // "computer" or "multiplayer"

const boxes = document.querySelectorAll(".box");
const newGameBtn = document.querySelector("#new-btn");
const resetBtn = document.querySelector("#reset-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");

let turnO = true;
let count = 0;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8]
];

function startVsComputer() {
  gameMode = "computer";
  document.getElementById("modeSelection").style.display = "none";
  resetGameLogic();
}

function startMultiplayer() {
  gameMode = "multiplayer";
  document.getElementById("modeSelection").style.display = "none";
  resetGameLogic();
}

function resetGameLogic() {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
}

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText !== "") return;
    if (gameMode === "multiplayer") {
      handleMultiplayerMove(box);
    } else if (gameMode === "computer") {
      handlePlayerMove(box);
    }
  });
});

function handleMultiplayerMove(box) {
  box.innerText = turnO ? "O" : "X";
  box.disabled = true;
  count++;
  if (checkWinner()) return;
  if (count === 9) return gameDraw();
  turnO = !turnO;
}

function handlePlayerMove(box) {
  box.innerText = "O";
  box.disabled = true;
  count++;
  if (checkWinner()) return;
  if (count === 9) return gameDraw();
  setTimeout(computerMove, 500);
}

function computerMove() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    if (values.filter((v) => v === "X").length === 2 && values.includes("")) {
      const emptyIndex = [a, b, c][values.indexOf("")];
      boxes[emptyIndex].innerText = "X";
      boxes[emptyIndex].disabled = true;
      count++;
      if (checkWinner()) return;
      if (count === 9) gameDraw();
      return;
    }
  }
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    if (values.filter((v) => v === "O").length === 2 && values.includes("")) {
      const emptyIndex = [a, b, c][values.indexOf("")];
      boxes[emptyIndex].innerText = "X";
      boxes[emptyIndex].disabled = true;
      count++;
      if (checkWinner()) return;
      if (count === 9) gameDraw();
      return;
    }
  }
  if (boxes[4].innerText === "") {
    boxes[4].innerText = "X";
    boxes[4].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
    return;
  }
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter((i) => boxes[i].innerText === "");
  if (emptyCorners.length) {
    const idx = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    boxes[idx].innerText = "X";
    boxes[idx].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
    return;
  }
  const emptyBoxes = Array.from(boxes).filter((b) => b.innerText === "");
  if (emptyBoxes.length) {
    const randIdx = Math.floor(Math.random() * emptyBoxes.length);
    emptyBoxes[randIdx].innerText = "X";
    emptyBoxes[randIdx].disabled = true;
    count++;
    if (checkWinner()) return;
    if (count === 9) gameDraw();
  }
}

function gameDraw() {
  msg.innerText = "Game was a Draw.";
  msgContainer.classList.remove("hide");
  disableBoxes();
  if (gameMode === "computer") {
    Stats.incrementStat("tictactoe", "computer", "draw");
  } else if (gameMode === "multiplayer") {
    Stats.incrementStat("tictactoe", "multiplayer", "draw");
  }
}

function disableBoxes() {
  boxes.forEach((box) => (box.disabled = true));
}

function enableBoxes() {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
  });
}

function showWinner(winner) {
  msg.innerText = `Winner: ${winner}`;
  msgContainer.classList.remove("hide");
  disableBoxes();

  if (gameMode === "computer") {
    if (winner === "O") {
      Stats.incrementStat("tictactoe", "computer", "win");
    } else {
      Stats.incrementStat("tictactoe", "computer", "loss");
    }
  } else if (gameMode === "multiplayer") {
    Stats.incrementStat("tictactoe", "multiplayer", "win", winner);
  }
}

function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[b].innerText === boxes[c].innerText
    ) {
      showWinner(boxes[a].innerText);
      return true;
    }
  }
  return false;
}

newGameBtn.addEventListener("click", resetGameLogic);
resetBtn.addEventListener("click", resetGameLogic);

window.addEventListener("pageshow", () => {
  document.getElementById("modeSelection").style.display = "flex";
});
>>>>>>> 3fdfa406fdef56ab60ab4007b2ae026cb92dcd78
