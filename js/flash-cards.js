import { morseCode } from './morse-code.js';
import { settings } from './settings.js';

let flashCardsState = {
    characters: [],
    currentIndex: 0,
    isRevealed: false,
    mode: 'char-to-morse'
};

export function initFlashCards() {
    const setupSection = document.getElementById('flash-cards-setup');
    const practiceSection = document.getElementById('flash-cards-practice');
    const startBtn = document.getElementById('start-flash-cards');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Mode selection radio buttons
    const charToMorseMode = document.getElementById('char-to-morse-mode');
    const morseToCharMode = document.getElementById('morse-to-char-mode');
    
    // Character selection checkboxes
    const includeAlphabet = document.getElementById('include-alphabet');
    const includeDigits = document.getElementById('include-digits');
    const includePunctuation = document.getElementById('include-punctuation');
    
    // Load saved settings
    loadFlashCardSettings();
    
    // Setup event listeners
    startBtn.addEventListener('click', startFlashCards);
    nextBtn.addEventListener('click', nextCard);
    restartBtn.addEventListener('click', restartFlashCards);
    
    // Settings change listeners
    charToMorseMode.addEventListener('change', saveFlashCardSettings);
    morseToCharMode.addEventListener('change', saveFlashCardSettings);
    includeAlphabet.addEventListener('change', saveFlashCardSettings);
    includeDigits.addEventListener('change', saveFlashCardSettings);
    includePunctuation.addEventListener('change', saveFlashCardSettings);
    
    // Card click to flip
    const flashCard = document.getElementById('flash-card');
    flashCard.addEventListener('click', flipCard);
    
    function loadFlashCardSettings() {
        // Load mode setting
        const savedMode = settings.get('flashCardMode') || 'char-to-morse';
        if (savedMode === 'morse-to-char') {
            morseToCharMode.checked = true;
        } else {
            charToMorseMode.checked = true;
        }
        
        // Load character selection settings
        includeAlphabet.checked = settings.get('flashCardIncludeAlphabet') !== false; // default true
        includeDigits.checked = settings.get('flashCardIncludeDigits') || false; // default false
        includePunctuation.checked = settings.get('flashCardIncludePunctuation') || false; // default false
    }
    
    function saveFlashCardSettings() {
        // Save mode setting
        const selectedMode = charToMorseMode.checked ? 'char-to-morse' : 'morse-to-char';
        settings.set('flashCardMode', selectedMode);
        
        // Save character selection settings
        settings.set('flashCardIncludeAlphabet', includeAlphabet.checked);
        settings.set('flashCardIncludeDigits', includeDigits.checked);
        settings.set('flashCardIncludePunctuation', includePunctuation.checked);
    }
    
    function getSelectedCharacters() {
        let characters = [];
        
        if (includeAlphabet.checked) {
            characters.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
        }
        
        if (includeDigits.checked) {
            characters.push(...'0123456789'.split(''));
        }
        
        if (includePunctuation.checked) {
            const punctuationChars = Object.keys(morseCode).filter(char => 
                !/[A-Z0-9]/.test(char)
            );
            characters.push(...punctuationChars);
        }
        
        return characters;
    }
    
    function startFlashCards() {
        const selectedChars = getSelectedCharacters();
        
        if (selectedChars.length === 0) {
            alert('Please select at least one character type.');
            return;
        }
        
        // Get selected mode
        const selectedMode = charToMorseMode.checked ? 'char-to-morse' : 'morse-to-char';
        
        // Shuffle the characters
        flashCardsState.characters = selectedChars.sort(() => Math.random() - 0.5);
        flashCardsState.currentIndex = 0;
        flashCardsState.isRevealed = false;
        flashCardsState.mode = selectedMode;
        
        // Hide setup, show practice
        setupSection.style.display = 'none';
        practiceSection.style.display = 'block';
        
        // Update progress display
        document.getElementById('total-cards').textContent = flashCardsState.characters.length;
        
        showCurrentCard();
    }
    
    function showCurrentCard() {
        const currentChar = flashCardsState.characters[flashCardsState.currentIndex];
        const currentCardSpan = document.getElementById('current-card');
        const characterDisplay = document.getElementById('character-display');
        const characterSmall = document.getElementById('character-small');
        const morseDisplay = document.getElementById('morse-display');
        const flashCardFront = document.getElementById('flash-card-front');
        const flashCardBack = document.getElementById('flash-card-back');
        const progressFill = document.getElementById('progress-fill');
        
        // Update progress
        currentCardSpan.textContent = flashCardsState.currentIndex + 1;
        const progressPercent = ((flashCardsState.currentIndex + 1) / flashCardsState.characters.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        // Convert morse to display format (replace . with • and - with −)
        const morseForChar = morseCode[currentChar];
        const displayMorse = morseForChar.replace(/\./g, '•').replace(/-/g, '−');
        
        // Set content based on mode
        if (flashCardsState.mode === 'char-to-morse') {
            // Character → Morse mode: show character first, morse on back
            characterDisplay.textContent = currentChar;
            characterDisplay.classList.remove('morse-front');
            characterSmall.textContent = currentChar;
            characterSmall.classList.remove('morse-front');
            morseDisplay.textContent = displayMorse;
        } else {
            // Morse → Character mode: show morse first, character on back
            characterDisplay.textContent = displayMorse;
            characterDisplay.classList.add('morse-front');
            characterSmall.textContent = displayMorse;
            characterSmall.classList.add('morse-front');
            morseDisplay.textContent = currentChar;
        }
        
        // Reset card state
        flashCardFront.style.display = 'block';
        flashCardBack.style.display = 'none';
        flashCardsState.isRevealed = false;
        
        // Show appropriate buttons
        if (flashCardsState.currentIndex === flashCardsState.characters.length - 1) {
            nextBtn.style.display = 'none';
            restartBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            restartBtn.style.display = 'none';
        }
    }
    
    function flipCard() {
        const flashCardFront = document.getElementById('flash-card-front');
        const flashCardBack = document.getElementById('flash-card-back');
        
        if (flashCardsState.isRevealed) {
            // Flip back to character (front)
            flashCardFront.style.display = 'block';
            flashCardBack.style.display = 'none';
            flashCardsState.isRevealed = false;
        } else {
            // Flip to morse code (back)
            flashCardFront.style.display = 'none';
            flashCardBack.style.display = 'block';
            flashCardsState.isRevealed = true;
        }
    }
    
    function nextCard() {
        if (flashCardsState.currentIndex < flashCardsState.characters.length - 1) {
            flashCardsState.currentIndex++;
            showCurrentCard();
        }
    }
    
    function restartFlashCards() {
        // Return to setup
        setupSection.style.display = 'block';
        practiceSection.style.display = 'none';
        
        // Reset state
        flashCardsState = {
            characters: [],
            currentIndex: 0,
            isRevealed: false
        };
    }
    
}