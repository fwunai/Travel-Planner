from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    utcnow,
    verify_password,
)
from app.models.user import AuthSession, User
from app.schemas.api import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def issue_session(user: User, db: Session, response: Response) -> TokenResponse:
    refresh_token, token_hash, expires_at = create_refresh_token()
    db.add(AuthSession(user_id=user.id, refresh_token_hash=token_hash, expires_at=expires_at))
    db.commit()
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax", secure=False, max_age=30 * 86400, path="/api/v1/auth")
    return TokenResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码错误")
    return issue_session(user, db, response)


@router.post("/refresh", response_model=TokenResponse)
def refresh(response: Response, refresh_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> TokenResponse:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")
    session = db.scalar(select(AuthSession).where(AuthSession.refresh_token_hash == hash_refresh_token(refresh_token)))
    if session is None or session.revoked_at or session.expires_at < utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    session.revoked_at = utcnow()
    user = db.get(User, session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return issue_session(user, db, response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, refresh_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> None:
    if refresh_token:
        session = db.scalar(select(AuthSession).where(AuthSession.refresh_token_hash == hash_refresh_token(refresh_token)))
        if session:
            session.revoked_at = utcnow()
            db.commit()
    response.delete_cookie("refresh_token", path="/api/v1/auth")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
