# Neural Command Center Backend

FastAPI backend for the Neural Command Center portfolio.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` with your PostgreSQL connection string, JWT secret, and admin credentials.

## Run Migrations

```powershell
alembic upgrade head
```

## Create Or Update Admin User

```powershell
python seed_admin.py
```

The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Run Backend

```powershell
uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

## API Overview

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `GET /api/certifications`
- `POST /api/certifications`
- `PUT /api/certifications/{id}`
- `DELETE /api/certifications/{id}`
- `GET /api/gate/subjects`
- `POST /api/gate/subjects`
- `PUT /api/gate/subjects/{id}`
- `DELETE /api/gate/subjects/{id}`
- `GET /api/gate/topics`
- `POST /api/gate/topics`
- `PUT /api/gate/topics/{id}`
- `DELETE /api/gate/topics/{id}`
- `GET /api/gate/mock-tests`
- `POST /api/gate/mock-tests`
- `GET /api/gate/mistakes`
- `POST /api/gate/mistakes`
- `PUT /api/gate/mistakes/{id}`
- `DELETE /api/gate/mistakes/{id}`
- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/{id}`
- `DELETE /api/notes/{id}`
- `GET /api/formulas`
- `POST /api/formulas`
- `PUT /api/formulas/{id}`
- `DELETE /api/formulas/{id}`
- `POST /api/uploads/image`
- `POST /api/uploads/resume`
- `POST /api/uploads/note`

Write endpoints require a Bearer token from `/api/auth/login`. Uploaded files are stored under `uploads/` and served from `/uploads`.
