import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { showToast } from './main.js';

// Global variable to track active keyboard handler
let activeKeyboardHandler = null;

export function initMorseToChar() {
    const morseToChar = {
        morseDisplay: document.querySelector('.morse-display'),
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        skipBtn: document.querySelector('.skip-btn'),
        helpBtn: document.querySelector('.help-btn-corner'),
        currentMorse: '',
        correctCharacter: '',
        keyboardHandler: null
    };

    generatePhoneKeyboard(morseToChar, handleMorseGuess);
    morseToChar.skipBtn.addEventListener('click', () => skipMorse(morseToChar));
    morseToChar.helpBtn.addEventListener('click', () => showMorseAnswer(morseToChar));
    
    // Remove any existing keyboard handler
    if (activeKeyboardHandler) {
        document.removeEventListener('keydown', activeKeyboardHandler);
    }
    
    // Add keyboard event listener for physical keyboard input
    morseToChar.keyboardHandler = (event) => handleKeyboardInput(event, morseToChar);
    document.addEventListener('keydown', morseToChar.keyboardHandler);
    activeKeyboardHandler = morseToChar.keyboardHandler;
    
    nextMorseToChar(morseToChar);

    function handleKeyboardInput(event, morseToChar) {
        // Prevent default behavior for handled keys
        const key = event.key.toUpperCase();
        
        // Handle alphanumeric characters and punctuation
        const validChars = /^[A-Z0-9.,'!/()&:;=+\-_"$@?]$/;
        
        if (validChars.test(key)) {
            event.preventDefault();
            handleMorseGuess(key, morseToChar);
        }
    }

    function showMorseAnswer(morseToChar) {
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = morseToChar.correctCharacter;
        answerDisplay.className = 'answer-reveal';
        
        document.getElementById('morse-to-char').appendChild(answerDisplay);
        
        setTimeout(() => {
            if (answerDisplay.parentNode) {
                answerDisplay.parentNode.removeChild(answerDisplay);
            }
        }, 2000);
    }

    function skipMorse(morseToChar) {
        // Record as a wrong guess for statistics
        statistics.recordAttempt('morse-to-char', morseToChar.correctCharacter, false);
        
        // Show the correct answer
        showAnswerOnSkip(morseToChar);
        
        // Move to next morse after showing answer
        setTimeout(() => {
            nextMorseToChar(morseToChar);
        }, 2000);

        // Check for toast display
        const toastCount = settings.get('toastQuestionCount');
        const showToastSetting = settings.get('showToast');

        if (showToastSetting && toastCount > 0 && statistics.getQuestionCount() % toastCount === 0) {
            const recentAccuracy = statistics.getRecentAccuracy('morse-to-char', toastCount);
            showToast(`Accuracy over last ${toastCount} questions: ${recentAccuracy}%`, recentAccuracy >= 70);
        }
    }

    function showAnswerOnSkip(morseToChar) {
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = morseToChar.correctCharacter;
        answerDisplay.className = 'answer-display-skip';
        
        document.body.appendChild(answerDisplay);
        
        // Remove after 2 seconds
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
        morseToChar.morseDisplay.classList.remove('feedback-incorrect', 'feedback-neutral');
        morseToChar.morseDisplay.classList.add('feedback-correct');
        setTimeout(() => {
            morseToChar.morseDisplay.classList.remove('feedback-correct', 'feedback-incorrect');
            morseToChar.morseDisplay.classList.add('feedback-neutral');
            nextMorseToChar(morseToChar);
        }, 500);
    } else {
        morseToChar.morseDisplay.classList.remove('feedback-correct', 'feedback-neutral');
        morseToChar.morseDisplay.classList.add('feedback-incorrect');
        setTimeout(() => {
            morseToChar.morseDisplay.classList.remove('feedback-correct', 'feedback-incorrect');
            morseToChar.morseDisplay.classList.add('feedback-neutral');
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
