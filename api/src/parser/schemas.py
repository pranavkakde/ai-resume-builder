"""Pydantic schemas for resume parsing endpoints."""

from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    """Response returned after successfully uploading and parsing a resume."""

    filename: str
    text: str
    page_count: int
