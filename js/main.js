import { initCharToMorse } from './char-to-morse.js';
import { initMorseToChar } from './morse-to-char.js';
import { initSoundToChar } from './sound-to-char.js';

const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');

const charToMorseBtn = document.getElementById('char-to-morse-btn');
const morseToCharBtn = document.getElementById('morse-to-char-btn');
const soundToCharBtn = document.getElementById('sound-to-char-btn');

charToMorseBtn.addEventListener('click', () => {
    loadGameMode('char-to-morse');
});

morseToCharBtn.addEventListener('click', () => {
    loadGameMode('morse-to-char');
});

soundToCharBtn.addEventListener('click', () => {
    loadGameMode('sound-to-char');
});

async function loadGameMode(mode) {
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
    }

    const backBtn = gameContainer.querySelector('.back-btn');
    backBtn.addEventListener('click', () => {
        mainMenu.style.display = 'block';
        gameContainer.style.display = 'none';
        gameContainer.innerHTML = '';
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service worker registered', reg))
        .catch(err => console.log('Service worker not registered', err));
}