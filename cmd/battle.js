// ============================================
// BATTLE & MODAL FUNCTIONS
// ============================================

window.defeatedHeroesCount = 0;

function handleHeroClick(heroName, durability) {
    // Generate random number between 1 and 120
    const randomNumber = Math.floor(Math.random() * 120) + 1;
    
    console.log(`Hero: ${heroName}, Durability: ${durability}, Random: ${randomNumber}`);
    
    // Different messages based on the roll
    const victoryMessages = [
        `You defeated ${heroName} with a critical hit!`,
        `${heroName} is down! You win!`,
        `${heroName} couldn't withstand your attack!`,
        `You vanquished ${heroName}!`,
        `${heroName} has fallen to your might!`,
        `${heroName} was no match for you!`,
        `${heroName} has been defeated!`
    ];
    
    const defeatMessages = [
        `${heroName}'s durability was too high!`,
        `${heroName} absorbed your attack!`,
        `You couldn't break through ${heroName}'s defense!`,
        `${heroName} shrugged off your attack!`,
        `${heroName} endured your assault!`,
        `${heroName} is too tough to defeat!`,
        `${heroName}'s durability is legendary!`
    ];
    
    const randomVictory = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    const randomDefeat = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
    
    const isVictory = randomNumber > durability;
    const message = isVictory ? randomVictory : randomDefeat;
    const resultClass = isVictory ? 'victory' : 'defeat';

    showModal({
        title: `Battle Result`,
        message: message,
        stats: `
            <div class="stat-row">
                <span class="stat-label">Your Roll:</span>
                <span class="stat-value ${randomNumber > durability ? 'win' : 'lose'}">${randomNumber}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">${heroName}'s Durability:</span>
                <span class="stat-value">${durability}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Result:</span>
                <span class="stat-value ${resultClass}">${isVictory ? 'VICTORY!' : 'DEFEAT!'}</span>
            </div>
        `,
        resultClass: resultClass,
        heroName: heroName,
        isVictory: isVictory
    });
}

function showModal(data) {
    const modal = document.getElementById('heroModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalStats = document.getElementById('modalStats');
    const modalButton = document.getElementById('modalButton');
    
    if (!modal || !modalTitle || !modalMessage || !modalStats || !modalButton) {
        console.error('Modal elements not found!');
        return;
    }
    
    modalTitle.textContent = data.title || 'Battle Result';
    modalMessage.textContent = data.message || 'The battle has concluded!';
    modalStats.innerHTML = data.stats || '';
    
    modal.className = 'modal';
    if (data.resultClass) {
        modal.classList.add(data.resultClass);
    }
    
    modal.style.display = 'flex';
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            if (data.isVictory && data.heroName) {
                removeHero(data.heroName);
            }
        };
    }
    
    modalButton.onclick = function() {
        modal.style.display = 'none';
        if (data.isVictory && data.heroName) {
            removeHero(data.heroName);
        }
    };
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (data.isVictory && data.heroName) {
                removeHero(data.heroName);
            }
        }
    };
    
    const escapeHandler = function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
            if (data.isVictory && data.heroName) {
                removeHero(data.heroName);
            }
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function removeHero(heroName) {
    const index = window.filteredData.findIndex(hero => hero.name === heroName);
    
    if (index !== -1) {
        window.filteredData.splice(index, 1);
        window.defeatedHeroesCount++;
        window.updateDisplay();
        updateDefeatedCounter();        
    }
}

function updateDefeatedCounter() {
    const counter = document.getElementById('defeated-counter');
    if (counter) {
        counter.textContent = `Heroes defeated: ${window.defeatedHeroesCount}`;
    }
}

function resetHeroes() {
    window.filteredData = [...window.sampleData];
    window.defeatedHeroesCount = 0;
    window.currentPage = 1;
    window.updateDisplay();
    updateDefeatedCounter();
}

function resetHeroes() {
    // Reset sort state
    if (window.currentSort) {
        window.currentSort.column = null;
        window.currentSort.direction = null;
    }
    
    // Reset data
    window.filteredData = [...window.sampleData];
    window.defeatedHeroesCount = 0;
    window.currentPage = 1;
    
    // Update the display
    window.updateDisplay();
    if (window.updateSortButtons) {
        window.updateSortButtons(); // Clear sort indicators
    }
    window.updateDefeatedCounter();
}

// Make functions globally accessible
window.handleHeroClick = handleHeroClick;
window.showModal = showModal;
window.removeHero = removeHero;
window.resetHeroes = resetHeroes;
window.updateDefeatedCounter = updateDefeatedCounter;