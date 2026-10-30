import { queryOptions } from '@tanstack/react-query';
import { getPublicDb, getAdminDb } from './cloud.functions';

export const publicDbOptions = (slug?: string, invite?: string) => queryOptions({
  queryKey: ['public-db', slug ?? '', invite ?? ''],
  queryFn: () => getPublicDb({ data: { ...(slug ? { slug } : {}), ...(invite ? { invite } : {}) } }),
  staleTime: 30_000,
});
export const adminDbOptions = queryOptions({ queryKey: ['admin-db'], queryFn: () => getAdminDb(), staleTime: 0 });