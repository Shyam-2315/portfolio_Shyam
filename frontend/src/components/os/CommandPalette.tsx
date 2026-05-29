import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import type { DockApp } from "./Dock";

type Props = {
  apps: DockApp[];
  onOpen: (id: string) => void;
};

export function CommandPalette({ apps, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(
    () => apps.filter((a) => a.label.toLowerCase().includes(q.toLowerCase())),
    [apps, q]
  );

  const launch = (id: string) => { onOpen(id); setOpen(false); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] grid place-items-start justify-center bg-black/40 backdrop-blur-sm pt-[18vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl glow-cyan"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-3">
              <Search className="h-4 w-4 text-cyan" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
                  if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
                  if (e.key === "Enter" && filtered[idx]) launch(filtered[idx].id);
                }}
                placeholder="Run command or launch module…"
                className="w-full bg-transparent py-3 font-mono text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">ESC</kbd>
            </div>
            <ul className="max-h-72 overflow-auto p-1">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">no matches</li>
              )}
              {filtered.map((a, i) => (
                <li key={a.id}>
                  <button
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => launch(a.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                      i === idx ? "bg-cyan/15 text-foreground" : "text-foreground/80 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-cyan">{a.icon}</span>
                    <span className="flex-1 font-mono text-sm">{a.label}</span>
                    {i === idx && <CornerDownLeft className="h-3.5 w-3.5 text-cyan" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border/60 px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
              <span>↑↓ navigate · ⏎ launch</span>
              <span className="text-cyan">⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
