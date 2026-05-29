import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2 } from "lucide-react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Konami code unlocks a hidden DEV MODE overlay. */
export function KonamiDevMode() {
  const [open, setOpen] = useState(false);
  const [buf, setBuf] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setBuf((b) => {
        const next = [...b, e.key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          setOpen(true);
          return [];
        }
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[450] grid place-items-center bg-black/80 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong relative w-[min(560px,92vw)] rounded-2xl border-purple/60 p-6 font-mono text-xs glow-purple"
          >
            <div className="flex items-center gap-2 text-purple">
              <Code2 className="h-4 w-4" /> DEV MODE · konami unlocked
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">You found a secret.</h2>
            <p className="mt-2 text-foreground/80">
              Welcome to the dev console, Operator. Things you can try:
            </p>
            <ul className="mt-3 space-y-1.5 text-foreground/85">
              <li>⌘K — instant command palette</li>
              <li>
                type <span className="text-cyan">sudo hack pentagon</span> in the terminal
              </li>
              <li>
                type <span className="text-cyan">whoami</span> as a hidden user — try "ghost",
                "root", "shyam"
              </li>
              <li>chat with JARVIS — it actually thinks now (Lovable AI · Gemini)</li>
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-md border border-purple/50 bg-purple/10 py-2 text-purple hover:bg-purple/20"
            >
              close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
