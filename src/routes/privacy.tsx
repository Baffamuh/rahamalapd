import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Legal Disclaimer | Rahama Property" },
      { name: "description", content: "How Rahama Property handles your information, and important notes on listings and map measurements." },
      { property: "og:title", content: "Privacy & Disclaimer | Rahama Property" },
      { property: "og:description", content: "Privacy policy and legal disclaimer for Rahama Property Hub." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-14 leading-relaxed">
        <h1 className="text-4xl font-bold">Privacy & legal disclaimer</h1>
        <section><h2 className="text-xl font-semibold">Your information</h2><p className="mt-2 text-muted-foreground">Details you submit (name, phone, email, message) are used only to respond to your enquiry or inspection request. We do not sell or share your data with third parties.</p></section>
        <section><h2 className="text-xl font-semibold">Map measurements</h2><p className="mt-2 text-muted-foreground">Boundary maps and areas shown on this website are <strong>Estimated Map Boundary Calculations — for indicative planning only, not a certified cadastral survey</strong>. Always rely on the certified survey plan issued by a licensed surveyor or the Bauchi State Ministry of Lands.</p></section>
        <section><h2 className="text-xl font-semibold">Listings & prices</h2><p className="mt-2 text-muted-foreground">Prices and availability may change without notice. A property is only secured after payment into the company account and issue of an official receipt.</p></section>
        <section><h2 className="text-xl font-semibold">Contact</h2><p className="mt-2 text-muted-foreground">{COMPANY.name} ({COMPANY.rc}), {COMPANY.address}. {COMPANY.email}</p></section>
      </article>
    </SiteLayout>
  ),
});
