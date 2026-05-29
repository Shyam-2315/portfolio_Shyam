import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const targets = [
  "192.168.1.1 :: NORAD",
  "10.0.0.42 :: Pentagon-East",
  "172.16.99.7 :: Mainframe-Δ",
  "fe80::1234 :: ICBM-Silo-7",
  "203.0.113.5 :: Project-MK",
];

/** Triggered by `sudo hack pentagon` — pure portfolio theatre. */
export function HackOverlay() {
  const [active, setActive] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const fn = () => { setActive(true); setPct(0); };
    window.addEventListener("neural:hack", fn);
    return () => window.removeEventListener("neural:hack", fn);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPct((p) => {
        const n = p + 7 + Math.random() * 8;
        if (n >= 100) {
          clearInterval(id);
          setTimeout(() => setActive(false), 1400);
          return 100;
        }
        return n;
      });
    }, 110);
    return () => clearInterval(id);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] grid place-items-center bg-black/85 backdrop-blur"
        >
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative w-[min(720px,92vw)] rounded-2xl border border-rose-400/40 bg-rose-500/5 p-6 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-rose-300">▮ OFFENSIVE SIMULATION · OP_PENTAGON</span>
              <span className="text-rose-300 blink">REC</span>
            </div>
            <div className="mt-4 space-y-1 text-foreground/85">
              {targets.slice(0, Math.ceil(pct / 25)).map((t) => (
                <div key={t}>{">"} probing <span className="text-cyan">{t}</span> … <span className="text-emerald-300">[ok]</span></div>
              ))}
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-200"
                style={{ width: `${pct}%`, transition: "width 0.1s linear" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-rose-300">progress {pct.toFixed(0)}%</span>
              {pct >= 100 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-emerald-300"
                >
                  ✗ ACCESS DENIED — this is a portfolio, Operator 😉
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
