"""Match-engine service — calculates weighted resume-vs-JD match scores.

The heavy semantic comparison is delegated to the LLM; this module applies
the weighting formula and colour thresholds.
"""

from __future__ import annotations

from typing import Any

from src.llm.schemas import StructuredJD, StructuredResume
from src.llm.service import LLMService
from src.matcher.schemas import MatchDimension, MatchResult

# Dimension name → weight mapping
_WEIGHTS: dict[str, float] = {
    "Technical Skills": 0.30,
    "Required Skills": 0.25,
    "Preferred Skills": 0.15,
    "Experience Level": 0.20,
    "Education": 0.10,
}


def _score_color(score: float) -> str:
    """Return a traffic-light colour string for a given 0–100 score."""
    if score >= 75:
        return "green"
    if score >= 50:
        return "yellow"
    return "red"


async def calculate_match(
    resume: StructuredResume,
    jd: StructuredJD,
    llm_service: LLMService,
    provider: str,
    api_key: str,
    **kwargs
) -> MatchResult:
    """Run the full match analysis and return a weighted ``MatchResult``.

    Steps:
    1. Ask the LLM for per-dimension semantic scores.
    2. Build ``MatchDimension`` objects with the canonical weights.
    3. Compute the weighted overall score.
    4. Determine the colour band.
    """
    raw: dict[str, Any] = await llm_service.semantic_match(
        resume, jd, provider, api_key, **kwargs
    )

    dimensions: list[MatchDimension] = []
    llm_dims: list[dict[str, Any]] = raw.get("dimensions", [])

    # Build a lookup so we can match LLM dimension names to our weights
    llm_by_name: dict[str, dict[str, Any]] = {
        d.get("name", ""): d for d in llm_dims
    }

    for dim_name, weight in _WEIGHTS.items():
        llm_dim = llm_by_name.get(dim_name, {})
        dim = MatchDimension(
            name=dim_name,
            score=float(llm_dim.get("score", 0)),
            weight=weight,
            matched_items=llm_dim.get("matched_items", []),
            missing_items=llm_dim.get("missing_items", []),
            details=llm_dim.get("details", ""),
        )
        dimensions.append(dim)

    overall = sum(d.score * d.weight for d in dimensions)
    summary = raw.get("summary", "")

    return MatchResult(
        overall_score=round(overall, 1),
        color=_score_color(overall),
        dimensions=dimensions,
        summary=summary,
    )
