from fastapi import APIRouter, Depends, File, UploadFile, status

from app.models import AdminUser
from app.schemas.upload import UploadResponse
from app.services.auth import get_current_admin
from app.services.uploads import save_upload

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/image", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_image(file: UploadFile = File(...), _: AdminUser = Depends(get_current_admin)) -> UploadResponse:
    file_url, filename, content_type, size_bytes = save_upload(file, "image")
    return UploadResponse(
        file_url=file_url,
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
    )


@router.post("/project", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_project(file: UploadFile = File(...), _: AdminUser = Depends(get_current_admin)) -> UploadResponse:
    file_url, filename, content_type, size_bytes = save_upload(file, "project")
    return UploadResponse(
        file_url=file_url,
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
    )


@router.post("/certificate", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_certificate(file: UploadFile = File(...), _: AdminUser = Depends(get_current_admin)) -> UploadResponse:
    file_url, filename, content_type, size_bytes = save_upload(file, "certificate")
    return UploadResponse(
        file_url=file_url,
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
    )


@router.post("/resume", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(file: UploadFile = File(...), _: AdminUser = Depends(get_current_admin)) -> UploadResponse:
    file_url, filename, content_type, size_bytes = save_upload(file, "resume")
    return UploadResponse(
        file_url=file_url,
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
    )


@router.post("/note", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_note(file: UploadFile = File(...), _: AdminUser = Depends(get_current_admin)) -> UploadResponse:
    file_url, filename, content_type, size_bytes = save_upload(file, "note")
    return UploadResponse(
        file_url=file_url,
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
    )
