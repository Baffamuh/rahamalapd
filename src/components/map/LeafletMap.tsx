import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { edgeLengths, M_TO_FT, type LatLng } from "@/lib/geo";
import { COMPANY } from "@/lib/company";

export type LeafletMapProps = {
  points: LatLng[];
  onAddPoint?: ((p: LatLng) => void) | undefined;
  onMovePoint?: ((index: number, p: LatLng) => void) | undefined;
  showEdges?: boolean;
  fitSignal?: number;
  markers?: { pos: LatLng; label: string }[];
  center?: LatLng;
  zoom?: number;
  height?: number;
};

export default function LeafletMap({ points, onAddPoint, onMovePoint, showEdges, fitSignal, markers, center, zoom = 16, height = 380 }: LeafletMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onAddPoint);
  clickRef.current = onAddPoint;
  const moveRef = useRef(onMovePoint);
  moveRef.current = onMovePoint;

  useEffect(() => {
    if (!el.current || map.current) return;
    const start = center ?? (points[0] as LatLng | undefined) ?? COMPANY.center;
    const m = L.map(el.current, { maxZoom: 21 }).setView(start, zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 21,
      maxNativeZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => clickRef.current?.([e.latlng.lat, e.latlng.lng]));
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    if (points.length >= 2) m.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 19 });
    return () => { m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !fitSignal) return;
    if (points.length >= 2) m.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 19 });
    else m.setView(points[0] ?? COMPANY.center, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitSignal]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    const color = getComputedStyle(document.documentElement).getPropertyValue("--ring").trim() || "green";
    if (points.length >= 3) L.polygon(points, { color, weight: 3, fillOpacity: 0.22 }).addTo(g);
    else if (points.length === 2) L.polyline(points, { color, weight: 3 }).addTo(g);

    if (showEdges && points.length >= 2) {
      edgeLengths(points).forEach((len, i) => {
        const a = points[i]!, b = points[(i + 1) % points.length]!;
        const mid: LatLng = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        L.marker(mid, {
          interactive: false,
          icon: L.divIcon({ className: "edge-label", html: `<span>${(len * M_TO_FT).toFixed(1)} ft</span>`, iconSize: [0, 0] }),
        }).addTo(g);
      });
    }

    points.forEach((p, i) => {
      const mk = L.marker(p, {
        draggable: !!moveRef.current,
        icon: L.divIcon({ className: "vertex-pin", html: `<span>${i + 1}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
      });
      mk.on("dragend", () => { const ll = mk.getLatLng(); moveRef.current?.(i, [ll.lat, ll.lng]); });
      mk.addTo(g);
    });
    markers?.forEach((mk) => L.circleMarker(mk.pos, { radius: 9, color, fillOpacity: 0.9 }).bindPopup(mk.label).addTo(g));
  }, [points, markers, showEdges, !!onMovePoint]);

  return <div ref={el} style={{ height }} className="z-0 w-full touch-none overflow-hidden rounded-lg border" />;
}
