const API_BASE = "http://127.0.0.1:8010";

export async function fetchPortfolioAPI() {
    const res = await fetch(`${API_BASE}/portfolio`);
    if (!res.ok) throw new Error(`Failed to fetch portfolio: ${res.status}`);
    return res.json();
}

export async function addCoinAPI(id, symbol, amount) {
    const res = await fetch(`${API_BASE}/portfolio/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, symbol, amount })
    });
    if (!res.ok) throw new Error(`Failed to add coin: ${res.status}`);
    return res.json();
}

export async function removeCoinAPI(id) {
    const res = await fetch(`${API_BASE}/portfolio/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error(`Failed to remove coin: ${res.status}`);
    return res.json();
}

export async function searchCoinsAPI(query) {
    const res = await fetch(`${API_BASE}/coins/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
}
