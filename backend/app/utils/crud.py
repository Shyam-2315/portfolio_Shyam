from fastapi import HTTPException, status
from sqlalchemy.orm import Session


def get_or_404(db: Session, model: type, item_id: int):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{model.__name__} not found")
    return item


def apply_updates(instance, data: dict):
    for key, value in data.items():
        setattr(instance, key, value)
    return instance
