import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  FileText,
  FlaskConical,
  Image,
  Layers,
  LogOut,
  Save,
  Sigma,
  Target,
  Trash2,
  User,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { FilePreview, FileUpload } from "@/components/admin/FileUpload";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  clearAuthToken,
  getAuthToken,
  saveAuthToken,
  updateProfile,
  type UploadResponse,
} from "@/lib/api";
import { resolveUploadUrl, type UploadCategory } from "@/lib/files";

type JsonRecord = Record<string, unknown>;
type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "textarea"
  | "list"
  | "checkbox"
  | "upload";
type UploadKind = UploadCategory;

type Field = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  uploadKind?: UploadKind;
};

type ResourceConfig = {
  id: string;
  label: string;
  icon: ReactNode;
  endpoint: string;
  fields: Field[];
  listTitle: (item: JsonRecord) => string;
  listMeta?: (item: JsonRecord) => string;
  create?: boolean;
  update?: boolean;
  remove?: boolean;
};

const resources: ResourceConfig[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />,
    endpoint: "/api/profile",
    create: false,
    remove: false,
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "role", label: "Role" },
      { key: "intro", label: "Intro", type: "textarea" },
      { key: "email", label: "Email", type: "email" },
      { key: "linkedin_url", label: "LinkedIn URL" },
      { key: "github_url", label: "GitHub URL" },
      { key: "resume_url", label: "Resume", type: "upload", uploadKind: "resume" },
      { key: "profile_image_url", label: "Profile Image", type: "upload", uploadKind: "image" },
      { key: "education", label: "Education", type: "textarea" },
      { key: "location", label: "Location" },
      { key: "interests", label: "Interests", type: "list" },
      { key: "skills", label: "Skills", type: "list" },
    ],
    listTitle: (item) => String(item.name ?? "Profile"),
    listMeta: (item) => String(item.role ?? ""),
  },
  {
    id: "projects",
    label: "Projects",
    icon: <Layers className="h-4 w-4" />,
    endpoint: "/api/projects",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "subtitle", label: "Subtitle" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status" },
      { key: "tech_stack", label: "Tech Stack", type: "list" },
      { key: "features", label: "Features", type: "list" },
      { key: "github_url", label: "GitHub URL" },
      { key: "live_url", label: "Live URL" },
      { key: "screenshots", label: "Screenshots", type: "upload", uploadKind: "project" },
      {
        key: "architecture_image_url",
        label: "Architecture Image",
        type: "upload",
        uploadKind: "project",
      },
      { key: "display_order", label: "Display Order", type: "number" },
      { key: "is_featured", label: "Featured", type: "checkbox" },
    ],
    listTitle: (item) => String(item.title ?? "Untitled project"),
    listMeta: (item) => String(item.status ?? ""),
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: <Award className="h-4 w-4" />,
    endpoint: "/api/certifications",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "issuer", label: "Issuer", required: true },
      { key: "issue_date", label: "Issue Date", type: "date" },
      { key: "credential_id", label: "Credential ID" },
      { key: "verify_url", label: "Verify URL" },
      { key: "image_url", label: "Certificate Image", type: "upload", uploadKind: "certificate" },
    ],
    listTitle: (item) => String(item.title ?? "Untitled certification"),
    listMeta: (item) => String(item.issuer ?? ""),
  },
  {
    id: "gate-subjects",
    label: "GATE Subjects",
    icon: <Target className="h-4 w-4" />,
    endpoint: "/api/gate/subjects",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "progress_percentage", label: "Progress %", type: "number" },
      { key: "target_completion_date", label: "Target Completion Date", type: "date" },
      { key: "display_order", label: "Display Order", type: "number" },
    ],
    listTitle: (item) => String(item.name ?? "Untitled subject"),
    listMeta: (item) => `${String(item.progress_percentage ?? 0)}% complete`,
  },
  {
    id: "gate-topics",
    label: "GATE Topics",
    icon: <Brain className="h-4 w-4" />,
    endpoint: "/api/gate/topics",
    fields: [
      { key: "subject_id", label: "Subject ID", type: "number", required: true },
      { key: "name", label: "Name", required: true },
      { key: "is_completed", label: "Completed", type: "checkbox" },
      { key: "confidence_level", label: "Confidence 0-5", type: "number" },
      { key: "revision_count", label: "Revision Count", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    listTitle: (item) => String(item.name ?? "Untitled topic"),
    listMeta: (item) => `subject #${String(item.subject_id ?? "-")}`,
  },
  {
    id: "mock-tests",
    label: "Mock Tests",
    icon: <Activity className="h-4 w-4" />,
    endpoint: "/api/gate/mock-tests",
    fields: [
      { key: "test_name", label: "Test Name", required: true },
      { key: "score", label: "Score", type: "number", required: true },
      { key: "total_marks", label: "Total Marks", type: "number", required: true },
      { key: "test_date", label: "Test Date", type: "date" },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
    listTitle: (item) => String(item.test_name ?? "Untitled mock test"),
    listMeta: (item) => `${String(item.score ?? 0)} / ${String(item.total_marks ?? 0)}`,
  },
  {
    id: "mistakes",
    label: "Mistakes",
    icon: <FlaskConical className="h-4 w-4" />,
    endpoint: "/api/gate/mistakes",
    fields: [
      { key: "subject_id", label: "Subject ID", type: "number" },
      { key: "topic_id", label: "Topic ID", type: "number" },
      { key: "question", label: "Question", type: "textarea", required: true },
      { key: "mistake_reason", label: "Mistake Reason", type: "textarea" },
      { key: "correct_concept", label: "Correct Concept", type: "textarea" },
      { key: "priority", label: "Priority" },
      { key: "is_resolved", label: "Resolved", type: "checkbox" },
    ],
    listTitle: (item) => String(item.question ?? "Untitled mistake"),
    listMeta: (item) => String(item.priority ?? ""),
  },
  {
    id: "notes",
    label: "Notes",
    icon: <BookOpen className="h-4 w-4" />,
    endpoint: "/api/notes",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "subject", label: "Subject" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "file_url", label: "Note File", type: "upload", uploadKind: "note" },
      { key: "tags", label: "Tags", type: "list" },
      { key: "is_important", label: "Important", type: "checkbox" },
    ],
    listTitle: (item) => String(item.title ?? "Untitled note"),
    listMeta: (item) => String(item.subject ?? ""),
  },
  {
    id: "formulas",
    label: "Formulas",
    icon: <Sigma className="h-4 w-4" />,
    endpoint: "/api/formulas",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "subject", label: "Subject" },
      { key: "formula", label: "Formula", type: "textarea", required: true },
      { key: "explanation", label: "Explanation", type: "textarea" },
      { key: "tags", label: "Tags", type: "list" },
      { key: "priority", label: "Priority", type: "number" },
      { key: "is_favorite", label: "Favorite", type: "checkbox" },
    ],
    listTitle: (item) => String(item.title ?? "Untitled formula"),
    listMeta: (item) => String(item.subject ?? ""),
  },
];

