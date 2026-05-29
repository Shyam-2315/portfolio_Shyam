import { useEffect, useRef } from "react";

/** Custom cursor with glowing trail. Disables on touch devices. */
export function CursorTrail() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.style.cursor = "none";

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      }
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("mousemove", onMove);

    // grow on interactive hover
    const setHover = (on: boolean) => {
      if (ringRef.current) {
        ringRef.current.style.scale = on ? "1.6" : "1";
        ringRef.current.style.opacity = on ? "1" : "0.7";
      }
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('button, a, input, textarea, [role="button"]')) setHover(true);
      else setHover(false);
    };
    window.addEventListener("mouseover", over);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", over);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] h-8 w-8 rounded-full border border-cyan/70 transition-[scale,opacity] duration-150"
        style={{ boxShadow: "0 0 18px oklch(0.82 0.16 200 / 0.7), inset 0 0 8px oklch(0.82 0.16 200 / 0.35)" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[301] h-1.5 w-1.5 rounded-full bg-cyan"
        style={{ boxShadow: "0 0 8px oklch(0.82 0.16 200)" }}
      />
    </>
  );
}
