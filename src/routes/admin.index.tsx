import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Inbox, MapPin, Plus, Printer, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/company";
import { useDbAll } from "@/lib/store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const db = useDbAll();
  const active = db.properties.filter((p) => p.status === "Published" || p.status === "Reserved");
  const valuation = active.filter((p) => p.transaction === "sale").reduce((s, p) => s + p.price, 0);
  const pending = db.enquiries.filter((e) => e.status === "New" || e.status === "Contacted").length;
  const year = new Date().getFullYear();
  const salesYear = db.sales.filter((s) => s.date.startsWith(String(year))).reduce((a, s) => a + s.price, 0);
  const cards = [
    [Wallet, "Active inventory value", formatNaira(valuation)],
    [Building2, "Available listings", String(db.properties.filter((p) => p.status === "Published").length)],
    [Inbox, "Pending enquiries", String(pending)],
    [TrendingUp, `Sales volume ${year}`, formatNaira(salesYear)],
  ] as const;
  const recentSales = db.sales.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const statusCounts = (["Published", "Reserved", "Sold", "Draft"] as const).map((s) => [s, db.properties.filter((p) => p.status === s).length] as const);
  const total = db.properties.length || 1;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0"><h1 className="truncate text-2xl font-bold sm:text-3xl">Dashboard</h1><p className="text-sm text-muted-foreground">Overview of listings, enquiries and sales.</p></div>
        <Button asChild size="sm"><Link to="/admin/properties"><Plus className="mr-1 h-4 w-4" />Listing</Link></Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(([I, k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10"><I className="h-5 w-5 text-primary" /></div>
            <div className="mt-3 text-xs text-muted-foreground sm:text-sm">{k}</div>
            <div className="truncate font-display text-lg font-bold sm:text-2xl">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([["/admin/properties", Building2, "Manage listings"], ["/admin/agents", Receipt, "Record a sale"], ["/admin/enquiries", Inbox, "Reply to enquiries"], ["/admin/locations", MapPin, "Edit locations"]] as const).map(([to, I, label]) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium shadow-sm transition hover:border-primary hover:shadow-md"><I className="h-5 w-5 shrink-0 text-primary" />{label}</Link>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Inventory by status</h2>
          <ul className="mt-4 space-y-3">{statusCounts.map(([s, c]) => (
            <li key={s} className="text-sm"><div className="flex justify-between"><span>{s}</span><span className="font-medium">{c}</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(c / total) * 100}%` }} /></div></li>
          ))}</ul>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Recent sales</h2><Button asChild size="sm" variant="ghost"><Link to="/admin/agents">View all</Link></Button></div>
          {recentSales.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No sales recorded yet.</p> : (
            <ul className="mt-2 divide-y">{recentSales.map((s) => {
              const p = db.properties.find((x) => x.id === s.propertyId);
              return <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><div className="min-w-0"><div className="truncate font-medium">{s.buyerName}</div><div className="truncate text-xs text-muted-foreground">{p?.ref} · {s.date}</div></div><div className="flex shrink-0 items-center gap-2"><span className="font-semibold">{formatNaira(s.price)}</span><Button asChild size="icon" variant="ghost"><Link to="/admin/receipt/$id" params={{ id: s.id }} aria-label="Receipt"><Printer className="h-4 w-4" /></Link></Button></div></li>;
            })}</ul>
          )}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Latest enquiries</h2><Button asChild size="sm" variant="ghost"><Link to="/admin/enquiries">View all</Link></Button></div>
          <ul className="mt-2 divide-y">{db.enquiries.slice(0, 5).map((e) => <li key={e.id} className="py-2.5 text-sm"><div className="flex items-center justify-between gap-2"><span className="truncate font-medium">{e.name}</span><span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px]">{e.status}</span></div><div className="line-clamp-1 text-muted-foreground">{e.message}</div></li>)}</ul>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-3">{db.activity.slice(0, 8).map((a) => <li key={a.id} className="flex gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><div className="truncate">{a.text}</div><div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("en-NG")}</div></div></li>)}</ul>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Data is saved securely online and shared across all staff devices.</p>
    </div>
  );
}
