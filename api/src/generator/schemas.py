"""Pydantic schemas for the resume-generation endpoint."""

from pydantic import BaseModel

from src.llm.schemas import StructuredJD, StructuredResume


class AcceptedRecommendation(BaseModel):
    """A recommendation the user has accepted (possibly after editing)."""

    id: str
    category: str
    suggested_text: str  # may have been edited by the user
    action: str  # add / modify / remove


class GenerateRequest(BaseModel):
    """Request body for POST /api/generate-resume."""

    resume_text: str  # original raw resume text
    jd_text: str  # job description for context
    accepted_recommendations: list[AcceptedRecommendation]
    mode: str  # enhanced / accept_all / overhaul
    provider: str  # gemini / openai / groq / azure
    api_key: str
    azure_endpoint: str | None = None
    azure_deployment: str | None = None
    azure_api_version: str | None = None
    structured_resume: StructuredResume | None = None
    structured_jd: StructuredJD | None = None
