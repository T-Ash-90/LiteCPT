import requests
import json
import time
from pathlib import Path
from typing import List, Dict, Union
from .config import COINGECKO_API, CURRENCIES, COIN_IMAGES_FILE, COIN_LIST_FILE, PRICE_CACHE, CACHE_EXPIRY, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_CALLS

#----------------------------------------
# Rate limit logic
#----------------------------------------
class RateLimiter:
    def __init__(self, window: int, max_calls: int):
        self.window = window
        self.max_calls = max_calls
        self._timestamps: list[float] = []

    def check(self):
        now = time.time()
        self._timestamps = [t for t in self._timestamps if now - t < self.window]
        if len(self._timestamps) >= self.max_calls:
            raise Exception("CoinGecko API rate limit reached. Try again later.")
        self._timestamps.append(now)

rate_limiter = RateLimiter(window=RATE_LIMIT_WINDOW, max_calls=RATE_LIMIT_MAX_CALLS)

def check_rate_limit():
    rate_limiter.check()

#----------------------------------------
# CoinGecko API: Get a full coin list
#----------------------------------------
def get_coin_list() -> list[dict]:
    check_rate_limit()
    url = f"{COINGECKO_API}/coins/list"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    data = response.json()
    COIN_LIST_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(COIN_LIST_FILE, "w") as f:
        json.dump(data, f, indent=2)
    return data

#----------------------------------------
# Load coin list
#----------------------------------------
def load_coin_list() -> list[dict]:
    if COIN_LIST_FILE.exists():
        with open(COIN_LIST_FILE, "r") as f:
            return json.load(f)
    return get_coin_list()

#----------------------------------------
# CoinGecko API: Get image for an individual coin
#----------------------------------------
def get_coin_image(coin_id: str) -> str:
    if COIN_IMAGES_FILE.exists():
        with open(COIN_IMAGES_FILE, "r") as f:
            coins_cache = json.load(f)
    else:
        coins_cache = {}
    if coin_id in coins_cache:
        return coins_cache[coin_id]
    check_rate_limit()
    url = f"{COINGECKO_API}/coins/{coin_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    image_url = data.get("image", {}).get("large", "")
    coins_cache[coin_id] = image_url
    with open(COIN_IMAGES_FILE, "w") as f:
        json.dump(coins_cache, f, indent=2)
    return image_url

#----------------------------------------
# CoinGecko API: Get coin prices
#----------------------------------------
def get_coin_prices(ids: Union[str, List[str]]) -> dict:
    check_rate_limit()
    if isinstance(ids, str):
        ids = [ids]
    now = time.time()
    result = {}
    ids_to_fetch = []
    for coin_id in ids:
        cached = PRICE_CACHE.get(coin_id)
        if cached and now - cached[0] < CACHE_EXPIRY:
            result[coin_id] = cached[1]
        else:
            ids_to_fetch.append(coin_id)
    if ids_to_fetch:
        url = f"{COINGECKO_API}/simple/price"
        params = {
            "ids": ",".join(ids_to_fetch),
            "vs_currencies": ",".join(CURRENCIES),
            "include_24hr_change": "true"
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        fetched_prices = response.json()
        for coin_id, price_data in fetched_prices.items():
            PRICE_CACHE[coin_id] = (now, price_data)
            result[coin_id] = price_data
    return result
