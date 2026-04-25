from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from utils import parse_csv
from services.classifier import categorize_text
from database import transactions as tx_collection
from auth import get_current_user
import pandas as pd
import hashlib

router = APIRouter()


def _csv_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    content = await file.read()

    # Duplicate detection: reject if this exact file was already uploaded by this user
    file_hash = _csv_hash(content)
    existing = await tx_collection.find_one({
        "user_id": current_user["id"],
        "file_hash": file_hash,
    })
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This file has already been uploaded. Duplicate import blocked."
        )

    try:
        df = parse_csv(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    records = []
    for _, row in df.iterrows():
        records.append({
            "user_id": current_user["id"],
            "file_hash": file_hash,
            "Date": pd.to_datetime(row["Date"]),
            "Description": str(row["Description"]),
            "Amount": float(row["Amount"]),
            "Category": categorize_text(str(row["Description"])),
        })

    if records:
        await tx_collection.insert_many(records)

    return {"inserted": len(records)}


@router.get("/transactions")
async def list_transactions(
    limit: int = 500,
    skip: int = 0,
    month: str = None,  # e.g. "2024-03"
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"user_id": current_user["id"]}

    if month:
        try:
            year, m = map(int, month.split("-"))
            import datetime
            start = datetime.datetime(year, m, 1)
            # First day of next month
            if m == 12:
                end = datetime.datetime(year + 1, 1, 1)
            else:
                end = datetime.datetime(year, m + 1, 1)
            query["Date"] = {"$gte": start, "$lt": end}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    cursor = tx_collection.find(query, {"_id": 0, "user_id": 0, "file_hash": 0}).sort("Date", 1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if "Date" in it and hasattr(it["Date"], "isoformat"):
            it["Date"] = it["Date"].isoformat()
    return {"items": items}


@router.get("/transactions/months")
async def list_months(current_user: dict = Depends(get_current_user)):
    """Return a sorted list of YYYY-MM strings the user has data for."""
    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {"$group": {"_id": {
            "year": {"$year": "$Date"},
            "month": {"$month": "$Date"},
        }}},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
    ]
    results = await tx_collection.aggregate(pipeline).to_list(length=100)
    months = [
        f"{r['_id']['year']}-{str(r['_id']['month']).zfill(2)}"
        for r in results
    ]
    return {"months": months}


@router.delete("/transactions")
async def clear_transactions(current_user: dict = Depends(get_current_user)):
    """Delete all transactions for the current user."""
    result = await tx_collection.delete_many({"user_id": current_user["id"]})
    return {"deleted": result.deleted_count}
