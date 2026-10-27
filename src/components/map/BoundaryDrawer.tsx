import { useState } from "react";
import { AlertTriangle, MapPin, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "./MapView";
import { AreaSummary, CadastralDisclaimer } from "./AreaSummary";
import { validateBoundary, type LatLng } from "@/lib/geo";

export function BoundaryDrawer({ value, onChange }: { value: LatLng[]; onChange: (p: LatLng[]) => void }) {
  const [adding, setAdding] = useState(true);
  const v = validateBoundary(value);
  return (
    <div className="space-y-3">
      <CadastralDisclaimer />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={adding ? "default" : "outline"} onClick={() => setAdding((a) => !a)}>
          <MapPin className="mr-1 h-4 w-4" /> {adding ? "Adding points (click map)" : "Add Point"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!value.length} onClick={() => onChange(value.slice(0, -1))}>
          <Undo2 className="mr-1 h-4 w-4" /> Undo Last Point
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!value.length} onClick={() => onChange([])}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear Boundary
        </Button>
        <span className="self-center text-xs text-muted-foreground">{value.length} point(s)</span>
      </div>
      <MapView points={value} height={340} onAddPoint={adding ? (p) => onChange([...value, p]) : undefined} />
      {value.length > 0 && !v.ok && (
        <p className="flex items-center gap-2 rounded-md border border-warning bg-warning/15 p-2 text-sm">
          <AlertTriangle className="h-4 w-4" /> {v.message}
        </p>
      )}
      {v.ok && <AreaSummary points={value} />}
    </div>
  );
}
