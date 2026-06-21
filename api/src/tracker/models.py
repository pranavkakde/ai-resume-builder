"""SQLAlchemy ORM model for the applications tracker."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, func

from src.core.database import Base


class Application(Base):
    """Persisted job-application record."""

    __tablename__ = "applications"

    id: int = Column(Integer, primary_key=True, autoincrement=True)  # type: ignore[assignment]
    company_name: str = Column(String, nullable=False)  # type: ignore[assignment]
    job_title: str = Column(String, nullable=False)  # type: ignore[assignment]
    jd_text: str | None = Column(Text, nullable=True)  # type: ignore[assignment]
    match_score: float | None = Column(Float, nullable=True)  # type: ignore[assignment]
    match_color: str | None = Column(String, nullable=True)  # type: ignore[assignment]
    resume_snapshot: str | None = Column(Text, nullable=True)  # type: ignore[assignment]
    status: str = Column(String, default="saved")  # type: ignore[assignment]
    notes: str | None = Column(Text, nullable=True)  # type: ignore[assignment]
    applied_date: datetime | None = Column(DateTime, nullable=True)  # type: ignore[assignment]
    created_at: datetime = Column(DateTime, server_default=func.now())  # type: ignore[assignment]
    updated_at: datetime = Column(  # type: ignore[assignment]
        DateTime, server_default=func.now(), onupdate=func.now()
    )
