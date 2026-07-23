// Shared table state used across sorting, searching, and pagination.
window.currentPage = 1;
window.pageSize = 20;
window.filteredData = [];
window.allHeroes = [];
window.originalHeroes = [];
window.searchTerm = "";
// Default sort starts on name ascending, matching the assignment.
window.currentSort = {
    column: "name",
    direction: "asc",
};

// Columns that should be treated as numbers when sorted.
const numericSortColumns = new Set([
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
    "height",
    "weight",
]);

// Maps table sort keys to the nested fields in the hero objects.
const sortColumnPaths = {
    name: "name",
    fullname: "biography.fullName",
    intelligence: "powerstats.intelligence",
    strength: "powerstats.strength",
    speed: "powerstats.speed",
    durability: "powerstats.durability",
    power: "powerstats.power",
    combat: "powerstats.combat",
    race: "appearance.race",
    gender: "appearance.gender",
    height: "appearance.height",
    weight: "appearance.weight",
    placeofbirth: "biography.placeOfBirth",
    alignment: "biography.alignment",
};

// Reads a nested property safely from an object using dot notation.
function getPathValue(objectValue, path) {
    return path.split(".").reduce((current, part) => current?.[part], objectValue);
}

// Treats placeholders and empty values as missing so they can sort last.
function isMissingValue(value) {
    if (value == null) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "" || normalized === "-" || normalized === "null" || normalized === "unknown";
    }
    return false;
}

// Converts text measurements like "108.0 meters" into a unit/amount pair.
function parseMeasurement(rawText) {
    if (typeof rawText !== "string") return null;

    // Remove commas so values like 90,000 still parse correctly.
    const normalized = rawText.trim().toLowerCase().replace(/,/g, "");
    const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s*([a-z]+)?$/);
    if (!match) return null;

    // Split the numeric part from the unit part.
    const amount = Number(match[1]);
    const unit = (match[2] || "").toLowerCase();

    // Reject values that still are not valid numbers.
    if (!Number.isFinite(amount)) return null;
    return { amount, unit };
}

// Converts all height variants into centimeters for reliable sorting.
function normalizeHeightToCm(heightValue) {
    if (!Array.isArray(heightValue)) return null;

    // Try every candidate value until we find one that can be parsed.
    for (const candidate of heightValue) {
        const parsed = parseMeasurement(candidate);
        if (!parsed) continue;

        // Handle the supported height units.
        if (parsed.unit === "cm") return parsed.amount;
        if (parsed.unit === "m" || parsed.unit === "meter" || parsed.unit === "meters") return parsed.amount * 100;
        if (parsed.unit === "km" || parsed.unit === "kilometer" || parsed.unit === "kilometers") return parsed.amount * 100000;
    }

    // Return null when the height cannot be normalized.
    return null;
}

// Converts all weight variants into kilograms for reliable sorting.
function normalizeWeightToKg(weightValue) {
    if (!Array.isArray(weightValue)) return null;

    // Try every candidate value until we find one that can be parsed.
    for (const candidate of weightValue) {
        const parsed = parseMeasurement(candidate);
        if (!parsed) continue;

        // Handle the supported weight units.
        if (parsed.unit === "kg" || parsed.unit === "kilogram" || parsed.unit === "kilograms") return parsed.amount;
        if (parsed.unit === "ton" || parsed.unit === "tons" || parsed.unit === "tonne" || parsed.unit === "tonnes" || parsed.unit === "t") {
            return parsed.amount * 1000;
        }
    }

    // Return null when the weight cannot be normalized.
    return null;
}

