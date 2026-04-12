import { searchCoinsAPI } from './api.js';

const coinSearchInput = document.getElementById("coin-search");
const searchResults = document.getElementById("search-results");

export let selectedCoinId = null;
export let selectedCoinSymbol = null;

coinSearchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (!query) {
        searchResults.style.display = "none";
        return;
    }
    try {
        const data = await searchCoinsAPI(query);
        searchResults.innerHTML = "";
        data.results.forEach(c => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.textContent = `${c.name} (${c.symbol})`;
            div.addEventListener("click", () => {
                selectedCoinId = c.id;
                selectedCoinSymbol = c.symbol;
                coinSearchInput.value = c.name;
                searchResults.style.display = "none";
            });
            searchResults.appendChild(div);
        });
        searchResults.style.display = "block";
    } catch (err) {
        console.error("Search error:", err);
    }
});
