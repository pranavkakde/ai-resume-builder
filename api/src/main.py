"""FastAPI application entry-point.

Configures CORS, registers all routers, creates DB tables on startup, and
exposes health-check and provider-settings endpoints.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from src.core.config import get_settings
from src.core.database import create_tables
from src.generator.router import router as generator_router
from src.matcher.router import router as matcher_router
from src.parser.router import router as parser_router
from src.tracker.router import router as tracker_router

# Ensure tracker models are imported so Base.metadata knows about the table
import src.tracker.models  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
    """Run startup logic before the app begins serving requests."""
    logger.info("Creating database tables …")
    create_tables()
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down.")


# ── App factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Resume Builder API",
    version="1.0.0",
    description="AI-powered resume analysis, matching, and generation backend.",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(parser_router)
app.include_router(matcher_router)
app.include_router(generator_router)
app.include_router(tracker_router)


# ── Global exception handler ────────────────────────────────────────────────


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — return a clean 500 JSON body."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# ── Health check ─────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str
    version: str


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Simple liveness probe."""
    return HealthResponse(status="ok", version="1.0.0")


# ── Provider settings ───────────────────────────────────────────────────────


class ProviderInfo(BaseModel):
    name: str
    display_name: str
    model: str


class ProvidersResponse(BaseModel):
    providers: list[ProviderInfo]


_AVAILABLE_PROVIDERS: list[dict[str, str]] = [
    {"name": "gemini", "display_name": "Google Gemini", "model": "gemini-2.5-flash"},
    {"name": "openai", "display_name": "OpenAI", "model": "gpt-4o-mini"},
    {"name": "groq", "display_name": "Groq", "model": "llama-3.3-70b-versatile"},
]


@app.get("/api/settings/providers", response_model=ProvidersResponse, tags=["settings"])
async def get_providers() -> ProvidersResponse:
    """Return the list of supported LLM providers so the frontend can render a picker."""
    settings = get_settings()
    providers: list[ProviderInfo] = []
    for p in _AVAILABLE_PROVIDERS:
        providers.append(ProviderInfo(**p))
    return ProvidersResponse(providers=providers)


# ── Uvicorn entry-point ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    _s = get_settings()
    uvicorn.run("src.main:app", host=_s.host, port=_s.port, reload=True)
