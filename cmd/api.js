// Central source URL for the superhero dataset.
const HEROES_URL = "https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json";

// Fetches the remote JSON file and returns it as a validated array.
async function fetchHeroes() {
    // Request the data from the network.
    const response = await fetch(HEROES_URL);
    // Stop early if the response failed.
    if (!response.ok) {
        throw new Error(`Failed to fetch heroes: ${response.status}`);
    }

    // Convert the response body from JSON into JavaScript data.
    const heroes = await response.json();
    // Make sure the payload is the kind of data the rest of the app expects.
    if (!Array.isArray(heroes)) {
        throw new Error("Unexpected heroes payload");
    }

    // Return the loaded list to the caller.
    return heroes;
}

// Expose the fetch function to the rest of the app.
window.fetchHeroes = fetchHeroes;