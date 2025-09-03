let userScore = 0;
let compScore = 0;

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");

const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");

const genCompChoice = () => {
  const options = ["rock", "paper", "scissors"];
  const randIdx = Math.floor(Math.random() * 3);
  return options[randIdx];
};

const drawGame = () => {
  msg.innerText = "Game was Draw. Play again.";
  msg.style.backgroundColor = "#081b31";
  Stats.incrementStat("rockpaperscissors", "computer", "draw");
};

const showWinner = (userWin, userChoice, compChoice) => {
  if (userWin) {
    userScore++;
    userScorePara.innerText = userScore;
    msg.innerText = `You win! Your ${userChoice} beats ${compChoice}`;
    msg.style.backgroundColor = "green";
    Stats.incrementStat("rockpaperscissors", "computer", "win");
  } else {
    compScore++;
    compScorePara.innerText = compScore;
    msg.innerText = `You lost. ${compChoice} beats your ${userChoice}`;
    msg.style.backgroundColor = "red";
    Stats.incrementStat("rockpaperscissors", "computer", "loss");
  }
};

const playGame = (userChoice) => {
  const compChoice = genCompChoice();

  if (userChoice === compChoice) {
    drawGame();
  } else {
    let userWin = true;
    if (userChoice === "rock") {
      userWin = compChoice === "paper" ? false : true;
    } else if (userChoice === "paper") {
      userWin = compChoice === "scissors" ? false : true;
    } else {
      userWin = compChoice === "rock" ? false : true;
    }
    showWinner(userWin, userChoice, compChoice);
  }
};

choices.forEach((choice) => {
  const choiceHandler = () => {
    const userChoice = choice.getAttribute("id");
    playGame(userChoice);
  };
  
  choice.addEventListener("click", choiceHandler);
  
  // Add touch support for mobile
  if (typeof MobileUtils !== 'undefined') {
    MobileUtils.addTouchSupport(choice, choiceHandler);
  }
});

function resetGameLogic() {
  userScore = 0;
  compScore = 0;
  userScorePara.innerText = userScore;
  compScorePara.innerText = compScore;
  msg.innerText = "Play your move";
  msg.style.backgroundColor = "#081b31";

  const dropdown = document.getElementById("menu-dropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }
}
