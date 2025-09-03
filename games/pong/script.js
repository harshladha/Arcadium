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

function showModeSelection() {
    document.getElementById('modeSelection').style.display = 'flex';
    document.getElementById('difficultySelection').style.display = 'none';
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

class PongGame {
    constructor(mode, difficulty = 'medium') {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mode = mode; // 'ai' or 'human'
        this.difficulty = difficulty;
        
        // Game dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game objects
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            dx: 5,
            dy: 3,
            radius: 8,
            speed: 5,
            lastHit: null // Track last paddle hit to prevent double hits
        };
        
        this.paddle1 = {
            x: 20,
            y: this.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 6,
            moving: 0 // -1 up, 0 stop, 1 down
        };
        
        this.paddle2 = {
            x: this.width - 30,
            y: this.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 6,
            moving: 0
        };
        
        // Game state
        this.score1 = 0;
        this.score2 = 0;
        this.isGameActive = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // AI settings
        this.aiSettings = {
            easy: { speed: 3, reaction: 0.7, maxScore: 5 },
            medium: { speed: 4, reaction: 0.8, maxScore: 7 },
            hard: { speed: 5, reaction: 0.9, maxScore: 10 }
        };
        
        this.maxScore = this.mode === 'ai' ? this.aiSettings[difficulty].maxScore : 11;
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.updateUI();
        this.resetBall();
        this.draw();
        
        // Add a small delay before starting the game
        setTimeout(() => {
            this.startGame();
        }, 1000);
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.trackPong('gameStart', { mode: this.mode, difficulty: this.difficulty });
        }
    }
    
    setupControls() {
        this.keys = {};
        
        // Make canvas focusable
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        
        // Add event listeners to both document and canvas
        const handleKeyDown = (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isGameActive) {
                    this.pauseGame();
                }
            }
            
            // Prevent default for game control keys
            if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                e.preventDefault();
            }
        };
        
        const handleKeyUp = (e) => {
            this.keys[e.code] = false;
        };
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        this.canvas.addEventListener('keydown', handleKeyDown);
        this.canvas.addEventListener('keyup', handleKeyUp);
        
        // Ensure canvas stays focused
        this.canvas.addEventListener('blur', () => {
            setTimeout(() => this.canvas.focus(), 0);
        });
    }
    
    updateUI() {
        document.getElementById('player1Name').textContent = 'Player 1';
        document.getElementById('player2Name').textContent = this.mode === 'ai' ? 'Computer' : 'Player 2';
        document.getElementById('player1Score').textContent = this.score1;
        document.getElementById('player2Score').textContent = this.score2;
        
        // Update controls display
        if (this.mode === 'ai') {
            document.getElementById('leftControls').textContent = 'Player: W/S';
            document.getElementById('rightControls').textContent = 'Computer: AI';
            
            // Hide player 2 mobile controls
            const mobileControls = document.querySelectorAll('.player-controls')[1];
            if (mobileControls) mobileControls.style.display = 'none';
        } else {
            document.getElementById('leftControls').textContent = 'Player 1: W/S';
            document.getElementById('rightControls').textContent = 'Player 2: ↑/↓';
            
            // Show both mobile controls
            const mobileControls = document.querySelectorAll('.player-controls');
            mobileControls.forEach(control => control.style.display = 'flex');
        }
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        document.getElementById('pauseBtn').style.display = 'inline-block';
        
        // Focus canvas for keyboard input
        this.canvas.focus();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
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
        
        // Focus canvas and restart game loop
        this.canvas.focus();
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update(currentTime) {
        if (!this.isGameActive || this.isPaused) return;
        
        // Calculate delta time for smooth movement
        if (!this.lastTime) this.lastTime = currentTime;
        const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
        this.lastTime = currentTime;
        
        this.handleInput();
        this.updatePaddles(deltaTime);
        this.updateBall(deltaTime);
        this.checkCollisions();
        this.draw();
        
        // Check win condition
        if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
            this.gameOver();
            return;
        }
        
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    handleInput() {
        // Player 1 controls (W/S)
        if (this.keys['KeyW']) {
            this.paddle1.moving = -1;
        } else if (this.keys['KeyS']) {
            this.paddle1.moving = 1;
        } else {
            this.paddle1.moving = 0;
        }
        
        // Player 2 controls (Arrow keys) - only in human mode
        if (this.mode === 'human') {
            if (this.keys['ArrowUp']) {
                this.paddle2.moving = -1;
            } else if (this.keys['ArrowDown']) {
                this.paddle2.moving = 1;
            } else {
                this.paddle2.moving = 0;
            }
        }
    }
    
    updatePaddles(deltaTime = 1) {
        // Update paddle 1
        this.paddle1.y += this.paddle1.moving * this.paddle1.speed * deltaTime;
        this.paddle1.y = Math.max(0, Math.min(this.height - this.paddle1.height, this.paddle1.y));
        
        // Update paddle 2 (AI or human)
        if (this.mode === 'ai') {
            this.updateAI(deltaTime);
        } else {
            this.paddle2.y += this.paddle2.moving * this.paddle2.speed * deltaTime;
        }
        
        this.paddle2.y = Math.max(0, Math.min(this.height - this.paddle2.height, this.paddle2.y));
    }
    
    updateAI(deltaTime = 1) {
        const aiSpeed = this.aiSettings[this.difficulty].speed;
        const reaction = this.aiSettings[this.difficulty].reaction;
        
        const paddleCenter = this.paddle2.y + this.paddle2.height / 2;
        const ballY = this.ball.y;
        
        // AI only reacts when ball is moving towards it
        if (this.ball.dx > 0) {
            const diff = ballY - paddleCenter;
            
            if (Math.abs(diff) > 10) {
                if (Math.random() < reaction) {
                    if (diff > 0) {
                        this.paddle2.y += aiSpeed * deltaTime;
                    } else {
                        this.paddle2.y -= aiSpeed * deltaTime;
                    }
                }
            }
        }
    }
    
    updateBall(deltaTime = 1) {
        this.ball.x += this.ball.dx * deltaTime;
        this.ball.y += this.ball.dy * deltaTime;
        
        // Ball collision with top/bottom walls
        if (this.ball.y <= this.ball.radius) {
            this.ball.y = this.ball.radius;
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y >= this.height - this.ball.radius) {
            this.ball.y = this.height - this.ball.radius;
            this.ball.dy = -this.ball.dy;
        }
        
        // Ball goes out of bounds
        if (this.ball.x < -this.ball.radius) {
            this.score2++;
            this.resetBall();
            this.updateUI();
            
            // Track score
            if (typeof Stats !== 'undefined') {
                Stats.trackPong('score', { player: 2, mode: this.mode });
            }
        } else if (this.ball.x > this.width + this.ball.radius) {
            this.score1++;
            this.resetBall();
            this.updateUI();
            
            // Track score
            if (typeof Stats !== 'undefined') {
                Stats.trackPong('score', { player: 1, mode: this.mode });
            }
        }
    }
    
    checkCollisions() {
        // Paddle 1 collision
        if (this.ball.x - this.ball.radius <= this.paddle1.x + this.paddle1.width &&
            this.ball.y >= this.paddle1.y &&
            this.ball.y <= this.paddle1.y + this.paddle1.height &&
            this.ball.dx < 0 &&
            this.ball.lastHit !== 'paddle1') {
            
            this.ball.dx = -this.ball.dx;
            this.ball.x = this.paddle1.x + this.paddle1.width + this.ball.radius;
            this.ball.lastHit = 'paddle1';
            
            // Add spin based on where ball hits paddle
            const hitPos = (this.ball.y - this.paddle1.y) / this.paddle1.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            // Increase ball speed slightly after each hit
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
            
            // Cap maximum speed
            const maxSpeed = 12;
            if (Math.abs(this.ball.dx) > maxSpeed) {
                this.ball.dx = this.ball.dx > 0 ? maxSpeed : -maxSpeed;
            }
            if (Math.abs(this.ball.dy) > maxSpeed) {
                this.ball.dy = this.ball.dy > 0 ? maxSpeed : -maxSpeed;
            }
        }
        
        // Paddle 2 collision
        if (this.ball.x + this.ball.radius >= this.paddle2.x &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + this.paddle2.height &&
            this.ball.dx > 0 &&
            this.ball.lastHit !== 'paddle2') {
            
            this.ball.dx = -this.ball.dx;
            this.ball.x = this.paddle2.x - this.ball.radius;
            this.ball.lastHit = 'paddle2';
            
            // Add spin based on where ball hits paddle
            const hitPos = (this.ball.y - this.paddle2.y) / this.paddle2.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            // Increase ball speed slightly after each hit
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
            
            // Cap maximum speed
            const maxSpeed = 12;
            if (Math.abs(this.ball.dx) > maxSpeed) {
                this.ball.dx = this.ball.dx > 0 ? maxSpeed : -maxSpeed;
            }
            if (Math.abs(this.ball.dy) > maxSpeed) {
                this.ball.dy = this.ball.dy > 0 ? maxSpeed : -maxSpeed;
            }
        }
        
        // Reset lastHit when ball moves away from paddles
        if (this.ball.x > this.paddle1.x + this.paddle1.width + 50 && 
            this.ball.x < this.paddle2.x - 50) {
            this.ball.lastHit = null;
        }
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.lastHit = null;
        
        // Ensure ball moves at proper speed
        const angle = (Math.random() - 0.5) * Math.PI / 4; // Max 45 degrees
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        this.ball.dx = direction * this.ball.speed * Math.cos(angle);
        this.ball.dy = this.ball.speed * Math.sin(angle);
        
        // Ensure minimum speed
        if (Math.abs(this.ball.dx) < 2) {
            this.ball.dx = direction * 2;
        }
        if (Math.abs(this.ball.dy) < 1) {
            this.ball.dy = Math.random() > 0.5 ? 1 : -1;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#001D3D';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#003566';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#00B4DB';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
        
        // Draw ball
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add ball glow effect
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Show game status if not active
        if (!this.isGameActive) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Starting...', this.width / 2, this.height / 2);
        }
    }
    
    gameOver() {
        this.stopGame();
        
        const winner = this.score1 >= this.maxScore ? 1 : 2;
        const winnerName = winner === 1 ? 'Player 1' : (this.mode === 'ai' ? 'Computer' : 'Player 2');
        
        // Check for personal best (only for player wins against AI)
        let isNewRecord = false;
        if (this.mode === 'ai' && winner === 1) {
            const recordKey = `pong-ai-${this.difficulty}-best`;
            const currentRecord = parseInt(localStorage.getItem(recordKey) || '0');
            if (this.score1 > currentRecord) {
                localStorage.setItem(recordKey, this.score1.toString());
                isNewRecord = true;
            }
        }
        
        // Show game over modal
        document.getElementById('winnerText').textContent = `🏆 ${winnerName} Wins! 🏆`;
        document.getElementById('finalScore1').textContent = this.score1;
        document.getElementById('finalScore2').textContent = this.score2;
        document.getElementById('finalMode').textContent = this.mode === 'ai' ? `vs Computer (${this.difficulty})` : 'vs Human';
        document.getElementById('newRecord').style.display = isNewRecord ? 'block' : 'none';
        document.getElementById('gameOverModal').style.display = 'flex';
        
        document.getElementById('pauseBtn').style.display = 'none';
        
        // Track game end
        if (typeof Stats !== 'undefined') {
            Stats.trackPong('gameEnd', {
                mode: this.mode,
                difficulty: this.difficulty,
                winner: winner,
                score1: this.score1,
                score2: this.score2,
                isNewRecord: isNewRecord
            });
        }
    }
}

