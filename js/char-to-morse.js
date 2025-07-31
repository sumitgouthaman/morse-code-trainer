import { morseCode } from './morse-code.js';
import { PracticeMode, addPressedAnimation } from './practice-mode-utils.js';

export function initCharToMorse() {
    const practiceMode = new PracticeMode('char-to-morse', 'char-to-morse');
    
    const charToMorseState = {
        characterDisplay: document.querySelector('.character-display'),
        morseInput: document.querySelector('.morse-input'),
        dotBtn: document.querySelector('.dot-btn'),
        dashBtn: document.querySelector('.dash-btn'),
        skipBtn: document.querySelector('.skip-btn'),
        helpBtn: document.querySelector('.help-btn-corner'),
        currentCharacter: '',
        currentUserInput: ''
    };

    charToMorseState.dotBtn.addEventListener('click', () => {
        addPressedAnimation(charToMorseState.dotBtn);
        handleCharInput('.', charToMorseState);
    });
    charToMorseState.dashBtn.addEventListener('click', () => {
        addPressedAnimation(charToMorseState.dashBtn);
        handleCharInput('-', charToMorseState);
    });
    charToMorseState.skipBtn.addEventListener('click', () => {
        addPressedAnimation(charToMorseState.skipBtn);
        skipCharacter(charToMorseState);
    });
    charToMorseState.helpBtn.addEventListener('click', () => showCorrectMorse(charToMorseState, practiceMode));
    
    // Set up keyboard handler
    practiceMode.setupKeyboardHandler(handleKeyboardInput, charToMorseState);
    
    nextCharToMorse(charToMorseState);

    function handleKeyboardInput(event, charToMorseState) {
        // Handle dot and dash key presses
        if (event.key === '.') {
            event.preventDefault();
            addPressedAnimation(charToMorseState.dotBtn);
            handleCharInput('.', charToMorseState);
        } else if (event.key === '-') {
            event.preventDefault();
            addPressedAnimation(charToMorseState.dashBtn);
            handleCharInput('-', charToMorseState);
        }
    }

    function showCorrectMorse(charToMorseState, practiceMode) {
        practiceMode.showAnswerReveal(morseCode[charToMorseState.currentCharacter]);
    }

    function skipCharacter(charToMorseState) {
        const answerContent = morseCode[charToMorseState.currentCharacter];
        practiceMode.handleSkip(charToMorseState.currentCharacter, answerContent, nextCharToMorse, charToMorseState);
    }

}


function nextCharToMorse(charToMorseState) {
    const practiceMode = new PracticeMode('char-to-morse', 'char-to-morse');
    
    charToMorseState.currentCharacter = practiceMode.getRandomCharacter();
    charToMorseState.currentUserInput = '';
    charToMorseState.characterDisplay.textContent = charToMorseState.currentCharacter;
    charToMorseState.morseInput.textContent = '';
    charToMorseState.characterDisplay.classList.remove('feedback-correct', 'feedback-incorrect');
    charToMorseState.characterDisplay.classList.add('feedback-neutral');
}

function handleCharInput(input, charToMorseState) {
    charToMorseState.currentUserInput += input;
    charToMorseState.morseInput.textContent = charToMorseState.currentUserInput;
    checkCharToMorse(charToMorseState);
}

function checkCharToMorse(charToMorseState) {
    const practiceMode = new PracticeMode('char-to-morse', 'char-to-morse');
    const correctMorse = morseCode[charToMorseState.currentCharacter];
    
    if (charToMorseState.currentUserInput === correctMorse) {
        // Correct!
        practiceMode.recordAttemptAndCheckToast(charToMorseState.currentCharacter, true);
        practiceMode.applyFeedback(charToMorseState.characterDisplay, 'correct', () => {
            nextCharToMorse(charToMorseState);
        });
    } else if (!correctMorse.startsWith(charToMorseState.currentUserInput)) {
        // Incorrect
        practiceMode.recordAttemptAndCheckToast(charToMorseState.currentCharacter, false);
        practiceMode.applyFeedback(charToMorseState.characterDisplay, 'incorrect', () => {
            charToMorseState.currentUserInput = '';
            charToMorseState.morseInput.textContent = '';
        });
    }
}




