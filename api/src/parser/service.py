"""Resume file parsing service — extracts text from PDF, DOCX, DOC, and TXT."""

import io

import docx  # python-docx
import fitz  # PyMuPDF

from fastapi import HTTPException, status


def parse_pdf(file_bytes: bytes) -> tuple[str, int]:
    """Extract text and page count from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages: list[str] = []
        for page in doc:
            text = page.get_text("text")
            if text:
                pages.append(text.strip())
        page_count = len(doc)
        doc.close()
        return "\n\n".join(pages), page_count
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse PDF: {exc}",
        ) from exc


def parse_docx(file_bytes: bytes) -> tuple[str, int]:
    """Extract text from a DOCX file. Page count is estimated as 1."""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)
        # DOCX doesn't have a reliable page count; estimate from content length
        estimated_pages = max(1, len(text) // 3000 + 1)
        return text, estimated_pages
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse DOCX: {exc}",
        ) from exc


def parse_txt(file_bytes: bytes) -> tuple[str, int]:
    """Extract text from a plain-text file."""
    try:
        text = file_bytes.decode("utf-8", errors="replace")
        estimated_pages = max(1, len(text) // 3000 + 1)
        return text, estimated_pages
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse TXT: {exc}",
        ) from exc


_SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


def parse_resume(file_bytes: bytes, filename: str) -> tuple[str, int]:
    """Route parsing to the correct handler based on file extension.

    Supported formats: .pdf, .docx, .doc, .txt
    """
    ext = "." + filename.rsplit(".", maxsplit=1)[-1].lower() if "." in filename else ""

    if ext not in _SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{ext}'. "
                f"Supported types: {', '.join(sorted(_SUPPORTED_EXTENSIONS))}"
            ),
        )

    if ext == ".pdf":
        return parse_pdf(file_bytes)
    if ext in {".docx", ".doc"}:
        return parse_docx(file_bytes)
    # .txt
    return parse_txt(file_bytes)
