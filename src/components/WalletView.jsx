import { useCallback, useContext, useEffect, useState } from "react";
import {
  Wallet, Smartphone, Landmark, ArrowDownLeft, ArrowUpRight, RotateCcw,
  RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle, Info,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import {
  getWallet, getWalletTransactions, getPayouts, getPayoutQuote, requestPayout, getProfile,
} from "../api";
import {
  kes, prettyPhone, prettyDestination, padId, formatTime, apiError, dedupeById, percent,
} from "./walletFormat";

// ===========================
// PAPER / INK PALETTE — same as Orders / Dashboard
// ===========================
const PAPER = "#F1EAD8";
const CARD = "#FBF8EF";
const INK = "#2B2A25";
const BLUE = "#35548C";
const GREEN = "#3F6B47";
const RED = "#9C3B2E";
const AMBER = "#B5811E";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

const PAYOUT_STAMPS = {
  requested: { label: "REQUESTED", ink: AMBER },
  approved: { label: "APPROVED", ink: BLUE },
  paid: { label: "PAID", ink: GREEN },
  rejected: { label: "REJECTED", ink: RED },
  failed: { label: "FAILED", ink: RED },
};

const LEDGER_META = {
  sale_credit: { label: "Order earnings", ink: GREEN },
  payout_hold: { label: "Withdrawal", ink: INK },
  payout_reversal: { label: "Withdrawal returned", ink: BLUE },
  adjustment: { label: "Adjustment", ink: "#6B675D" },
};

const labelStyle = { fontFamily: TICKET_FONT, color: `${INK}66` };
const inputStyle = { borderColor: `${INK}25`, background: PAPER, color: INK };

// ===========================
// SMALL PRESENTATIONAL PIECES
// ===========================
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function Ticket({ children }) {
  return (
    <div
      className="relative rounded-sm border"
      style={{ background: CARD, borderColor: `${INK}1F`, boxShadow: `0 1px 0 ${INK}0A` }}
    >
      {/* punch hole — the tag this ticket hangs from */}
      <div
        className="absolute -top-2 left-6 w-3.5 h-3.5 rounded-full border"
        style={{ background: PAPER, borderColor: `${INK}25` }}
      />
      {children}
    </div>
  );
}

function Perforation() {
  return <div className="border-t-2 border-dashed my-4" style={{ borderColor: `${INK}30` }} />;
}

function Banner({ kind = "info", children }) {
  const ink = kind === "error" ? RED : kind === "success" ? GREEN : BLUE;
  const icon =
    kind === "error" ? <AlertTriangle size={15} /> : kind === "success" ? <CheckCircle2 size={15} /> : <Info size={15} />;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="flex items-start gap-2.5 p-3.5 border rounded-sm"
      style={{ borderColor: `${ink}40`, background: `${ink}0D`, color: ink }}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function Stamp({ status, rotate = -4 }) {
  const stamp = PAYOUT_STAMPS[status] || { label: String(status || "—").toUpperCase(), ink: "#6B675D" };
  return (
    <div
      className="shrink-0 text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 border-2 rounded-[3px] select-none whitespace-nowrap"
      style={{
        fontFamily: TICKET_FONT,
        color: stamp.ink,
        borderColor: stamp.ink,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.88,
        mixBlendMode: "multiply",
      }}
    >
      {stamp.label}
    </div>
  );
}

function LedgerIcon({ type }) {
  if (type === "sale_credit") return <ArrowDownLeft size={16} />;
  if (type === "payout_hold") return <ArrowUpRight size={16} />;
  if (type === "payout_reversal") return <RotateCcw size={15} />;
  return <Info size={15} />;
}

// Receipt line, printed like a till slip.
function ReceiptLine({ label, value, strong = false }) {
  return (
    <div
      className={`flex justify-between gap-3 py-1.5 ${strong ? "" : "border-b border-dashed"}`}
      style={{ borderColor: `${INK}20` }}
    >
      <span style={{ color: `${INK}80` }}>{label}</span>
      <span className={strong ? "font-black" : "font-bold"} style={{ color: INK }}>{value}</span>
    </div>
  );
}

function PayoutReceipt({ payout }) {
  return (
    <div className="text-sm" style={{ fontFamily: TICKET_FONT, color: INK }}>
      <ReceiptLine label="WITHDRAWN" value={kes(payout.amount)} />
      <ReceiptLine label="TRANSFER FEE" value={`− ${kes(payout.fee)}`} />
      <ReceiptLine label="YOU RECEIVE" value={kes(payout.net_amount)} strong />
    </div>
  );
}

// ===========================
// BALANCE
// ===========================
function BalanceCard({ wallet, onRefresh, refreshing }) {
  const rate = percent(wallet.commission_rate);
  return (
    <Ticket>
      <div className="p-5 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.25em] flex items-center gap-1.5" style={labelStyle}>
              <Wallet size={12} /> AVAILABLE TO WITHDRAW
            </p>
            <p className="text-4xl font-black mt-1.5 break-words" style={{ color: INK }}>
              {kes(wallet.balance)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh wallet"
            className="shrink-0 w-11 h-11 -mt-1 -mr-2 flex items-center justify-center rounded-sm hover:bg-black/5 disabled:opacity-50"
            style={{ color: `${INK}99` }}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <Perforation />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] flex items-center gap-1" style={labelStyle}>
              <Clock size={11} /> PENDING
            </p>
            <p className="text-lg font-bold mt-0.5" style={{ color: INK }}>{kes(wallet.pending_earnings)}</p>
            <p className="text-[11px] mt-0.5" style={{ color: `${INK}70` }}>from paid orders in progress</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em]" style={labelStyle}>EARNED SO FAR</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: INK }}>{kes(wallet.lifetime_earned)}</p>
            <p className="text-[11px] mt-0.5" style={{ color: `${INK}70` }}>after commission</p>
          </div>
        </div>

        <p className="text-xs mt-4 leading-relaxed" style={{ color: `${INK}80` }}>
          {Number.isFinite(rate) ? `DryMe keeps ${rate}% of each completed order. ` : ""}
          Earnings land here once an order is paid and completed.
        </p>
      </div>
    </Ticket>
  );
}

// ===========================
// A WITHDRAWAL IS ALREADY IN FLIGHT
// ===========================
function OpenPayoutCard({ payout }) {
  const approved = payout.status === "approved";
  return (
    <Ticket>
      <div className="p-5 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.25em]" style={labelStyle}>WITHDRAWAL IN PROGRESS</p>
            <p className="text-xl font-bold mt-1" style={{ fontFamily: TICKET_FONT, color: INK }}>
              No. {padId(payout.id)}
            </p>
          </div>
          <Stamp status={payout.status} rotate={payout.id % 2 === 0 ? -4 : 4} />
        </div>

        <Perforation />

        <PayoutReceipt payout={payout} />

        <p className="text-sm mt-3" style={{ color: INK }}>
          To <strong>{prettyDestination(payout.method, payout.destination)}</strong>
          {payout.method === "bank" ? " (bank)" : " (M-Pesa)"}
        </p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: `${INK}80` }}>
          {approved
            ? "Approved — your payment is being sent."
            : "We've got your request. DryMe pays withdrawals out manually, and this will show as PAID once it's sent."}{" "}
          You can request another withdrawal once this one is finished.
        </p>
      </div>
    </Ticket>
  );
}

