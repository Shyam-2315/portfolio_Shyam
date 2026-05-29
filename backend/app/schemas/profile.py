from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import TimestampedModel


class ProfileBase(BaseModel):
    name: str
    role: str | None = None
    intro: str | None = None
    email: EmailStr | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    resume_url: str | None = None
    profile_image_url: str | None = None
    education: str | None = None
    location: str | None = None
    interests: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ProfileUpdate(ProfileBase):
    pass


class ProfileRead(ProfileBase, TimestampedModel):
    pass
