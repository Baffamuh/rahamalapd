import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { MapView } from "@/components/map/MapView";
import { COMPANY, waLink } from "@/lib/company";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Rahama Property — Azare Office, Phone & WhatsApp" },
      { name: "description", content: "Visit us at No. 12, Old Kano Road, Azare, call 08063784070 or chat on WhatsApp." },
      { property: "og:title", content: "Contact Rahama Property" },
      { property: "og:description", content: "Office address, phone numbers, email and enquiry form." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold">Contact us</h1>
          <p className="mt-2 text-muted-foreground">Send an enquiry and our team will reply within one working day.</p>
          <div className="mt-6 rounded-xl border p-5"><EnquiryForm /></div>
        </div>
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border p-5">
            <p className="flex gap-2"><MapPin className="h-5 w-5 text-primary" />{COMPANY.address}</p>
            {COMPANY.phones.map((p, i) => <a key={p} href={`tel:${COMPANY.phonesLocal[i]}`} className="flex gap-2 hover:underline"><Phone className="h-5 w-5 text-primary" />{p}</a>)}
            <a href={`mailto:${COMPANY.email}`} className="flex gap-2 hover:underline"><Mail className="h-5 w-5 text-primary" />{COMPANY.email}</a>
            <Button asChild><a href={waLink("Hello Rahama Property, I would like to make an enquiry.")} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> Chat on WhatsApp</a></Button>
          </div>
          <MapView points={[]} markers={[{ pos: COMPANY.center, label: "Rahama Property — Old Kano Road, Azare" }]} center={COMPANY.center} zoom={15} height={360} />
        </div>
      </div>
    </SiteLayout>
  ),
});
