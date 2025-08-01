import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { PracticeMode, createValidCharsRegex } from './practice-mode-utils.js';

export function initMorseToChar() {
    const practiceMode = new PracticeMode('morse-to-char', 'morse-to-char');
    
    const morseToChar = {
        morseDisplay: document.querySelector('.morse-display'),
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        skipBtn: document.querySelector('.skip-btn'),
        currentMorse: '',
        correctCharacter: ''
    };

    generatePhoneKeyboard(morseToChar, handleMorseGuess);
    morseToChar.skipBtn.addEventListener('click', () => skipMorse(morseToChar, practiceMode));
    
    // Set up keyboard handler
    practiceMode.setupKeyboardHandler(handleKeyboardInput, morseToChar);
    
    nextMorseToChar(morseToChar);

    function handleKeyboardInput(event, morseToChar) {
        // Prevent default behavior for handled keys
        const key = event.key.toUpperCase();
        
        // Handle alphanumeric characters and punctuation
        const validChars = createValidCharsRegex();
        
        if (validChars.test(key)) {
            event.preventDefault();
            handleMorseGuess(key, morseToChar);
        }
    }


    function skipMorse(morseToChar, practiceMode) {
        const answerContent = morseToChar.correctCharacter;
        practiceMode.handleSkip(morseToChar.correctCharacter, answerContent, nextMorseToChar, morseToChar);
    }

}

function nextMorseToChar(morseToChar) {
    const practiceMode = new PracticeMode('morse-to-char', 'morse-to-char');
    
    morseToChar.correctCharacter = practiceMode.getRandomCharacter();
    morseToChar.currentMorse = morseCode[morseToChar.correctCharacter];
    morseToChar.morseDisplay.textContent = morseToChar.currentMorse;
}

function handleMorseGuess(guess, morseToChar) {
    const practiceMode = new PracticeMode('morse-to-char', 'morse-to-char');
    const isCorrect = guess === morseToChar.correctCharacter;
    
    practiceMode.recordAttemptAndCheckToast(morseToChar.correctCharacter, isCorrect);

    if (isCorrect) {
        practiceMode.applyFeedback(morseToChar.morseDisplay, 'correct', () => {
            nextMorseToChar(morseToChar);
        });
    } else {
        practiceMode.applyFeedback(morseToChar.morseDisplay, 'incorrect', () => {
            // Reset to neutral state after showing incorrect feedback
        });
    }
}
