import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uid, updateDb } from "@/lib/store";

export function EnquiryForm({ propertyId = null, type = "enquiry", defaultMessage = "", onDone }: { propertyId?: string | null; type?: "enquiry" | "inspection"; defaultMessage?: string; onDone?: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", message: defaultMessage, date: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim() || (!f.phone.trim() && !f.email.trim())) { toast.error("Please add your name and a phone number or email."); return; }
        updateDb((d) => ({ ...d, enquiries: [{ id: uid(), name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), message: f.message.trim(), propertyId, type, preferredDate: f.date || undefined, status: "New", notes: "", createdAt: new Date().toISOString() }, ...d.enquiries] }), `New ${type === "inspection" ? "inspection booking" : "enquiry"} from ${f.name.trim()}`);
        toast.success(type === "inspection" ? "Inspection request sent. We'll call to confirm." : "Thank you! We'll be in touch shortly.");
        setF({ name: "", phone: "", email: "", message: defaultMessage, date: "" });
        onDone?.();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Full name</Label><Input value={f.name} onChange={set("name")} maxLength={100} /></div>
        <div><Label>Phone / WhatsApp</Label><Input value={f.phone} onChange={set("phone")} maxLength={20} /></div>
      </div>
      <div><Label>Email</Label><Input type="email" value={f.email} onChange={set("email")} maxLength={255} /></div>
      {type === "inspection" && <div><Label>Preferred inspection date</Label><Input type="date" value={f.date} onChange={set("date")} /></div>}
      <div><Label>Message</Label><Textarea rows={4} value={f.message} onChange={set("message")} maxLength={1000} /></div>
      <Button type="submit" className="w-full">{type === "inspection" ? "Book Site Inspection" : "Send Enquiry"}</Button>
    </form>
  );
}
