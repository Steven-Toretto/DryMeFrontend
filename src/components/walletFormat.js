// Pure helpers for the owner Wallet screen (no React, easy to test).

// "KES 360", "KES 360.50" — whole numbers stay clean, cents only when present.
export const kes = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "KES —";
  return `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

// 254712345678 -> "0712 345 678". Anything else is returned unchanged.
export const prettyPhone = (value) => {
  const s = String(value ?? "").trim();
  if (/^254\d{9}$/.test(s)) {
    const local = `0${s.slice(3)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return s;
};

export const prettyDestination = (method, destination) =>
  method === "mpesa" ? prettyPhone(destination) : String(destination ?? "");

export const padId = (id) => String(id).padStart(5, "0");

export const formatTime = (dt) =>
  new Date(dt).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// The backend always answers {"error": "<sentence>"}; throttling is a bare 429.
export const apiError = (err, fallback) => {
  if (err?.response?.status === 429) {
    return "Too many attempts — please wait a little and try again.";
  }
  return err?.response?.data?.error || fallback;
};

// Merge a freshly fetched page into an existing list without duplicates.
export const dedupeById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// Percent for display: 0.10 -> 10, 0.075 -> 7.5
export const percent = (rate) => Math.round(Number(rate) * 1000) / 10;