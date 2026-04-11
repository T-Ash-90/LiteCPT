import requests
from typing import List, Dict, Union
from .config import COINGECKO_API, CURRENCIES

#----------------------------------------
# CoinGecko API: Get a full coin list
#----------------------------------------
def get_coin_list() -> List[Dict]:

    url = f"{COINGECKO_API}/coins/list"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch coin list: {e}") from e

#----------------------------------------
# CoinGecko API: Get data for an indiviual coin
#----------------------------------------
def get_coin_data(coin_id: str) -> Dict:

    url = f"{COINGECKO_API}/coins/{coin_id}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch coin data for {coin_id}: {str(e)}")

#----------------------------------------
# CoinGecko API: Get coin prices
#----------------------------------------
def get_coin_prices(ids: Union[str, List[str]]) -> dict:

    url = f"{COINGECKO_API}/simple/price"
    ids = ",".join(ids) if isinstance(ids, list) else ids
    vs_currencies = ",".join(CURRENCIES)
    params = {
        "ids": ids,
        "vs_currencies": vs_currencies,
        "include_market_cap": "true",
        "include_24hr_vol": "true",
        "include_24hr_change": "true"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        return data
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch prices: {str(e)}") from e
