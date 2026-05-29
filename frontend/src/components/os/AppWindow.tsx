import { type ReactNode, useRef, useState, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { X, Minus, Square } from "lucide-react";

export type WindowSpec = {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
  width?: number;
  height?: number;
};

type Props = {
  spec: WindowSpec;
  index: number;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
};

export function AppWindow({ spec, index, zIndex, onClose, onFocus }: Props) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const w = spec.width ?? 720;
  const h = spec.height ?? 480;

  // Cascade initial position
  const offset = mobile ? 0 : 30 + index * 28;

  return (
    <>
      <div ref={constraintsRef} className="pointer-events-none fixed inset-0" />
      <motion.div
        drag={!maximized && !mobile}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={
          maximized || mobile ? { opacity: 1, scale: 1, y: 0, x: 0 } : { opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onMouseDown={onFocus}
        style={{
          zIndex,
          width: maximized || mobile ? "100%" : w,
          height: maximized || mobile ? "100%" : h,
          left: maximized || mobile ? 0 : `calc(50% - ${w / 2}px + ${offset}px)`,
          top: maximized || mobile ? 0 : `calc(50% - ${h / 2}px + ${offset}px)`,
        }}
        className={`absolute glass-strong overflow-hidden rounded-2xl shadow-2xl ${
          maximized || mobile ? "rounded-none" : "glow-cyan"
        }`}
      >
        {/* Title bar */}
        <div
          onPointerDown={(e) => !maximized && !mobile && dragControls.start(e)}
          className="flex h-10 items-center justify-between border-b border-border/60 bg-background/40 px-3 select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="text-cyan">{spec.icon}</div>
            <span className="font-mono uppercase tracking-widest text-muted-foreground">
              {spec.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                /* minimize -> close for now */ onClose();
              }}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
              aria-label="Minimize"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMaximized((m) => !m)}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
              aria-label="Maximize"
            >
              <Square className="h-3 w-3" />
            </button>
            <button
              onClick={onClose}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-destructive/80 hover:text-white"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative h-[calc(100%-2.5rem)] overflow-auto p-5">{spec.content}</div>

        {/* HUD corner brackets */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l border-t border-cyan/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r border-t border-cyan/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 bottom-1 h-3 w-3 border-l border-b border-cyan/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 bottom-1 h-3 w-3 border-r border-b border-cyan/70"
        />
        {/* holographic sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.82 0.16 200 / 0.8), transparent)",
          }}
        />
      </motion.div>
    </>
  );
}
