// ============================================
// TABLE RENDER FUNCTIONS
// ============================================

// Global state (shared across files)
window.currentPage = 1;
window.pageSize = 20;
window.filteredData = [];

function renderPowerstats(powerstats) {
    if (!powerstats) return '<span class="powerstat-badge">N/A</span>';
    
    const statIcons = {
        intelligence: '<i class="fas fa-brain"></i>',
        strength: '<i class="fas fa-dumbbell"></i>',
        speed: '<i class="fas fa-bolt"></i>',
        durability: '<i class="fas fa-shield-alt"></i>',
        power: '<i class="fas fa-fire"></i>',
        combat: '<i class="fas fa-fist-raised"></i>'
    };
    
    const stats = [];
    for (const [key, value] of Object.entries(powerstats)) {
        if (value && value !== "null" && value !== "undefined" && value !== "N/A") {
            const icon = statIcons[key] || key.charAt(0).toUpperCase() + key.slice(1);
            stats.push(`<span class="powerstat-badge">${icon} ${value}</span>`);
        }
    }
    return stats.length > 0 ? stats.join(' ') : '<span class="powerstat-badge">N/A</span>';
}

function getAlignmentClass(alignment) {
    if (!alignment) return '';
    const lower = alignment.toLowerCase();
    if (lower === 'good' || lower === 'hero') return 'alignment-hero';
    if (lower === 'bad' || lower === 'villain') return 'alignment-villain';
    return 'alignment-neutral';
}

function formatHeight(height) {
    if (!height) return 'N/A';
    if (Array.isArray(height)) {
        return height.filter(h => h && h !== 'null' && h !== 'undefined').join(' / ');
    }
    return height;
}

function formatWeight(weight) {
    if (!weight) return 'N/A';
    if (Array.isArray(weight)) {
        return weight.filter(w => w && w !== 'null' && w !== 'undefined').join(' / ');
    }
    return weight;
}

function renderTable(data) {
    console.log('Rendering table with data:', data);
    
    const tbody = document.getElementById('heroTableBody');
    
    if (!tbody) {
        console.error('Table body element not found!');
        return;
    }
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="15" class="no-data">No heroes found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map((hero, index) => `
        <tr class="hero-row" data-index="${index}" data-durability="${hero.powerstats?.durability || 50}" data-name="${hero.name}">
            <td>
                ${hero.images && hero.images.xs 
                    ? `<img src="${hero.images.xs}" alt="${hero.name}" class="hero-icon" onerror="this.style.display='none'">`
                    : '<span class="no-data">N/A</span>'
                }
            </td>
            <td><strong>${hero.name || 'N/A'}</strong></td>
            <td>${hero.biography?.fullName || 'N/A'}</td>
            <td>${hero.powerstats?.intelligence || 'N/A'}</td>
            <td>${hero.powerstats?.strength || 'N/A'}</td>
            <td>${hero.powerstats?.speed || 'N/A'}</td>
            <td>${hero.powerstats?.durability || 'N/A'}</td>
            <td>${hero.powerstats?.power || 'N/A'}</td>
            <td>${hero.powerstats?.combat || 'N/A'}</td>
            <td>${hero.appearance?.race || 'N/A'}</td>
            <td>${hero.appearance?.gender || 'N/A'}</td>
            <td>${formatHeight(hero.appearance?.height)}</td>
            <td>${formatWeight(hero.appearance?.weight)}</td>
            <td>${hero.biography?.placeOfBirth || 'N/A'}</td>
            <td class="${getAlignmentClass(hero.biography?.alignment)}">
                ${hero.biography?.alignment || 'N/A'}
            </td>
        </tr>
    `).join('');

    // Add click event listeners to all rows
    document.querySelectorAll('.hero-row').forEach(row => {
        row.addEventListener('click', function() {
            const durability = parseInt(this.dataset.durability);
            const name = this.dataset.name;
            if (window.handleHeroClick) {
                window.handleHeroClick(name, durability);
            }
        });
    });
}

