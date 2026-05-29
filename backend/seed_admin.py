from sqlalchemy import select

from app.config import get_settings
from app.database import SessionLocal
from app.models import AdminUser
from app.utils.security import get_password_hash


def main() -> None:
    settings = get_settings()
    if not settings.admin_email or not settings.admin_password:
        raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")

    with SessionLocal() as db:
        admin = db.scalar(select(AdminUser).where(AdminUser.email == settings.admin_email))
        if admin:
            admin.hashed_password = get_password_hash(settings.admin_password)
            admin.is_active = True
            action = "Updated"
        else:
            admin = AdminUser(
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                is_active=True,
            )
            db.add(admin)
            action = "Created"
        db.commit()
        print(f"{action} admin user: {settings.admin_email}")


if __name__ == "__main__":
    main()
