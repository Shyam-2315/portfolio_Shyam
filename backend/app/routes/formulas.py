from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, Formula
from app.schemas.formula import FormulaCreate, FormulaRead, FormulaUpdate
from app.services.auth import get_current_admin
from app.utils.crud import apply_updates, get_or_404

router = APIRouter(prefix="/api/formulas", tags=["formulas"])


@router.get("", response_model=list[FormulaRead])
def list_formulas(db: Session = Depends(get_db)) -> list[Formula]:
    return list(db.scalars(select(Formula).order_by(Formula.is_favorite.desc(), Formula.priority.desc())))


@router.post("", response_model=FormulaRead, status_code=status.HTTP_201_CREATED)
def create_formula(payload: FormulaCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Formula:
    formula = Formula(**payload.model_dump())
    db.add(formula)
    db.commit()
    db.refresh(formula)
    return formula


@router.put("/{formula_id}", response_model=FormulaRead)
def update_formula(formula_id: int, payload: FormulaUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Formula:
    formula = get_or_404(db, Formula, formula_id)
    apply_updates(formula, payload.model_dump())
    db.commit()
    db.refresh(formula)
    return formula


@router.delete("/{formula_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_formula(formula_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    formula = get_or_404(db, Formula, formula_id)
    db.delete(formula)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
