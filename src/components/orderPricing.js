// Pure helpers for per-kg weigh-in orders (no React, easy to test).
//
// The flow: the customer books with an ESTIMATE (price_status "estimate"); the shop weighs the laundry
// and enters the real weight; the order becomes "final" (payable) if the weighed price is within the
// tolerance of the estimate, otherwise "needs_approval" until the customer accepts. The server decides
// all of this. These helpers only read the order and PREVIEW the result for the shop.

// Only per-kg orders booked through the app have an estimate to compare against.
export const isWeighInOrder = (order) => order?.estimated_weight != null;

export const isWeighed = (order) => Boolean(order?.weighed_at);

export const awaitingWeighIn = (order) => isWeighInOrder(order) && order.price_status === "estimate";

export const needsApproval = (order) => isWeighInOrder(order) && order.price_status === "needs_approval";

// The weight is locked once the customer has paid or a payment prompt is in flight.
export const paymentLocked = (order) =>
  order?.payment_status === "paid" || order?.payment_status === "pending_payment";

// The shop may enter or correct the weight: accepted order, not yet paid.
export const canWeigh = (order) =>
  isWeighInOrder(order) && order.status === "confirmed" && !paymentLocked(order);

// The customer may be asked to pay: per-item and older orders always, weigh-in orders once final.
export const canPay = (order) => !isWeighInOrder(order) || order.price_status === "final";

// The shop may start washing: weigh-in orders need a final price AND payment first.
export const canStartWashing = (order) =>
  !isWeighInOrder(order) || (order.price_status === "final" && order.payment_status === "paid");

// 4.50 -> "4.5 kg"
export const formatKg = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${n} kg` : "—";
};

const cents = (value) => Math.round(Number(value) * 100);

// How the weighed price compares with the estimate: { diff, pct } in shillings / percent, or null.
export const priceChange = (order) => {
  if (!isWeighInOrder(order) || order.estimated_total_price == null || order.total_price == null) return null;
  const estimate = cents(order.estimated_total_price);
  const total = cents(order.total_price);
  if (!estimate) return null;
  return { diff: (total - estimate) / 100, pct: Math.round(((total - estimate) / estimate) * 1000) / 10 };
};

// Live preview for the shop while typing a weight. Returns null for anything the server would reject.
// Integer cents throughout, and the margin is floored, so the boundary agrees with the server's exact decimals.
export const previewWeighIn = (order, weightText) => {
  const text = String(weightText ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  const hundredths = Math.round(Number(text) * 100);
  if (hundredths < 10 || hundredths > 99999) return null;

  const rateCents = cents(order.unit_price ?? order.service?.price);
  const estimateCents = cents(order.estimated_total_price);
  if (!Number.isFinite(rateCents) || !Number.isFinite(estimateCents) || !estimateCents) return null;

  const tolerance = Number(order.weigh_in_tolerance ?? 0.15);
  const totalCents = Math.round((rateCents * hundredths) / 100);
  const limitCents = Math.floor(estimateCents * (1 + tolerance) + 1e-6);

  return {
    weight: hundredths / 100,
    rate: rateCents / 100,
    total: totalCents / 100,
    estimateTotal: estimateCents / 100,
    diff: (totalCents - estimateCents) / 100,
    pct: Math.round(((totalCents - estimateCents) / estimateCents) * 1000) / 10,
    needsApproval: totalCents > limitCents,
  };
};