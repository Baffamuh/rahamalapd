import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Building2, Home, Inbox, LogOut, Map, Menu, Users, Mail, LoaderCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo, Emblem } from "@/components/site/SiteLayout";
import { ADMIN_EMAIL, resetPassword, signIn, signOut, signUp, useAuth, verifySignupCode, resendSignupCode, signInWithGoogle } from "@/lib/auth";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [mode, setMode] = useState<"in" | "up" | "reset" | "verify">("in");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [resendUntil, setResendUntil] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil((resendUntil - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [resendUntil]);
  async function google() {
    setBusy(true);
    try { const err = await signInWithGoogle(); if (err) toast.error(err); }
    catch { toast.error("Google sign-in could not start. Please try again."); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (busy || Date.now() < resendUntil) return;
    setBusy(true);
    try {
      const err = await resendSignupCode(email);
      if (err) toast.error(err);
      else { setResendUntil(Date.now() + 60000); toast.success("Verification email sent. Check your inbox and spam folder."); }
    } catch { toast.error("Could not resend verification. Please try again."); }
    finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
    if (mode === "in") { const err = await signIn(email, pw); if (err) toast.error(err); }
    else if (mode === "up") {
      if (pw.length < 8) { toast.error("Use at least 8 characters"); setBusy(false); return; }
      const result = await signUp(email, pw);
      if (result.error) toast.error(result.error);
      else if (result.needsVerification) { setCode(""); setPw(""); setResendUntil(Date.now() + 60000); setMode("verify"); toast.success("Check your inbox for your verification email."); }
    } else if (mode === "verify") {
      const err = await verifySignupCode(email, code);
      if (err) toast.error(err); else { toast.success("Email verified."); setMode("in"); setCode(""); }
    } else { const err = await resetPassword(email); if (err) toast.error(err); else toast.success("Password reset link sent to your email."); }
    } catch { toast.error("Could not complete your request. Please try again."); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-xl" onSubmit={submit}>
        <div className="flex flex-col items-center gap-2 text-center"><BrandLogo className="h-28" /><div className="text-xs uppercase tracking-widest text-muted-foreground">{mode === "up" ? "Create staff account" : mode === "verify" ? "Verify your email" : mode === "reset" ? "Reset password" : "Staff sign-in"}</div></div>
        {notStaff && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{notStaff} is signed in but does not have staff access. <button type="button" className="underline" onClick={() => signOut()}>Sign out</button></div>}
        <div><Label htmlFor="staff-email">Email</Label><Input id="staff-email" autoComplete="email" type="email" required readOnly={mode === "verify"} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {(mode === "in" || mode === "up") && <div><Label htmlFor="staff-password">Password</Label><Input id="staff-password" autoComplete={mode === "up" ? "new-password" : "current-password"} type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>}
        {mode === "verify" && <div><Label htmlFor="verification-code">Verification code</Label><Input id="verification-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /><Button type="button" variant="link" className="mt-1 px-0 text-xs" disabled={busy || seconds > 0} onClick={resend}><Mail />{seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}</Button></div>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <LoaderCircle className="animate-spin motion-reduce:animate-none" />}{mode === "up" ? "Create account" : mode === "verify" ? "Verify email" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
        {(mode === "in" || mode === "up") && <><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div><Button type="button" variant="outline" className="w-full" disabled={busy} onClick={google}><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4ZM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22ZM6.4 13.7a6 6 0 0 1 0-3.4V7.6H3a10 10 0 0 0 0 8.8l3.4-2.7ZM12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.6l3.4 2.7C7.2 7.9 9.4 6.1 12 6.1Z" /></svg>Continue with Google</Button></>}
        <div className="flex justify-between text-xs">
          {mode !== "in" ? <Button type="button" variant="link" className="h-auto p-0 text-xs" disabled={busy} onClick={() => setMode("in")}>Back to sign in</Button> : <Button type="button" variant="link" className="h-auto p-0 text-xs" disabled={busy} onClick={() => setMode("up")}>First time? Create account</Button>}
          {mode === "in" && <Button type="button" variant="link" className="h-auto p-0 text-xs text-muted-foreground" disabled={busy} onClick={() => setMode("reset")}>Forgot password?</Button>}
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
