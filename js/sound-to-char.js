import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';
import { PracticeMode, createValidCharsRegex } from './practice-mode-utils.js';

export function initSoundToChar() {
    const practiceMode = new PracticeMode('sound-to-char', 'sound-to-char');

    const soundToChar = {
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        playBtn: document.querySelector('.play-btn'),
        skipBtn: document.querySelector('.skip-btn'),
        soundDisplay: document.querySelector('.sound-display'),
        hintArea: document.querySelector('.hint-area'),
        morsePattern: document.querySelector('.morse-pattern'),
        speedSlider: document.querySelector('#inline-speed-slider'),
        speedValue: document.querySelector('#speed-value'),
        currentMorse: '',
        correctCharacter: ''
    };

    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Ensure AudioContext is running
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        return audioCtx;
    }

    function getTimingFromWPM(wpm) {
        // Standard formula: dot duration = 1200ms / WPM
        // This gives us the correct timing for standard morse code speeds
        const dotDuration = 1200 / wpm;
        return {
            dot: dotDuration,
            dash: dotDuration * 3,
            pause: dotDuration
        };
    }

    function initInlineSpeedControl(soundToChar) {
        // Set initial value from settings
        const currentSpeed = settings.get('morseSpeed');
        soundToChar.speedSlider.value = currentSpeed;
        soundToChar.speedValue.textContent = `${currentSpeed} WPM`;
        
        // Add event listener for speed changes
        soundToChar.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            soundToChar.speedValue.textContent = `${speed} WPM`;
            settings.set('morseSpeed', speed);
            
            // Update the main settings display if it exists
            const mainSpeedDisplay = document.getElementById('speed-display');
            if (mainSpeedDisplay) {
                mainSpeedDisplay.textContent = `${speed} WPM`;
            }
            const mainSpeedSlider = document.getElementById('morse-speed-slider');
            if (mainSpeedSlider) {
                mainSpeedSlider.value = speed;
            }
        });
    }

    function nextSoundToChar(soundToChar) {
        const practiceMode = new PracticeMode('sound-to-char', 'sound-to-char');
        
        soundToChar.correctCharacter = practiceMode.getRandomCharacter();
        soundToChar.currentMorse = morseCode[soundToChar.correctCharacter];
        
        // Clear any previous feedback and hide hint
        clearCharacterFeedback(soundToChar);
        hideMorseHint(soundToChar);
        
        // Set the morse pattern but keep it hidden
        soundToChar.morsePattern.textContent = soundToChar.currentMorse;
        
        // Automatically play sound for the new character
        playSoundAndVibrate(soundToChar.currentMorse);
    }

    function toggleMorseHint(soundToChar) {
        const isVisible = soundToChar.morsePattern.classList.contains('visible');
        
        if (isVisible) {
            hideMorseHint(soundToChar);
        } else {
            showMorseHint(soundToChar);
        }
    }

    function showMorseHint(soundToChar) {
        soundToChar.morsePattern.classList.add('visible');
        soundToChar.hintArea.classList.add('showing-hint');
    }

    function hideMorseHint(soundToChar) {
        soundToChar.morsePattern.classList.remove('visible');
        soundToChar.hintArea.classList.remove('showing-hint');
    }

    function handleSoundGuess(guess, soundToChar) {
        const practiceMode = new PracticeMode('sound-to-char', 'sound-to-char');
        
        // Show the guessed character prominently in the sound display area
        showCharacterFeedback(guess, soundToChar);
        
        const isCorrect = guess === soundToChar.correctCharacter;
        practiceMode.recordAttemptAndCheckToast(soundToChar.correctCharacter, isCorrect);

        if (isCorrect) {
            // Correct guess - clear feedback and move to next character
            setTimeout(() => {
                clearCharacterFeedback(soundToChar);
                nextSoundToChar(soundToChar);
            }, 1500);
        } else {
            // Incorrect guess - just show feedback, don't advance
            setTimeout(() => {
                clearCharacterFeedback(soundToChar);
            }, 1500);
        }
    }

    function showCharacterFeedback(character, soundToChar) {
        let feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
        if (!feedbackDiv) {
            feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'character-feedback';
            soundToChar.soundDisplay.appendChild(feedbackDiv);
        }
        
        feedbackDiv.textContent = character;
        
        // Set class based on correctness
        if (character === soundToChar.correctCharacter) {
            feedbackDiv.className = 'character-feedback correct show';
        } else {
            feedbackDiv.className = 'character-feedback incorrect show';
        }
    }

    function clearCharacterFeedback(soundToChar) {
        const feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.remove('show');
        }
    }


    function skipSound(soundToChar, practiceMode) {
        const answerContent = `${soundToChar.currentMorse} <span class="arrow">→</span> ${soundToChar.correctCharacter}`;
        
        // Custom next function that also clears feedback
        const customNext = (state) => {
            clearCharacterFeedback(state);
            nextSoundToChar(state);
        };
        
        practiceMode.handleSkip(soundToChar.correctCharacter, answerContent, customNext, soundToChar);
    }


    function playSoundAndVibrate(morse) {
        const audioContext = getAudioContext();
        const speed = settings.get('morseSpeed');
        const timing = getTimingFromWPM(speed);

        let time = audioContext.currentTime;
        const vibrationPattern = [];

        morse.split('').forEach(char => {
            if (char === '.') {
                vibrationPattern.push(Math.round(timing.dot));
                const oscillator = audioContext.createOscillator();
                oscillator.frequency.setValueAtTime(440, time);
                oscillator.connect(audioContext.destination);
                oscillator.start(time);
                oscillator.stop(time + timing.dot / 1000);
                time += timing.dot / 1000;
            } else if (char === '-') {
                vibrationPattern.push(Math.round(timing.dash));
                const oscillator = audioContext.createOscillator();
                oscillator.frequency.setValueAtTime(440, time);
                oscillator.connect(audioContext.destination);
                oscillator.start(time);
                oscillator.stop(time + timing.dash / 1000);
                time += timing.dash / 1000;
            }
            vibrationPattern.push(Math.round(timing.pause));
            time += timing.pause / 1000;
        });

        if (navigator.vibrate) {
            navigator.vibrate(vibrationPattern);
        }
    }

    // Initialize inline speed control
    initInlineSpeedControl(soundToChar);

    generatePhoneKeyboard(soundToChar, handleSoundGuess);
    soundToChar.playBtn.addEventListener('click', () => playSoundAndVibrate(soundToChar.currentMorse));
    soundToChar.skipBtn.addEventListener('click', () => skipSound(soundToChar, practiceMode));
    
    // Set up keyboard handler
    practiceMode.setupKeyboardHandler(handleKeyboardInput, soundToChar);
    
    // Add click handler for hint area
    soundToChar.hintArea.addEventListener('click', () => toggleMorseHint(soundToChar));
    
    nextSoundToChar(soundToChar);

    function handleKeyboardInput(event, soundToChar) {
        // Prevent default behavior for handled keys
        const key = event.key.toUpperCase();
        
        // Handle alphanumeric characters and punctuation
        const validChars = createValidCharsRegex();
        
        if (validChars.test(key)) {
            event.preventDefault();
            handleSoundGuess(key, soundToChar);
        }
    }
}
