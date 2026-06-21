"""Router for resume DOCX generation."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.generator.schemas import GenerateRequest
from src.generator.service import generate_resume

import io

router = APIRouter(prefix="/api", tags=["generator"])


@router.post("/generate-resume")
async def generate_resume_endpoint(request: GenerateRequest) -> StreamingResponse:
    """Generate a tailored DOCX resume and stream it back to the client."""
    docx_bytes = await generate_resume(request)

    filename = "tailored_resume.docx"

    return StreamingResponse(
        content=io.BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
