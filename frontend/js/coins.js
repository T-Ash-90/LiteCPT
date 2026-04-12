import { addCoinAPI, removeCoinAPI } from './api.js';
import { fetchPortfolio } from './portfolio.js';
import { selectedCoinId, selectedCoinSymbol } from './search.js';

const addCoinBtn = document.getElementById("add-coin-btn");
const amountInput = document.getElementById("amount");

export function initAddCoin() {
    addCoinBtn.addEventListener("click", async () => {
        const amount = parseFloat(amountInput.value);
        if (!selectedCoinId || !selectedCoinSymbol || isNaN(amount)) {
            alert("Select a coin and enter a valid amount.");
            return;
        }
        try {
            await addCoinAPI(selectedCoinId, selectedCoinSymbol, amount);
            amountInput.value = "";
            fetchPortfolio();
        } catch (err) {
            console.error("Add coin error:", err);
            alert("Failed to add coin.");
        }
    });
}

export function attachRemoveHandlers() {
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                await removeCoinAPI(btn.dataset.id);
                fetchPortfolio();
            } catch (err) {
                console.error("Remove coin error:", err);
                alert("Failed to remove coin.");
            }
        });
    });
}
