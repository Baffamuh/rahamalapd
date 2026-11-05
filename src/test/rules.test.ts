import { describe, expect, it } from "vitest";
import { acceptWalkFix, areaBreakdown, edgeLengths, geodesicArea, isSelfIntersecting, M_TO_FT } from "@/lib/geo";
import { formatNaira } from "@/lib/company";
import { leaderboard, saleBalance } from "@/lib/leaderboard";
import { nextReceipt, nextRef, typeCode } from "@/lib/store";
import { makeSeed } from "@/lib/seed";
import { scoreLead } from "@/lib/leads";

describe("business rules", () => {
  it("GPS walk ignores fixes worse than 25 m accuracy", () => expect(acceptWalkFix(undefined, [11.67, 10.18], 40)).toBe(false));
  it("GPS walk ignores jitter under 3 m from the last corner", () => expect(acceptWalkFix([11.67, 10.18], [11.67001, 10.18], 5)).toBe(false));
  it("GPS walk records a fix ~11 m away", () => expect(acceptWalkFix([11.67, 10.18], [11.6701, 10.18], 5)).toBe(true));
  it("private listings are hidden from the public catalogue", async () => {
    const { filterProperties } = await import("@/routes/properties.index");
    const db = makeSeed();
    db.properties[0]!.status = "Private";
    expect(filterProperties(db, {} as never).some((p) => p.id === db.properties[0]!.id)).toBe(false);
  });
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
  it("sale and rent codes differ per category", () => {
    expect(typeCode("sale", "Shop")).toBe("S-SH");
    expect(typeCode("rent", "Shop")).toBe("R-SH");
    expect(typeCode("sale", "Residential Land")).toBe("S-RL");
    expect(typeCode("sale", "Commercial Land")).toBe("S-CL");
    expect(typeCode("sale", "Farm")).toBe("S-FM");
  });
  it("the three house conditions each have their own code", () => {
    expect(["Completed", "Semi-completed", "Incomplete"].map((c) => typeCode("sale", "House/Villa", c))).toEqual(["S-HC", "S-HS", "S-HI"]);
    expect(typeCode("rent", "House/Villa", "Completed")).toBe("R-HC");
  });
  it("house codes differ from land, farm and shop codes", () => {
    expect(typeCode("sale", "House/Villa", "Completed")).not.toBe(typeCode("sale", "Shop"));
    expect(typeCode("sale", "House/Villa", "Completed")).not.toBe(typeCode("sale", "Residential Land"));
  });
  it("auto ref includes type code", () => expect(nextRef(makeSeed(), "AZR", "rent", "Shop")).toBe("RHM-R-SH-001"));
});
import { conditionLabel, conditionsFor, toWhatsApp } from "@/lib/types";
describe("property numbers & conditions", () => {
  it("rent houses only allow completed and semi-completed", () => expect(conditionsFor("rent")).toEqual(["Completed", "Semi-completed"]));
  it("sale houses show Uncompleted", () => expect(conditionLabel(conditionsFor("sale")[2])).toBe("Uncompleted"));
  it("local phone converts to WhatsApp format", () => expect(toWhatsApp("0806 378 4070")).toBe("2348063784070"));
});

import { availableUnitsOf, totalAvailableUnits } from "@/lib/store";
describe("available units", () => {
  it("counts only published listings, default 1", () => {
    expect(availableUnitsOf({ status: "Published" })).toBe(1);
    expect(availableUnitsOf({ status: "Sold", availableUnits: 3 })).toBe(0);
    expect(totalAvailableUnits([{ status: "Published", availableUnits: 3 }, { status: "Published" }, { status: "Reserved", availableUnits: 2 }])).toBe(4);
  });
});
