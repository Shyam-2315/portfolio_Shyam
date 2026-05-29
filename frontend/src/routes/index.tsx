import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BootSequence } from "@/components/os/BootSequence";
import { Desktop } from "@/components/os/Desktop";
import { Wormhole } from "@/components/os/Wormhole";

type Phase = "boot" | "wormhole" | "desktop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neural Command Center" },
      { name: "description", content: "Live portfolio OS powered by backend API data." },
      { property: "og:title", content: "Neural Command Center" },
      { property: "og:description", content: "Step inside a private AI engineering workstation." },
    ],
  }),
  component: Index,
});

function Index() {
  const [phase, setPhase] = useState<Phase>("boot");
  return (
    <AnimatePresence mode="wait">
      {phase === "boot" && <BootSequence key="boot" onDone={() => setPhase("wormhole")} />}
      {phase === "wormhole" && <Wormhole key="wormhole" onDone={() => setPhase("desktop")} />}
      {phase === "desktop" && <Desktop key="desktop" />}
    </AnimatePresence>
  );
}
