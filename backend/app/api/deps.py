from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User


def get_local_owner(db: Session = Depends(get_db)) -> User:
    user = db.scalar(select(User).where(User.email == get_settings().preset_user_email.lower()))
    if user is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="本地工作区尚未初始化")
    return user

