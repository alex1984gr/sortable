// Global UI state for sorting, filtering, and pagination.
const state = {
    column: "name",
    direction: "asc",
    page: 1,
    pageSize: 20,
    search: "",
};

// Columns that must be compared as numbers rather than text.
const numericColumns = new Set([
    "intelligence",
    "strength",
    "speed",
    "durability",
    "power",
    "combat",
    "height",
    "weight",
]);

// Maps table sort keys to the nested path in each hero object.
const columnPaths = {
    name: "name",
    fullName: "biography.fullName",
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
    placeOfBirth: "biography.placeOfBirth",
    alignment: "biography.alignment",
};

// Safely reads nested values using a dotted path like "biography.fullName".
function getPathValue(hero, path) {
    return path.split(".").reduce((current, part) => current?.[part], hero);
}

// Identifies placeholder or empty values so they can be sorted last.
function isMissingValue(value) {
    if (value == null) return true;
    if (typeof value === "string") {
        const text = value.trim().toLowerCase();
        return text === "" || text === "-" || text === "null" || text === "unknown";
    }
    return false;
}

// Cache references to the main UI elements we will read/update.
const heroesTableBody = document.querySelector("#heroes-table-body");
const paginationNav = document.querySelector("#pagination");
const searchInput = document.querySelector("#search-input");
const pageSizeSelect = document.querySelector("#page-size-select");
const sortableHeaders = document.querySelectorAll("th[data-sort-key]");

// In-memory data source after fetch, each hero gets a stable original index.
let heroes = [];

// Parses values like "108.0 meters" or "90,000 tons" into amount + unit.
function parseMeasurement(rawText) {
    if (typeof rawText !== "string") return null;

    const normalized = rawText.trim().toLowerCase().replace(/,/g, "");
    const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s*([a-z]+)?$/);
    if (!match) return null;

    const amount = Number(match[1]);
    const unit = (match[2] || "").toLowerCase();

    if (!Number.isFinite(amount)) return null;
    return { amount, unit };
}

// Normalizes all height formats to centimeters for numeric sorting.
function normalizeHeightToCm(heightValue) {
    if (!Array.isArray(heightValue)) return null;

    for (const candidate of heightValue) {
        const parsed = parseMeasurement(candidate);
        if (!parsed) continue;

        if (parsed.unit === "cm") return parsed.amount;
        if (parsed.unit === "m" || parsed.unit === "meter" || parsed.unit === "meters") return parsed.amount * 100;
        if (parsed.unit === "km" || parsed.unit === "kilometer" || parsed.unit === "kilometers") return parsed.amount * 100000;
    }

    return null;
}

// Normalizes all weight formats to kilograms for numeric sorting.
function normalizeWeightToKg(weightValue) {
    if (!Array.isArray(weightValue)) return null;

    for (const candidate of weightValue) {
        const parsed = parseMeasurement(candidate);
        if (!parsed) continue;

        if (parsed.unit === "kg" || parsed.unit === "kilogram" || parsed.unit === "kilograms") return parsed.amount;
        if (parsed.unit === "ton" || parsed.unit === "tons" || parsed.unit === "tonne" || parsed.unit === "tonnes" || parsed.unit === "t") {
            return parsed.amount * 1000;
        }
    }

    return null;
}

// Returns one consistent comparable value per column (number or normalized text).
function getComparableValue(hero, columnKey) {
    const path = columnPaths[columnKey];
    const raw = getPathValue(hero, path);

    if (columnKey === "height") return normalizeHeightToCm(raw);
    if (columnKey === "weight") return normalizeWeightToKg(raw);

    if (numericColumns.has(columnKey)) {
        const numberValue = Number(raw);
        return Number.isFinite(numberValue) ? numberValue : null;
    }

    if (typeof raw === "string") return raw.trim().toLowerCase();
    return raw;
}

// Core sort comparator used by Array.sort.
// Missing values are always pushed to the bottom regardless of direction.
function compareHeroes(leftHero, rightHero) {
    const key = state.column;
    const directionFactor = state.direction === "desc" ? -1 : 1;
    const leftValue = getComparableValue(leftHero, key);
    const rightValue = getComparableValue(rightHero, key);
    const leftMissing = isMissingValue(leftValue);
    const rightMissing = isMissingValue(rightValue);

    if (leftMissing && rightMissing) return leftHero.index - rightHero.index;
    if (leftMissing) return 1;
    if (rightMissing) return -1;

    let result = 0;

    if (numericColumns.has(key)) {
        result = leftValue - rightValue;
    } else {
        result = String(leftValue).localeCompare(String(rightValue));
    }

    if (result === 0) return leftHero.index - rightHero.index;
    return result * directionFactor;
}

