// Shared defeat counter for the battle mini-game.
window.defeatedHeroesCount = 0;

// Opens a battle modal and decides whether the hero is defeated.
function handleHeroClick(heroName, durability, alignment) {
    // Generate a random roll for the battle.
    const randomNumber = Math.floor(Math.random() * 180) + 1;

    console.log(`Hero: ${heroName}, Durability: ${durability}, Alignment: ${alignment}, Random: ${randomNumber}`);

    const isBad = alignment && alignment.toLowerCase() === 'bad';

    // Messages shown when the player wins.
    const victoryMessages = { 
        regular: [
            `You defeated ${heroName} with a critical hit!`,
            `${heroName} is down! You win!`,
            `${heroName} couldn't withstand your attack!`,
            `You vanquished ${heroName}!`,
            `${heroName} has fallen to your might!`,
            `${heroName} was no match for you!`,
            `${heroName} has been defeated!`
        ],
        bad: [
            `Metaksi katergaraiwn, eisai o pio katergaris!`
        ]
    };

    // Messages shown when the hero survives.
    const defeatMessages = {
        regular: [
            `${heroName}'s durability was too high!`,
            `${heroName} absorbed your attack!`,
            `You couldn't break through ${heroName}'s defense!`,
            `${heroName} shrugged off your attack!`,
            `${heroName} endured your assault!`,
            `${heroName} is too tough to defeat!`,
            `${heroName}'s durability is legendary!`
        ],
        bad: [
            `Metaksi katergaraiwn, eisai o ligotero katergaris...`
        ]
    };

    // Decide whether the battle was a win.
    const isVictory = randomNumber > durability;

    // Pick one random message from the correct list based on alignment and result.
    const messageArray = isVictory
        ? (isBad ? victoryMessages.bad : victoryMessages.regular)
        : (isBad ? defeatMessages.bad : defeatMessages.regular);

    const message = messageArray[Math.floor(Math.random() * messageArray.length)];
    const resultClass = isVictory ? 'victory' : 'defeat';

    // Set the title based on result and alignment
    const title = isVictory
        ? (isBad ? 'VILLAIN DEFEATED!' : 'Victory!')
        : (isBad ? 'Villain Wins!' : 'Defeat!');

    // Send the result to the modal renderer.
    showModal({
        title: title,
        message: message,
        stats: `
            <div class="stat-row">
                <span class="stat-label">Hero:</span>
                <span class="stat-value">${heroName}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Alignment:</span>
                <span class="stat-value ${isBad ? 'alignment-villain' : 'alignment-hero'}">${alignment || 'Unknown'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Your Roll:</span>
                <span class="stat-value ${isVictory ? 'win' : 'lose'}">${randomNumber}</span>
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
        isVictory: isVictory,
        isBad: isBad
    });
}

// Fills the modal elements with the battle result and shows it.
function showModal(data) {
    // Grab all modal pieces from the page.
    const modal = document.getElementById('heroModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalStats = document.getElementById('modalStats');
    const modalButton = document.getElementById('modalButton');

    if (!modal || !modalTitle || !modalMessage || !modalStats || !modalButton) {
        console.error('Modal elements not found!');
        return;
    }

    // Set the text and stats for the result.
    modalTitle.textContent = data.title || 'Battle Result';
    modalMessage.textContent = data.message || 'The battle has concluded!';
    modalStats.innerHTML = data.stats || '';

    // Reset the modal class list before applying the battle state.
    modal.className = 'modal';
    if (data.resultClass) {
        modal.classList.add(data.resultClass);
    }

    // Make the modal visible.
    modal.style.display = 'flex';

    // The close button hides the modal and removes the hero if necessary.
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
            if (data.isVictory && data.heroName) {
                removeHero(data.heroName);
            }
        };
    }

    // The footer button behaves the same way as the close icon.
    modalButton.onclick = function () {
        modal.style.display = 'none';
        if (data.isVictory && data.heroName) {
            removeHero(data.heroName);
        }
    };

    // Clicking the overlay outside the card closes the modal.
    modal.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (data.isVictory && data.heroName) {
                removeHero(data.heroName);
            }
        }
    };

    // Escape key also closes the modal.
    const escapeHandler = function (event) {
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

// Removes a defeated hero from the working dataset.
function removeHero(heroName) {
    // Find the hero in the live list.
    const index = window.allHeroes.findIndex((hero) => hero.name === heroName);

    if (index !== -1) {
        // Remove the hero, increment the counter, and redraw the table.
        window.allHeroes.splice(index, 1);
        window.defeatedHeroesCount++;
        window.applyFiltersAndSort();
        updateDefeatedCounter();
    }
}

// Updates the visible killstreak text.
function updateDefeatedCounter() {
    const counter = document.getElementById("defeated-counter");
    if (counter) {
        counter.textContent = `Killstreak: ${window.defeatedHeroesCount}`;
    }
}

// Restores the original dataset and clears transient UI state.
function resetHeroes() {
    if (!Array.isArray(window.originalHeroes) || window.originalHeroes.length === 0) {
        return;
    }

    // Put the sort state back to the default assignment behavior.
    window.currentSort.column = "name";
    window.currentSort.direction = "asc";
    // Clear search and restore the original hero list.
    window.searchTerm = "";
    window.allHeroes = [...window.originalHeroes];
    window.filteredData = [...window.originalHeroes];
    // Reset the counter and pagination.
    window.defeatedHeroesCount = 0;
    window.currentPage = 1;

    // Clear the search input so the UI matches the data state.
    const searchbar = document.getElementById("searchbar");
    if (searchbar) {
        searchbar.value = "";
    }

    // Refresh the sort labels and table contents.
    window.updateSortButtons();
    window.applyFiltersAndSort();
    updateDefeatedCounter();
}

// Make the battle helpers available to the rest of the app.
window.handleHeroClick = handleHeroClick;
window.showModal = showModal;
window.removeHero = removeHero;
window.resetHeroes = resetHeroes;
window.updateDefeatedCounter = updateDefeatedCounter;