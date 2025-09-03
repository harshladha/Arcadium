// Navigation functions
function goHome() {
    window.location.href = "../../index.html";
}

function goBack() {
    window.location.href = "../../games.html";
}

function resetGame() {
    newGame();
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

class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score') || '0');
        this.previousState = null;
        this.hasWon = false;
        this.gameOver = false;
        
        this.boardElement = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.undoBtn = document.getElementById('undoBtn');
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.hasWon = false;
        this.previousState = null;
        
        this.createBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.track2048('gameStart');
        }
    }
    
    createBoard() {
        this.boardElement.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.boardElement.appendChild(cell);
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.board[randomCell.row][randomCell.col] = value;
            
            this.createTileElement(randomCell.row, randomCell.col, value, true);
        }
    }
    
    createTileElement(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (isNew) tile.classList.add('tile-new');
        
        tile.textContent = value;
        tile.style.left = `${col * 25}%`;
        tile.style.top = `${row * 25}%`;
        
        this.boardElement.appendChild(tile);
        
        return tile;
    }
    
    updateDisplay() {
        // Clear existing tiles
        const existingTiles = this.boardElement.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        
        // Create tiles for current board state
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] !== 0) {
                    this.createTileElement(row, col, this.board[row][col]);
                }
            }
        }
        
        // Update score display
        this.scoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
        
        // Update undo button
        this.undoBtn.disabled = !this.previousState;
    }
    
    saveState() {
        this.previousState = {
            board: this.board.map(row => [...row]),
            score: this.score
        };
    }
    
    move(direction) {
        if (this.gameOver) return false;
        
        this.saveState();
        let moved = false;
        const newBoard = this.board.map(row => [...row]);
        
        switch (direction) {
            case 'left':
                moved = this.moveLeft(newBoard);
                break;
            case 'right':
                moved = this.moveRight(newBoard);
                break;
            case 'up':
                moved = this.moveUp(newBoard);
                break;
            case 'down':
                moved = this.moveDown(newBoard);
                break;
        }
        
        if (moved) {
            this.board = newBoard;
            this.addRandomTile();
            this.updateDisplay();
            
            // Check for 2048 tile (win condition)
            if (!this.hasWon && this.board.flat().includes(2048)) {
                this.hasWon = true;
                this.showWinModal();
            }
            
            // Check for game over
            if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOverModal();
            }
            
            // Update best score
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('2048-best-score', this.bestScore.toString());
            }
            
            // Track move
            if (typeof Stats !== 'undefined') {
                Stats.track2048('move', { direction, score: this.score });
            }
        }
        
        return moved;
    }
    
    moveLeft(board) {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            const originalRow = [...board[row]];
            const newRow = this.slideAndMergeRow(board[row]);
            board[row] = newRow;
            
            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
            }
        }
        
        return moved;
    }
    
    moveRight(board) {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            const originalRow = [...board[row]];
            const reversedRow = board[row].slice().reverse();
            const newRow = this.slideAndMergeRow(reversedRow).reverse();
            board[row] = newRow;
            
            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
            }
        }
        
        return moved;
    }
    
    moveUp(board) {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            const column = [board[0][col], board[1][col], board[2][col], board[3][col]];
            const originalColumn = [...column];
            const newColumn = this.slideAndMergeRow(column);
            
            for (let row = 0; row < 4; row++) {
                board[row][col] = newColumn[row];
            }
            
            if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
                moved = true;
            }
        }
        
        return moved;
    }
    
    moveDown(board) {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            const column = [board[0][col], board[1][col], board[2][col], board[3][col]];
            const originalColumn = [...column];
            const reversedColumn = column.slice().reverse();
            const newColumn = this.slideAndMergeRow(reversedColumn).reverse();
            
            for (let row = 0; row < 4; row++) {
                board[row][col] = newColumn[row];
            }
            
            if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
                moved = true;
            }
        }
        
        return moved;
    }
    
    slideAndMergeRow(row) {
        // Remove zeros
        const filtered = row.filter(val => val !== 0);
        
        // Merge adjacent equal values
        const merged = [];
        let i = 0;
        
        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i += 2;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }
        
        // Fill with zeros
        while (merged.length < 4) {
            merged.push(0);
        }
        
        return merged;
    }
    
    isGameOver() {
        // Check for empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.board[row][col];
                
                // Check right neighbor
                if (col < 3 && current === this.board[row][col + 1]) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < 3 && current === this.board[row + 1][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showWinModal() {
        document.getElementById('winScore').textContent = this.score;
        document.getElementById('winModal').style.display = 'flex';
        
        // Track win
        if (typeof Stats !== 'undefined') {
            Stats.track2048('win', { score: this.score });
        }
    }
    
    showGameOverModal() {
        document.getElementById('finalScore').textContent = this.score;
        
        // Check if it's a new best score
        if (this.score === this.bestScore && this.score > 0) {
            document.getElementById('newBestScore').style.display = 'block';
        } else {
            document.getElementById('newBestScore').style.display = 'none';
        }
        
        document.getElementById('gameOverModal').style.display = 'flex';
        
        // Track game over
        if (typeof Stats !== 'undefined') {
            Stats.track2048('gameOver', { score: this.score, bestScore: this.bestScore });
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });
        
        // Touch controls
        let startX, startY;
        
        this.boardElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.boardElement.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 0) {
                    this.move('left');
                } else {
                    this.move('right');
                }
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    this.move('up');
                } else {
                    this.move('down');
                }
            }
            
            startX = null;
            startY = null;
        });
    }
}

// Global game instance
let game;

// Game control functions
function newGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('winModal').style.display = 'none';
    game = new Game2048();
}

function continueGame() {
    document.getElementById('winModal').style.display = 'none';
}

function undoMove() {
    if (game && game.previousState) {
        game.board = game.previousState.board;
        game.score = game.previousState.score;
        game.previousState = null;
        game.updateDisplay();
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    newGame();
});