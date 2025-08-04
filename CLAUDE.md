# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# Start local development server (required due to browser security restrictions)
python3 -m http.server
# Then navigate to http://localhost:8000
```

### Screenshot Generation
```bash
cd _scripts
npm install
npm run screenshot-local    # Local development screenshots
npm run screenshot-live     # Live GitHub Pages screenshots
npm run screenshot-both     # Both local and live
```

### PWA Icon Generation
```bash
# Generate required PNG icons from SVG favicon
inkscape --export-type=png --export-width=192 --export-height=192 favicon.svg --export-filename=icon-192.png
inkscape --export-type=png --export-width=512 --export-height=512 favicon.svg --export-filename=icon-512.png
```

## Architecture Overview

### Application Structure
- **Single Page Application (SPA)**: Uses HTML5 History API for navigation between game modes
- **Progressive Web App (PWA)**: Includes service worker (`sw.js`) for offline functionality and app-like experience
- **Module-based JavaScript**: ES6 modules with clear separation of concerns

### Core Components

#### Entry Point (`index.html` + `js/main.js`)
- Main menu with navigation to different practice modes
- Settings modal with global preferences
- History management for browser back/forward navigation
- Dynamic loading of game mode HTML and initialization

#### Game Modes
Each mode is a separate module with its own HTML template:
- `char-to-morse`: Show character, input morse code (supports spacebar paddle)
- `morse-to-char`: Show morse code, guess character
- `sound-to-char`: Play morse audio, identify character
- `learn`: Reference chart for all morse characters
- `stats`: Visualized practice statistics with Chart.js

#### Core Systems

**Morse Code Engine (`js/morse-code.js`)**
- Central morse code dictionary (letters, numbers, punctuation)
- Used across all practice modes for consistency

**Settings System (`js/settings.js`)**
- Cookie-based persistence with 1-year expiry
- Global settings: punctuation inclusion, morse speed (WPM), toast notifications
- Spacebar paddle configuration with timing thresholds

**Statistics System (`js/statistics.js`)**
- LocalStorage-based persistence with versioning (`morse_trainer_stats_v3`)
- Per-character accuracy tracking across all modes
- Timestamp-based attempt tracking with 3-month data retention
- Date-based statistics charting (not session-based)
- Toast accuracy based on last X attempts from settings
- Automatic cleanup of old storage formats

**UI Utilities**
- `js/ui.js`: Common UI helpers and animations
- `js/toast-utils.js`: Accuracy notification system
- `js/practice-mode-utils.js`: Shared practice mode functionality

**Spacebar Paddle (`js/spacebar-paddle.js`)**
- Hardware-style morse key simulation using spacebar
- Timing-based dot/dash detection with WPM-derived thresholds
- Visual feedback and cleanup management

### Styling Architecture
Modular CSS approach in `styles/`:
- `base.css`: CSS variables, reset, typography
- `layout.css`: Grid systems, main layout structure
- `components.css`: Reusable UI components (buttons, modals, cards)
- `game-modes.css`: Practice mode specific styles
- `spacebar-paddle.css`: Paddle mode visual feedback
- `mobile.css`: Responsive design overrides

### Service Worker Caching
- Versioned cache (`v10`) for cache-busting on updates
- Caches all static assets and external Chart.js CDN
- Graceful failure handling for individual cache misses

## Key Development Patterns

### Game Mode Loading Pattern
```javascript
// Dynamic HTML loading with module initialization
const response = await fetch(`html/${mode}.html`);
const html = await response.text();
gameContainer.innerHTML = html;
// Then call mode-specific init function
```

### Statistics Recording Pattern
```javascript
statistics.recordAttempt(mode, character, isCorrect);
// Automatically stores timestamp and handles per-character tracking
// Data structure: {isCorrect: boolean, timestamp: string, character: string}
```

### Settings Management Pattern
```javascript
settings.get('settingName');      // Retrieve setting
settings.set('settingName', value); // Save setting (auto-persists to cookies)
```

### Spacebar Paddle Integration
- Must call `cleanupActiveSpacebarPaddle()` when switching modes
- Toggle via settings with `spacebarPaddleEnabled` flag
- Uses timing thresholds derived from WPM settings

## Screenshot Automation
The `_scripts/` directory contains Puppeteer-based screenshot generation that:
- Captures all app screens in desktop (1200x800) and mobile (448x867) viewports
- Automatically cleans existing screenshots before generation for consistency
- Generates two types of animated GIFs:
  - `combined.gif`: All 8 screens (menu, settings, game modes, learn, stats)
  - `game-modes.gif`: Only the 4 interactive practice modes
- Uses optimized timing (1 second per frame) without slow morphing effects
- Supports both local development and live GitHub Pages URLs
- Organizes output in `_screenshots/` with environment-specific folders
- Includes realistic fake statistics data for stats page screenshots