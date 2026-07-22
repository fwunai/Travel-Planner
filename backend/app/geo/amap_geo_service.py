from dataclasses import dataclass

import httpx
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.schemas.api import GeoPlace


@dataclass
class GeocodedAddress:
    address: str
    longitude: float
    latitude: float


class AmapGeoService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def search_places(self, keyword: str, city: str | None = None) -> list[GeoPlace]:
        keyword = keyword.strip()
        if len(keyword) < 2:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="请至少输入两个字符后搜索")
        params = {"key": self._key(), "keywords": keyword, "offset": 20, "page": 1, "extensions": "all"}
        if city and city.strip():
            params.update({"city": city.strip(), "citylimit": "true"})
        data = await self._request("/v3/place/text", params)
        pois = data.get("pois", [])
        if not isinstance(pois, list):
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务返回的数据异常，请稍后重试")
        return [self._normalize(item) for item in pois if isinstance(item, dict) and item.get("location")]

    async def get_place_detail(self, provider_place_id: str) -> GeoPlace:
        data = await self._request("/v3/place/detail", {"key": self._key(), "id": provider_place_id, "extensions": "all"})
        pois = data.get("pois", [])
        if not isinstance(pois, list) or not pois:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="未找到该地点")
        return self._normalize(pois[0])

    async def geocode(self, province: str | None, city: str, address: str) -> GeocodedAddress:
        province = (province or "").strip()
        city = city.strip()
        address = address.strip()
        if not city or not address:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="请填写城市和详细地址")
        data = await self._request("/v3/geocode/geo", {"key": self._key(), "address": "".join((province, city, address)), "city": city})
        geocodes = data.get("geocodes", [])
        if not isinstance(geocodes, list) or not geocodes or not geocodes[0].get("location"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="未能定位该地址，请补充更具体的城市、区县、道路或门牌号")
        longitude, latitude = self._coordinates(geocodes[0]["location"])
        return GeocodedAddress(address=geocodes[0].get("formatted_address") or "".join((province, city, address)), longitude=longitude, latitude=latitude)

    def _key(self) -> str:
        if not self.settings.amap_web_service_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="地图服务尚未配置")
        return self.settings.amap_web_service_key

    async def _request(self, path: str, params: dict[str, str | int]) -> dict:
        try:
            async with httpx.AsyncClient(base_url=self.settings.amap_web_service_base_url, timeout=10) as client:
                response = await client.get(path, params=params)
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException as error:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="地图服务响应超时，请稍后重试") from error
        except httpx.HTTPError as error:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务暂不可用，请稍后重试") from error
        except ValueError as error:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务返回的数据异常，请稍后重试") from error
        if not isinstance(data, dict) or data.get("status") != "1":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务暂不可用，请稍后重试")
        return data

    def _normalize(self, place: dict) -> GeoPlace:
        longitude, latitude = self._coordinates(place["location"])
        photos = place.get("photos") or []
        return GeoPlace(provider_place_id=place["id"], name=place["name"], address=place.get("address") or None, longitude=longitude, latitude=latitude, category=self._category(place.get("type", "")), rating=self._rating(place.get("biz_ext", {}).get("rating")), opening_hours=place.get("biz_ext", {}).get("opentime") or None, photo_url=photos[0].get("url") if photos else None, description=place.get("type") or None)

    @staticmethod
    def _rating(value: object) -> float | None:
        try:
            return float(value) if value not in (None, "", "[]", []) else None
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _coordinates(location: str) -> tuple[float, float]:
        try:
            longitude, latitude = (float(value) for value in location.split(","))
        except (AttributeError, ValueError) as error:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务返回的位置数据异常，请稍后重试") from error
        if not 70 <= longitude <= 140 or not 0 <= latitude <= 60:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="地图服务返回的位置数据异常，请稍后重试")
        return longitude, latitude

    @staticmethod
    def _category(place_type: str) -> str:
        mapping = {"风景名胜": "attraction", "住宿服务": "hotel", "餐饮服务": "restaurant", "购物服务": "shopping", "交通设施服务": "transport"}
        return next((category for key, category in mapping.items() if key in place_type), "other")

