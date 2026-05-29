import { useEffect, useState } from "react";

/** Soft aurora that follows the cursor — adds living-system feel. */
export function MouseSpotlight() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity"
      aria-hidden
      style={{
        background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, oklch(0.82 0.16 200 / 0.10), transparent 60%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}
