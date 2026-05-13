import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routes import transactions, insights, chat, forecast, users, budgets, recurring
from database import init_db

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="FinAI - Personal Finance Dashboard")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,https://finance-dashboard-ai.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return a generic error message for unhandled exceptions."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."}
    )


@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}

# List of routers
app.include_router(transactions.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(recurring.router, prefix="/api")
