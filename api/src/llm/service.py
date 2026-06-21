"""Multi-provider LLM service using the strategy pattern.

Each provider (Gemini, OpenAI, Groq) implements the abstract ``LLMProvider``
interface.  The concrete provider is selected per-request based on the
provider name and API key supplied by the frontend.
"""

from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Any

from fastapi import HTTPException, status
from google import genai
from google.genai import types as genai_types
from groq import AsyncGroq
from openai import AsyncOpenAI, AsyncAzureOpenAI

from src.llm.prompts import (
    JD_ANALYSIS_PROMPT,
    MATCH_ANALYSIS_PROMPT,
    RECOMMENDATION_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    RESUME_GENERATION_PROMPT,
    RESUME_OVERHAUL_PROMPT,
)
from src.llm.schemas import (
    Recommendation,
    ResumeContent,
    StructuredJD,
    StructuredResume,
)

logger = logging.getLogger(__name__)

_VALID_PROVIDERS = {"gemini", "openai", "groq", "azure"}


# ── Helpers ──────────────────────────────────────────────────────────────────


def _extract_json(text: str) -> dict[str, Any]:
    """Extract JSON from a model response that may contain markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Strip ```json ... ``` wrappers
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    return json.loads(cleaned)


# ── Abstract base ────────────────────────────────────────────────────────────


class LLMProvider(ABC):
    """Abstract interface every LLM provider must implement."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: type | None = None,
    ) -> str:
        """Send a prompt pair and return the raw text response."""


# ── Gemini ───────────────────────────────────────────────────────────────────


class GeminiProvider(LLMProvider):
    """Google Gemini provider via the ``google-genai`` SDK."""

    MODEL = "gemini-2.5-flash"

    def __init__(self, api_key: str) -> None:
        self._client = genai.Client(api_key=api_key)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: type | None = None,
    ) -> str:
        try:
            config = genai_types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2,
                response_mime_type="application/json",
            )
            response = self._client.models.generate_content(
                model=self.MODEL,
                contents=user_prompt,
                config=config,
            )
            return response.text or ""
        except Exception as exc:
            logger.exception("Gemini API call failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error: {exc}",
            ) from exc


# ── OpenAI ───────────────────────────────────────────────────────────────────


class OpenAIProvider(LLMProvider):
    """OpenAI provider via the ``openai`` async SDK."""

    MODEL = "gpt-4o-mini"

    def __init__(self, api_key: str) -> None:
        self._client = AsyncOpenAI(api_key=api_key)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: type | None = None,
    ) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            return response.choices[0].message.content or ""
        except Exception as exc:
            logger.exception("OpenAI API call failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"OpenAI API error: {exc}",
            ) from exc


# ── Groq ─────────────────────────────────────────────────────────────────────


class GroqProvider(LLMProvider):
    """Groq provider via the ``groq`` async SDK."""

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self, api_key: str) -> None:
        self._client = AsyncGroq(api_key=api_key)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: type | None = None,
    ) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            return response.choices[0].message.content or ""
        except Exception as exc:
            logger.exception("Groq API call failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq API error: {exc}",
            ) from exc


# ── Azure OpenAI ─────────────────────────────────────────────────────────────


class AzureOpenAIProvider(LLMProvider):
    """Azure OpenAI provider via the ``openai`` async SDK."""

    def __init__(self, api_key: str, endpoint: str, deployment: str, api_version: str) -> None:
        if not endpoint or not deployment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Azure OpenAI requires azure_endpoint and azure_deployment.",
            )
        self.deployment = deployment
        if not api_version:
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url=endpoint,
            )
        else:
            self._client = AsyncAzureOpenAI(
                api_key=api_key,
                azure_endpoint=endpoint,
                api_version=api_version,
            )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: type | None = None,
    ) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            return response.choices[0].message.content or ""
        except Exception as exc:
            logger.exception("Azure OpenAI API call failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Azure OpenAI API error: {exc}",
            ) from exc


# ── Orchestrating service ────────────────────────────────────────────────────


