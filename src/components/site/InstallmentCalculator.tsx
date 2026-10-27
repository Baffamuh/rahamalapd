import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatNaira } from "@/lib/company";
import { cn } from "@/lib/utils";

export function installmentPlan(price: number, downPct: number, months: number) {
  const down = Math.round((price * downPct) / 100);
  const monthly = months > 0 ? Math.round((price - down) / months) : 0;
  return { down, balance: price - down, monthly };
}

export function InstallmentCalculator({ price }: { price: number }) {
  const [pct, setPct] = useState(30);
  const [months, setMonths] = useState(6);
  const plan = installmentPlan(price, pct, months);
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <h3 className="font-display font-semibold">Installment Calculator</h3>
      <div>
        <div className="mb-2 flex justify-between text-sm"><span>Down payment</span><strong>{pct}% · {formatNaira(plan.down)}</strong></div>
        <Slider min={10} max={90} step={5} value={[pct]} onValueChange={(v) => setPct(v[0])} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[3, 6, 12].map((m) => (
          <button key={m} onClick={() => setMonths(m)} className={cn("rounded-md border py-2 text-sm font-medium", months === m ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>
            {m} months
          </button>
        ))}
      </div>
      <div className="rounded-md bg-muted p-3 text-sm">
        <div className="flex justify-between"><span>Balance</span><span>{formatNaira(plan.balance)}</span></div>
        <div className="mt-1 flex justify-between font-semibold"><span>Monthly × {months}</span><span className="text-primary">{formatNaira(plan.monthly)}</span></div>
      </div>
    </div>
  );
}
