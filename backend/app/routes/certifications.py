from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, Certification
from app.schemas.certification import CertificationCreate, CertificationRead, CertificationUpdate
from app.services.auth import get_current_admin
from app.utils.crud import apply_updates, get_or_404

router = APIRouter(prefix="/api/certifications", tags=["certifications"])


@router.get("", response_model=list[CertificationRead])
def list_certifications(db: Session = Depends(get_db)) -> list[Certification]:
    return list(db.scalars(select(Certification).order_by(Certification.issue_date.desc().nullslast())))


@router.post("", response_model=CertificationRead, status_code=status.HTTP_201_CREATED)
def create_certification(
    payload: CertificationCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Certification:
    certification = Certification(**payload.model_dump())
    db.add(certification)
    db.commit()
    db.refresh(certification)
    return certification


@router.put("/{certification_id}", response_model=CertificationRead)
def update_certification(
    certification_id: int,
    payload: CertificationUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Certification:
    certification = get_or_404(db, Certification, certification_id)
    apply_updates(certification, payload.model_dump())
    db.commit()
    db.refresh(certification)
    return certification


@router.delete("/{certification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(
    certification_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Response:
    certification = get_or_404(db, Certification, certification_id)
    db.delete(certification)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
