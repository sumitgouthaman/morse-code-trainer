// Statistics Manager - Per-Character and Time-based Accuracy Tracking
const STORAGE_KEY = 'morse_trainer_stats_v3';

class StatisticsManager {
    constructor() {
        this.data = this.loadData();
        // Ensure recentAttempts structure exists for all modes (now stores objects with timestamps)
        this.data.recentAttempts = this.data.recentAttempts || {};
        this.data.recentAttempts['char-to-morse'] = this.data.recentAttempts['char-to-morse'] || [];
        this.data.recentAttempts['morse-to-char'] = this.data.recentAttempts['morse-to-char'] || [];
        this.data.recentAttempts['sound-to-char'] = this.data.recentAttempts['sound-to-char'] || [];
        
        // Clean up old data (keep only last 3 months)
        this.cleanupOldData();
        
        // One-time migration: remove old storage format
        this.migrateFromOldStorage();
        this.data.questionCounter = this.data.questionCounter || 0; // Initialize global question counter
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
        
        // Default structure for per-character tracking and recent attempts with timestamps
        return {
            'char-to-morse': {},
            'morse-to-char': {},
            'sound-to-char': {},
            recentAttempts: {
                'char-to-morse': [],
                'morse-to-char': [],
                'sound-to-char': []
            },
            questionCounter: 0 // Initialize global question counter
        };
    }

    saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save statistics data:', error);
        }
    }

    // Record a single attempt for a character in a specific mode
    recordAttempt(mode, character, isCorrect) {
        // Update per-character stats
        if (!this.data[mode]) {
            this.data[mode] = {};
        }
        if (!this.data[mode][character]) {
            this.data[mode][character] = { attempts: 0, correct: 0 };
        }

        const stats = this.data[mode][character];
        stats.attempts++;
        if (isCorrect) {
            stats.correct++;
        }
        
        // Update recent attempts history with timestamp
        if (!this.data.recentAttempts[mode]) {
            this.data.recentAttempts[mode] = [];
        }
        this.data.recentAttempts[mode].push({
            isCorrect: isCorrect,
            timestamp: new Date().toISOString(),
            character: character
        });

        this.data.questionCounter++; // Increment global question counter
        
        this.saveData();
    }

    // Get stats for a specific character in a mode
    getCharacterStats(mode, character) {
        return this.data[mode]?.[character] || { attempts: 0, correct: 0 };
    }

    // Get all stats for a given mode
    getModeStats(mode) {
        return this.data[mode] || {};
    }

    // Get overall accuracy across all modes
    getOverallAccuracy() {
        let totalAttempts = 0;
        let totalCorrect = 0;

        for (const mode in this.data) {
            if (mode === 'recentAttempts' || mode === 'questionCounter') continue; // Skip these when calculating overall
            for (const char in this.data[mode]) {
                totalAttempts += this.data[mode][char].attempts;
                totalCorrect += this.data[mode][char].correct;
            }
        }

        return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    }

    // Get accuracy over the last 'count' questions for a specific mode
    getRecentAccuracy(mode, count) {
        const attempts = this.data.recentAttempts[mode] || [];
        const relevantAttempts = attempts.slice(-count); // Get the last 'count' attempts
        
        if (relevantAttempts.length === 0) {
            return null; // No attempts to calculate accuracy from
        }

        const correctCount = relevantAttempts.filter(attempt => attempt.isCorrect).length;
        return Math.round((correctCount / relevantAttempts.length) * 100);
    }

    // Get the global question counter
    getQuestionCount() {
        return this.data.questionCounter;
    }

    // Clean up attempts older than 3 months
    cleanupOldData() {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        for (const mode of ['char-to-morse', 'morse-to-char', 'sound-to-char']) {
            if (this.data.recentAttempts[mode]) {
                this.data.recentAttempts[mode] = this.data.recentAttempts[mode].filter(attempt => {
                    return new Date(attempt.timestamp) >= threeMonthsAgo;
                });
            }
        }
    }

    // Get attempts grouped by date for charting
    getAttemptsGroupedByDate(mode) {
        const attempts = this.data.recentAttempts[mode] || [];
        const groups = {};
        
        attempts.forEach(attempt => {
            const dateKey = attempt.timestamp.split('T')[0]; // YYYY-MM-DD
            if (!groups[dateKey]) {
                groups[dateKey] = { correct: 0, total: 0 };
            }
            groups[dateKey].total++;
            if (attempt.isCorrect) {
                groups[dateKey].correct++;
            }
        });
        
        // Convert to sorted array
        return Object.entries(groups)
            .map(([date, stats]) => ({
                date: date,
                accuracy: Math.round((stats.correct / stats.total) * 100),
                totalQuestions: stats.total,
                correctAnswers: stats.correct
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    // One-time migration to clean up old storage format
    migrateFromOldStorage() {
        // Check if old storage exists and remove it
        const oldKeys = ['morse_trainer_stats_v2', 'morse_trainer_stats_v1', 'morse_trainer_stats'];
        oldKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`Removing old statistics storage: ${key}`);
                localStorage.removeItem(key);
            }
        });
    }

    // Clear all statistics
    clearAllStats() {
        this.data = {
            'char-to-morse': {},
            'morse-to-char': {},
            'sound-to-char': {},
            recentAttempts: {
                'char-to-morse': [],
                'morse-to-char': [],
                'sound-to-char': []
            },
            questionCounter: 0
        };
        this.saveData();
    }

    // Get a summary for the main menu display
    getStatsSummary() {
        const overallAccuracy = this.getOverallAccuracy();
        let totalAttempts = 0;
        for (const mode in this.data) {
            if (mode === 'recentAttempts' || mode === 'questionCounter') continue;
            for (const char in this.data[mode]) {
                totalAttempts += this.data[mode][char].attempts;
            }
        }

        if (totalAttempts === 0) {
            return {
                hasStats: false,
                message: "Practice any mode to see your stats!"
            };
        }

        return {
            hasStats: true,
            overallAccuracy: overallAccuracy
        };
    }
}

// Create singleton instance
export const statistics = new StatisticsManager();