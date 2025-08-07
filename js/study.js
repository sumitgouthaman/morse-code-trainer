export function initStudy() {
    const referenceChartsBtn = document.getElementById('reference-charts-btn');
    const flashCardsBtn = document.getElementById('flash-cards-btn');
    
    // Add event listeners
    referenceChartsBtn.addEventListener('click', () => {
        // Navigate to reference charts (original learn functionality)
        window.loadGameMode('learn');
    });
    
    flashCardsBtn.addEventListener('click', () => {
        // Navigate to flash cards
        window.loadGameMode('flash-cards');
    });
}