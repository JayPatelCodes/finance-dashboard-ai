import os
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from database import db
from auth import hash_password, verify_password, create_access_token, get_current_user
from models import UserSignup, UserLogin, GoogleAuthRequest, TokenResponse, UserOut
from bson import ObjectId
import httpx

router = APIRouter(prefix="/auth")
limiter = Limiter(key_func=get_remote_address)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _fmt_user(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        avatar=user.get("avatar"),
    )


async def _check_lockout(email: str):
    """Raise 429 if account is locked out due to too many failed attempts."""
    record = await db["failed_logins"].find_one({"email": email})
    if record and record.get("attempts", 0) >= MAX_FAILED_ATTEMPTS:
        import datetime
        locked_at = record.get("locked_at")
        if locked_at:
            elapsed = (datetime.datetime.utcnow() - locked_at).total_seconds() / 60
            if elapsed < LOCKOUT_MINUTES:
                remaining = int(LOCKOUT_MINUTES - elapsed)
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporarily locked due to too many failed attempts. Try again in {remaining} minutes."
                )
            else:
                # Lockout expired, reset
                await db["failed_logins"].delete_one({"email": email})


async def _record_failed_attempt(email: str):
    import datetime
    record = await db["failed_logins"].find_one({"email": email})
    attempts = (record.get("attempts", 0) if record else 0) + 1
    update = {"attempts": attempts, "last_attempt": datetime.datetime.utcnow()}
    if attempts >= MAX_FAILED_ATTEMPTS:
        update["locked_at"] = datetime.datetime.utcnow()
    await db["failed_logins"].update_one(
        {"email": email}, {"$set": update}, upsert=True
    )


async def _clear_failed_attempts(email: str):
    await db["failed_logins"].delete_one({"email": email})


@router.post("/signup", response_model=TokenResponse)
@limiter.limit("10/minute")
async def signup(request: Request, body: UserSignup):
    existing = await db["users"].find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user_doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password": hash_password(body.password),
        "avatar": None,
        "provider": "email",
    }
    result = await db["users"].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=_fmt_user(user_doc))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: UserLogin):
    await _check_lockout(body.email.lower().strip())

    user = await db["users"].find_one({"email": body.email.lower().strip()})
    if not user or not verify_password(body.password, user.get("password", "")):
        await _record_failed_attempt(body.email.lower().strip())
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    await _clear_failed_attempts(body.email.lower().strip())
    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_fmt_user(user))


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on this server.")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": body.token},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token.")

    info = resp.json()
    if info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch.")

    email = info.get("email", "").lower()
    name = info.get("name", email.split("@")[0])
    avatar = info.get("picture")

    user = await db["users"].find_one({"email": email})
    if not user:
        doc = {
            "name": name,
            "email": email,
            "password": None,
            "avatar": avatar,
            "provider": "google",
        }
        result = await db["users"].insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc
    else:
        await db["users"].update_one({"_id": user["_id"]}, {"$set": {"avatar": avatar}})
        user["avatar"] = avatar

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_fmt_user(user))


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user), token: str = Depends(__import__('auth').oauth2_scheme)):
    """Blacklist the current token so it cannot be reused after logout."""
    import datetime
    from auth import ACCESS_TOKEN_EXPIRE_MINUTES
    from jose import jwt, JWTError
    from auth import SECRET_KEY, ALGORITHM

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        # Store token in blacklist until it naturally expires
        await db["token_blacklist"].insert_one({
            "token": token,
            "user_id": current_user["id"],
            "expires_at": datetime.datetime.utcfromtimestamp(exp) if exp else datetime.datetime.utcnow(),
        })
    except JWTError:
        pass  # Token already invalid, nothing to blacklist

    return {"detail": "Logged out successfully."}


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar=current_user.get("avatar"),
    )
