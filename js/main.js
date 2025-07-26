import { initCharToMorse } from './char-to-morse.js';
import { initMorseToChar } from './morse-to-char.js';
import { initSoundToChar } from './sound-to-char.js';
import { initLearn } from './learn.js';

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');

const charToMorseBtn = document.getElementById('char-to-morse-btn');
const morseToCharBtn = document.getElementById('morse-to-char-btn');
const soundToCharBtn = document.getElementById('sound-to-char-btn');
const learnBtn = document.getElementById('learn-btn');

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