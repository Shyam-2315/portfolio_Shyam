import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

import { type UploadResponse, uploadFile } from "@/lib/api";
import {
  acceptForRule,
  FILE_RULES,
  formatFileSize,
  isImageFile,
  resolveUploadUrl,
  type UploadCategory,
  validateFile,
} from "@/lib/files";

type FileUploadProps = {
  label: string;
  category: UploadCategory;
  value?: string | null;
  onChange: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onUploaded?: (response: UploadResponse) => void;
  emptyText?: string;
};

export function FileUpload({
  label,
  category,
  value,
  onChange,
  onUploadingChange,
  onUploaded,
  emptyText = "No file uploaded yet",
}: FileUploadProps) {
  const rule = FILE_RULES[category];
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  useEffect(() => {
    if (!selected || !isImageFile(selected)) {
      setObjectUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(selected);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [selected]);

  const previewUrl = useMemo(() => {
    if (objectUrl) return objectUrl;
    return resolveUploadUrl(value);
  }, [objectUrl, value]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSuccess("");
    setError("");
    setSelected(null);
    if (!file) return;

    const validation = validateFile(file, rule);
    if (validation) {
      setError(validation);
      event.target.value = "";
      return;
    }
    setSelected(file);
  }

  function clearSelected() {
    setSelected(null);
    setError("");
    setSuccess("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadSelected() {
    if (!selected) {
      setError("Choose a file before uploading.");
      return;
    }
    const validation = validateFile(selected, rule);
    if (validation) {
      setError(validation);
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const response = await uploadFile(category, selected);
      onChange(response.file_url);
      onUploaded?.(response);
      setSuccess(`Uploaded ${response.filename}.`);
      setSelected(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-black/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {rule.extensions.join(", ")} up to {formatFileSize(rule.maxBytes)}
          </div>
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setSuccess("");
              setError("");
            }}
            className="admin-btn border-border/60 text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            clear file
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={acceptForRule(rule)}
          onChange={chooseFile}
          className="sr-only"
        />
        <FilePicker onPick={() => inputRef.current?.click()} disabled={uploading} />
        <UploadButton
          onUpload={() => void uploadSelected()}
          disabled={!selected || uploading}
          uploading={uploading}
        />
        {selected ? (
          <ClearFile onClear={clearSelected} disabled={uploading} label="remove selected" />
        ) : null}
      </div>

      {selected ? (
        <div className="rounded border border-cyan/20 bg-cyan/5 p-2 font-mono text-[11px] text-cyan">
          {selected.name} - {formatFileSize(selected.size)}
        </div>
      ) : (
        <div className="font-mono text-[11px] text-muted-foreground">
          {value ? "Uploaded file is saved." : emptyText}
        </div>
      )}

      {uploading ? <UploadProgress /> : null}
      {error ? <div className="text-xs text-rose-200">{error}</div> : null}
      {success ? <div className="text-xs text-emerald-200">{success}</div> : null}

      <FilePreview
        url={previewUrl}
        name={selected?.name ?? value ?? undefined}
        size={selected?.size}
        imageBroken={imageBroken}
        onImageError={() => setImageBroken(true)}
        onImageLoad={() => setImageBroken(false)}
      />
    </div>
  );
}

export function FilePicker({ onPick, disabled }: { onPick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="admin-btn border-cyan/40 text-cyan"
      disabled={disabled}
    >
      choose file
    </button>
  );
}

export function UploadButton({
  onUpload,
  disabled,
  uploading,
}: {
  onUpload: () => void;
  disabled?: boolean;
  uploading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onUpload}
      className="admin-btn border-cyan/50 bg-cyan/10 text-cyan"
      disabled={disabled}
    >
      <Upload className="h-3.5 w-3.5" />
      {uploading ? "uploading..." : "upload"}
    </button>
  );
}

export function ClearFile({
  onClear,
  disabled,
  label = "clear file",
}: {
  onClear: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="admin-btn border-border/60 text-muted-foreground"
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export function UploadProgress() {
  return (
    <div className="h-1.5 overflow-hidden rounded bg-white/10">
      <div className="h-full w-2/3 animate-pulse rounded bg-cyan" />
    </div>
  );
}

export function FilePreview({
  url,
  name,
  size,
  imageBroken,
  onImageError,
  onImageLoad,
}: {
  url?: string | null;
  name?: string;
  size?: number;
  imageBroken?: boolean;
  onImageError?: () => void;
  onImageLoad?: () => void;
}) {
  if (!url) return null;
  if (isImageFile(url) && !imageBroken) {
    return (
      <img
        src={url}
        alt={name ?? "Uploaded file preview"}
        onError={onImageError}
        onLoad={onImageLoad}
        className="max-h-44 rounded-md border border-border/60 object-contain"
      />
    );
  }
  if (isImageFile(url) && imageBroken) {
    return (
      <div className="grid h-28 w-28 place-items-center rounded-md border border-border/60 bg-white/5 text-xs text-muted-foreground">
        No image
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground">
      <FileText className="h-3.5 w-3.5 text-cyan" />
      <span className="break-all">{name ?? "Uploaded file"}</span>
      {size ? <span>{formatFileSize(size)}</span> : null}
    </div>
  );
}
