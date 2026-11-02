import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signup: vi.fn(), verify: vi.fn(), resend: vi.fn(), google: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signUp: mocks.signup, verifyOtp: mocks.verify, resend: mocks.resend } } }));
vi.mock("@/integrations/lovable", () => ({ lovable: { auth: { signInWithOAuth: mocks.google } } }));
import { signUp, verifySignupCode, resendSignupCode, signInWithGoogle } from "@/lib/auth";

describe("Staff signup verification", () => {
  beforeEach(() => vi.resetAllMocks());
  it("keeps an unconfirmed signup awaiting verification", async () => {
    mocks.signup.mockResolvedValue({ data: { session: null }, error: null });
    expect((await signUp(" staff@example.com ", "safe-password")).needsVerification).toBe(true);
    expect(mocks.signup).toHaveBeenCalledWith({ email: "staff@example.com", password: "safe-password", options: { emailRedirectTo: window.location.origin } });
  });
  it("verifies a supplied email code as signup confirmation", async () => {
    mocks.verify.mockResolvedValue({ error: null });
    await verifySignupCode(" staff@example.com ", " 123456 ");
    expect(mocks.verify).toHaveBeenCalledWith({ email: "staff@example.com", token: "123456", type: "signup" });
  });
  it("returns invalid-code errors instead of marking confirmation successful", async () => {
    mocks.verify.mockResolvedValue({ error: { message: "Code expired" } });
    expect(await verifySignupCode("staff@example.com", "000000")).toBe("Code expired");
  });
  it("resends the built-in signup verification email", async () => {
    mocks.resend.mockResolvedValue({ error: null });
    await resendSignupCode("staff@example.com");
    expect(mocks.resend).toHaveBeenCalledWith({ type: "signup", email: "staff@example.com", options: { emailRedirectTo: window.location.origin } });
  });
  it("uses managed Google with the public staff sign-in callback", async () => {
    mocks.google.mockResolvedValue({ redirected: true });
    await signInWithGoogle();
    expect(mocks.google).toHaveBeenCalledWith("google", { redirect_uri: `${window.location.origin}/admin` });
  });
});