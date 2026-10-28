export type Priority = "High" | "Medium" | "Low";
export type Tone = "Formal" | "Warm" | "Hausa";

const HIGH = ["buy now", "ready", "cash", "pay", "payment", "deposit", "today", "this week", "urgent", "inspection", "visit", "book", "transfer", "installment"];
const MED = ["price", "available", "how much", "cost", "plot", "c of o", "c-of-o", "title", "document", "land", "house", "interested", "diaspora"];

export function scoreLead(input: { message: string; phone?: string; email?: string; type?: string; propertyId?: string | null }) {
  const text = input.message.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  const hi = HIGH.filter((k) => text.includes(k));
  const md = MED.filter((k) => text.includes(k));
  if (hi.length) { score += 3 * hi.length; reasons.push(`Strong buying intent: "${hi.slice(0, 3).join('", "')}"`); }
  if (md.length) { score += md.length; reasons.push(`Product interest: "${md.slice(0, 3).join('", "')}"`); }
  if (input.type === "inspection") { score += 4; reasons.push("Requested a site inspection"); }
  if (input.propertyId) { score += 2; reasons.push("Asked about a specific listing"); }
  if (input.phone && input.phone.replace(/\D/g, "").length >= 10) { score += 1; reasons.push("Reachable by phone"); }
  if (/\b(\d{1,3}(,\d{3})+|\d+\s?(m|million))\b/.test(text)) { score += 2; reasons.push("Mentioned a budget"); }
  if (text.length < 15) { score -= 1; reasons.push("Very short message"); }
  const priority: Priority = score >= 7 ? "High" : score >= 3 ? "Medium" : "Low";
  if (!reasons.length) reasons.push("General enquiry with no clear intent signals");
  return { priority, score, reasons };
}

export function draftReply(tone: Tone, name: string, propertyTitle?: string, ref?: string) {
  const first = name.split(" ")[0] || "there";
  const about = propertyTitle ? `${propertyTitle}${ref ? ` (Ref: ${ref})` : ""}` : "our available properties";
  if (tone === "Formal")
    return `Dear ${name},\n\nThank you for contacting Rahama Land and Property Development Ltd. regarding ${about}. We would be pleased to share full details, title documentation and arrange a site inspection at your convenience.\n\nKindly let us know a suitable date and time.\n\nYours faithfully,\nRahama Property Team\n+234 806 378 4070`;
  if (tone === "Warm")
    return `Hi ${first}! 😊 Thanks so much for reaching out about ${about}. It's a great choice — I'd love to show you around. When would be a good time for a quick call or site visit?\n\n— Rahama Property Team`;
  return `Assalamu alaikum ${first}, barka da yau! Mun gode da tuntuɓar Rahama Property game da ${about}. Za mu yi farin cikin tura maka cikakken bayani da shirya ziyarar fili. Wane lokaci ya dace da kai?\n\nNa gode — Rahama Property Team`;
}
