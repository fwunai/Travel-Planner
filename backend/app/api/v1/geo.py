from fastapi import APIRouter, Query

from app.geo.amap_geo_service import AmapGeoService
from app.schemas.api import GeoPlace

router = APIRouter(prefix="/geo", tags=["geo"])
service = AmapGeoService()


@router.get("/places/search", response_model=list[GeoPlace])
async def search_places(keyword: str = Query(min_length=2, max_length=100), city: str | None = Query(default=None, max_length=100)) -> list[GeoPlace]:
    return await service.search_places(keyword, city)

