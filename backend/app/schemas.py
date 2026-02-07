from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from decimal import Decimal

class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    email: EmailStr
    password_hash: str = Field(min_length=1)
    role: Literal["ADMIN", "USER"]

class ProductCreate(BaseModel):
    name: str = Field(min_length=2)
    description: Optional[str] = None
    price: Decimal = Field(ge=0)
    quantity: int = Field(ge=0)
