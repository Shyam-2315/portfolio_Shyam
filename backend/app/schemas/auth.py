from pydantic import BaseModel, EmailStr

from app.schemas.common import TimestampedModel


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserRead(TimestampedModel):
    email: EmailStr
    is_active: bool
