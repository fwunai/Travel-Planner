import hashlib
import secrets
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import HTTPException, status
from pwdlib import PasswordHash

from app.core.config import get_settings

password_hash = PasswordHash.recommended()


def utcnow() -> datetime:
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: str) -> str:
    settings = get_settings()
    expires_at = utcnow() + timedelta(minutes=15)
    return jwt.encode({"sub": user_id, "type": "access", "exp": expires_at}, settings.jwt_access_secret, algorithm="HS256")


def create_refresh_token() -> tuple[str, str, datetime]:
    settings = get_settings()
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(f"{settings.jwt_refresh_secret}:{token}".encode()).hexdigest()
    return token, token_hash, utcnow() + timedelta(days=30)


def hash_refresh_token(token: str) -> str:
    settings = get_settings()
    return hashlib.sha256(f"{settings.jwt_refresh_secret}:{token}".encode()).hexdigest()


def decode_access_token(token: str) -> str:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_access_secret, algorithms=["HS256"])
        if payload.get("type") != "access" or not payload.get("sub"):
            raise ValueError("Invalid token type")
        return str(payload["sub"])
    except (jwt.InvalidTokenError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token") from exc
