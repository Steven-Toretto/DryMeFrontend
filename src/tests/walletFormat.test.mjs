// Run with:  node --test tests/walletFormat.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  kes, prettyPhone, prettyDestination, padId, apiError, dedupeById, percent,
} from "../components/walletFormat.js";

test("kes keeps whole numbers clean and shows cents only when present", () => {
  assert.equal(kes("360.00"), "KES 360");
  assert.equal(kes(360), "KES 360");
  assert.equal(kes("1234.5"), "KES 1,234.50");
  assert.equal(kes("0.00"), "KES 0");
  assert.equal(kes(null), "KES 0");        // Number(null) === 0
  assert.equal(kes("abc"), "KES —");
  assert.equal(kes(undefined), "KES —");
});

test("prettyPhone formats Safaricom numbers and leaves everything else alone", () => {
  assert.equal(prettyPhone("254712345678"), "0712 345 678");
  assert.equal(prettyPhone("254112345678"), "0112 345 678");
  assert.equal(prettyPhone("0712345678"), "0712345678");
  assert.equal(prettyPhone("KCB 123"), "KCB 123");
  assert.equal(prettyPhone(null), "");
});

test("prettyDestination only reformats M-Pesa numbers", () => {
  assert.equal(prettyDestination("mpesa", "254712345678"), "0712 345 678");
  assert.equal(prettyDestination("bank", "KCB 1234567890 Jane"), "KCB 1234567890 Jane");
});

test("padId matches the claim-number style used on orders", () => {
  assert.equal(padId(5), "00005");
  assert.equal(padId(12345), "12345");
});

test("apiError prefers the server sentence, handles throttling, falls back", () => {
  assert.equal(apiError({ response: { status: 400, data: { error: "Insufficient balance." } } }, "x"), "Insufficient balance.");
  assert.match(apiError({ response: { status: 429, data: { detail: "throttled" } } }, "x"), /Too many attempts/);
  assert.equal(apiError({ response: { status: 500, data: "<html>" } }, "fallback"), "fallback");
  assert.equal(apiError(new Error("network"), "fallback"), "fallback");
  assert.equal(apiError(undefined, "fallback"), "fallback");
});

test("dedupeById keeps the first occurrence and order", () => {
  assert.deepEqual(
    dedupeById([{ id: 2, v: "a" }, { id: 1, v: "b" }, { id: 2, v: "c" }]),
    [{ id: 2, v: "a" }, { id: 1, v: "b" }],
  );
});

test("percent", () => {
  assert.equal(percent("0.10"), 10);
  assert.equal(percent(0.075), 7.5);
});