// Game control functions
function startGame(mode) {
    if (mode === 'ai') {
        document.getElementById('modeSelection').style.display = 'none';
        document.getElementById('difficultySelection').style.display = 'flex';
    } else {
        document.getElementById('modeSelection').style.display = 'none';
        document.getElementById('gameMain').style.display = 'block';
        
        window.currentGame = new PongGame('human');
        window.currentMode = 'human';
    }
}

function startAIGame(difficulty) {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    window.currentGame = new PongGame('ai', difficulty);
    window.currentMode = 'ai';
    window.currentDifficulty = difficulty;
}

function restartGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    
    if (window.currentMode === 'ai') {
        startAIGame(window.currentDifficulty);
    } else {
        startGame('human');
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

// Mobile control functions
function startMoving(player, direction) {
    if (!window.currentGame || !window.currentGame.isGameActive || window.currentGame.isPaused) return;
    
    const game = window.currentGame;
    
    if (player === 'player1') {
        game.paddle1.moving = direction === 'up' ? -1 : 1;
    } else if (player === 'player2' && game.mode === 'human') {
        game.paddle2.moving = direction === 'up' ? -1 : 1;
    }
}

function stopMoving(player) {
    if (!window.currentGame) return;
    
    const game = window.currentGame;
    
    if (player === 'player1') {
        game.paddle1.moving = 0;
    } else if (player === 'player2' && game.mode === 'human') {
        game.paddle2.moving = 0;
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show mode selection by default
    showModeSelection();
});