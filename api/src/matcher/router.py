"""Router for the resume-vs-JD analysis endpoint."""

from fastapi import APIRouter

from src.llm.service import get_llm_service
from src.matcher.schemas import AnalyzeRequest, AnalyzeResponse
from src.matcher.service import calculate_match

router = APIRouter(prefix="/api", tags=["matcher"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Analyse a resume against a job description.

    Pipeline:
    1. LLM parses resume text → ``StructuredResume``
    2. LLM parses JD text → ``StructuredJD``
    3. Matcher service computes weighted match scores
    4. LLM generates actionable recommendations
    5. Everything is bundled and returned
    """
    llm = get_llm_service()

    azure_kwargs = {
        "azure_endpoint": request.azure_endpoint,
        "azure_deployment": request.azure_deployment,
        "azure_api_version": request.azure_api_version,
    }

    # Step 1 & 2 — parse both documents
    structured_resume = await llm.analyze_resume(
        request.resume_text, request.provider, request.api_key, **azure_kwargs
    )
    structured_jd = await llm.analyze_jd(
        request.jd_text, request.provider, request.api_key, **azure_kwargs
    )

    # Step 3 — calculate match
    match_result = await calculate_match(
        structured_resume, structured_jd, llm, request.provider, request.api_key, **azure_kwargs
    )

    # Step 4 — generate recommendations
    recommendations = await llm.generate_recommendations(
        structured_resume,
        structured_jd,
        match_result.model_dump(),
        request.provider,
        request.api_key,
        **azure_kwargs
    )

    return AnalyzeResponse(
        match_result=match_result,
        recommendations=recommendations,
        structured_resume=structured_resume,
        structured_jd=structured_jd,
    )
