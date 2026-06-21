"""Router for the application-tracker CRUD endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.tracker.schemas import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationUpdate,
)
from src.tracker.service import (
    create_application,
    delete_application,
    get_application,
    list_applications,
    update_application,
)

router = APIRouter(prefix="/api", tags=["tracker"])


@router.get("/applications", response_model=ApplicationListResponse)
def list_apps(
    skip: int = 0,
    limit: int = 50,
    status: str | None = None,
    db: Session = Depends(get_db),
) -> ApplicationListResponse:
    """List applications with optional pagination and status filter."""
    apps, count = list_applications(db, skip=skip, limit=limit, status_filter=status)
    return ApplicationListResponse(
        applications=[ApplicationResponse.model_validate(a) for a in apps],
        count=count,
    )


@router.post(
    "/applications",
    response_model=ApplicationResponse,
    status_code=201,
)
def create_app(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    """Create a new application record."""
    app = create_application(db, data)
    return ApplicationResponse.model_validate(app)


@router.get("/applications/{app_id}", response_model=ApplicationResponse)
def get_app(
    app_id: int,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    """Retrieve a single application by ID."""
    app = get_application(db, app_id)
    return ApplicationResponse.model_validate(app)


@router.put("/applications/{app_id}", response_model=ApplicationResponse)
def update_app(
    app_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    """Update an existing application."""
    app = update_application(db, app_id, data)
    return ApplicationResponse.model_validate(app)


@router.delete("/applications/{app_id}", status_code=204)
def delete_app(
    app_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete an application by ID."""
    delete_application(db, app_id)
