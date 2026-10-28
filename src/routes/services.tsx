import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Home, MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Land Sales, Development & Title Documents | Rahama Property" },
      { name: "description", content: "Land sales, property development, title documentation and site inspections in Azare and Bauchi." },
      { property: "og:title", content: "Our Services | Rahama Property" },
      { property: "og:description", content: "Land sales, building, C-of-O processing and guided site inspections." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="bg-hero text-primary-foreground"><div className="mx-auto max-w-7xl px-4 py-16"><h1 className="text-4xl font-bold">Our services</h1><p className="mt-2 max-w-xl opacity-90">Everything you need to buy, build and own property safely in Bauchi State.</p></div></section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2">
        {[
          [MapPinned, "Land Sales", "Residential, commercial and farmland plots in planned layouts across six zones, each with beacons and survey plans. Standard plots are 50ft × 100ft."],
          [Home, "Property Development", "From design to keys: bungalows, duplexes, hostels and shops built with quality materials and transparent costing."],
          [FileCheck2, "Title Documentation", "We process and verify Certificates of Occupancy, Right of Occupancy, survey plans and deeds of assignment with the Bauchi State Ministry of Lands."],
          [Search, "Site Inspections", "Free guided inspections in Azare and Bauchi, plus live video walk-throughs for buyers outside Nigeria."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Home;
          return <div key={t as string} className="rounded-xl border p-6"><I className="h-8 w-8 text-primary" /><h2 className="mt-3 text-xl font-semibold">{t as string}</h2><p className="mt-2 text-muted-foreground">{d as string}</p></div>;
        })}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16"><Button asChild size="lg"><Link to="/contact">Talk to our team</Link></Button></div>
    </SiteLayout>
  ),
});
