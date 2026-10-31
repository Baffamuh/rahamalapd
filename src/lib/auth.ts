import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Real cloud sign-in. Staff access is granted by the database (user_roles) for confirmed company emails.
export const ADMIN_EMAIL = "rahmalapd@gmail.com";
export type AuthState = { loading: boolean; email?: string | undefined; isAdmin: boolean };

async function check(): Promise<AuthState> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { loading: false, isAdmin: false };
  const role = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return { loading: false, email: user.email ?? undefined, isAdmin: !!role.data };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: true, isAdmin: false });
  useEffect(() => {
    let alive = true;
    const run = () => check().then((s) => alive && setState(s));
    run();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") run();
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  return state;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error?.message;
}
export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
  return error?.message;
}
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
  return error?.message;
}
export async function signOut() {
  await supabase.auth.signOut();
}