// Filters the data by hero name using the current search term.
function getFilteredHeroes() {
    const term = state.search.trim().toLowerCase();

    if (!term) return heroes;

    return heroes.filter((hero) => hero.name.toLowerCase().includes(term));
}

// Produces a sorted copy to avoid mutating the original data array.
function getSortedHeroes(list) {
    return [...list].sort(compareHeroes);
}

// Slices sorted data to the active page unless "all" is selected.
function getPaginatedHeroes(list) {
    if (state.pageSize === "all") return list;

    const startIndex = (state.page - 1) * state.pageSize;
    return list.slice(startIndex, startIndex + state.pageSize);
}

// Renders table rows for the current page.
function renderTable(list) {
    heroesTableBody.innerHTML = list
        .map((hero) => {
            const fullName = getPathValue(hero, columnPaths.fullName) || "-";
            const intelligence = getComparableValue(hero, "intelligence") ?? "-";
            const strength = getComparableValue(hero, "strength") ?? "-";
            const speed = getComparableValue(hero, "speed") ?? "-";
            const durability = getComparableValue(hero, "durability") ?? "-";
            const power = getComparableValue(hero, "power") ?? "-";
            const combat = getComparableValue(hero, "combat") ?? "-";
            const race = getPathValue(hero, columnPaths.race) || "-";
            const gender = getPathValue(hero, columnPaths.gender) || "-";
            const height = getPathValue(hero, columnPaths.height)?.[1] ?? getPathValue(hero, columnPaths.height)?.[0] ?? "-";
            const weight = getPathValue(hero, columnPaths.weight)?.[1] ?? getPathValue(hero, columnPaths.weight)?.[0] ?? "-";
            const placeOfBirth = getPathValue(hero, columnPaths.placeOfBirth) || "-";
            const alignment = getPathValue(hero, columnPaths.alignment) || "-";

            return `
                <tr>
                    <td><img src="${hero.images.xs}" alt="${hero.name}" width="48" height="48"></td>
                    <td>${hero.name ?? "-"}</td>
                    <td>${fullName}</td>
                    <td>${intelligence}</td>
                    <td>${strength}</td>
                    <td>${speed}</td>
                    <td>${durability}</td>
                    <td>${power}</td>
                    <td>${combat}</td>
                    <td>${race}</td>
                    <td>${gender}</td>
                    <td>${height}</td>
                    <td>${weight}</td>
                    <td>${placeOfBirth}</td>
                    <td>${alignment}</td>
                </tr>
            `;
        })
        .join("");
}

// Creates page buttons and wires click handlers for page navigation.
function renderPagination(totalItems) {
    if (state.pageSize === "all") {
        paginationNav.innerHTML = "";
        return;
    }

    const pageCount = Math.max(1, Math.ceil(totalItems / state.pageSize));
    state.page = Math.min(state.page, pageCount);

    paginationNav.innerHTML = Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 1;
        const activeClass = pageNumber === state.page ? "aria-current=\"page\"" : "";
        return `<button type="button" data-page="${pageNumber}" ${activeClass}>${pageNumber}</button>`;
    }).join("");

    paginationNav.querySelectorAll("button[data-page]").forEach((button) => {
        button.addEventListener("click", () => {
            state.page = Number(button.dataset.page);
            render();
        });
    });
}

// Main render pipeline: filter -> sort -> paginate -> paint UI.
function render() {
    const filteredHeroes = getFilteredHeroes();
    const sortedHeroes = getSortedHeroes(filteredHeroes);
    const paginatedHeroes = getPaginatedHeroes(sortedHeroes);

    renderTable(paginatedHeroes);
    renderPagination(sortedHeroes.length);

    sortableHeaders.forEach((header) => {
        const sortKey = header.dataset.sortKey;
        header.setAttribute("aria-sort", sortKey === state.column ? state.direction : "none");
    });
}

// Registers all UI events for search, page size, and column sorting.
function bindEvents() {
    searchInput.addEventListener("input", () => {
        state.search = searchInput.value;
        state.page = 1;
        render();
    });

    pageSizeSelect.addEventListener("change", () => {
        state.pageSize = pageSizeSelect.value === "all" ? "all" : Number(pageSizeSelect.value);
        state.page = 1;
        render();
    });

    sortableHeaders.forEach((header) => {
        header.style.cursor = "pointer";

        header.addEventListener("click", () => {
            const sortKey = header.dataset.sortKey;

            if (state.column === sortKey) {
                state.direction = state.direction === "asc" ? "desc" : "asc";
            } else {
                state.column = sortKey;
                state.direction = "asc";
            }

            render();
        });
    });
}

// Loads remote data, adds stable row indices, and triggers first render.
async function loadHeroes() {
    const response = await fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json");
    const data = await response.json();
    heroes = data.map((hero, index) => ({ ...hero, index }));
    render();
}

// App bootstrap: hook events first, then fetch and render data.
bindEvents();
loadHeroes();