import { useSyncExternalStore } from "react";
import { makeSeed } from "./seed";
import type { DB } from "./types";

const KEY = "rahama-db-v1";
let serverDb: DB | null = null;
let db: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (db) return db;
  if (typeof window === "undefined") return (serverDb ??= makeSeed());
  try {
    const raw = window.localStorage.getItem(KEY);
    db = raw ? (JSON.parse(raw) as DB) : makeSeed();
  } catch {
    db = makeSeed();
  }
  return db;
}

export function getDb(): DB {
  return load();
}

export function updateDb(fn: (d: DB) => DB, activity?: string) {
  let next = fn(load());
  if (activity) {
    next = { ...next, activity: [{ id: uid(), text: activity, at: new Date().toISOString() }, ...next.activity].slice(0, 50) };
  }
  db = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function resetDb() {
  updateDb(() => makeSeed());
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const serverSnap = () => (serverDb ??= makeSeed());

export function useDb<T>(select: (d: DB) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => select(load()),
    () => select(serverSnap()),
  );
}

export function useDbAll(): DB {
  return useDb((d) => d);
}

// helpers
export function zoneLabel(d: DB, zoneId: string, subZoneId?: string) {
  const z = d.zones.find((x) => x.id === zoneId);
  const s = z?.subZones.find((x) => x.id === subZoneId);
  return [s?.name, z?.name].filter(Boolean).join(", ");
}

export function nextRef(d: DB, code: "AZR" | "BAU") {
  const nums = d.properties.filter((p) => p.ref.startsWith(`RHM-${code}-`)).map((p) => parseInt(p.ref.slice(-3)) || 0);
  return `RHM-${code}-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

export function nextReceipt(d: DB, year: number) {
  const nums = d.sales.filter((s) => s.receiptNo.startsWith(`RHM-RCP-${year}-`)).map((s) => parseInt(s.receiptNo.slice(-4)) || 0);
  return `RHM-RCP-${year}-${String(Math.max(0, ...nums) + 1).padStart(4, "0")}`;
}

export function nextAgentCode(d: DB) {
  const nums = d.agents.map((a) => parseInt(a.code.slice(-3)) || 0);
  return `RHM-AGT-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}
