import type { LatLng } from "./geo";

export type Area = { id: string; name: string };
export type SubZone = { id: string; name: string; areas: Area[] };
export type Zone = { id: string; name: string; code: "AZR" | "BAU"; subZones: SubZone[] };

export type PropertyStatus = "Draft" | "Published" | "Reserved" | "Sold" | "Archived";
export type Category = "Residential Land" | "Commercial Land" | "House/Villa" | "Farm" | "Shop";
export const CATEGORIES: Category[] = ["Residential Land", "Commercial Land", "House/Villa", "Farm", "Shop"];
export const STATUSES: PropertyStatus[] = ["Draft", "Published", "Reserved", "Sold", "Archived"];
export const TITLE_DOCS = ["C-of-O", "R-of-O", "Survey Plan", "Deed of Assignment"] as const;

export type Survey = { area?: number | undefined; number?: string | undefined; authority?: string | undefined; date?: string } | undefined;

export type Property = {
  id: string;
  slug: string;
  ref: string;
  title: string;
  transaction: "sale" | "rent";
  category: Category;
  zoneId: string;
  subZoneId: string;
  areaId: string;
  price: number;
  plots: number;
  dimensions: string;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  status: PropertyStatus;
  featured: boolean;
  images: string[];
  description: string;
  titleDocs: string[];
  boundary: LatLng[];
  survey: Survey;
  createdAt: string;
};

export type Agent = {
  id: string;
  code: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  zoneId: string;
  active: boolean;
};

export type PaymentMethod = "Bank Transfer" | "Cash" | "Cheque" | "POS";
export const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "Cash", "Cheque", "POS"];

export type Sale = {
  id: string;
  receiptNo: string;
  propertyId: string;
  agentId: string;
  buyerName: string;
  buyerPhone: string;
  price: number;
  previouslyPaid: number;
  amountPaid: number;
  method: PaymentMethod;
  commission: number;
  date: string;
};

export type EnquiryStatus = "New" | "Contacted" | "Viewing Scheduled" | "Closed";
export const ENQUIRY_STATUSES: EnquiryStatus[] = ["New", "Contacted", "Viewing Scheduled", "Closed"];
export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string | null;
  type: "enquiry" | "inspection";
  preferredDate?: string | undefined;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
};

export type Activity = { id: string; text: string; at: string };

export type DB = {
  zones: Zone[];
  properties: Property[];
  agents: Agent[];
  sales: Sale[];
  enquiries: Enquiry[];
  activity: Activity[];
};
