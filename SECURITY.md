# Security — Rahama Property Hub

## Architecture
- Public site and admin portal (TanStack Start). Data in Lovable Cloud (Postgres) with Row-Level Security on every table.
- Auth: Lovable Cloud Auth (bcrypt hashing, JWT sessions with expiry/refresh, leaked-password (HIBP) check on). Google sign-in via the managed broker.
- Roles live in `user_roles` (never on profiles); `has_role()` is SECURITY DEFINER with fixed search_path. Admin role is auto-granted only to the two company emails by trigger.

## Authorization
- Admin server functions (`getAdminDb`, `saveChanges`) require a valid bearer token (`requireSupabaseAuth`) and re-check the admin role server-side; RLS enforces it again in the database.
- Public reads: zones (intended), properties only with status Published/Reserved/Sold. Invite tokens are stripped from public responses; private listings need slug + token via `get_invite_property()`.
- Visitors may only INSERT enquiries with status `New`; they cannot read them.

## Input validation
- All server functions validate input with zod (types, lengths, email/phone/date formats, strict keys, max 1000 changes per save).
- React escapes output; no `dangerouslySetInnerHTML` on user content.
- Photo uploads: JPG/PNG/WEBP only, max 10 MB, re-encoded through canvas (strips embedded payloads). Pasted photo links must be `https://`.

## HTTP headers (src/server.ts)
HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors` self + Lovable editor), `Cache-Control: no-store` on JSON.

## Secrets
- Only the publishable key is in code (safe by design). The service-role key is never used in browser code. `.env` holds only public values.

## Backup & recovery
Lovable Cloud runs managed daily backups. Migrations in `drizzle/migrations` rebuild the schema.

## Testing
`bunx vitest run` (includes security rule tests in `src/test/security.test.ts`); Lovable security scan + dependency scan.

## Known limitations / outstanding risks
- No server-side rate limiting primitive yet (auth endpoints have provider-level limits only).
- MFA not enabled for admins.
- Strict script-src CSP not set (would break SSR hydration scripts); relies on React escaping.
- Upstream framework dependencies (TanStack/zod/seroval) have advisories pending upstream releases.
- Shared admin password `rahama2026` must be changed.
- Vercel: enable HTTPS-only + Deployment Protection for previews.
