import './search.js';
import { fetchPortfolio } from './portfolio.js';
import { initAddCoin } from './coins.js';
import { createLogger } from './logs.js';

const log = createLogger("APP");

log.info("App initializing...");

const currencySelect = document.getElementById("currency-select");

if (!currencySelect) {
    log.error("Currency select element not found");
} else {
    currencySelect.addEventListener("change", () => {
        log.info("Currency changed", { currency: currencySelect.value });
        fetchPortfolio();
    });
}

try {
    initAddCoin();
} catch (err) {
    log.error("Failed to initialize add coin module", err);
}

try {
    log.info("Fetching initial portfolio");
    fetchPortfolio();
} catch (err) {
    log.error("Initial portfolio fetch failed", err);
}

log.success("App initialized");
