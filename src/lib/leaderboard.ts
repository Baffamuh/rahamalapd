import type { Agent, Sale } from "./types";

export type Criteria = "deals" | "volume";

export function leaderboard(agents: Agent[], sales: Sale[], year: string, criteria: Criteria) {
  const rows = agents.map((a) => {
    const mine = sales.filter((s) => s.agentId === a.id && (year === "all" || s.date.startsWith(year)));
    return { agent: a, deals: mine.length, volume: mine.reduce((t, s) => t + s.price, 0), commission: mine.reduce((t, s) => t + s.commission, 0), sales: mine };
  });
  rows.sort((x, y) =>
    criteria === "deals" ? y.deals - x.deals || y.volume - x.volume : y.volume - x.volume || y.deals - x.deals,
  );
  const key = (r: (typeof rows)[number]) => (criteria === "deals" ? r.deals : r.volume);
  return rows.map((r, i) => {
    const tied = rows.some((o, j) => j !== i && key(o) === key(r) && key(r) > 0);
    return { ...r, rank: i + 1, tied };
  });
}

export function saleBalance(s: Pick<Sale, "price" | "previouslyPaid" | "amountPaid">) {
  return Math.max(0, s.price - s.previouslyPaid - s.amountPaid);
}
