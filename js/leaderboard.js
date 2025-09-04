// Modal Elements
const leaderboardModal = document.getElementById("leaderboardModal");
const modalTitle = document.getElementById("modalTitle");
const statsList = document.getElementById("statsList");
const closeModal = document.getElementById("closeModal");

const GameConfigs = {
  tictactoe: {
    title: "Tic Tac Toe",
    fields: [
      { key: "vsComputerWins", label: "Vs Computer Wins" },
      { key: "vsComputerLosses", label: "Vs Computer Losses" },
      { key: "vsComputerDraws", label: "Vs Computer Draws" },
      { key: "multiplayerXWins", label: "Multiplayer Wins (X)" },
      { key: "multiplayerOWins", label: "Multiplayer Wins (O)" },
      { key: "multiplayerDraws", label: "Multiplayer Draws" }
    ]
  },
  rockpaperscissors: {
    title: "Rock Paper Scissors",
    fields: [
      { key: "vsComputerWins", label: "Wins" },
      { key: "vsComputerLosses", label: "Losses" },
      { key: "vsComputerDraws", label: "Draws" }
    ]
  },
  snakeandladder: {
    title: "Snake and Ladder",
    fields: [
      { key: "gamesPlayed", label: "Total Games Played" },
      { key: "vsComputerWins", label: "Wins vs Computer" },
      { key: "vsComputerLosses", label: "Losses vs Computer" },
      { key: "player1Wins", label: "Player 1 Wins (vs Human)" },
      { key: "player2Wins", label: "Player 2 Wins (vs Human)" },
      { key: "totalRolls", label: "Total Dice Rolls" },
      { key: "snakeBites", label: "Snake Bites" },
      { key: "ladderClimbs", label: "Ladder Climbs" }
    ]
  },
  memorymatch: {
    title: "Memory Match",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "easyWins", label: "Easy Mode Wins" },
      { key: "mediumWins", label: "Medium Mode Wins" },
      { key: "hardWins", label: "Hard Mode Wins" },
      { key: "totalMatches", label: "Total Matches Found" }
    ]
  },
  "2048": {
    title: "2048",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "wins", label: "Games Won (Reached 2048)" },
      { key: "highScore", label: "High Score" },
      { key: "totalScore", label: "Total Score" },
      { key: "totalMoves", label: "Total Moves" }
    ]
  },
  whackamole: {
    title: "Whack-a-Mole",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "easyHighScore", label: "Easy High Score" },
      { key: "mediumHighScore", label: "Medium High Score" },
      { key: "hardHighScore", label: "Hard High Score" },
      { key: "totalHits", label: "Total Hits" },
      { key: "totalMisses", label: "Total Misses" },
      { key: "goldenMoleHits", label: "Golden Mole Hits" },
      { key: "bombHits", label: "Bomb Hits" }
    ]
  },
  tetris: {
    title: "Tetris",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "highScore", label: "High Score" },
      { key: "totalScore", label: "Total Score" },
      { key: "totalLines", label: "Total Lines Cleared" },
      { key: "tetrises", label: "Tetrises (4 Lines)" },
      { key: "maxLevel", label: "Max Level Reached" }
    ]
  },
  snake: {
    title: "Snake",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "easyHighScore", label: "Easy High Score" },
      { key: "mediumHighScore", label: "Medium High Score" },
      { key: "hardHighScore", label: "Hard High Score" },
      { key: "totalScore", label: "Total Score" },
      { key: "totalFood", label: "Total Food Eaten" },
      { key: "maxLength", label: "Max Snake Length" }
    ]
  },
  pong: {
    title: "Pong",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "aiGames", label: "vs AI Games" },
      { key: "humanGames", label: "vs Human Games" },
      { key: "player1Wins", label: "Player 1 Wins" },
      { key: "player2Wins", label: "Player 2/AI Wins" },
      { key: "aiEasyWins", label: "AI Easy Wins" },
      { key: "aiMediumWins", label: "AI Medium Wins" },
      { key: "aiHardWins", label: "AI Hard Wins" }
    ]
  },
  breakout: {
    title: "Breakout",
    fields: [
      { key: "gamesPlayed", label: "Games Played" },
      { key: "highScore", label: "High Score" },
      { key: "easyHighScore", label: "Easy High Score" },
      { key: "mediumHighScore", label: "Medium High Score" },
      { key: "hardHighScore", label: "Hard High Score" },
      { key: "totalBricks", label: "Total Bricks Destroyed" },
      { key: "levelsCompleted", label: "Levels Completed" },
      { key: "maxLevel", label: "Max Level Reached" }
    ]
  }
};

// Add click handlers to each tile
document.querySelectorAll(".leaderboard-tile").forEach(tile => {
  const tileHandler = () => {
    const game = tile.dataset.game;
    const stats = Stats.getStats(game);
    const config = GameConfigs[game];

    if (!config) {
      console.error(`No config found for game: ${game}`);
      return;
    }

    // Set modal title
    modalTitle.textContent = config.title + " Stats";

    // Build stats markup
    statsList.innerHTML = config.fields
      .map(field => `<dt>${field.label}</dt><dd>${stats[field.key] ?? 0}</dd>`)
      .join("");

    // Show modal
    leaderboardModal.classList.remove("hide");
  };
  
  tile.addEventListener("click", tileHandler);
  
  // Add touch support for mobile
  if (typeof MobileUtils !== 'undefined') {
    MobileUtils.addTouchSupport(tile, tileHandler);
  }
});

// Close modal
const closeHandler = () => {
  leaderboardModal.classList.add("hide");
};

closeModal.addEventListener("click", closeHandler);

// Add touch support for mobile
if (typeof MobileUtils !== 'undefined') {
  MobileUtils.addTouchSupport(closeModal, closeHandler);
}

// Close modal when clicking outside
leaderboardModal.addEventListener("click", (e) => {
  if (e.target === leaderboardModal) {
    leaderboardModal.classList.add("hide");
  }
});
