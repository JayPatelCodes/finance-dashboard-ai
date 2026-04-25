import os
from fastapi import APIRouter, Depends
from database import transactions
from pandas import DataFrame
from models import ChatRequest, ChatResponse
from auth import get_current_user
from google import genai
from google.genai import types

router = APIRouter()


def _build_context(df: DataFrame) -> str:
    if df.empty:
        return "No transaction data available."

    expenses = df[df["Amount"] < 0]
    income = df[df["Amount"] >= 0]
    total_spent = abs(expenses["Amount"].sum())
    total_income = income["Amount"].sum()

    by_cat = (
        expenses.groupby("Category")["Amount"]
        .sum().abs().sort_values(ascending=False)
    )
    cat_summary = ", ".join(f"{cat}: ${amt:.2f}" for cat, amt in by_cat.items())

    recent = df.sort_values("Date", ascending=False).head(10)
    recent_lines = "\n".join(
        f"  - {row['Date']} | {row['Description']} | ${row['Amount']:.2f} | {row['Category']}"
        for _, row in recent.iterrows()
    )

    return f"""Financial Summary:
- Date range: {df['Date'].min()} to {df['Date'].max()}
- Total income: ${total_income:.2f}
- Total spent: ${total_spent:.2f}
- Net: ${(total_income - total_spent):.2f}
- Spending by category: {cat_summary}

Recent transactions (last 10):
{recent_lines}
"""


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    data = await transactions.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).to_list(length=10_000)
    df = DataFrame(data)

    if df.empty:
        return ChatResponse(answer="No transaction data found. Please upload a CSV file first.")

    context = _build_context(df)
    name = current_user.get("name", "there")

    system_prompt = f"""You are a helpful personal finance assistant for {name}.
Analyze their transaction data and answer questions clearly and concisely.
Use specific dollar amounts when relevant. Be friendly but professional.
Respond in plain text only — no markdown bold, no bullet symbols, just clean sentences.

Here is the user's financial data:
{context}
"""

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return ChatResponse(answer="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.")

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=req.question,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=512,
                temperature=0.7,
            ),
        )
        return ChatResponse(answer=response.text)
    except Exception as e:
        return ChatResponse(answer=f"Sorry, I encountered an error: {str(e)}")
