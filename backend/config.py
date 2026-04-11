from pydantic import BaseModel

#----------------------------------------
# Constants
#----------------------------------------
APP = FastApi()

COINGECKO_API = "https://api.coingecko.com/api/v3"
CURRENCIES = ['usd', 'eur', 'gbp']
LOCALHOST = "http://127.0.0.1:8010"

DATA_DIR = Path(__file__).parent / "data"
PORTFOLIO_FILE = DATA_DIR / "portfolio.json"
COINS_FILE = DATA_DIR / "coins.json"

#----------------------------------------
# Models
#----------------------------------------
class Holding(BaseModel):
    id: str
    symbol: str
    amount: float
    image: Optional[str] = None

class Portfolio(BaseModel):
    holdings: list[Holding]