// ===========================
// REQUEST A WITHDRAWAL
// ===========================
function WithdrawCard({ balance, fees, defaults, onRequested }) {
  const [method, setMethod] = useState("mpesa");
  const [typed, setTyped] = useState({ mpesa: null, bank: null }); // what the owner typed; null = use the default
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState({ key: "", data: null, error: "" });

  const destination = typed[method] ?? defaults[method] ?? "";
  const amountText = amount.trim();
  const amountNum = amountText ? Number(amountText) : null;
  const overBalance = amountNum !== null && amountNum > balance;
  const quoteKey = `${method}:${amountText}`;
  const quoteReady = quote.key === quoteKey;

  // Live fee preview — the server prices it, so a future change to fees needs no frontend change.
  useEffect(() => {
    if (!amountText || overBalance) return undefined;

    let cancelled = false;
    const key = `${method}:${amountText}`;
    const timer = setTimeout(async () => {
      try {
        const data = await getPayoutQuote(amountText, method);
        if (!cancelled) setQuote({ key, data, error: "" });
      } catch (err) {
        if (!cancelled) setQuote({ key, data: null, error: apiError(err, "Couldn't work out the fee for that amount.") });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountText, method, overBalance]);

  const priced = quoteReady && !quote.error && quote.data ? quote.data : null;
  const valid = Boolean(priced) && !overBalance && destination.trim().length > 0;

  let hint = null;
  if (overBalance) hint = { kind: "error", text: "That's more than your available balance." };
  else if (amountText && quoteReady && quote.error) hint = { kind: "error", text: quote.error };
  else if (amountText && !quoteReady) hint = { kind: "muted", text: "Working out the fee…" };

  const changeAmount = (value) => {
    setAmount(value.replace(/\D/g, "")); // whole shillings only
    setConfirming(false);
    setError("");
  };
  const changeMethod = (next) => {
    setMethod(next);
    setConfirming(false);
    setError("");
  };
  const changeDestination = (value) => {
    setTyped((t) => ({ ...t, [method]: value }));
    setConfirming(false);
    setError("");
  };
  const withdrawAll = () => changeAmount(String(Math.floor(balance)));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await requestPayout({ amount: amountText, method, destination: destination.trim() });
      setAmount("");
      setConfirming(false);
      await onRequested(res.payout);
    } catch (err) {
      setError(apiError(err, "Couldn't request that withdrawal. Try again."));
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (balance < 1) {
    return (
      <Ticket>
        <div className="p-5 pt-7 text-center">
          <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center mx-auto mb-3" style={{ borderColor: `${INK}30` }}>
            <Wallet size={20} style={{ color: `${INK}55` }} />
          </div>
          <p className="font-semibold" style={{ color: INK }}>Nothing to withdraw yet</p>
          <p className="text-sm mt-1" style={{ color: `${INK}80` }}>
            Once an order is paid and you mark it completed, your earnings show up here.
          </p>
        </div>
      </Ticket>
    );
  }

  const fee = Number(fees?.[method]);
  const methodButton = (key, Icon, text) => (
    <button
      type="button"
      onClick={() => changeMethod(key)}
      aria-pressed={method === key}
      className="flex flex-col items-center justify-center gap-1.5 min-h-[64px] py-3 rounded-sm border-2 text-sm font-bold transition cursor-pointer"
      style={
        method === key
          ? { borderColor: BLUE, color: BLUE, background: `${BLUE}0D` }
          : { borderColor: `${INK}20`, color: `${INK}70` }
      }
    >
      <Icon size={18} />
      {text}
    </button>
  );

  return (
    <Ticket>
      <div className="p-5 pt-7">
        <p className="text-[10px] tracking-[0.25em]" style={labelStyle}>WITHDRAW</p>
        <h2 className="text-lg font-bold mt-0.5" style={{ color: INK }}>Request a payout</h2>
        {fee > 0 && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: `${INK}80` }}>
            A {kes(fee)} transfer fee applies. It's taken out of the amount you withdraw.
          </p>
        )}

        {/* METHOD */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {methodButton("mpesa", Smartphone, "M-Pesa")}
          {methodButton("bank", Landmark, "Bank")}
        </div>

        {/* DESTINATION */}
        <div className="mt-4">
          <label htmlFor="payout-destination" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={labelStyle}>
            {method === "mpesa" ? "M-Pesa number" : "Bank details"}
          </label>
          {method === "mpesa" ? (
            <input
              id="payout-destination"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0712 345 678"
              value={destination}
              onChange={(e) => changeDestination(e.target.value)}
              className="w-full border rounded-sm px-4 py-3 text-base min-h-[48px] focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          ) : (
            <textarea
              id="payout-destination"
              rows={2}
              placeholder="Bank name, account name, account number"
              value={destination}
              onChange={(e) => changeDestination(e.target.value)}
              className="w-full border rounded-sm px-4 py-3 text-base focus:outline-none focus:ring-2 resize-none"
              style={inputStyle}
            />
          )}
        </div>

        {/* AMOUNT */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="payout-amount" className="block text-xs font-bold uppercase tracking-wide" style={labelStyle}>
              Amount (KES)
            </label>
            <button
              type="button"
              onClick={withdrawAll}
              className="text-xs font-semibold px-2 py-2 -my-2 -mr-2 hover:underline"
              style={{ color: BLUE }}
            >
              Withdraw all ({kes(Math.floor(balance))})
            </button>
          </div>
          <input
            id="payout-amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => changeAmount(e.target.value)}
            className="w-full border rounded-sm px-4 py-3 text-lg font-bold min-h-[48px] focus:outline-none focus:ring-2"
            style={{ ...inputStyle, fontFamily: TICKET_FONT }}
          />
          <p className="text-[11px] mt-1.5" aria-live="polite" style={{ color: hint?.kind === "error" ? RED : `${INK}70`, minHeight: "1rem" }}>
            {hint ? hint.text : "Whole shillings only."}
          </p>
        </div>

        {/* RECEIPT */}
        {amountText && (
          <div className="mt-3 p-4 border rounded-sm" style={{ borderColor: `${INK}1F`, background: `${INK}05` }}>
            <div className="text-sm" style={{ fontFamily: TICKET_FONT, color: INK }}>
              <ReceiptLine label="WITHDRAW" value={priced ? kes(priced.amount) : "—"} />
              <ReceiptLine label="TRANSFER FEE" value={priced ? `− ${kes(priced.fee)}` : "—"} />
              <ReceiptLine label="YOU RECEIVE" value={priced ? kes(priced.net_amount) : "—"} strong />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Banner kind="error">{error}</Banner>
          </div>
        )}

        {/* ACTION */}
        <div className="mt-4">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={!valid}
              className="w-full min-h-[48px] py-3 rounded-sm text-white font-bold text-sm transition disabled:opacity-50"
              style={{ background: BLUE }}
            >
              Review withdrawal
            </button>
          ) : (
            <div className="p-4 border rounded-sm" style={{ borderColor: `${AMBER}40`, background: `${AMBER}0D` }}>
              <p className="text-sm" style={{ color: INK }}>
                Send <strong>{priced ? kes(priced.net_amount) : ""}</strong> to{" "}
                <strong>{destination.trim()}</strong>?
              </p>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: `${INK}99` }}>
                The full amount leaves your wallet now and the request can't be edited. If we can't pay it,
                the full amount comes back.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                  className="min-h-[48px] py-3 rounded-sm border-2 text-sm font-bold disabled:opacity-50"
                  style={{ borderColor: `${INK}25`, color: `${INK}99` }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="min-h-[48px] py-3 rounded-sm text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: GREEN }}
                >
                  {submitting ? (<><Spinner /> Requesting…</>) : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] mt-3 leading-relaxed" style={{ color: `${INK}70` }}>
          Withdrawals are reviewed and paid manually by DryMe.
        </p>
      </div>
    </Ticket>
  );
}

// ===========================
// HISTORY
// ===========================
function LoadMore({ state, onMore }) {
  if (!state.hasMore) return null;
  return (
    <button
      type="button"
      onClick={onMore}
      disabled={state.loadingMore}
      className="w-full min-h-[48px] mt-3 rounded-sm border-2 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
      style={{ borderColor: `${BLUE}40`, color: BLUE }}
    >
      {state.loadingMore ? (<><Spinner /> Loading…</>) : "Load more"}
    </button>
  );
}

function EmptyNote({ children }) {
  return (
    <div className="border rounded-sm p-8 text-center text-sm" style={{ background: CARD, borderColor: `${INK}1A`, color: `${INK}80` }}>
      {children}
    </div>
  );
}

function LedgerList({ state, onMore }) {
  if (state.items.length === 0) {
    return <EmptyNote>No activity yet — earnings show up here once an order is paid and completed.</EmptyNote>;
  }
  return (
    <>
      <div className="border rounded-sm px-4" style={{ background: CARD, borderColor: `${INK}1F` }}>
        <ul>
          {state.items.map((tx) => {
            const meta = LEDGER_META[tx.type] || { label: tx.type_label || tx.type, ink: INK };
            const n = Number(tx.amount);
            const sign = n > 0 ? "+" : n < 0 ? "−" : "";
            return (
              <li
                key={tx.id}
                className="flex items-start gap-3 py-3.5 border-b border-dashed last:border-b-0"
                style={{ borderColor: `${INK}20` }}
              >
                <div
                  className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: meta.ink, color: meta.ink }}
                >
                  <LedgerIcon type={tx.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold" style={{ color: INK }}>{meta.label}</p>
                  {tx.note && <p className="text-xs break-words" style={{ color: `${INK}80` }}>{tx.note}</p>}
                  <p className="text-[11px] mt-0.5" style={{ fontFamily: TICKET_FONT, color: `${INK}60` }}>
                    {formatTime(tx.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ fontFamily: TICKET_FONT, color: n > 0 ? GREEN : INK }}>
                    {sign}{kes(Math.abs(n))}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: `${INK}60` }}>Balance {kes(tx.balance_after)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <LoadMore state={state} onMore={onMore} />
    </>
  );
}

function PayoutList({ state, onMore }) {
  if (state.items.length === 0) {
    return <EmptyNote>No withdrawals yet.</EmptyNote>;
  }
  return (
    <>
      <div className="space-y-4">
        {state.items.map((payout) => {
          const stamp = PAYOUT_STAMPS[payout.status];
          const returned = payout.status === "rejected" || payout.status === "failed";
          return (
            <Ticket key={payout.id}>
              <div className="p-4 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em]" style={labelStyle}>WITHDRAWAL No.</p>
                    <p className="text-lg font-bold" style={{ fontFamily: TICKET_FONT, color: INK }}>{padId(payout.id)}</p>
                  </div>
                  <Stamp status={payout.status} rotate={payout.id % 2 === 0 ? -4 : 4} />
                </div>

                <div className="mt-3">
                  <PayoutReceipt payout={payout} />
                </div>

                <p className="text-xs mt-3 break-words" style={{ color: `${INK}99` }}>
                  {payout.method === "bank" ? "Bank" : "M-Pesa"} · {prettyDestination(payout.method, payout.destination)}
                </p>
                <p className="text-[11px] mt-1" style={{ fontFamily: TICKET_FONT, color: `${INK}60` }}>
                  Requested {formatTime(payout.requested_at)}
                  {payout.paid_at ? ` · Paid ${formatTime(payout.paid_at)}` : ""}
                </p>

                {payout.status === "paid" && payout.reference && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: GREEN }}>
                    Reference: {payout.reference}
                  </p>
                )}

                {returned && (
                  <div className="mt-3 p-3 border rounded-sm" style={{ borderColor: `${(stamp?.ink) || RED}40`, background: `${(stamp?.ink) || RED}0D` }}>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: RED }}>
                      <XCircle size={13} /> {payout.status === "rejected" ? "Not paid" : "Transfer failed"}
                    </p>
                    {payout.reject_reason && (
                      <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: `${INK}CC` }}>{payout.reject_reason}</p>
                    )}
                    <p className="text-xs mt-2 font-medium" style={{ color: `${INK}99` }}>
                      {kes(payout.amount)} was returned to your wallet.
                    </p>
                  </div>
                )}
              </div>
            </Ticket>
          );
        })}
      </div>
      <LoadMore state={state} onMore={onMore} />
    </>
  );
}

