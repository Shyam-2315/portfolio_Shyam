from pydantic import BaseModel


class UploadResponse(BaseModel):
    file_url: str
    filename: str
