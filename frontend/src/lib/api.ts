import { resolveUploadUrl as resolveUploadUrlFromFiles, type UploadCategory } from "@/lib/files";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const TOKEN_KEY = "portfolio_admin_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function resolveUploadUrl(url?: string | null) {
  return resolveUploadUrlFromFiles(url);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError("Backend is offline or unreachable.", 0);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {
      // Keep the status-based fallback.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path: string) {
  return apiFetch<void>(path, { method: "DELETE" });
}

export type UploadResponse = {
  file_url: string;
  filename: string;
  content_type: string;
  size_bytes: number;
};

export function uploadFile<T = UploadResponse>(category: UploadCategory, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<T>(`/api/uploads/${category}`, {
    method: "POST",
    body: formData,
  });
}

export function updateProfile<T>(payload: unknown) {
  return apiPut<T>("/api/profile", payload);
}

export function createProject<T>(payload: unknown) {
  return apiPost<T>("/api/projects", payload);
}

export function updateProject<T>(id: string | number, payload: unknown) {
  return apiPut<T>(`/api/projects/${id}`, payload);
}
