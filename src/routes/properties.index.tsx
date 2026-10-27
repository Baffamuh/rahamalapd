import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useDbAll } from "@/lib/store";
import { CATEGORIES, type DB } from "@/lib/types";
import { PLOT_SQFT, SQFT_PER_SQM } from "@/lib/company";

const searchSchema = z.object({
  tx: z.enum(["sale", "rent"]).optional(),
  category: z.string().optional(),
  zone: z.string().optional(),
  sub: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  size: z.number().optional(),
  unit: z.enum(["plots", "sqft", "sqm"]).optional(),
});
type S = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Properties for Sale & Rent in Azare and Bauchi | Rahama Property" },
      { name: "description", content: "Browse verified residential land, commercial plots, houses, farms and shops across Azare and Bauchi State." },
      { property: "og:title", content: "Properties in Azare & Bauchi | Rahama Property" },
      { property: "og:description", content: "Filter verified plots, homes and shops by zone, budget and size." },
    ],
  }),
  component: Catalogue,
});

export function filterProperties(db: DB, s: S) {
  const toPlots = (v: number, u: S["unit"]) => (u === "sqft" ? v / PLOT_SQFT : u === "sqm" ? (v * SQFT_PER_SQM) / PLOT_SQFT : v);
  return db.properties.filter((p) =>
    (p.status === "Published" || p.status === "Reserved" || p.status === "Sold") &&
    (!s.tx || p.transaction === s.tx) &&
    (!s.category || p.category === s.category) &&
    (!s.zone || p.zoneId === s.zone) &&
    (!s.sub || p.subZoneId === s.sub) &&
    (s.min == null || p.price >= s.min) &&
    (s.max == null || p.price <= s.max) &&
    (s.size == null || p.plots >= toPlots(s.size, s.unit)),
  );
}

function Filters({ s, set }: { s: S; set: (p: Partial<S>) => void }) {
  const db = useDbAll();
  const zone = db.zones.find((z) => z.id === s.zone);
  const num = (v: string) => (v === "" ? undefined : Number(v));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {[[undefined, "All"], ["sale", "For Sale"], ["rent", "For Rent"]].map(([v, l]) => (
          <button key={l} onClick={() => set({ tx: v as S["tx"] })} className={`rounded-md py-1.5 text-sm ${s.tx === v ? "bg-card font-semibold shadow-sm" : ""}`}>{l}</button>
        ))}
      </div>
      <div><Label>Category</Label>
        <Select value={s.category ?? "any"} onValueChange={(v) => set({ category: v === "any" ? undefined : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>
      <div><Label>Zone</Label>
        <Select value={s.zone ?? "any"} onValueChange={(v) => set({ zone: v === "any" ? undefined : v, sub: undefined })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">All zones</SelectItem>{db.zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div><Label>Sub-zone</Label>
        <Select disabled={!zone} value={s.sub ?? "any"} onValueChange={(v) => set({ sub: v === "any" ? undefined : v })}><SelectTrigger><SelectValue placeholder="Select a zone first" /></SelectTrigger><SelectContent><SelectItem value="any">All sub-zones</SelectItem>{zone?.subZones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div><Label>Price range (₦)</Label>
        <div className="grid grid-cols-2 gap-2"><Input type="number" placeholder="Min" value={s.min ?? ""} onChange={(e) => set({ min: num(e.target.value) })} /><Input type="number" placeholder="Max" value={s.max ?? ""} onChange={(e) => set({ max: num(e.target.value) })} /></div>
      </div>
      <div><Label>Minimum size</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="e.g. 2" value={s.size ?? ""} onChange={(e) => set({ size: num(e.target.value) })} />
          <Select value={s.unit ?? "plots"} onValueChange={(v) => set({ unit: v as S["unit"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="plots">Plots (50×100ft)</SelectItem><SelectItem value="sqft">Sq ft</SelectItem><SelectItem value="sqm">m²</SelectItem></SelectContent></Select>
        </div>
      </div>
    </div>
  );
}

function Catalogue() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const db = useDbAll();
  const set = (p: Partial<S>) => navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });
  const list = filterProperties(db, s);
  const active = Object.entries(s).filter(([k, v]) => v != null && k !== "unit").length;
  return (
    <SiteLayout>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold">Properties</h1><p className="text-muted-foreground">{list.length} listing{list.length === 1 ? "" : "s"} found</p></div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-24 rounded-xl border bg-card p-4"><Filters s={s} set={set} />{active > 0 && <Button variant="ghost" className="mt-3 w-full" onClick={() => navigate({ search: {} })}>Clear filters</Button>}</div></aside>
        <div>
          <div className="mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline"><SlidersHorizontal className="mr-1 h-4 w-4" /> Filters {active > 0 && <span className="ml-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">{active}</span>}</Button></SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="px-4"><Filters s={s} set={set} />{active > 0 && <Button variant="ghost" className="mt-3 w-full" onClick={() => navigate({ search: {} })}>Clear filters</Button>}</div></SheetContent>
            </Sheet>
          </div>
          {list.length === 0 ? <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">No properties match these filters.</div> :
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <PropertyCard key={p.id} p={p} />)}</div>}
        </div>
      </div>
    </SiteLayout>
  );
}
