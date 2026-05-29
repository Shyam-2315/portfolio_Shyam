export function ArchitectureApp() {
  const flows = [
    {
      title: "PDFCraft request lifecycle",
      nodes: ["Browser", "CF Edge", "API Gateway", "FastAPI", "Redis", "PostgreSQL"],
    },
    {
      title: "AI-SOC-Agent pipeline",
      nodes: ["Collectors", "Kafka", "Detection Engine", "LLM Triage", "SOAR", "Analyst UI"],
    },
    {
      title: "GATE Nexus sync",
      nodes: ["Client", "Edge Fn", "FastAPI", "Postgres", "Vector DB"],
    },
  ];
  return (
    <div className="space-y-5 text-xs">
      <header>
        <h2 className="text-base font-semibold text-foreground">Architecture Lab</h2>
        <p className="text-muted-foreground">Live system topologies</p>
      </header>
      {flows.map((f) => (
        <div key={f.title}>
          <div className="mb-2 text-[10px] uppercase tracking-widest text-cyan">{f.title}</div>
          <div className="flex flex-wrap items-center gap-2">
            {f.nodes.map((n, i) => (
              <div key={n} className="flex items-center gap-2">
                <div className="rounded-lg border border-cyan/40 bg-cyan/5 px-3 py-1.5 font-mono text-[11px] text-foreground glow-cyan">
                  {n}
                </div>
                {i < f.nodes.length - 1 && <span className="text-cyan">→</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
