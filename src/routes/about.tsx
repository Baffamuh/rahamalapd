import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rahama Land and Property Development Ltd. | Azare" },
      { name: "description", content: "Our mission, leadership and CAC registration (RC NO. 9871926). Based on Old Kano Road, Azare." },
      { property: "og:title", content: "About Rahama Property" },
      { property: "og:description", content: "A registered Azare-based land and property company, RC NO. 9871926." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="bg-secondary"><div className="mx-auto max-w-4xl px-4 py-16"><h1 className="text-4xl font-bold">About us</h1><p className="mt-3 text-lg text-muted-foreground">{COMPANY.name} helps families, investors and Nigerians abroad own genuine, well-documented property in Azare and across Bauchi State.</p></div></section>
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-14">
        <div><h2 className="text-2xl font-bold">Our mission</h2><p className="mt-2 text-muted-foreground">To make land ownership in northern Nigeria safe, transparent and affordable — every plot surveyed, every payment receipted, every title verified.</p></div>
        <div>
          <h2 className="text-2xl font-bold">Leadership</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[["Managing Director", "Oversees land acquisition, development and client relations."], ["Company Secretary / Legal Adviser", "Leads title verification, deeds and regulatory compliance."]].map(([r, d]) => (
              <div key={r} className="rounded-xl border p-5"><div className="font-semibold">{r}</div><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 rounded-xl border-2 border-primary p-6">
          <BadgeCheck className="h-10 w-10 shrink-0 text-primary" />
          <div><h2 className="text-xl font-bold">Registered & accountable</h2><p className="mt-1 text-muted-foreground">Incorporated with the Corporate Affairs Commission — <strong>{COMPANY.rc}</strong>. Head office: {COMPANY.address}.</p></div>
        </div>
      </div>
    </SiteLayout>
  ),
});