// Produces one comparable value for the current column.
function getComparableValue(hero, column) {
    const path = sortColumnPaths[column];
    // If the column is not recognized, return null so it behaves like missing data.
    if (!path) return null;

    // Look up the raw value from the hero object.
    const raw = getPathValue(hero, path);

    // Special-case place of birth so parentheses do not affect ordering.
    if (column === "placeofbirth" && typeof raw === "string") {
        return raw.replace(/[()]/g, "").trim().toLowerCase();
    }

    // Normalize height and weight before sorting.
    if (column === "height") return normalizeHeightToCm(raw);
    if (column === "weight") return normalizeWeightToKg(raw);

    // Treat the powerstats and other numeric columns as numbers.
    if (numericSortColumns.has(column)) {
        const numberValue = Number(raw);
        return Number.isFinite(numberValue) ? numberValue : null;
    }

    // Compare string columns alphabetically in lowercase form.
    if (typeof raw === "string") return raw.trim().toLowerCase();
    return raw;
}

// Comparator used by Array.sort.
function compareHeroes(leftHero, rightHero) {
    // Read the current sort column and direction from shared state.
    const { column, direction } = window.currentSort;
    const directionFactor = direction === "desc" ? -1 : 1;
    const leftValue = getComparableValue(leftHero, column);
    const rightValue = getComparableValue(rightHero, column);
    const leftMissing = isMissingValue(leftValue);
    const rightMissing = isMissingValue(rightValue);

    // Missing values always stay at the end.
    if (leftMissing && rightMissing) return leftHero._originalIndex - rightHero._originalIndex;
    if (leftMissing) return 1;
    if (rightMissing) return -1;

    let result;
    // Use numeric comparison for numeric columns and localeCompare for text columns.
    if (numericSortColumns.has(column)) {
        result = leftValue - rightValue;
    } else {
        result = String(leftValue).localeCompare(String(rightValue));
    }

    // Keep the original order when values are equal.
    if (result === 0) return leftHero._originalIndex - rightHero._originalIndex;
    // Flip the sign when sorting descending.
    return result * directionFactor;
}

// Returns the CSS class used for alignment labels.
function getAlignmentClass(alignment) {
    if (!alignment) return "";
    const lower = alignment.toLowerCase();
    if (lower === "good" || lower === "hero") return "alignment-hero";
    if (lower === "bad" || lower === "villain") return "alignment-villain";
    return "alignment-neutral";
}

// Joins height arrays into a human-readable string for display.
function formatHeight(height) {
    if (!height) return "N/A";
    if (Array.isArray(height)) {
        return height.filter((h) => h && h !== "null" && h !== "undefined").join(" / ");
    }
    return height;
}

// Joins weight arrays into a human-readable string for display.
function formatWeight(weight) {
    if (!weight) return "N/A";
    if (Array.isArray(weight)) {
        return weight.filter((w) => w && w !== "null" && w !== "undefined").join(" / ");
    }
    return weight;
}

