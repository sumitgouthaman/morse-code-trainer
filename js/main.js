import { initCharToMorse } from './char-to-morse.js';
import { initMorseToChar } from './morse-to-char.js';
import { initSoundToChar } from './sound-to-char.js';
import { initLearn } from './learn.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');

const charToMorseBtn = document.getElementById('char-to-morse-btn');
const morseToCharBtn = document.getElementById('morse-to-char-btn');
const soundToCharBtn = document.getElementById('sound-to-char-btn');
const learnBtn = document.getElementById('learn-btn');

// Settings modal elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const globalIncludePunctuationCheckbox = document.getElementById('global-include-punctuation');
const morseSpeedSlider = document.getElementById('morse-speed-slider');
const speedDisplay = document.getElementById('speed-display');
const showToastCheckbox = document.getElementById('show-toast-checkbox');
const toastQuestionCountInput = document.getElementById('toast-question-count-input');
const toastQuestionCountDisplay = document.getElementById('toast-question-count-display');


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
    toastQuestionCountDisplay.textContent = savedToastCount;
    
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
            toastQuestionCountDisplay.textContent = count;
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

// Function to show a toast notification
export function showToast(message, isCorrect) {
    if (!settings.get('showToast')) {
        return; // Do not show toast if disabled in settings
    }

    let toast = document.getElementById('session-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'session-toast';
        toast.className = 'session-toast';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<div class="toast-content">${message}</div>`;
    toast.style.backgroundColor = isCorrect ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
    toast.classList.remove('fade-out');
    toast.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.style.display = 'none';
        }, { once: true });
    }, 3000);
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

learnBtn.addEventListener('click', () => {
    loadGameMode('learn');
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

async function loadGameModeFromHistory(mode) {
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
    } else if (mode === 'learn') {
        initLearn();
    }
}

function showMainMenu() {
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
    if (hash && ['char-to-morse', 'morse-to-char', 'sound-to-char', 'learn'].includes(hash)) {
        loadGameModeFromHistory(hash);
    }
});

// Update statistics display on main menu
function updateStatsDisplay() {
    const summary = statistics.getStatsSummary();
    console.log('Updating stats display:', summary);
    let statsElement = document.getElementById('stats-display');
    
    if (!statsElement) {
        statsElement = document.createElement('div');
        statsElement.id = 'stats-display';
        statsElement.className = 'stats-display';
        document.querySelector('.menu-header').appendChild(statsElement);
    }
    
    if (summary.hasStats) {
        statsElement.innerHTML = `
            <p class="stats-summary">
                Overall Accuracy: <strong>${summary.overallAccuracy}%</strong>
            </p>
        `;
    } else {
        statsElement.innerHTML = `
            <p class="stats-summary">${summary.message}</p>
        `;
    }
}

