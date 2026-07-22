from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_local_owner
from app.core.database import get_db
from app.models.place import Place
from app.models.trip import Trip
from app.models.user import User
from app.schemas.api import TripInput, TripPatch, TripResponse, WorkspaceResponse

router = APIRouter(tags=["trips"])


def owned_trip(trip_id: str, owner_id: str, db: Session) -> Trip:
    trip = db.scalar(select(Trip).where(Trip.id == trip_id, Trip.owner_id == owner_id))
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="旅行项目不存在")
    return trip


def validate_trip_update(trip: Trip, payload: TripPatch) -> None:
    values = payload.model_dump(exclude_unset=True)
    start_date = values.get("start_date", trip.start_date)
    end_date = values.get("end_date", trip.end_date)
    start_time = values.get("daily_start_time", trip.daily_start_time)
    end_time = values.get("daily_end_time", trip.daily_end_time)
    if start_date and end_date and end_date < start_date:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="结束日期不能早于出发日期")
    if start_time and end_time and end_time <= start_time:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="每日结束时间必须晚于开始时间")


def workspace(owner: User, db: Session) -> Trip:
    trip = db.scalar(select(Trip).where(Trip.owner_id == owner.id).order_by(Trip.updated_at.desc()))
    if trip is None:
        trip = Trip(owner_id=owner.id, name=None, destination_city=None, start_date=None, end_date=None, travelers=1)
        db.add(trip)
        db.commit()
        db.refresh(trip)
    return trip


@router.get("/trips", response_model=list[TripResponse])
def list_trips(owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> list[Trip]:
    return list(db.scalars(select(Trip).where(Trip.owner_id == owner.id).order_by(Trip.updated_at.desc())))


@router.post("/trips", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripInput, owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> Trip:
    trip = Trip(owner_id=owner.id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> Trip:
    return owned_trip(trip_id, owner.id, db)


@router.patch("/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, payload: TripPatch, owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> Trip:
    trip = owned_trip(trip_id, owner.id, db)
    validate_trip_update(trip, payload)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str, owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> None:
    trip = owned_trip(trip_id, owner.id, db)
    db.execute(delete(Place).where(Place.trip_id == trip.id))
    db.delete(trip)
    db.commit()


@router.get("/workspace", response_model=WorkspaceResponse)
def get_workspace(owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> WorkspaceResponse:
    trip = workspace(owner, db)
    places = list(db.scalars(select(Place).where(Place.trip_id == trip.id)))
    return WorkspaceResponse(trip=trip, places=places)


@router.patch("/workspace", response_model=TripResponse)
def update_workspace(payload: TripPatch, owner: User = Depends(get_local_owner), db: Session = Depends(get_db)) -> Trip:
    trip = workspace(owner, db)
    validate_trip_update(trip, payload)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip

