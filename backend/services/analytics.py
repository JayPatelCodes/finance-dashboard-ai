import pandas as pd
from typing import List, Dict

def make_basic_insights(df: pd.DataFrame) -> List[Dict[str, str]]:
    insights: List[Dict[str, str]] = []
    if df.empty:
        return insights

    expenses = df[df["Amount"] < 0]

    total_spent = round(abs(expenses["Amount"].sum()), 2)
    insights.append({"key": "total_spent", "value": f"${total_spent:,.2f}"})

    by_cat = (
        expenses.groupby("Category")["Amount"]
        .sum().abs().sort_values(ascending=False)
    )
    if not by_cat.empty:
        insights.append({
            "key": "top_category",
            "value": f"{by_cat.index[0]} (${by_cat.iloc[0]:,.2f})"
        })

    daily = expenses.groupby("Date")["Amount"].sum()
    if not daily.empty:
        avg = round(abs(daily.mean()), 2)
        insights.append({"key": "avg_daily_spend", "value": f"${avg:,.2f}"})

    return insights
