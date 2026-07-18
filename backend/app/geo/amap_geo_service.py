import httpx
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.schemas.api import GeoPlace


class AmapGeoService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def search_places(self, keyword: str, city: str | None = None) -> list[GeoPlace]:
        if not self.settings.amap_web_service_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="高德服务端 Key 尚未配置")
        params = {"key": self.settings.amap_web_service_key, "keywords": keyword, "offset": 20, "page": 1, "extensions": "all"}
        if city:
            params["city"] = city
        async with httpx.AsyncClient(base_url=self.settings.amap_web_service_base_url, timeout=10) as client:
            response = await client.get("/v3/place/text", params=params)
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "1":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="高德地点搜索失败")
        return [self._normalize(item) for item in data.get("pois", []) if item.get("location")]

    async def get_place_detail(self, provider_place_id: str) -> GeoPlace:
        if not self.settings.amap_web_service_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="高德服务端 Key 尚未配置")
        async with httpx.AsyncClient(base_url=self.settings.amap_web_service_base_url, timeout=10) as client:
            response = await client.get("/v3/place/detail", params={"key": self.settings.amap_web_service_key, "id": provider_place_id, "extensions": "all"})
        response.raise_for_status()
        data = response.json()
        pois = data.get("pois", [])
        if data.get("status") != "1" or not pois:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="未找到该地点")
        return self._normalize(pois[0])

    def _normalize(self, place: dict) -> GeoPlace:
        longitude, latitude = (float(value) for value in place["location"].split(","))
        photos = place.get("photos") or []
        return GeoPlace(provider_place_id=place["id"], name=place["name"], address=place.get("address") or None, longitude=longitude, latitude=latitude, category=self._category(place.get("type", "")), rating=float(place["biz_ext"]["rating"]) if place.get("biz_ext", {}).get("rating") not in {None, "", "[]"} else None, opening_hours=place.get("biz_ext", {}).get("opentime") or None, photo_url=photos[0].get("url") if photos else None, description=place.get("type") or None)

    @staticmethod
    def _category(place_type: str) -> str:
        mapping = {"风景名胜": "attraction", "住宿服务": "hotel", "餐饮服务": "restaurant", "购物服务": "shopping", "交通设施服务": "rail_station"}
        return next((category for key, category in mapping.items() if key in place_type), "other")
