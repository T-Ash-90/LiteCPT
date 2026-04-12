import './search.js';
import { fetchPortfolio } from './portfolio.js';
import { initAddCoin } from './coins.js';

document.getElementById("currency-select").addEventListener("change", fetchPortfolio);

initAddCoin();
fetchPortfolio();
