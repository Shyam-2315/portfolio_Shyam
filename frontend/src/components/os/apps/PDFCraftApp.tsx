import { useEffect, useState } from "react";

export function PDFCraftApp() {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const events = [
      "fingerprint::ok device=fp_8a31",
      "ratelimit::pass bucket=ip_9.221 tokens=18/20",
      "fraud::score=0.12 risk=low",
      "pdf::generated job=jb_4f21 size=812kb",
      "auth::jwt verified user=anon_7711",
      "ratelimit::throttle bucket=ip_45.10 tokens=0/20",
      "fraud::score=0.78 risk=HIGH action=challenge",
      "pdf::queued job=jb_4f22",
    ];
    let i = 0;
    const id = setInterval(() => {
      setLogs((l) => [...l.slice(-8), `${new Date().toLocaleTimeString()}  ${events[i % events.length]}`]);
      i++;
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4 text-xs">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">PDFCraft · Fraud Console</h2>
          <p className="text-muted-foreground">Realtime abuse detection & rate-limiting</p>
        </div>
        <span className="font-mono text-cyan">● operational</span>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Requests / min", v: "1,248", c: "text-cyan" },
          { l: "Blocked", v: "42", c: "text-rose-300" },
          { l: "Avg fraud score", v: "0.21", c: "text-foreground" },
          { l: "PDFs generated", v: "9,107", c: "text-purple" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
            <div className={`mt-1 font-mono text-xl ${m.c}`}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/60 bg-black/30 p-3 font-mono text-[11px] leading-relaxed">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-cyan">stream · /var/log/pdfcraft.audit</div>
        {logs.map((l, i) => (
          <div key={i} className="text-foreground/80">{l}</div>
        ))}
      </div>

      <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">// architecture</div>
        <pre className="overflow-x-auto text-[10px] leading-tight text-foreground/75">
{`  Browser ─► CF Edge ─► API GW ─► FastAPI ─┬─► Redis (rate / cache)
                                            ├─► Postgres (jobs, users)
                                            └─► Worker ─► PDF render`}
        </pre>
      </div>
    </div>
  );
}
