import { morseCode } from './morse-code.js';
import { generatePhoneKeyboard } from './ui.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { showToast } from './main.js';

export function initSoundToChar() {
    const soundToChar = {
        qwertyKeyboard: document.querySelector('.qwerty-keyboard'),
        playBtn: document.querySelector('.play-btn'),
        soundDisplay: document.querySelector('.sound-display'),
        hintArea: document.querySelector('.hint-area'),
        morsePattern: document.querySelector('.morse-pattern'),
        helpBtn: document.querySelector('.help-btn-corner'),
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
        const includePunctuation = settings.get('includePunctuation');
        const characters = Object.keys(morseCode).filter(char => {
            if (includePunctuation) {
                return true;
            }
            return /[a-zA-Z0-9]/.test(char);
        });
        soundToChar.correctCharacter = characters[Math.floor(Math.random() * characters.length)];
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
        // Show the guessed character prominently in the sound display area
        showCharacterFeedback(guess, soundToChar);
        
        const isCorrect = guess === soundToChar.correctCharacter;
        statistics.recordAttempt('sound-to-char', soundToChar.correctCharacter, isCorrect);

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

        // Check if a full attempt has been made (either correct or incorrect guess)
        // The toast should be shown periodically based on the global question counter
        const toastCount = settings.get('toastQuestionCount');
        const showToastSetting = settings.get('showToast');

        if (showToastSetting && toastCount > 0 && statistics.getQuestionCount() % toastCount === 0) {
            const recentAccuracy = statistics.getRecentAccuracy('sound-to-char', toastCount);
            showToast(`Accuracy over last ${toastCount} questions: ${recentAccuracy}%`, recentAccuracy >= 70);
        }
    }

    function showCharacterFeedback(character, soundToChar) {
        // Create or update the feedback display
        let feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
        if (!feedbackDiv) {
            feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'character-feedback';
            soundToChar.soundDisplay.appendChild(feedbackDiv);
        }
        
        feedbackDiv.textContent = character;
        feedbackDiv.style.display = 'block';
        
        // Set color based on correctness
        if (character === soundToChar.correctCharacter) {
            feedbackDiv.style.color = '#4CAF50'; // Green for correct
            feedbackDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            feedbackDiv.style.borderColor = '#4CAF50';
        } else {
            feedbackDiv.style.color = '#f44336'; // Red for incorrect
            feedbackDiv.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            feedbackDiv.style.borderColor = '#f44336';
        }
    }

    function clearCharacterFeedback(soundToChar) {
        const feedbackDiv = soundToChar.soundDisplay.querySelector('.character-feedback');
        if (feedbackDiv) {
            feedbackDiv.style.display = 'none';
        }
    }

    function showCorrectAnswer(soundToChar) {
        // Create a temporary display element to show the answer
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = `${soundToChar.correctCharacter} (${soundToChar.currentMorse})`;
        answerDisplay.className = 'answer-reveal';
        answerDisplay.style.position = 'absolute';
        answerDisplay.style.top = '60px';
        answerDisplay.style.right = '10px';
        answerDisplay.style.fontSize = '24px';
        answerDisplay.style.padding = '10px';
        answerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        answerDisplay.style.borderRadius = '8px';
        answerDisplay.style.zIndex = '20';
        answerDisplay.style.color = '#4CAF50';
        answerDisplay.style.fontWeight = 'bold';
        answerDisplay.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        
        // Add to the sound-to-char container
        document.getElementById('sound-to-char').appendChild(answerDisplay);
        
        // Remove the answer display after 2 seconds
        setTimeout(() => {
            if (answerDisplay.parentNode) {
                answerDisplay.parentNode.removeChild(answerDisplay);
            }
        }, 2000);
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
    soundToChar.helpBtn.addEventListener('click', () => showCorrectAnswer(soundToChar));
    
    // Add click handler for hint area
    soundToChar.hintArea.addEventListener('click', () => toggleMorseHint(soundToChar));
    
    nextSoundToChar(soundToChar);
}
