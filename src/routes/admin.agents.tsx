import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { type Agent } from "@/lib/types";
import { SaleForm } from "@/components/admin/SaleForm";

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
