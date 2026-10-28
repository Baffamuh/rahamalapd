<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All app data (zones, listings, agents, sales, enquiries) lives in a browser-local store (`src/lib/store.ts`, localStorage) seeded from `src/lib/seed.ts`; why: the zero-cost, no-backend requirement. Moving to a real database means replacing this module.
- Admin sign-in is a client-side single-tenant gate (`src/lib/auth.ts`); why: specified demo login — it is not real security.
- Maps use Leaflet + OpenStreetMap tiles, loaded only in the browser via `src/components/map/MapView.tsx`; why: Leaflet breaks during server rendering.
- Business rules (area maths, refs/receipt numbers, leaderboard, lead scoring) are pure functions in `src/lib/*` covered by `src/test/rules.test.ts`.
