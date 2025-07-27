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
    charToMorseState.helpBtn.addEventListener('click', () => showCorrectMorse(charToMorseState));
    
    nextCharToMorse(charToMorseState);

    function showCorrectMorse(charToMorseState) {
        // Create a temporary display element to show the answer
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = morseCode[charToMorseState.currentCharacter];
        answerDisplay.className = 'answer-reveal';
        answerDisplay.style.position = 'absolute';
        answerDisplay.style.top = '60px';
        answerDisplay.style.right = '10px';
        answerDisplay.style.fontSize = '24px';
        answerDisplay.style.padding = '10px';
        answerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        answerDisplay.style.borderRadius = '8px';
        answerDisplay.style.zIndex = '20';
        
        // Add to the char-to-morse container
        document.getElementById('char-to-morse').appendChild(answerDisplay);
        
        // Remove the answer display after 2 seconds
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
    charToMorseState.characterDisplay.style.color = 'white';
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
        charToMorseState.characterDisplay.style.color = 'lightgreen';
        setTimeout(() => {
            charToMorseState.characterDisplay.style.color = 'white';
            nextCharToMorse(charToMorseState);
        }, 500);
    } else if (!correctMorse.startsWith(charToMorseState.currentUserInput)) {
        // Incorrect
        statistics.recordAttempt('char-to-morse', charToMorseState.currentCharacter, false);
        charToMorseState.characterDisplay.style.color = 'salmon';
        setTimeout(() => {
            charToMorseState.characterDisplay.style.color = 'white';
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




