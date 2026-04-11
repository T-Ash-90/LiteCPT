import requests
import json
from pathlib import Path
from typing import List, Dict, Union
from .config import COINGECKO_API, CURRENCIES, COIN_IMAGES_FILE, COIN_LIST_FILE

#----------------------------------------
# CoinGecko API: Get a full coin list
#----------------------------------------
def get_coin_list() -> list[dict]:
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
# CoinGecko API: Get image for an indiviual coin
#----------------------------------------
def get_coin_image(coin_id: str) -> str:
    if COIN_IMAGES_FILE.exists():
        with open(COIN_IMAGES_FILE, "r") as f:
            coins_cache = json.load(f)
    else:
        coins_cache = {}
    if coin_id in coins_cache:
        return coins_cache[coin_id]
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
    url = f"{COINGECKO_API}/simple/price"
    if isinstance(ids, list):
        ids = ",".join(ids)
    vs_currencies = ",".join(CURRENCIES)
    params = {
        "ids": ids,
        "vs_currencies": vs_currencies,
        "include_market_cap": "true",
        "include_24hr_vol": "true",
        "include_24hr_change": "true"
    }
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()
