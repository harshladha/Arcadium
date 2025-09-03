// Navigation functions
function goHome() {
    window.location.href = "../../index.html";
}

function goBack() {
    window.location.href = "../../games.html";
}

function resetGame() {
    location.reload();
}

function showDifficultySelection() {
    document.getElementById('difficultySelection').style.display = 'flex';
    document.getElementById('gameMain').style.display = 'none';
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('pauseModal').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'none';
    
    if (window.currentGame && window.currentGame.timerInterval) {
        clearInterval(window.currentGame.timerInterval);
    }
}

// Menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
        menuDropdown.classList.remove('show');
    });
    
    // Prevent menu from closing when clicking inside dropdown
    menuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

class MemoryMatchGame {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.gameBoard = document.getElementById('gameBoard');
        this.timerElement = document.getElementById('timer');
        this.movesElement = document.getElementById('moves');
        this.pairsElement = document.getElementById('pairs');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isGameActive = false;
        this.isPaused = false;
        this.pausedTime = 0;
        
        // Card symbols for different difficulties
        this.symbols = {
            easy: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵'],
            medium: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎞️', '🎊', '🎉'],
            hard: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎞️', '🎊', '🎉', '🎈', '🎁', '🎀', '🎗️', '🏆', '🏅', '🥇', '🥈', '🥉', '🏵️', '🎖️', '🎳', '🎱', '🎰']
        };
        
        this.gridSizes = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 6, cols: 6, pairs: 18 },
            hard: { rows: 8, cols: 8, pairs: 32 }
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.updateStats();
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.trackMemoryMatch('gameStart', { difficulty: this.difficulty });
        }
    }
    
    createBoard() {
        const { pairs } = this.gridSizes[this.difficulty];
        const selectedSymbols = this.symbols[this.difficulty].slice(0, pairs);
        
        // Create pairs of cards
        const cardSymbols = [...selectedSymbols, ...selectedSymbols];
        
        // Shuffle the cards
        this.shuffleArray(cardSymbols);
        
        // Clear the board
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${this.difficulty}`;
        
        // Create card elements
        cardSymbols.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            this.cards.push(card);
            this.gameBoard.appendChild(card.element);
        });
        
        this.totalPairs = pairs;
        this.updateStats();
    }
    
    createCard(symbol, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${symbol}</div>
        `;
        
        const card = {
            element: cardElement,
            symbol: symbol,
            index: index,
            isFlipped: false,
            isMatched: false
        };
        
        cardElement.addEventListener('click', () => this.flipCard(card));
        
        return card;
    }
    
    flipCard(card) {
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2 || this.isPaused) {
            return;
        }
        
        // Start the game on first card flip
        if (!this.isGameActive) {
            this.isGameActive = true;
            this.startTimer();
            document.getElementById('pauseBtn').style.display = 'inline-block';
        }
        
        card.isFlipped = true;
        card.element.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            card1.isMatched = true;
            card2.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            this.matchedPairs++;
            this.updateStats();
            
            // Track match
            if (typeof Stats !== 'undefined') {
                Stats.trackMemoryMatch('match');
            }
            
            // Check if game is won
            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        } else {
            // No match, flip cards back
            card1.isFlipped = false;
            card2.isFlipped = false;
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }
        
        this.flippedCards = [];
    }
    
    gameWon() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        
        // Show win modal
        const finalTime = this.timerElement.textContent;
        const finalMoves = this.moves;
        
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('finalMoves').textContent = finalMoves;
        document.getElementById('finalDifficulty').textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        document.getElementById('winModal').style.display = 'flex';
        
        // Track game completion
        if (typeof Stats !== 'undefined') {
            Stats.trackMemoryMatch('gameEnd', {
                difficulty: this.difficulty,
                time: finalTime,
                moves: finalMoves,
                pairs: this.totalPairs
            });
        }
    }
    
    startTimer() {
        this.startTime = Date.now() - this.pausedTime;
        this.timerInterval = setInterval(() => {
            if (this.isGameActive && !this.isPaused) {
                const elapsed = Date.now() - this.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    pauseGame() {
        if (!this.isGameActive || this.isPaused) return;
        
        this.isPaused = true;
        this.pausedTime = Date.now() - this.startTime;
        clearInterval(this.timerInterval);
        document.getElementById('pauseModal').style.display = 'flex';
    }
    
    resumeGame() {
        if (!this.isGameActive || !this.isPaused) return;
        
        this.isPaused = false;
        document.getElementById('pauseModal').style.display = 'none';
        this.startTimer();
    }
    
    updateStats() {
        this.movesElement.textContent = this.moves;
        this.pairsElement.textContent = `${this.matchedPairs}/${this.totalPairs}`;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Game control functions
function startGame(difficulty) {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    window.currentGame = new MemoryMatchGame(difficulty);
    window.currentDifficulty = difficulty;
}

function restartSameDifficulty() {
    document.getElementById('winModal').style.display = 'none';
    startGame(window.currentDifficulty);
}

function pauseGame() {
    if (window.currentGame) {
        window.currentGame.pauseGame();
    }
}

function resumeGame() {
    if (window.currentGame) {
        window.currentGame.resumeGame();
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show difficulty selection by default
    showDifficultySelection();
});