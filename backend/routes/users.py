import os
from fastapi import APIRouter, HTTPException, status, Depends
from database import db
from auth import hash_password, verify_password, create_access_token, get_current_user
from models import UserSignup, UserLogin, GoogleAuthRequest, TokenResponse, UserOut
from bson import ObjectId
import httpx

router = APIRouter(prefix="/auth")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


def _fmt_user(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        avatar=user.get("avatar"),
    )


@router.post("/signup", response_model=TokenResponse)
async def signup(body: UserSignup):
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
async def login(body: UserLogin):
    user = await db["users"].find_one({"email": body.email.lower().strip()})
    if not user or not verify_password(body.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_fmt_user(user))


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest):
    """Verify a Google ID token and sign in or create an account."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on this server.")

    # Verify the token with Google's tokeninfo endpoint
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
        # Auto-create account
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
        # Update avatar in case it changed
        await db["users"].update_one({"_id": user["_id"]}, {"$set": {"avatar": avatar}})
        user["avatar"] = avatar

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_fmt_user(user))


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar=current_user.get("avatar"),
    )
