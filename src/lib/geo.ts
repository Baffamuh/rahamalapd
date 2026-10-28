import { PLOT_SQFT, SQFT_PER_SQM } from "./company";

export type LatLng = [number, number];
const R = 6378137; // WGS84 equatorial radius (m)
const rad = (d: number) => (d * Math.PI) / 180;

/** Geodesic (spherical) polygon area in m². */
export function geodesicArea(points: LatLng[]): number {
  if (points.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lng1] = points[i]!;
    const [lat2, lng2] = points[(i + 1) % points.length]!;
    total += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((total * R * R) / 2);
}

function segIntersect(a: LatLng, b: LatLng, c: LatLng, d: LatLng): boolean {
  const o = (p: LatLng, q: LatLng, r: LatLng) =>
    Math.sign((q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}

export function isSelfIntersecting(points: LatLng[]): boolean {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
      if (segIntersect(points[i]!, points[(i + 1) % n]!, points[j]!, points[(j + 1) % n]!)) return true;
    }
  }
  return false;
}

/** Great-circle (haversine) distance in metres between two points. */
export function distance(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const M_TO_FT = 3.28084;

/** Length of every side of the closed boundary, in metres. */
export function edgeLengths(points: LatLng[]): number[] {
  if (points.length < 2) return [];
  const n = points.length < 3 ? 1 : points.length;
  return Array.from({ length: n }, (_, i) => distance(points[i]!, points[(i + 1) % points.length]!));
}

export function perimeter(points: LatLng[]): number {
  return points.length < 3 ? 0 : edgeLengths(points).reduce((s, x) => s + x, 0);
}

export function areaBreakdown(sqm: number) {
  const sqft = sqm * SQFT_PER_SQM;
  return {
    sqm,
    sqft,
    plots: sqft / PLOT_SQFT,
    hectares: sqm / 10000,
    acres: sqm / 4046.8564224,
  };
}

export function validateBoundary(points: LatLng[]): { ok: boolean; message?: string } {
  if (points.length < 3) return { ok: false, message: "Add at least 3 points to form a boundary." };
  if (isSelfIntersecting(points)) return { ok: false, message: "Boundary lines cross each other. Undo and redraw the points in order." };
  if (geodesicArea(points) < 1) return { ok: false, message: "Boundary area is too small to be valid." };
  return { ok: true };
}
