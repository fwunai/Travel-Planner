from fastapi import APIRouter

from app.api.v1 import geo, places, trips

router = APIRouter()
router.include_router(trips.router)
router.include_router(places.router)
router.include_router(geo.router)

