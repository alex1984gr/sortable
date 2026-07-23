# From Hero to Zero

A vanilla JavaScript superhero table app with:
- Remote data loading from the superhero API
- Interactive search by name
- Column sorting (text and numeric)
- Pagination with configurable page size
- Battle modal and hero removal/reset flow

## Project Structure

- [index.html](index.html): Page layout, controls, table, and script loading order
- [cmd/api.js](cmd/api.js): Data access layer (fetch heroes JSON)
- [cmd/app.js](cmd/app.js): App startup and event wiring
- [cmd/table.js](cmd/table.js): Filtering, sorting, pagination, and table rendering
- [cmd/battle.js](cmd/battle.js): Battle modal interactions and hero removal/reset
- [style.css](style.css): Styling

## How To Run

1. Open the project folder in a browser-friendly way (recommended: local web server).
2. Start a local server from the project root.
3. Open the served URL in your browser.

Example server options:
- Python: python3 -m http.server 8000
- Node (if installed): npx serve .

Then open:
- http://localhost:8000

## How To Use

1. Wait for the initial load.
   - The app fetches all heroes from the remote JSON endpoint.
2. Search heroes.
   - Type in the search box to filter by hero name after each keystroke.
3. Sort columns.
   - Click a sort button in any table header.
   - First click sorts ascending.
   - Next click on the same column toggles descending.
4. Change page size.
   - Use the page size dropdown: 10, 20, 50, 100, or All.
5. Navigate pages.
   - Use the pagination controls below the table.
6. Battle a hero.
   - Click any row to open the battle modal.
   - On victory, that hero is removed from the current dataset.
7. Reset heroes.
   - Click Reset Heroes to restore original fetched data and clear search/sort/page state.

## Data Flow Through The Code

### 1) Fetch Layer

- [cmd/api.js](cmd/api.js)
  - fetchHeroes requests the all.json endpoint.
  - Validates that response is successful and payload is an array.
  - Returns the hero array to the app initializer.

### 2) App Initialization Layer

- [cmd/app.js](cmd/app.js)
  - Runs on DOMContentLoaded.
  - Binds UI listeners for:
    - search input
    - page size change
    - reset button
  - Calls fetchHeroes.
  - Stores three global datasets:
    - originalHeroes: immutable baseline snapshot
    - allHeroes: mutable working set (used for removals)
    - filteredData: post filter/sort list for rendering
  - Triggers applyFiltersAndSort for first render.

### 3) Table Pipeline Layer

- [cmd/table.js](cmd/table.js)

The main render pipeline is:
1. Filter
   - applyFiltersAndSort filters allHeroes by search term on hero name.
2. Sort
   - compareHeroes sorts by currentSort state.
   - Numeric columns use numeric comparison.
   - Height and weight are normalized to consistent units for accurate sorting.
   - Missing values are always pushed to the end.
3. Paginate
   - getCurrentPageData slices filteredData according to pageSize and currentPage.
4. Render
   - renderTable paints rows.
   - renderPagination paints page controls.
   - updatePaginationInfo updates range counters.

### 4) Battle Layer

- [cmd/battle.js](cmd/battle.js)
  - Row click opens modal with battle result.
  - On victory:
    - removeHero removes that hero from allHeroes
    - applyFiltersAndSort re-runs filter, sort, pagination, and render
    - defeated counter increments
  - Reset restores from originalHeroes and re-applies the full table pipeline.

## Sorting Rules Implemented

In [cmd/table.js](cmd/table.js):
- Default sort: name ascending
- Click same column: toggle ascending/descending
- Click new column: ascending
- Numeric fields sorted numerically
- Height normalization:
  - supports cm, m, meter(s), km, kilometer(s)
- Weight normalization:
  - supports kg, kilogram(s), ton, tons, tonne, tonnes, t
- Missing values always sorted last regardless of direction

## Search Rules Implemented

In [cmd/app.js](cmd/app.js) and [cmd/table.js](cmd/table.js):
- Interactive search on each input event
- Case-insensitive match on hero name
- Search resets page to 1

## Notes

- This app uses plain JavaScript only (no framework).
- If remote fetch fails, the table shows a load failure row.
- The CDN can block non-browser terminal requests, but browser fetch typically works.
