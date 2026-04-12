from pathlib import Path

# ----------------------------------------
# Paths
# ----------------------------------------
DATA_DIR = Path(__file__).parent / "data"
PORTFOLIO_FILE = DATA_DIR / "portfolio.json"
COIN_INDEX_FILE = DATA_DIR / "coin_index.json"

# ----------------------------------------
# API
# ----------------------------------------
COINGECKO_API = "https://api.coingecko.com/api/v3"
CURRENCIES = ["usd", "eur", "gbp"]

# ----------------------------------------
# Runtime cache (prices only)
# ----------------------------------------
PRICE_CACHE: dict = {}
CACHE_EXPIRY = 60

# ----------------------------------------
# Rate limiting
# ----------------------------------------
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX_CALLS = 45
