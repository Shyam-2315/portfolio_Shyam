import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "@/data/profile";

export function BootSequence({ onDone }: { onDone: () => void }) {
  const { data: profile } = useProfile();
  const lines = useMemo(
    () => [
      "Initializing Neural Systems...",
      "Connecting API Modules...",
      "Backend Data Link Online...",
      "Loading Developer Workspace...",
      `Welcome Back, ${profile?.name ?? "Operator"}.`,
    ],
    [profile?.name],
  );
  const lineCount = lines.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= lineCount) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === lineCount - 1 ? 900 : 520);
    return () => clearTimeout(t);
  }, [lineCount, step, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-xl px-8 font-mono text-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative h-3 w-3 rounded-full bg-cyan glow-cyan">
            <div className="pulse-ring absolute inset-0 rounded-full" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Neural OS · v2.6.1
          </span>
        </div>

        <ul className="space-y-2">
          {lines.slice(0, step).map((l, i) => {
            const isLast = i === lines.length - 1;
            return (
              <motion.li
                key={l}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-center gap-3 ${isLast ? "text-cyan text-glow text-lg pt-3" : "text-foreground/80"}`}
              >
                {!isLast && <span className="text-cyan">[ ok ]</span>}
                <span>{l}</span>
              </motion.li>
            );
          })}
          {step < lines.length && (
            <li className="flex items-center gap-3 text-muted-foreground">
              <span className="text-cyan">[..]</span>
              <span>{lines[step]}</span>
              <span className="blink text-cyan">▌</span>
            </li>
          )}
        </ul>

        <div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan to-purple"
            initial={{ width: 0 }}
            animate={{ width: `${(step / lines.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
