import { morseCode } from './morse-code.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { showToast } from './main.js';

export function initCharToMorse() {
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
    charToMorseState.helpBtn.addEventListener('click', () => showCorrectMorse(charToMorseState));
    
    nextCharToMorse(charToMorseState);

    function showCorrectMorse(charToMorseState) {
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = morseCode[charToMorseState.currentCharacter];
        answerDisplay.className = 'answer-reveal';
        
        document.getElementById('char-to-morse').appendChild(answerDisplay);
        
        setTimeout(() => {
            if (answerDisplay.parentNode) {
                answerDisplay.parentNode.removeChild(answerDisplay);
            }
        }, 2000);
    }

    function skipCharacter(charToMorseState) {
        // Record as a wrong guess for statistics
        statistics.recordAttempt('char-to-morse', charToMorseState.currentCharacter, false);
        
        // Show the correct answer
        showAnswerOnSkip(charToMorseState);
        
        // Move to next character after showing answer
        setTimeout(() => {
            nextCharToMorse(charToMorseState);
        }, 2000);
    }

    function showAnswerOnSkip(charToMorseState) {
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = `${charToMorseState.currentCharacter} = ${morseCode[charToMorseState.currentCharacter]}`;
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

function addPressedAnimation(button) {
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 100);
}

function nextCharToMorse(charToMorseState) {
    const includePunctuation = settings.get('includePunctuation');
    const characters = Object.keys(morseCode).filter(char => {
        if (includePunctuation) {
            return true;
        }
        return /[a-zA-Z0-9]/.test(char);
    });

    charToMorseState.currentCharacter = characters[Math.floor(Math.random() * characters.length)];
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
    const correctMorse = morseCode[charToMorseState.currentCharacter];
    if (charToMorseState.currentUserInput === correctMorse) {
        // Correct!
        statistics.recordAttempt('char-to-morse', charToMorseState.currentCharacter, true);
        charToMorseState.characterDisplay.classList.remove('feedback-incorrect', 'feedback-neutral');
        charToMorseState.characterDisplay.classList.add('feedback-correct');
        setTimeout(() => {
            charToMorseState.characterDisplay.classList.remove('feedback-correct', 'feedback-incorrect');
    charToMorseState.characterDisplay.classList.add('feedback-neutral');
            nextCharToMorse(charToMorseState);
        }, 500);
    } else if (!correctMorse.startsWith(charToMorseState.currentUserInput)) {
        // Incorrect
        statistics.recordAttempt('char-to-morse', charToMorseState.currentCharacter, false);
        charToMorseState.characterDisplay.classList.remove('feedback-correct', 'feedback-neutral');
        charToMorseState.characterDisplay.classList.add('feedback-incorrect');
        setTimeout(() => {
            charToMorseState.characterDisplay.classList.remove('feedback-correct', 'feedback-incorrect');
    charToMorseState.characterDisplay.classList.add('feedback-neutral');
            charToMorseState.currentUserInput = '';
            charToMorseState.morseInput.textContent = '';
        }, 500);
    }

    // Check if a full attempt has been made (either correct or incorrect final input)
    if (charToMorseState.currentUserInput === correctMorse || !correctMorse.startsWith(charToMorseState.currentUserInput)) {
        const toastCount = settings.get('toastQuestionCount');
        const showToastSetting = settings.get('showToast');

        if (showToastSetting && toastCount > 0 && statistics.getQuestionCount() % toastCount === 0) {
            const recentAccuracy = statistics.getRecentAccuracy('char-to-morse', toastCount);
            showToast(`Accuracy over last ${toastCount} questions: ${recentAccuracy}%`, recentAccuracy >= 70);
        }
    }
}




