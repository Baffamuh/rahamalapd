import { useSyncExternalStore } from "react";

// Single-tenant demo admin gate (client-side only, as specified). Not real security.
const KEY = "rahama-admin-session";
export const ADMIN_EMAIL = "admin@rahamaproperty.ng";
const ADMIN_PASSWORD = "rahama2026";
const listeners = new Set<() => void>();

export function isSignedIn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}
export function signIn(email: string, password: string) {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    window.localStorage.setItem(KEY, "1");
    listeners.forEach((l) => l());
    return true;
  }
  return false;
}
export function signOut() {
  window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}
export function useSignedIn() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    isSignedIn,
    () => false,
  );
}
