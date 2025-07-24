const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

const mainMenu = document.getElementById('main-menu');
const charToMorseMode = document.getElementById('char-to-morse');
const morseToCharMode = document.getElementById('morse-to-char');
const soundToCharMode = document.getElementById('sound-to-char');

const charToMorseBtn = document.getElementById('char-to-morse-btn');
const morseToCharBtn = document.getElementById('morse-to-char-btn');
const soundToCharBtn = document.getElementById('sound-to-char-btn');

charToMorseBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    charToMorseMode.style.display = 'flex';
    startCharToMorse();
});

morseToCharBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    morseToCharMode.style.display = 'flex';
    startMorseToChar();
});

soundToCharBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    soundToCharMode.style.display = 'flex';
    startSoundToChar();
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        mainMenu.style.display = 'block';
        charToMorseMode.style.display = 'none';
        morseToCharMode.style.display = 'none';
        soundToCharMode.style.display = 'none';
    });
});

const charToMorse = {
    characterDisplay: charToMorseMode.querySelector('.character-display'),
    morseInput: charToMorseMode.querySelector('.morse-input'),
    dotBtn: charToMorseMode.querySelector('.dot-btn'),
    dashBtn: charToMorseMode.querySelector('.dash-btn'),
    helpBtn: charToMorseMode.querySelector('.help-btn'),
    punctuationCheckbox: document.getElementById('include-punctuation-checkbox'),
    currentCharacter: '',
    currentUserInput: ''
};

function startCharToMorse() {
    const charToMorseState = {
        characterDisplay: charToMorseMode.querySelector('.character-display'),
        morseInput: charToMorseMode.querySelector('.morse-input'),
        helpBtn: charToMorseMode.querySelector('.help-btn-corner'),
        punctuationCheckbox: document.getElementById('include-punctuation-checkbox'),
        currentCharacter: '',
        currentUserInput: ''
    };

    // Add event listeners
    charToMorse.dotBtn.addEventListener('click', () => handleCharInput('.', charToMorseState));
    charToMorse.dashBtn.addEventListener('click', () => handleCharInput('-', charToMorseState));
    charToMorseState.helpBtn.addEventListener('click', () => showCorrectMorse(charToMorseState));
    charToMorseState.punctuationCheckbox.addEventListener('change', () => nextCharToMorse(charToMorseState));
    
    nextCharToMorse(charToMorseState);
}

