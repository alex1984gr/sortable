// api.js - Frontend JavaScript

// ============================================
// SAMPLE DATA
// ============================================
const sampleData = [
    {
        name: "Superman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/644-superman.jpg" },
        biography: {
            fullName: "Clark Kent",
            placeOfBirth: "Krypton",
            alignment: "good"
        },
        powerstats: {
            intelligence: "94",
            strength: "100",
            speed: "100",
            durability: "100",
            power: "100",
            combat: "85"
        },
        appearance: {
            race: "Kryptonian",
            gender: "Male",
            height: ["6'3", "191 cm"],
            weight: ["235 lb", "107 kg"]
        }
    },
    {
        name: "Batman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/70-batman.jpg" },
        biography: {
            fullName: "Bruce Wayne",
            placeOfBirth: "Gotham City",
            alignment: "good"
        },
        powerstats: {
            intelligence: "100",
            strength: "26",
            speed: "27",
            durability: "50",
            power: "47",
            combat: "100"
        },
        appearance: {
            race: "Human",
            gender: "Male",
            height: ["6'2", "188 cm"],
            weight: ["210 lb", "95 kg"]
        }
    },
    {
        name: "Wonder Woman",
        images: { xs: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/720-wonder-woman.jpg" },
        biography: {
            fullName: "Diana Prince",
            placeOfBirth: "Themyscira",
            alignment: "good"
        },
        powerstats: {
            intelligence: "92",
            strength: "100",
            speed: "60",
            durability: "100",
            power: "100",
            combat: "100"
        },
        appearance: {
            race: "Amazon",
            gender: "Female",
            height: ["6'0", "183 cm"],
            weight: ["165 lb", "75 kg"]
        }
    }
];

console.log('api.js loaded!'); // Check if script loads
console.log('Sample data:', sampleData); // Check if data exists

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderPowerstats(powerstats) {
    if (!powerstats) return '<span class="powerstat-badge">N/A</span>';
    
    // Map stat names to Font Awesome icons
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
                <td colspan="10" class="no-data">No heroes found</td>
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
            <td>${renderPowerstats(hero.powerstats)}</td>
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
            handleHeroClick(name, durability);
        });
    });
}

function renderPagination(totalItems) {
    const container = document.getElementById('paginationControls');
    
    if (!container) {
        console.error('Pagination container not found!');
        return;
    }
    
    const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
            &laquo; Previous
        </button>
        <div class="page-numbers">
    `;

    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    if (endPage - startPage < maxVisible - 1) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + maxVisible - 1);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
    }

    if (startPage > 1) {
        html += `<button onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
        html += `<button onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `
        </div>
        <button onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
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

    const start = pageSize === -1 ? 1 : (currentPage - 1) * pageSize + 1;
    const end = pageSize === -1 ? totalItems : Math.min(currentPage * pageSize, totalItems);
    
    startRange.textContent = start;
    endRange.textContent = end;
    totalCount.textContent = totalItems;
}

let currentPage = 1;
let pageSize = 20;
let filteredData = [];

function getCurrentPageData() {
    if (pageSize === -1) return filteredData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
}

function updateDisplay() {
    console.log('Updating display...'); // Debug log
    const totalItems = filteredData.length;
    const pageData = getCurrentPageData();
    
    renderTable(pageData);
    renderPagination(totalItems);
    updatePaginationInfo(totalItems);
}

function goToPage(page) {
    const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredData.length / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    updateDisplay();
}

function changePageSize(size) {
    pageSize = parseInt(size);
    currentPage = 1;
    updateDisplay();
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('Initializing app...'); // Debug log
    
    // Use sample data
    filteredData = sampleData;
    
    console.log('Filtered data:', filteredData); // Debug log
    
    updateDisplay();
    console.log('App initialized!'); // Debug log
}

// Run when page loads
console.log('DOMContentLoaded event will fire...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired!');
    init();
});

function handleHeroClick(heroName, durability) {
    // Generate random number between 1 and 100
    const randomNumber = Math.floor(Math.random() * 200) + 1;
    
    console.log(`Hero: ${heroName}, Durability: ${durability}, Random: ${randomNumber}`);
    
    // Different messages based on the roll
    const victoryMessages = [
        `🎉 You defeated ${heroName} with a critical hit!`,
        `💥 ${heroName} is down! You win!`,
        `⚡ ${heroName} couldn't withstand your attack!`,
        `🏆 You vanquished ${heroName}!`,
        `🔥 ${heroName} has fallen to your might!`,
        `👊 ${heroName} was no match for you!`,
        `💀 ${heroName} has been defeated!`
    ];
    
    const defeatMessages = [
        `💪 ${heroName}'s durability was too high!`,
        `🛡️ ${heroName} absorbed your attack!`,
        `😅 You couldn't break through ${heroName}'s defense!`,
        `⚔️ ${heroName} shrugged off your attack!`,
        `🔄 ${heroName} endured your assault!`,
        `🏋️ ${heroName} is too tough to defeat!`,
        `🧱 ${heroName}'s durability is legendary!`
    ];
    
    const randomVictory = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    const randomDefeat = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
    
    if (randomNumber > durability) {
        alert(`${randomVictory}\n\nYour roll: ${randomNumber}\n${heroName}'s durability: ${durability}`);
    } else {
        alert(`${randomDefeat}\n\nYour roll: ${randomNumber}\n${heroName}'s durability: ${durability}`);
    }
}