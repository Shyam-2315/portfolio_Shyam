from pydantic import BaseModel, Field

from app.schemas.common import TimestampedModel


class ProjectBase(BaseModel):
    title: str
    subtitle: str | None = None
    description: str | None = None
    status: str | None = None
    tech_stack: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    github_url: str | None = None
    live_url: str | None = None
    screenshots: list[str] = Field(default_factory=list)
    architecture_image_url: str | None = None
    display_order: int = 0
    is_featured: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectRead(ProjectBase, TimestampedModel):
    pass