const navItems = [
  ...resources,
  { id: "uploads", label: "Uploads", icon: <Image className="h-4 w-4" /> },
  { id: "resume", label: "Resume", icon: <FileText className="h-4 w-4" /> },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - Neural Command Center" },
      { name: "description", content: "Secure portfolio administration dashboard." },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const queryClient = useQueryClient();
  const [tokenPresent, setTokenPresent] = useState(() => Boolean(getAuthToken()));
  const me = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiGet<{ email: string }>("/api/auth/me"),
    enabled: tokenPresent,
    retry: false,
  });

  if (!tokenPresent) {
    return (
      <AdminShell bare>
        <LoginCard
          onLogin={() => {
            setTokenPresent(true);
            void queryClient.invalidateQueries({ queryKey: ["admin"] });
          }}
        />
      </AdminShell>
    );
  }

  if (me.isLoading) {
    return (
      <AdminShell bare>
        <PanelMessage>verifying admin session...</PanelMessage>
      </AdminShell>
    );
  }

  if (me.isError) {
    clearAuthToken();
    return (
      <AdminShell bare>
        <LoginCard onLogin={() => setTokenPresent(true)} error="Session expired. Sign in again." />
      </AdminShell>
    );
  }

  return (
    <Dashboard
      email={me.data?.email ?? "admin"}
      onLogout={() => {
        clearAuthToken();
        queryClient.clear();
        setTokenPresent(false);
      }}
    />
  );
}

