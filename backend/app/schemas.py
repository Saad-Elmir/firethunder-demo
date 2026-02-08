from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from decimal import Decimal

class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # password plaintext ONLY in request
    role: Literal["ADMIN", "USER"]

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProductCreate(BaseModel):
    name: str = Field(min_length=2)
    description: Optional[str] = None
    price: Decimal = Field(ge=0)
    quantity: int = Field(ge=0)
