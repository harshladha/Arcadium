# Arcadium Game Template

This document outlines the standard structure and navigation pattern that all games in Arcadium should follow.

## Required HTML Structure

### 1. Head Section
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Game Name] - Arcadium</title>
  <link rel="stylesheet" href="../../css/game-header.css" />
  <link rel="stylesheet" href="style.css" />
</head>
```

### 2. Header Navigation
```html
<header class="game-header">
  <div class="brand">
    <img src="../../assets/images/arcadium-logo.svg.svg" alt="Arcadium Logo" />
    <span>[Game Name]</span>
  </div>
  <button class="menu-btn" id="menu-btn">☰</button>
  <nav class="menu-dropdown" id="menu-dropdown">
    <button onclick="goHome()">🏠 Home</button>
    <button onclick="goBack()">🎮 Back to Games</button>
    <button onclick="resetGame()">🔄 Restart</button>
    <!-- Only include if game has multiple modes -->
    <button onclick="showModeSelection()">🎯 Game Mode</button>
  </nav>
</header>
```

### 3. Mode Selection (if applicable)
```html
<div class="mode-selection" id="modeSelection" style="display:none;">
  <h2>Select Game Mode</h2>
  <button onclick="startMode1()">Mode 1</button>
  <button onclick="startMode2()">Mode 2</button>
</div>
```

## Required JavaScript Functions

### Navigation Functions
```javascript
function goHome() {
  window.location.href = "../../index.html";
}

function goBack() {
  window.location.href = "../../games.html";
}

function resetGame() {
  // Reset game logic or reload page
  location.reload();
}

// Only if game has multiple modes
function showModeSelection() {
  // Hide game, show mode selection
  document.getElementById('gameMain').style.display = 'none';
  document.getElementById('modeSelection').style.display = 'flex';
}
```

### Menu Toggle
```javascript
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
```

## Required Scripts
```html
<script src="../../js/stats.js"></script>
<script src="app.js"></script>
```

## Navigation Menu Options

### Standard Options (All Games)
- 🏠 **Home**: Goes to main homepage (index.html)
- 🎮 **Back to Games**: Goes to games selection page (games.html)  
- 🔄 **Restart**: Reloads the current game

### Optional (Games with Multiple Modes)
- 🎯 **Game Mode**: Shows mode selection screen

## File Structure
```
games/
├── [game-name]/
│   ├── index.html
│   ├── style.css
│   ├── script.js (or app.js)
│   └── images/ (if needed)
```

## CSS Requirements
- Include `../../css/game-header.css` for consistent header styling
- Game-specific styles in local `style.css`
- Responsive design for mobile devices
- Consistent color scheme with Arcadium branding

## Stats Integration
- Include stats.js for tracking game statistics
- Use appropriate tracking functions for game events
- Follow existing patterns for leaderboard integration