from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt
from passlib.context import CryptContext

from app.config import get_jwt_secret, get_jwt_expires_minutes

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_ALGORITHM = "HS256"



def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)



def create_access_token(user_id: str, username: str, role: str) -> str:
    expire_minutes = get_jwt_expires_minutes()
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    payload: Dict[str, Any] = {
        "userId": user_id,
        "username": username,
        "role": role,
        "exp": expire_at,
    }

    secret = get_jwt_secret()  # fails clearly if missing
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)
