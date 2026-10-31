import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Building2, Home, Inbox, LogOut, Map, Menu, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo, Emblem } from "@/components/site/SiteLayout";
import { ADMIN_EMAIL, resetPassword, signIn, signOut, signUp, useAuth } from "@/lib/auth";
import { DbScope } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

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

function Login({ notStaff }: { notStaff?: string | undefined }) {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") { const err = await signIn(email, pw); if (err) toast.error(err); }
    else if (mode === "up") {
      if (pw.length < 8) { toast.error("Use at least 8 characters"); setBusy(false); return; }
      const err = await signUp(email, pw);
      if (err) toast.error(err); else { toast.success("Account created. Check your email inbox and click the confirmation link, then sign in."); setMode("in"); }
    } else { const err = await resetPassword(email); if (err) toast.error(err); else toast.success("Password reset link sent to your email."); }
    setBusy(false);
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-xl" onSubmit={submit}>
        <div className="flex flex-col items-center gap-2 text-center"><BrandLogo className="h-28" /><div className="text-xs uppercase tracking-widest text-muted-foreground">{mode === "up" ? "Create staff account" : mode === "reset" ? "Reset password" : "Staff sign-in"}</div></div>
        {notStaff && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{notStaff} is signed in but does not have staff access. <button type="button" className="underline" onClick={() => signOut()}>Sign out</button></div>}
        <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {mode !== "reset" && <div><Label>Password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>}
        <Button type="submit" className="w-full" disabled={busy}>{mode === "up" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
        <div className="flex justify-between text-xs">
          {mode !== "in" ? <button type="button" className="text-primary hover:underline" onClick={() => setMode("in")}>Back to sign in</button> : <button type="button" className="text-primary hover:underline" onClick={() => setMode("up")}>First time? Create account</button>}
          {mode === "in" && <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("reset")}>Forgot password?</button>}
        </div>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">← Back to website</Link>
      </form>
    </div>
  );
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-xl" onSubmit={async (e) => {
        e.preventDefault();
        if (pw.length < 8) { toast.error("Use at least 8 characters"); return; }
        const { error } = await supabase.auth.updateUser({ password: pw });
        if (error) toast.error(error.message); else { toast.success("Password updated"); onDone(); }
      }}>
        <div className="flex flex-col items-center gap-2 text-center"><BrandLogo className="h-28" /><div className="text-xs uppercase tracking-widest text-muted-foreground">Set a new password</div></div>
        <div><Label>New password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button type="submit" className="w-full">Save password</Button>
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
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setRecovery(true);
    const { data } = supabase.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") setRecovery(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  if (recovery && auth.email) return <NewPassword onDone={() => { setRecovery(false); history.replaceState(null, "", "/admin"); }} />;
  if (auth.loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (!auth.isAdmin) return <Login notStaff={auth.email} />;
  const current = [...NAV].reverse().find((n) => ("exact" in n ? path === n.to || path === n.to + "/" : path.startsWith(n.to)))?.label ?? "Admin";
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3 p-5"><Emblem framed className="h-10 w-10" /><div className="leading-tight"><div className="font-display font-bold">Rahama Admin</div><div className="text-[11px] opacity-70">Back office</div></div></Link>
        <NavLinks />
        <button onClick={() => signOut()} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="no-print sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-sidebar px-3 py-2 text-sidebar-foreground lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="icon" variant="ghost" className="hover:bg-sidebar-accent" aria-label="Open menu"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="flex items-center gap-3 p-5 text-sidebar-foreground"><Emblem framed className="h-10 w-10" /><span className="font-display font-bold">Rahama Admin</span></SheetTitle>
              <NavLinks onNavigate={() => setOpen(false)} />
              <button onClick={() => signOut()} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2"><Emblem framed className="h-8 w-8" /><span className="truncate font-display font-semibold">{current}</span></div>
          <Button size="icon" variant="ghost" className="hover:bg-sidebar-accent" onClick={() => signOut()} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><DbScope.Provider value={{ admin: true }}><Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}><Outlet /></Suspense></DbScope.Provider></div>
      </div>
    </div>
  );
}
