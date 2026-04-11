from pathlib import Path
from typing import Optional

#----------------------------------------
# Constants
#----------------------------------------
APP = FastAPI()

COINGECKO_API = "https://api.coingecko.com/api/v3"
CURRENCIES = ['usd', 'eur', 'gbp']

DATA_DIR = Path(__file__).parent / "data"
COIN_IMAGES_FILE = DATA_DIR / "coin_images.json"
COIN_LIST_FILE = DATA_DIR / "coin_list.json"
PORTFOLIO_FILE = DATA_DIR / "portfolio.json"
