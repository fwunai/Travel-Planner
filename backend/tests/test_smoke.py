from fastapi.testclient import TestClient

from app.main import app


def test_authenticated_trip_and_manual_place_flow():
    with TestClient(app) as client:
        login = client.post(
            "/api/v1/auth/login",
            json={
                "email": "demo@travel-planner.example.com",
                "password": "change-this-development-password",
            },
        )
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        trip = client.post(
            "/api/v1/trips",
            headers=headers,
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
        assert trip.status_code == 201

        place = client.post(
            f"/api/v1/trips/{trip.json()['id']}/places",
            headers=headers,
            json={
                "name": "West Lake",
                "longitude": 120.148,
                "latitude": 30.245,
                "category": "attraction",
            },
        )
        assert place.status_code == 201
        assert place.json()["provider"] == "manual"
        assert place.json()["coordinate_system"] == "GCJ02"

        places = client.get(f"/api/v1/trips/{trip.json()['id']}/places", headers=headers)
        assert places.status_code == 200
        assert len(places.json()) == 1
