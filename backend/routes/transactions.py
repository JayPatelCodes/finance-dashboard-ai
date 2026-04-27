import datetime
import hashlib
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from utils import parse_csv
from services.classifier import categorize_text
from database import transactions as tx_collection
from auth import get_current_user

router = APIRouter()

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB


def _csv_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    # Read with size limit
    content = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")

    # Sanity check: first line should look like a CSV header
    first_line = content.split(b"\n")[0].decode("utf-8", errors="ignore").strip()
    if "," not in first_line:
        raise HTTPException(status_code=400, detail="File does not appear to be a valid CSV.")

    # Duplicate detection
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
    month: str = None,
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"user_id": current_user["id"]}

    if month:
        try:
            year, m = map(int, month.split("-"))
            start = datetime.datetime(year, m, 1)
            end = datetime.datetime(year + 1, 1, 1) if m == 12 else datetime.datetime(year, m + 1, 1)
            query["Date"] = {"$gte": start, "$lt": end}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    cursor = tx_collection.find(
        query, {"_id": 0, "user_id": 0, "file_hash": 0}
    ).sort("Date", 1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if "Date" in it and hasattr(it["Date"], "isoformat"):
            it["Date"] = it["Date"].isoformat()
    return {"items": items}


@router.get("/transactions/months")
async def list_months(current_user: dict = Depends(get_current_user)):
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
    result = await tx_collection.delete_many({"user_id": current_user["id"]})
    return {"deleted": result.deleted_count}