// Renders the rows for the current page of data.
function renderTable(data) {
    // Find the table body where rows belong.
    const tbody = document.getElementById("heroTableBody");
    if (!tbody) return;

    // Show a helpful message when the filtered list is empty.
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="16" class="no-data">No heroes found</td>
            </tr>
        `;
        return;
    }

    // Build table rows from the current page of heroes.
    tbody.innerHTML = data.map((hero) => `
        <tr class="hero-row" data-durability="${hero.powerstats?.durability || 50}" data-name="${hero.name}">
            <td>
                ${hero.images?.xs
            ? `<img src="${hero.images.xs}" alt="${hero.name}" class="hero-icon" onerror="this.style.display='none'">`
            : "<span class='no-data'>N/A</span>"
        }
            </td>
            <td><strong>${hero.name || "N/A"}</strong></td>
            <td>${hero.biography?.fullName || "N/A"}</td>
            <td>${hero.powerstats?.intelligence || "N/A"}</td>
            <td>${hero.powerstats?.strength || "N/A"}</td>
            <td>${hero.powerstats?.speed || "N/A"}</td>
            <td>${hero.powerstats?.durability || "N/A"}</td>
            <td>${hero.powerstats?.power || "N/A"}</td>
            <td>${hero.powerstats?.combat || "N/A"}</td>
            <td>${hero.appearance?.race || "N/A"}</td>
            <td>${hero.appearance?.gender || "N/A"}</td>
            <td>${formatHeight(hero.appearance?.height)}</td>
            <td>${formatWeight(hero.appearance?.weight)}</td>
            <td>${hero.biography?.placeOfBirth || "N/A"}</td>
            <td class="${getAlignmentClass(hero.biography?.alignment)}">${hero.biography?.alignment || "N/A"}</td>
            <td>
                <button
                    class="fight-btn"
                    type="button"
                    data-name="${hero.name}"
                    data-durability="${hero.powerstats?.durability || 50}"
                    data-alignment="${hero.biography?.alignment || 'neutral'}">
                    Fight
                </button>
            </td>
        </tr>
    `).join("");

    // Attach click handlers to the dedicated fight buttons only.
    document.querySelectorAll(".fight-btn").forEach((button) => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            const durability = parseInt(this.dataset.durability, 10);
            const name = this.dataset.name;
            const alignment = this.dataset.alignment;
            if (window.handleHeroClick) {
                window.handleHeroClick(name, durability, alignment
                );
            }
        });
    });
}

// Renders pagination controls for the current dataset size.
function renderPagination(totalItems) {
    // Find the pagination container in the page.
    const container = document.getElementById("paginationControls");
    if (!container) return;

    // When showing all results, there is no need for paging controls.
    const totalPages = window.pageSize === -1 ? 1 : Math.ceil(totalItems / window.pageSize);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    // Start the pagination layout with Previous and the page number wrapper.
    let html = `
        <button onclick="window.goToPage(${window.currentPage - 1})" ${window.currentPage <= 1 ? "disabled" : ""}>
            &laquo; Previous
        </button>
        <div class="page-numbers">
    `;

    // Limit how many page numbers are shown at once.
    const maxVisible = 7;
    let startPage = Math.max(1, window.currentPage - 3);
    let endPage = Math.min(totalPages, window.currentPage + 3);

    // Adjust the visible window so it stays balanced near the edges.
    if (endPage - startPage < maxVisible - 1) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + maxVisible - 1);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
    }

    // Add the first page and an ellipsis when needed.
    if (startPage > 1) {
        html += `<button onclick="window.goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="ellipsis">...</span>`;
    }

    // Add the main visible page range.
    for (let i = startPage; i <= endPage; i += 1) {
        html += `<button onclick="window.goToPage(${i})" class="${i === window.currentPage ? "active" : ""}">${i}</button>`;
    }

    // Add the last page and trailing ellipsis when needed.
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
        html += `<button onclick="window.goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Finish the layout with the Next button.
    html += `
        </div>
        <button onclick="window.goToPage(${window.currentPage + 1})" ${window.currentPage >= totalPages ? "disabled" : ""}>
            Next &raquo;
        </button>
    `;

    // Replace the old pagination UI with the new HTML.
    container.innerHTML = html;
}

// Updates the visible page range counters.
function updatePaginationInfo(totalItems) {
    // Look up the display elements.
    const startRange = document.getElementById("startRange");
    const endRange = document.getElementById("endRange");
    const totalCount = document.getElementById("totalCount");
    if (!startRange || !endRange || !totalCount) return;

    // Handle the empty state cleanly.
    if (totalItems === 0) {
        startRange.textContent = "0";
        endRange.textContent = "0";
        totalCount.textContent = "0";
        return;
    }

    // Calculate the visible item range for the current page.
    const start = window.pageSize === -1 ? 1 : (window.currentPage - 1) * window.pageSize + 1;
    const end = window.pageSize === -1 ? totalItems : Math.min(window.currentPage * window.pageSize, totalItems);

    // Write the values into the page.
    startRange.textContent = String(start);
    endRange.textContent = String(end);
    totalCount.textContent = String(totalItems);
}

// Returns only the rows for the currently selected page.
function getCurrentPageData() {
    if (window.pageSize === -1) return window.filteredData;

    // Slice the visible window from the filtered data.
    const start = (window.currentPage - 1) * window.pageSize;
    const end = start + window.pageSize;
    return window.filteredData.slice(start, end);
}

// Re-renders the table, pagination, and range info in one place.
function updateDisplay() {
    // Clamp the current page to a valid value.
    const totalItems = window.filteredData.length;
    const totalPages = window.pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalItems / window.pageSize));
    window.currentPage = Math.min(window.currentPage, totalPages);

    // Compute the current visible data and paint the UI.
    const pageData = getCurrentPageData();
    renderTable(pageData);
    renderPagination(totalItems);
    updatePaginationInfo(totalItems);
}

// Filters the full dataset by name and then sorts it.
function applyFiltersAndSort() {
    // Normalize the search term for case-insensitive matching.
    const search = (window.searchTerm || "").trim().toLowerCase();
    // Filter against the working hero list.
    const filtered = !search
        ? [...window.allHeroes]
        : window.allHeroes.filter((hero) => (hero.name || "").toLowerCase().includes(search));

    // Sort the filtered list using the active sort state.
    filtered.sort(compareHeroes);
    // Save the result and redraw the UI.
    window.filteredData = filtered;
    updateDisplay();
}

// Moves the view to a specific page number.
function goToPage(page) {
    // Reject page values outside the valid range.
    const totalPages = window.pageSize === -1 ? 1 : Math.ceil(window.filteredData.length / window.pageSize);
    if (page < 1 || page > totalPages) return;
    // Update the current page and refresh the table.
    window.currentPage = page;
    updateDisplay();
}

// Changes the page size and resets to the first page.
function changePageSize(size) {
    // Convert the select value into a number, except for the "all" sentinel.
    window.pageSize = parseInt(size, 10);
    if (!Number.isFinite(window.pageSize)) {
        window.pageSize = 20;
    }
    // Page size changes should always restart at page 1.
    window.currentPage = 1;
    updateDisplay();
}

// Updates the active sort state when the user clicks a column header.
function toggleSort(column) {
    // Clicking the same column flips direction; clicking a new column resets to ascending.
    if (window.currentSort.column === column) {
        window.currentSort.direction = window.currentSort.direction === "asc" ? "desc" : "asc";
    } else {
        window.currentSort.column = column;
        window.currentSort.direction = "asc";
    }

    // Refresh the header indicators and re-sort the data.
    updateSortButtons();
    applyFiltersAndSort();
}

// Visually marks the active sort button and resets the others.
function updateSortButtons() {
    // Clear every sort button first.
    document.querySelectorAll(".sort-btn").forEach((btn) => {
        btn.classList.remove("asc", "desc");
        btn.innerHTML = "&#8597;";
    });

    // Find the active sort button for the current column.
    const { column, direction } = window.currentSort;
    const activeBtn = document.querySelector(`.sort-btn[data-sort="${column}"]`);
    if (!activeBtn) return;

    // Set the direction marker on the active header.
    activeBtn.classList.add(direction);
    activeBtn.innerHTML = direction === "asc" ? "&#8593;" : "&#8595;";
}

// Attaches click listeners to all sort buttons on the page.
function setupSortButtons() {
    document.querySelectorAll(".sort-btn").forEach((btn) => {
        btn.addEventListener("click", function (event) {
            // Stop the click from affecting anything else in the header cell.
            event.stopPropagation();
            // Use the button's data-sort key to toggle the correct column.
            toggleSort(this.dataset.sort);
        });
    });

    // Make sure the UI shows the default sort state.
    updateSortButtons();
}

// Expose the table helpers so other modules can call them.
window.toggleSort = toggleSort;
window.updateSortButtons = updateSortButtons;
window.setupSortButtons = setupSortButtons;
window.renderTable = renderTable;
window.renderPagination = renderPagination;
window.updatePaginationInfo = updatePaginationInfo;
window.getCurrentPageData = getCurrentPageData;
window.updateDisplay = updateDisplay;
window.goToPage = goToPage;
window.changePageSize = changePageSize;
window.getAlignmentClass = getAlignmentClass;
window.formatHeight = formatHeight;
window.formatWeight = formatWeight;
window.applyFiltersAndSort = applyFiltersAndSort;