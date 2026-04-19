import uvicorn
import json

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import PORTFOLIO_FILE
from .coins import (
    get_coin_prices,
    load_coin_index,
    get_coin_image
)

# ----------------------------------------
# App
# ----------------------------------------
api = FastAPI()

COIN_INDEX = load_coin_index()
COIN_IDS = {c["id"] for c in COIN_INDEX}
COIN_MAP = {c["id"]: c for c in COIN_INDEX}


# ----------------------------------------
# Models
# ----------------------------------------
class CoinAdd(BaseModel):
    id: str
    symbol: str
    amount: float

class CoinRemove(BaseModel):
    id: str

class CoinEdit(BaseModel):
    id: str
    amount: float


# ----------------------------------------
# Portfolio IO
# ----------------------------------------
def load_portfolio():
    if PORTFOLIO_FILE.exists():
        with open(PORTFOLIO_FILE, "r") as f:
            return json.load(f).get("holdings", [])
    return []


def save_portfolio(holdings):
    holdings = sorted(holdings, key=lambda h: h["id"])
    with open(PORTFOLIO_FILE, "w") as f:
        json.dump({"holdings": holdings}, f, indent=2)


# ----------------------------------------
# Portfolio endpoint
# ----------------------------------------
@api.get("/portfolio")
def portfolio():
    try:
        holdings = load_portfolio()
        coin_ids = [h["id"] for h in holdings]

        prices = get_coin_prices(coin_ids)

        result = []
        total_usd = total_eur = total_gbp = 0.0

        for h in holdings:
            coin_id = h["id"]
            price = prices.get(coin_id, {})
            meta = COIN_MAP.get(coin_id, {})

            usd = price.get("usd", 0)
            eur = price.get("eur", 0)
            gbp = price.get("gbp", 0)

            usd_total = h["amount"] * usd
            eur_total = h["amount"] * eur
            gbp_total = h["amount"] * gbp

            total_usd += usd_total
            total_eur += eur_total
            total_gbp += gbp_total

            image = meta.get("image") or get_coin_image(coin_id)

            result.append({
                "id": coin_id,
                "symbol": h["symbol"].upper(),
                "name": h.get("name", meta.get("name", coin_id)),
                "amount": h["amount"],
                "image": image,
                "price_unit": {
                    "usd_unit": usd,
                    "eur_unit": eur,
                    "gbp_unit": gbp
                },
                "price_change": {
                    "usd_24h_change": price.get("usd_24h_change"),
                    "eur_24h_change": price.get("eur_24h_change"),
                    "gbp_24h_change": price.get("gbp_24h_change")
                },
                "holding_total": {
                    "usd_total": usd_total,
                    "eur_total": eur_total,
                    "gbp_total": gbp_total
                }
            })

        return {
            "holdings": result,
            "portfolio_value_usd": total_usd,
            "portfolio_value_eur": total_eur,
            "portfolio_value_gbp": total_gbp
        }

    except Exception as e:
        if "rate limit" in str(e).lower():
            raise HTTPException(status_code=429, detail="Rate limit reached")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------------------
# Add coin endpoint
# ----------------------------------------
@api.post("/portfolio/add")
def add_coin(coin: CoinAdd):

    if coin.id not in COIN_IDS:
        raise HTTPException(status_code=400, detail="Invalid coin id")

    holdings = load_portfolio()

    for h in holdings:
        if h["id"] == coin.id:
            h["amount"] += coin.amount
            save_portfolio(holdings)
            return {"message": "updated"}

    meta = COIN_MAP.get(coin.id, {})

    holdings.append({
        "id": coin.id,
        "symbol": coin.symbol.upper(),
        "name": meta.get("name", coin.id),
        "amount": coin.amount,
        "image": meta.get("image") or get_coin_image(coin.id)
    })

    save_portfolio(holdings)

    return {"message": "added"}


# ----------------------------------------
# Remove coin endpoint
# ----------------------------------------
@api.post("/portfolio/remove")
def remove_coin(coin: CoinRemove):
    holdings = load_portfolio()
    new = [h for h in holdings if h["id"] != coin.id]

    if len(new) == len(holdings):
        raise HTTPException(status_code=404, detail="not found")

    save_portfolio(new)
    return {"message": "removed"}


# ----------------------------------------
# Edit holding endpoint
# ----------------------------------------
@api.post("/portfolio/edit")
def edit_coin(coin: CoinEdit):
    if coin.id not in COIN_IDS:
        raise HTTPException(status_code=400, detail="Invalid coin id")

    if coin.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    holdings = load_portfolio()
    found = False

    for h in holdings:
        if h["id"] == coin.id:
            h["amount"] = coin.amount
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Coin not found in portfolio")

    save_portfolio(holdings)
    return {"message": "updated"}


# ----------------------------------------
# Search endpoint
# ----------------------------------------
@api.get("/coins/search")
def search(q: str = Query(..., min_length=1)):

    q = q.lower().strip()

    top_matches = []
    other_matches = []

    for c in COIN_INDEX:
        if (
            q in c.get("id", "") or
            q in c.get("symbol", "") or
            q in c.get("name", "").lower()
        ):
            if c.get("market_cap_rank") is not None:
                top_matches.append(c)
            else:
                other_matches.append(c)

    top_matches.sort(
        key=lambda x: x.get("market_cap_rank", 10**9)
    )

    other_matches.sort(
        key=lambda x: x.get("name", "").lower()
    )

    return {
        "results": (top_matches + other_matches)[:50]
    }


# ----------------------------------------
# Frontend
# ----------------------------------------
api.mount("/api", api)


# ----------------------------------------
# Run Server
# ----------------------------------------
if __name__ == "__main__":
    uvicorn.run(api, host="127.0.0.1", port=8010)
