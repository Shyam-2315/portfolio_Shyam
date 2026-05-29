from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings


ALLOWED_TYPES = {
    "image": {"image/jpeg", "image/png", "image/webp", "image/gif"},
    "resume": {"application/pdf"},
    "note": {"application/pdf", "text/plain", "text/markdown", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
}

EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


def save_upload(file: UploadFile, category: str) -> tuple[str, str]:
    settings = get_settings()
    if category not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported upload category")

    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES[category]:
        allowed = ", ".join(sorted(ALLOWED_TYPES[category]))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported file type. Allowed types: {allowed}")

    upload_root = Path(settings.upload_dir)
    target_dir = upload_root / category
    target_dir.mkdir(parents=True, exist_ok=True)

    suffix = EXTENSIONS.get(content_type) or Path(file.filename or "").suffix
    if not suffix:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file must include a supported extension")

    filename = f"{uuid4().hex}{suffix}"
    destination = target_dir / filename

    bytes_written = 0
    with destination.open("wb") as buffer:
        while chunk := file.file.read(1024 * 1024):
            bytes_written += len(chunk)
            if bytes_written > settings.max_upload_size_bytes:
                buffer.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
            buffer.write(chunk)

    public_url = f"/uploads/{category}/{filename}"
    return public_url, filename
