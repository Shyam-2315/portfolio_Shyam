# Neural Command Center Backend

FastAPI backend for the portfolio, admin dashboard, GATE tracker, and uploads.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` with at least:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/neural_command_center
JWT_SECRET_KEY=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:8080
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10
```

## Database

```powershell
alembic upgrade head
```

## Admin User

```powershell
python seed_admin.py
```

The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Demo Data

```powershell
python seed_demo_data.py
```

The demo seed is idempotent and uses clearly marked placeholder links. Replace all placeholder values from `/admin` before publishing.

## Run

```powershell
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

Health check: `GET /health`

## Uploads

Files are stored under `UPLOAD_DIR` and served from `/uploads`.

- Images: JPEG, PNG, WebP, GIF
- Notes: PDF, TXT, Markdown, DOC, DOCX
- Resume: PDF

`MAX_UPLOAD_SIZE_MB` controls the maximum upload size.

## Smoke Test

With the API running:

```powershell
$env:API_BASE_URL="http://localhost:8000"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="replace-with-a-strong-password"
python api_smoke_test.py
```

## API Protection

Public:

- `GET /health`
- `GET /api/profile`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `GET /api/certifications`
- `GET /api/gate/subjects`
- `GET /api/gate/topics`
- `GET /api/gate/mock-tests`
- `GET /api/gate/mistakes`
- `GET /api/notes`
- `GET /api/formulas`

Protected with Bearer token:

- `GET /api/auth/me`
- All `POST`, `PUT`, and `DELETE` admin routes
- `POST /api/uploads/image`
- `POST /api/uploads/resume`
- `POST /api/uploads/note`

## Common Errors

- `401 Not authenticated`: Missing or expired JWT.
- `404 ... not found`: Invalid record ID.
- `400 Unsupported file type`: The upload MIME type is not allowed for that upload category.
- `413 File too large`: File exceeds `MAX_UPLOAD_SIZE_MB`.
- CORS error: Add the frontend URL to `CORS_ORIGINS`.

## Production Deployment

Use `backend/.env.production.example` as a template. Store real production values in Render/Railway environment variables, not in git.

Render/Railway start command:

```sh
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production CORS should include only the deployed frontend:

```env
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
```

For Neon/Supabase PostgreSQL, set `DATABASE_URL` to the provider connection string and keep SSL enabled, usually with `sslmode=require`.

Warning: local uploads under `uploads/` are not permanent on Render/Railway unless persistent storage is configured. Move production uploads to Cloudinary, S3, R2, or Supabase Storage.

TODO for durable uploads:

- Add a storage provider abstraction in `app/services/uploads.py`.
- Upload files to Cloudinary/S3-compatible storage.
- Store the returned public URL in the existing database fields.
- Keep local filesystem uploads for development only.
