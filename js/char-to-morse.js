import { morseCode } from './morse-code.js';

export function initCharToMorse() {
    const charToMorseState = {
        characterDisplay: document.querySelector('.character-display'),
        morseInput: document.querySelector('.morse-input'),
        dotBtn: document.querySelector('.dot-btn'),
        dashBtn: document.querySelector('.dash-btn'),
        helpBtn: document.querySelector('.help-btn-corner'),
        punctuationCheckbox: document.getElementById('include-punctuation-checkbox'),
        currentCharacter: '',
        currentUserInput: ''
    };

    charToMorseState.dotBtn.addEventListener('click', () => handleCharInput('.', charToMorseState));
    charToMorseState.dashBtn.addEventListener('click', () => handleCharInput('-', charToMorseState));
    charToMorseState.helpBtn.addEventListener('click', () => showCorrectMorse(charToMorseState));
    charToMorseState.punctuationCheckbox.addEventListener('change', () => nextCharToMorse(charToMorseState));
    
    nextCharToMorse(charToMorseState);
}

function nextCharToMorse(charToMorseState) {
    const includePunctuation = charToMorseState.punctuationCheckbox.checked;
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
        charToMorseState.characterDisplay.style.color = 'lightgreen';
        setTimeout(() => {
            charToMorseState.characterDisplay.style.color = 'white';
            nextCharToMorse(charToMorseState);
        }, 500);
    } else if (!correctMorse.startsWith(charToMorseState.currentUserInput)) {
        // Incorrect
        charToMorseState.characterDisplay.style.color = 'salmon';
        setTimeout(() => {
            charToMorseState.characterDisplay.style.color = 'white';
            charToMorseState.currentUserInput = '';
            charToMorseState.morseInput.textContent = '';
        }, 500);
    }
}

function showCorrectMorse(charToMorseState) {
    charToMorseState.morseInput.textContent = morseCode[charToMorseState.currentCharacter];
    setTimeout(() => nextCharToMorse(charToMorseState), 1000);
}