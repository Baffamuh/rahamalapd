import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";
import { COMPANY } from "@/lib/company";

export type LeafletMapProps = {
  points: LatLng[];
  onAddPoint?: (p: LatLng) => void;
  markers?: { pos: LatLng; label: string }[];
  center?: LatLng;
  zoom?: number;
  height?: number;
};

export default function LeafletMap({ points, onAddPoint, markers, center, zoom = 16, height = 380 }: LeafletMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onAddPoint);
  clickRef.current = onAddPoint;

  useEffect(() => {
    if (!el.current || map.current) return;
    const start = center ?? (points[0] as LatLng | undefined) ?? COMPANY.center;
    const m = L.map(el.current).setView(start, zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => clickRef.current?.([e.latlng.lat, e.latlng.lng]));
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    if (points.length >= 2) m.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 18 });
    return () => { m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue("--ring").trim() || "green";
    if (points.length >= 3) L.polygon(points, { color, weight: 3, fillOpacity: 0.25 }).addTo(g);
    else if (points.length === 2) L.polyline(points, { color, weight: 3 }).addTo(g);
    points.forEach((p, i) =>
      L.circleMarker(p, { radius: 6, color, fillOpacity: 1, weight: 2 }).bindTooltip(String(i + 1)).addTo(g),
    );
    markers?.forEach((mk) => L.circleMarker(mk.pos, { radius: 9, color, fillOpacity: 0.9 }).bindPopup(mk.label).addTo(g));
  }, [points, markers]);

  return <div ref={el} style={{ height }} className="w-full overflow-hidden rounded-lg border z-0" />;
}
