import { motion } from "framer-motion";
import { type ReactNode } from "react";

export type DockApp = { id: string; label: string; icon: ReactNode };

export function Dock({
  apps,
  openIds,
  onOpen,
}: {
  apps: DockApp[];
  openIds: string[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-3 z-50 flex justify-center px-3">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="glass-strong flex max-w-full items-end gap-1 overflow-x-auto rounded-2xl border-border/60 px-2 py-2 shadow-2xl glow-cyan"
      >
        {apps.map((a) => {
          const open = openIds.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a.id)}
              className="group relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-muted-foreground transition hover:bg-white/5 hover:text-cyan"
              title={a.label}
            >
              <div className="transition group-hover:scale-110">{a.icon}</div>
              <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded-md border border-border/60 bg-background/80 px-2 py-0.5 font-mono text-[10px] text-foreground group-hover:block">
                {a.label}
              </span>
              {open && (
                <div className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-cyan glow-cyan" />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