class LLMService:
    """Facade that delegates to the correct LLM provider per request."""

    def __init__(self) -> None:
        self._provider_classes: dict[str, type[LLMProvider]] = {
            "gemini": GeminiProvider,
            "openai": OpenAIProvider,
            "groq": GroqProvider,
            "azure": AzureOpenAIProvider,
        }

    # ── factory ──────────────────────────────────────────────────────────

    def get_provider(self, provider_name: str, api_key: str, **kwargs) -> LLMProvider:
        """Instantiate the requested LLM provider."""
        name = provider_name.lower().strip()
        if name not in _VALID_PROVIDERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown LLM provider '{provider_name}'. Choose from: {', '.join(sorted(_VALID_PROVIDERS))}",
            )
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"API key for provider '{name}' is required.",
            )
        
        if name == "azure":
            return self._provider_classes[name](
                api_key=api_key,
                endpoint=kwargs.get("azure_endpoint") or "",
                deployment=kwargs.get("azure_deployment") or "",
                api_version=kwargs.get("azure_api_version") or "",
            )
            
        return self._provider_classes[name](api_key=api_key)

    # ── high-level methods ───────────────────────────────────────────────

    async def analyze_resume(
        self, text: str, provider: str, api_key: str, **kwargs
    ) -> StructuredResume:
        """Parse raw resume text into a ``StructuredResume``."""
        llm = self.get_provider(provider, api_key, **kwargs)
        raw = await llm.generate(
            system_prompt=RESUME_ANALYSIS_PROMPT,
            user_prompt=f"Here is the resume text to analyse:\n\n{text}",
        )
        data = _extract_json(raw)
        return StructuredResume.model_validate(data)

    async def analyze_jd(
        self, text: str, provider: str, api_key: str, **kwargs
    ) -> StructuredJD:
        """Parse raw job-description text into a ``StructuredJD``."""
        llm = self.get_provider(provider, api_key, **kwargs)
        raw = await llm.generate(
            system_prompt=JD_ANALYSIS_PROMPT,
            user_prompt=f"Here is the job description to analyse:\n\n{text}",
        )
        data = _extract_json(raw)
        return StructuredJD.model_validate(data)

    async def semantic_match(
        self,
        resume: StructuredResume,
        jd: StructuredJD,
        provider: str,
        api_key: str,
        **kwargs
    ) -> dict[str, Any]:
        """Ask the LLM for a semantic match analysis."""
        llm = self.get_provider(provider, api_key, **kwargs)
        user_prompt = (
            "RESUME:\n"
            + resume.model_dump_json(indent=2)
            + "\n\nJOB DESCRIPTION:\n"
            + jd.model_dump_json(indent=2)
        )
        raw = await llm.generate(
            system_prompt=MATCH_ANALYSIS_PROMPT,
            user_prompt=user_prompt,
        )
        return _extract_json(raw)

    async def generate_recommendations(
        self,
        resume: StructuredResume,
        jd: StructuredJD,
        match_result: dict[str, Any],
        provider: str,
        api_key: str,
        **kwargs
    ) -> list[Recommendation]:
        """Generate actionable resume recommendations."""
        llm = self.get_provider(provider, api_key, **kwargs)
        user_prompt = (
            "RESUME:\n"
            + resume.model_dump_json(indent=2)
            + "\n\nJOB DESCRIPTION:\n"
            + jd.model_dump_json(indent=2)
            + "\n\nMATCH ANALYSIS:\n"
            + json.dumps(match_result, indent=2)
        )
        raw = await llm.generate(
            system_prompt=RECOMMENDATION_PROMPT,
            user_prompt=user_prompt,
        )
        data = _extract_json(raw)
        recs_raw = data.get("recommendations", data if isinstance(data, list) else [])
        return [Recommendation.model_validate(r) for r in recs_raw]

    async def generate_resume_content(
        self,
        resume: StructuredResume,
        recommendations: list[Recommendation],
        jd: StructuredJD,
        mode: str,
        provider: str,
        api_key: str,
        **kwargs
    ) -> ResumeContent:
        """Generate updated resume content incorporating recommendations."""
        if mode == "overhaul":
            system_prompt = RESUME_OVERHAUL_PROMPT
            user_prompt = (
                "RESUME:\n"
                + resume.model_dump_json(indent=2)
                + "\n\nTARGET JOB DESCRIPTION:\n"
                + jd.model_dump_json(indent=2)
            )
        else:
            system_prompt = RESUME_GENERATION_PROMPT
            recs_payload = [r.model_dump() for r in recommendations]
            user_prompt = (
                "RESUME:\n"
                + resume.model_dump_json(indent=2)
                + "\n\nTARGET JOB DESCRIPTION:\n"
                + jd.model_dump_json(indent=2)
                + "\n\nACCEPTED RECOMMENDATIONS:\n"
                + json.dumps(recs_payload, indent=2)
            )

        llm = self.get_provider(provider, api_key, **kwargs)
        raw = await llm.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        data = _extract_json(raw)
        return ResumeContent.model_validate(data)


# ── Singleton ────────────────────────────────────────────────────────────────


@lru_cache
def get_llm_service() -> LLMService:
    """Return a cached singleton ``LLMService`` instance."""
    return LLMService()
