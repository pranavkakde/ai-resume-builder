"""Router for resume upload and parsing."""

from fastapi import APIRouter, UploadFile, File, HTTPException, status

from src.parser.schemas import ResumeUploadResponse
from src.parser.service import parse_resume

router = APIRouter(prefix="/api", tags=["parser"])

_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)) -> ResumeUploadResponse:
    """Accept a resume file, extract its text, and return structured metadata."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > _MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10 MB limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    text, page_count = parse_resume(file_bytes, file.filename)

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract any text from the uploaded file.",
        )

    return ResumeUploadResponse(
        filename=file.filename,
        text=text,
        page_count=page_count,
    )
