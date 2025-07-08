<<<<<<< HEAD
const Stats = {
  getStats(game) {
    const saved = localStorage.getItem(`arcadium_stats_${game}`);
    if (saved) {
      return JSON.parse(saved);
    }

    // Default stats structure
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
        // Count separate wins for X and O
        if (winner === "X") stats.multiplayerXWins++;
        else if (winner === "O") stats.multiplayerOWins++;
      } else {
        // Generic multiplayer win counter
        stats.multiplayerWins++;
      }
    }

    stats.gamesPlayed++;
    this.saveStats(game, stats);
  }
};
=======
const Stats = {
  getStats(game) {
    const saved = localStorage.getItem(`arcadium_stats_${game}`);
    if (saved) {
      return JSON.parse(saved);
    }

    // Default stats structure
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
        // Count separate wins for X and O
        if (winner === "X") stats.multiplayerXWins++;
        else if (winner === "O") stats.multiplayerOWins++;
      } else {
        // Generic multiplayer win counter
        stats.multiplayerWins++;
      }
    }

    stats.gamesPlayed++;
    this.saveStats(game, stats);
  }
};
>>>>>>> 3fdfa406fdef56ab60ab4007b2ae026cb92dcd78
