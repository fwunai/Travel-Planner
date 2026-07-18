import uuid
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.security import utcnow


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    destination_city: Mapped[str] = mapped_column(String(100))
    destination_adcode: Mapped[str | None] = mapped_column(String(12), nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    travelers: Mapped[int] = mapped_column(Integer, default=1)
    daily_start_time: Mapped[time] = mapped_column(Time, default=time(9, 0))
    daily_end_time: Mapped[time] = mapped_column(Time, default=time(21, 0))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    map_provider: Mapped[str] = mapped_column(String(20), default="amap")
    coordinate_system: Mapped[str] = mapped_column(String(20), default="GCJ02")
    status: Mapped[str] = mapped_column(String(20), default="planning")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
