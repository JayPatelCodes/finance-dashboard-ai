import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "finance_ai_dashboard")

_client = AsyncIOMotorClient(MONGO_URI)
db = _client[DB_NAME]

transactions = db["transactions"]

async def init_db():
    # Useful index for ordering/aggregation
    await transactions.create_index([("Date", ASCENDING)])