function LoginCard({ onLogin, error }: { onLogin: () => void; error?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(error ?? "");
  const login = useMutation({
    mutationFn: () =>
      apiPost<{ access_token: string }>("/api/auth/login", {
        email,
        password,
      }),
    onSuccess: (data) => {
      saveAuthToken(data.access_token);
      onLogin();
    },
    onError: (err: Error) => setLocalError(err.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setLocalError("Email and password are required.");
      return;
    }
    setLocalError("");
    login.mutate();
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-md rounded-lg border border-cyan/30 bg-black/50 p-5 shadow-2xl glow-cyan"
    >
      <div className="text-[10px] uppercase tracking-[0.35em] text-cyan">
        // secure admin uplink
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Portfolio Admin</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Authenticate to manage live backend content.
      </p>
      <div className="mt-5 space-y-3">
        <LabeledInput label="Email" type="email" value={email} onChange={setEmail} />
        <LabeledInput label="Password" type="password" value={password} onChange={setPassword} />
      </div>
      {(localError || login.isError) && (
        <div className="mt-3 rounded-md border border-rose-400/40 bg-rose-400/10 p-2 text-xs text-rose-200">
          {localError}
        </div>
      )}
      <button
        disabled={login.isPending}
        className="mt-5 w-full rounded-md border border-cyan/50 bg-cyan/10 px-3 py-2 font-mono text-xs uppercase tracking-widest text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
      >
        {login.isPending ? "authenticating..." : "login"}
      </button>
      <Link to="/" className="mt-3 inline-block text-xs text-muted-foreground hover:text-cyan">
        back to public portfolio
      </Link>
    </form>
  );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [active, setActive] = useState("profile");
  const activeResource = resources.find((resource) => resource.id === active);

  return (
    <AdminShell>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border/60 bg-black/30">
        <div className="border-b border-border/60 p-4">
          <div className="text-[10px] uppercase tracking-[0.35em] text-cyan">neural admin</div>
          <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{email}</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-auto p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-xs transition ${
                active === item.id
                  ? "border border-cyan/40 bg-cyan/10 text-cyan"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            logout
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-5">
        {activeResource && <ResourcePanel config={activeResource} />}
        {active === "uploads" && <UploadsPanel />}
        {active === "resume" && <ResumePanel />}
      </main>
    </AdminShell>
  );
}

function ResourcePanel({ config }: { config: ResourceConfig }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<JsonRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const queryKey = ["admin", config.id];
  const isSingleton = config.id === "profile";
  const dataQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await apiGet<JsonRecord | JsonRecord[]>(config.endpoint);
      return Array.isArray(data) ? data : [data];
    },
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (payload: JsonRecord) => apiPost(config.endpoint, payload),
    onSuccess: () => {
      setCreating(false);
      toast.success(`${config.label} created.`);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: JsonRecord) => {
      const body = stripReadonly(payload);
      return isSingleton
        ? updateProfile(body)
        : apiPut(`${config.endpoint}/${String(payload.id)}`, body);
    },
    onSuccess: () => {
      setEditing(null);
      toast.success(`${config.label} saved.`);
      void queryClient.invalidateQueries({ queryKey });
      if (config.id === "profile") void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: unknown) => apiDelete(`${config.endpoint}/${String(id)}`),
    onSuccess: () => {
      toast.success(`${config.label} deleted.`);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const items = dataQuery.data ?? [];
  const selected = editing ?? (isSingleton ? items[0] : null);

  return (
    <div className="space-y-4">
      <PanelHeader title={config.label} icon={config.icon}>
        {!isSingleton && config.create !== false && (
          <button onClick={() => setCreating(true)} className="admin-btn border-cyan/40 text-cyan">
            create
          </button>
        )}
      </PanelHeader>

      {dataQuery.isLoading && <PanelMessage>loading {config.label.toLowerCase()}...</PanelMessage>}
      {dataQuery.isError && (
        <PanelMessage action={() => dataQuery.refetch()}>
          {config.label} unavailable: {dataQuery.error.message}
        </PanelMessage>
      )}

      {!dataQuery.isLoading && !dataQuery.isError && items.length === 0 && (
        <PanelMessage action={() => dataQuery.refetch()}>
          no {config.label.toLowerCase()} found.
        </PanelMessage>
      )}

      {isSingleton && selected && (
        <EditorForm
          fields={config.fields}
          initial={selected}
          submitLabel="save profile"
          busy={updateMutation.isPending}
          error={updateMutation.error?.message}
          layout={config.id}
          onSubmit={(payload) => updateMutation.mutate({ ...selected, ...payload })}
        />
      )}

      {!isSingleton && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={String(item.id)}
                className="rounded-lg border border-border/60 bg-white/[0.02] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {config.listTitle(item)}
                    </div>
                    {config.listMeta && (
                      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                        {config.listMeta(item)}
                      </div>
                    )}
                    <PreviewLinks item={item} />
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {config.update !== false && (
                      <button
                        onClick={() => setEditing(item)}
                        className="admin-btn border-cyan/40 text-cyan"
                      >
                        edit
                      </button>
                    )}
                    {config.remove !== false && (
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this record?")) deleteMutation.mutate(item.id);
                        }}
                        className="admin-btn border-rose-400/40 text-rose-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/60 bg-black/30 p-4">
            {creating && (
              <EditorForm
                fields={config.fields}
                initial={{}}
                submitLabel={`create ${config.label}`}
                busy={createMutation.isPending}
                error={createMutation.error?.message}
                layout={config.id}
                onCancel={() => setCreating(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
              />
            )}
            {editing && (
              <EditorForm
                fields={config.fields}
                initial={editing}
                submitLabel={`save ${config.label}`}
                busy={updateMutation.isPending}
                error={updateMutation.error?.message}
                layout={config.id}
                onCancel={() => setEditing(null)}
                onSubmit={(payload) => updateMutation.mutate({ ...editing, ...payload })}
              />
            )}
            {!creating && !editing && (
              <PanelMessage>Select a record to edit or create a new one.</PanelMessage>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditorForm({
  fields,
  initial,
  submitLabel,
  busy,
  error,
  layout,
  onSubmit,
  onCancel,
}: {
  fields: Field[];
  initial: JsonRecord;
  submitLabel: string;
  busy: boolean;
  error?: string;
  layout?: string;
  onSubmit: (payload: JsonRecord) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<JsonRecord>(() => normalizeInitial(fields, initial));
  const [validation, setValidation] = useState("");
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const initialValues = useMemo(() => normalizeInitial(fields, initial), [fields, initial]);
  const dirty = useMemo(
    () =>
      JSON.stringify(buildPayload(fields, values)) !==
      JSON.stringify(buildPayload(fields, initialValues)),
    [fields, initialValues, values],
  );
  const hasUploadInFlight = Object.values(uploadingFields).some(Boolean);

  useEffect(() => {
    setValues(initialValues);
    setValidation("");
    setUploadingFields({});
  }, [initialValues]);

  function setValue(key: string, value: unknown) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (hasUploadInFlight) {
      setValidation("Wait for uploads to finish before saving.");
      return;
    }
    const missing = fields.find(
      (field) => field.required && !String(values[field.key] ?? "").trim(),
    );
    if (missing) {
      setValidation(`${missing.label} is required.`);
      return;
    }
    setValidation("");
    onSubmit(buildPayload(fields, values));
  }

  const fieldNode = (field: Field) => (
    <AdminField
      key={field.key}
      field={field}
      value={values[field.key]}
      onChange={(value) => setValue(field.key, value)}
      onUploadingChange={(uploading) =>
        setUploadingFields((current) => ({ ...current, [field.key]: uploading }))
      }
    />
  );

  const content =
    layout === "profile" ? (
      <ProfileEditorSections fields={fields} renderField={fieldNode} />
    ) : (
      fields.map(fieldNode)
    );

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          // editor
        </div>
        {dirty ? (
          <div className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-mono text-[11px] text-amber-100">
            Unsaved changes
          </div>
        ) : null}
      </div>
      {content}
      {(validation || error) && (
        <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-2 text-xs text-rose-200">
          {validation || error}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          disabled={busy || hasUploadInFlight || !dirty}
          className="admin-btn border-cyan/50 bg-cyan/10 text-cyan disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {busy ? "saving..." : hasUploadInFlight ? "uploading..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn border-border/60 text-muted-foreground"
          >
            cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ProfileEditorSections({
  fields,
  renderField,
}: {
  fields: Field[];
  renderField: (field: Field) => ReactNode;
}) {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const sections = [
    ["Basic Info", ["name", "role", "intro", "email", "location"]],
    ["Links", ["linkedin_url", "github_url", "resume_url"]],
    ["Profile Image", ["profile_image_url"]],
    ["Education", ["education"]],
    ["Skills & Interests", ["skills", "interests"]],
  ] as const;
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {sections.map(([title, keys]) => (
        <section
          key={title}
          className="space-y-3 rounded-lg border border-border/60 bg-black/20 p-4"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-cyan">{title}</h2>
          {keys.map((key) => {
            const field = byKey.get(key);
            return field ? renderField(field) : null;
          })}
        </section>
      ))}
    </div>
  );
}

function AdminField({
  field,
  value,
  onChange,
  onUploadingChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const type = field.type ?? "text";
  const stringValue = String(value ?? "");
  const urls = Array.isArray(value) ? value.filter(Boolean).map(String) : [];

  return (
    <div className="block space-y-1">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {field.label}
        {field.required ? " *" : ""}
      </span>
      {type === "textarea" && (
        <textarea
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="admin-input min-h-28 resize-y"
        />
      )}
      {type === "list" && (
        <textarea
          value={Array.isArray(value) ? value.join("\n") : stringValue}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="admin-input min-h-28 resize-y"
          placeholder="one item per line"
        />
      )}
      {type === "checkbox" && (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-cyan"
        />
      )}
      {type === "upload" && (
        <FileUpload
          label={field.label}
          category={field.uploadKind ?? "image"}
          value={Array.isArray(value) ? null : stringValue}
          onChange={(url) => {
            if (Array.isArray(value)) onChange(url ? [...urls, url] : urls);
            else onChange(url);
          }}
          onUploadingChange={onUploadingChange}
          emptyText={
            Array.isArray(value) && urls.length > 0 ? "Choose another file to upload." : undefined
          }
        />
      )}
      {type === "upload" && Array.isArray(value) && urls.length > 0 ? (
        <div className="space-y-2">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="flex items-center justify-between gap-2 rounded border border-border/60 bg-white/[0.02] p-2"
            >
              <FilePreview url={resolveUploadUrl(url)} name={url} />
              <button
                type="button"
                onClick={() => onChange(urls.filter((_, itemIndex) => itemIndex !== index))}
                className="admin-btn border-border/60 text-muted-foreground"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {!["textarea", "list", "checkbox", "upload"].includes(type) && (
        <input
          type={type}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="admin-input"
        />
      )}
    </div>
  );
}

function UploadsPanel() {
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  return (
    <div className="space-y-4">
      <PanelHeader title="Uploads" icon={<Image className="h-4 w-4" />} />
      <div className="grid gap-4 md:grid-cols-3">
        <UploadCard title="Images" category="image" onUploaded={setLastUpload} />
        <UploadCard title="Certificates / Notes" category="note" onUploaded={setLastUpload} />
        <UploadCard title="Resume" category="resume" onUploaded={setLastUpload} />
      </div>
      {lastUpload && (
        <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
          <div className="font-mono text-xs text-cyan">uploaded: {lastUpload.filename}</div>
          <div className="mt-1 break-all text-xs text-muted-foreground">{lastUpload.file_url}</div>
          <div className="mt-3">
            <FilePreview url={lastUpload.file_url} />
          </div>
        </div>
      )}
    </div>
  );
}

function UploadCard({
  title,
  category,
  onUploaded,
}: {
  title: string;
  category: UploadCategory;
  onUploaded: (upload: UploadResponse) => void;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/30 p-4">
      <div className="font-medium text-foreground">{title}</div>
      <FileUpload
        label={title}
        category={category}
        value={null}
        onChange={() => undefined}
        onUploaded={onUploaded}
      />
    </div>
  );
}

function ResumePanel() {
  const queryClient = useQueryClient();
  const profile = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: () => apiGet<JsonRecord>("/api/profile"),
  });
  const update = useMutation({
    mutationFn: (resume_url: string) => apiPut("/api/profile", { ...profile.data, resume_url }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
  return (
    <div className="space-y-4">
      <PanelHeader title="Resume" icon={<FileText className="h-4 w-4" />} />
      {profile.isLoading && <PanelMessage>loading resume...</PanelMessage>}
      {profile.isError && (
        <PanelMessage action={() => profile.refetch()}>
          resume unavailable: {profile.error.message}
        </PanelMessage>
      )}
      {profile.data && (
        <div className="rounded-lg border border-border/60 bg-black/30 p-4">
          <div className="text-xs text-muted-foreground">Current resume URL</div>
          <div className="mt-1 break-all font-mono text-xs text-cyan">
            {String(profile.data.resume_url ?? "none")}
          </div>
          {profile.data.resume_url ? (
            <div className="mt-3">
              <FilePreview url={String(profile.data.resume_url)} />
            </div>
          ) : null}
          <FileUpload
            label="Resume"
            category="resume"
            value={String(profile.data.resume_url ?? "")}
            onChange={(url) => {
              if (url) update.mutate(url);
            }}
          />
          {update.isPending && <div className="mt-2 text-xs text-cyan">updating resume...</div>}
          {update.isError && (
            <div className="mt-2 text-xs text-rose-200">{update.error?.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewLinks({ item }: { item: JsonRecord }) {
  const urls = Object.entries(item).filter(
    ([key, value]) => key.endsWith("_url") && typeof value === "string" && value,
  );
  if (urls.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {urls.map(([key, value]) => (
        <a
          key={key}
          href={resolveUploadUrl(String(value))}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-cyan/30 px-1.5 py-0.5 font-mono text-[10px] text-cyan"
        >
          {key}
        </a>
      ))}
    </div>
  );
}

function PanelHeader({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-black/30 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-cyan">
          {icon}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="font-mono text-[11px] text-muted-foreground">live backend data</p>
        </div>
      </div>
      {children}
    </header>
  );
}

function PanelMessage({ children, action }: { children: ReactNode; action?: () => void }) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4 font-mono text-xs text-muted-foreground">
      <p>{children}</p>
      {action && (
        <button onClick={action} className="admin-btn mt-3 border-cyan/40 text-cyan">
          retry
        </button>
      )}
    </div>
  );
}

function AdminShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg opacity-40" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.82_0.16_200_/_0.12),transparent_30%),radial-gradient(circle_at_80%_0%,oklch(0.72_0.18_295_/_0.10),transparent_28%)]" />
      <div
        className={`relative z-10 ${bare ? "grid min-h-screen place-items-center p-4" : "flex h-screen overflow-hidden"}`}
      >
        {children}
      </div>
      <style>{`
        .admin-input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--border) / 0.6);
          background: rgb(0 0 0 / 0.3);
          padding: 0.45rem 0.6rem;
          font-size: 0.75rem;
          outline: none;
        }
        .admin-input:focus {
          border-color: oklch(0.82 0.16 200 / 0.7);
        }
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border-radius: 0.375rem;
          border-width: 1px;
          padding: 0.4rem 0.65rem;
          font-family: JetBrains Mono, monospace;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          transition: background 160ms ease, opacity 160ms ease;
        }
        .admin-btn:hover {
          background: rgb(255 255 255 / 0.05);
        }
      `}</style>
    </div>
  );
}

function LabeledInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
      />
    </label>
  );
}

function normalizeInitial(fields: Field[], initial: JsonRecord) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = initial[field.key];
      if (field.type === "list" && Array.isArray(value)) return [field.key, value.join("\n")];
      return [field.key, value ?? (field.type === "checkbox" ? false : "")];
    }),
  );
}

function buildPayload(fields: Field[], values: JsonRecord) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values[field.key];
      if (field.type === "list") return [field.key, splitList(String(value ?? ""))];
      if (field.type === "number")
        return [field.key, value === "" || value === null ? 0 : Number(value)];
      if (field.type === "checkbox") return [field.key, Boolean(value)];
      return [field.key, value === "" ? null : value];
    }),
  );
}

function stripReadonly(payload: JsonRecord) {
  const { id, created_at, updated_at, ...rest } = payload;
  return rest;
}

function splitList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
