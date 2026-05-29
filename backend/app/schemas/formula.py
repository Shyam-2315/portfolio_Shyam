from pydantic import BaseModel, Field

from app.schemas.common import TimestampedModel


class FormulaBase(BaseModel):
    title: str
    subject: str | None = None
    formula: str
    explanation: str | None = None
    tags: list[str] = Field(default_factory=list)
    priority: int = 0
    is_favorite: bool = False


class FormulaCreate(FormulaBase):
    pass


class FormulaUpdate(FormulaBase):
    pass


class FormulaRead(FormulaBase, TimestampedModel):
    pass
