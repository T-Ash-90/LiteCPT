from fastapi import FastAPI
from pathlib import Path
from typing import Optional

#----------------------------------------
# File paths
#----------------------------------------
DATA_DIR = Path(__file__).parent / "data"
COIN_IMAGES_FILE = DATA_DIR / "coin_images.json"
COIN_LIST_FILE = DATA_DIR / "coin_list.json"
PORTFOLIO_FILE = DATA_DIR / "portfolio.json"

#----------------------------------------
# CoinGecko API Settings
#----------------------------------------
COINGECKO_API = "https://api.coingecko.com/api/v3"
CURRENCIES = ['usd', 'eur', 'gbp']
PRICE_CACHE: dict = {}
CACHE_EXPIRY = 60
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX_CALLS = 45
