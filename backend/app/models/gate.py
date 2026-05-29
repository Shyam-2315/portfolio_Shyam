from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class GateSubject(TimestampMixin, Base):
    __tablename__ = "gate_subjects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    target_completion_date: Mapped[date | None] = mapped_column(Date)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    topics: Mapped[list["GateTopic"]] = relationship(back_populates="subject", cascade="all, delete-orphan")
    mistakes: Mapped[list["GateMistake"]] = relationship(back_populates="subject")


class GateTopic(TimestampMixin, Base):
    __tablename__ = "gate_topics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("gate_subjects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    confidence_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    revision_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    subject: Mapped[GateSubject] = relationship(back_populates="topics")
    mistakes: Mapped[list["GateMistake"]] = relationship(back_populates="topic")


class GateMockTest(TimestampMixin, Base):
    __tablename__ = "gate_mock_tests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, nullable=False)
    test_date: Mapped[date | None] = mapped_column(Date)
    remarks: Mapped[str | None] = mapped_column(Text)


class GateMistake(TimestampMixin, Base):
    __tablename__ = "gate_mistakes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subject_id: Mapped[int | None] = mapped_column(ForeignKey("gate_subjects.id", ondelete="SET NULL"))
    topic_id: Mapped[int | None] = mapped_column(ForeignKey("gate_topics.id", ondelete="SET NULL"))
    question: Mapped[str] = mapped_column(Text, nullable=False)
    mistake_reason: Mapped[str | None] = mapped_column(Text)
    correct_concept: Mapped[str | None] = mapped_column(Text)
    priority: Mapped[str | None] = mapped_column(String(50))
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    subject: Mapped[GateSubject | None] = relationship(back_populates="mistakes")
    topic: Mapped[GateTopic | None] = relationship(back_populates="mistakes")
