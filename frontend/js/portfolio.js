import { fetchPortfolioAPI } from './api.js';
import { attachRemoveHandlers } from './coins.js';

const portfolioTableBody = document.querySelector("#portfolio-table tbody");
const portfolioTotal = document.getElementById("portfolio-total");
const currencySelect = document.getElementById("currency-select");

export async function fetchPortfolio() {
    try {
        const data = await fetchPortfolioAPI();
        renderPortfolio(data);
        attachRemoveHandlers();
    } catch (err) {
        console.error(err);
        portfolioTableBody.innerHTML = "<tr><td colspan='6'>Error loading portfolio.</td></tr>";
    }
}

export function renderPortfolio(data) {
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
                <div><div class="coin-name">${h.symbol.toUpperCase()}</div></div>
            </td>
            <td>${h.amount}</td>
            <td>${priceUnit}</td>
            <td>${total}</td>
            <td class="${change >= 0 ? 'positive' : 'negative'}">${change}%</td>
            <td>
                <button class="remove-btn" data-id="${h.id}">Remove</button>
            </td>
        `;
        portfolioTableBody.appendChild(tr);
    });

    const totalValue = data[`portfolio_value_${currency}`].toFixed(2);
    portfolioTotal.textContent = `Total Portfolio Value: ${totalValue} ${currency.toUpperCase()}`;
}
