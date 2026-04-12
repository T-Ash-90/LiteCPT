import { addCoinAPI, removeCoinAPI } from './api.js';
import { fetchPortfolio } from './portfolio.js';
import { selectedCoinId, selectedCoinSymbol } from './search.js';
import { createLogger } from './logs.js';

const log = createLogger("COINS");
const addCoinBtn = document.getElementById("add-coin-btn");
const amountInput = document.getElementById("amount");

export function initAddCoin() {
    log.info("Initializing add coin handler");

    if (!addCoinBtn) {
        log.error("Add coin button not found in DOM");
        return;
    }

    addCoinBtn.addEventListener("click", async () => {
        const amount = parseFloat(amountInput.value);

        log.info("Add coin clicked", {
            selectedCoinId,
            selectedCoinSymbol,
            rawInput: amountInput.value,
            parsedAmount: amount
        });

        // Validation
        if (!selectedCoinId || !selectedCoinSymbol || isNaN(amount)) {
            log.warn("Invalid input when adding coin", {
                selectedCoinId,
                selectedCoinSymbol,
                amount
            });
            alert("Select a coin and enter a valid amount.");
            return;
        }

        try {
            log.info("Calling addCoinAPI", {
                id: selectedCoinId,
                symbol: selectedCoinSymbol,
                amount
            });

            await addCoinAPI(selectedCoinId, selectedCoinSymbol, amount);

            log.success("Coin added successfully", {
                id: selectedCoinId,
                amount
            });

            amountInput.value = "";

            log.info("Refreshing portfolio after add");
            fetchPortfolio();

        } catch (err) {
            log.error("Add coin failed", err);
            alert("Failed to add coin.");
        }
    });
}

export function attachRemoveHandlers() {
    log.info("Attaching remove handlers");

    const buttons = document.querySelectorAll(".remove-btn");

    if (!buttons.length) {
        log.warn("No remove buttons found in DOM");
        return;
    }

    buttons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const coinId = btn.dataset.id;
            const coinName = coinId ? coinId.toUpperCase() : "THIS HOLDING";

            log.info("Remove button clicked", { coinId });

            const confirmed = confirm(`Are you sure you want to remove ${coinName}?`);

            if (!confirmed) {
                log.warn("User cancelled removal", { coinId });
                return;
            }

            try {
                log.info("Calling removeCoinAPI", { coinId });

                await removeCoinAPI(coinId);

                log.success("Coin removed successfully", { coinId });

                log.info("Refreshing portfolio after removal");
                fetchPortfolio();

            } catch (err) {
                log.error("Remove coin failed", err);
                alert("Failed to remove coin.");
            }
        });
    });
}
