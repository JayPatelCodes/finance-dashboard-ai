from fastapi import APIRouter, Depends
from database import transactions
from pandas import DataFrame
from services.analytics import make_basic_insights
from auth import get_current_user

router = APIRouter()


@router.get("/insights")
async def insights(current_user: dict = Depends(get_current_user)):
    data = await transactions.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).to_list(length=10_000)
    df = DataFrame(data)
    return {"insights": make_basic_insights(df)}
