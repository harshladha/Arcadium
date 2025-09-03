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

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Game dimensions
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameActive = false;
        this.isPaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        // Tetris pieces (tetrominoes)
        this.pieces = {
            I: {
                shape: [[1,1,1,1]],
                color: '#00FFFF'
            },
            O: {
                shape: [[1,1],[1,1]],
                color: '#FFFF00'
            },
            T: {
                shape: [[0,1,0],[1,1,1]],
                color: '#800080'
            },
            S: {
                shape: [[0,1,1],[1,1,0]],
                color: '#00FF00'
            },
            Z: {
                shape: [[1,1,0],[0,1,1]],
                color: '#FF0000'
            },
            J: {
                shape: [[1,0,0],[1,1,1]],
                color: '#0000FF'
            },
            L: {
                shape: [[0,0,1],[1,1,1]],
                color: '#FFA500'
            }
        };
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.setupControls();
        this.updateDisplay();
        
        // Track game initialization
        if (typeof Stats !== 'undefined') {
            Stats.trackTetris('gameStart');
        }
    }
    
    initBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive || this.isPaused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        });
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.initBoard();
        this.spawnPiece();
        this.spawnNextPiece();
        this.updateDisplay();
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('gameOverModal').style.display = 'none';
        
        this.gameLoop();
    }
    
    pauseGame() {
        if (!this.isGameActive) return;
        this.isPaused = true;
        document.getElementById('pauseModal').style.display = 'flex';
    }
    
    resumeGame() {
        if (!this.isGameActive) return;
        this.isPaused = false;
        document.getElementById('pauseModal').style.display = 'none';
        this.gameLoop();
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.createRandomPiece();
        }
        
        this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        // Check game over
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
            return;
        }
        
        this.spawnNextPiece();
    }
    
    spawnNextPiece() {
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }
    
    createRandomPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const piece = this.pieces[randomType];
        
        return {
            shape: piece.shape.map(row => [...row]),
            color: piece.color,
            x: 0,
            y: 0
        };
    }
    
    movePiece(dx, dy) {
        if (this.checkCollision(this.currentPiece, dx, dy)) {
            if (dy > 0) {
                this.placePiece();
            }
            return;
        }
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        this.draw();
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        } else {
            this.draw();
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        while (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        }
        this.placePiece();
    }
    
    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
        this.draw();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            
            // Track lines cleared
            if (typeof Stats !== 'undefined') {
                Stats.trackTetris('linesCleared', { lines: linesCleared, level: this.level });
            }
            
            this.updateDisplay();
        }
    }
    
    calculateScore(linesCleared) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[linesCleared] * this.level;
    }
    
    gameLoop() {
        if (!this.isGameActive || this.isPaused) return;
        
        const now = Date.now();
        
        if (now - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = now;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#001D3D';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // Draw grid
        this.drawGrid();
    }
    
    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, 
                                    this.BLOCK_SIZE, this.BLOCK_SIZE);
                    
                    // Add border
                    this.ctx.strokeStyle = '#FFFFFF';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, 
                                      this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawPiece(piece, context) {
        context.fillStyle = piece.color;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const drawX = (piece.x + x) * this.BLOCK_SIZE;
                    const drawY = (piece.y + y) * this.BLOCK_SIZE;
                    
                    context.fillRect(drawX, drawY, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    
                    // Add border
                    context.strokeStyle = '#FFFFFF';
                    context.lineWidth = 1;
                    context.strokeRect(drawX, drawY, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#003566';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        if (!this.nextPiece) return;
        
        // Clear next canvas
        this.nextCtx.fillStyle = '#001D3D';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = this.nextPiece.color;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    const drawX = offsetX + x * blockSize;
                    const drawY = offsetY + y * blockSize;
                    
                    this.nextCtx.fillRect(drawX, drawY, blockSize, blockSize);
                    
                    // Add border
                    this.nextCtx.strokeStyle = '#FFFFFF';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(drawX, drawY, blockSize, blockSize);
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    gameOver() {
        this.isGameActive = false;
        
        // Check for high score
        const currentHighScore = parseInt(localStorage.getItem('tetris-high-score') || '0');
        const isNewHighScore = this.score > currentHighScore;
        
        if (isNewHighScore) {
            localStorage.setItem('tetris-high-score', this.score.toString());
        }
        
        // Show game over modal
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalLines').textContent = this.lines;
        document.getElementById('newHighScore').style.display = isNewHighScore ? 'block' : 'none';
        document.getElementById('gameOverModal').style.display = 'flex';
        
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
        
        // Track game end
        if (typeof Stats !== 'undefined') {
            Stats.trackTetris('gameEnd', {
                score: this.score,
                level: this.level,
                lines: this.lines,
                isNewHighScore: isNewHighScore
            });
        }
    }
}

// Game control functions
function startGame() {
    if (window.tetrisGame) {
        window.tetrisGame.startGame();
    }
}

function pauseGame() {
    if (window.tetrisGame) {
        window.tetrisGame.pauseGame();
    }
}

function resumeGame() {
    if (window.tetrisGame) {
        window.tetrisGame.resumeGame();
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    window.tetrisGame = new TetrisGame();
});