import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import transactions, insights, chat, forecast
from database import init_db

app = FastAPI(title="AI Personal Finance API (MongoDB)")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,https://finance-dashboard-ai.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health")
async def health():
    return {"status": "ok"}

# All API endpoints are under /api
app.include_router(transactions.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
