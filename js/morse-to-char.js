import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';
import { SessionTracker } from './session-tracker.js';

export function initMorseToChar() {
    const morseToChar = {
        morseDisplay: document.querySelector('.morse-display'),
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        helpBtn: document.querySelector('.help-btn-corner'),
        currentMorse: '',
        correctCharacter: '',
        sessionTracker: new SessionTracker('morse-to-char')
    };

    generatePhoneKeyboard(morseToChar, handleMorseGuess);
    morseToChar.helpBtn.addEventListener('click', () => showMorseAnswer(morseToChar));
    nextMorseToChar(morseToChar);
}

function showMorseAnswer(morseToChar) {
    // Create a temporary display element to show the answer
    const answerDisplay = document.createElement('div');
    answerDisplay.textContent = morseToChar.correctCharacter;
    answerDisplay.className = 'answer-reveal';
    answerDisplay.style.position = 'absolute';
    answerDisplay.style.top = '60px';
    answerDisplay.style.right = '10px';
    answerDisplay.style.fontSize = '24px';
    answerDisplay.style.padding = '10px';
    answerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    answerDisplay.style.borderRadius = '8px';
    answerDisplay.style.zIndex = '20';
    
    // Add to the morse-to-char container
    document.getElementById('morse-to-char').appendChild(answerDisplay);
    
    // Remove the answer display after 2 seconds
    setTimeout(() => {
        if (answerDisplay.parentNode) {
            answerDisplay.parentNode.removeChild(answerDisplay);
        }
    }, 2000);
}

function nextMorseToChar(morseToChar) {
    const includePunctuation = settings.get('includePunctuation');
    const characters = Object.keys(morseCode).filter(char => {
        if (includePunctuation) {
            return true;
        }
        return /[a-zA-Z0-9]/.test(char);
    });
    morseToChar.correctCharacter = characters[Math.floor(Math.random() * characters.length)];
    morseToChar.currentMorse = morseCode[morseToChar.correctCharacter];
    morseToChar.morseDisplay.textContent = morseToChar.currentMorse;
}

function handleMorseGuess(guess, morseToChar) {
    if (guess === morseToChar.correctCharacter) {
        morseToChar.sessionTracker.recordCorrect();
        morseToChar.morseDisplay.style.color = 'lightgreen';
        setTimeout(() => {
            morseToChar.morseDisplay.style.color = 'white';
            nextMorseToChar(morseToChar);
        }, 500);
    } else {
        morseToChar.sessionTracker.recordIncorrect();
        morseToChar.morseDisplay.style.color = 'salmon';
        setTimeout(() => {
            morseToChar.morseDisplay.style.color = 'white';
        }, 500);
    }
    
    // Show session results after configured number of questions
    if (morseToChar.sessionTracker.totalQuestions >= settings.get('sessionLength')) {
        setTimeout(() => {
            morseToChar.sessionTracker.completeSession();
            // Reset tracker for next session
            morseToChar.sessionTracker = new SessionTracker('morse-to-char');
        }, 1000);
    }
}