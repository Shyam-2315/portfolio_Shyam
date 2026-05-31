from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings


MB = 1024 * 1024


@dataclass(frozen=True)
class UploadRule:
    folder: str
    content_types: frozenset[str]
    extensions: frozenset[str]
    max_bytes: int


IMAGE_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})

UPLOAD_RULES: dict[str, UploadRule] = {
    "image": UploadRule("images", IMAGE_TYPES, frozenset({".jpg", ".jpeg", ".png", ".webp"}), 2 * MB),
    "project": UploadRule("projects", IMAGE_TYPES, frozenset({".jpg", ".jpeg", ".png", ".webp"}), 5 * MB),
    "certificate": UploadRule(
        "certificates",
        IMAGE_TYPES,
        frozenset({".jpg", ".jpeg", ".png", ".webp"}),
        5 * MB,
    ),
    "note": UploadRule(
        "notes",
        frozenset({"application/pdf", "image/jpeg", "image/png"}),
        frozenset({".pdf", ".jpg", ".jpeg", ".png"}),
        10 * MB,
    ),
    "resume": UploadRule("resumes", frozenset({"application/pdf"}), frozenset({".pdf"}), 5 * MB),
}

EXTENSION_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


def ensure_upload_folders() -> None:
    upload_root = get_settings().upload_dir.resolve()
    for rule in UPLOAD_RULES.values():
        (upload_root / rule.folder).mkdir(parents=True, exist_ok=True)


def save_upload(file: UploadFile, category: str) -> tuple[str, str, str, int]:
    rule = UPLOAD_RULES.get(category)
    if not rule:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported upload category")

    content_type = file.content_type or ""
    if content_type not in rule.content_types:
        allowed = ", ".join(sorted(rule.content_types))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {allowed}",
        )

    original_suffix = Path(file.filename or "").suffix.lower()
    if original_suffix not in rule.extensions:
        allowed = ", ".join(sorted(rule.extensions))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension. Allowed extensions: {allowed}",
        )

    upload_root = get_settings().upload_dir.resolve()
    target_dir = (upload_root / rule.folder).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)
    if upload_root not in target_dir.parents and target_dir != upload_root:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload path is invalid")

    suffix = EXTENSION_BY_TYPE.get(content_type, original_suffix)
    filename = f"{uuid4().hex}{suffix}"
    destination = (target_dir / filename).resolve()
    if target_dir not in destination.parents:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload path is invalid")

    bytes_written = 0
    try:
        with destination.open("wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > rule.max_bytes:
                    buffer.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum size is {rule.max_bytes} bytes.",
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except OSError as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Upload failed",
        ) from exc

    public_url = f"/uploads/{rule.folder}/{filename}"
    return public_url, filename, content_type, bytes_written
