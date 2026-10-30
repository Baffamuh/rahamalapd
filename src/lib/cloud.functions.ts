import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import type { DB, Property } from './types';

// Public (publishable) connection details; safe to bundle. Used when hosting (e.g. Vercel) lacks env vars.
const FALLBACK_URL = 'https://c--b79d9f5a-c357-4fef-8641-06fba0048bce-prod.lovable.cloud';
const FALLBACK_KEY = 'sb_publishable_ab4jSfw9z8QW4pjGPW2tWQ_sGIayObW';
function cloudEnv() {
  const env = process.env;
  const url = env['SUPABASE_URL'] || env['VITE_SUPABASE_URL'] || FALLBACK_URL;
  const key = env['SUPABASE_PUBLISHABLE_KEY'] || env['VITE_SUPABASE_PUBLISHABLE_KEY'] || FALLBACK_KEY;
  return { url, key };
}

export const getPublicDb = createServerFn({ method: 'GET' })
  .inputValidator((input: { slug?: string; invite?: string } = {}) => z.object({ slug: z.string().max(200).optional(), invite: z.string().max(200).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { url, key } = cloudEnv();
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const [zones, properties] = await Promise.all([client.from('zones').select('data'), client.from('properties').select('data')]);
    if (zones.error || properties.error) {
      console.error('Public listings load failed', zones.error ?? properties.error);
      return { zones: [], properties: [], agents: [], sales: [], enquiries: [], activity: [] } as DB;
    }
    const db: DB = { zones: zones.data.map(r => r.data) as unknown as DB['zones'], properties: properties.data.map(r => r.data) as unknown as Property[], agents: [], sales: [], enquiries: [], activity: [] };
    // Never expose invitation secrets in public catalogue responses.
    db.properties = db.properties.map(({ inviteToken: _token, ...p }) => p);
    if (data.slug && data.invite) {
      const result = await client.rpc('get_invite_property', { _slug: data.slug, _token: data.invite });
      if (result.error) throw new Error('Could not open the invitation');
      if (result.data) {
        const { inviteToken: _token, ...p } = result.data as unknown as Property;
        db.properties.push(p);
      }
    }
    return db;
  });

export const getAdminDb = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Staff access required');
  const tables = ['zones','properties','agents','sales','enquiries','activity'] as const;
  const rows = await Promise.all(tables.map(async table => {
    const result = await context.supabase.from(table).select('data').order('created_at', { ascending: false });
    if (result.error) throw new Error(`Could not load ${table}`);
    return [table, result.data.map(r => r.data)] as const;
  }));
  return Object.fromEntries(rows) as unknown as DB;
});

export const saveChanges = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.array(z.object({ table: z.enum(['zones','properties','agents','sales','enquiries','activity']), id: z.string().min(1).max(100), before: z.record(z.unknown()).nullable(), after: z.record(z.unknown()).nullable() })).max(1000).parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc('apply_staff_changes', { _changes: data as unknown as Database['public']['Functions']['apply_staff_changes']['Args']['_changes'] });
    if (result.error) throw new Error(result.error.message);
    return true;
  });

export const sendEnquiry = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(100), phone: z.string().max(20), email: z.string().max(255), message: z.string().max(1000), propertyId: z.string().nullable(), type: z.enum(['enquiry','inspection']), preferredDate: z.string().optional() }).refine(e => e.phone.trim() || e.email.trim(), 'Phone or email required').parse(input))
  .handler(async ({ data }) => {
    const { url, key } = cloudEnv();
    const response = await fetch(`${url}/rest/v1/enquiries`, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: data.id, data: { ...data, status: 'New', notes: '', createdAt: new Date().toISOString() } }) });
    if (!response.ok) throw new Error('Your request was not sent. Please try again.');
    return true;
  });