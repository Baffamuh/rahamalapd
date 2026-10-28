import { useState } from "react";
import { AlertTriangle, Crosshair, Hand, MapPin, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "./MapView";
import { AreaSummary, CadastralDisclaimer } from "./AreaSummary";
import { edgeLengths, M_TO_FT, perimeter, validateBoundary, type LatLng } from "@/lib/geo";

const f1 = (x: number) => x.toLocaleString("en-NG", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function BoundaryDrawer({ value, onChange }: { value: LatLng[]; onChange: (p: LatLng[]) => void }) {
  const [adding, setAdding] = useState(true);
  const [fit, setFit] = useState(0);
  const v = validateBoundary(value);
  const edges = edgeLengths(value);
  const per = perimeter(value);
  return (
    <div className="space-y-3">
      <CadastralDisclaimer />
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button type="button" size="sm" variant={adding ? "default" : "outline"} onClick={() => setAdding((a) => !a)}>
          {adding ? <MapPin className="mr-1 h-4 w-4" /> : <Hand className="mr-1 h-4 w-4" />}
          {adding ? "Tap map to add" : "Add points"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!value.length} onClick={() => onChange(value.slice(0, -1))}>
          <Undo2 className="mr-1 h-4 w-4" /> Undo last
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setFit((n) => n + 1)}>
          <Crosshair className="mr-1 h-4 w-4" /> Fit boundary
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!value.length} onClick={() => confirm("Clear all boundary points?") && onChange([])}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length} point(s) · Tap corners in order around the plot. Drag any numbered pin to fine-tune its position. Zoom in closely for best accuracy.
      </p>
      <MapView
        points={value}
        height={380}
        showEdges
        fitSignal={fit}
        onAddPoint={adding ? (p) => onChange([...value, p]) : undefined}
        onMovePoint={(i, p) => onChange(value.map((x, j) => (j === i ? p : x)))}
      />
      {value.length > 0 && !v.ok && (
        <p className="flex items-center gap-2 rounded-md border border-warning bg-warning/15 p-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {v.message}
        </p>
      )}
      {v.ok && <AreaSummary points={value} />}
      {edges.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-semibold">
            <span>Side lengths</span>
            {per > 0 && <span className="text-xs font-normal text-muted-foreground">Perimeter: {f1(per * M_TO_FT)} ft ({f1(per)} m)</span>}
          </div>
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {edges.map((m, i) => (
              <li key={i} className="flex justify-between bg-card px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">Side {i + 1} → {(i + 1) % value.length + 1}</span>
                <span className="font-medium">{f1(m * M_TO_FT)} ft <span className="text-muted-foreground">/ {f1(m)} m</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
