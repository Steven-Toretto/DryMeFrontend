// Pure helpers for the "Book a pickup" steps (no React, easy to test).

// Nobody can reliably guess "my laundry weighs 3.5kg", so people pick a load size they can judge by eye.
// Each maps to an estimated weight; the shop weighs the real laundry at pickup.
export const LOAD_SIZES = [
  { key: "small", label: "Small", kg: 2, desc: "A few days of clothes for one person" },
  { key: "medium", label: "Medium", kg: 4, desc: "A full laundry basket" },
  { key: "large", label: "Large", kg: 6, desc: "Bedding plus a few days of clothes" },
  { key: "xl", label: "Extra large", kg: 9, desc: "A duffel bag, multiple loads" },
];

// The load size closest to a weight (for "Book again"), or null.
export const nearestLoadSize = (kg) => {
  const n = Number(kg);
  if (!Number.isFinite(n) || n <= 0) return null;
  return LOAD_SIZES.reduce((best, size) => (Math.abs(size.kg - n) < Math.abs(best.kg - n) ? size : best));
};

// ---------- contact details ----------
export const cleanPhone = (raw) => String(raw ?? "").replace(/[\s()-]/g, "");

export const phoneError = (raw) => {
  const phone = cleanPhone(raw);
  if (!phone) return "Enter a phone number so the shop can reach you.";
  if (!/^\+?\d{9,14}$/.test(phone) || phone.length > 15) return "Enter a valid phone number, e.g. 0712 345 678.";
  return "";
};

export const addressError = (raw) =>
  String(raw ?? "").trim().length < 3 ? "Tell the shop where to collect from." : "";

// ---------- price ----------
// Estimated total in shillings, or null until the customer has said how much laundry there is.
export const estimateTotal = (service, { loadSize, quantity }) => {
  if (!service) return null;
  const price = Number(service.price);
  if (!Number.isFinite(price)) return null;

  if (service.pricing_type === "per_item") {
    const count = Number(quantity);
    return Number.isInteger(count) && count >= 1 ? price * count : null;
  }
  const size = LOAD_SIZES.find((s) => s.key === loadSize);
  return size ? price * size.kg : null;
};

// ---------- days and times (Nairobi) ----------
// "2026-11-02": today's date in Nairobi, whatever timezone the phone is set to.
export const todayInNairobi = (now = new Date()) =>
  now.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

const noon = (iso) => new Date(`${iso}T12:00:00Z`);

// "Today", "Tomorrow", then "Wed 4 Nov".
export const dayLabel = (iso, today = todayInNairobi()) => {
  const gap = Math.round((noon(iso) - noon(today)) / 86400000);
  if (gap === 0) return "Today";
  if (gap === 1) return "Tomorrow";
  return noon(iso)
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .replace(",", "");
};

// The chosen day + window inside the server's list of bookable days, or null (also when it has since expired).
export const findSlot = (days, date, key) => {
  const day = (days || []).find((d) => d.date === date);
  const slot = day?.slots.find((s) => s.key === key);
  return day && slot ? { day: day.label, time: slot.label, text: `${day.label}, ${slot.label}` } : null;
};

// "Tomorrow, 8:00 – 10:00am" for an order that has a pickup window, else "".
export const pickupText = (order, today) =>
  order?.pickup_date && order?.pickup_slot_label ? `${dayLabel(order.pickup_date, today)}, ${order.pickup_slot_label}` : "";

// {"customer_phone": ["Too long."]} -> "Too long."
export const readableError = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(readableError).join(" ");
  if (typeof data === "object") return Object.values(data).map(readableError).join(" ");
  return String(data);
};

// ---------- keeping the answers while the customer signs in ----------
const draftKey = (shopId) => `dryme_booking_draft_${shopId}`;

export const saveDraft = (shopId, draft) => {
  try {
    sessionStorage.setItem(draftKey(shopId), JSON.stringify(draft));
  } catch {
    // storage unavailable (private mode): they'll just have to fill it in again
  }
};

export const loadDraft = (shopId) => {
  try {
    const raw = sessionStorage.getItem(draftKey(shopId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearDraft = (shopId) => {
  try {
    sessionStorage.removeItem(draftKey(shopId));
  } catch {
    // nothing to clear
  }
};