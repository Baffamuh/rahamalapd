import type { DB, Property } from "./types";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=70`;
const LAND = [img("photo-1500382017468-9049fed747ef"), img("photo-1628624747186-a941c476b7ef"), img("photo-1625244724120-1fd1d34d00f6")];
const HOUSE = [img("photo-1600596542815-ffad4c1539a9"), img("photo-1600585154340-be6161a56a0c"), img("photo-1600607687939-ce8a6c25118c")];
const FARM = [img("photo-1464226184884-fa280b87c399"), img("photo-1500382017468-9049fed747ef")];
const SHOP = [img("photo-1555396273-367ea4eb4db5"), img("photo-1604719312566-8912e9227c6a")];

function box(lat: number, lng: number, w = 0.00014, h = 0.00028): [number, number][] {
  return [[lat, lng], [lat, lng + w], [lat + h, lng + w], [lat + h, lng]];
}

export function makeSeed(): DB {
  const zones: DB["zones"] = [
    { id: "z1", name: "Azare Central", code: "AZR", subZones: [
      { id: "s1", name: "GRA Azare", areas: [{ id: "a1", name: "GRA Phase I" }, { id: "a2", name: "GRA Extension" }] },
      { id: "s2", name: "Old Kano Road", areas: [{ id: "a3", name: "Kano Road Market Axis" }] },
    ]},
    { id: "z2", name: "Azare East", code: "AZR", subZones: [
      { id: "s3", name: "Federal Low Cost", areas: [{ id: "a4", name: "Low Cost Block A" }, { id: "a5", name: "Low Cost Block B" }] },
      { id: "s4", name: "Potiskum Road", areas: [{ id: "a6", name: "Potiskum Road Layout" }] },
    ]},
    { id: "z3", name: "Azare West", code: "AZR", subZones: [
      { id: "s5", name: "Jama'are Road", areas: [{ id: "a7", name: "Jama'are Road Layout" }] },
      { id: "s6", name: "Chora Chara", areas: [{ id: "a8", name: "Chora Chara North" }] },
    ]},
    { id: "z4", name: "Federal University Axis", code: "AZR", subZones: [
      { id: "s7", name: "FUK Gate Area", areas: [{ id: "a9", name: "University Staff Layout" }, { id: "a10", name: "Student Village" }] },
    ]},
    { id: "z5", name: "Bauchi Metropolis", code: "BAU", subZones: [
      { id: "s8", name: "Yelwa", areas: [{ id: "a11", name: "Yelwa Tudun" }, { id: "a12", name: "Yelwa GRA" }] },
      { id: "s9", name: "Jos Road", areas: [{ id: "a13", name: "Jos Road Estate" }] },
    ]},
    { id: "z6", name: "Bauchi Outskirts", code: "BAU", subZones: [
      { id: "s10", name: "Dass Road Farmlands", areas: [{ id: "a14", name: "Dass Road Farm Belt" }] },
    ]},
  ];

  const P = (p: Partial<Property> & Pick<Property, "id" | "title" | "ref" | "category" | "zoneId" | "subZoneId" | "areaId" | "price">): Property => ({
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + p.ref.slice(-3),
    transaction: "sale",
    plots: 1,
    dimensions: "50ft × 100ft",
    status: "Published",
    featured: false,
    images: LAND,
    description: "",
    titleDocs: ["Survey Plan"],
    boundary: [],
    survey: {},
    createdAt: "2026-01-10",
    ...p,
  });

  const properties: Property[] = [
    P({ id: "p1", ref: "RHM-AZR-001", title: "Corner Residential Plot, GRA Azare", category: "Residential Land", zoneId: "z1", subZoneId: "s1", areaId: "a1", price: 6500000, featured: true, titleDocs: ["C-of-O", "Survey Plan"], boundary: box(11.6762, 10.1859), survey: { area: 465, number: "BAU/AZR/2026/SP-104", authority: "Bauchi State Ministry of Lands", date: "2026-02-14" }, description: "Dry, well-drained corner plot in the quiet GRA Phase I layout, with tarred road access, electricity poles on site and neighbouring completed homes." }),
    P({ id: "p2", ref: "RHM-AZR-002", title: "4-Bedroom Detached Villa, Federal Low Cost", category: "House/Villa", zoneId: "z2", subZoneId: "s3", areaId: "a4", price: 38000000, featured: true, images: HOUSE, bedrooms: 4, bathrooms: 4, dimensions: "50ft × 100ft", titleDocs: ["C-of-O", "Deed of Assignment"], boundary: box(11.6701, 10.1975), description: "Newly completed family home with en-suite rooms, boys' quarters, borehole, perimeter fence and interlocked compound." }),
    P({ id: "p3", ref: "RHM-AZR-003", title: "Commercial Frontage on Potiskum Road", category: "Commercial Land", zoneId: "z2", subZoneId: "s4", areaId: "a6", price: 18000000, plots: 2, dimensions: "100ft × 100ft", featured: true, images: LAND, titleDocs: ["R-of-O", "Survey Plan"], status: "Reserved", description: "Two plots with direct highway frontage — ideal for a filling station, plaza or warehouse." }),
    P({ id: "p4", ref: "RHM-AZR-004", title: "Student Hostel Plot near FUK Gate", category: "Residential Land", zoneId: "z4", subZoneId: "s7", areaId: "a10", price: 4200000, featured: true, description: "Five minutes' walk to the Federal University gate. Strong rental demand from students and staff." }),
    P({ id: "p5", ref: "RHM-AZR-005", title: "Lock-up Shop, Kano Road Market", category: "Shop", zoneId: "z1", subZoneId: "s2", areaId: "a3", price: 450000, transaction: "rent", images: SHOP, dimensions: "12ft × 15ft", plots: 0.04, description: "Ground-floor shop in a busy market axis. Annual rent." }),
    P({ id: "p6", ref: "RHM-BAU-001", title: "Yelwa GRA Bungalow", category: "House/Villa", zoneId: "z5", subZoneId: "s8", areaId: "a12", price: 27500000, images: HOUSE, bedrooms: 3, bathrooms: 3, featured: true, titleDocs: ["C-of-O"], description: "Spacious 3-bedroom bungalow in Yelwa GRA, close to ATBU." }),
    P({ id: "p7", ref: "RHM-BAU-002", title: "10-Plot Farmland, Dass Road", category: "Farm", zoneId: "z6", subZoneId: "s10", areaId: "a14", price: 9000000, plots: 10, dimensions: "250ft × 200ft", images: FARM, description: "Fertile farmland with seasonal stream, suited to maize, sorghum and groundnut." }),
    P({ id: "p8", ref: "RHM-AZR-006", title: "Jama'are Road Twin Plots", category: "Residential Land", zoneId: "z3", subZoneId: "s5", areaId: "a7", price: 7800000, plots: 2, dimensions: "100ft × 100ft", status: "Sold", description: "Two adjoining plots in a fast-growing layout." }),
  ];

  return {
    zones,
    properties,
    agents: [
      { id: "g1", code: "RHM-AGT-001", name: "Musa Abdullahi", phone: "08031112222", whatsapp: "2348031112222", email: "musa@rahamaproperty.ng", zoneId: "z1", active: true },
      { id: "g2", code: "RHM-AGT-002", name: "Hauwa Sani", phone: "08062223333", whatsapp: "2348062223333", email: "hauwa@rahamaproperty.ng", zoneId: "z2", active: true },
      { id: "g3", code: "RHM-AGT-003", name: "Ibrahim Yusuf", phone: "07013334444", whatsapp: "2347013334444", email: "ibrahim@rahamaproperty.ng", zoneId: "z5", active: true },
    ],
    sales: [
      { id: "sl1", receiptNo: "RHM-RCP-2026-0001", propertyId: "p8", agentId: "g1", buyerName: "Aminu Bello", buyerPhone: "08037778888", price: 7800000, previouslyPaid: 0, amountPaid: 5000000, method: "Bank Transfer", commission: 390000, date: "2026-03-18T10:30:00" },
      { id: "sl2", receiptNo: "RHM-RCP-2025-0007", propertyId: "p8", agentId: "g2", buyerName: "Zainab Garba", buyerPhone: "08098887777", price: 5200000, previouslyPaid: 0, amountPaid: 5200000, method: "Cash", commission: 260000, date: "2025-11-02T14:00:00" },
    ],
    enquiries: [
      { id: "e1", name: "Abubakar Lawal", phone: "08051234567", email: "abu@example.com", message: "I am ready to pay deposit this week for the GRA plot. Can I book an inspection on Saturday?", propertyId: "p1", type: "inspection", preferredDate: "2026-11-07", status: "New", notes: "", createdAt: "2026-10-25T09:12:00" },
      { id: "e2", name: "Fatima Musa (UK)", phone: "+447700900123", email: "fatima@example.co.uk", message: "Hello, I live in the UK. How much is the villa and is the C of O available? Diaspora buyer.", propertyId: "p2", type: "enquiry", status: "Contacted", notes: "", createdAt: "2026-10-22T18:40:00" },
      { id: "e3", name: "Sani", phone: "", email: "sani@example.com", message: "Info pls", propertyId: null, type: "enquiry", status: "New", notes: "", createdAt: "2026-10-20T11:00:00" },
    ],
    activity: [
      { id: "ac1", text: "Sale recorded: Jama'are Road Twin Plots → Aminu Bello", at: "2026-03-18T10:30:00" },
    ],
  };
}
