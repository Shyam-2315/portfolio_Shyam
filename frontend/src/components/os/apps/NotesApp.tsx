import { useState } from "react";
import { useNotes } from "@/data/notes";
import { Search } from "lucide-react";

export function NotesApp() {
  const [q, setQ] = useState("");
  const { data: notes = [], isLoading, isError, error, refetch } = useNotes();
  const filtered = notes.filter((n) =>
    (n.title + n.category + n.preview).toLowerCase().includes(q.toLowerCase()),
  );

  if (isLoading) return <Message>loading notes...</Message>;
  if (isError)
    return <Message action={() => refetch()}>notes unavailable: {error.message}</Message>;

  return (
    <div className="space-y-3 text-xs">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Notes Vault</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search…"
            className="w-48 rounded-md border border-border/60 bg-white/[0.03] py-1.5 pl-7 pr-2 font-mono text-[11px] outline-none focus:border-cyan/60"
          />
        </div>
      </header>

      {notes.length === 0 && <Message action={() => refetch()}>no notes found.</Message>}
      {notes.length > 0 && filtered.length === 0 && <Message>no notes match this search.</Message>}
      <div className="grid gap-2 md:grid-cols-2">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="rounded-lg border border-border/60 bg-white/[0.02] p-3 transition hover:border-cyan/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{n.title}</span>
              <span
                className={`text-[10px] ${n.tag === "high" ? "text-rose-300" : "text-muted-foreground"}`}
              >
                {n.tag}
              </span>
            </div>
            <div className="text-[10px] text-cyan">{n.category}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{n.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Message({ children, action }: { children: React.ReactNode; action?: () => void }) {
  return (
    <div className="space-y-3 font-mono text-xs text-muted-foreground">
      <p>{children}</p>
      {action && (
        <button
          onClick={action}
          className="rounded-md border border-cyan/40 px-3 py-1 text-cyan hover:bg-cyan/10"
        >
          retry
        </button>
      )}
    </div>
  );
}
