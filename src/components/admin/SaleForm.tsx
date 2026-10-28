import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/company";
import { saleBalance } from "@/lib/leaderboard";
import { nextReceipt, uid, updateDb, useDbAll } from "@/lib/store";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";

const sel = "h-9 w-full rounded-md border bg-background px-2 text-sm";

export function SaleForm({ onDone, propertyId }: { onDone: () => void; propertyId?: string }) {
  const db = useDbAll();
  const navigate = useNavigate();
  const sellable = db.properties.filter((p) => p.status !== "Sold" && p.status !== "Archived");
  const start = sellable.find((p) => p.id === propertyId) ?? sellable[0];
  const [f, setF] = useState({ propertyId: start?.id ?? "", agentId: db.agents.find((a) => a.active)?.id ?? "", buyerName: "", buyerPhone: "", price: start?.price ?? 0, previouslyPaid: 0, amountPaid: 0, method: "Bank Transfer" as PaymentMethod, commission: 0 });
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
      navigate({ to: "/admin/receipt/$id", params: { id } });
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
