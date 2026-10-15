// Run with:  node --test tests/notificationFormat.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  timeAgo, notificationInk, isWalletType, notificationTarget, badgeText,
} from "../src/components/notificationFormat.js";

const NOW = new Date("2026-10-12T12:00:00Z").getTime();
const ago = (ms) => new Date(NOW - ms).toISOString();

test("timeAgo buckets", () => {
  assert.equal(timeAgo(ago(20 * 1000), NOW), "just now");
  assert.equal(timeAgo(ago(5 * 60 * 1000), NOW), "5 min ago");
  assert.equal(timeAgo(ago(3 * 3600 * 1000), NOW), "3 h ago");
  assert.equal(timeAgo(ago(2 * 86400 * 1000), NOW), "2 d ago");
  assert.match(timeAgo(ago(30 * 86400 * 1000), NOW), /Sept|Sep/);   // older than a week -> a date
  assert.equal(timeAgo(new Date(NOW + 60000).toISOString(), NOW), "just now");   // clock skew never goes negative
});

test("money notifications are wallet types, order notifications are not", () => {
  for (const t of ["payout_approved", "payout_paid", "payout_rejected", "payout_failed", "wallet_credited"]) {
    assert.equal(isWalletType(t), true, t);
  }
  for (const t of ["order_confirmed", "order_cancelled", "new_review"]) assert.equal(isWalletType(t), false, t);
});

test("owners go to a dashboard view, customers to their orders", () => {
  assert.deepEqual(notificationTarget({ notif_type: "payout_paid" }, "owner"), { kind: "view", view: "wallet", to: "/dashboard" });
  assert.deepEqual(notificationTarget({ notif_type: "order_cancelled" }, "owner"), { kind: "view", view: "orders", to: "/dashboard" });
  assert.deepEqual(notificationTarget({ notif_type: "order_completed" }, "customer"), { kind: "route", to: "/orders" });
  assert.deepEqual(notificationTarget(undefined, undefined), { kind: "route", to: "/orders" });
});

test("ink follows the meaning", () => {
  assert.equal(notificationInk("payout_paid"), "#3F6B47");
  assert.equal(notificationInk("payout_rejected"), "#9C3B2E");
  assert.equal(notificationInk("order_declined"), "#9C3B2E");
  assert.equal(notificationInk("new_review"), "#B5811E");
  assert.equal(notificationInk("order_washing"), "#35548C");
});

test("badgeText", () => {
  assert.equal(badgeText(0), "");
  assert.equal(badgeText(undefined), "");
  assert.equal(badgeText(3), "3");
  assert.equal(badgeText(9), "9");
  assert.equal(badgeText(10), "9+");
  assert.equal(badgeText("12"), "9+");
});
