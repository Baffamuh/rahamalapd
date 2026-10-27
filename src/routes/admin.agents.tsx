import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Printer, Receipt, Trophy, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/company";
import { leaderboard, saleBalance, type Criteria } from "@/lib/leaderboard";
import { nextAgentCode, nextReceipt, uid, updateDb, useDbAll } from "@/lib/store";
import { PAYMENT_METHODS, type Agent, type PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/admin/agents")({ component: AgentsPage });
const sel = "h-9 w-full rounded-md border bg-background px-2 text-sm";

function AgentsPage() {
  const db = useDbAll();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [criteria, setCriteria] = useState<Criteria>("deals");
  const [agentEdit, setAgentEdit] = useState<Agent | null>(null);
  const [saleOpen, setSaleOpen] = useState(false);
  const board = leaderboard(db.agents, db.sales, year, criteria);
  const top = board[0] && (board[0].deals > 0) ? board[0] : null;
  const years = Array.from(new Set([String(new Date().getFullYear()), "2025", ...db.sales.map((s) => s.date.slice(0, 4))])).sort().reverse();
  const allTime = leaderboard(db.agents, db.sales, "all", "volume");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Agents & Sales</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAgentEdit({ id: "", code: "", name: "", phone: "", whatsapp: "", email: "", zoneId: db.zones[0]?.id ?? "", active: true })}><Plus className="mr-1 h-4 w-4" /> Register agent</Button>
          <Button onClick={() => setSaleOpen(true)}><Receipt className="mr-1 h-4 w-4" /> Record sale</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} k="Active agents" v={String(db.agents.filter((a) => a.active).length)} />
        <Stat icon={Trophy} k="Top performer (all time)" v={allTime[0]?.volume ? allTime[0].agent.name : "—"} />
        <Stat icon={Wallet} k="Total sales volume" v={formatNaira(db.sales.reduce((t, s) => t + s.price, 0))} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Best-Seller Leaderboard</h2>
          <div className="flex flex-wrap gap-2">
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>{years.map((y) => <option key={y} value={y}>{y}</option>)}<option value="all">All Time</option></select>
            <div className="flex rounded-md border p-0.5 text-sm">
              {([["deals", "Completed deals"], ["volume", "Sales volume (₦)"]] as const).map(([v, l]) => <button key={v} onClick={() => setCriteria(v)} className={`rounded px-3 py-1 ${criteria === v ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>)}
            </div>
          </div>
        </div>
        {top ? (
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-hero p-5 text-primary-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground"><Trophy className="h-8 w-8" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-accent">Top Seller of {year === "all" ? "All Time" : `the Year ${year}`}{top.tied && " · tie"}</div>
              <div className="font-display text-2xl font-bold">{top.agent.name}</div>
              <div className="text-sm opacity-90">{top.agent.code} · {top.deals} deal{top.deals === 1 ? "" : "s"} · {formatNaira(top.volume)}</div>
            </div>
          </div>
        ) : <p className="mt-4 text-sm text-muted-foreground">No sales recorded for this period yet.</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">#</th><th className="p-2">Agent</th><th className="p-2">Deals</th><th className="p-2">Volume</th><th className="p-2">Commission</th><th className="p-2">Deal history</th></tr></thead>
            <tbody>{board.map((r) => (
              <tr key={r.agent.id} className="border-t align-top">
                <td className="p-2 font-bold">{r.rank}{r.tied && <Badge variant="outline" className="ml-1 text-[10px]">tie</Badge>}</td>
                <td className="p-2"><div className="font-medium">{r.agent.name}</div><div className="text-xs text-muted-foreground">{r.agent.code}</div></td>
                <td className="p-2">{r.deals}</td><td className="p-2">{formatNaira(r.volume)}</td><td className="p-2">{formatNaira(r.commission)}</td>
                <td className="p-2 text-xs text-muted-foreground">{r.sales.map((s) => db.properties.find((p) => p.id === s.propertyId)?.ref ?? "—").join(", ") || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Agent directory</h2>
        <div className="mt-3 overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Email</th><th className="p-2">Zone</th><th className="p-2">Active</th><th /></tr></thead>
          <tbody>{db.agents.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2 font-mono text-xs">{a.code}</td><td className="p-2 font-medium">{a.name}</td><td className="p-2">{a.phone}</td><td className="p-2">{a.email}</td>
              <td className="p-2">{db.zones.find((z) => z.id === a.zoneId)?.name}</td>
              <td className="p-2"><Switch checked={a.active} onCheckedChange={(v) => updateDb((d) => ({ ...d, agents: d.agents.map((x) => x.id === a.id ? { ...x, active: v } : x) }))} /></td>
              <td className="p-2"><Button size="sm" variant="ghost" onClick={() => setAgentEdit(a)}>Edit</Button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Sales history</h2>
        <div className="mt-3 overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">Receipt</th><th className="p-2">Date</th><th className="p-2">Property</th><th className="p-2">Buyer</th><th className="p-2">Price</th><th className="p-2">Balance</th><th className="p-2">Agent</th><th /></tr></thead>
          <tbody>{[...db.sales].sort((a, b) => b.date.localeCompare(a.date)).map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2 font-mono text-xs">{s.receiptNo}</td><td className="p-2">{s.date.slice(0, 10)}</td>
              <td className="p-2">{db.properties.find((p) => p.id === s.propertyId)?.title ?? "—"}</td><td className="p-2">{s.buyerName}</td>
              <td className="p-2">{formatNaira(s.price)}</td><td className="p-2">{formatNaira(saleBalance(s))}</td>
              <td className="p-2">{db.agents.find((a) => a.id === s.agentId)?.name}</td>
              <td className="p-2"><Button size="sm" variant="outline" asChild><Link to="/admin/receipt/$id" params={{ id: s.id }}><Printer className="mr-1 h-3 w-3" /> Receipt</Link></Button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>

      <Dialog open={!!agentEdit} onOpenChange={(o) => !o && setAgentEdit(null)}>
        <DialogContent><DialogHeader><DialogTitle>{agentEdit?.id ? "Edit agent" : "Register agent"}</DialogTitle></DialogHeader>{agentEdit && <AgentForm initial={agentEdit} onDone={() => setAgentEdit(null)} />}</DialogContent>
      </Dialog>
      <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Record a sale</DialogTitle></DialogHeader><SaleForm onDone={() => setSaleOpen(false)} /></DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ icon: I, k, v }: { icon: typeof Users; k: string; v: string }) {
  return <div className="rounded-xl border bg-card p-5"><I className="h-5 w-5 text-primary" /><div className="mt-2 text-sm text-muted-foreground">{k}</div><div className="font-display text-xl font-bold">{v}</div></div>;
}

function AgentForm({ initial, onDone }: { initial: Agent; onDone: () => void }) {
  const db = useDbAll();
  const [f, setF] = useState(initial);
  const set = (k: keyof Agent) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault();
      if (!f.name.trim() || !f.phone.trim()) { toast.error("Name and phone are required"); return; }
      updateDb((d) => f.id ? { ...d, agents: d.agents.map((a) => a.id === f.id ? f : a) } : { ...d, agents: [...d.agents, { ...f, id: uid(), code: nextAgentCode(d) }] }, `Agent ${f.id ? "updated" : "registered"}: ${f.name}`);
      onDone();
    }}>
      <div><Label>Full name</Label><Input value={f.name} onChange={set("name")} /></div>
      <div className="grid grid-cols-2 gap-3"><div><Label>Phone</Label><Input value={f.phone} onChange={set("phone")} /></div><div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={set("whatsapp")} /></div></div>
      <div><Label>Email</Label><Input type="email" value={f.email} onChange={set("email")} /></div>
      <div><Label>Assigned zone</Label><select className={sel} value={f.zoneId} onChange={set("zoneId")}>{db.zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div>
      <label className="flex items-center gap-2 text-sm"><Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} /> Active</label>
      <Button type="submit" className="w-full">Save agent</Button>
    </form>
  );
}

function SaleForm({ onDone }: { onDone: () => void }) {
  const db = useDbAll();
  const sellable = db.properties.filter((p) => p.status !== "Sold" && p.status !== "Archived");
  const [f, setF] = useState({ propertyId: sellable[0]?.id ?? "", agentId: db.agents.find((a) => a.active)?.id ?? "", buyerName: "", buyerPhone: "", price: sellable[0]?.price ?? 0, previouslyPaid: 0, amountPaid: 0, method: "Bank Transfer" as PaymentMethod, commission: 0 });
  const num = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: Number(e.target.value) || 0 });
  const balance = saleBalance(f);
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault();
      if (!f.propertyId || !f.agentId || !f.buyerName.trim() || f.price <= 0) { toast.error("Property, agent, buyer name and price are required"); return; }
      const id = uid();
      const prop = db.properties.find((p) => p.id === f.propertyId)!;
      updateDb((d) => ({
        ...d,
        properties: d.properties.map((p) => p.id === f.propertyId ? { ...p, status: "Sold" } : p),
        sales: [...d.sales, { ...f, id, buyerName: f.buyerName.trim(), receiptNo: nextReceipt(d, new Date().getFullYear()), date: new Date().toISOString() }],
      }), `Sale recorded: ${prop.title} → ${f.buyerName.trim()}`);
      toast.success("Sale recorded — property marked Sold");
      onDone();
      window.location.assign(`/admin/receipt/${id}`);
    }}>
      <div><Label>Property</Label><select className={sel} value={f.propertyId} onChange={(e) => setF({ ...f, propertyId: e.target.value, price: db.properties.find((p) => p.id === e.target.value)?.price ?? 0 })}>{sellable.map((p) => <option key={p.id} value={p.id}>{p.ref} — {p.title}</option>)}</select></div>
      <div><Label>Responsible agent</Label><select className={sel} value={f.agentId} onChange={(e) => setF({ ...f, agentId: e.target.value })}>{db.agents.filter((a) => a.active).map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}</select></div>
      <div className="grid grid-cols-2 gap-3"><div><Label>Buyer name</Label><Input value={f.buyerName} onChange={(e) => setF({ ...f, buyerName: e.target.value })} /></div><div><Label>Buyer phone</Label><Input value={f.buyerPhone} onChange={(e) => setF({ ...f, buyerPhone: e.target.value })} /></div></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Agreed sale price (₦)</Label><Input type="number" value={f.price || ""} onChange={num("price")} /></div>
        <div><Label>Previously paid (₦)</Label><Input type="number" value={f.previouslyPaid || ""} onChange={num("previouslyPaid")} /></div>
        <div><Label>Amount paid now (₦)</Label><Input type="number" value={f.amountPaid || ""} onChange={num("amountPaid")} /></div>
        <div><Label>Agent commission (₦)</Label><Input type="number" value={f.commission || ""} onChange={num("commission")} /></div>
      </div>
      <div><Label>Payment method</Label><select className={sel} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value as PaymentMethod })}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
      <div className="rounded-md bg-muted p-3 text-sm"><div className="flex justify-between"><span>Balance remaining</span><strong>{formatNaira(balance)}</strong></div></div>
      <Button type="submit" className="w-full">Record sale & open receipt</Button>
    </form>
  );
}
