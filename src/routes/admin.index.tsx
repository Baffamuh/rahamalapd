import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Inbox, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/company";
import { resetDb, useDbAll } from "@/lib/store";

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Dashboard</h1></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([I, k, v]) => <div key={k} className="rounded-xl border bg-card p-5"><I className="h-5 w-5 text-primary" /><div className="mt-2 text-sm text-muted-foreground">{k}</div><div className="font-display text-2xl font-bold">{v}</div></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Latest enquiries</h2><Button asChild size="sm" variant="ghost"><Link to="/admin/enquiries">View all</Link></Button></div>
          <ul className="mt-3 divide-y">{db.enquiries.slice(0, 5).map((e) => <li key={e.id} className="py-2 text-sm"><div className="font-medium">{e.name} <span className="text-xs text-muted-foreground">· {e.status}</span></div><div className="line-clamp-1 text-muted-foreground">{e.message}</div></li>)}</ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-2">{db.activity.slice(0, 8).map((a) => <li key={a.id} className="text-sm"><span className="text-muted-foreground">{new Date(a.at).toLocaleString("en-NG")}</span> — {a.text}</li>)}</ul>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Data is stored in this browser. <button className="underline" onClick={() => { if (confirm("Reset all data to the sample set?")) resetDb(); }}>Reset sample data</button></p>
    </div>
  );
}
