import { fetchPortfolioAPI } from './api.js';
import { attachRemoveHandlers, attachEditHandlers } from './coins.js';
import { createLogger } from './logs.js';

const log = createLogger("PORTFOLIO");
const portfolioTableBody = document.querySelector("#portfolio-table tbody");
const portfolioTotal = document.getElementById("portfolio-total");
const currencySelect = document.getElementById("currency-select");

export async function fetchPortfolio() {
    log.info("Fetching portfolio (UI layer)");

    try {
        const data = await fetchPortfolioAPI();
        log.info("Portfolio data received", {
            holdingsCount: data?.holdings?.length
        });

        renderPortfolio(data);
        attachRemoveHandlers();
        attachEditHandlers();

    } catch (err) {
        log.error("Failed to fetch/render portfolio", err);
        if (portfolioTableBody) {
            portfolioTableBody.innerHTML = `
                <tr>
                    <td colspan='6' class="error-message">
                        Error loading portfolio. Please try again later.
                    </td>
                </tr>
            `;
        }
    }
}



export function renderPortfolio(data) {
    if (!portfolioTableBody || !portfolioTotal || !currencySelect) {
        log.error("Missing required DOM elements for portfolio rendering");
        return;
    }

    const currency = currencySelect.value;

    log.info("Rendering portfolio", {
        currency,
        holdingsCount: data?.holdings?.length
    });

    portfolioTableBody.innerHTML = "";

    if (!data?.holdings || data.holdings.length === 0) {
        log.warn("No holdings to display");
        portfolioTableBody.innerHTML =
            "<tr><td colspan='6'>No holdings found.</td></tr>";
        return;
    }

    data.holdings.forEach(h => {
        try {
            const tr = document.createElement("tr");
            const priceUnit = h.price_unit && h.price_unit[`${currency}_unit`] !== null
                ? h.price_unit[`${currency}_unit`].toFixed(4)
                : "N/A";
            const total = h.holding_total && h.holding_total[`${currency}_total`] !== null
                ? h.holding_total[`${currency}_total`].toFixed(2)
                : "N/A";
            const change = h.price_change && h.price_change[`${currency}_24h_change`] !== null
                ? h.price_change[`${currency}_24h_change`].toFixed(2)
                : "N/A";

            tr.innerHTML = `
                <td class="coin-cell">
                    <img src="${h.image || '/coin-placeholder.png'}" alt="${h.symbol}">
                    <div><div class="coin-name">${h.symbol.toUpperCase()}</div></div>
                </td>
                <td>${h.amount}</td>
                <td>${priceUnit}</td>
                <td>${total}</td>
                <td class="${change >= 0 ? 'positive' : 'negative'}">${change}%</td>
                <td>
                    <button class="edit-btn" data-id="${h.id}">Edit</button>
                    <button class="remove-btn" data-id="${h.id}">Remove</button>
                </td>
            `;

            portfolioTableBody.appendChild(tr);

        } catch (err) {
            log.error("Error rendering holding", { holding: h, err });
        }
    });

    try {
        const totalValue = data[`portfolio_value_${currency}`] !== null
            ? data[`portfolio_value_${currency}`].toFixed(2)
            : "N/A";

        portfolioTotal.textContent =
            `Total Portfolio Value: ${totalValue} ${currency.toUpperCase()}`;

        log.success("Portfolio rendered successfully", {
            totalValue,
            currency
        });

    } catch (err) {
        log.error("Failed to render portfolio total", err);
    }
}
