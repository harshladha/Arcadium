// Navigation functions
function goHome() {
    window.location.href = "../../index.html";
}

function goToGames() {
    window.location.href = "../../games.html";
}

function restartGame() {
    location.reload();
}

function showModeSelection() {
    document.getElementById('gameMain').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'flex';
}

// Game mode selection
function startGame(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    // Track game start
    if (typeof Stats !== 'undefined') {
        Stats.trackSnakeAndLadder('gameStart', { mode: mode });
    }
    
    // Initialize game with selected mode
    window.gameInstance = new SnakeAndLadderGame(mode);
}

// Menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    
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

class SnakeAndLadderGame {
    constructor(gameMode = 'human') {
        this.gameMode = gameMode; // 'human' or 'computer'
        this.currentPlayer = 1;
        this.playerPositions = { 1: 1, 2: 1 };
        this.gameBoard = document.getElementById('gameBoard');
        this.rollBtn = document.getElementById('rollBtn');
        this.dice = document.getElementById('dice');
        this.gameMessage = document.getElementById('gameMessage');
        this.isComputerTurn = false;
        
        // Snake and ladder positions
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        this.ladders = {
            1: 38, 4: 14, 9: 21, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.updateDisplay();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        // Create board squares (100 to 1, snake and ladder style)
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                
                // Calculate square number based on snake and ladder board layout
                let squareNumber;
                if (row % 2 === 0) {
                    // Even rows: left to right
                    squareNumber = (9 - row) * 10 + (col + 1);
                } else {
                    // Odd rows: right to left
                    squareNumber = (9 - row) * 10 + (10 - col);
                }
                
                square.textContent = squareNumber;
                square.dataset.number = squareNumber;
                
                // Mark snakes and ladders
                if (this.snakes[squareNumber]) {
                    square.classList.add('snake');
                    square.classList.add('snake-head');
                    square.title = `Snake Head! Slides down to ${this.snakes[squareNumber]}`;
                    square.setAttribute('data-destination', this.snakes[squareNumber]);
                } else if (this.ladders[squareNumber]) {
                    square.classList.add('ladder');
                    square.classList.add('ladder-bottom');
                    square.title = `Ladder Bottom! Climbs up to ${this.ladders[squareNumber]}`;
                    square.setAttribute('data-destination', this.ladders[squareNumber]);
                }
                
                // Mark snake tails and ladder tops
                Object.values(this.snakes).forEach(tailPos => {
                    if (tailPos === squareNumber) {
                        square.classList.add('snake-tail');
                        square.title = `Snake Tail - Safe square`;
                    }
                });
                
                Object.values(this.ladders).forEach(topPos => {
                    if (topPos === squareNumber) {
                        square.classList.add('ladder-top');
                        square.title = `Ladder Top - Safe square`;
                    }
                });
                
                this.gameBoard.appendChild(square);
            }
        }
        
