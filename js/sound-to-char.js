import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function initSoundToChar() {
    const soundToChar = {
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        playSoundBtn: document.querySelector('.play-sound-btn'),
        soundDisplay: document.querySelector('.sound-display'),
        hintArea: document.querySelector('.hint-area'),
        morsePattern: document.querySelector('.morse-pattern'),
        helpBtn: document.querySelector('.help-btn-corner'),
        currentMorse: '',
        correctCharacter: ''
    };

    generatePhoneKeyboard(soundToChar, handleSoundGuess);
    soundToChar.playSoundBtn.addEventListener('click', () => playSoundAndVibrate(soundToChar.currentMorse));
    soundToChar.helpBtn.addEventListener('click', () => showCorrectAnswer(soundToChar));
    
    // Add click handler for hint area
    soundToChar.hintArea.addEventListener('click', () => toggleMorseHint(soundToChar));
    
    nextSoundToChar(soundToChar);
}

function nextSoundToChar(soundToChar) {
    const includePunctuation = settings.get('includePunctuation');
    const characters = Object.keys(morseCode).filter(char => {
        if (includePunctuation) {
            return true;
        }
        return /[a-zA-Z0-9]/.test(char);
    });
    soundToChar.correctCharacter = characters[Math.floor(Math.random() * characters.length)];
    soundToChar.currentMorse = morseCode[soundToChar.correctCharacter];
    
    // Clear any previous feedback and hide hint
    clearCharacterFeedback(soundToChar);
    hideMorseHint(soundToChar);
    
    // Set the morse pattern but keep it hidden
    soundToChar.morsePattern.textContent = soundToChar.currentMorse;
    
    // Automatically play sound for the new character
    playSoundAndVibrate(soundToChar.currentMorse);
}

function toggleMorseHint(soundToChar) {
    const isVisible = soundToChar.morsePattern.classList.contains('visible');
    
    if (isVisible) {
        hideMorseHint(soundToChar);
    } else {
        showMorseHint(soundToChar);
    }
}

function showMorseHint(soundToChar) {
    soundToChar.morsePattern.classList.add('visible');
    soundToChar.hintArea.classList.add('showing-hint');
}

function hideMorseHint(soundToChar) {
    soundToChar.morsePattern.classList.remove('visible');
    soundToChar.hintArea.classList.remove('showing-hint');
}

function handleSoundGuess(guess, soundToChar) {
    // Show the guessed character prominently in the sound display area
    showCharacterFeedback(guess, soundToChar);
    
    if (guess === soundToChar.correctCharacter) {
        // Correct guess - clear feedback and move to next character
        setTimeout(() => {
            clearCharacterFeedback(soundToChar);
            nextSoundToChar(soundToChar);
        }, 1500);
    } else {
        // Incorrect guess - just show feedback, don't advance
        setTimeout(() => {
            clearCharacterFeedback(soundToChar);
        }, 1500);
    }
}

function showCharacterFeedback(character, soundToChar) {
    // Create or update the feedback display
    let feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
    if (!feedbackDiv) {
        feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'character-feedback';
        soundToChar.soundDisplay.appendChild(feedbackDiv);
    }
    
    feedbackDiv.textContent = character;
    feedbackDiv.style.display = 'block';
    
    // Set color based on correctness
    if (character === soundToChar.correctCharacter) {
        feedbackDiv.style.color = '#4CAF50'; // Green for correct
        feedbackDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        feedbackDiv.style.borderColor = '#4CAF50';
    } else {
        feedbackDiv.style.color = '#f44336'; // Red for incorrect
        feedbackDiv.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        feedbackDiv.style.borderColor = '#f44336';
    }
}

function clearCharacterFeedback(soundToChar) {
    const feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
    if (feedbackDiv) {
        feedbackDiv.style.display = 'none';
    }
}

function showCorrectAnswer(soundToChar) {
    // Create a temporary display element to show the answer
    const answerDisplay = document.createElement('div');
    answerDisplay.textContent = `${soundToChar.correctCharacter} (${soundToChar.currentMorse})`;
    answerDisplay.className = 'answer-reveal';
    answerDisplay.style.position = 'absolute';
    answerDisplay.style.top = '60px';
    answerDisplay.style.right = '10px';
    answerDisplay.style.fontSize = '24px';
    answerDisplay.style.padding = '10px';
    answerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    answerDisplay.style.borderRadius = '8px';
    answerDisplay.style.zIndex = '20';
    answerDisplay.style.color = '#4CAF50';
    answerDisplay.style.fontWeight = 'bold';
    answerDisplay.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    
    // Add to the sound-to-char container
    document.getElementById('sound-to-char').appendChild(answerDisplay);
    
    // Remove the answer display after 2 seconds
    setTimeout(() => {
        if (answerDisplay.parentNode) {
            answerDisplay.parentNode.removeChild(answerDisplay);
        }
    }, 2000);
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