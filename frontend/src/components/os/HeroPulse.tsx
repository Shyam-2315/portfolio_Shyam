import { useEffect, useState } from "react";
import { useProfile } from "@/data/profile";

const lines = [
  "// compiling intelligence…",
  "// 7 collectors streaming",
  "// indexed 312 entities",
  "// awaiting input",
];

export function HeroPulse() {
  const { data: profile } = useProfile();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % lines.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center px-6">
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan">
          neural command center
        </div>
        <h1
          className="mt-3 bg-gradient-to-r from-cyan via-foreground to-purple bg-clip-text text-5xl font-semibold text-transparent md:text-7xl"
          style={{ textShadow: "0 0 60px oklch(0.82 0.16 200 / 0.25)" }}
        >
          Welcome, {profile?.name ?? "Operator"}
        </h1>

        {/* waveform */}
        <div className="mx-auto mt-5 flex h-8 w-44 items-end justify-center gap-1">
          {Array.from({ length: 22 }).map((_, k) => (
            <span
              key={k}
              className="w-1 rounded-full bg-cyan/70"
              style={{
                height: `${20 + ((k * 37) % 80)}%`,
                animation: `pulse-bar 1.2s ${k * 60}ms ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <p className="mt-4 font-mono text-xs text-muted-foreground">{lines[i]}</p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          press{" "}
          <kbd className="rounded border border-border/60 bg-white/5 px-1.5 py-0.5 text-cyan">
            ⌘K
          </kbd>{" "}
          · or pick a module from the dock
        </p>
      </div>

      <style>{`
        @keyframes pulse-bar {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50%      { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
