from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, GateMistake, GateMockTest, GateSubject, GateTopic
from app.schemas.gate import (
    MistakeCreate,
    MistakeRead,
    MistakeUpdate,
    MockTestCreate,
    MockTestRead,
    SubjectCreate,
    SubjectRead,
    SubjectUpdate,
    TopicCreate,
    TopicRead,
    TopicUpdate,
)
from app.services.auth import get_current_admin
from app.utils.crud import apply_updates, get_or_404

router = APIRouter(prefix="/api/gate", tags=["gate"])


@router.get("/subjects", response_model=list[SubjectRead])
def list_subjects(db: Session = Depends(get_db)) -> list[GateSubject]:
    return list(db.scalars(select(GateSubject).order_by(GateSubject.display_order.asc(), GateSubject.name.asc())))


@router.post("/subjects", response_model=SubjectRead, status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    subject = GateSubject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.put("/subjects/{subject_id}", response_model=SubjectRead)
def update_subject(subject_id: int, payload: SubjectUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    subject = get_or_404(db, GateSubject, subject_id)
    apply_updates(subject, payload.model_dump())
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    subject = get_or_404(db, GateSubject, subject_id)
    db.delete(subject)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/topics", response_model=list[TopicRead])
def list_topics(db: Session = Depends(get_db)) -> list[GateTopic]:
    return list(db.scalars(select(GateTopic).order_by(GateTopic.subject_id.asc(), GateTopic.name.asc())))


@router.post("/topics", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
def create_topic(payload: TopicCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    get_or_404(db, GateSubject, payload.subject_id)
    topic = GateTopic(**payload.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.put("/topics/{topic_id}", response_model=TopicRead)
def update_topic(topic_id: int, payload: TopicUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    get_or_404(db, GateSubject, payload.subject_id)
    topic = get_or_404(db, GateTopic, topic_id)
    apply_updates(topic, payload.model_dump())
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    topic = get_or_404(db, GateTopic, topic_id)
    db.delete(topic)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/mock-tests", response_model=list[MockTestRead])
def list_mock_tests(db: Session = Depends(get_db)) -> list[GateMockTest]:
    return list(db.scalars(select(GateMockTest).order_by(GateMockTest.test_date.desc().nullslast())))


@router.post("/mock-tests", response_model=MockTestRead, status_code=status.HTTP_201_CREATED)
def create_mock_test(payload: MockTestCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    mock_test = GateMockTest(**payload.model_dump())
    db.add(mock_test)
    db.commit()
    db.refresh(mock_test)
    return mock_test


@router.put("/mock-tests/{mock_test_id}", response_model=MockTestRead)
def update_mock_test(mock_test_id: int, payload: MockTestCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    mock_test = get_or_404(db, GateMockTest, mock_test_id)
    apply_updates(mock_test, payload.model_dump())
    db.commit()
    db.refresh(mock_test)
    return mock_test


@router.delete("/mock-tests/{mock_test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mock_test(mock_test_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    mock_test = get_or_404(db, GateMockTest, mock_test_id)
    db.delete(mock_test)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/mistakes", response_model=list[MistakeRead])
def list_mistakes(db: Session = Depends(get_db)) -> list[GateMistake]:
    return list(db.scalars(select(GateMistake).order_by(GateMistake.created_at.desc())))


def _validate_mistake_links(db: Session, payload: MistakeCreate | MistakeUpdate) -> None:
    if payload.subject_id is not None:
        get_or_404(db, GateSubject, payload.subject_id)
    if payload.topic_id is not None:
        get_or_404(db, GateTopic, payload.topic_id)


@router.post("/mistakes", response_model=MistakeRead, status_code=status.HTTP_201_CREATED)
def create_mistake(payload: MistakeCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    _validate_mistake_links(db, payload)
    mistake = GateMistake(**payload.model_dump())
    db.add(mistake)
    db.commit()
    db.refresh(mistake)
    return mistake


@router.put("/mistakes/{mistake_id}", response_model=MistakeRead)
def update_mistake(mistake_id: int, payload: MistakeUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    _validate_mistake_links(db, payload)
    mistake = get_or_404(db, GateMistake, mistake_id)
    apply_updates(mistake, payload.model_dump())
    db.commit()
    db.refresh(mistake)
    return mistake


@router.delete("/mistakes/{mistake_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mistake(mistake_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)) -> Response:
    mistake = get_or_404(db, GateMistake, mistake_id)
    db.delete(mistake)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
