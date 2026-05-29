import json
import mimetypes
import os
import tempfile
import uuid
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def read_dotenv() -> dict[str, str]:
    path = Path(".env")
    if not path.exists():
        return {}
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


DOTENV = read_dotenv()
BASE_URL = os.getenv("API_BASE_URL", DOTENV.get("API_BASE_URL", "http://localhost:8001")).rstrip("/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", DOTENV.get("ADMIN_EMAIL"))
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", DOTENV.get("ADMIN_PASSWORD"))


PUBLIC_GETS = [
    "/health",
    "/api/profile",
    "/api/projects",
    "/api/certifications",
    "/api/gate/subjects",
    "/api/gate/topics",
    "/api/gate/mock-tests",
    "/api/gate/mistakes",
    "/api/notes",
    "/api/formulas",
]

PROTECTED_REQUESTS = [
    ("PUT", "/api/profile", {"name": "Smoke Test"}),
    ("POST", "/api/projects", {"title": "Smoke Test Project"}),
    ("POST", "/api/certifications", {"title": "Smoke Test Certification", "issuer": "Smoke Test"}),
    ("POST", "/api/gate/subjects", {"name": "Smoke Test Subject"}),
    ("POST", "/api/gate/topics", {"subject_id": 999999, "name": "Smoke Test Topic"}),
    ("POST", "/api/gate/mock-tests", {"test_name": "Smoke Test", "score": 1, "total_marks": 1}),
    ("POST", "/api/gate/mistakes", {"question": "Smoke Test"}),
    ("POST", "/api/notes", {"title": "Smoke Test Note"}),
    ("POST", "/api/formulas", {"title": "Smoke Test Formula", "formula": "x = x"}),
]

INVALID_ID_GETS = [
    "/api/projects/999999999",
]


def request(method: str, path: str, body=None, token: str | None = None, headers: dict | None = None):
    data = None
    final_headers = {"Accept": "application/json", **(headers or {})}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        final_headers["Content-Type"] = "application/json"
    if token:
        final_headers["Authorization"] = f"Bearer {token}"
    req = Request(f"{BASE_URL}{path}", data=data, method=method, headers=final_headers)
    try:
        with urlopen(req, timeout=10) as response:
            raw = response.read()
            return response.status, json.loads(raw.decode("utf-8")) if raw else None
    except HTTPError as exc:
        raw = exc.read()
        try:
            body = json.loads(raw.decode("utf-8")) if raw else None
        except json.JSONDecodeError:
            body = raw.decode("utf-8", errors="replace")
        return exc.code, body


def multipart_upload(path: str, file_path: Path, content_type: str, token: str):
    boundary = f"----smoke-{uuid.uuid4().hex}"
    payload = b"".join(
        [
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'.encode(),
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            file_path.read_bytes(),
            f"\r\n--{boundary}--\r\n".encode(),
        ]
    )
    req = Request(
        f"{BASE_URL}{path}",
        data=payload,
        method="POST",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    try:
        with urlopen(req, timeout=10) as response:
            raw = response.read()
            return response.status, json.loads(raw.decode("utf-8")) if raw else None
    except HTTPError as exc:
        raw = exc.read()
        return exc.code, json.loads(raw.decode("utf-8")) if raw else None


def assert_status(label: str, actual: int, expected: set[int]) -> None:
    if actual not in expected:
        raise AssertionError(f"{label}: expected {sorted(expected)}, got {actual}")
    print(f"[ok] {label}: {actual}")


def login() -> str | None:
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        print("[skip] ADMIN_EMAIL/ADMIN_PASSWORD not set; authenticated checks limited to 401 coverage")
        return None
    status, body = request("POST", "/api/auth/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert_status("admin login", status, {200})
    return body["access_token"]


def main() -> None:
    try:
        for path in PUBLIC_GETS:
            status, _ = request("GET", path)
            assert_status(f"public GET {path}", status, {200, 404})

        for method, path, body in PROTECTED_REQUESTS:
            status, _ = request(method, path, body)
            assert_status(f"protected {method} {path} without token", status, {401, 403})

        for path in INVALID_ID_GETS:
            status, _ = request("GET", path)
            assert_status(f"invalid ID {path}", status, {404})

        token = login()
        if token:
            with tempfile.TemporaryDirectory() as tmp:
                bad_file = Path(tmp) / "bad.exe"
                bad_file.write_bytes(b"not a valid upload")
                status, _ = multipart_upload("/api/uploads/image", bad_file, "application/x-msdownload", token)
                assert_status("invalid image upload type", status, {400})

                good_file = Path(tmp) / "note.txt"
                good_file.write_text("smoke test note", encoding="utf-8")
                status, _ = multipart_upload(
                    "/api/uploads/note",
                    good_file,
                    mimetypes.guess_type(good_file.name)[0] or "text/plain",
                    token,
                )
                assert_status("valid note upload", status, {201})
    except URLError as exc:
        raise SystemExit(f"Backend is not reachable at {BASE_URL}: {exc}") from exc


if __name__ == "__main__":
    main()
