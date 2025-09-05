from fastapi import APIRouter, UploadFile, File, HTTPException
from utils import parse_csv
from services.classifier import categorize_text
from database import transactions
import pandas as pd

router = APIRouter()

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")
    content = await file.read()

    try:
        df = parse_csv(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    records = []
    for _, row in df.iterrows():
        records.append({
            "Date": pd.to_datetime(row["Date"]),
            "Description": str(row["Description"]),
            "Amount": float(row["Amount"]),
            "Category": categorize_text(str(row["Description"]))
        })

    if records:
        await transactions.insert_many(records)

    return {"inserted": len(records)}

@router.get("/transactions")
async def list_transactions(limit: int = 500, skip: int = 0):
    cursor = transactions.find({}, {"_id": 0}).sort("Date", 1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if "Date" in it and hasattr(it["Date"], "isoformat"):
            it["Date"] = it["Date"].isoformat()
    return {"items": items}
