const Stats = {
  getStats(game) {
    const defaultStats = {
      vsComputerWins: 0,
      vsComputerLosses: 0,
      vsComputerDraws: 0,
      multiplayerXWins: 0,
      multiplayerOWins: 0,
      multiplayerWins: 0,
      multiplayerLosses: 0,
      multiplayerDraws: 0,
      gamesPlayed: 0,
    };

    const saved = localStorage.getItem(`arcadium_stats_${game}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultStats, ...parsed }; // 👈 Merge with defaults
    }

    return defaultStats;
  },

  saveStats(game, stats) {
    localStorage.setItem(`arcadium_stats_${game}`, JSON.stringify(stats));
  },

  incrementStat(game, mode, result, winner = null) {
    const stats = this.getStats(game);

    if (mode === "computer") {
      if (result === "win") stats.vsComputerWins++;
      else if (result === "loss") stats.vsComputerLosses++;
      else if (result === "draw") stats.vsComputerDraws++;
    } 
    else if (mode === "multiplayer") {
      if (result === "draw") {
        stats.multiplayerDraws++;
      } else if (game === "tictactoe") {
        if (winner === "X") stats.multiplayerXWins++;
        else if (winner === "O") stats.multiplayerOWins++;
      } else {
        stats.multiplayerWins++;
      }
    }

    stats.gamesPlayed++;
    this.saveStats(game, stats);
  }
};
