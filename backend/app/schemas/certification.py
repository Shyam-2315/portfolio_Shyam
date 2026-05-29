from datetime import date

from pydantic import BaseModel

from app.schemas.common import TimestampedModel


class CertificationBase(BaseModel):
    title: str
    issuer: str
    issue_date: date | None = None
    credential_id: str | None = None
    verify_url: str | None = None
    image_url: str | None = None


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(CertificationBase):
    pass


class CertificationRead(CertificationBase, TimestampedModel):
    pass
