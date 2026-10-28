export const COMPANY = {
  name: "Rahama Land and Property Development Ltd.",
  short: "Rahama Property Hub",
  rc: "RC NO. 9871926",
  address: "No. 12, Old Kano Road, Azare, Katagum LGA, Bauchi State, Nigeria",
  phones: ["+234 806 378 4070", "+234 703 780 7271"],
  phonesLocal: ["08063784070", "07037807271"],
  whatsapp: "2348063784070",
  email: "rahmalapd@gmail.com",
  center: [11.6738, 10.1878] as [number, number],
};

export const PLOT_SQFT = 5000; // 50ft × 100ft
export const SQFT_PER_SQM = 10.7639;

export function formatNaira(n: number): string {
  return "₦" + Math.round(n || 0).toLocaleString("en-NG");
}

export function waLink(message: string, number: string = COMPANY.whatsapp): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function propertyWaMessage(title: string, ref: string): string {
  return `Hello Rahama Property, I am inquiring about ${title} (Ref: ${ref}).`;
}
