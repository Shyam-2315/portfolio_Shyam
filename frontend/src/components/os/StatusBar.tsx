import { useEffect, useState } from "react";
import { Cpu, Wifi, Activity } from "lucide-react";
import { useProfile } from "@/data/profile";

export function StatusBar({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const { data: profile } = useProfile();
  const [now, setNow] = useState(new Date());
  const [cpu, setCpu] = useState(34);
  useEffect(() => {
    const i = setInterval(() => {
      setNow(new Date());
      setCpu(20 + Math.floor(Math.random() * 60));
    }, 1000);
    return () => clearInterval(i);
  }, []);
  const session = profile?.name?.split(/\s+/)[0]?.toLowerCase() ?? "operator";

  return (
    <div className="pointer-events-auto absolute left-0 right-0 top-0 z-50 flex h-8 items-center justify-between border-b border-border/40 bg-background/40 px-4 font-mono text-[11px] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="relative h-2 w-2 rounded-full bg-cyan glow-cyan">
            <div className="pulse-ring absolute inset-0 rounded-full" />
          </div>
          <span className="text-cyan">NEURAL OS</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">session: {session}@neural-os</span>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <button onClick={onOpenTerminal} className="hover:text-cyan">
          ⌘ terminal
        </button>
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3" /> {cpu}%
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-cyan" /> 12 ops/s
        </span>
        <span className="flex items-center gap-1">
          <Wifi className="h-3 w-3" /> uplink
        </span>
        <span className="text-foreground">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
