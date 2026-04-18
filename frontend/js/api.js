import { createLogger } from './logs.js';

const log = createLogger("API");
const API_BASE = "http://127.0.0.1:8010";

export async function fetchPortfolioAPI() {
    const url = `${API_BASE}/portfolio`;
    log.info("Fetching portfolio", { url });

    try {
        const res = await fetch(url);

        if (!res.ok) {
            log.error("Fetch portfolio failed", { status: res.status });
            throw new Error(`Failed to fetch portfolio: ${res.status}`);
        }

        const data = await res.json();
        log.success("Portfolio fetched successfully", data);

        return data;
    } catch (err) {
        log.error("Fetch portfolio error", err);
        throw err;
    }
}

export async function addCoinAPI(id, symbol, amount) {
    const url = `${API_BASE}/portfolio/add`;
    const payload = { id, symbol, amount };

    log.info("Adding coin", payload);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            log.error("Add coin request failed", { status: res.status, payload });
            throw new Error(`Failed to add coin: ${res.status}`);
        }

        const data = await res.json();
        log.success("Coin added via API", data);

        return data;
    } catch (err) {
        log.error("Add coin API error", err);
        throw err;
    }
}

export async function removeCoinAPI(id) {
    const url = `${API_BASE}/portfolio/remove`;
    const payload = { id };

    log.info("Removing coin", payload);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            log.error("Remove coin request failed", { status: res.status, payload });
            throw new Error(`Failed to remove coin: ${res.status}`);
        }

        const data = await res.json();
        log.success("Coin removed via API", data);

        return data;
    } catch (err) {
        log.error("Remove coin API error", err);
        throw err;
    }
}

export async function editCoinAPI(id, amount) {
    const url = `${API_BASE}/portfolio/edit`;
    const payload = { id, amount };

    log.info("Editing coin", payload);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            log.error("Edit coin request failed", { status: res.status, payload });
            throw new Error(`Failed to edit coin: ${res.status}`);
        }

        const data = await res.json();
        log.success("Coin edited via API", data);

        return data;
    } catch (err) {
        log.error("Edit coin API error", err);
        throw err;
    }
}

export async function searchCoinsAPI(query) {
    const url = `${API_BASE}/coins/search?q=${encodeURIComponent(query)}`;

    log.info("Searching coins", { query, url });

    try {
        const res = await fetch(url);

        if (!res.ok) {
            log.error("Search request failed", { status: res.status, query });
            throw new Error(`Search failed: ${res.status}`);
        }

        const data = await res.json();
        log.success("Search results received", {
            query,
            resultCount: data?.results?.length
        });

        return data;
    } catch (err) {
        log.error("Search API error", err);
        throw err;
    }
}
