/** GitHub-style heatmap for the past N weeks. Deterministic per day so it's stable. */
export function StreakHeatmap() {
  const weeks = 26;
  const days = weeks * 7;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - days + 1);

  // pseudo-random but stable intensity per day
  const cells: { date: Date; v: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const seed = d.getDate() * 31 + d.getMonth() * 7 + d.getFullYear();
    const r = ((Math.sin(seed) + 1) / 2) * 4; // 0–4
    cells.push({ date: d, v: Math.floor(r) });
  }

  const colorFor = (v: number) => {
    if (v === 0) return "oklch(1 0 0 / 0.04)";
    if (v === 1) return "oklch(0.65 0.22 295 / 0.35)";
    if (v === 2) return "oklch(0.82 0.16 200 / 0.45)";
    if (v === 3) return "oklch(0.82 0.16 200 / 0.7)";
    return "oklch(0.82 0.16 200)";
  };

  return (
    <div>
      <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: "repeat(7, 10px)" }}>
        {cells.map((c, i) => (
          <div
            key={i}
            title={`${c.date.toDateString()} · ${c.v}`}
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: colorFor(c.v) }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        less {[0, 1, 2, 3, 4].map((v) => (
          <span key={v} className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: colorFor(v) }} />
        ))} more
      </div>
    </div>
  );
}
