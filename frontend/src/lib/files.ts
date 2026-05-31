export type UploadCategory = "image" | "project" | "certificate" | "note" | "resume";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export type FileValidationRule = {
  label: string;
  extensions: string[];
  mimeTypes: string[];
  maxBytes: number;
};

const MB = 1024 * 1024;

export const FILE_RULES: Record<UploadCategory, FileValidationRule> = {
  image: {
    label: "Profile image",
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: 2 * MB,
  },
  project: {
    label: "Project image",
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: 5 * MB,
  },
  certificate: {
    label: "Certificate image",
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxBytes: 5 * MB,
  },
  note: {
    label: "Notes file",
    extensions: [".pdf", ".png", ".jpg", ".jpeg"],
    mimeTypes: ["application/pdf", "image/png", "image/jpeg"],
    maxBytes: 10 * MB,
  },
  resume: {
    label: "Resume",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    maxBytes: 5 * MB,
  },
};

export function formatFileSize(bytes?: number | null) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function isImageFile(fileOrName: File | string) {
  if (typeof fileOrName !== "string") {
    if (fileOrName.type.startsWith("image/")) return true;
    return /\.(png|jpe?g|webp)$/i.test(fileOrName.name);
  }
  return /\.(png|jpe?g|webp)$/i.test(fileOrName);
}

export function validateFile(file: File, rule: FileValidationRule): string | null {
  const extension = `.${file.name.split(".").pop() ?? ""}`.toLowerCase();
  if (!rule.extensions.includes(extension)) {
    return `${rule.label} must be ${rule.extensions.join(", ")}.`;
  }
  if (file.type && !rule.mimeTypes.includes(file.type)) {
    return `${rule.label} has unsupported content type ${file.type}.`;
  }
  if (file.size > rule.maxBytes) {
    return `${rule.label} must be ${formatFileSize(rule.maxBytes)} or smaller.`;
  }
  return null;
}

export function acceptForRule(rule: FileValidationRule) {
  return [...rule.extensions, ...rule.mimeTypes].join(",");
}

export function resolveUploadUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url;
}
