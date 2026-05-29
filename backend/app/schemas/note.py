from pydantic import BaseModel, Field

from app.schemas.common import TimestampedModel


class NoteBase(BaseModel):
    title: str
    subject: str | None = None
    description: str | None = None
    file_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    is_important: bool = False


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class NoteRead(NoteBase, TimestampedModel):
    pass
