import requests
import json
import time
from typing import List, Union
from .config import (
    COINGECKO_API,
    CURRENCIES,
    PRICE_CACHE,
    CACHE_EXPIRY,
    RATE_LIMIT_WINDOW,
    RATE_LIMIT_MAX_CALLS,
    COIN_INDEX_FILE,
    TIMEOUT
)

# ----------------------------------------
# Rate limiter
# ----------------------------------------
class RateLimiter:
    def __init__(self, window: int, max_calls: int):
        self.window = window
        self.max_calls = max_calls
        self._timestamps: list[float] = []

    def check(self):
        now = time.time()
        self._timestamps = [t for t in self._timestamps if now - t < self.window]
        if len(self._timestamps) >= self.max_calls:
            raise Exception("CoinGecko API rate limit reached.")
        self._timestamps.append(now)


rate_limiter = RateLimiter(RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_CALLS)


def check_rate_limit():
    rate_limiter.check()


# ----------------------------------------
# Coin index IO helpers
# ----------------------------------------
def load_coin_index() -> list[dict]:
    if COIN_INDEX_FILE.exists():
        with open(COIN_INDEX_FILE, "r") as f:
            return json.load(f)
    return build_coin_index()


def save_coin_index(data: list[dict]):
    COIN_INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(COIN_INDEX_FILE, "w") as f:
        json.dump(data, f, indent=2)


def update_coin_index_coin(coin_id: str, updates: dict):
    if not COIN_INDEX_FILE.exists():
        return

    with open(COIN_INDEX_FILE, "r") as f:
        data = json.load(f)

    changed = False

    for coin in data:
        if coin["id"] == coin_id:
            coin.update(updates)
            changed = True
            break

    if changed:
        save_coin_index(data)


# ----------------------------------------
# Full Coin list
# ----------------------------------------
def get_coin_list() -> list[dict]:
    check_rate_limit()
    url = f"{COINGECKO_API}/coins/list"
    r = requests.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def load_coin_list() -> list[dict]:
    return get_coin_list()


# ----------------------------------------
# Fetch images
# ----------------------------------------
def get_coin_image(coin_id: str) -> str:
    check_rate_limit()

    url = f"{COINGECKO_API}/coins/{coin_id}"
    r = requests.get(url, timeout=TIMEOUT)
    r.raise_for_status()

    data = r.json()
    image_url = data.get("image", {}).get("large", "")

    update_coin_index_coin(coin_id, {"image": image_url})

    return image_url


# ----------------------------------------
# Prices
# ----------------------------------------
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
            "include_24hr_change": "true",
            "precision": 10
        }

        r = requests.get(url, params=params, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()

        for coin_id, price_data in data.items():
            PRICE_CACHE[coin_id] = (now, price_data)
            result[coin_id] = price_data

    return result


# ----------------------------------------
# Coin index builder
# ----------------------------------------
def build_coin_index() -> list[dict]:
    check_rate_limit()

    all_coins = load_coin_list()

    url = f"{COINGECKO_API}/coins/markets"

    market_data = {}
    top_ids = set()

    for page in [1, 2]:
        check_rate_limit()

        params = {
            "vs_currency": "eur",
            "order": "market_cap_desc",
            "per_page": 250,
            "page": page,
            "sparkline": "false"
        }

        r = requests.get(url, params=params, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()

        for c in data:
            coin_id = c["id"]
            top_ids.add(coin_id)

            market_data[coin_id] = {
                "image": c.get("image", ""),
                "market_cap_rank": c.get("market_cap_rank")
            }

    enriched = []

    for c in all_coins:
        coin_id = c["id"]
        market = market_data.get(coin_id, {})

        enriched.append({
            "id": coin_id,
            "symbol": c.get("symbol", ""),
            "name": c.get("name", ""),
            "image": market.get("image", ""),
            "market_cap_rank": market.get("market_cap_rank"),
            "top_500": coin_id in top_ids
        })

    save_coin_index(enriched)
    return enriched