function handleCharacterSelect(selectedChar, charToMorseState) {
    // When user clicks a character on the keyboard, set it as the current character
    charToMorseState.currentCharacter = selectedChar;
    charToMorseState.currentUserInput = '';
    charToMorseState.characterDisplay.textContent = selectedChar;
    charToMorseState.morseInput.textContent = '';
    charToMorseState.characterDisplay.style.color = 'white';
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

function startMorseToChar() {
    const morseToChar = {
        morseDisplay: morseToCharMode.querySelector('.morse-display'),
        qwertyKeyboard: morseToCharMode.querySelector('.qwerty-keyboard'),
        helpBtn: morseToCharMode.querySelector('.help-btn-corner'),
        currentMorse: '',
        correctCharacter: '',
        punctuationCheckbox: document.getElementById('morse-to-char-include-punctuation-checkbox')
    };

    generatePhoneKeyboard(morseToChar, handleMorseGuess);
    morseToChar.punctuationCheckbox.addEventListener('change', () => nextMorseToChar(morseToChar));
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
    morseToCharMode.appendChild(answerDisplay);
    
    // Remove the answer display after 2 seconds
    setTimeout(() => {
        if (answerDisplay.parentNode) {
            answerDisplay.parentNode.removeChild(answerDisplay);
        }
    }, 2000);
}

function nextMorseToChar(morseToChar) {
    const includePunctuation = morseToChar.punctuationCheckbox.checked;
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
}

function generatePhoneKeyboard(modeState, guessHandler) {
    const keyboardContainer = modeState.qwertyKeyboard;
    keyboardContainer.innerHTML = '';
    
    // Create keyboard structure
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'phone-keyboard';
    
    // Number row
    const numberRow = document.createElement('div');
    numberRow.className = 'keyboard-row number-row';
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    numbers.forEach(num => {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.className = 'key-btn number-key';
        btn.addEventListener('click', () => guessHandler(num, modeState));
        numberRow.appendChild(btn);
    });
    keyboardDiv.appendChild(numberRow);
    
    // Letter rows (phone-style layout)
    const letterRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    letterRows.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `keyboard-row letter-row row-${index + 1}`;
        
        // Add punctuation toggle button to the beginning of the last row
        if (index === 2) {
            const punctToggle = document.createElement('button');
            punctToggle.textContent = '?!';
            punctToggle.className = 'key-btn punct-toggle-btn';
            punctToggle.id = 'punct-toggle-btn';
            rowDiv.appendChild(punctToggle);
        }
        
        row.forEach(letter => {
            const btn = document.createElement('button');
            btn.textContent = letter;
            btn.className = 'key-btn letter-key';
            btn.addEventListener('click', () => guessHandler(letter, modeState));
            rowDiv.appendChild(btn);
        });
        
        keyboardDiv.appendChild(rowDiv);
    });
    
    // Create punctuation keyboard (initially hidden)
    const punctKeyboard = document.createElement('div');
    punctKeyboard.className = 'punctuation-keyboard';
    punctKeyboard.style.display = 'none';
    
    const punctuationChars = ['.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'];
    punctuationChars.forEach(punct => {
        const btn = document.createElement('button');
        btn.textContent = punct;
        btn.className = 'key-btn punct-key';
        btn.addEventListener('click', () => guessHandler(punct, modeState));
        punctKeyboard.appendChild(btn);
    });
    
    // Add toggle button at the bottom of punctuation keyboard
    const punctBackToggle = document.createElement('button');
    punctBackToggle.textContent = 'ABC';
    punctBackToggle.className = 'key-btn punct-back-toggle';
    punctKeyboard.appendChild(punctBackToggle);
    
    keyboardDiv.appendChild(punctKeyboard);
    
    // Get the punctuation toggle button and add event listener
    const punctToggle = keyboardDiv.querySelector('#punct-toggle-btn');
    
    let showingPunctuation = false;
    
    function toggleKeyboard() {
        showingPunctuation = !showingPunctuation;
        if (showingPunctuation) {
            // Hide main keyboard rows and show punctuation
            numberRow.style.display = 'none';
            keyboardDiv.querySelectorAll('.letter-row').forEach(row => {
                row.style.display = 'none';
            });
            punctKeyboard.style.display = 'flex';
            punctToggle.textContent = 'ABC';
            punctToggle.classList.add('active');
        } else {
            // Show main keyboard rows and hide punctuation
            numberRow.style.display = 'flex';
            keyboardDiv.querySelectorAll('.letter-row').forEach(row => {
                row.style.display = 'flex';
            });
            punctKeyboard.style.display = 'none';
            punctToggle.textContent = '?!';
            punctToggle.classList.remove('active');
        }
    }
    
    punctToggle.addEventListener('click', toggleKeyboard);
    punctBackToggle.addEventListener('click', toggleKeyboard);
    
    keyboardContainer.appendChild(keyboardDiv);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function startSoundToChar() {
    const soundToChar = {
        qwertyKeyboard: soundToCharMode.querySelector('.qwerty-keyboard'),
        playSoundBtn: soundToCharMode.querySelector('.play-sound-btn'),
        currentMorse: '',
        correctCharacter: ''
    };

    generatePhoneKeyboard(soundToChar, handleSoundGuess);
    soundToChar.playSoundBtn.addEventListener('click', () => playSoundAndVibrate(soundToChar.currentMorse));
    nextSoundToChar(soundToChar);
}

function nextSoundToChar(soundToChar) {
    const characters = Object.keys(morseCode);
    soundToChar.correctCharacter = characters[Math.floor(Math.random() * characters.length)];
    soundToChar.currentMorse = morseCode[soundToChar.correctCharacter];
    // Automatically play sound for the new character
    playSoundAndVibrate(soundToChar.currentMorse);
}

function handleSoundGuess(guess, soundToChar) {
    if (guess === soundToChar.correctCharacter) {
        // Correct feedback can be visual or a confirmation sound/vibration
        nextSoundToChar(soundToChar);
    } else {
        // Incorrect feedback
        // Maybe a slight shake animation or a different sound/vibration
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


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service worker registered', reg))
        .catch(err => console.log('Service worker not registered', err));
}