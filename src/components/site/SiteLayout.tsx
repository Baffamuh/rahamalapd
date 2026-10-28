import { Link } from "@tanstack/react-router";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY, waLink } from "@/lib/company";
import emblemAsset from "@/assets/rahama-emblem.png.asset.json";
import logoAsset from "@/assets/rahama-logo.png.asset.json";

/** Falls back to the locally bundled emblem (/favicon.png) if the CDN image can't load. */
function fallback(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.dataset['fallback']) { img.dataset['fallback'] = "1"; img.src = "/favicon.png"; }
}

export function Emblem({ className = "h-9 w-9", framed = false }: { className?: string; framed?: boolean }) {
  const img = <img src={emblemAsset.url} onError={fallback} alt="Rahama Land and Property logo" className={`${framed ? "h-full w-full" : className} object-contain`} />;
  if (!framed) return img;
  return <span className={`${className} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card p-0.5 shadow-sm`}>{img}</span>;
}

export function BrandLogo({ className = "h-24" }: { className?: string }) {
  return <img src={logoAsset.url} onError={fallback} alt="Rahama Land and Property — RC NO. 9871926" className={`${className} w-auto object-contain`} />;
}

const NAV = [
  { to: "/properties", label: "Properties" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Emblem />
            <div className="leading-tight">
              <div className="font-display text-base font-bold text-primary">Rahama Property</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Land & Development · Azare</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                {n.label}
              </Link>
            ))}
            <Button asChild size="sm">
              <a href={waLink("Hello Rahama Property, I would like to make an enquiry.")} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="no-print bg-primary-deep text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2"><Emblem /><span className="font-display font-bold">{COMPANY.name}</span></div>
            <p className="mt-3 max-w-md text-sm opacity-80">Verified land, homes and commercial property across Azare and Bauchi. Registered with the CAC — {COMPANY.rc}.</p>
          </div>
          <div className="space-y-2 text-sm opacity-90">
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{COMPANY.address}</p>
            {COMPANY.phones.map((p) => <p key={p} className="flex gap-2"><Phone className="h-4 w-4" />{p}</p>)}
            <p className="flex gap-2"><Mail className="h-4 w-4" />{COMPANY.email}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link>)}
            <Link to="/privacy" className="opacity-80 hover:opacity-100">Privacy & Disclaimer</Link>
            <Link to="/admin" className="opacity-60 hover:opacity-100">Staff sign-in</Link>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 py-4 text-center text-xs opacity-60">© 2026 {COMPANY.name} · {COMPANY.rc}</div>
      </footer>
      <a
        href={waLink("Hello Rahama Property, I would like to make an enquiry.")}
        target="_blank" rel="noreferrer"
        className="no-print fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
