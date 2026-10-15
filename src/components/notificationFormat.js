// Pure helpers for the notification bell (no React, easy to test).

const WALLET_TYPES = new Set([
  "payout_approved",
  "payout_paid",
  "payout_rejected",
  "payout_failed",
  "wallet_credited",
]);

const GOOD = new Set(["order_confirmed", "order_completed", "payout_paid", "wallet_credited", "payout_approved"]);
const BAD = new Set(["order_declined", "order_cancelled", "payout_rejected", "payout_failed"]);

// "just now", "5 min ago", "3 h ago", "2 d ago", then a short date.
export const timeAgo = (dt, now = Date.now()) => {
  const seconds = Math.max(0, Math.round((now - new Date(dt).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(dt).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
};

// Ink colour for a notification's icon, matching the claim-ticket palette.
export const notificationInk = (type) => {
  if (BAD.has(type)) return "#9C3B2E";
  if (GOOD.has(type)) return "#3F6B47";
  if (type === "new_review") return "#B5811E";
  return "#35548C";
};

export const isWalletType = (type) => WALLET_TYPES.has(type);

// Where tapping a notification should take the person.
//   owners    -> a view inside the dashboard ("wallet" for money, "orders" for everything else)
//   customers -> their orders page
export const notificationTarget = (notification, role) => {
  if (role === "owner") {
    return { kind: "view", view: isWalletType(notification?.notif_type) ? "wallet" : "orders", to: "/dashboard" };
  }
  return { kind: "route", to: "/orders" };
};

// Badge text: nothing for 0, "9+" past nine.
export const badgeText = (count) => {
  const n = Number(count) || 0;
  if (n <= 0) return "";
  return n > 9 ? "9+" : String(n);
};