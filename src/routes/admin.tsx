import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Home, Inbox, LogOut, Map, Menu, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo, Emblem } from "@/components/site/SiteLayout";
import { ADMIN_EMAIL, signIn, signOut, useSignedIn } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal | Rahama Property" },
      { name: "description", content: "Rahama Property back-office: listings, enquiries, agents and sales." },
      { property: "og:title", content: "Admin Portal | Rahama Property" },
      { property: "og:description", content: "Staff-only back office." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: Home, exact: true },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/agents", label: "Agents & Sales", icon: Users },
  { to: "/admin/locations", label: "Locations", icon: Map },
] as const;

function Login() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pw, setPw] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-xl" onSubmit={(e) => { e.preventDefault(); if (!signIn(email, pw)) toast.error("Incorrect email or password"); }}>
        <div className="flex flex-col items-center gap-2 text-center"><BrandLogo className="h-28" /><div className="text-xs uppercase tracking-widest text-muted-foreground">Staff sign-in</div></div>
        <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button type="submit" className="w-full">Sign in</Button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">← Back to website</Link>
      </form>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} onClick={onNavigate} activeOptions={{ exact: "exact" in n }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-sidebar-accent hover:opacity-100" activeProps={{ className: "bg-sidebar-accent !opacity-100 text-sidebar-primary" }}>
          <n.icon className="h-4 w-4 shrink-0" />{n.label}
        </Link>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const signed = useSignedIn();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!signed) return <Login />;
  const current = [...NAV].reverse().find((n) => ("exact" in n ? path === n.to || path === n.to + "/" : path.startsWith(n.to)))?.label ?? "Admin";
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3 p-5"><Emblem /><div className="leading-tight"><div className="font-display font-bold">Rahama Admin</div><div className="text-[11px] opacity-70">Back office</div></div></Link>
        <NavLinks />
        <button onClick={signOut} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="no-print sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-sidebar px-3 py-2 text-sidebar-foreground lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="icon" variant="ghost" className="hover:bg-sidebar-accent" aria-label="Open menu"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="flex items-center gap-3 p-5 text-sidebar-foreground"><Emblem /><span className="font-display font-bold">Rahama Admin</span></SheetTitle>
              <NavLinks onNavigate={() => setOpen(false)} />
              <button onClick={signOut} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2"><Emblem className="h-7 w-7 shrink-0" /><span className="truncate font-display font-semibold">{current}</span></div>
          <Button size="icon" variant="ghost" className="hover:bg-sidebar-accent" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
