import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { publicDbOptions } from "@/lib/cloud-query";
import type { Property } from "@/lib/types";

// Short link: /p/AZR-SHFC-001 (reference code without "RHM-") opens the property page.
export const shortCode = (ref: string) => ref.replace(/^RHM-/i, "");

export const Route = createFileRoute("/p/$code")({
  head: () => ({ meta: [{ title: "Opening property | Rahama Property" }, { name: "description", content: "Short link to a Rahama Property listing." }, { property: "og:title", content: "Rahama Property listing" }, { property: "og:description", content: "Short link to a Rahama Property listing." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: async ({ params, context }) => {
    const db = await context.queryClient.ensureQueryData(publicDbOptions()).catch(() => null);
    const c = params.code.toUpperCase();
    const p = db?.properties.find((x: Property) => x.status !== "Private" && (shortCode(x.ref).toUpperCase() === c || x.ref.toUpperCase() === c));
    if (!p) throw notFound();
    throw redirect({ to: "/properties/$slug", params: { slug: p.slug } });
  },
  component: () => null,
});