function renderPagination(totalItems) {
    const container = document.getElementById('paginationControls');
    
    if (!container) {
        console.error('Pagination container not found!');
        return;
    }
    
    const totalPages = window.pageSize === -1 ? 1 : Math.ceil(totalItems / window.pageSize);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <button onclick="window.goToPage(${window.currentPage - 1})" ${window.currentPage <= 1 ? 'disabled' : ''}>
            &laquo; Previous
        </button>
        <div class="page-numbers">
    `;

    const maxVisible = 7;
    let startPage = Math.max(1, window.currentPage - 3);
    let endPage = Math.min(totalPages, window.currentPage + 3);

    if (endPage - startPage < maxVisible - 1) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + maxVisible - 1);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
    }

    if (startPage > 1) {
        html += `<button onclick="window.goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="window.goToPage(${i})" class="${i === window.currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
        html += `<button onclick="window.goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `
        </div>
        <button onclick="window.goToPage(${window.currentPage + 1})" ${window.currentPage >= totalPages ? 'disabled' : ''}>
            Next &raquo;
        </button>
    `;

    container.innerHTML = html;
}

function updatePaginationInfo(totalItems) {
    const startRange = document.getElementById('startRange');
    const endRange = document.getElementById('endRange');
    const totalCount = document.getElementById('totalCount');
    
    if (!startRange || !endRange || !totalCount) {
        console.error('Pagination info elements not found!');
        return;
    }
    
    if (totalItems === 0) {
        startRange.textContent = '0';
        endRange.textContent = '0';
        totalCount.textContent = '0';
        return;
    }

    const start = window.pageSize === -1 ? 1 : (window.currentPage - 1) * window.pageSize + 1;
    const end = window.pageSize === -1 ? totalItems : Math.min(window.currentPage * window.pageSize, totalItems);
    
    startRange.textContent = start;
    endRange.textContent = end;
    totalCount.textContent = totalItems;
}

function getCurrentPageData() {
    if (window.pageSize === -1) return window.filteredData;
    
    const start = (window.currentPage - 1) * window.pageSize;
    const end = start + window.pageSize;
    return window.filteredData.slice(start, end);
}

function updateDisplay() {
    console.log('Updating display...');
    const totalItems = window.filteredData.length;
    const pageData = getCurrentPageData();
    
    renderTable(pageData);
    renderPagination(totalItems);
    updatePaginationInfo(totalItems);
}

function goToPage(page) {
    const totalPages = window.pageSize === -1 ? 1 : Math.ceil(window.filteredData.length / window.pageSize);
    if (page < 1 || page > totalPages) return;
    window.currentPage = page;
    updateDisplay();
}

function changePageSize(size) {
    window.pageSize = parseInt(size);
    window.currentPage = 1;
    updateDisplay();
}

let currentSort = {
    column: null,
    direction: null // 'asc' or 'desc'
};

function toggleSort(column) {
    // If clicking the same column, toggle direction
    if (currentSort.column === column) {
        // Cycle: null → asc → desc → asc → desc ...
        if (currentSort.direction === null) {
            currentSort.direction = 'asc';
        } else if (currentSort.direction === 'asc') {
            currentSort.direction = 'desc';
        } else {
            currentSort.direction = 'asc';
        }
    } else {
        // New column - start with ascending
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Update the icons
    updateSortButtons();
    
    // TODO: Call your backend sorting function here when ready
    // backendSort(currentSort.column, currentSort.direction);
    console.log(`Sorting by: ${currentSort.column}, Direction: ${currentSort.direction}`);
}

function updateSortButtons() {
    // Remove all active states from sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('asc', 'desc');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sort';
        }
    });
    
    // If there's an active sort, update the corresponding button
    if (currentSort.column && currentSort.direction) {
        const activeBtn = document.querySelector(`.sort-btn[data-sort="${currentSort.column}"]`);
        if (activeBtn) {
            activeBtn.classList.add(currentSort.direction);
            const icon = activeBtn.querySelector('i');
            if (icon) {
                icon.className = currentSort.direction === 'asc' 
                    ? 'fas fa-sort-up' 
                    : 'fas fa-sort-down';
            }
        }
    }
}

function setupSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const column = this.dataset.sort;
            toggleSort(column);
        });
    });
}

// Make functions globally accessible
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
window.renderPowerstats = renderPowerstats;
window.getAlignmentClass = getAlignmentClass;
window.formatHeight = formatHeight;
window.formatWeight = formatWeight;