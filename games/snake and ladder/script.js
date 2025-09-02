class SnakeAndLadderGame {
    constructor() {
        this.currentPlayer = 1;
        this.playerPositions = { 1: 1, 2: 1 };
        this.gameBoard = document.getElementById('gameBoard');
        this.rollBtn = document.getElementById('rollBtn');
        this.dice = document.getElementById('dice');
        this.gameMessage = document.getElementById('gameMessage');
        
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
                    square.title = `Snake! Go to ${this.snakes[squareNumber]}`;
                } else if (this.ladders[squareNumber]) {
                    square.classList.add('ladder');
                    square.title = `Ladder! Go to ${this.ladders[squareNumber]}`;
                }
                
                this.gameBoard.appendChild(square);
            }
        }
        
        this.updatePlayerPositions();
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
            
            // Track ladder climb
            if (typeof Stats !== 'undefined') {
                Stats.trackSnakeAndLadder('ladderClimb');
            }
            this.updatePlayerPositions();
        }
        
        // Check for win
        if (this.playerPositions[this.currentPlayer] >= 100) {
            this.gameMessage.textContent = `🎉 Player ${this.currentPlayer} wins! 🎉`;
            this.rollBtn.disabled = true;
            
            // Track game completion
            if (typeof Stats !== 'undefined') {
                Stats.trackSnakeAndLadder('gameEnd', { winner: this.currentPlayer });
            }
            return;
        }
        
        this.gameMessage.textContent = message;
        this.switchPlayer();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update player info
        document.getElementById('player1').classList.toggle('active', this.currentPlayer === 1);
        document.getElementById('player2').classList.toggle('active', this.currentPlayer === 2);
        
        // Update positions
        document.querySelector('#player1 .player-position').textContent = `Position: ${this.playerPositions[1]}`;
        document.querySelector('#player2 .player-position').textContent = `Position: ${this.playerPositions[2]}`;
        
        // Update game message
        if (!this.gameMessage.textContent.includes('wins')) {
            this.gameMessage.textContent = `Player ${this.currentPlayer}'s turn - Roll the dice!`;
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
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeAndLadderGame();
});