import { describe, expect, it } from "vitest";
import { areaBreakdown, edgeLengths, geodesicArea, isSelfIntersecting, M_TO_FT } from "@/lib/geo";
import { formatNaira } from "@/lib/company";
import { leaderboard, saleBalance } from "@/lib/leaderboard";
import { nextReceipt, nextRef } from "@/lib/store";
import { makeSeed } from "@/lib/seed";
import { scoreLead } from "@/lib/leads";

describe("business rules", () => {
  it("formats Naira with commas", () => expect(formatNaira(12500000)).toBe("₦12,500,000"));
  it("one standard plot (5,000 sq ft) is ~464.5 m²", () => expect(areaBreakdown(464.5).plots).toBeCloseTo(1, 2));
  it("geodesic area of a ~100m square is ~10,000 m²", () => {
    const d = 100 / 111320;
    const lngD = 100 / (111320 * Math.cos((11.6738 * Math.PI) / 180));
    const a = geodesicArea([[11.6738, 10.1878], [11.6738, 10.1878 + lngD], [11.6738 + d, 10.1878 + lngD], [11.6738 + d, 10.1878]]);
    expect(a).toBeGreaterThan(9800);
    expect(a).toBeLessThan(10200);
  });
  it("a 50ft × 100ft plot drawn at Azare measures ~50 ft and ~100 ft sides and ~1 plot", () => {
    const w = 50 / M_TO_FT, h = 100 / M_TO_FT;
    const dLat = h / 111195, dLng = w / (111195 * Math.cos((11.6738 * Math.PI) / 180));
    const pts: [number, number][] = [[11.6738, 10.1878], [11.6738, 10.1878 + dLng], [11.6738 + dLat, 10.1878 + dLng], [11.6738 + dLat, 10.1878]];
    const e = edgeLengths(pts).map((m) => m * M_TO_FT);
    expect(e[0]).toBeCloseTo(50, 0); expect(e[1]).toBeCloseTo(100, 0);
    expect(areaBreakdown(geodesicArea(pts)).plots).toBeCloseTo(1, 1);
  });
  it("detects a self-intersecting (bow-tie) boundary", () => expect(isSelfIntersecting([[0, 0], [1, 1], [1, 0], [0, 1]])).toBe(true));
  it("reference codes follow RHM-AZR-###", () => expect(nextRef(makeSeed(), "AZR")).toBe("RHM-AZR-007"));
  it("receipt numbers follow RHM-RCP-YYYY-####", () => expect(nextReceipt(makeSeed(), 2026)).toBe("RHM-RCP-2026-0002"));
  it("balance = price − previously paid − paid now", () => expect(saleBalance({ price: 10000000, previouslyPaid: 2000000, amountPaid: 3000000 })).toBe(5000000));
  it("leaderboard ranks by sales volume for the selected year", () => {
    const db = makeSeed();
    expect(leaderboard(db.agents, db.sales, "2025", "volume")[0]!.agent.code).toBe("RHM-AGT-002");
  });
  it("inspection with deposit intent scores High", () =>
    expect(scoreLead({ message: "Ready to pay deposit this week", phone: "08051234567", type: "inspection", propertyId: "p1" }).priority).toBe("High"));
});
