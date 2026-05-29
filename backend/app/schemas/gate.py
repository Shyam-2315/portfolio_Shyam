from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedModel


class SubjectBase(BaseModel):
    name: str
    description: str | None = None
    progress_percentage: int = Field(default=0, ge=0, le=100)
    target_completion_date: date | None = None
    display_order: int = 0


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(SubjectBase):
    pass


class SubjectRead(SubjectBase, TimestampedModel):
    pass


class TopicBase(BaseModel):
    subject_id: int
    name: str
    is_completed: bool = False
    confidence_level: int = Field(default=0, ge=0, le=5)
    revision_count: int = Field(default=0, ge=0)
    notes: str | None = None


class TopicCreate(TopicBase):
    pass


class TopicUpdate(TopicBase):
    pass


class TopicRead(TopicBase, TimestampedModel):
    pass


class MockTestBase(BaseModel):
    test_name: str
    score: float
    total_marks: float
    test_date: date | None = None
    remarks: str | None = None


class MockTestCreate(MockTestBase):
    pass


class MockTestRead(MockTestBase, TimestampedModel):
    pass


class MistakeBase(BaseModel):
    subject_id: int | None = None
    topic_id: int | None = None
    question: str
    mistake_reason: str | None = None
    correct_concept: str | None = None
    priority: str | None = None
    is_resolved: bool = False


class MistakeCreate(MistakeBase):
    pass


class MistakeUpdate(MistakeBase):
    pass


class MistakeRead(MistakeBase, TimestampedModel):
    pass
