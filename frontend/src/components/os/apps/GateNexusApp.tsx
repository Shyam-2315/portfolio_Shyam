import { useGateData } from "@/data/gate";
import { SubjectRadar } from "../charts/SubjectRadar";
import { StreakHeatmap } from "../charts/StreakHeatmap";

export function GateNexusApp() {
  const { data: gate, isLoading, isError, error, refetch } = useGateData();

  if (isLoading) return <Message>loading GATE data...</Message>;
  if (isError)
    return <Message action={() => refetch()}>GATE data unavailable: {error.message}</Message>;
  if (!gate) return <Message action={() => refetch()}>GATE data is empty.</Message>;

  return (
    <div className="space-y-5 text-xs">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">GATE Nexus</h2>
          <p className="text-muted-foreground">Subjects: {gate.subjects.length}</p>
        </div>
        <div className="text-right font-mono">
          <div className="text-cyan text-glow text-2xl">{gate.revisions}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            revisions
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Topics" value={gate.topics.length} />
        <Stat label="Mock avg" value={`${gate.mockAverage}%`} />
        <Stat label="Mistakes" value={gate.mistakeCount} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            // subject mastery
          </div>
          <SubjectRadar subjects={gate.subjects} />
        </div>
        <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            // study streak · 26w
          </div>
          <div className="overflow-x-auto">
            <StreakHeatmap />
          </div>
          <div className="mt-3 space-y-1">
            {gate.subjects.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-[11px]">
                <span className="w-32 truncate text-foreground/80">{s.name}</span>
                <div className="h-1 flex-1 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-purple"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                <span className="w-8 font-mono text-cyan">{s.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl text-foreground">{value}</div>
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
