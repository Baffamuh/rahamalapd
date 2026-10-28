import { Info } from "lucide-react";
import { areaBreakdown, geodesicArea, type LatLng } from "@/lib/geo";

const n = (x: number, d = 0) => x.toLocaleString("en-NG", { maximumFractionDigits: d, minimumFractionDigits: d });

export function CadastralDisclaimer() {
  return (
    <div className="flex gap-2 rounded-md border border-warning bg-warning/15 p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p><strong>Estimated Map Boundary Calculation</strong> — For indicative planning only. Not a certified cadastral survey.</p>
    </div>
  );
}

export function AreaSummary({ points }: { points: LatLng[] }) {
  const a = areaBreakdown(geodesicArea(points));
  const items = [
    ["Square feet", n(a.sqft) + " sq ft"],
    ["Standard plots (50×100 ft)", n(a.plots, 2)],
    ["Square metres", n(a.sqm, 1) + " m²"],
    ["Hectares", n(a.hectares, 4) + " ha"],
    ["Acres", n(a.acres, 3) + " ac"],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-md border bg-card p-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
          <div className="font-display text-sm font-semibold">{v}</div>
        </div>
      ))}
    </div>
  );
}
