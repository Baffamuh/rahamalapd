import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, MessageCircle, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { waLink } from "@/lib/company";
import { draftReply, scoreLead, type Tone } from "@/lib/leads";
import { updateDb, useDbAll } from "@/lib/store";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/enquiries")({ component: Enquiries });

const prioCls = { High: "bg-destructive text-destructive-foreground", Medium: "bg-warning text-foreground", Low: "bg-muted text-muted-foreground" };

function Enquiries() {
  const db = useDbAll();
  const [selId, setSelId] = useState<string | null>(db.enquiries[0]?.id ?? null);
  const [tone, setTone] = useState<Tone>("Formal");
  const [draft, setDraft] = useState<string | null>(null);
  const [filter, setFilter] = useState<EnquiryStatus | "All">("All");
  const list = db.enquiries.filter((e) => filter === "All" || e.status === filter);
  const sel = db.enquiries.find((e) => e.id === selId);
  const prop = sel?.propertyId ? db.properties.find((p) => p.id === sel.propertyId) : undefined;
  const score = sel ? scoreLead(sel) : null;
  const reply = draft ?? (sel ? draftReply(tone, sel.name, prop?.title, prop?.ref) : "");
  const update = (patch: Partial<typeof sel>, msg?: string) => sel && updateDb((d) => ({ ...d, enquiries: d.enquiries.map((e) => e.id === sel.id ? { ...e, ...patch } : e) }), msg);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <div className="flex flex-wrap gap-1">{(["All", ...ENQUIRY_STATUSES] as const).map((s) => <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>{s}</Button>)}</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-hidden rounded-xl border bg-card">
          {list.length === 0 && <p className="p-6 text-sm text-muted-foreground">No enquiries.</p>}
          {list.map((e) => {
            const s = scoreLead(e);
            return (
              <button key={e.id} onClick={() => { setSelId(e.id); setDraft(null); }} className={`block w-full border-b p-4 text-left hover:bg-muted ${e.id === selId ? "bg-muted" : ""}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{e.name}</span><Badge className={`border-0 ${prioCls[s.priority]}`}>{s.priority}</Badge></div>
                <div className="mt-0.5 text-xs text-muted-foreground">{e.type === "inspection" ? "Inspection booking" : "Enquiry"} · {e.status} · {new Date(e.createdAt).toLocaleDateString("en-NG")}</div>
                <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">{e.message}</div>
              </button>
            );
          })}
        </div>
        {sel && score && (
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><h2 className="text-lg font-semibold">{sel.name}</h2><div className="text-sm text-muted-foreground">{sel.phone} {sel.email && `· ${sel.email}`}</div>{prop && <div className="text-sm">Re: {prop.title} ({prop.ref})</div>}{sel.preferredDate && <div className="text-sm">Preferred inspection: {sel.preferredDate}</div>}</div>
              <select className="h-9 rounded-md border bg-background px-2 text-sm" value={sel.status} onChange={(e) => update({ status: e.target.value as EnquiryStatus }, `Enquiry ${sel.name} → ${e.target.value}`)}>{ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <blockquote className="rounded-md bg-muted p-3 text-sm">{sel.message || <em>No message</em>}</blockquote>

            <div className="rounded-lg border-2 border-accent p-4">
              <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Smart Lead Advisor <Badge className={`ml-auto border-0 ${prioCls[score.priority]}`}>{score.priority} priority</Badge></div>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{score.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <div className="mt-4 flex gap-1">{(["Formal", "Warm", "Hausa"] as Tone[]).map((t) => <Button key={t} size="sm" variant={tone === t ? "default" : "outline"} onClick={() => { setTone(t); setDraft(null); }}>{t === "Hausa" ? "Hausa courtesy" : t}</Button>)}</div>
              <Textarea className="mt-2" rows={7} value={reply} onChange={(e) => setDraft(e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" asChild disabled={!sel.phone}><a href={waLink(reply, sel.phone.replace(/^0/, "234"))} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> Reply on WhatsApp</a></Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(reply); toast.success("Reply copied"); }}><Copy className="mr-1 h-4 w-4" /> Copy reply</Button>
                <Button size="sm" variant="outline" onClick={() => { update({ notes: (sel.notes ? sel.notes + "\n\n" : "") + `[${new Date().toLocaleString("en-NG")}] ${reply}` }); toast.success("Saved to notes"); }}><Save className="mr-1 h-4 w-4" /> Save to notes</Button>
              </div>
            </div>
            <div><div className="mb-1 text-sm font-medium">Internal notes</div><Textarea rows={4} value={sel.notes} onChange={(e) => update({ notes: e.target.value })} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
