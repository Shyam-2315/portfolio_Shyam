import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import {
  User,
  Layers,
  FileText,
  ShieldAlert,
  FlaskConical,
  Target,
  BookOpen,
  Sigma,
  BadgeCheck,
  GitBranch,
  TerminalSquare,
  Mail,
} from "lucide-react";
import { NeuralBackground } from "./NeuralBackground";
import { NeuralGlobe } from "./NeuralGlobe";
import { MouseSpotlight } from "./MouseSpotlight";
import { CursorTrail } from "./CursorTrail";
import { CommandPalette } from "./CommandPalette";
import { JarvisWidget } from "./JarvisWidget";
import { HeroPulse } from "./HeroPulse";
import { StatusBar } from "./StatusBar";
import { Dock, type DockApp } from "./Dock";
import { AppWindow, type WindowSpec } from "./AppWindow";
import { LiveNotifications } from "./LiveNotifications";
import { HackOverlay } from "./HackOverlay";
import { KonamiDevMode } from "./KonamiDevMode";
import { MobileLauncher } from "./MobileLauncher";

import { AboutApp } from "./apps/AboutApp";
import { ProjectsApp } from "./apps/ProjectsApp";
import { PDFCraftApp } from "./apps/PDFCraftApp";
import { SOCApp } from "./apps/SOCApp";
import { MLLabApp } from "./apps/MLLabApp";
import { GateNexusApp } from "./apps/GateNexusApp";
import { NotesApp } from "./apps/NotesApp";
import { FormulasApp } from "./apps/FormulasApp";
import { CertificationsApp } from "./apps/CertificationsApp";
import { ArchitectureApp } from "./apps/ArchitectureApp";
import { TerminalApp } from "./apps/TerminalApp";
import { ContactApp } from "./apps/ContactApp";

const ICON = "h-5 w-5";

type Registry = Record<
  string,
  {
    label: string;
    icon: ReactNode;
    content: (open: (id: string) => void) => ReactNode;
    width?: number;
    height?: number;
  }
>;

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function Desktop() {
  const isMobile = useIsMobile();
  const [openOrder, setOpenOrder] = useState<string[]>(isMobile ? [] : ["about"]);

  const open = useCallback((id: string) => {
    setOpenOrder((prev) => {
      const without = prev.filter((p) => p !== id);
      return [...without, id];
    });
  }, []);

  const close = useCallback((id: string) => {
    setOpenOrder((prev) => prev.filter((p) => p !== id));
  }, []);

  const focus = useCallback((id: string) => {
    setOpenOrder((prev) => {
      if (prev[prev.length - 1] === id) return prev;
      return [...prev.filter((p) => p !== id), id];
    });
  }, []);

  const registry: Registry = useMemo(
    () => ({
      about: { label: "About", icon: <User className={ICON} />, content: () => <AboutApp /> },
      projects: {
        label: "Projects",
        icon: <Layers className={ICON} />,
        content: () => <ProjectsApp />,
        width: 780,
        height: 540,
      },
      pdfcraft: {
        label: "PDFCraft",
        icon: <FileText className={ICON} />,
        content: () => <PDFCraftApp />,
        width: 760,
        height: 540,
      },
      soc: {
        label: "AI-SOC-Agent",
        icon: <ShieldAlert className={ICON} />,
        content: () => <SOCApp />,
        width: 780,
        height: 560,
      },
      ml: { label: "ML Lab", icon: <FlaskConical className={ICON} />, content: () => <MLLabApp /> },
      gate: {
        label: "GATE Nexus",
        icon: <Target className={ICON} />,
        content: () => <GateNexusApp />,
        width: 720,
        height: 560,
      },
      notes: {
        label: "Notes Vault",
        icon: <BookOpen className={ICON} />,
        content: () => <NotesApp />,
        width: 720,
        height: 480,
      },
      formulas: {
        label: "Formula Vault",
        icon: <Sigma className={ICON} />,
        content: () => <FormulasApp />,
        width: 720,
        height: 480,
      },
      certs: {
        label: "Certifications",
        icon: <BadgeCheck className={ICON} />,
        content: () => <CertificationsApp />,
      },
      arch: {
        label: "Architecture",
        icon: <GitBranch className={ICON} />,
        content: () => <ArchitectureApp />,
      },
      terminal: {
        label: "Neural Terminal",
        icon: <TerminalSquare className={ICON} />,
        content: (openFn) => <TerminalApp onOpen={openFn} />,
        width: 680,
        height: 440,
      },
      contact: { label: "Contact", icon: <Mail className={ICON} />, content: () => <ContactApp /> },
    }),
    [],
  );

  const dockApps: DockApp[] = useMemo(
    () => Object.entries(registry).map(([id, v]) => ({ id, label: v.label, icon: v.icon })),
    [registry],
  );

  const windows: WindowSpec[] = openOrder.map((id) => ({
    id,
    title: registry[id].label,
    icon: registry[id].icon,
    content: registry[id].content(open),
    width: registry[id].width,
    height: registry[id].height,
  }));

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <NeuralBackground />
      {!isMobile && <NeuralGlobe />}
      <MouseSpotlight />
      {!isMobile && <CursorTrail />}
      <div className="scanline pointer-events-none absolute inset-0" />

      <StatusBar onOpenTerminal={() => open("terminal")} />
      <JarvisWidget />

      {/* Notifications + easter eggs */}
      <LiveNotifications />
      <HackOverlay />
      <KonamiDevMode />

      {isMobile ? (
        <MobileLauncher apps={dockApps} onOpen={open} />
      ) : (
        <>
          {/* Hero greeting (visible behind windows) */}
          {openOrder.length === 0 && <HeroPulse />}

          {/* Windows */}
          <AnimatePresence>
            {windows.map((spec, i) => (
              <AppWindow
                key={spec.id}
                spec={spec}
                index={i}
                zIndex={20 + i}
                onClose={() => close(spec.id)}
                onFocus={() => focus(spec.id)}
              />
            ))}
          </AnimatePresence>

          <Dock apps={dockApps} openIds={openOrder} onOpen={open} />
          <CommandPalette apps={dockApps} onOpen={open} />
        </>
      )}

      {/* Mobile: open as fullscreen overlay window */}
      {isMobile && (
        <AnimatePresence>
          {windows.map((spec, i) => (
            <AppWindow
              key={spec.id}
              spec={spec}
              index={i}
              zIndex={20 + i}
              onClose={() => close(spec.id)}
              onFocus={() => focus(spec.id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
