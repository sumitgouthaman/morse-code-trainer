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
    const dailyData = statistics.getAttemptsGroupedByDate(currentMode);
    
    // Calculate stats for current mode
    let totalAttempts = 0;
    let totalCorrect = 0;
    
    for (const char in modeStats) {
        totalAttempts += modeStats[char].attempts;
        totalCorrect += modeStats[char].correct;
    }
    
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const practiceSessionsCount = dailyData.length;
    const bestDailyAccuracy = practiceSessionsCount > 0 ? Math.max(...dailyData.map(d => d.accuracy)) : 0;
    
    // Update display
    state.overallAccuracy.textContent = totalAttempts > 0 ? `${accuracy}%` : '--';
    state.totalSessions.textContent = practiceSessionsCount > 0 ? practiceSessionsCount : '--';
    state.bestSession.textContent = bestDailyAccuracy > 0 ? `${bestDailyAccuracy}%` : '--';
}

function updateChart(state) {
    const dailyData = statistics.getAttemptsGroupedByDate(currentMode);
    
    if (dailyData.length < 2) {
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
    
    const chartData = prepareChartData(dailyData);
    renderChart(state.chartCanvas, chartData);
}

// This function is no longer needed - replaced by getAttemptsGroupedByDate in statistics.js

function prepareChartData(dailyData) {
    // Format dates for display
    const labels = dailyData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    return {
        labels: labels,
        datasets: [{
            label: 'Daily Accuracy %',
            data: dailyData.map(d => d.accuracy),
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
                            const dataIndex = context.dataIndex;
                            const dailyData = statistics.getAttemptsGroupedByDate(currentMode);
                            const dayData = dailyData[dataIndex];
                            return [
                                `Accuracy: ${Math.round(context.parsed.y)}%`,
                                `Questions: ${dayData.correctAnswers}/${dayData.totalQuestions}`
                            ];
                        }
                    }
                }
            }
        }
    });
}