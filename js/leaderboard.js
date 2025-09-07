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

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if modal elements exist
  if (!leaderboardModal || !modalTitle || !statsList || !closeModal) {
    console.error('Modal elements not found');
    return;
  }
  
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
      
      // Ensure modal is visible (fallback)
      leaderboardModal.style.display = "flex";
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
    leaderboardModal.style.display = "none";
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
      leaderboardModal.style.display = "none";
    }
  });
});

// Function to add sample stats for testing (can be removed later)
function addSampleStats() {
  // Add some sample stats for testing
  const sampleStats = {
    tictactoe: { vsComputerWins: 5, vsComputerLosses: 3, vsComputerDraws: 2, multiplayerXWins: 4, multiplayerOWins: 3, multiplayerDraws: 1 },
    rockpaperscissors: { vsComputerWins: 8, vsComputerLosses: 6, vsComputerDraws: 4 },
    snakeandladder: { gamesPlayed: 10, vsComputerWins: 6, vsComputerLosses: 4, player1Wins: 3, player2Wins: 2, totalRolls: 150, snakeBites: 8, ladderClimbs: 12 },
    memorymatch: { gamesPlayed: 15, easyWins: 8, mediumWins: 5, hardWins: 2, totalMatches: 120 },
    '2048': { gamesPlayed: 20, wins: 3, highScore: 15420, totalScore: 85000, totalMoves: 2500 },
    whackamole: { gamesPlayed: 12, easyHighScore: 850, mediumHighScore: 650, hardHighScore: 420, totalHits: 180, totalMisses: 45, goldenMoleHits: 8, bombHits: 3 },
    tetris: { gamesPlayed: 25, highScore: 45000, totalScore: 180000, totalLines: 350, tetrises: 15, maxLevel: 8 },
    snake: { gamesPlayed: 30, easyHighScore: 280, mediumHighScore: 180, hardHighScore: 120, totalScore: 4500, totalFood: 450, maxLength: 35 },
    pong: { gamesPlayed: 18, aiGames: 12, humanGames: 6, player1Wins: 10, player2Wins: 8, aiEasyWins: 8, aiMediumWins: 3, aiHardWins: 1 },
    breakout: { gamesPlayed: 22, highScore: 12500, easyHighScore: 8500, mediumHighScore: 6200, hardHighScore: 4100, totalBricks: 850, levelsCompleted: 15, maxLevel: 6 }
  };
  
  Object.keys(sampleStats).forEach(game => {
    localStorage.setItem(`arcadium_stats_${game}`, JSON.stringify(sampleStats[game]));
  });
  
  console.log('Sample stats added for testing');
}

// Uncomment the line below to add sample stats for testing
addSampleStats();