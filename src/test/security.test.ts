import { describe, it, expect } from "vitest";
import { isAllowedImage, isSafeImageUrl, MAX_UPLOAD_BYTES } from "@/lib/watermark";

describe("upload rules", () => {
  it("allows jpg up to 10 MB", () => expect(isAllowedImage({ type: "image/jpeg", size: MAX_UPLOAD_BYTES })).toBe(true));
  it("rejects files over 10 MB", () => expect(isAllowedImage({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 })).toBe(false));
  it("rejects svg (can carry scripts)", () => expect(isAllowedImage({ type: "image/svg+xml", size: 100 })).toBe(false));
  it("rejects javascript: photo links", () => expect(isSafeImageUrl("javascript:alert(1)")).toBe(false));
  it("rejects plain http links", () => expect(isSafeImageUrl("http://x.com/a.jpg")).toBe(false));
  it("accepts https links", () => expect(isSafeImageUrl("https://images.unsplash.com/a.jpg")).toBe(true));
});
