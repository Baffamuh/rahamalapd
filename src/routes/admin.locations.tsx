import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uid, updateDb, useDbAll } from "@/lib/store";
import type { Zone } from "@/lib/types";

export const Route = createFileRoute("/admin/locations")({ component: Locations });

function rename(current: string): string | null {
  const v = prompt("New name", current);
  return v && v.trim() ? v.trim() : null;
}

function Locations() {
  const db = useDbAll();
  const [newZone, setNewZone] = useState("");
  const [code, setCode] = useState<"AZR" | "BAU">("AZR");
  const setZones = (fn: (z: Zone[]) => Zone[], msg: string) => updateDb((d) => ({ ...d, zones: fn(d.zones) }), msg);
  const used = (k: "zoneId" | "subZoneId" | "areaId", id: string) => db.properties.some((p) => p[k] === id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Locations</h1>
      <form className="flex flex-wrap gap-2 rounded-xl border bg-card p-4" onSubmit={(e) => { e.preventDefault(); if (!newZone.trim()) return; setZones((z) => [...z, { id: uid(), name: newZone.trim(), code, subZones: [] }], `Zone added: ${newZone}`); setNewZone(""); }}>
        <Input className="max-w-xs" placeholder="New main zone name" value={newZone} onChange={(e) => setNewZone(e.target.value)} />
        <select className="rounded-md border bg-background px-2 text-sm" value={code} onChange={(e) => setCode(e.target.value as "AZR" | "BAU")}><option value="AZR">Azare (AZR)</option><option value="BAU">Bauchi (BAU)</option></select>
        <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Add zone</Button>
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        {db.zones.map((z) => (
          <div key={z.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{z.name} <span className="text-xs text-muted-foreground">({z.code})</span></h2>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { const n = rename(z.name); if (n) setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, name: n } : x), `Zone renamed: ${n}`); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" disabled={used("zoneId", z.id)} title={used("zoneId", z.id) ? "In use by listings" : "Delete"} onClick={() => confirm(`Delete ${z.name}?`) && setZones((zs) => zs.filter((x) => x.id !== z.id), `Zone deleted: ${z.name}`)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {z.subZones.map((s) => (
                <div key={s.id} className="rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    {s.name}
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { const n = rename(""); if (n) setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: x.subZones.map((y) => y.id === s.id ? { ...y, areas: [...y.areas, { id: uid(), name: n }] } : y) } : x), `Area added: ${n}`); }}><Plus className="h-3 w-3" /> Area</Button>
                      <Button size="icon" variant="ghost" onClick={() => { const n = rename(s.name); if (n) setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: x.subZones.map((y) => y.id === s.id ? { ...y, name: n } : y) } : x), `Sub-zone renamed: ${n}`); }}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" disabled={used("subZoneId", s.id)} onClick={() => setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: x.subZones.filter((y) => y.id !== s.id) } : x), `Sub-zone deleted: ${s.name}`)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.areas.map((a) => (
                      <span key={a.id} className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs">
                        <button onClick={() => { const n = rename(a.name); if (n) setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: x.subZones.map((y) => y.id === s.id ? { ...y, areas: y.areas.map((q) => q.id === a.id ? { ...q, name: n } : q) } : y) } : x), `Area renamed: ${n}`); }}>{a.name}</button>
                        {!used("areaId", a.id) && <button aria-label="Remove" onClick={() => setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: x.subZones.map((y) => y.id === s.id ? { ...y, areas: y.areas.filter((q) => q.id !== a.id) } : y) } : x), `Area deleted: ${a.name}`)}>×</button>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => { const n = rename(""); if (n) setZones((zs) => zs.map((x) => x.id === z.id ? { ...x, subZones: [...x.subZones, { id: uid(), name: n, areas: [] }] } : x), `Sub-zone added: ${n}`); }}><Plus className="mr-1 h-3 w-3" /> Add sub-zone</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
