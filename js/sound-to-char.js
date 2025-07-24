import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function initSoundToChar() {
    const soundToChar = {
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        playSoundBtn: document.querySelector('.play-sound-btn'),
        punctuationCheckbox: document.getElementById('sound-to-char-include-punctuation-checkbox'),
        currentMorse: '',
        correctCharacter: ''
    };

    generatePhoneKeyboard(soundToChar, handleSoundGuess);
    soundToChar.playSoundBtn.addEventListener('click', () => playSoundAndVibrate(soundToChar.currentMorse));
    soundToChar.punctuationCheckbox.addEventListener('change', () => nextSoundToChar(soundToChar));
    nextSoundToChar(soundToChar);
}

function nextSoundToChar(soundToChar) {
    const includePunctuation = soundToChar.punctuationCheckbox.checked;
    const characters = Object.keys(morseCode).filter(char => {
        if (includePunctuation) {
            return true;
        }
        return /[a-zA-Z0-9]/.test(char);
    });
    soundToChar.correctCharacter = characters[Math.floor(Math.random() * characters.length)];
    soundToChar.currentMorse = morseCode[soundToChar.correctCharacter];
    // Automatically play sound for the new character
    playSoundAndVibrate(soundToChar.currentMorse);
}

function handleSoundGuess(guess, soundToChar) {
    const playSoundBtn = soundToChar.playSoundBtn;
    if (guess === soundToChar.correctCharacter) {
        playSoundBtn.style.backgroundColor = 'lightgreen';
        setTimeout(() => {
            playSoundBtn.style.backgroundColor = '';
            nextSoundToChar(soundToChar);
        }, 500);
    } else {
        playSoundBtn.style.backgroundColor = 'salmon';
        setTimeout(() => {
            playSoundBtn.style.backgroundColor = '';
        }, 500);
    }
}

function playSoundAndVibrate(morse) {
    const dotDuration = 100;
    const dashDuration = dotDuration * 3;
    const pauseDuration = dotDuration;

    let time = audioCtx.currentTime;
    const vibrationPattern = [];

    morse.split('').forEach(char => {
        if (char === '.') {
            vibrationPattern.push(dotDuration);
            const oscillator = audioCtx.createOscillator();
            oscillator.frequency.setValueAtTime(440, time);
            oscillator.connect(audioCtx.destination);
            oscillator.start(time);
            oscillator.stop(time + dotDuration / 1000);
            time += dotDuration / 1000;
        } else if (char === '-') {
            vibrationPattern.push(dashDuration);
            const oscillator = audioCtx.createOscillator();
            oscillator.frequency.setValueAtTime(440, time);
            oscillator.connect(audioCtx.destination);
            oscillator.start(time);
            oscillator.stop(time + dashDuration / 1000);
            time += dashDuration / 1000;
        }
        vibrationPattern.push(pauseDuration);
        time += pauseDuration / 1000;
    });

    if (navigator.vibrate) {
        navigator.vibrate(vibrationPattern);
    }
}