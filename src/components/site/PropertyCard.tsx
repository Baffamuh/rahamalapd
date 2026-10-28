import { Link } from "@tanstack/react-router";
import { BedDouble, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/company";
import { useDb, zoneLabel } from "@/lib/store";
import type { Property, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function publicStatus(s: PropertyStatus) {
  return s === "Published" || s === "Private" ? "Available" : s;
}

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  const label = publicStatus(status);
  const cls =
    label === "Available" ? "bg-accent text-accent-foreground" :
    label === "Reserved" ? "bg-warning text-foreground" :
    label === "Sold" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground";
  return <Badge className={cn("border-0", cls, className)}>{label}</Badge>;
}

export function PropertyCard({ p }: { p: Property }) {
  const loc = useDb((d) => zoneLabel(d, p.zoneId, p.subZoneId));
  return (
    <Link to="/properties/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        <StatusBadge status={p.status} className="absolute left-3 top-3" />
        <Badge variant="secondary" className="absolute right-3 top-3">{p.transaction === "rent" ? "For Rent" : "For Sale"}</Badge>
      </div>
      <div className="space-y-2 p-4">
        <div className="text-xs font-medium text-muted-foreground">{p.ref} · {p.category}</div>
        <h3 className="line-clamp-1 font-display font-semibold">{p.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{loc}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-lg font-bold text-primary">{formatNaira(p.price)}{p.transaction === "rent" && <span className="text-xs font-normal text-muted-foreground"> /yr</span>}</span>
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            {p.bedrooms ? <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms}</span> : null}
            <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.plots} plot{p.plots === 1 ? "" : "s"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
