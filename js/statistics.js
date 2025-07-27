// Statistics Manager for Morse Code Trainer V0
// Handles session tracking and basic accuracy calculations

const STORAGE_KEY = 'morse_trainer_stats';

class StatisticsManager {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load statistics data:', error);
        }
        
        // Default structure
        return {
            sessions: []
        };
    }

    saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save statistics data:', error);
        }
    }

    // Record a new practice session
    recordSession(mode, correctAnswers, totalQuestions) {
        console.log('Recording session:', mode, correctAnswers, totalQuestions);
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        const session = {
            mode: mode,
            timestamp: Date.now(),
            accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers
        };

        this.data.sessions.push(session);
        console.log('Session added, total sessions:', this.data.sessions.length);
        this.saveData();
        
        return session;
    }

    // Get overall accuracy across all modes
    getOverallAccuracy() {
        if (this.data.sessions.length === 0) return null;
        
        let totalCorrect = 0;
        let totalQuestions = 0;
        
        this.data.sessions.forEach(session => {
            totalCorrect += session.correctAnswers;
            totalQuestions += session.totalQuestions;
        });
        
        return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;
    }

    // Get accuracy for a specific mode
    getModeAccuracy(mode) {
        const modeSessions = this.data.sessions.filter(s => s.mode === mode);
        if (modeSessions.length === 0) return null;
        
        let totalCorrect = 0;
        let totalQuestions = 0;
        
        modeSessions.forEach(session => {
            totalCorrect += session.correctAnswers;
            totalQuestions += session.totalQuestions;
        });
        
        return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;
    }

    // Get last N sessions for a mode (for trend display)
    getRecentSessions(mode, limit = 5) {
        return this.data.sessions
            .filter(s => s.mode === mode)
            .slice(-limit)
            .map(s => s.accuracy);
    }

    // Get total number of sessions
    getTotalSessions() {
        return this.data.sessions.length;
    }

    // Get total sessions for a specific mode
    getModeSessions(mode) {
        return this.data.sessions.filter(s => s.mode === mode).length;
    }

    // Clear all statistics
    clearAllStats() {
        this.data = { sessions: [] };
        this.saveData();
    }

    // Get formatted stats summary for display
    getStatsSummary() {
        const totalSessions = this.getTotalSessions();
        const overallAccuracy = this.getOverallAccuracy();
        
        if (totalSessions === 0) {
            return {
                hasStats: false,
                message: "Complete a practice session to see your stats!"
            };
        }

        return {
            hasStats: true,
            totalSessions: totalSessions,
            overallAccuracy: overallAccuracy,
            modes: {
                'char-to-morse': {
                    sessions: this.getModeSessions('char-to-morse'),
                    accuracy: this.getModeAccuracy('char-to-morse'),
                    recent: this.getRecentSessions('char-to-morse')
                },
                'morse-to-char': {
                    sessions: this.getModeSessions('morse-to-char'),
                    accuracy: this.getModeAccuracy('morse-to-char'),
                    recent: this.getRecentSessions('morse-to-char')
                },
                'sound-to-char': {
                    sessions: this.getModeSessions('sound-to-char'),
                    accuracy: this.getModeAccuracy('sound-to-char'),
                    recent: this.getRecentSessions('sound-to-char')
                }
            }
        };
    }
}

// Create singleton instance
export const statistics = new StatisticsManager();
