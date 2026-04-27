from fastapi import APIRouter, Depends
from database import transactions as tx_collection
from auth import get_current_user
from pandas import DataFrame
import pandas as pd

router = APIRouter()

@router.get("/recurring")
async def get_recurring(current_user: dict = Depends(get_current_user)):
    data = await tx_collection.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).to_list(length=10_000)

    if not data:
        return {"items": []}

    df = DataFrame(data)
    df["Date"] = pd.to_datetime(df["Date"])
    df["Description"] = df["Description"].str.strip().str.lower()

    # Group by description and count occurrences
    grouped = df.groupby("Description").agg(
        count=("Amount", "count"),
        avg_amount=("Amount", "mean"),
        last_date=("Date", "max"),
    ).reset_index()

    # Only flag as recurring if it appears 2+ times
    recurring = grouped[grouped["count"] >= 2].sort_values("count", ascending=False)

    items = [
        {
            "description": row["Description"].title(),
            "occurrences": int(row["count"]),
            "avg_amount": round(float(row["avg_amount"]), 2),
            "last_date": row["last_date"].strftime("%Y-%m-%d"),
            "type": "income" if row["avg_amount"] > 0 else "expense",
        }
        for _, row in recurring.iterrows()
    ]
    return {"items": items}
