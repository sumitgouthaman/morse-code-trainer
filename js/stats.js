// Statistics Dashboard Module
import { statistics } from './statistics.js';

let currentChart = null;
let currentMode = 'char-to-morse';

export function initStats() {
    const state = {
        backButton: document.getElementById('back-to-menu'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        overallAccuracy: document.getElementById('overall-accuracy'),
        totalSessions: document.getElementById('total-sessions'),
        bestSession: document.getElementById('best-session'),
        chartCanvas: document.getElementById('accuracy-chart'),
        noDataMessage: document.getElementById('no-data-message')
    };

    // Set up event listeners
    state.backButton.addEventListener('click', () => {
        window.history.back();
    });

    state.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            switchMode(mode, state);
        });
    });

    // Initialize with default mode
    updateDisplay(state);
}

function switchMode(mode, state) {
    currentMode = mode;
    
    // Update active tab
    state.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    updateDisplay(state);
}

function updateDisplay(state) {
    updateSummaryCards(state);
    updateChart(state);
}

function updateSummaryCards(state) {
    const modeStats = statistics.getModeStats(currentMode);
    const sessions = getSessionsFromAttempts(currentMode);
    
    // Calculate stats for current mode
    let totalAttempts = 0;
    let totalCorrect = 0;
    
    for (const char in modeStats) {
        totalAttempts += modeStats[char].attempts;
        totalCorrect += modeStats[char].correct;
    }
    
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const sessionCount = sessions.length;
    const bestAccuracy = sessionCount > 0 ? Math.max(...sessions.map(s => s.accuracy)) : 0;
    
    // Update display
    state.overallAccuracy.textContent = totalAttempts > 0 ? `${accuracy}%` : '--';
    state.totalSessions.textContent = sessionCount > 0 ? sessionCount : '--';
    state.bestSession.textContent = bestAccuracy > 0 ? `${Math.round(bestAccuracy)}%` : '--';
}

function updateChart(state) {
    const sessions = getSessionsFromAttempts(currentMode);
    
    if (sessions.length < 2) {
        // Show no data message
        state.noDataMessage.style.display = 'block';
        state.chartCanvas.style.display = 'none';
        
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        return;
    }
    
    // Hide no data message and show chart
    state.noDataMessage.style.display = 'none';
    state.chartCanvas.style.display = 'block';
    
    const chartData = prepareChartData(sessions);
    renderChart(state.chartCanvas, chartData);
}

function getSessionsFromAttempts(mode) {
    // Get recent attempts for the mode
    const attempts = statistics.data.recentAttempts[mode] || [];
    
    if (attempts.length === 0) return [];
    
    // Group attempts into sessions (every 20 questions for now)
    const sessionSize = 20;
    const sessions = [];
    
    for (let i = 0; i < attempts.length; i += sessionSize) {
        const sessionAttempts = attempts.slice(i, i + sessionSize);
        
        if (sessionAttempts.length >= 5) { // Only count sessions with at least 5 attempts
            const correct = sessionAttempts.filter(Boolean).length;
            const accuracy = (correct / sessionAttempts.length) * 100;
            
            sessions.push({
                sessionNumber: Math.floor(i / sessionSize) + 1,
                accuracy: accuracy,
                totalQuestions: sessionAttempts.length,
                correctAnswers: correct
            });
        }
    }
    
    return sessions.slice(-20); // Show last 20 sessions max
}

function prepareChartData(sessions) {
    return {
        labels: sessions.map((_, index) => `Session ${sessions.length - sessions.length + index + 1}`),
        datasets: [{
            label: 'Accuracy %',
            data: sessions.map(s => s.accuracy),
            borderColor: 'rgb(52, 152, 219)',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointBackgroundColor: 'rgb(52, 152, 219)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };
}

function renderChart(canvas, chartData) {
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: '#666',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        },
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Accuracy: ${Math.round(context.parsed.y)}%`;
                        }
                    }
                }
            }
        }
    });
}