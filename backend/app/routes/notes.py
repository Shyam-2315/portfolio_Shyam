from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, Note
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services.auth import get_current_admin
from app.utils.crud import apply_updates, get_or_404

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[Note]:
    return list(db.scalars(select(Note).order_by(Note.is_important.desc(), Note.created_at.desc())))


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Note:
    note = Note(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Note:
    note = get_or_404(db, Note, note_id)
    apply_updates(note, payload.model_dump())
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    note = get_or_404(db, Note, note_id)
    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
