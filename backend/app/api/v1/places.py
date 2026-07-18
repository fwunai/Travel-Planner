from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.v1.trips import owned_trip
from app.core.database import get_db
from app.geo.amap_geo_service import AmapGeoService
from app.models.place import Place
from app.models.user import User
from app.schemas.api import PlaceInput, PlacePatch, PlaceResponse

router = APIRouter(prefix="/trips/{trip_id}/places", tags=["places"])
geo_service = AmapGeoService()


def owned_place(trip_id: str, place_id: str, user_id: str, db: Session) -> Place:
    owned_trip(trip_id, user_id, db)
    place = db.scalar(select(Place).where(Place.id == place_id, Place.trip_id == trip_id))
    if place is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="地点不存在")
    return place


@router.get("", response_model=list[PlaceResponse])
def list_places(trip_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Place]:
    owned_trip(trip_id, current_user.id, db)
    return list(db.scalars(select(Place).where(Place.trip_id == trip_id)))


@router.post("", response_model=PlaceResponse, status_code=status.HTTP_201_CREATED)
async def create_place(trip_id: str, payload: PlaceInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Place:
    owned_trip(trip_id, current_user.id, db)
    if payload.provider_place_id:
        detail = await geo_service.get_place_detail(payload.provider_place_id)
        place = Place(trip_id=trip_id, provider="amap", provider_place_id=detail.provider_place_id, name=detail.name, address=detail.address, longitude=detail.longitude, latitude=detail.latitude, coordinate_system="GCJ02", category=detail.category, rating=detail.rating, opening_hours=detail.opening_hours, photo_url=detail.photo_url, description=detail.description, priority=payload.priority, user_note=payload.user_note)
    else:
        place = Place(trip_id=trip_id, provider="manual", name=payload.name, address=payload.address, longitude=payload.longitude, latitude=payload.latitude, coordinate_system=payload.coordinate_system, category=payload.category, priority=payload.priority, user_note=payload.user_note)
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.patch("/{place_id}", response_model=PlaceResponse)
def update_place(trip_id: str, place_id: str, payload: PlacePatch, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Place:
    place = owned_place(trip_id, place_id, current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(place, field, value)
    db.commit()
    db.refresh(place)
    return place


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place(trip_id: str, place_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    db.delete(owned_place(trip_id, place_id, current_user.id, db))
    db.commit()
