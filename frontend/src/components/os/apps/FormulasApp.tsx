import { useFormulas } from "@/data/formulas";

export function FormulasApp() {
  const { data: formulas = [], isLoading, isError, error, refetch } = useFormulas();

  if (isLoading) return <Message>loading formulas...</Message>;
  if (isError)
    return <Message action={() => refetch()}>formulas unavailable: {error.message}</Message>;

  return (
    <div className="space-y-3 text-xs">
      <header>
        <h2 className="text-base font-semibold text-foreground">Formula Vault</h2>
        <p className="text-muted-foreground">Quick-reference deck</p>
      </header>
      {formulas.length === 0 && <Message action={() => refetch()}>no formulas found.</Message>}
      <div className="grid gap-2 md:grid-cols-2">
        {formulas.map((f) => (
          <div key={f.id} className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{f.title}</span>
              <span className="text-[10px] text-purple">{f.category}</span>
            </div>
            <pre className="mt-2 rounded-md border border-border/40 bg-black/40 px-2 py-1.5 font-mono text-[11px] text-cyan">
              {f.expr}
            </pre>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{f.note}</p>
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
