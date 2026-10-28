import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Crosshair, Footprints, Hand, MapPin, Pause, Play, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "./MapView";
import { AreaSummary, CadastralDisclaimer } from "./AreaSummary";
import { acceptWalkFix, edgeLengths, M_TO_FT, perimeter, validateBoundary, type LatLng } from "@/lib/geo";

const f1 = (x: number) => x.toLocaleString("en-NG", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function BoundaryDrawer({ value, onChange }: { value: LatLng[]; onChange: (p: LatLng[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [fit, setFit] = useState(0);
  // GPS walk-the-boundary: "idle" | "walking" | "paused" | "done"
  const [walk, setWalk] = useState<"idle" | "walking" | "paused" | "done">("idle");
  const [acc, setAcc] = useState<number | null>(null);
  const [gpsErr, setGpsErr] = useState<string | null>(null);
  const pts = useRef(value);
  pts.current = value;
  const watchId = useRef<number | null>(null);

  const stopWatch = () => { if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current); watchId.current = null; };
  const startWatch = () => {
    if (!("geolocation" in navigator)) { setGpsErr("This device has no GPS/location support. Tap the map to add corners instead."); setAdding(true); return; }
    setGpsErr(null);
    stopWatch();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setAcc(pos.coords.accuracy);
        const cur = pts.current;
        if (acceptWalkFix(cur[cur.length - 1], next, pos.coords.accuracy)) { onChange([...cur, next]); setFit((n) => n + 1); }
      },
      (e) => { setGpsErr(e.code === 1 ? "Location permission was denied. Allow location for this site, or tap the map to add corners." : "Waiting for a GPS signal… move to open sky."); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
    setWalk("walking");
  };
  // Start reading automatically when the tool opens on an empty boundary.
  useEffect(() => {
    if (value.length === 0) startWatch(); else setAdding(true);
    return stopWatch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pause = () => { stopWatch(); setWalk("paused"); };
  const finish = () => { stopWatch(); setWalk("done"); setFit((n) => n + 1); };
  const v = validateBoundary(value);
  const edges = edgeLengths(value);
  const per = perimeter(value);
  return (
    <div className="space-y-3">
      <CadastralDisclaimer />
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Footprints className="h-4 w-4 text-primary" /> Walk the field (GPS)
            {walk === "walking" && <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Reading</span>}
            {walk === "paused" && <span className="rounded-full bg-warning px-2 py-0.5 text-xs">Paused</span>}
            {walk === "done" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Finished</span>}
          </div>
          {acc != null && walk === "walking" && <span className={`text-xs ${acc <= 10 ? "text-primary" : acc <= 25 ? "text-muted-foreground" : "text-destructive"}`}>GPS accuracy ±{Math.round(acc)} m{acc > 25 ? " — too weak, waiting" : ""}</span>}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex">
          {walk === "walking" ? (
            <Button type="button" size="lg" variant="outline" onClick={pause}><Pause className="mr-1 h-4 w-4" /> Stop / Pause</Button>
          ) : (
            <Button type="button" size="lg" variant="outline" onClick={startWatch}><Play className="mr-1 h-4 w-4" /> {walk === "idle" ? "Start reading" : "Resume"}</Button>
          )}
          <Button type="button" size="lg" disabled={walk === "idle" || walk === "done"} onClick={finish}><CheckCircle2 className="mr-1 h-4 w-4" /> Finish</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Stand on the first corner, then walk slowly around the boundary. Corners are recorded automatically every few metres. Press <b>Finish</b> back at the start — the shape closes itself.</p>
        {gpsErr && <p className="mt-2 text-xs text-destructive">{gpsErr}</p>}
      </div>
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
