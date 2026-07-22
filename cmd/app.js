// ============================================
// APP INITIALIZATION
// ============================================

function init() {
    console.log('Initializing app...');
    
    // Load data from api.js
    window.filteredData = [...window.sampleData];
    
    console.log('Filtered data:', window.filteredData);
    
    // Update the display
    window.updateDisplay();
    
    // Setup sort buttons
    window.setupSortButtons();
    
    console.log('App initialized!');

    // Setup reset button
    const resetButton = document.getElementById('reset-hero-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            window.resetHeroes();
        });
        console.log('Reset button listener attached!');
    } else {
        console.warn('Reset button not found in the DOM!');
    }
    
    // Setup page size selector
    const pageSizeSelect = document.getElementById('pageSize');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function() {
            window.changePageSize(this.value);
        });
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);