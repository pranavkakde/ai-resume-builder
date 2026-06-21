"""Pydantic schemas for the application-tracker CRUD endpoints."""

from datetime import datetime

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    """Payload for creating a new application record."""

    company_name: str
    job_title: str
    jd_text: str | None = None
    match_score: float | None = None
    match_color: str | None = None
    resume_snapshot: str | None = None
    status: str = "saved"
    notes: str | None = None
    applied_date: datetime | None = None


class ApplicationUpdate(BaseModel):
    """Payload for updating an existing application — all fields optional."""

    company_name: str | None = None
    job_title: str | None = None
    jd_text: str | None = None
    match_score: float | None = None
    match_color: str | None = None
    resume_snapshot: str | None = None
    status: str | None = None
    notes: str | None = None
    applied_date: datetime | None = None


class ApplicationResponse(BaseModel):
    """Serialised application returned to the frontend."""

    model_config = {"from_attributes": True}

    id: int
    company_name: str
    job_title: str
    jd_text: str | None = None
    match_score: float | None = None
    match_color: str | None = None
    resume_snapshot: str | None = None
    status: str
    notes: str | None = None
    applied_date: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ApplicationListResponse(BaseModel):
    """Paginated list of applications."""

    applications: list[ApplicationResponse]
    count: int
