import { morseCode } from './morse-code.js';
import { PracticeMode, addPressedAnimation } from './practice-mode-utils.js';
import { SpacebarPaddle } from './spacebar-paddle.js';
import { settings } from './settings.js';

export function initCharToMorse() {
    const practiceMode = new PracticeMode('char-to-morse', 'char-to-morse');
    
    const charToMorseState = {
        characterDisplay: document.querySelector('.character-display'),
        morseInput: document.querySelector('.morse-input'),
        dotBtn: document.querySelector('.dot-btn'),
        dashBtn: document.querySelector('.dash-btn'),
        skipBtn: document.querySelector('.skip-btn'),
        currentCharacter: '',
        currentUserInput: '',
        paddle: null
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
    
    // Set up keyboard handler
    practiceMode.setupKeyboardHandler(handleKeyboardInput, charToMorseState);
    
    // Initialize spacebar paddle
    initSpacebarPaddle(charToMorseState);
    
    // Initialize paddle toggle
    initPaddleToggle(charToMorseState);
    
    nextCharToMorse(charToMorseState);

    function handleKeyboardInput(event, charToMorseState) {
        // Skip spacebar if paddle is enabled (let paddle handle it)
        if (event.code === 'Space' && charToMorseState.paddle && charToMorseState.paddle.enabled) {
            return;
        }
        
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

    function initSpacebarPaddle(charToMorseState) {
        // Create paddle instance with inline mode
        charToMorseState.paddle = new SpacebarPaddle({
            useInlineMode: true,
            inlineContainer: document.getElementById('paddle-interface'),
            inlineTimingBar: document.getElementById('inline-timing-bar'),
            onInput: (symbol) => {
                // Animate corresponding button for visual feedback if buttons are visible
                const buttonControls = document.getElementById('button-controls');
                if (buttonControls && buttonControls.style.display !== 'none') {
                    if (symbol === '.') {
                        addPressedAnimation(charToMorseState.dotBtn);
                    } else if (symbol === '-') {
                        addPressedAnimation(charToMorseState.dashBtn);
                    }
                }
                
                handleCharInput(symbol, charToMorseState);
            },
            onPressStart: () => {
                // Optional: Add visual feedback for press start
            },
            onPressEnd: () => {
                // Optional: Add feedback for press end
            },
            onInvalidTiming: () => {
                // Brief visual feedback for invalid timing
                if (charToMorseState.characterDisplay) {
                    charToMorseState.characterDisplay.style.borderColor = '#f44336';
                    setTimeout(() => {
                        charToMorseState.characterDisplay.style.borderColor = '';
                    }, 200);
                }
            }
        });
        
        // Configure timing based on settings
        updatePaddleTiming(charToMorseState.paddle);
        
        // Enable/disable based on settings
        if (settings.get('spacebarPaddleEnabled')) {
            charToMorseState.paddle.enable();
        }
    }

    function updatePaddleTiming(paddle) {
        const paddleTiming = settings.get('spacebarPaddleTiming');
        
        if (paddleTiming.useWPMTiming) {
            // Use WPM-based timing
            const wpm = paddleTiming.customWPM || settings.get('morseSpeed');
            paddle.setTimingFromWPM(wpm);
        } else {
            // Use custom timing values
            paddle.updateTiming({
                dotThreshold: paddleTiming.dotThreshold,
                dashThreshold: paddleTiming.dashThreshold,
                tolerance: paddleTiming.tolerance
            });
        }
    }

    function initPaddleToggle(charToMorseState) {
        const toggleSwitch = document.getElementById('paddle-toggle');
        const paddleInterface = document.getElementById('paddle-interface');
        const dotBtn = document.getElementById('dot-btn-original');
        const dashBtn = document.getElementById('dash-btn-original');
        
        if (!toggleSwitch) return;
        
        // Initialize speed control
        initPaddleSpeedControl(charToMorseState);
        
        // Set initial state
        const isEnabled = settings.get('spacebarPaddleEnabled');
        updateUIMode(isEnabled);
        
        // Add click handler for toggle
        toggleSwitch.addEventListener('click', () => {
            const currentlyEnabled = settings.get('spacebarPaddleEnabled');
            const newState = !currentlyEnabled;
            
            // Update settings
            settings.set('spacebarPaddleEnabled', newState);
            
            // Update UI mode
            updateUIMode(newState);
            
            // Update paddle state
            if (newState) {
                charToMorseState.paddle.enable();
            } else {
                charToMorseState.paddle.disable();
            }
        });
        
        function updateUIMode(paddleEnabled) {
            if (paddleEnabled) {
                // Show paddle mode - hide only dot/dash buttons, keep skip button
                toggleSwitch.classList.add('enabled');
                if (dotBtn) dotBtn.style.display = 'none';
                if (dashBtn) dashBtn.style.display = 'none';
                if (paddleInterface) paddleInterface.style.display = 'block';
            } else {
                // Show button mode - show all buttons
                toggleSwitch.classList.remove('enabled');
                if (dotBtn) dotBtn.style.display = '';
                if (dashBtn) dashBtn.style.display = '';
                if (paddleInterface) paddleInterface.style.display = 'none';
            }
        }
    }

    function initPaddleSpeedControl(charToMorseState) {
        const speedSlider = document.getElementById('paddle-speed-slider');
        const speedValue = document.getElementById('paddle-speed-value');
        const dotZone = document.getElementById('dot-zone');
        const dashZone = document.getElementById('dash-zone');
        
        if (!speedSlider || !speedValue) return;
        
        // Get current paddle speed setting
        const paddleTiming = settings.get('spacebarPaddleTiming');
        const currentSpeed = paddleTiming.useWPMTiming ? 
            (paddleTiming.customWPM || settings.get('morseSpeed')) : 
            12; // fallback
        
        // Set initial values
        speedSlider.value = currentSpeed;
        speedValue.textContent = `${currentSpeed} WPM`;
        updateTimingGuides(currentSpeed);
        
        // Add event listener for speed changes
        speedSlider.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            speedValue.textContent = `${newSpeed} WPM`;
            
            // Update settings
            const currentPaddleTiming = settings.get('spacebarPaddleTiming');
            settings.set('spacebarPaddleTiming', {
                ...currentPaddleTiming,
                customWPM: newSpeed,
                useWPMTiming: true
            });
            
            // Update paddle timing
            if (charToMorseState.paddle) {
                charToMorseState.paddle.setTimingFromWPM(newSpeed);
            }
            
            // Update timing guides
            updateTimingGuides(newSpeed);
        });
        
        function updateTimingGuides(wpm) {
            // Calculate timing based on WPM (matches sound-to-char formula)
            const baseDotDuration = 1200 / wpm; // Standard morse timing formula
            const dotDuration = Math.round(baseDotDuration * 1.2); // Slightly longer than audio
            const dashDuration = Math.round(baseDotDuration * 3 * 1.2); // Standard 3:1 ratio, slightly longer than audio
            
            // Safely update timing guides only if elements exist
            if (dotZone) {
                dotZone.textContent = `DOT (<${dotDuration}ms)`;
            }
            if (dashZone) {
                dashZone.textContent = `DASH (${Math.round(dotDuration * 0.8)}-${dashDuration}ms)`;
            }
        }
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




