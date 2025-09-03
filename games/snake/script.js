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
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('pauseModal').style.display = 'none';
    
    if (window.currentGame) {
        window.currentGame.stopGame();
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
    
    document.addEventListener('click', () => {
        menuDropdown.classList.remove('show');
    });
    
    menuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

class SnakeGame {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Difficulty settings
        this.settings = {
            easy: { gridSize: 20, speed: 200, canvasSize: 400 },
            medium: { gridSize: 25, speed: 150, canvasSize: 500 },
            hard: { gridSize: 30, speed: 100, canvasSize: 600 }
        };
        
        this.currentSettings = this.settings[difficulty];
        this.tileCount = this.currentSettings.gridSize;
        this.tileSize = this.currentSettings.canvasSize / this.tileCount;
        
        // Set canvas size
        this.canvas.width = this.currentSettings.canvasSize;
        this.canvas.height = this.currentSettings.canvasSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isGameActive = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.generateFood();
        this.updateDisplay();
        this.setupControls();
        this.draw();
        
        // Load high score
        const highScoreKey = `snake-${this.difficulty}-high-score`;
        const highScore = localStorage.getItem(highScoreKey) || '0';
        document.getElementById('highScore').textContent = highScore;
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.trackSnake('gameStart', { difficulty: this.difficulty });
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive || this.isPaused) return;
            
            switch(e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.dx === 0) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.dx === 0) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case 'Space':
                    e.preventDefault();
                    if (this.isGameActive) {
                        this.pauseGame();
                    }
                    break;
            }
        });
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        document.getElementById('pauseBtn').style.display = 'inline-block';
        this.gameLoop = setInterval(() => this.update(), this.currentSettings.speed);
    }
    
    pauseGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = true;
        clearInterval(this.gameLoop);
        document.getElementById('pauseModal').style.display = 'flex';
    }
    
    resumeGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = false;
        document.getElementById('pauseModal').style.display = 'none';
        this.gameLoop = setInterval(() => this.update(), this.currentSettings.speed);
    }
    
    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update() {
        if (!this.isGameActive || this.isPaused) return;
        
        // Move snake
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateDisplay();
            
            // Track food eaten
            if (typeof Stats !== 'undefined') {
                Stats.trackSnake('foodEaten', { score: this.score });
            }
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    generateFood() {
        let foodPosition;
        
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#001D3D';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // Head is slightly different color
            if (i === 0) {
                this.ctx.fillStyle = '#66BB6A';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            
            this.ctx.fillRect(
                segment.x * this.tileSize + 1,
                segment.y * this.tileSize + 1,
                this.tileSize - 2,
                this.tileSize - 2
            );
        }
        
        // Draw food
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(
            this.food.x * this.tileSize + 1,
            this.food.y * this.tileSize + 1,
            this.tileSize - 2,
            this.tileSize - 2
        );
        
        // Add food glow effect
        this.ctx.shadowColor = '#FF5722';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(
            this.food.x * this.tileSize + 3,
            this.food.y * this.tileSize + 3,
            this.tileSize - 6,
            this.tileSize - 6
        );
        this.ctx.shadowBlur = 0;
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#003566';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('length').textContent = this.snake.length;
    }
    
    gameOver() {
        this.stopGame();
        
        // Check for high score
        const highScoreKey = `snake-${this.difficulty}-high-score`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');
        const isNewHighScore = this.score > currentHighScore;
        
        if (isNewHighScore) {
            localStorage.setItem(highScoreKey, this.score.toString());
            document.getElementById('highScore').textContent = this.score;
        }
        
        // Show game over modal
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLength').textContent = this.snake.length;
        document.getElementById('finalDifficulty').textContent = 
            this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        document.getElementById('newHighScore').style.display = isNewHighScore ? 'block' : 'none';
        document.getElementById('gameOverModal').style.display = 'flex';
        
        document.getElementById('pauseBtn').style.display = 'none';
        
        // Track game end
        if (typeof Stats !== 'undefined') {
            Stats.trackSnake('gameEnd', {
                difficulty: this.difficulty,
                score: this.score,
                length: this.snake.length,
                isNewHighScore: isNewHighScore
            });
        }
    }
}

// Game control functions
function startGame(difficulty) {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    window.currentGame = new SnakeGame(difficulty);
    window.currentDifficulty = difficulty;
    
    // Auto-start the game after a short delay
    setTimeout(() => {
        window.currentGame.startGame();
    }, 500);
}

function restartSameDifficulty() {
    document.getElementById('gameOverModal').style.display = 'none';
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

function changeDirection(direction) {
    if (!window.currentGame || !window.currentGame.isGameActive || window.currentGame.isPaused) return;
    
    const game = window.currentGame;
    
    switch(direction) {
        case 'up':
            if (game.dy === 0) {
                game.dx = 0;
                game.dy = -1;
            }
            break;
        case 'down':
            if (game.dy === 0) {
                game.dx = 0;
                game.dy = 1;
            }
            break;
        case 'left':
            if (game.dx === 0) {
                game.dx = -1;
                game.dy = 0;
            }
            break;
        case 'right':
            if (game.dx === 0) {
                game.dx = 1;
                game.dy = 0;
            }
            break;
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show difficulty selection by default
    showDifficultySelection();
});