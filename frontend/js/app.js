const API_BASE = "http://127.0.0.1:8010";

// Elements
const portfolioTableBody = document.querySelector("#portfolio-table tbody");
const portfolioTotal = document.getElementById("portfolio-total");
const currencySelect = document.getElementById("currency-select");
const coinSearchInput = document.getElementById("coin-search");
const searchResults = document.getElementById("search-results");
const addCoinBtn = document.getElementById("add-coin-btn");
const amountInput = document.getElementById("amount");

let selectedCoinId = null;
let selectedCoinSymbol = null; // store symbol too

// Fetch portfolio
async function fetchPortfolio() {
    try {
        const res = await fetch(`${API_BASE}/portfolio`);
        if (!res.ok) {
            console.error("Failed to fetch portfolio:", res.status, res.statusText);
            portfolioTableBody.innerHTML = "<tr><td colspan='6'>Failed to load portfolio.</td></tr>";
            return;
        }
        const data = await res.json();
        if (!data || !data.holdings) {
            portfolioTableBody.innerHTML = "<tr><td colspan='6'>No portfolio data.</td></tr>";
            return;
        }
        renderPortfolio(data);
    } catch (err) {
        console.error("Error fetching portfolio:", err);
        portfolioTableBody.innerHTML = "<tr><td colspan='6'>Error loading portfolio.</td></tr>";
    }
}

// Render portfolio table
function renderPortfolio(data) {
    const currency = currencySelect.value;
    portfolioTableBody.innerHTML = "";

    data.holdings.forEach(h => {
        const tr = document.createElement("tr");

        const priceUnit = h.price_unit[`${currency}_unit`].toFixed(4);
        const total = h.holding_total[`${currency}_total`].toFixed(2);
        const change = h.price_change[`${currency}_24h_change`].toFixed(2);

        tr.innerHTML = `
            <td class="coin-cell">
                <img src="${h.image}" alt="${h.symbol}">
                <div>
                    <div class="coin-name">${h.symbol.toUpperCase()}</div>
                </div>
            </td>
            <td>${h.amount}</td>
            <td>${priceUnit}</td>
            <td>${total}</td>
            <td class="${change >= 0 ? 'positive' : 'negative'}">${change}%</td>
            <td>
                <button onclick="removeCoin('${h.id}')">Remove</button>
            </td>
        `;
        portfolioTableBody.appendChild(tr);
    });

    const totalValue = data[`portfolio_value_${currency}`].toFixed(2);
    portfolioTotal.textContent = `Total Portfolio Value: ${totalValue} ${currency.toUpperCase()}`;
}

// Remove coin
async function removeCoin(id) {
    await fetch(`${API_BASE}/portfolio/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    fetchPortfolio();
}

// Search coins
coinSearchInput.addEventListener("input", async (e) => {
    const q = e.target.value.trim();
    if (!q) {
        searchResults.style.display = "none";
        return;
    }
    const res = await fetch(`${API_BASE}/coins/search?q=${q}`);
    const data = await res.json();
    searchResults.innerHTML = "";
    data.results.forEach(c => {
        const div = document.createElement("div");
        div.className = "search-result-item";
        div.textContent = `${c.name} (${c.symbol})`;
        div.addEventListener("click", () => {
            selectedCoinId = c.id;
            selectedCoinSymbol = c.symbol; // store symbol
            coinSearchInput.value = c.name;
            searchResults.style.display = "none";
        });
        searchResults.appendChild(div);
    });
    searchResults.style.display = "block";
});

// Add coin
addCoinBtn.addEventListener("click", async () => {
    const amount = parseFloat(amountInput.value);
    if (!selectedCoinId || !selectedCoinSymbol || isNaN(amount)) {
        alert("Select a coin and enter a valid amount.");
        return;
    }
    try {
        await fetch(`${API_BASE}/portfolio/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedCoinId,
                symbol: selectedCoinSymbol,
                amount
            })
        });
        // Reset inputs
        selectedCoinId = null;
        selectedCoinSymbol = null;
        coinSearchInput.value = "";
        amountInput.value = "";
        fetchPortfolio();
    } catch (err) {
        console.error("Error adding coin:", err);
        alert("Failed to add coin. See console for details.");
    }
});

// Update table when currency changes
currencySelect.addEventListener("change", fetchPortfolio);

// Initial load
fetchPortfolio();
