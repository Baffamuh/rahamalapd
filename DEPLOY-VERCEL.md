# Deploying to Vercel

1. Push this project to GitHub (Lovable: Connect → GitHub).
2. In Vercel: Add New → Project → import the repo. Framework preset: **Other**.
   - Build command: `npm run build` (default)
   - Install command: default
3. Add these Environment Variables (copy values from the `.env` file):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL` (same as VITE_SUPABASE_URL)
   - `SUPABASE_PUBLISHABLE_KEY` (same as VITE_SUPABASE_PUBLISHABLE_KEY)
4. Deploy. The build automatically outputs Vercel functions when running on Vercel.
