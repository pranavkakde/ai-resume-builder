"""Pydantic schemas for the match-analysis endpoints."""

from pydantic import BaseModel

from src.llm.schemas import Recommendation, StructuredJD, StructuredResume


class MatchDimension(BaseModel):
    """A single scored dimension of the resume–JD match."""

    name: str  # e.g. "Technical Skills"
    score: float  # 0–100
    weight: float  # 0–1
    matched_items: list[str]
    missing_items: list[str]
    details: str


class MatchResult(BaseModel):
    """Aggregate match result across all dimensions."""

    overall_score: float  # 0–100
    color: str  # green / yellow / red
    dimensions: list[MatchDimension]
    summary: str


class AnalyzeRequest(BaseModel):
    """Request body for the /api/analyze endpoint."""

    resume_text: str
    jd_text: str
    provider: str  # gemini / openai / groq / azure
    api_key: str
    azure_endpoint: str | None = None
    azure_deployment: str | None = None
    azure_api_version: str | None = None


class AnalyzeResponse(BaseModel):
    """Full analysis response returned to the frontend."""

    match_result: MatchResult
    recommendations: list[Recommendation]
    structured_resume: StructuredResume
    structured_jd: StructuredJD
