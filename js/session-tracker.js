// Session Tracker for Practice Modes
// Tracks correct/incorrect answers during a practice session

import { statistics } from './statistics.js';

export class SessionTracker {
    constructor(mode) {
        this.mode = mode;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.sessionStartTime = Date.now();
    }

    // Record a correct answer
    recordCorrect() {
        this.correctAnswers++;
        this.totalQuestions++;
        console.log(`Session progress: ${this.correctAnswers}/${this.totalQuestions} (${this.getCurrentAccuracy()}%)`);
    }

    // Record an incorrect answer
    recordIncorrect() {
        this.totalQuestions++;
        console.log(`Session progress: ${this.correctAnswers}/${this.totalQuestions} (${this.getCurrentAccuracy()}%)`);
    }

    // Get current session accuracy
    getCurrentAccuracy() {
        return this.totalQuestions > 0 ? 
            Math.round((this.correctAnswers / this.totalQuestions) * 1000) / 10 : 0;
    }

    // Check if we have enough questions for a meaningful session (minimum 5)
    hasMinimumQuestions() {
        return this.totalQuestions >= 5;
    }

    // Save session and show results
    completeSession() {
        console.log('Attempting to complete session:', this.mode, this.correctAnswers, this.totalQuestions);
        
        if (!this.hasMinimumQuestions()) {
            console.log('Not enough questions for session:', this.totalQuestions);
            return null; // Don't save sessions with too few questions
        }

        const session = statistics.recordSession(
            this.mode, 
            this.correctAnswers, 
            this.totalQuestions
        );

        console.log('Session recorded:', session);
        this.showSessionResults(session);
        return session;
    }

    // Display session results to user (non-intrusive)
    showSessionResults(session) {
        // Create a subtle notification toast instead of modal
        const toast = document.createElement('div');
        toast.className = 'session-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-text">Accuracy for last ${session.totalQuestions}:</span>
                <span class="toast-accuracy">${session.accuracy}%</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);

        // Allow manual dismissal by clicking
        toast.addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        });
    }
}
