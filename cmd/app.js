// Bootstraps the app once the DOM is ready.
async function init() {
    // Read the main interactive controls from the page.
    const searchbar = document.getElementById("searchbar");
    const pageSizeSelect = document.getElementById("pageSize");
    const resetButton = document.getElementById("reset-hero-button");

    // Build the sort button handlers before any data is rendered.
    window.setupSortButtons();

    // Keep the search term in sync with what the user types.
    if (searchbar) {
        searchbar.addEventListener("input", function () {
            // Store the live search text in shared state.
            window.searchTerm = this.value;
            // Reset pagination so a new search starts from page 1.
            window.currentPage = 1;
            // Re-run the filter/sort/render pipeline.
            window.applyFiltersAndSort();
        });
    }

    // Update the page size whenever the dropdown changes.
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener("change", function () {
            window.changePageSize(this.value);
        });
    }

    // Restore the full dataset when the reset button is clicked.
    if (resetButton) {
        resetButton.addEventListener("click", function () {
            window.resetHeroes();
        });
    }

    // Load the remote data, prepare it, and trigger the first render.
    try {
        // Fetch the heroes from the API layer.
        const heroes = await window.fetchHeroes();
        // Preserve an untouched copy for reset operations.
        window.originalHeroes = heroes.map((hero, index) => ({ ...hero, _originalIndex: index }));
        // Keep the working dataset separate from the original snapshot.
        window.allHeroes = [...window.originalHeroes];
        // Start the visible list with the full set of heroes.
        window.filteredData = [...window.originalHeroes];
        // Run the normal render flow once the data exists.
        window.applyFiltersAndSort();
    } catch (error) {
        // Show a friendly failure message if fetch or parsing fails.
        const tbody = document.getElementById("heroTableBody");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="16" class="no-data">Failed to load heroes data</td>
                </tr>
            `;
        }
        // Log the actual error for debugging.
        console.error(error);
    }
}

// Start the app after the browser has built the page.
document.addEventListener("DOMContentLoaded", init);