// ===========================
// THE SCREEN
// ===========================
const EMPTY_PAGE = { items: [], page: 1, hasMore: false, loadingMore: false };

function WalletView() {
  const { user } = useContext(AuthContext);

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [tx, setTx] = useState(EMPTY_PAGE);
  const [payouts, setPayouts] = useState(EMPTY_PAGE);
  const [profilePhone, setProfilePhone] = useState("");
  const [tab, setTab] = useState("activity");
  const [success, setSuccess] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const [w, t, p] = await Promise.all([getWallet(), getWalletTransactions(1), getPayouts(1)]);
      setWallet(w);
      setTx({ items: t.results ?? t, page: 1, hasMore: Boolean(t.next), loadingMore: false });
      setPayouts({ items: p.results ?? p, page: 1, hasMore: Boolean(p.next), loadingMore: false });
      setLoadError("");
      setStatus("ready");
    } catch (err) {
      console.error("Wallet load failed:", err.response?.data || err.message);
      setLoadError("Couldn't load your wallet.");
      setStatus((s) => (s === "ready" ? s : "error")); // keep showing the last good numbers on a failed refresh
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Pre-fill the M-Pesa field with the owner's profile number (once).
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (!cancelled) setProfilePhone(profile?.phone || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hasOpenPayout = Boolean(wallet?.open_payout);

  // While a withdrawal is open, check every 30s so APPROVED / PAID shows up without a manual refresh.
  useEffect(() => {
    if (!hasOpenPayout) return undefined;
    const id = setInterval(() => {
      loadAll();
    }, 30000);
    return () => clearInterval(id);
  }, [hasOpenPayout, loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleRequested = async (payout) => {
    setSuccess(
      `Withdrawal requested. We'll send ${kes(payout.net_amount)} to ${prettyDestination(payout.method, payout.destination)} after review.`,
    );
    setTab("withdrawals");
    setTimeout(() => setSuccess(""), 12000);
    await loadAll();
  };

  const loadMore = async (fetchPage, state, setState) => {
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const data = await fetchPage(state.page + 1);
      setState((s) => ({
        items: dedupeById([...s.items, ...(data.results ?? data)]),
        page: s.page + 1,
        hasMore: Boolean(data.next),
        loadingMore: false,
      }));
    } catch (err) {
      console.error("Load more failed:", err.response?.data || err.message);
      setState((s) => ({ ...s, loadingMore: false }));
    }
  };

  // ---------- LOADING ----------
  if (status === "loading") {
    return (
      <div className="max-w-2xl space-y-5" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-sm border p-6 animate-pulse" style={{ background: CARD, borderColor: `${INK}1A` }}>
            <div className="h-3 w-32 bg-black/10 rounded mb-3" />
            <div className="h-9 w-44 bg-black/10 rounded mb-4" />
            <div className="h-3 w-full bg-black/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ---------- ERROR (nothing to show yet) ----------
  if (status === "error") {
    return (
      <div className="max-w-2xl">
        <Ticket>
          <div className="p-6 pt-8 text-center">
            <AlertTriangle size={26} className="mx-auto mb-3" style={{ color: RED }} />
            <p className="font-semibold" style={{ color: INK }}>{loadError || "Couldn't load your wallet."}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                loadAll();
              }}
              className="mt-4 min-h-[48px] px-6 rounded-sm text-white font-bold text-sm"
              style={{ background: BLUE }}
            >
              Try again
            </button>
          </div>
        </Ticket>
      </div>
    );
  }

  // ---------- READY ----------
  const lastDestination = (method) => payouts.items.find((p) => p.method === method)?.destination || "";
  const defaults = {
    mpesa: prettyPhone(lastDestination("mpesa")) || prettyPhone(profilePhone) || prettyPhone(user?.phone) || "",
    bank: lastDestination("bank"),
  };

  const tabs = [
    { key: "activity", label: "ACTIVITY" },
    { key: "withdrawals", label: "WITHDRAWALS" },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {success && <Banner kind="success">{success}</Banner>}
      {loadError && <Banner kind="error">{loadError} Showing your last known numbers.</Banner>}

      <BalanceCard wallet={wallet} onRefresh={handleRefresh} refreshing={refreshing} />

      {hasOpenPayout ? (
        <OpenPayoutCard payout={wallet.open_payout} />
      ) : (
        <WithdrawCard
          balance={Number(wallet.balance)}
          fees={wallet.payout_fees}
          defaults={defaults}
          onRequested={handleRequested}
        />
      )}

      {/* HISTORY */}
      <div>
        <div className="flex gap-6 border-b mb-4" style={{ borderColor: `${INK}1F` }} role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="pb-3 min-h-[44px] text-xs tracking-[0.2em] font-bold transition"
              style={{
                fontFamily: TICKET_FONT,
                color: tab === t.key ? INK : `${INK}55`,
                borderBottom: tab === t.key ? `3px solid ${INK}` : "3px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "activity" ? (
          <LedgerList state={tx} onMore={() => loadMore(getWalletTransactions, tx, setTx)} />
        ) : (
          <PayoutList state={payouts} onMore={() => loadMore(getPayouts, payouts, setPayouts)} />
        )}
      </div>
    </div>
  );
}

export default WalletView;