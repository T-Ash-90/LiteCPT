import json
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Query
from pydantic import BaseModel
from .config import APP, PORTFOLIO_FILE
from .coins import get_coin_image, get_coin_prices, load_coin_list

#----------------------------------------
# Load coin list at startup (in-memory cache)
#----------------------------------------
COIN_LIST_CACHE = load_coin_list()
COIN_IDS_CACHE = {c["id"] for c in COIN_LIST_CACHE}

#----------------------------------------
# Pydantic models for add/remove
#----------------------------------------
class CoinAdd(BaseModel):
    id: str
    symbol: str
    amount: float

class CoinRemove(BaseModel):
    id: str

#----------------------------------------
# Load/save portfolio helpers
#----------------------------------------
def load_portfolio():
    if PORTFOLIO_FILE.exists():
        with open(PORTFOLIO_FILE, "r") as f:
            return json.load(f).get("holdings", [])
    return []

def save_portfolio(holdings):
    with open(PORTFOLIO_FILE, "w") as f:
        json.dump({"holdings": holdings}, f, indent=2)

#----------------------------------------
# Endpoint: Get portfolio
#----------------------------------------
@APP.get("/portfolio")
def portfolio():
    holdings_data = load_portfolio()
    coin_ids = [h["id"] for h in holdings_data]
    prices = get_coin_prices(coin_ids)

    portfolio_final = []
    for h in holdings_data:
        coin_id = h["id"]
        image_url = get_coin_image(coin_id)
        h_final = {
            "id": coin_id,
            "symbol": h["symbol"],
            "amount": h["amount"],
            "image": image_url,
            "price": prices.get(coin_id),
            "total_value_usd": h["amount"] * prices.get(coin_id, {}).get("usd", 0)
        }
        portfolio_final.append(h_final)

    return JSONResponse(content={"holdings": portfolio_final})

#----------------------------------------
# Endpoint: Add coin
#----------------------------------------
@APP.post("/portfolio/add")
def add_coin(coin: CoinAdd):
    # Validate coin ID
    if coin.id not in COIN_IDS_CACHE:
        raise HTTPException(status_code=400, detail=f"{coin.id} is not a valid coin ID")

    holdings = load_portfolio()

    for h in holdings:
        if h["id"] == coin.id:
            h["amount"] += coin.amount
            save_portfolio(holdings)
            return {"message": f"Updated {coin.id} amount to {h['amount']}"}

    image_url = get_coin_image(coin.id)
    holdings.append({
        "id": coin.id,
        "symbol": coin.symbol,
        "amount": coin.amount,
        "image": image_url
    })
    save_portfolio(holdings)
    return {"message": f"Added {coin.id} to portfolio"}

#----------------------------------------
# Endpoint: Remove coin
#----------------------------------------
@APP.post("/portfolio/remove")
def remove_coin(coin: CoinRemove):
    holdings = load_portfolio()
    new_holdings = [h for h in holdings if h["id"] != coin.id]

    if len(new_holdings) == len(holdings):
        raise HTTPException(status_code=404, detail=f"{coin.id} not found in portfolio")

    save_portfolio(new_holdings)
    return {"message": f"Removed {coin.id} from portfolio"}

#----------------------------------------
# Endpoint: Search Coins
#----------------------------------------
@APP.get("/coins/search")
def search_coins(q: str = Query(..., min_length=1)):
    q_lower = q.lower()
    results = [
        c for c in COIN_LIST_CACHE
        if q_lower in c["id"].lower() or q_lower in c["symbol"].lower() or q_lower in c.get("name", "").lower()
    ]
    return {"results": results[:50]}

#----------------------------------------
# Run server
#----------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(APP, host="127.0.0.1", port=8010)
