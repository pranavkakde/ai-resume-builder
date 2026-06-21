"""CRUD service for the application tracker."""

from fastapi import HTTPException, status
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from src.tracker.models import Application
from src.tracker.schemas import ApplicationCreate, ApplicationUpdate


def create_application(db: Session, data: ApplicationCreate) -> Application:
    """Insert a new application record."""
    app = Application(**data.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def list_applications(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
) -> tuple[list[Application], int]:
    """Return a paginated list of applications with optional status filter."""
    query = db.query(Application)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    count: int = query.with_entities(sa_func.count()).scalar() or 0
    apps = (
        query.order_by(Application.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return apps, count


def get_application(db: Session, app_id: int) -> Application:
    """Fetch a single application by ID or raise 404."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if app is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {app_id} not found.",
        )
    return app


def update_application(
    db: Session, app_id: int, data: ApplicationUpdate
) -> Application:
    """Update an existing application with only the provided fields."""
    app = get_application(db, app_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app


def delete_application(db: Session, app_id: int) -> None:
    """Delete an application by ID or raise 404."""
    app = get_application(db, app_id)
    db.delete(app)
    db.commit()
