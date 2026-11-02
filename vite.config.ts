// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // On Vercel builds (VERCEL env is set), output Vercel functions and send Google sign-in
  // (/~oauth/*) to the Lovable-hosted sign-in service, which Vercel does not have.
  ...(process.env["VERCEL"]
    ? {
        nitro: {
          preset: "vercel",
          // routeRules is a valid Nitro option missing from this config type.
          ...({ routeRules: { "/~oauth/**": { redirect: { to: "https://rahamalapd.lovable.app/~oauth/**", statusCode: 302 } } } } as object),
        },
      }
    : {}),
});
