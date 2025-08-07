import { initCharToMorse } from './char-to-morse.js';
import { initMorseToChar } from './morse-to-char.js';
import { initSoundToChar } from './sound-to-char.js';
import { initFlashCards } from './flash-cards.js';
import { initLearn } from './learn.js';
import { initStudy } from './study.js';
import { initStats } from './stats.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { cleanupActiveSpacebarPaddle } from './spacebar-paddle.js';
import { showToast } from './toast-utils.js';

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');

const charToMorseBtn = document.getElementById('char-to-morse-btn');
const morseToCharBtn = document.getElementById('morse-to-char-btn');
const soundToCharBtn = document.getElementById('sound-to-char-btn');
const studyBtn = document.getElementById('study-btn');
const statsBtn = document.getElementById('stats-btn');

// Settings modal elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const globalIncludePunctuationCheckbox = document.getElementById('global-include-punctuation');
const morseSpeedSlider = document.getElementById('morse-speed-slider');
const speedDisplay = document.getElementById('speed-display');
const showToastCheckbox = document.getElementById('show-toast-checkbox');
const toastQuestionCountInput = document.getElementById('toast-question-count-input');


    // Initialize settings UI
function initializeSettings() {
    // Set checkbox state from saved settings
    globalIncludePunctuationCheckbox.checked = settings.get('includePunctuation');
    
    // Set speed slider and display from saved settings
    const savedSpeed = settings.get('morseSpeed');
    morseSpeedSlider.value = savedSpeed;
    speedDisplay.textContent = `${savedSpeed} WPM`;

    // Initialize toast settings
    showToastCheckbox.checked = settings.get('showToast');
    const savedToastCount = settings.get('toastQuestionCount');
    toastQuestionCountInput.value = savedToastCount;
    
    // Add event listeners
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    globalIncludePunctuationCheckbox.addEventListener('change', (e) => {
        settings.set('includePunctuation', e.target.checked);
    });
    
    // Speed slider event listener
    morseSpeedSlider.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        speedDisplay.textContent = `${speed} WPM`;
        settings.set('morseSpeed', speed);
    });

    // Toast checkbox event listener
    showToastCheckbox.addEventListener('change', (e) => {
        settings.set('showToast', e.target.checked);
    });

    // Toast question count input listener
    toastQuestionCountInput.addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        if (!isNaN(count) && count >= 1) {
            settings.set('toastQuestionCount', count);
        }
    });
    
    // Clear stats button event listener
    const clearStatsBtn = document.getElementById('clear-stats-btn');
    clearStatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
            statistics.clearAllStats();
            updateStatsDisplay();
            alert('All statistics have been cleared.');
        }
    });
    
    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
}

function openSettings() {
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

// Game mode navigation
charToMorseBtn.addEventListener('click', () => {
    loadGameMode('char-to-morse');
});

morseToCharBtn.addEventListener('click', () => {
    loadGameMode('morse-to-char');
});

soundToCharBtn.addEventListener('click', () => {
    loadGameMode('sound-to-char');
});

studyBtn.addEventListener('click', () => {
    loadGameMode('study');
});

statsBtn.addEventListener('click', () => {
    loadGameMode('stats');
});

// Handle browser back button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.mode) {
        loadGameModeFromHistory(event.state.mode);
    } else {
        showMainMenu();
    }
});

async function loadGameMode(mode) {
    // Push state to history for browser back button support
    history.pushState({ mode: mode }, '', `#${mode}`);
    await loadGameModeFromHistory(mode);
}

// Make loadGameMode available globally for sub-modules
window.loadGameMode = loadGameMode;

async function loadGameModeFromHistory(mode) {
    // Clean up any active spacebar paddle from previous mode
    cleanupActiveSpacebarPaddle();
    
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';

    const response = await fetch(`html/${mode}.html`);
    const html = await response.text();
    gameContainer.innerHTML = html;

    if (mode === 'char-to-morse') {
        initCharToMorse();
    } else if (mode === 'morse-to-char') {
        initMorseToChar();
    } else if (mode === 'sound-to-char') {
        initSoundToChar();
    } else if (mode === 'flash-cards') {
        initFlashCards();
    } else if (mode === 'learn') {
        initLearn();
    } else if (mode === 'study') {
        initStudy();
    } else if (mode === 'stats') {
        initStats();
    }
}

function showMainMenu() {
    // Clean up any active spacebar paddle when returning to main menu
    cleanupActiveSpacebarPaddle();
    
    mainMenu.style.display = 'block';
    gameContainer.style.display = 'none';
    gameContainer.innerHTML = '';
    // Update URL to remove hash
    history.replaceState(null, '', window.location.pathname);
    // Update stats when returning to main menu
    updateStatsDisplay();
}

// Initialize based on URL hash on page load
window.addEventListener('load', () => {
    initializeSettings();
    updateStatsDisplay();
    const hash = window.location.hash.substring(1);
    if (hash && ['char-to-morse', 'morse-to-char', 'sound-to-char', 'flash-cards', 'learn', 'study', 'stats'].includes(hash)) {
        loadGameModeFromHistory(hash);
    }
});

// Update statistics display on main menu
function updateStatsDisplay() {
    const summary = statistics.getStatsSummary();
    console.log('Updating stats display:', summary);
    
    // Update the Statistics button instead of the header
    const statsBtn = document.getElementById('stats-btn');
    const statsDescription = statsBtn.querySelector('p');
    
    if (summary.hasStats) {
        statsDescription.textContent = `View your learning progress (${summary.overallAccuracy}% overall accuracy)`;
    } else {
        statsDescription.textContent = 'View your learning progress';
    }
}

