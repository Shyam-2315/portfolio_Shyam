import type { GateSubject } from "@/data/gate";

const colorFor = (v: number) =>
  v > 70 ? "var(--cyan)" : v > 50 ? "var(--purple)" : "oklch(0.65 0.18 25)";

/** SVG radar chart for GATE subjects. */
export function SubjectRadar({ subjects }: { subjects: GateSubject[] }) {
  const N = subjects.length;
  if (N === 0)
    return (
      <div className="py-16 text-center font-mono text-xs text-muted-foreground">
        no subjects found.
      </div>
    );

  const size = 280;
  const cx = size / 2,
    cy = size / 2;
  const max = 100;
  const rings = [25, 50, 75, 100];
  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const point = (i: number, v: number) => {
    const r = (v / max) * (size / 2 - 30);
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  };
  const path = subjects.map((s, i) => point(i, s.progress).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-64 w-64 max-w-full">
      {rings.map((v) => (
        <polygon
          key={v}
          fill="none"
          stroke="oklch(0.82 0.16 200 / 0.18)"
          strokeWidth={0.5}
          points={subjects.map((_, i) => point(i, v).join(",")).join(" ")}
        />
      ))}
      {subjects.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="oklch(0.82 0.16 200 / 0.12)"
            strokeWidth={0.5}
          />
        );
      })}
      <polygon
        points={path}
        fill="oklch(0.82 0.16 200 / 0.18)"
        stroke="oklch(0.82 0.16 200)"
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 0 6px oklch(0.82 0.16 200 / 0.6))" }}
      />
      {subjects.map((s, i) => {
        const [x, y] = point(i, s.progress);
        return <circle key={s.name} cx={x} cy={y} r={2.5} fill={colorFor(s.progress)} />;
      })}
      {subjects.map((s, i) => {
        const [x, y] = point(i, 115);
        return (
          <text
            key={s.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="oklch(0.7 0.03 250)"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}
