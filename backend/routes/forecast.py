from fastapi import APIRouter
from database import transactions
from pandas import DataFrame
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import timedelta

router = APIRouter()

@router.get("/forecast")
async def forecast():
    data = await transactions.find({}, {"_id": 0}).to_list(length=10_000)
    df = DataFrame(data)
    if df.empty:
        return {"points": [], "summary": "No data to forecast. Upload CSV first."}

    # Ensure datetime
    df["Date"] = pd.to_datetime(df["Date"])
    daily = df[df["Amount"] < 0].groupby("Date")["Amount"].sum().reset_index()
    if daily.empty:
        return {"points": [], "summary": "No expenses to forecast."}

    daily = daily.sort_values("Date").copy()
    daily["Day"] = (daily["Date"] - daily["Date"].min()).dt.days

    X = daily[["Day"]].values
    y = daily["Amount"].values

    model = LinearRegression()
    model.fit(X, y)

    last_day = int(daily["Day"].max())
    future_days = np.arange(last_day + 1, last_day + 31).reshape(-1, 1)
    preds = model.predict(future_days)

    start_date = daily["Date"].max() + timedelta(days=1)
    future_dates = pd.date_range(start=start_date, periods=30, freq="D")

    points = [{"date": d.strftime('%Y-%m-%d'), "predicted": float(p)} for d, p in zip(future_dates, preds)]
    summary = f"Predicted average daily spending for next 30 days: ${abs(float(np.mean(preds))):.2f}."
    return {"points": points, "summary": summary}