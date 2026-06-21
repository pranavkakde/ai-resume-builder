"""Pydantic schemas for structured LLM input / output and provider config."""

from pydantic import BaseModel


# ── Resume analysis ──────────────────────────────────────────────────────────


class SkillItem(BaseModel):
    """A single skill with self-assessed proficiency."""

    name: str
    proficiency: str  # beginner / intermediate / advanced / expert


class ExperienceItem(BaseModel):
    """A single work-experience entry."""

    title: str
    company: str
    duration: str
    description: str
    technologies: list[str]


class EducationItem(BaseModel):
    """A single education entry."""

    degree: str
    institution: str
    year: str | None = None
    gpa: str | None = None


class StructuredResume(BaseModel):
    """Fully parsed, structured representation of a resume."""

    name: str
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    summary: str
    skills: list[SkillItem]
    experience: list[ExperienceItem]
    education: list[EducationItem]
    certifications: list[str]
    total_years_experience: float


# ── Job-description analysis ─────────────────────────────────────────────────


class JDRequirement(BaseModel):
    """A single requirement extracted from a job description."""

    name: str
    importance: str  # required / preferred / nice-to-have


class StructuredJD(BaseModel):
    """Fully parsed, structured representation of a job description."""

    title: str
    company: str | None = None
    required_skills: list[JDRequirement]
    preferred_skills: list[JDRequirement]
    experience_min_years: float
    experience_max_years: float | None = None
    education_requirements: list[str]
    responsibilities: list[str]
    qualifications: list[str]


# ── Recommendations ──────────────────────────────────────────────────────────


class Recommendation(BaseModel):
    """A single actionable recommendation for improving a resume."""

    id: str  # uuid
    category: str  # skills / experience / summary / education / certifications
    title: str  # short human-readable label
    original_text: str | None = None  # current resume text (None when adding new)
    suggested_text: str  # proposed replacement / addition
    reasoning: str  # why this change helps
    priority: str  # high / medium / low
    action: str  # add / modify / remove


# ── Resume content (for DOCX generation) ─────────────────────────────────────


class ResumeContent(BaseModel):
    """Final resume content ready to be rendered into a DOCX file."""

    name: str
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    summary: str
    skills: list[str]
    experience: list[ExperienceItem]
    education: list[EducationItem]
    certifications: list[str]


# ── Provider configuration ───────────────────────────────────────────────────


class LLMProviderConfig(BaseModel):
    """Configuration for a single LLM provider sent from the frontend."""

    provider: str  # gemini / openai / groq / azure
    api_key: str
    azure_endpoint: str | None = None
    azure_deployment: str | None = None
    azure_api_version: str | None = None
