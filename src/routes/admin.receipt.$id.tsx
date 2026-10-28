import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, Emblem } from "@/components/site/SiteLayout";
import { COMPANY, formatNaira } from "@/lib/company";
import { saleBalance } from "@/lib/leaderboard";
import { useDbAll, zoneLabel } from "@/lib/store";

export const Route = createFileRoute("/admin/receipt/$id")({ component: ReceiptPage });

function ReceiptPage() {
  const { id } = Route.useParams();
  const db = useDbAll();
  const s = db.sales.find((x) => x.id === id);
  if (!s) return <div className="p-10 text-center">Receipt not found. <Link to="/admin/agents" className="underline">Back</Link></div>;
  const p = db.properties.find((x) => x.id === s.propertyId);
  const a = db.agents.find((x) => x.id === s.agentId);
  const rows: [string, string][] = [
    ["Total agreed price", formatNaira(s.price)],
    ["Amount previously paid", formatNaira(s.previouslyPaid)],
    ["Current payment received", formatNaira(s.amountPaid)],
    ["Outstanding balance", formatNaira(saleBalance(s))],
    ["Payment method", s.method],
  ];
  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link to="/admin/agents" className="text-sm text-muted-foreground hover:underline">← Back to sales</Link>
        <Button onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print / Save PDF</Button>
      </div>
      <div className="print-area relative mx-auto max-w-[210mm] overflow-hidden rounded-lg border bg-card p-10 text-card-foreground shadow-sm">
        <Emblem className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]" />
        <header className="relative flex items-center justify-between gap-6 border-b-4 border-primary pb-5">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-24" />
            <div>
              <div className="font-display text-lg font-bold text-primary">{COMPANY.name}</div>
              <div className="text-xs font-semibold">{COMPANY.rc}</div>
              <div className="mt-1 text-xs text-muted-foreground">{COMPANY.address}</div>
              <div className="text-xs text-muted-foreground">{COMPANY.phones.join(" · ")} · {COMPANY.email}</div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-base font-bold uppercase tracking-wide">Sales Invoice &amp; Official Receipt</div>
            <div className="mt-1 inline-block rounded bg-primary px-2 py-0.5 font-mono text-sm text-primary-foreground">{s.receiptNo}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(s.date).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" })}</div>
            <div className="mt-3 inline-block -rotate-6 rounded-md border-4 border-primary px-3 py-1 font-display text-lg font-extrabold tracking-widest text-primary">{saleBalance(s) <= 0 ? "PAID IN FULL" : "PAYMENT RECEIVED"}</div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div><h3 className="mb-1 text-xs font-bold uppercase text-muted-foreground">Received from</h3><div className="font-semibold">{s.buyerName}</div><div>{s.buyerPhone}</div></div>
          <div><h3 className="mb-1 text-xs font-bold uppercase text-muted-foreground">Handled by</h3><div className="font-semibold">{a?.name}</div><div>{a?.code}</div></div>
        </section>

        <section className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Property particulars</h3>
          <table className="w-full border text-sm"><tbody>
            {[["Reference code", p?.ref], ["Title", p?.title], ["Zone / Sub-zone", p ? zoneLabel(db, p.zoneId, p.subZoneId) : ""], ["Plot dimensions", p ? `${p.dimensions} (${p.plots} plot${p.plots === 1 ? "" : "s"})` : ""], ["Survey reference", p?.survey.number || "—"]].map(([k, v]) => (
              <tr key={k} className="border-b"><td className="w-1/3 bg-muted p-2 font-medium">{k}</td><td className="p-2">{v}</td></tr>
            ))}
          </tbody></table>
        </section>

        <section className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Payment ledger</h3>
          <table className="w-full border text-sm"><tbody>
            {rows.map(([k, v], i) => <tr key={k} className={`border-b ${i === 3 ? "font-bold" : ""}`}><td className="p-2">{k}</td><td className="p-2 text-right">{v}</td></tr>)}
          </tbody></table>
        </section>

        <section className="mt-16 grid grid-cols-2 gap-12 text-sm">
          {["Managing Director", "Company Secretary / Legal Adviser"].map((r) => (
            <div key={r}><div className="h-12 border-b border-foreground" /><div className="mt-1 font-semibold">{r}</div><div className="text-xs text-muted-foreground">Signature, name & date</div></div>
          ))}
        </section>
        <p className="mt-10 text-center text-[11px] text-muted-foreground">This receipt is valid only with official signatures. Payments are accepted into the company account only. Thank you for choosing Rahama Property.</p>
      </div>
    </div>
  );
}
