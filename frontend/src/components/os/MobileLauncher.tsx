import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useProfile } from "@/data/profile";

export type LauncherApp = { id: string; label: string; icon: ReactNode };

/** iOS-style app grid for mobile. */
export function MobileLauncher({
  apps,
  onOpen,
}: {
  apps: LauncherApp[];
  onOpen: (id: string) => void;
}) {
  const { data: profile } = useProfile();

  return (
    <div className="relative h-full w-full overflow-auto pb-32 pt-20">
      <div className="px-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan">neural OS</div>
        <h1 className="mt-1 bg-gradient-to-r from-cyan to-purple bg-clip-text text-3xl font-semibold text-transparent">
          Welcome, {profile?.name ?? "Operator"}
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">tap an app to launch</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-4 px-6">
        {apps.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onOpen(a.id)}
            className="group flex flex-col items-center gap-1"
          >
            <div className="glass-strong grid h-14 w-14 place-items-center rounded-2xl border-border/60 text-cyan transition active:scale-95">
              {a.icon}
            </div>
            <span className="text-center font-mono text-[10px] leading-tight text-foreground/80">
              {a.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
