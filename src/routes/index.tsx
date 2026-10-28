import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Building2, FileCheck2, Globe2, Home, MapPinned, MessageCircle, Search, ShieldCheck, Video, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { COMPANY, waLink } from "@/lib/company";
import { useDbAll } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import hero from "@/assets/hero-azare.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rahama Property Hub — Verified Land & Homes in Azare, Bauchi" },
      { name: "description", content: "Buy verified plots, houses, farms and shops in Azare and Bauchi with C-of-O documentation, site inspections and installment plans." },
      { property: "og:title", content: "Rahama Property Hub — Verified Land & Homes in Azare" },
      { property: "og:description", content: "Verified plots, houses and commercial property across Azare and Bauchi State." },
    ],
  }),
  component: HomePage,
});

const BUDGETS = [
  { v: "any", l: "Any budget" },
  { v: "0-5000000", l: "Up to ₦5M" },
  { v: "5000000-15000000", l: "₦5M – ₦15M" },
  { v: "15000000-40000000", l: "₦15M – ₦40M" },
  { v: "40000000-999999999999", l: "₦40M+" },
];

function HomePage() {
  const db = useDbAll();
  const navigate = useNavigate();
  const [cat, setCat] = useState("any");
  const [zone, setZone] = useState("any");
  const [budget, setBudget] = useState("any");
  const featured = db.properties.filter((p) => p.featured && p.status !== "Draft" && p.status !== "Archived").slice(0, 6);
  const sold = db.properties.filter((p) => p.status === "Sold").length + db.sales.length;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <img src={hero} alt="Surveyed residential plots in Azare" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><BadgeCheck className="h-3.5 w-3.5" /> CAC Registered · {COMPANY.rc}</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Own verified land in Azare & Bauchi — with papers you can trust.</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Surveyed plots, family homes and commercial frontage, sold with genuine title documents and flexible installment plans.</p>
          <form
            className="mt-8 grid gap-2 rounded-xl bg-card p-3 text-card-foreground shadow-xl md:grid-cols-[1fr_1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const [min, max] = budget === "any" ? [undefined, undefined] : budget.split("-").map(Number);
              navigate({ to: "/properties", search: { category: cat === "any" ? undefined : cat, zone: zone === "any" ? undefined : zone, min, max } });
            }}
          >
            <Select value={cat} onValueChange={setCat}><SelectTrigger><SelectValue placeholder="Property type" /></SelectTrigger><SelectContent><SelectItem value="any">All property types</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select value={zone} onValueChange={setZone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">All zones</SelectItem>{db.zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select>
            <Select value={budget} onValueChange={setBudget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BUDGETS.map((b) => <SelectItem key={b.v} value={b.v}>{b.l}</SelectItem>)}</SelectContent></Select>
            <Button type="submit"><Search className="mr-1 h-4 w-4" /> Search</Button>
          </form>
        </div>
      </section>

      <section className="border-b bg-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            [FileCheck2, "100%", "Verified title deeds"],
            [MapPinned, `${120 + sold}+`, "Plots delivered"],
            [Building2, "6", "Zones covered"],
            [ShieldCheck, "RC 9871926", "CAC registration"],
          ].map(([Icon, v, l]) => {
            const I = Icon as typeof FileCheck2;
            return (
              <div key={l as string} className="flex items-center gap-3">
                <I className="h-8 w-8 text-primary" />
                <div><div className="font-display text-xl font-bold">{v as string}</div><div className="text-sm text-muted-foreground">{l as string}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div><h2 className="text-3xl font-bold">Featured properties</h2><p className="mt-1 text-muted-foreground">Hand-picked listings with verified documentation.</p></div>
          <Button asChild variant="outline"><Link to="/properties">View all</Link></Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold">What we do</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              [MapPinned, "Land Sales", "Residential, commercial and farm plots in surveyed layouts."],
              [Home, "Property Development", "We design and build homes on your plot or ours."],
              [FileCheck2, "Title Documentation", "C-of-O, R-of-O, survey plans and deeds processed for you."],
              [Search, "Site Inspections", "Guided visits any day of the week, in person or by video."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Home;
              return <div key={t as string} className="rounded-xl border bg-card p-5"><I className="h-7 w-7 text-primary" /><h3 className="mt-3 font-semibold">{t as string}</h3><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></div>;
            })}
          </div>
          <div className="mt-6"><Button asChild variant="outline"><Link to="/services">Explore services</Link></Button></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold">How you buy land with Rahama</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Inspect", "Visit the plot with our agent, or request a live video walk-through."],
            ["Verify", "Review the C-of-O, survey plan and beacon numbers with your lawyer."],
            ["Pay securely", "Pay into our corporate account only — outright or in installments."],
            ["Receive title deeds", "Get your official receipt, deed of assignment and documents."],
          ].map(([t, d], i) => (
            <div key={t} className="relative rounded-xl border p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display font-bold text-accent-foreground">{i + 1}</div>
              <h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent"><Globe2 className="h-4 w-4" /> For Nigerians abroad</span>
            <h2 className="mt-2 text-3xl font-bold">Buying from the diaspora? We make it safe.</h2>
            <p className="mt-3 opacity-90">Own property back home without flying in. We handle inspections, documentation and handover while you watch every step.</p>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={waLink("Hello Rahama Property, I am a diaspora buyer and would like a remote inspection.")} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> Chat with us on WhatsApp</a>
            </Button>
          </div>
          <div className="grid gap-3">
            {[[Video, "Live video walk-throughs", "Inspect the plot and beacons on a WhatsApp video call."], [FileCheck2, "Verified legal documents", "Scanned C-of-O and survey plans sent before you pay."], [Wallet, "Corporate account payments", "Pay only into the company account — with official receipts."]].map(([Icon, t, d]) => {
              const I = Icon as typeof Video;
              return <div key={t as string} className="flex gap-3 rounded-xl bg-primary-foreground/10 p-4"><I className="h-6 w-6 shrink-0 text-accent" /><div><div className="font-semibold">{t as string}</div><div className="text-sm opacity-80">{d as string}</div></div></div>;
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
