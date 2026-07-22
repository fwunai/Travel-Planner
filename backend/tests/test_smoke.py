from fastapi.testclient import TestClient

from app.api.v1.places import geo_service
from app.geo.amap_geo_service import GeocodedAddress
from app.schemas.api import GeoPlace
from app.main import app


async def geocode_address(province: str | None, city: str, address: str) -> GeocodedAddress:
    assert province == "浙江省"
    assert city == "杭州市"
    assert address == "西湖区龙井路1号"
    return GeocodedAddress(address="浙江省杭州市西湖区龙井路1号", longitude=120.123, latitude=30.234)


async def place_detail(provider_place_id: str) -> GeoPlace:
    assert provider_place_id == "amap-poi-1"
    return GeoPlace(
        provider_place_id=provider_place_id,
        name="西湖",
        address="浙江省杭州市西湖区",
        longitude=120.148,
        latitude=30.245,
        category="attraction",
    )


def test_local_workspace_and_address_place_flow(monkeypatch):
    monkeypatch.setattr(geo_service, "geocode", geocode_address)
    monkeypatch.setattr(geo_service, "get_place_detail", place_detail)
    with TestClient(app) as client:
        workspace = client.get("/api/v1/workspace")
        assert workspace.status_code == 200
        assert workspace.json()["trip"]["name"] is None
        trip_id = workspace.json()["trip"]["id"]

        same_workspace = client.get("/api/v1/workspace")
        assert same_workspace.status_code == 200
        assert same_workspace.json()["trip"]["id"] == trip_id

        updated = client.patch(
            "/api/v1/workspace",
            json={
                "name": "Hangzhou trip",
                "destination_city": "Hangzhou",
                "start_date": "2026-10-01",
                "end_date": "2026-10-03",
                "travelers": 2,
                "daily_start_time": "09:00:00",
                "daily_end_time": "21:00:00",
            },
        )
        assert updated.status_code == 200
        assert updated.json()["name"] == "Hangzhou trip"

        invalid_dates = client.patch("/api/v1/workspace", json={"start_date": "2026-10-03", "end_date": "2026-10-01"})
        assert invalid_dates.status_code == 422

        place = client.post(
            f"/api/v1/trips/{trip_id}/places",
            json={
                "name": "龙井茶室",
                "province": "浙江省",
                "city": "杭州市",
                "address": "西湖区龙井路1号",
                "category": "restaurant",
            },
        )
        assert place.status_code == 201
        assert place.json()["provider"] == "manual"
        assert place.json()["longitude"] == 120.123
        assert place.json()["latitude"] == 30.234
        assert place.json()["address"] == "浙江省杭州市西湖区龙井路1号"

        place_id = place.json()["id"]
        updated_place = client.patch(
            f"/api/v1/trips/{trip_id}/places/{place_id}",
            json={"priority": "must_visit", "user_note": "早上去"},
        )
        assert updated_place.status_code == 200
        assert updated_place.json()["priority"] == "must_visit"

        provider_place = client.post(
            f"/api/v1/trips/{trip_id}/places",
            json={"provider_place_id": "amap-poi-1", "category": "打卡点"},
        )
        assert provider_place.status_code == 201
        assert provider_place.json()["category"] == "打卡点"
        assert provider_place.json()["sort_order"] == 1

        scheduled = client.patch(
            f"/api/v1/trips/{trip_id}/places/{provider_place.json()['id']}",
            json={"visit_time": "08:30:00", "sort_order": 0},
        )
        assert scheduled.status_code == 200
        assert scheduled.json()["visit_time"] == "08:30:00"
        reordered_first = client.patch(
            f"/api/v1/trips/{trip_id}/places/{place_id}", json={"sort_order": 1}
        )
        assert reordered_first.status_code == 200

        places = client.get(f"/api/v1/trips/{trip_id}/places")
        assert places.status_code == 200
        assert len(places.json()) == 2
        assert places.json()[0]["id"] == provider_place.json()["id"]


def test_trip_collection_supports_blank_plan_switching_and_delete():
    with TestClient(app) as client:
        trips = client.get("/api/v1/trips")
        assert trips.status_code == 200
        initial_ids = {trip["id"] for trip in trips.json()}

        created = client.post("/api/v1/trips", json={})
        assert created.status_code == 201
        created_trip = created.json()
        assert created_trip["name"] is None
        assert created_trip["id"] not in initial_ids

        fetched = client.get(f"/api/v1/trips/{created_trip['id']}")
        assert fetched.status_code == 200
        assert fetched.json()["id"] == created_trip["id"]

        updated = client.patch(
            f"/api/v1/trips/{created_trip['id']}",
            json={"name": "周末计划", "destination_city": "南京"},
        )
        assert updated.status_code == 200
        assert updated.json()["name"] == "周末计划"

        deleted = client.delete(f"/api/v1/trips/{created_trip['id']}")
        assert deleted.status_code == 204
        assert client.get(f"/api/v1/trips/{created_trip['id']}").status_code == 404

