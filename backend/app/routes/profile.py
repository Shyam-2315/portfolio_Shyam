from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, Profile
from app.schemas.profile import ProfileRead, ProfileUpdate
from app.services.auth import get_current_admin
from app.utils.crud import apply_updates

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileRead)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    profile = db.scalar(select(Profile).order_by(Profile.id.asc()))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


@router.put("", response_model=ProfileRead)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Profile:
    profile = db.scalar(select(Profile).order_by(Profile.id.asc()))
    if profile:
        apply_updates(profile, payload.model_dump())
    else:
        profile = Profile(**payload.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
