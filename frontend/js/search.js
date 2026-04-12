import { searchCoinsAPI } from './api.js';
import { createLogger } from './logs.js';

const log = createLogger("SEARCH");
const coinSearchInput = document.getElementById("coin-search");
const searchResults = document.getElementById("search-results");

export let selectedCoinId = null;
export let selectedCoinSymbol = null;

let debounceTimeout = null;

coinSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    if (!query) {
        log.info("Search cleared");
        searchResults.style.display = "none";
        return;
    }

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
        try {
            log.info("Searching coins", { query });

            const data = await searchCoinsAPI(query);

            const results = data?.results || [];

            log.success("Search results received", {
                query,
                count: results.length
            });

            searchResults.innerHTML = "";

            if (results.length === 0) {
                log.warn("No search results found", { query });
            }

            results.forEach(c => {
                const div = document.createElement("div");
                div.className = "search-result-item";

                let coinText = `${c.name} (${c.symbol})`;

                if (c.image) {
                    const img = document.createElement("img");
                    img.src = c.image;
                    img.alt = `${c.name} logo`;
                    img.className = "coin-logo";
                    div.appendChild(img);
                }

                const textDiv = document.createElement("div");
                textDiv.textContent = coinText;
                div.appendChild(textDiv);

                div.addEventListener("click", () => {
                    selectedCoinId = c.id;
                    selectedCoinSymbol = c.symbol;

                    log.success("Coin selected from search", {
                        id: c.id,
                        symbol: c.symbol,
                        name: c.name
                    });

                    coinSearchInput.value = c.name;
                    searchResults.style.display = "none";
                });

                searchResults.appendChild(div);
            });

            searchResults.style.display = "block";

        } catch (err) {
            log.error("Search failed", err);
        }
    }, 300);
});
