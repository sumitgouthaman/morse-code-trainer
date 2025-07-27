import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { showToast } from './main.js';

export function initMorseToChar() {
    const morseToChar = {
        morseDisplay: document.querySelector('.morse-display'),
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        helpBtn: document.querySelector('.help-btn-corner'),
        currentMorse: '',
        correctCharacter: ''
    };

    generatePhoneKeyboard(morseToChar, handleMorseGuess);
    morseToChar.helpBtn.addEventListener('click', () => showMorseAnswer(morseToChar));
    nextMorseToChar(morseToChar);

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
    const isCorrect = guess === morseToChar.correctCharacter;
    statistics.recordAttempt('morse-to-char', morseToChar.correctCharacter, isCorrect);

    if (isCorrect) {
        morseToChar.morseDisplay.style.color = 'lightgreen';
        setTimeout(() => {
            morseToChar.morseDisplay.style.color = 'white';
            nextMorseToChar(morseToChar);
        }, 500);
    } else {
        morseToChar.morseDisplay.style.color = 'salmon';
        setTimeout(() => {
            morseToChar.morseDisplay.style.color = 'white';
        }, 500);
    }

    // Check if a full attempt has been made (either correct or incorrect guess)
    // The toast should be shown periodically based on the global question counter
    const toastCount = settings.get('toastQuestionCount');
    const showToastSetting = settings.get('showToast');

    if (showToastSetting && toastCount > 0 && statistics.getQuestionCount() % toastCount === 0) {
        const recentAccuracy = statistics.getRecentAccuracy('morse-to-char', toastCount);
        showToast(`Accuracy over last ${toastCount} questions: ${recentAccuracy}%`, recentAccuracy >= 70);
    }
}
