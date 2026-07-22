from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.v1.router import router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import User


def migrate_sqlite_trip_columns() -> None:
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        columns = connection.exec_driver_sql("PRAGMA table_info(trips)").mappings().all()
        if not columns or all(column["notnull"] == 0 for column in columns if column["name"] in {"name", "destination_city", "start_date", "end_date"}):
            return
        connection.exec_driver_sql("PRAGMA foreign_keys=OFF")
        connection.exec_driver_sql(
            """
            CREATE TABLE trips_new (
                id VARCHAR(36) PRIMARY KEY,
                owner_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(120),
                destination_city VARCHAR(100),
                destination_adcode VARCHAR(12),
                start_date DATE,
                end_date DATE,
                travelers INTEGER NOT NULL,
                daily_start_time TIME NOT NULL,
                daily_end_time TIME NOT NULL,
                notes TEXT,
                map_provider VARCHAR(20) NOT NULL,
                coordinate_system VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            )
            """
        )
        connection.exec_driver_sql(
            """
            INSERT INTO trips_new SELECT id, owner_id, name, destination_city, destination_adcode,
                start_date, end_date, travelers, daily_start_time, daily_end_time, notes, map_provider,
                coordinate_system, status, created_at, updated_at FROM trips
            """
        )
        connection.exec_driver_sql("DROP TABLE trips")
        connection.exec_driver_sql("ALTER TABLE trips_new RENAME TO trips")
        connection.exec_driver_sql("CREATE INDEX ix_trips_owner_id ON trips (owner_id)")
        connection.exec_driver_sql("PRAGMA foreign_keys=ON")


def migrate_sqlite_place_columns() -> None:
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        columns = {
            column["name"]
            for column in connection.exec_driver_sql("PRAGMA table_info(places)").mappings()
        }
        if "visit_time" not in columns:
            connection.exec_driver_sql("ALTER TABLE places ADD COLUMN visit_time TIME")
        if "sort_order" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE places ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0"
            )


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    migrate_sqlite_trip_columns()
    migrate_sqlite_place_columns()
    settings = get_settings()
    with SessionLocal() as db:
        email = settings.preset_user_email.lower()
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            db.add(User(email=email, password_hash=hash_password(settings.preset_user_password), display_name="Local Workspace"))
            db.commit()
    yield


settings = get_settings()
app = FastAPI(title="Travel Planner API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

