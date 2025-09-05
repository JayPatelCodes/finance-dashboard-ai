from fastapi import APIRouter
from database import transactions
from pandas import DataFrame
from services.analytics import make_basic_insights

router = APIRouter()

@router.get("/insights")
async def insights():
    data = await transactions.find({}, {"_id": 0}).to_list(length=10_000)
    df = DataFrame(data)
    return {"insights": make_basic_insights(df)}