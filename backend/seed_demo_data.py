from datetime import date

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Certification, Formula, GateSubject, GateTopic, Note, Profile, Project


PLACEHOLDER_GITHUB = "https://placeholder.example.com/github"
PLACEHOLDER_LINKEDIN = "https://placeholder.example.com/linkedin"
PLACEHOLDER_RESUME = "https://placeholder.example.com/resume.pdf"
PLACEHOLDER_VERIFY = "https://placeholder.example.com/certificate"


def upsert_one(db, model, lookup: dict, values: dict):
    item = db.scalar(select(model).filter_by(**lookup))
    if item:
        for key, value in values.items():
            setattr(item, key, value)
        return item

    item = model(**lookup, **values)
    db.add(item)
    return item


def seed_profile(db) -> None:
    profile = db.scalar(select(Profile).order_by(Profile.id.asc()))
    values = {
        "name": "Your Name",
        "role": "AI, Backend, and Security Engineer",
        "intro": "Replace this starter profile with your real personal summary from the admin dashboard.",
        "email": "you@example.com",
        "linkedin_url": PLACEHOLDER_LINKEDIN,
        "github_url": PLACEHOLDER_GITHUB,
        "resume_url": PLACEHOLDER_RESUME,
        "profile_image_url": None,
        "education": "Degree or program\nInstitution name\nExpected graduation year",
        "location": "Your City, Country",
        "interests": ["AI systems", "Backend engineering", "Security operations"],
        "skills": ["Python", "TypeScript", "FastAPI", "React", "PostgreSQL", "Docker"],
    }
    if profile:
        for key, value in values.items():
            setattr(profile, key, value)
    else:
        db.add(Profile(**values))


def seed_projects(db) -> None:
    upsert_one(
        db,
        Project,
        {"title": "AI Operations Dashboard"},
        {
            "subtitle": "Backend-driven portfolio module",
            "description": "Starter project record for showcasing an API-first dashboard. Replace details with your real project.",
            "status": "in-dev",
            "tech_stack": ["FastAPI", "PostgreSQL", "React", "React Query"],
            "features": ["JWT-protected admin tools", "Live API data", "Upload-ready media fields"],
            "github_url": PLACEHOLDER_GITHUB,
            "live_url": None,
            "screenshots": [],
            "architecture_image_url": None,
            "display_order": 1,
            "is_featured": True,
        },
    )
    upsert_one(
        db,
        Project,
        {"title": "GATE Study Tracker"},
        {
            "subtitle": "Personal exam preparation system",
            "description": "Starter project record for tracking subjects, topics, mock tests, and mistakes.",
            "status": "research",
            "tech_stack": ["Python", "FastAPI", "SQLAlchemy", "React"],
            "features": ["Subject progress", "Mistake review", "Formula and notes vault"],
            "github_url": PLACEHOLDER_GITHUB,
            "live_url": None,
            "screenshots": [],
            "architecture_image_url": None,
            "display_order": 2,
            "is_featured": False,
        },
    )


def seed_gate(db) -> None:
    algorithms = upsert_one(
        db,
        GateSubject,
        {"name": "Algorithms"},
        {
            "description": "Sorting, graphs, dynamic programming, complexity analysis.",
            "progress_percentage": 45,
            "target_completion_date": None,
            "display_order": 1,
        },
    )
    operating_systems = upsert_one(
        db,
        GateSubject,
        {"name": "Operating Systems"},
        {
            "description": "Processes, memory management, file systems, synchronization.",
            "progress_percentage": 35,
            "target_completion_date": None,
            "display_order": 2,
        },
    )
    db.flush()
    upsert_one(
        db,
        GateTopic,
        {"subject_id": algorithms.id, "name": "Graph traversal"},
        {"is_completed": False, "confidence_level": 3, "revision_count": 1, "notes": "Review BFS/DFS edge cases."},
    )
    upsert_one(
        db,
        GateTopic,
        {"subject_id": operating_systems.id, "name": "Paging and segmentation"},
        {"is_completed": False, "confidence_level": 2, "revision_count": 1, "notes": "Revise address translation examples."},
    )


def seed_formulas(db) -> None:
    formulas = [
        {
            "title": "Bayes' Theorem",
            "subject": "Probability",
            "formula": "P(A|B) = P(B|A)P(A) / P(B)",
            "explanation": "Useful for posterior probability and classifier intuition.",
            "tags": ["probability", "ml"],
            "priority": 3,
            "is_favorite": True,
        },
        {
            "title": "Master Theorem",
            "subject": "Algorithms",
            "formula": "T(n) = aT(n/b) + f(n)",
            "explanation": "Classifies common divide-and-conquer recurrences.",
            "tags": ["algorithms"],
            "priority": 2,
            "is_favorite": False,
        },
        {
            "title": "CPU Utilization",
            "subject": "Operating Systems",
            "formula": "CPU utilization = 1 - p^n",
            "explanation": "Approximation for multiprogramming with n processes and I/O wait probability p.",
            "tags": ["os"],
            "priority": 1,
            "is_favorite": False,
        },
    ]
    for item in formulas:
        title = item.pop("title")
        upsert_one(db, Formula, {"title": title}, item)


def seed_notes(db) -> None:
    notes = [
        {
            "title": "Paging Quick Review",
            "subject": "Operating Systems",
            "description": "Starter metadata for a note file. Upload the real note from the admin dashboard.",
            "file_url": None,
            "tags": ["os", "memory"],
            "is_important": True,
        },
        {
            "title": "Dynamic Programming Patterns",
            "subject": "Algorithms",
            "description": "Starter metadata for DP pattern notes.",
            "file_url": None,
            "tags": ["algorithms", "dp"],
            "is_important": False,
        },
    ]
    for item in notes:
        title = item.pop("title")
        upsert_one(db, Note, {"title": title}, item)


def seed_certification(db) -> None:
    upsert_one(
        db,
        Certification,
        {"title": "Placeholder Certification"},
        {
            "issuer": "Placeholder Issuer",
            "issue_date": date(2026, 1, 1),
            "credential_id": "PLACEHOLDER-CREDENTIAL-ID",
            "verify_url": PLACEHOLDER_VERIFY,
            "image_url": None,
        },
    )


def main() -> None:
    with SessionLocal() as db:
        seed_profile(db)
        seed_projects(db)
        seed_gate(db)
        seed_formulas(db)
        seed_notes(db)
        seed_certification(db)
        db.commit()
    print("Demo data seeded. Replace placeholder values from /admin before publishing.")


if __name__ == "__main__":
    main()
