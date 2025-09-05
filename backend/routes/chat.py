from fastapi import APIRouter
from database import transactions
from pandas import DataFrame
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    data = await transactions.find({}, {"_id": 0}).to_list(length=10_000)
    df = DataFrame(data)
    if df.empty:
        return ChatResponse(answer="No data yet. Upload a CSV first.")

    q = req.question.lower()

    if "total" in q and "spent" in q:
        total = abs(df[df["Amount"] < 0]["Amount"].sum())
        return ChatResponse(answer=f"You’ve spent a total of ${total:.2f}.")

    if ("top" in q or "highest" in q) and "category" in q:
        by_cat = (
            df[df["Amount"] < 0]
            .groupby("Category")["Amount"].sum().abs().sort_values(ascending=False)
        )
        if by_cat.empty:
            return ChatResponse(answer="No expenses found.")
        return ChatResponse(answer=f"Top category: {by_cat.index[0]} (${by_cat.iloc[0]:.2f}).")

    if "average" in q and "daily" in q:
        daily = df[df["Amount"] < 0].groupby("Date")["Amount"].sum()
        if daily.empty:
            return ChatResponse(answer="No daily data.")
        return ChatResponse(answer=f"Average daily spend: ${abs(daily.mean()):.2f}.")

    return ChatResponse(answer="Try questions like: 'total spent', 'top category', or 'average daily spend'.")