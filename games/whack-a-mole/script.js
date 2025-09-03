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
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
        menuDropdown.classList.remove('show');
    });
    
    // Prevent menu from closing when clicking inside dropdown
    menuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

class WhackAMoleGame {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.timeLeft = 0;
        this.isGameActive = false;
        this.isPaused = false;
        this.moleInterval = null;
        this.timerInterval = null;
        this.activeMoles = new Set();
        
        // Difficulty settings
        this.settings = {
            easy: { time: 60, moleSpeed: 2000, moleUpTime: 1500 },
            medium: { time: 45, moleSpeed: 1500, moleUpTime: 1200 },
            hard: { time: 30, moleSpeed: 1000, moleUpTime: 800 }
        };
        
        this.currentSettings = this.settings[difficulty];
        this.timeLeft = this.currentSettings.time;
        
        // Get DOM elements
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.hitsElement = document.getElementById('hits');
        this.missesElement = document.getElementById('misses');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.setupEventListeners();
        
        // Track game start
        if (typeof Stats !== 'undefined') {
            Stats.trackWhackAMole('gameStart', { difficulty: this.difficulty });
        }
    }
    
    setupEventListeners() {
        // Add click listeners to holes
        const holes = document.querySelectorAll('.hole');
        holes.forEach((hole, index) => {
            const holeHandler = () => this.hitHole(index);
            hole.addEventListener('click', holeHandler);
            
            // Add touch support for mobile
            if (typeof MobileUtils !== 'undefined') {
                MobileUtils.addTouchSupport(hole, holeHandler);
            }
        });
        
        // Add click listeners to moles
        const moles = document.querySelectorAll('.mole');
        moles.forEach((mole, index) => {
            const moleHandler = (e) => {
                e.stopPropagation();
                this.hitMole(index);
            };
            mole.addEventListener('click', moleHandler);
            
            // Add touch support for mobile
            if (typeof MobileUtils !== 'undefined') {
                MobileUtils.addTouchSupport(mole, moleHandler);
            }
        });
    }
    
    startGame() {
        this.isGameActive = true;
        this.isPaused = false;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.startTimer();
        this.startMoleSpawning();
    }
    
    pauseGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = true;
        this.stopIntervals();
        document.getElementById('pauseModal').style.display = 'flex';
    }
    
    resumeGame() {
        if (!this.isGameActive) return;
        
        this.isPaused = false;
        document.getElementById('pauseModal').style.display = 'none';
        this.startTimer();
        this.startMoleSpawning();
    }
    
    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        this.stopIntervals();
        this.hideAllMoles();
    }
    
    stopIntervals() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.moleInterval) {
            clearInterval(this.moleInterval);
            this.moleInterval = null;
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    startMoleSpawning() {
        this.moleInterval = setInterval(() => {
            if (!this.isPaused && this.isGameActive) {
                this.spawnMole();
            }
        }, this.currentSettings.moleSpeed);
    }
    
    spawnMole() {
        const availableHoles = [];
        
        // Find holes without active moles
        for (let i = 0; i < 9; i++) {
            if (!this.activeMoles.has(i)) {
                availableHoles.push(i);
            }
        }
        
        if (availableHoles.length === 0) return;
        
        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const mole = document.getElementById(`mole-${randomHole}`);
        
        // Determine mole type (10% chance for special moles)
        const rand = Math.random();
        let moleType = 'normal';
        
        if (rand < 0.05) {
            moleType = 'golden'; // 5% chance - worth 50 points
        } else if (rand < 0.08) {
            moleType = 'bomb'; // 3% chance - lose 20 points
        }
        
        // Set mole appearance
        mole.className = `mole up ${moleType}`;
        if (moleType === 'golden') {
            mole.textContent = '🌟';
        } else if (moleType === 'bomb') {
            mole.textContent = '💣';
        } else {
            mole.textContent = '🐹';
        }
        
        this.activeMoles.add(randomHole);
        
        // Hide mole after specified time
        setTimeout(() => {
            if (this.activeMoles.has(randomHole)) {
                this.hideMole(randomHole);
            }
        }, this.currentSettings.moleUpTime);
    }
    
    hideMole(index) {
        const mole = document.getElementById(`mole-${index}`);
        mole.classList.remove('up', 'golden', 'bomb');
        this.activeMoles.delete(index);
    }
    
    hideAllMoles() {
        for (let i = 0; i < 9; i++) {
            this.hideMole(i);
        }
    }
    
    hitHole(index) {
        if (!this.isGameActive || this.isPaused) return;
        
        // If no mole is up, it's a miss
        if (!this.activeMoles.has(index)) {
            this.misses++;
            this.showScorePopup(index, -5, 'negative');
            this.score = Math.max(0, this.score - 5);
            
            // Track miss
            if (typeof Stats !== 'undefined') {
                Stats.trackWhackAMole('miss');
            }
        }
        
        this.updateDisplay();
    }
    
    hitMole(index) {
        if (!this.isGameActive || this.isPaused || !this.activeMoles.has(index)) return;
        
        const mole = document.getElementById(`mole-${index}`);
        const hole = document.querySelector(`[data-index="${index}"]`);
        
        // Determine points based on mole type
        let points = 10;
        if (mole.classList.contains('golden')) {
            points = 50;
        } else if (mole.classList.contains('bomb')) {
            points = -20;
        }
        
        // Update score and stats
        this.score = Math.max(0, this.score + points);
        this.hits++;
        
        // Visual feedback
        mole.classList.add('whacked');
        hole.classList.add('hit');
        this.showScorePopup(index, points, points > 0 ? 'positive' : 'negative');
        
        // Remove visual effects
        setTimeout(() => {
            hole.classList.remove('hit');
        }, 300);
        
        // Hide the mole
        this.hideMole(index);
        
        // Track hit
        if (typeof Stats !== 'undefined') {
            Stats.trackWhackAMole('hit', { points, moleType: mole.classList.contains('golden') ? 'golden' : mole.classList.contains('bomb') ? 'bomb' : 'normal' });
        }
        
        this.updateDisplay();
    }
    
    showScorePopup(holeIndex, points, type) {
        const hole = document.querySelector(`[data-index="${holeIndex}"]`);
        const popup = document.createElement('div');
        popup.className = `score-popup ${type}`;
        popup.textContent = points > 0 ? `+${points}` : points.toString();
        
        // Position popup over the hole
        const rect = hole.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.top = rect.top + 'px';
        popup.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(popup);
        
        // Remove popup after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        this.hitsElement.textContent = this.hits;
        this.missesElement.textContent = this.misses;
    }
    
    endGame() {
        this.stopGame();
        
        // Calculate accuracy
        const totalAttempts = this.hits + this.misses;
        const accuracy = totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 0;
        
        // Check for high score
        const highScoreKey = `whack-a-mole-${this.difficulty}-high-score`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');
        const isNewHighScore = this.score > currentHighScore;
        
        if (isNewHighScore) {
            localStorage.setItem(highScoreKey, this.score.toString());
        }
        
        // Show game over modal
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHits').textContent = this.hits;
        document.getElementById('finalMisses').textContent = this.misses;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('newHighScore').style.display = isNewHighScore ? 'block' : 'none';
        document.getElementById('gameOverModal').style.display = 'flex';
        
        // Track game end
        if (typeof Stats !== 'undefined') {
            Stats.trackWhackAMole('gameEnd', {
                difficulty: this.difficulty,
                score: this.score,
                hits: this.hits,
                misses: this.misses,
                accuracy: accuracy,
                isNewHighScore: isNewHighScore
            });
        }
    }
}

// Game control functions
function startGame(difficulty) {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameMain').style.display = 'block';
    
    window.currentGame = new WhackAMoleGame(difficulty);
    window.currentDifficulty = difficulty;
}

function startCurrentGame() {
    if (window.currentGame) {
        window.currentGame.startGame();
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

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show difficulty selection by default
    showDifficultySelection();
});