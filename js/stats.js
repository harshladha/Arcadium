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
      player1Wins: 0,
      player2Wins: 0,
      totalRolls: 0,
      snakeBites: 0,
      ladderClimbs: 0,
      // Memory Match stats
      totalMatches: 0,
      easyWins: 0,
      mediumWins: 0,
      hardWins: 0,
      // 2048 stats
      totalMoves: 0,
      wins: 0,
      highScore: 0,
      totalScore: 0,
      // Whack-a-Mole stats
      totalHits: 0,
      totalMisses: 0,
      goldenMoleHits: 0,
      bombHits: 0,
      easyHighScore: 0,
      mediumHighScore: 0,
      hardHighScore: 0,
      // Tetris stats
      totalLines: 0,
      tetrises: 0,
      highScore: 0,
      maxLevel: 0,
      // Snake stats
      totalFood: 0,
      maxLength: 0,
      // Pong stats
      aiGames: 0,
      humanGames: 0,
      player1Wins: 0,
      player2Wins: 0,
      aiEasyWins: 0,
      aiMediumWins: 0,
      aiHardWins: 0,
      // Breakout stats
      totalBricks: 0,
      livesLost: 0,
      levelsCompleted: 0,
      maxLevel: 0,
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
  },

  // Snake and Ladder specific tracking
  trackSnakeAndLadder(action, data = {}) {
    const stats = this.getStats('snakeandladder');
    
    switch(action) {
      case 'gameEnd':
        stats.gamesPlayed++;
        
        // Handle different game modes
        if (data.gameMode === 'computer') {
          if (data.playerWon === true) {
            stats.vsComputerWins++;
          } else if (data.playerWon === false) {
            stats.vsComputerLosses++;
          }
        } else {
          // Human vs Human mode
          if (data.winner === 1) stats.player1Wins++;
          else if (data.winner === 2) stats.player2Wins++;
        }
        break;
      case 'diceRoll':
        stats.totalRolls++;
        break;
      case 'snakeBite':
        stats.snakeBites++;
        break;
      case 'ladderClimb':
        stats.ladderClimbs++;
        break;
    }
    
    this.saveStats('snakeandladder', stats);
  },

  // Memory Match specific tracking
  trackMemoryMatch(action, data = {}) {
    const stats = this.getStats('memorymatch');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'gameEnd':
        if (data.difficulty === 'easy') stats.easyWins++;
        else if (data.difficulty === 'medium') stats.mediumWins++;
        else if (data.difficulty === 'hard') stats.hardWins++;
        break;
      case 'match':
        stats.totalMatches++;
        break;
    }
    
    this.saveStats('memorymatch', stats);
  },

  // 2048 specific tracking
  track2048(action, data = {}) {
    const stats = this.getStats('2048');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'move':
        stats.totalMoves++;
        if (data.score > (stats.highScore || 0)) {
          stats.highScore = data.score;
        }
        break;
      case 'win':
        stats.wins++;
        stats.totalScore += data.score;
        break;
      case 'gameOver':
        stats.totalScore += data.score;
        if (data.score > (stats.highScore || 0)) {
          stats.highScore = data.score;
        }
        break;
    }
    
    this.saveStats('2048', stats);
  },

  // Whack-a-Mole specific tracking
  trackWhackAMole(action, data = {}) {
    const stats = this.getStats('whackamole');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'hit':
        stats.totalHits++;
        if (data.moleType === 'golden') stats.goldenMoleHits++;
        else if (data.moleType === 'bomb') stats.bombHits++;
        break;
      case 'miss':
        stats.totalMisses++;
        break;
      case 'gameEnd':
        stats.totalScore += data.score;
        if (data.difficulty === 'easy' && data.score > (stats.easyHighScore || 0)) {
          stats.easyHighScore = data.score;
        } else if (data.difficulty === 'medium' && data.score > (stats.mediumHighScore || 0)) {
          stats.mediumHighScore = data.score;
        } else if (data.difficulty === 'hard' && data.score > (stats.hardHighScore || 0)) {
          stats.hardHighScore = data.score;
        }
        break;
    }
    
    this.saveStats('whackamole', stats);
  },

  // Tetris specific tracking
  trackTetris(action, data = {}) {
    const stats = this.getStats('tetris');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'linesCleared':
        stats.totalLines += data.lines;
        if (data.lines === 4) stats.tetrises++; // Four lines at once
        break;
      case 'gameEnd':
        stats.totalScore += data.score;
        if (data.score > (stats.highScore || 0)) {
          stats.highScore = data.score;
        }
        if (data.level > (stats.maxLevel || 0)) {
          stats.maxLevel = data.level;
        }
        break;
    }
    
    this.saveStats('tetris', stats);
  },

  // Snake specific tracking
  trackSnake(action, data = {}) {
    const stats = this.getStats('snake');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'foodEaten':
        stats.totalFood++;
        break;
      case 'gameEnd':
        stats.totalScore += data.score;
        if (data.difficulty === 'easy' && data.score > (stats.easyHighScore || 0)) {
          stats.easyHighScore = data.score;
        } else if (data.difficulty === 'medium' && data.score > (stats.mediumHighScore || 0)) {
          stats.mediumHighScore = data.score;
        } else if (data.difficulty === 'hard' && data.score > (stats.hardHighScore || 0)) {
          stats.hardHighScore = data.score;
        }
        if (data.length > (stats.maxLength || 0)) {
          stats.maxLength = data.length;
        }
        break;
    }
    
    this.saveStats('snake', stats);
  },

  // Pong specific tracking
  trackPong(action, data = {}) {
    const stats = this.getStats('pong');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        if (data.mode === 'ai') stats.aiGames++;
        else stats.humanGames++;
        break;
      case 'score':
        if (data.player === 1) stats.player1Wins++;
        else stats.player2Wins++;
        break;
      case 'gameEnd':
        if (data.mode === 'ai' && data.winner === 1) {
          if (data.difficulty === 'easy') stats.aiEasyWins++;
          else if (data.difficulty === 'medium') stats.aiMediumWins++;
          else if (data.difficulty === 'hard') stats.aiHardWins++;
        }
        break;
    }
    
    this.saveStats('pong', stats);
  },

  // Breakout specific tracking
  trackBreakout(action, data = {}) {
    const stats = this.getStats('breakout');
    
    switch(action) {
      case 'gameStart':
        stats.gamesPlayed++;
        break;
      case 'brickDestroyed':
        stats.totalBricks++;
        stats.totalScore += data.points;
        break;
      case 'lifeLost':
        stats.livesLost++;
        break;
      case 'levelComplete':
        stats.levelsCompleted++;
        if (data.level > (stats.maxLevel || 0)) {
          stats.maxLevel = data.level;
        }
        break;
      case 'gameEnd':
        if (data.score > (stats.highScore || 0)) {
          stats.highScore = data.score;
        }
        if (data.difficulty === 'easy' && data.score > (stats.easyHighScore || 0)) {
          stats.easyHighScore = data.score;
        } else if (data.difficulty === 'medium' && data.score > (stats.mediumHighScore || 0)) {
          stats.mediumHighScore = data.score;
        } else if (data.difficulty === 'hard' && data.score > (stats.hardHighScore || 0)) {
          stats.hardHighScore = data.score;
        }
        break;
    }
    
    this.saveStats('breakout', stats);
  }
};