        this.updatePlayerPositions();
        this.drawConnections();
    }
    
    drawConnections() {
        // Remove existing connections
        document.querySelectorAll('.connection-line').forEach(line => line.remove());
        
        // Draw snake connections
        Object.entries(this.snakes).forEach(([head, tail]) => {
            this.drawConnection(head, tail, 'snake');
        });
        
        // Draw ladder connections
        Object.entries(this.ladders).forEach(([bottom, top]) => {
            this.drawConnection(bottom, top, 'ladder');
        });
    }
    
    drawConnection(from, to, type) {
        const fromSquare = document.querySelector(`[data-number="${from}"]`);
        const toSquare = document.querySelector(`[data-number="${to}"]`);
        
        if (!fromSquare || !toSquare) return;
        
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        const boardRect = this.gameBoard.getBoundingClientRect();
        
        // Calculate relative positions
        const fromX = fromRect.left - boardRect.left + fromRect.width / 2;
        const fromY = fromRect.top - boardRect.top + fromRect.height / 2;
        const toX = toRect.left - boardRect.left + toRect.width / 2;
        const toY = toRect.top - boardRect.top + toRect.height / 2;
        
        // Create connection line
        const line = document.createElement('div');
        line.className = `connection-line ${type}-connection`;
        
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        
        line.style.position = 'absolute';
        line.style.left = fromX + 'px';
        line.style.top = fromY + 'px';
        line.style.width = length + 'px';
        line.style.height = '3px';
        line.style.transformOrigin = '0 50%';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.zIndex = '5';
        line.style.pointerEvents = 'none';
        
        if (type === 'snake') {
            line.style.background = 'linear-gradient(90deg, #FF6B6B, #FF8E53, #FF6B6B)';
            line.style.borderRadius = '2px';
            line.style.boxShadow = '0 0 4px rgba(255, 107, 107, 0.6)';
        } else {
            line.style.background = 'linear-gradient(90deg, #4CAF50, #45a049, #4CAF50)';
            line.style.borderRadius = '2px';
            line.style.boxShadow = '0 0 4px rgba(76, 175, 80, 0.6)';
        }
        
        this.gameBoard.appendChild(line);
    }
    
    rollDice() {
        this.rollBtn.disabled = true;
        this.dice.classList.add('rolling');
        
        // Simulate dice rolling animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            this.dice.querySelector('.dice-face').textContent = Math.floor(Math.random() * 6) + 1;
            rollCount++;
            
            if (rollCount >= 10) {
                clearInterval(rollInterval);
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                this.dice.querySelector('.dice-face').textContent = finalRoll;
                this.dice.classList.remove('rolling');
                
                setTimeout(() => {
                    // Track dice roll
                    if (typeof Stats !== 'undefined') {
                        Stats.trackSnakeAndLadder('diceRoll');
                    }
                    this.movePlayer(finalRoll);
                    this.rollBtn.disabled = false;
                }, 500);
            }
        }, 100);
    }
    
    movePlayer(steps) {
        const currentPos = this.playerPositions[this.currentPlayer];
        let newPos = currentPos + steps;
        
        // Check if player exceeds 100
        if (newPos > 100) {
            this.gameMessage.textContent = `Player ${this.currentPlayer} rolled ${steps} but can't move beyond 100!`;
            this.switchPlayer();
            return;
        }
        
        this.playerPositions[this.currentPlayer] = newPos;
        this.updatePlayerPositions();
        
        let message = `Player ${this.currentPlayer} rolled ${steps} and moved to ${newPos}`;
        
        // Check for snakes
        if (this.snakes[newPos]) {
            const snakeEnd = this.snakes[newPos];
            this.playerPositions[this.currentPlayer] = snakeEnd;
            message += ` 🐍 Snake bite! Slid down to ${snakeEnd}`;
            
            // Add visual feedback for snake bite
            this.showSpecialEffect('snake');
            
            // Track snake bite
            if (typeof Stats !== 'undefined') {
                Stats.trackSnakeAndLadder('snakeBite');
            }
            this.updatePlayerPositions();
        }
        // Check for ladders
        else if (this.ladders[newPos]) {
            const ladderEnd = this.ladders[newPos];
            this.playerPositions[this.currentPlayer] = ladderEnd;
            message += ` 🪜 Ladder climb! Climbed up to ${ladderEnd}`;
            
            // Add visual feedback for ladder climb
            this.showSpecialEffect('ladder');
            
            // Track ladder climb
            if (typeof Stats !== 'undefined') {
                Stats.trackSnakeAndLadder('ladderClimb');
            }
            this.updatePlayerPositions();
        }
        
        // Check for win
        if (this.playerPositions[this.currentPlayer] >= 100) {
            let winMessage;
            if (this.gameMode === 'computer') {
                winMessage = this.currentPlayer === 1 ? '🎉 You win! 🎉' : '🤖 Computer wins! 🤖';
            } else {
                winMessage = `🎉 Player ${this.currentPlayer} wins! 🎉`;
            }
            this.gameMessage.textContent = winMessage;
            this.rollBtn.disabled = true;
            
            // Track game completion
            if (typeof Stats !== 'undefined') {
                Stats.trackSnakeAndLadder('gameEnd', { 
                    winner: this.currentPlayer,
                    gameMode: this.gameMode,
                    playerWon: this.gameMode === 'computer' ? this.currentPlayer === 1 : null
                });
            }
            return;
        }
        
        this.gameMessage.textContent = message;
        this.switchPlayer();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();
        
        // If it's computer's turn in computer mode, auto-roll after a delay
        if (this.gameMode === 'computer' && this.currentPlayer === 2) {
            this.isComputerTurn = true;
            this.rollBtn.disabled = true;
            this.gameMessage.textContent = "Computer is thinking...";
            
            setTimeout(() => {
                if (this.currentPlayer === 2) { // Double check it's still computer's turn
                    this.rollDice();
                }
            }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
        } else {
            this.isComputerTurn = false;
        }
    }
    
    updateDisplay() {
        // Update player info
        document.getElementById('player1').classList.toggle('active', this.currentPlayer === 1);
        document.getElementById('player2').classList.toggle('active', this.currentPlayer === 2);
        
        // Update player names based on game mode
        const player1Name = document.querySelector('#player1 .player-name');
        const player2Name = document.querySelector('#player2 .player-name');
        
        if (this.gameMode === 'computer') {
            player1Name.textContent = 'You';
            player2Name.textContent = 'Computer';
        } else {
            player1Name.textContent = 'Player 1';
            player2Name.textContent = 'Player 2';
        }
        
        // Update positions
        document.querySelector('#player1 .player-position').textContent = `Position: ${this.playerPositions[1]}`;
        document.querySelector('#player2 .player-position').textContent = `Position: ${this.playerPositions[2]}`;
        
        // Update game message
        if (!this.gameMessage.textContent.includes('wins') && !this.isComputerTurn) {
            if (this.gameMode === 'computer') {
                this.gameMessage.textContent = this.currentPlayer === 1 ? "Your turn - Roll the dice!" : "Computer's turn";
            } else {
                this.gameMessage.textContent = `Player ${this.currentPlayer}'s turn - Roll the dice!`;
            }
        }
        
        // Disable roll button for computer turns
        if (this.gameMode === 'computer' && this.currentPlayer === 2) {
            this.rollBtn.disabled = true;
        } else if (!this.isComputerTurn) {
            this.rollBtn.disabled = false;
        }
    }
    
    updatePlayerPositions() {
        // Clear all player tokens
        document.querySelectorAll('.player-token').forEach(token => token.remove());
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('player1', 'player2', 'both-players');
        });
        
        // Add player tokens
        Object.keys(this.playerPositions).forEach(player => {
            const position = this.playerPositions[player];
            const square = document.querySelector(`[data-number="${position}"]`);
            
            if (square) {
                const token = document.createElement('div');
                token.className = `player-token player${player}`;
                token.textContent = player;
                square.appendChild(token);
                
                // Add visual indicator to square
                if (square.classList.contains(`player${player === '1' ? '2' : '1'}`)) {
                    square.classList.add('both-players');
                } else {
                    square.classList.add(`player${player}`);
                }
            }
        });
    }
    
    showSpecialEffect(type) {
        // Create a temporary visual effect
        const effect = document.createElement('div');
        effect.className = `special-effect ${type}-effect`;
        effect.textContent = type === 'snake' ? '🐍💥' : '🪜✨';
        
        document.body.appendChild(effect);
        
        // Remove effect after animation
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Don't auto-initialize game, wait for mode selection
    // The game will be initialized when startGame() is called
    
    // Redraw connections on window resize
    window.addEventListener('resize', () => {
        if (window.gameInstance) {
            setTimeout(() => {
                window.gameInstance.drawConnections();
            }, 100);
        }
    });
});