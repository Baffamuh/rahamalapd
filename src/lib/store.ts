import { createContext, useContext } from "react";
import { useSuspenseQuery, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminDbOptions, publicDbOptions } from './cloud-query';
import { saveChanges } from './cloud.functions';
import { changesBetween } from './cloud-diff';
import type { DB } from "./types";

export const DbScope = createContext<{ admin?: boolean; slug?: string; invite?: string }>({});
let browserClient: QueryClient | undefined;
let queue: Promise<unknown> = Promise.resolve();
export function connectStore(client: QueryClient) { browserClient = client; }

/** Persist atomically; do not report success until the cloud confirms the change. */
export function updateDb(fn: (d: DB) => DB, activity?: string): Promise<boolean> {
  const run = async () => {
    const client = browserClient;
    if (!client) return false;
    try {
      const prev = client.getQueryData<DB>(adminDbOptions.queryKey);
      if (!prev) throw new Error('Open the staff portal before saving.');
      let next = fn(prev);
      if (activity) next = { ...next, activity: [{ id: uid(), text: activity, at: new Date().toISOString() }, ...next.activity].slice(0,50) };
      const changes = changesBetween(prev, next);
      if (changes.length) await saveChanges({ data: changes });
      await client.invalidateQueries({ queryKey: adminDbOptions.queryKey });
      await client.invalidateQueries({ queryKey: ['public-db'] });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Not saved. Check your connection and try again.');
      await client.invalidateQueries({ queryKey: adminDbOptions.queryKey });
      return false;
    }
  };
  const result = queue.then(run, run);
  queue = result;
  return result;
}

export function uid() {
  return crypto.randomUUID();
}

export function useDb<T>(select: (d: DB) => T): T {
  const scope = useContext(DbScope);
  const { data } = useSuspenseQuery(scope.admin ? adminDbOptions : publicDbOptions(scope.slug, scope.invite));
  return select(data);
}

export function useDbAll(): DB {
  return useDb((d) => d);
}

// helpers
export function zoneLabel(d: DB, zoneId: string, subZoneId?: string) {
  const z = d.zones.find((x) => x.id === zoneId);
  const s = z?.subZones.find((x) => x.id === subZoneId);
  return [s?.name, z?.name].filter(Boolean).join(", ");
}

export function nextRef(d: DB, code: "AZR" | "BAU") {
  const nums = d.properties.filter((p) => p.ref.startsWith(`RHM-${code}-`)).map((p) => parseInt(p.ref.slice(-3)) || 0);
  return `RHM-${code}-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

export function nextReceipt(d: DB, year: number) {
  const nums = d.sales.filter((s) => s.receiptNo.startsWith(`RHM-RCP-${year}-`)).map((s) => parseInt(s.receiptNo.slice(-4)) || 0);
  return `RHM-RCP-${year}-${String(Math.max(0, ...nums) + 1).padStart(4, "0")}`;
}

export function nextAgentCode(d: DB) {
  const nums = d.agents.map((a) => parseInt(a.code.slice(-3)) || 0);
  return `RHM-AGT-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}
