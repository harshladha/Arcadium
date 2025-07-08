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
  snake: {
    title: "Snake",
    fields: [
      { key: "gamesPlayed", label: "Games Played" }
    ]
  }
};


// Add click handlers to each tile
document.querySelectorAll(".leaderboard-tile").forEach(tile => {
  tile.addEventListener("click", () => {
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
  });
});

// Close modal
closeModal.addEventListener("click", () => {
  leaderboardModal.classList.add("hide");
});
