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
    document.getElementById('levelCompleteModal').style.display = 'none';
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

class BreakoutGame {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Difficulty settings
        this.settings = {
            easy: { ballSpeed: 4, paddleWidth: 120, lives: 3 },
            medium: { ballSpeed: 6, paddleWidth: 100, lives: 3 },
            hard: { ballSpeed: 8, paddleWidth: 80, lives: 2 }
        };
        
        this.currentSettings = this.settings[difficulty];
        
        // Game objects
        this.ball = {
            x: this.width / 2,
            y: this.height - 50,
            dx: 0,
            dy: 0,
            radius: 8,
            speed: this.currentSettings.ballSpeed,
            launched: false
        };
        
        this.paddle = {
            x: this.width / 2 - this.currentSettings.paddleWidth / 2,
            y: this.height - 20,
            width: this.currentSettings.paddleWidth,
            height: 15,
            speed: 8,
            moving: 0
        };
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lives = this.currentSettings.lives;
        this.bricks = [];
        this.totalBricksDestroyed = 0;
        this.isGameActive = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // Brick colors by row
        this.brickColors = ['#FF5722', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'];
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.createBricks();
        this.updateDisplay();
        this.draw();
        this.startGame();
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.trackBreakout('gameStart', { difficulty: this.difficulty });
        }
    }
    
    setupControls() {
        this.keys = {};
        this.mouseX = this.width / 2;
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.ball.launched && this.isGameActive && !this.isPaused) {
                    this.launchBall();
                } else if (this.isGameActive) {
                    this.pauseGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (!this.ball.launched && this.isGameActive && !this.isPaused) {
                this.launchBall();
            }
        });
    }
    
    createBricks() {
        this.bricks = [];
        const rows = 6;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 80;
        const offsetLeft = (this.width - (cols * (brickWidth + padding) - padding)) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: offsetLeft + col * (brickWidth + padding),
                    y: offsetTop + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: this.brickColors[row],
                    points: (6 - row) * 10, // Top rows worth more points
                    destroyed: false
                });
            }
        }
        
        this.updateDisplay();
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('launchBtn').style.display = 'inline-block';
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    pauseGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = true;
        cancelAnimationFrame(this.gameLoop);
        document.getElementById('pauseModal').style.display = 'flex';
    }
    
    resumeGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = false;
        document.getElementById('pauseModal').style.display = 'none';
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update() {
        if (!this.isGameActive || this.isPaused) return;
        
        this.handleInput();
        this.updatePaddle();
        this.updateBall();
        this.checkCollisions();
        this.draw();
        
        // Check win condition
        const remainingBricks = this.bricks.filter(brick => !brick.destroyed).length;
        if (remainingBricks === 0) {
            this.levelComplete();
            return;
        }
        
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    handleInput() {
        // Keyboard controls
        if (this.keys['ArrowLeft']) {
            this.paddle.moving = -1;
        } else if (this.keys['ArrowRight']) {
            this.paddle.moving = 1;
        } else {
            this.paddle.moving = 0;
        }
    }
    
    updatePaddle() {
        // Mouse control (priority over keyboard)
        if (this.mouseX !== undefined) {
            this.paddle.x = this.mouseX - this.paddle.width / 2;
        } else {
            // Keyboard control
            this.paddle.x += this.paddle.moving * this.paddle.speed;
        }
        
        // Keep paddle in bounds
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
        
        // Keep ball on paddle if not launched
        if (!this.ball.launched) {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
        }
    }
    
    updateBall() {
        if (!this.ball.launched) return;
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with walls
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        
        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Ball goes below paddle (lose life)
        if (this.ball.y > this.height) {
            this.loseLife();
        }
    }
    
    checkCollisions() {
        if (!this.ball.launched) return;
        
        // Paddle collision
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            
            // Calculate hit position on paddle (0 to 1)
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            
            // Adjust ball angle based on hit position
            const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
            this.ball.dx = this.ball.speed * Math.sin(angle);
            this.ball.dy = -this.ball.speed * Math.cos(angle);
            
            this.ball.y = this.paddle.y - this.ball.radius;
        }
        
        // Brick collisions
        for (let brick of this.bricks) {
            if (brick.destroyed) continue;
            
            if (this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                
                brick.destroyed = true;
                this.score += brick.points;
                this.totalBricksDestroyed++;
                
                // Determine collision side and bounce accordingly
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                const dx = ballCenterX - brickCenterX;
                const dy = ballCenterY - brickCenterY;
                
                if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
                    this.ball.dx = -this.ball.dx;
                } else {
                    this.ball.dy = -this.ball.dy;
                }
                
                this.updateDisplay();
                
                // Track brick destroyed
                if (typeof Stats !== 'undefined') {
                    Stats.trackBreakout('brickDestroyed', { points: brick.points });
                }
                
                break; // Only hit one brick per frame
            }
        }
    }
    
    launchBall() {
        if (this.ball.launched) return;
        
        this.ball.launched = true;
        this.ball.dx = (Math.random() - 0.5) * 4; // Random horizontal direction
        this.ball.dy = -this.ball.speed;
        
        document.getElementById('launchBtn').style.display = 'none';
    }
    
    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
        }
        
        // Track life lost
        if (typeof Stats !== 'undefined') {
            Stats.trackBreakout('lifeLost', { livesRemaining: this.lives });
        }
    }
    
    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.height - 50;
        this.ball.dx = 0;
        this.ball.dy = 0;
        this.ball.launched = false;
        
        document.getElementById('launchBtn').style.display = 'inline-block';
    }
    
    levelComplete() {
        this.stopGame();
        
        // Calculate bonus points
        const bonusPoints = this.lives * 100;
        this.score += bonusPoints;
        
        // Show level complete modal
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('bonusPoints').textContent = bonusPoints;
        document.getElementById('remainingLives').textContent = this.lives;
        document.getElementById('levelCompleteModal').style.display = 'flex';
        
        // Track level complete
        if (typeof Stats !== 'undefined') {
            Stats.trackBreakout('levelComplete', { 
                level: this.level, 
                score: this.score, 
                bonusPoints: bonusPoints 
            });
        }
    }
    
    nextLevel() {
        this.level++;
        document.getElementById('levelCompleteModal').style.display = 'none';
        
        // Increase ball speed slightly
        this.ball.speed += 0.5;
        
        // Create new bricks
        this.createBricks();
        this.resetBall();
        this.updateDisplay();
        this.startGame();
    }
    
    gameOver() {
        this.stopGame();
        
        // Check for high score
        const highScoreKey = `breakout-${this.difficulty}-high-score`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');
        const isNewHighScore = this.score > currentHighScore;
        
        if (isNewHighScore) {
            localStorage.setItem(highScoreKey, this.score.toString());
        }
        
        // Show game over modal
        document.getElementById('gameOverTitle').textContent = this.lives <= 0 ? '💥 Game Over! 💥' : '🎉 You Win! 🎉';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalBricks').textContent = this.totalBricksDestroyed;
        document.getElementById('finalDifficulty').textContent = 
            this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        document.getElementById('newHighScore').style.display = isNewHighScore ? 'block' : 'none';
        document.getElementById('gameOverModal').style.display = 'flex';
        
        document.getElementById('pauseBtn').style.display = 'none';
        
        // Track game end
        if (typeof Stats !== 'undefined') {
            Stats.trackBreakout('gameEnd', {
                difficulty: this.difficulty,
                score: this.score,
                level: this.level,
                bricksDestroyed: this.totalBricksDestroyed,
                isNewHighScore: isNewHighScore
            });
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#001D3D';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw bricks
        for (let brick of this.bricks) {
            if (!brick.destroyed) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                
                // Add brick border
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
        
        // Draw paddle
        this.ctx.fillStyle = '#00B4DB';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Add paddle glow
        this.ctx.shadowColor = '#00B4DB';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.paddle.x + 2, this.paddle.y + 2, this.paddle.width - 4, this.paddle.height - 4);
        this.ctx.shadowBlur = 0;
        
        // Draw ball
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add ball glow
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        
        const remainingBricks = this.bricks.filter(brick => !brick.destroyed).length;
        document.getElementById('bricks').textContent = remainingBricks;
    }
}

// Game control functions
function startGame(difficulty) {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    window.currentGame = new BreakoutGame(difficulty);
    window.currentDifficulty = difficulty;
}

function restartSameDifficulty() {
    document.getElementById('gameOverModal').style.display = 'none';
    startGame(window.currentDifficulty);
}

function nextLevel() {
    if (window.currentGame) {
        window.currentGame.nextLevel();
    }
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

function launchBall() {
    if (window.currentGame) {
        window.currentGame.launchBall();
    }
}

// Mobile control functions
function startMoving(direction) {
    if (!window.currentGame || !window.currentGame.isGameActive || window.currentGame.isPaused) return;
    
    const game = window.currentGame;
    game.paddle.moving = direction === 'left' ? -1 : 1;
    game.mouseX = undefined; // Disable mouse control when using mobile controls
}

function stopMoving() {
    if (!window.currentGame) return;
    
    window.currentGame.paddle.moving = 0;
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show difficulty selection by default
    showDifficultySelection();
});