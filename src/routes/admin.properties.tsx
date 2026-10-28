import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, ExternalLink, Link2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { SaleForm } from "@/components/admin/SaleForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BoundaryDrawer } from "@/components/map/BoundaryDrawer";
import { formatNaira } from "@/lib/company";
import { watermarkPhoto } from "@/lib/watermark";
import { nextRef, uid, updateDb, useDbAll, zoneLabel } from "@/lib/store";
import { CATEGORIES, STATUSES, TITLE_DOCS, type Property, type PropertyStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/properties")({ component: AdminProperties });

const sel = "h-9 w-full rounded-md border bg-background px-2 text-sm";

function blank(): Property {
  return { id: "", slug: "", ref: "", title: "", transaction: "sale", category: "Residential Land", zoneId: "", subZoneId: "", areaId: "", price: 0, plots: 1, dimensions: "50ft × 100ft", status: "Published", featured: false, images: [], description: "", titleDocs: [], boundary: [], survey: {}, createdAt: "" };
}

function AdminProperties() {
  const db = useDbAll();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<PropertyStatus | "All">("All");
  const [edit, setEdit] = useState<Property | null>(null);
  const [selling, setSelling] = useState<Property | null>(null);
  const list = db.properties.filter((p) => (statusF === "All" || p.status === statusF) && `${p.title} ${p.ref}`.toLowerCase().includes(q.toLowerCase()));
  const setStatus = (id: string, status: PropertyStatus) => updateDb((d) => ({ ...d, properties: d.properties.map((p) => (p.id === id ? { ...p, status } : p)) }), `Status → ${status}`);
  const del = (p: Property) => confirm(`Delete ${p.title}?`) && updateDb((d) => ({ ...d, properties: d.properties.filter((x) => x.id !== p.id) }), `Listing deleted: ${p.title}`);
  const copyInvite = async (p: Property) => {
    let token = p.inviteToken;
    if (!token) {
      token = uid() + uid();
      const t = token;
      updateDb((d) => ({ ...d, properties: d.properties.map((x) => (x.id === p.id ? { ...x, inviteToken: t } : x)) }), `Invite link created: ${p.title}`);
    }
    const url = `${window.location.origin}/properties/${p.slug}?invite=${token}`;
    try { await navigator.clipboard.writeText(url); toast.success("Private invite link copied", { description: "Only people with this link can view the listing." }); }
    catch { window.prompt("Copy this private invite link:", url); }
  };
  const inviteBtn = (p: Property) => p.status === "Private" && <Button size="icon" variant="ghost" onClick={() => copyInvite(p)} aria-label="Copy invite link" title="Copy private invite link"><Link2 className="h-4 w-4" /></Button>;
  const canSell = (p: Property) => p.status !== "Sold" && p.status !== "Archived";
  const statusSel = (p: Property) => <select aria-label="Status" className="h-8 rounded-md border bg-background px-2 text-xs" value={p.status} onChange={(e) => setStatus(p.id, e.target.value as PropertyStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0"><h1 className="truncate text-2xl font-bold sm:text-3xl">Properties</h1><p className="text-sm text-muted-foreground">{list.length} of {db.properties.length} listings</p></div>
        <Button onClick={() => setEdit(blank())}><Plus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">New listing</span><span className="sm:hidden">New</span></Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search title or reference…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
        <select aria-label="Filter status" className={sel} value={statusF} onChange={(e) => setStatusF(e.target.value as PropertyStatus | "All")}><option value="All">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>

      {list.length === 0 && <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">No listings match your search.</div>}

      {/* Phones & tablets: cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {list.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex gap-3 p-3">
              <img src={p.images[0]} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 font-medium leading-snug">{p.title}</div>
                <div className="truncate text-xs text-muted-foreground">{p.ref} · {zoneLabel(db, p.zoneId, p.subZoneId)}</div>
                <div className="mt-1 font-display font-bold text-primary">{formatNaira(p.price)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-3 py-2">
              {statusSel(p)}
              <div className="flex shrink-0 items-center">
                {inviteBtn(p)}
                <Button size="icon" variant="ghost" asChild><Link to="/properties/$slug" params={{ slug: p.slug }} target="_blank" aria-label="View"><ExternalLink className="h-4 w-4" /></Link></Button>
                <Button size="icon" variant="ghost" onClick={() => setEdit(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            {canSell(p) && <div className="border-t p-2"><Button size="sm" className="w-full" onClick={() => setSelling(p)}><BadgeCheck className="mr-1 h-4 w-4" /> Mark as Sold & print receipt</Button></div>}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      {list.length > 0 && <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Listing</th><th className="p-3">Location</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t transition hover:bg-muted/40">
                <td className="p-3"><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="h-11 w-16 rounded-md object-cover" /><div className="min-w-0"><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{p.ref} · {p.category}</div></div></div></td>
                <td className="p-3 text-muted-foreground">{zoneLabel(db, p.zoneId, p.subZoneId)}</td>
                <td className="p-3 font-medium">{formatNaira(p.price)}</td>
                <td className="p-3">{statusSel(p)}</td>
                <td className="whitespace-nowrap p-3 text-right">
                  {canSell(p) && <Button size="sm" className="mr-1" onClick={() => setSelling(p)}><BadgeCheck className="mr-1 h-4 w-4" /> Mark as Sold</Button>}
                  {inviteBtn(p)}
                  <Button size="icon" variant="ghost" asChild><Link to="/properties/$slug" params={{ slug: p.slug }} target="_blank" aria-label="View"><ExternalLink className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEdit(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      <Dialog open={!!selling} onOpenChange={(o) => !o && setSelling(null)}>
        <DialogContent className="max-h-[94vh] w-[calc(100vw-1rem)] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>Mark as Sold — {selling?.ref}</DialogTitle></DialogHeader>{selling && <SaleForm propertyId={selling.id} onDone={() => setSelling(null)} />}</DialogContent>
      </Dialog>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[94vh] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit listing" : "New listing"}</DialogTitle></DialogHeader>
          {edit && <PropertyForm initial={edit} onDone={() => setEdit(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertyForm({ initial, onDone }: { initial: Property; onDone: () => void }) {
  const db = useDbAll();
  const [f, setF] = useState<Property>(initial);
  const [imgUrl, setImgUrl] = useState("");
  const set = <K extends keyof Property>(k: K, v: Property[K]) => setF((p) => ({ ...p, [k]: v }));
  const zone = db.zones.find((z) => z.id === f.zoneId);
  const sub = zone?.subZones.find((s) => s.id === f.subZoneId);

  const save = () => {
    if (!f.title.trim() || !f.zoneId || !f.subZoneId || f.price <= 0) { toast.error("Title, zone, sub-zone and price are required."); return; }
    const ok = updateDb((d) => {
      const z = d.zones.find((x) => x.id === f.zoneId)!;
      if (f.id) return { ...d, properties: d.properties.map((p) => (p.id === f.id ? f : p)) };
      const ref = nextRef(d, z.code);
      const slug = f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + ref.slice(-3).toLowerCase() + z.code.toLowerCase();
      return { ...d, properties: [{ ...f, id: uid(), ref, slug, createdAt: new Date().toISOString().slice(0, 10), images: f.images.length ? f.images : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70"] }, ...d.properties] };
    }, `${f.id ? "Listing updated" : "Listing created"}: ${f.title}`);
    if (!ok) { toast.error("Not saved: storage is full. Remove some photos (or old listings) and try again."); return; }
    toast.success(f.status === "Published" ? "Listing saved and live on the website" : `Listing saved as ${f.status} — not visible on the website yet`);
    onDone();
  };

  const [busy, setBusy] = useState(false);
  const onFile = async (files: FileList | null) => {
    setBusy(true);
    for (const file of Array.from(files ?? [])) {
      try { const url = await watermarkPhoto(file); setF((p) => ({ ...p, images: [...p.images, url] })); } catch { toast.error(`Could not read ${file.name}`); }
    }
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <h3 className="font-semibold sm:col-span-2">1. Listing details</h3>
        <div className="sm:col-span-2"><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div><Label>Transaction</Label><select className={sel} value={f.transaction} onChange={(e) => set("transaction", e.target.value as "sale" | "rent")}><option value="sale">For Sale</option><option value="rent">For Rent</option></select></div>
        <div><Label>Category</Label><select className={sel} value={f.category} onChange={(e) => set("category", e.target.value as Property["category"])}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><Label>Zone</Label><select className={sel} value={f.zoneId} onChange={(e) => setF((p) => ({ ...p, zoneId: e.target.value, subZoneId: "", areaId: "" }))}><option value="">Select zone…</option>{db.zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div>
        <div><Label>Sub-zone</Label><select className={sel} disabled={!zone} value={f.subZoneId} onChange={(e) => setF((p) => ({ ...p, subZoneId: e.target.value, areaId: "" }))}><option value="">Select sub-zone…</option>{zone?.subZones.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><Label>Layout area</Label><select className={sel} disabled={!sub} value={f.areaId} onChange={(e) => set("areaId", e.target.value)}><option value="">Select area…</option>{sub?.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><Label>Status</Label><select className={sel} value={f.status} onChange={(e) => set("status", e.target.value as PropertyStatus)}>{STATUSES.map((s) => <option key={s} value={s}>{s === "Private" ? "Private (invite link only)" : s}</option>)}</select>{f.status === "Private" && <p className="mt-1 text-xs text-muted-foreground">Hidden from the website. After saving, use the link button on the listing to copy a private invite link.</p>}</div>
        <div><Label>Price (₦)</Label><Input type="number" value={f.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></div>
        <div><Label>Plots (50×100 ft)</Label><Input type="number" step="0.1" value={f.plots} onChange={(e) => set("plots", Number(e.target.value))} /></div>
        <div><Label>Dimensions</Label><Input value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} /></div>
        {f.category === "House/Villa" && <>
          <div><Label>Bedrooms</Label><Input type="number" value={f.bedrooms ?? ""} onChange={(e) => set("bedrooms", Number(e.target.value) || undefined)} /></div>
          <div><Label>Bathrooms</Label><Input type="number" value={f.bathrooms ?? ""} onChange={(e) => set("bathrooms", Number(e.target.value) || undefined)} /></div>
        </>}
        <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.featured} onCheckedChange={(v) => set("featured", !!v)} /> Feature on homepage</label>
      </div>

      <div className="rounded-xl border p-4"><h3 className="mb-2 font-semibold">2. Title documents</h3>
        <div className="mt-2 flex flex-wrap gap-4">{TITLE_DOCS.map((d) => <label key={d} className="flex items-center gap-2 text-sm"><Checkbox checked={f.titleDocs.includes(d)} onCheckedChange={(v) => set("titleDocs", v ? [...f.titleDocs, d] : f.titleDocs.filter((x) => x !== d))} />{d}</label>)}</div>
      </div>

      <div className="space-y-2 rounded-xl border p-4"><h3 className="font-semibold">3. Photos</h3>
        <div className="flex flex-wrap gap-2">{f.images.map((src, i) => <div key={i} className="relative"><img src={src} alt="" className="h-16 w-24 rounded object-cover" /><button className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground" onClick={() => set("images", f.images.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button></div>)}</div>
        <div className="flex gap-2"><Input placeholder="Paste image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} /><Button type="button" variant="outline" onClick={() => { if (imgUrl.trim()) { set("images", [...f.images, imgUrl.trim()]); setImgUrl(""); } }}>Add</Button></div>
        <Input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { onFile(e.target.files); e.target.value = ""; }} />
        <p className="text-xs text-muted-foreground">{busy ? "Adding your logo to photos…" : "Your Rahama logo is added automatically to every uploaded photo."}</p>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <h3 className="font-semibold">4. Map boundary &amp; measurement</h3>
        <BoundaryDrawer value={f.boundary} onChange={(b) => set("boundary", b)} />
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <h3 className="font-semibold">5. Certified survey details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Verified surveyor area (m²)</Label><Input type="number" value={f.survey.area ?? ""} onChange={(e) => set("survey", { ...f.survey, area: Number(e.target.value) || undefined })} /></div>
          <div><Label>Survey plan / beacon number</Label><Input placeholder="BAU/AZR/2026/SP-104" value={f.survey.number ?? ""} onChange={(e) => set("survey", { ...f.survey, number: e.target.value })} /></div>
          <div><Label>Survey authority / source</Label><Input placeholder="Licensed Surveyor / Bauchi State Ministry of Lands" value={f.survey.authority ?? ""} onChange={(e) => set("survey", { ...f.survey, authority: e.target.value })} /></div>
          <div><Label>Date of certified survey</Label><Input type="date" value={f.survey.date ?? ""} onChange={(e) => set("survey", { ...f.survey, date: e.target.value })} /></div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background px-4 py-3 sm:-mx-6 sm:px-6"><Button variant="outline" onClick={onDone}>Cancel</Button><Button onClick={save}>Save listing</Button></div>
    </div>
  );
}
