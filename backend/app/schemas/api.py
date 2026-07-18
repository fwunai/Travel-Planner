from datetime import date, time

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    display_name: str | None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TripInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    destination_city: str = Field(min_length=1, max_length=100)
    destination_adcode: str | None = Field(default=None, max_length=12)
    start_date: date
    end_date: date
    travelers: int = Field(default=1, ge=1, le=100)
    daily_start_time: time = time(9, 0)
    daily_end_time: time = time(21, 0)
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_dates_and_hours(self):
        if self.end_date < self.start_date:
            raise ValueError("结束日期不能早于出发日期")
        if self.daily_end_time <= self.daily_start_time:
            raise ValueError("每日结束时间必须晚于开始时间")
        return self


class TripResponse(TripInput):
    model_config = ConfigDict(from_attributes=True)
    id: str
    map_provider: str
    coordinate_system: str
    status: str


class PlaceInput(BaseModel):
    provider_place_id: str | None = Field(default=None, max_length=128)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    address: str | None = Field(default=None, max_length=500)
    longitude: float | None = Field(default=None, ge=70, le=140)
    latitude: float | None = Field(default=None, ge=0, le=60)
    coordinate_system: str = "GCJ02"
    category: str = "other"
    priority: str = "optional"
    user_note: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_source(self):
        if not self.provider_place_id and (not self.name or self.longitude is None or self.latitude is None):
            raise ValueError("手动地点需要名称和坐标")
        return self


class PlacePatch(BaseModel):
    category: str | None = None
    priority: str | None = None
    user_note: str | None = Field(default=None, max_length=5000)


class PlaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    provider: str
    provider_place_id: str | None
    name: str
    address: str | None
    longitude: float
    latitude: float
    coordinate_system: str
    category: str
    rating: float | None
    opening_hours: str | None
    photo_url: str | None
    description: str | None
    priority: str
    user_note: str | None


class GeoPlace(BaseModel):
    provider_place_id: str
    name: str
    address: str | None
    longitude: float
    latitude: float
    category: str = "other"
    rating: float | None = None
    opening_hours: str | None = None
    photo_url: str | None = None
    description: str | None = None
