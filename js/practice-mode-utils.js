import { morseCode } from './morse-code.js';
import { settings } from './settings.js';
import { statistics } from './statistics.js';
import { showToast } from './main.js';

// Global variable to track active keyboard handler
let activeKeyboardHandler = null;

/**
 * Shared functionality for all practice modes
 */
export class PracticeMode {
    constructor(modeName, containerId) {
        this.modeName = modeName;
        this.containerId = containerId;
        this.keyboardHandler = null;
    }

    /**
     * Set up keyboard event handler with proper cleanup
     */
    setupKeyboardHandler(handleKeyboardInput, state) {
        // Remove any existing keyboard handler
        if (activeKeyboardHandler) {
            document.removeEventListener('keydown', activeKeyboardHandler);
        }
        
        // Add new keyboard event listener
        this.keyboardHandler = (event) => handleKeyboardInput(event, state);
        document.addEventListener('keydown', this.keyboardHandler);
        activeKeyboardHandler = this.keyboardHandler;
    }

    /**
     * Get a random character based on punctuation setting
     */
    getRandomCharacter() {
        const includePunctuation = settings.get('includePunctuation');
        const characters = Object.keys(morseCode).filter(char => {
            if (includePunctuation) {
                return true;
            }
            return /[a-zA-Z0-9]/.test(char);
        });
        return characters[Math.floor(Math.random() * characters.length)];
    }

    /**
     * Show answer reveal in the mode container
     */
    showAnswerReveal(content, className = 'answer-reveal') {
        const answerDisplay = document.createElement('div');
        answerDisplay.textContent = content;
        answerDisplay.className = className;
        
        document.getElementById(this.containerId).appendChild(answerDisplay);
        
        setTimeout(() => {
            if (answerDisplay.parentNode) {
                answerDisplay.parentNode.removeChild(answerDisplay);
            }
        }, 2000);
    }

    /**
     * Show skip answer overlay on document body
     */
    showSkipAnswer(content) {
        const answerDisplay = document.createElement('div');
        // Check if content contains HTML tags
        if (typeof content === 'string' && content.includes('<')) {
            answerDisplay.innerHTML = content;
        } else {
            answerDisplay.textContent = content;
        }
        answerDisplay.className = 'answer-display-skip';
        
        document.body.appendChild(answerDisplay);
        
        setTimeout(() => {
            if (answerDisplay.parentNode) {
                answerDisplay.parentNode.removeChild(answerDisplay);
            }
        }, 2000);
    }

    /**
     * Check if toast should be shown and show it
     */
    checkAndShowToast() {
        const toastCount = settings.get('toastQuestionCount');
        const showToastSetting = settings.get('showToast');

        if (showToastSetting && toastCount > 0 && statistics.getQuestionCount() % toastCount === 0) {
            const recentAccuracy = statistics.getRecentAccuracy(this.modeName, toastCount);
            showToast(`Accuracy over last ${toastCount} questions: ${recentAccuracy}%`, recentAccuracy >= 70);
        }
    }

    /**
     * Apply visual feedback to an element
     */
    applyFeedback(element, feedbackType, callback = null, delay = 500) {
        element.classList.remove('feedback-correct', 'feedback-incorrect', 'feedback-neutral');
        element.classList.add(`feedback-${feedbackType}`);
        
        if (callback) {
            setTimeout(() => {
                element.classList.remove('feedback-correct', 'feedback-incorrect');
                element.classList.add('feedback-neutral');
                callback();
            }, delay);
        }
    }

    /**
     * Handle skip functionality with statistics and answer display
     */
    handleSkip(correctAnswer, showAnswerContent, nextFunction, state = null) {
        // Record wrong attempt
        statistics.recordAttempt(this.modeName, correctAnswer, false);
        
        // Show the correct answer
        this.showSkipAnswer(showAnswerContent);
        
        // Move to next after showing answer
        setTimeout(() => {
            if (state) {
                nextFunction(state);
            } else {
                nextFunction();
            }
        }, 2000);

        // Check for toast
        this.checkAndShowToast();
    }

    /**
     * Record attempt and check for toast
     */
    recordAttemptAndCheckToast(character, isCorrect) {
        statistics.recordAttempt(this.modeName, character, isCorrect);
        this.checkAndShowToast();
    }
}

/**
 * Utility function to add pressed animation to buttons
 */
export function addPressedAnimation(button) {
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 100);
}

/**
 * Utility function to create character filter regex
 */
export function createValidCharsRegex() {
    return /^[A-Z0-9.,'!/()&:;=+\-_"$@?]$/;
}