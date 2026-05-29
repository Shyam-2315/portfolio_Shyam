import { useEffect, useState } from "react";

const severities = ["LOW", "MED", "HIGH", "CRIT"] as const;
const techniques = [
  ["T1566", "Phishing"],
  ["T1059", "Command & Scripting"],
  ["T1078", "Valid Accounts"],
  ["T1190", "Exploit Public App"],
  ["T1486", "Data Encrypted"],
];

export function SOCApp() {
  const [alerts, setAlerts] = useState<{ id: string; sev: string; tech: string[]; src: string }[]>(
    [],
  );
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const t = techniques[i % techniques.length];
      setAlerts((a) =>
        [
          {
            id: `A-${1000 + i}`,
            sev: severities[Math.floor(Math.random() * severities.length)],
            tech: t,
            src: `10.0.${i % 255}.${(i * 7) % 255}`,
          },
          ...a,
        ].slice(0, 6),
      );
      i++;
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4 text-xs">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">AI-SOC-Agent</h2>
          <p className="text-muted-foreground">Autonomous detection & response</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-cyan">
          <div className="relative h-2 w-2 rounded-full bg-cyan glow-cyan">
            <div className="pulse-ring absolute inset-0 rounded-full" />
          </div>
          live · 7 collectors
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border border-border/60 bg-white/[0.02]">
          <div className="border-b border-border/60 px-3 py-2 text-[10px] uppercase tracking-widest text-cyan">
            incoming alerts
          </div>
          <ul className="divide-y divide-border/40">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 px-3 py-2 font-mono text-[11px]"
              >
                <span
                  className={
                    a.sev === "CRIT"
                      ? "text-rose-300"
                      : a.sev === "HIGH"
                        ? "text-orange-300"
                        : a.sev === "MED"
                          ? "text-yellow-300"
                          : "text-muted-foreground"
                  }
                >
                  {a.sev}
                </span>
                <span className="text-muted-foreground">{a.id}</span>
                <span>
                  <span className="text-purple">{a.tech[0]}</span> · {a.tech[1]}
                </span>
                <span className="text-muted-foreground">{a.src}</span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="px-3 py-6 text-center text-muted-foreground">listening…</li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              SOAR queue
            </div>
            <div className="mt-1 font-mono text-2xl text-cyan">12</div>
            <div className="text-[10px] text-muted-foreground">playbooks executing</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              MITRE coverage
            </div>
            <div className="mt-1 font-mono text-2xl text-purple">84%</div>
            <div className="mt-2 h-1 rounded-full bg-white/5">
              <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-cyan to-purple" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-black/30 p-3 font-mono text-[11px]">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-cyan">agent.reasoning</div>
        <div className="text-foreground/80">
          {">"} correlating 3 alerts → likely{" "}
          <span className="text-purple">credential stuffing</span> from ASN 14061
          <br />
          {">"} suggested action: block /24, force MFA reset, raise to tier-2
          <br />
          {">"} executing playbook PB-007 …
        </div>
      </div>
    </div>
  );
}
