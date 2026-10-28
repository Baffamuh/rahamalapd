import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Home, Inbox, LogOut, Map, Users } from "lucide-react";
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

function AdminLayout() {
  const signed = useSignedIn();
  if (!signed) return <Login />;
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 p-5"><Emblem /><span className="font-display font-bold">Rahama Admin</span></Link>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent hover:opacity-100" activeProps={{ className: "bg-sidebar-accent !opacity-100 text-sidebar-primary" }}>
              <n.icon className="h-4 w-4" />{n.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="no-print flex gap-1 overflow-x-auto border-b bg-sidebar p-2 text-sidebar-foreground md:hidden">
          {NAV.map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="whitespace-nowrap rounded px-3 py-1.5 text-xs" activeProps={{ className: "bg-sidebar-accent" }}>{n.label}</Link>)}
          <button onClick={signOut} className="px-3 text-xs">Sign out</button>
        </nav>
        <div className="mx-auto max-w-7xl p-4 md:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
