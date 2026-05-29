import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/** Brief particle wormhole shown between boot and desktop. */
export function Wormhole({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const cx = () => window.innerWidth / 2;
    const cy = () => window.innerHeight / 2;

    type P = { a: number; r: number; v: number; len: number; hue: number };
    const N = 220;
    const pts: P[] = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * 30 + 10,
      v: 4 + Math.random() * 12,
      len: 30 + Math.random() * 80,
      hue: Math.random() < 0.5 ? 200 : 290,
    }));

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = performance.now() - start;
      ctx.fillStyle = "rgba(10, 10, 25, 0.18)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of pts) {
        p.r += p.v;
        const x1 = cx() + Math.cos(p.a) * p.r;
        const y1 = cy() + Math.sin(p.a) * p.r;
        const x2 = cx() + Math.cos(p.a) * (p.r - p.len);
        const y2 = cy() + Math.sin(p.a) * (p.r - p.len);
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 0.9)`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (p.r > Math.max(window.innerWidth, window.innerHeight)) {
          p.r = 0;
        }
      }
      // central flash
      const flash = Math.max(0, 1 - t / 900);
      ctx.fillStyle = `rgba(170, 240, 255, ${flash * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx(), cy(), 40 + (1 - flash) * 800, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };
    tick();

    const done = setTimeout(onDone, 900);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
      window.removeEventListener("resize", resize);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[400]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </motion.div>
  );
}
