import { morseCode } from './morse-code.js';

export function initLearn() {
    setupTabs();
    populateGrids();
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

function populateGrids() {
    const letters = {};
    const digits = {};
    const punctuation = {};
    
    // Categorize morse code entries
    Object.entries(morseCode).forEach(([char, morse]) => {
        if (char.match(/[A-Z]/)) {
            letters[char] = morse;
        } else if (char.match(/[0-9]/)) {
            digits[char] = morse;
        } else {
            punctuation[char] = morse;
        }
    });
    
    // Populate each grid
    populateGrid('letters-grid', letters);
    populateGrid('digits-grid', digits);
    populateGrid('punctuation-grid', punctuation);
}

function populateGrid(gridId, data) {
    const grid = document.getElementById(gridId);
    
    Object.entries(data).forEach(([char, morse]) => {
        const item = document.createElement('div');
        item.className = 'morse-item';
        
        item.innerHTML = `
            <div class="character">${char}</div>
            <div class="morse-code">${morse}</div>
        `;
        
        grid.appendChild(item);
    });
}
