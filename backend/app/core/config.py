from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    database_url: str = "sqlite:///./travel_planner.db"
    cors_origins: str = "http://localhost:3000"
    jwt_access_secret: str = "development-access-secret-change-me"
    jwt_refresh_secret: str = "development-refresh-secret-change-me"
    preset_user_email: str = "demo@travel-planner.example.com"
    preset_user_password: str = "change-this-development-password"
    amap_web_service_key: str = ""
    amap_web_service_base_url: str = "https://restapi.amap.com"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
