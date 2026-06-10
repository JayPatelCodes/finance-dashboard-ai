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
    # Index for ordering/aggregation on transactions
    await transactions.create_index([("Date", ASCENDING)])

    # TTL index: auto-delete guest users 24 hours after creation
    # partialFilterExpression ensures real user accounts are never touched
    await db["users"].create_index(
        [("created_at", ASCENDING)],
        expireAfterSeconds=86400,
        partialFilterExpression={"is_guest": True},
    )

    # TTL index: auto-expire token blacklist entries once the token's own expiry passes
    await db["token_blacklist"].create_index(
        [("expires_at", ASCENDING)],
        expireAfterSeconds=0,
    )
