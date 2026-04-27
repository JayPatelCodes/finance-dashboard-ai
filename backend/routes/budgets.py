import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import db
from auth import get_current_user
from database import transactions as tx_collection
from bson import ObjectId

router = APIRouter()

class BudgetIn(BaseModel):
    category: str
    amount: float
    month: Optional[str] = None  # "YYYY-MM" or None for persistent

class BudgetOut(BaseModel):
    id: str
    category: str
    amount: float
    month: Optional[str]
    spent: float
    percent: float

@router.get("/budgets", response_model=list[BudgetOut])
async def get_budgets(month: str = None, current_user: dict = Depends(get_current_user)):
    # Fetch budgets: persistent ones + month-specific ones
    query = {"user_id": current_user["id"], "$or": [{"month": None}, {"month": month}]}
    budgets = await db["budgets"].find(query).to_list(length=100)

    # Calculate actual spending per category for the given month
    tx_query: dict = {"user_id": current_user["id"], "Amount": {"$lt": 0}}
    if month:
        try:
            year, m = map(int, month.split("-"))
            start = datetime.datetime(year, m, 1)
            end = datetime.datetime(year + 1, 1, 1) if m == 12 else datetime.datetime(year, m + 1, 1)
            tx_query["Date"] = {"$gte": start, "$lt": end}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    pipeline = [
        {"$match": tx_query},
        {"$group": {"_id": "$Category", "total": {"$sum": "$Amount"}}},
    ]
    spending = {r["_id"]: abs(r["total"]) for r in await tx_collection.aggregate(pipeline).to_list(100)}

    result = []
    for b in budgets:
        spent = spending.get(b["category"], 0.0)
        percent = min((spent / b["amount"]) * 100, 100) if b["amount"] > 0 else 0
        result.append(BudgetOut(
            id=str(b["_id"]),
            category=b["category"],
            amount=b["amount"],
            month=b.get("month"),
            spent=spent,
            percent=percent,
        ))
    return result

@router.post("/budgets", response_model=BudgetOut)
async def create_budget(body: BudgetIn, current_user: dict = Depends(get_current_user)):
    # Don't allow duplicate category+month combos
    existing = await db["budgets"].find_one({
        "user_id": current_user["id"],
        "category": body.category,
        "month": body.month,
    })
    if existing:
        raise HTTPException(status_code=409, detail="A budget for this category and period already exists.")

    doc = {
        "user_id": current_user["id"],
        "category": body.category,
        "amount": body.amount,
        "month": body.month,
    }
    result = await db["budgets"].insert_one(doc)
    return BudgetOut(id=str(result.inserted_id), category=body.category, amount=body.amount, month=body.month, spent=0, percent=0)

@router.put("/budgets/{budget_id}")
async def update_budget(budget_id: str, body: BudgetIn, current_user: dict = Depends(get_current_user)):
    result = await db["budgets"].update_one(
        {"_id": ObjectId(budget_id), "user_id": current_user["id"]},
        {"$set": {"amount": body.amount, "month": body.month}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found.")
    return {"updated": True}

@router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str, current_user: dict = Depends(get_current_user)):
    result = await db["budgets"].delete_one({"_id": ObjectId(budget_id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found.")
    return {"deleted": True}
