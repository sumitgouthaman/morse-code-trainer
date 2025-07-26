import { initCharToMorse } from './char-to-morse.js';
import { initMorseToChar } from './morse-to-char.js';
import { initSoundToChar } from './sound-to-char.js';
import { initLearn } from './learn.js';
import { settings } from './settings.js';

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

// Initialize settings UI
function initializeSettings() {
    // Set checkbox state from saved settings
    globalIncludePunctuationCheckbox.checked = settings.get('includePunctuation');
    
    // Set speed slider and display from saved settings
    const savedSpeed = settings.get('morseSpeed');
    morseSpeedSlider.value = savedSpeed;
    speedDisplay.textContent = `${savedSpeed} WPM`;
    
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
}

// Initialize based on URL hash on page load
window.addEventListener('load', () => {
    initializeSettings();
    const hash = window.location.hash.substring(1);
    if (hash && ['char-to-morse', 'morse-to-char', 'sound-to-char', 'learn'].includes(hash)) {
        loadGameModeFromHistory(hash);
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service worker registered', reg))
        .catch(err => console.log('Service worker not registered', err));
}