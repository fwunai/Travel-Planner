from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.trip import Trip
from app.models.user import User
from app.schemas.api import TripInput, TripResponse

router = APIRouter(prefix="/trips", tags=["trips"])


def owned_trip(trip_id: str, user_id: str, db: Session) -> Trip:
    trip = db.scalar(select(Trip).where(Trip.id == trip_id, Trip.owner_id == user_id))
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="旅行项目不存在")
    return trip


@router.get("", response_model=list[TripResponse])
def list_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Trip]:
    return list(db.scalars(select(Trip).where(Trip.owner_id == current_user.id).order_by(Trip.updated_at.desc())))


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Trip:
    trip = Trip(owner_id=current_user.id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Trip:
    return owned_trip(trip_id, current_user.id, db)


@router.patch("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, payload: TripInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Trip:
    trip = owned_trip(trip_id, current_user.id, db)
    for field, value in payload.model_dump().items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    db.delete(owned_trip(trip_id, current_user.id, db))
    db.commit()
