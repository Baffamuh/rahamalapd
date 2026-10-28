import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bath, BedDouble, CalendarCheck, FileCheck2, MapPin, MessageCircle, Phone, Ruler, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/PropertyCard";
import { InstallmentCalculator } from "@/components/site/InstallmentCalculator";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { MapView } from "@/components/map/MapView";
import { AreaSummary, CadastralDisclaimer } from "@/components/map/AreaSummary";
import { COMPANY, formatNaira, propertyWaMessage, waLink } from "@/lib/company";
import { getDb, useDb, useDbAll, zoneLabel } from "@/lib/store";
import { TITLE_DOCS } from "@/lib/types";

export const Route = createFileRoute("/properties/$slug")({
  validateSearch: (s: Record<string, unknown>): { invite?: string } => (typeof s.invite === "string" ? { invite: s.invite } : {}),
  loader: ({ params }) => {
    const p = getDb().properties.find((x) => x.slug === params.slug);
    if (p && p.status === "Private") return { title: undefined, ref: undefined, price: undefined, image: undefined, description: undefined };
    return { title: p?.title, ref: p?.ref, price: p?.price, image: p?.images[0], description: p?.description };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.title ? `${loaderData.title} (${loaderData.ref}) | Rahama Property` : "Property details | Rahama Property";
    const d = loaderData?.title ? `${loaderData.title} — ${formatNaira(loaderData.price ?? 0)}. ${loaderData.description ?? ""}`.slice(0, 160) : "Verified property listing in Azare and Bauchi.";
    const img = loaderData?.image;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  component: PropertyPage,
});

function PropertyPage() {
  const { slug } = Route.useParams();
  const { invite } = Route.useSearch();
  const db = useDbAll();
  const p = db.properties.find((x) => x.slug === slug);
  const loc = useDb((d) => (p ? zoneLabel(d, p.zoneId, p.subZoneId) : ""));
  const area = p ? db.zones.find((z) => z.id === p.zoneId)?.subZones.find((s) => s.id === p.subZoneId)?.areas.find((a) => a.id === p.areaId)?.name : "";
  const [img, setImg] = useState(0);
  const [open, setOpen] = useState(false);

  const privateBlocked = p?.status === "Private" && (!p.inviteToken || invite !== p.inviteToken);
  if (!p || p.status === "Draft" || p.status === "Archived" || privateBlocked) {
    return <SiteLayout><div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">Listing not available</h1><p className="mt-2 text-muted-foreground">This property may have been removed.</p><Button asChild className="mt-6"><Link to="/properties">Browse properties</Link></Button></div></SiteLayout>;
  }
  const wa = waLink(propertyWaMessage(p.title, p.ref));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">← All properties</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div>
              <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted"><img src={p.images[img]} alt={p.title} className="h-full w-full object-cover" /></div>
              {p.images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {p.images.map((src, i) => (
                    <button key={src + i} onClick={() => setImg(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${i === img ? "border-primary" : "border-transparent opacity-70"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status={p.status} /><Badge variant="outline">{p.ref}</Badge><Badge variant="secondary">{p.category}</Badge><Badge variant="secondary">{p.transaction === "rent" ? "For Rent" : "For Sale"}</Badge></div>
              <h1 className="mt-3 text-3xl font-bold">{p.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{[area, loc].filter(Boolean).join(", ")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Spec icon={Ruler} k="Plot size" v={`${p.plots} plot${p.plots === 1 ? "" : "s"}`} />
                <Spec icon={Ruler} k="Dimensions" v={p.dimensions} />
                {p.bedrooms ? <Spec icon={BedDouble} k="Bedrooms" v={String(p.bedrooms)} /> : null}
                {p.bathrooms ? <Spec icon={Bath} k="Bathrooms" v={String(p.bathrooms)} /> : null}
                <Spec icon={Ruler} k="Approx. area" v={`${Math.round(p.plots * 464.5).toLocaleString()} m²`} />
              </div>
              {p.description && <p className="mt-5 leading-relaxed">{p.description}</p>}
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold">Title documents</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {TITLE_DOCS.map((d) => {
                  const has = p.titleDocs.includes(d);
                  return <span key={d} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${has ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground line-through opacity-60"}`}><FileCheck2 className="h-3.5 w-3.5" />{d}{has && " ✓"}</span>;
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border p-5">
              <h2 className="text-lg font-semibold">Land boundary & measurement</h2>
              {p.survey.number && (
                <div className="flex flex-wrap items-center gap-3 rounded-md bg-secondary p-3 text-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span><strong>Certified survey:</strong> {p.survey.number}</span>
                  {p.survey.area ? <span>· {p.survey.area.toLocaleString()} m²</span> : null}
                  {p.survey.authority && <span>· {p.survey.authority}</span>}
                  {p.survey.date && <span>· {p.survey.date}</span>}
                </div>
              )}
              {p.boundary.length >= 3 ? (
                <>
                  <CadastralDisclaimer />
                  <MapView points={p.boundary} height={360} />
                  <AreaSummary points={p.boundary} />
                </>
              ) : <p className="text-sm text-muted-foreground">Boundary map will be available after site survey. Contact us for the survey plan.</p>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="text-sm text-muted-foreground">{p.transaction === "rent" ? "Annual rent" : "Asking price"}</div>
                <div className="font-display text-3xl font-bold text-primary">{formatNaira(p.price)}</div>
                <div className="mt-4 grid gap-2">
                  <Button asChild size="lg"><a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> Enquire on WhatsApp</a></Button>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button size="lg" variant="outline"><CalendarCheck className="mr-1 h-4 w-4" /> Book Site Inspection</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Book a site inspection</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{p.title} · {p.ref}</p><EnquiryForm propertyId={p.id} type="inspection" defaultMessage={`I would like to inspect ${p.title} (Ref: ${p.ref}).`} onDone={() => setOpen(false)} /></DialogContent>
                  </Dialog>
                  <Button asChild variant="ghost"><a href={`tel:${COMPANY.phonesLocal[0]}`}><Phone className="mr-1 h-4 w-4" /> {COMPANY.phones[0]}</a></Button>
                </div>
              </div>
              {p.transaction === "sale" && p.status !== "Sold" && <InstallmentCalculator price={p.price} />}
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Spec({ icon: Icon, k, v }: { icon: typeof Ruler; k: string; v: string }) {
  return <div className="rounded-lg border p-3"><Icon className="h-4 w-4 text-primary" /><div className="mt-1 text-xs text-muted-foreground">{k}</div><div className="font-semibold">{v}</div></div>;
}
