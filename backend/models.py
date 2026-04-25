from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
