import type { DB } from './types';
export function changesBetween(before: DB, after: DB) {
  return (Object.keys(before) as (keyof DB)[]).flatMap(table => {
    const oldRows = new Map(before[table].map(row => [row.id, row]));
    const newRows = new Map(after[table].map(row => [row.id, row]));
    return [...new Set([...oldRows.keys(), ...newRows.keys()])].flatMap(id => {
      const prev = oldRows.get(id) ?? null;
      const next = newRows.get(id) ?? null;
      return JSON.stringify(prev) === JSON.stringify(next) ? [] : [{ table, id, before: prev, after: next }];
    });
  });
}