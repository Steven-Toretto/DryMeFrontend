import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getOrders, getOwnerOrders, getArchivedOrders,
  getArchivedOwnerOrders, updateOrderStatus, archiveOrder,
  initiatePayment, checkPaymentStatus, updateOrderNotes,
  declineOrder, cancelOrder,
} from "../api";
import {
  Phone, MapPin, Archive, Package, Droplets,
  CheckCircle2, RotateCcw, CreditCard,
  Shirt, StickyNote, Pencil, ChevronDown,
  ThumbsUp, XCircle, AlertTriangle, Ban,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// ===========================
// PAPER / INK PALETTE
// ===========================
const PAPER = "#F1EAD8";     // page — kraft paper
const CARD = "#FBF8EF";      // ticket stock — slightly lighter
const INK = "#2B2A25";       // near-black ink
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

const STAMP_STYLES = {
  pending:   { label: "PENDING",   ink: "#B5811E" },
  confirmed: { label: "CONFIRMED", ink: "#35548C" },
  washing:   { label: "WASHING",   ink: "#1C6E8C" },
  completed: { label: "COMPLETE",  ink: "#3F6B47" },
  declined:  { label: "DECLINED",  ink: "#9C3B2E" },
  cancelled: { label: "VOID",      ink: "#6B675D" },
};

function getStamp(status) {
  return STAMP_STYLES[status] || { label: (status || "—").toUpperCase(), ink: "#6B675D" };
}

// A rotated ink-stamp badge — the ticket's one bold flourish. Everything
// else on the card stays quiet so this is what the eye lands on first.
function StatusStamp({ status, rotate = -4 }) {
  const stamp = getStamp(status);
  return (
    <div
      className="shrink-0 text-[11px] font-bold tracking-[0.18em] px-3 py-1.5 border-[3px] rounded-[3px] select-none whitespace-nowrap"
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

// Prefer the exact GPS pin captured at booking over a text search,
// which only centers a whole neighborhood.
function getMapInfo(order) {
  if (order.pickup_lat && order.pickup_lng) {
    return {
      url: `https://www.google.com/maps?q=${order.pickup_lat},${order.pickup_lng}`,
      label: "Exact pin",
    };
  }
  if (order.customer_location) {
    return {
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_location)}`,
      label: "Map",
    };
  }
  return null;
}

function getPaymentLabel(ps) {
  switch (ps) {
    case "paid":            return { label: "Paid", ink: "#3F6B47" };
    case "pending_payment": return { label: "Pending", ink: "#B5811E" };
    case "failed":           return { label: "Failed", ink: "#9C3B2E" };
    default:                 return { label: "Unpaid", ink: "#6B675D" };
  }
}

function Orders() {
  const { token, user } = useContext(AuthContext);
  const role = user?.role;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [pollingOrderId, setPollingOrderId] = useState(null);

  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNoteId, setSavingNoteId] = useState(null);

  const [decliningOrderId, setDecliningOrderId] = useState(null);
  const [declineReasonDraft, setDeclineReasonDraft] = useState("");
  const [decliningSubmitId, setDecliningSubmitId] = useState(null);
  const [declineError, setDeclineError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);

  // Secondary reference info (customer details, full timeline) is tucked
  // behind a disclosure per card so the ticket isn't shouting everything
  // at once — only expand what you came to check.
  const [expandedIds, setExpandedIds] = useState({});
  const toggleExpanded = (id) => setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatTime = (dt) =>
    new Date(dt).toLocaleString("en-KE", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });

  // ===========================
  // MPESA
  // ===========================
  const handlePay = async (orderId) => {
    setPaymentMessage("");
    setPayingOrderId(orderId);
    try {
      const res = await initiatePayment(orderId);
      setPaymentMessage(res.message || "Payment prompt sent to your phone!");
      startPolling(orderId);
    } catch (err) {
      setPaymentMessage(err.response?.data?.error || "Payment initiation failed.");
      setPayingOrderId(null);
    }
  };

  const startPolling = (orderId) => {
    setPollingOrderId(orderId);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await checkPaymentStatus(orderId);
        if (res.payment_status === "paid") {
          setPaymentMessage("Payment confirmed! M-Pesa code: " + res.mpesa_transaction_code);
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders(false);
        } else if (res.payment_status === "failed") {
          setPaymentMessage("Payment failed or cancelled. Click Pay to try again.");
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders(false);
        } else if (attempts >= 10) {
          setPaymentMessage("Payment pending. Check back shortly.");
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
        }
      } catch {
        clearInterval(interval);
        setPollingOrderId(null);
      }
    }, 3000);
  };

  // ===========================
  // FETCH
  // ===========================
  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      let data;
      if (activeTab === "archived") {
        data = role === "owner" ? await getArchivedOwnerOrders() : await getArchivedOrders();
      } else {
        data = role === "owner" ? await getOwnerOrders() : await getOrders();
      }
      setOrders(data.results ?? data);
    } catch (error) {
      console.error("Fetch failed:", error.response?.data || error.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !role) return;
    fetchOrders(true);
  }, [token, role, activeTab]);

  useEffect(() => {
    if (!token || !role) return;
    const hasPending = orders.some((o) => o.payment_status === "pending_payment");
    if (!hasPending) return;
    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, [token, role, activeTab, orders]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this order?")) return;
    try {
      await archiveOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Archive error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Couldn't archive this order. Try again.");
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order? This can't be undone.")) return;
    setCancellingId(id);
    try {
      const res = await cancelOrder(id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status: "cancelled", cancelled_at: new Date().toISOString(), refund_needed: res.refund_needed ?? false }
            : o
        )
      );
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Couldn't cancel this order. Try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleStartDecline = (order) => {
    setDecliningOrderId(order.id);
    setDeclineReasonDraft("");
    setDeclineError("");
  };

  const handleCancelDecline = () => {
    setDecliningOrderId(null);
    setDeclineReasonDraft("");
    setDeclineError("");
  };

  const handleSubmitDecline = async (orderId) => {
    const reason = declineReasonDraft.trim();
    if (!reason) {
      setDeclineError("Let the customer know why — this is required.");
      return;
    }
    setDecliningSubmitId(orderId);
    setDeclineError("");
    try {
      const res = await declineOrder(orderId, reason);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "declined", decline_reason: res.decline_reason ?? reason, refund_needed: res.refund_needed ?? false }
            : o
        )
      );
      setDecliningOrderId(null);
      setDeclineReasonDraft("");
    } catch (err) {
      setDeclineError(err.response?.data?.error || "Couldn't decline this order. Try again.");
    } finally {
      setDecliningSubmitId(null);
    }
  };

  const handleStartEditNote = (order) => {
    setEditingNotesId(order.id);
    setNoteDraft(order.customer_notes || "");
  };

  const handleCancelEditNote = () => {
    setEditingNotesId(null);
    setNoteDraft("");
  };

  const handleSaveNote = async (orderId) => {
    setSavingNoteId(orderId);
    try {
      const res = await updateOrderNotes(orderId, noteDraft.trim());
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, customer_notes: res.customer_notes ?? noteDraft.trim() } : o
        )
      );
      setEditingNotesId(null);
    } catch (err) {
      console.error("Note update failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Couldn't save your note. Try again.");
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleBookAgain = (order) => {
    navigate(`/shop/${order.shop.id}?service=${order.service.id}&weight=${order.weight}`);
  };

  // ===========================
  // LOADING
  // ===========================
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: PAPER }}>
        <div className="max-w-3xl mx-auto px-6 pt-14 pb-8">
          <div className="h-3 w-32 bg-black/10 rounded mb-3 animate-pulse" />
          <div className="h-9 w-48 bg-black/10 rounded mb-1 animate-pulse" />
        </div>
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-sm border p-6 animate-pulse" style={{ background: CARD, borderColor: `${INK}1A` }}>
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-black/10 rounded" />
                  <div className="h-3 w-24 bg-black/10 rounded" />
                </div>
                <div className="h-6 w-20 bg-black/10 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-black/10 rounded" />
                <div className="h-8 bg-black/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: PAPER,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* HEADER — counter signage, not a dashboard hero */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-7">
        <p
          className="text-[11px] tracking-[0.3em] mb-2"
          style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}
        >
          {role === "owner" ? "COUNTER · BUSINESS" : "COUNTER · PICKUP"}
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: INK }}>
            <Shirt size={28} strokeWidth={1.75} />
            {role === "owner" ? "Shop Orders" : "My Orders"}
          </h1>
          <p className="text-sm" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
            {orders.length} {orders.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>

        {/* TABS — plain underline, ticket-counter labels */}
        <div className="flex gap-6 mt-6 border-b" style={{ borderColor: `${INK}1F` }}>
          {[
            { key: "active", label: "ACTIVE" },
            { key: "archived", label: "ARCHIVED" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="pb-3 text-xs tracking-[0.2em] font-bold transition"
              style={{
                fontFamily: TICKET_FONT,
                color: activeTab === t.key ? INK : `${INK}55`,
                borderBottom: activeTab === t.key ? `3px solid ${INK}` : "3px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-10">

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="border rounded-sm p-16 text-center" style={{ background: CARD, borderColor: `${INK}1A` }}>
            <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mx-auto mb-4" style={{ borderColor: `${INK}30` }}>
              <Shirt size={22} style={{ color: `${INK}55` }} strokeWidth={1.75} />
            </div>
            <p className="font-semibold" style={{ color: INK }}>
              {activeTab === "archived" ? "No archived tickets yet" : "No tickets yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: `${INK}80` }}>
              {activeTab === "archived" ? "Completed orders you file away will show up here." : "When a wash is booked, its ticket lands here."}
            </p>
            {activeTab === "active" && role !== "owner" && (
              <Link to="/shops" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: "#35548C" }}>
                Browse shops →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const stamp = getStamp(order.status);
              const paymentInfo = getPaymentLabel(order.payment_status);
              const isDeadEnd = order.status === "declined" || order.status === "cancelled";
              const isExpanded = !!expandedIds[order.id];
              const hasTimelineExtras = order.confirmed_at || order.washing_at || order.completed_at || order.declined_at || order.cancelled_at;

              return (
                <div
                  key={order.id}
                  className="relative border rounded-sm"
                  style={{ background: CARD, borderColor: `${INK}1F`, boxShadow: `0 1px 0 ${INK}0A` }}
                >
                  {/* punch hole — the tag this ticket hangs from */}
                  <div
                    className="absolute -top-2.5 left-7 w-4 h-4 rounded-full border"
                    style={{ background: PAPER, borderColor: `${INK}25` }}
                  />

                  <div className="p-6">

                    {/* TICKET HEAD: claim number + stamp — the two things you scan for first */}
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div>
                        <p className="text-[10px] tracking-[0.25em] mb-0.5" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
                          CLAIM No.
                        </p>
                        <p className="text-2xl font-bold" style={{ fontFamily: TICKET_FONT, color: INK }}>
                          {String(order.id).padStart(5, "0")}
                        </p>
                      </div>
                      <StatusStamp status={order.status} rotate={order.id % 2 === 0 ? -4 : 4} />
                    </div>

                    {/* perforation */}
                    <div className="relative mb-4">
                      <div className="border-t-2 border-dashed" style={{ borderColor: `${INK}30` }} />
                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: PAPER }} />
                      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: PAPER }} />
                    </div>

                    {/* SERVICE + SHOP — what's being washed, and where */}
                    <h3 className="font-bold text-lg leading-tight" style={{ color: INK }}>{order.service?.name}</h3>
                    <Link
                      to={`/shop/${order.shop?.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm hover:underline mt-0.5 inline-block font-medium"
                      style={{ color: "#35548C" }}
                    >
                      {order.shop?.name}
                    </Link>

                    {/* RECEIPT LINES — weight / total, like a printed line item */}
                    <div className="mt-4 mb-5 text-sm" style={{ fontFamily: TICKET_FONT, color: INK }}>
                      <div className="flex justify-between py-1.5 border-b border-dashed" style={{ borderColor: `${INK}20` }}>
                        <span style={{ color: `${INK}80` }}>WEIGHT</span>
                        <span className="font-bold">{order.weight} kg</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span style={{ color: `${INK}80` }}>TOTAL</span>
                        <span className="font-bold">KES {order.total_price}</span>
                      </div>
                    </div>

                    {/* ============================================ */}
                    {/* ATTENTION ZONE — only what needs a decision   */}
                    {/* ============================================ */}

                    {/* DECLINE / CANCEL NOTICE — shown to both roles once the order is a dead end */}
                    {isDeadEnd && (
                      <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: `${stamp.ink}40`, background: `${stamp.ink}0D` }}>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: stamp.ink }}>
                          {order.status === "declined" ? <XCircle size={13} /> : <Ban size={13} />}
                          {order.status === "declined"
                            ? (role === "owner" ? "You declined this order" : "This order was declined")
                            : (role === "owner" ? "Customer cancelled this order" : "You cancelled this order")}
                        </p>
                        {order.status === "declined" && (
                          <p className="text-sm whitespace-pre-wrap" style={{ color: `${INK}CC` }}>{order.decline_reason}</p>
                        )}
                        {order.refund_needed && (
                          <div className="flex items-start gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: `${stamp.ink}30` }}>
                            <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "#B5811E" }} />
                            <p className="text-xs font-medium" style={{ color: "#B5811E" }}>
                              {role === "owner"
                                ? "This order was already paid — process a manual M-Pesa refund to the customer."
                                : "You already paid for this order — the shop will refund you via M-Pesa shortly. Contact them if it doesn't arrive."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* NOTES — CUSTOMER (editable) */}
                    {role === "customer" && (
                      <div className="mb-5">
                        {editingNotesId === order.id ? (
                          <div className="p-4 border rounded-sm" style={{ borderColor: "#B5811E40", background: "#B5811E0D" }}>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#8A6316" }}>
                              <StickyNote size={13} /> Note for the shop
                            </label>
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              maxLength={500}
                              rows={3}
                              placeholder="Gate code, handling instructions, a stain to watch for..."
                              className="w-full text-sm border rounded-sm p-3 bg-white focus:outline-none focus:ring-2 resize-none"
                              style={{ borderColor: "#B5811E40" }}
                              autoFocus
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[11px]" style={{ color: "#8A631680" }}>{noteDraft.length}/500</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelEditNote}
                                  className="px-3 py-1.5 text-xs font-semibold hover:opacity-70"
                                  style={{ color: `${INK}80` }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(order.id)}
                                  disabled={savingNoteId === order.id}
                                  className="px-4 py-1.5 text-xs font-bold rounded-sm text-white transition disabled:opacity-50"
                                  style={{ background: "#B5811E" }}
                                >
                                  {savingNoteId === order.id ? "Saving..." : "Save note"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : order.customer_notes ? (
                          <div className="p-4 border rounded-sm" style={{ borderColor: "#B5811E40", background: "#B5811E0D" }}>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: "#8A6316" }}>
                                <StickyNote size={13} /> Your note
                              </p>
                              {activeTab !== "archived" &&
                                !["washing", "completed", "declined", "cancelled"].includes(order.status) && (
                                <button
                                  onClick={() => handleStartEditNote(order)}
                                  className="shrink-0 hover:opacity-70"
                                  style={{ color: "#8A6316" }}
                                  aria-label="Edit note"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: `${INK}CC` }}>{order.customer_notes}</p>
                          </div>
                        ) : (
                          activeTab !== "archived" &&
                          !["washing", "completed", "declined", "cancelled"].includes(order.status) && (
                            <button
                              onClick={() => handleStartEditNote(order)}
                              className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                              style={{ color: "#35548C" }}
                            >
                              <StickyNote size={13} /> Add a note for the shop
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* NOTES — OWNER (read-only, surfaced prominently since it needs action) */}
                    {role === "owner" && order.customer_notes && (
                      <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: "#B5811E40", background: "#B5811E0D" }}>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#8A6316" }}>
                          <StickyNote size={13} /> Customer note
                        </p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: `${INK}CC` }}>{order.customer_notes}</p>
                      </div>
                    )}

                    {/* PAYMENT — CUSTOMER ONLY. Quiet when settled, loud when action's needed. */}
                    {role === "customer" && activeTab === "active" && order.status !== "declined" && order.status !== "cancelled" && (
                      order.payment_status === "paid" ? (
                        <div className="flex items-center gap-1.5 mb-5 text-xs" style={{ color: "#3F6B47" }}>
                          <CheckCircle2 size={13} />
                          Paid{order.mpesa_transaction_code ? ` · M-Pesa ${order.mpesa_transaction_code}` : ""}
                        </div>
                      ) : (
                        <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: "#B5811E40", background: "#B5811E0D" }}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: INK }}>
                              <CreditCard size={14} style={{ color: `${INK}60` }} />
                              Payment
                            </span>
                            <span className="text-xs font-bold" style={{ fontFamily: TICKET_FONT, color: paymentInfo.ink }}>
                              {paymentInfo.label.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => handlePay(order.id)}
                            disabled={payingOrderId === order.id || pollingOrderId === order.id}
                            className="w-full text-white text-sm font-bold py-3 rounded-sm transition disabled:opacity-50"
                            style={{ background: "#3F6B47" }}
                          >
                            {payingOrderId === order.id ? "Sending prompt..."
                              : pollingOrderId === order.id ? "Waiting for payment..."
                              : "Pay with M-Pesa"}
                          </button>
                          {paymentMessage && (
                            <p className="text-xs mt-2.5 text-center" style={{ color: `${INK}80` }}>{paymentMessage}</p>
                          )}
                        </div>
                      )
                    )}

                    {/* OWNER STATUS BUTTONS — the primary thing an owner acts on */}
                    {role === "owner" && activeTab !== "archived" && order.status !== "declined" && order.status !== "cancelled" && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {order.status === "pending" && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, "confirmed")}
                              className="px-4 py-2 text-xs font-bold rounded-sm text-white capitalize transition"
                              style={{ background: "#35548C" }}>
                              <ThumbsUp size={11} className="inline mr-1" /> Accept
                            </button>
                            <button onClick={() => handleStartDecline(order)}
                              className="px-4 py-2 text-xs font-bold rounded-sm capitalize transition border"
                              style={{ borderColor: "#9C3B2E40", color: "#9C3B2E" }}>
                              <XCircle size={11} className="inline mr-1" /> Decline
                            </button>
                          </>
                        )}

                        {order.status === "confirmed" && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, "washing")}
                              className="px-4 py-2 text-xs font-bold rounded-sm text-white capitalize transition"
                              style={{ background: "#1C6E8C" }}>
                              <Droplets size={11} className="inline mr-1" /> Start Washing
                            </button>
                            <button onClick={() => handleStartDecline(order)}
                              className="px-4 py-2 text-xs font-bold rounded-sm capitalize transition border"
                              style={{ borderColor: "#9C3B2E40", color: "#9C3B2E" }}>
                              <XCircle size={11} className="inline mr-1" /> Decline
                            </button>
                          </>
                        )}

                        {order.status === "washing" && (
                          <button onClick={() => handleStatusUpdate(order.id, "completed")}
                            className="px-4 py-2 text-xs font-bold rounded-sm text-white capitalize transition"
                            style={{ background: "#3F6B47" }}>
                            <CheckCircle2 size={11} className="inline mr-1" /> Mark Completed
                          </button>
                        )}

                        {order.status === "completed" && !order.owner_archived && (
                          <button onClick={() => handleArchive(order.id)}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-sm text-white transition"
                            style={{ background: INK }}>
                            <Archive size={12} /> Archive
                          </button>
                        )}
                      </div>
                    )}

                    {/* DECLINE — inline reason form */}
                    {role === "owner" && decliningOrderId === order.id && (
                      <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: "#9C3B2E40", background: "#9C3B2E0D" }}>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9C3B2E" }}>
                          <XCircle size={13} /> Reason for declining (required)
                        </label>
                        <textarea
                          value={declineReasonDraft}
                          onChange={(e) => setDeclineReasonDraft(e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder="e.g. Fully booked today, can't handle this fabric type... The customer will see this."
                          className="w-full text-sm border rounded-sm p-3 bg-white focus:outline-none focus:ring-2 resize-none"
                          style={{ borderColor: "#9C3B2E40" }}
                          autoFocus
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px]" style={{ color: "#9C3B2E80" }}>{declineReasonDraft.length}/500</span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelDecline}
                              className="px-3 py-1.5 text-xs font-semibold hover:opacity-70"
                              style={{ color: `${INK}80` }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitDecline(order.id)}
                              disabled={decliningSubmitId === order.id}
                              className="px-4 py-1.5 text-xs font-bold rounded-sm text-white transition disabled:opacity-50"
                              style={{ background: "#9C3B2E" }}
                            >
                              {decliningSubmitId === order.id ? "Declining..." : "Confirm decline"}
                            </button>
                          </div>
                        </div>
                        {declineError && (
                          <p className="text-xs mt-2" style={{ color: "#9C3B2E" }}>{declineError}</p>
                        )}
                      </div>
                    )}

                    {/* CUSTOMER CANCEL — only before washing starts */}
                    {role === "customer" && activeTab === "active" &&
                      (order.status === "pending" || order.status === "confirmed") && (
                      <div className="mb-5">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-sm border transition disabled:opacity-50"
                          style={{ borderColor: "#9C3B2E40", color: "#9C3B2E" }}
                        >
                          <Ban size={14} /> {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                        </button>
                      </div>
                    )}

                    {/* OWNER ARCHIVE — declined/cancelled orders (no further status actions apply) */}
                    {role === "owner" && activeTab !== "archived" &&
                      (order.status === "declined" || order.status === "cancelled") && !order.owner_archived && (
                      <div className="mb-5">
                        <button onClick={() => handleArchive(order.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-sm text-white transition"
                          style={{ background: INK }}>
                          <Archive size={14} /> Archive Order
                        </button>
                      </div>
                    )}

                    {/* CUSTOMER ARCHIVE */}
                    {role === "customer" && activeTab !== "archived" &&
                      (order.status === "completed" || order.status === "declined" || order.status === "cancelled") && !order.customer_archived && (
                      <div className="mb-5">
                        <button onClick={() => handleArchive(order.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-sm text-white transition"
                          style={{ background: INK }}>
                          <Archive size={14} /> Archive Order
                        </button>
                      </div>
                    )}

                    {/* BOOK AGAIN */}
                    {role === "customer" && activeTab === "archived" && (
                      <div className="mb-5">
                        <button onClick={() => handleBookAgain(order)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-sm text-white transition"
                          style={{ background: "#35548C" }}>
                          <RotateCcw size={14} /> Book Again
                        </button>
                      </div>
                    )}

                    {/* CUSTOMER INFO — OWNER ONLY, always visible: this is core
                        info an owner needs on every glance, not secondary reference */}
                    {role === "owner" && (
                      <div className="mb-5 p-4 border rounded-sm" style={{ borderColor: `${INK}1A` }}>
                        <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ fontFamily: TICKET_FONT, color: `${INK}60` }}>
                          Customer Info
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: `${INK}70` }}>Name</span>
                            <span className="font-semibold" style={{ color: INK }}>{order.user?.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: `${INK}70` }}>Phone</span>
                            <span className="font-semibold" style={{ color: INK }}>{order.customer_phone || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: `${INK}70` }}>Location</span>
                            <span className="font-semibold" style={{ color: INK }}>{order.customer_location || "N/A"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: `${INK}70` }}>Payment</span>
                            <span className="font-semibold text-xs" style={{ fontFamily: TICKET_FONT, color: paymentInfo.ink }}>
                              {paymentInfo.label.toUpperCase()}
                            </span>
                          </div>
                          {order.payment_status === "paid" && order.mpesa_transaction_code && (
                            <div className="flex justify-between">
                              <span style={{ color: `${INK}70` }}>M-Pesa Code</span>
                              <span className="font-semibold text-xs" style={{ color: "#3F6B47" }}>{order.mpesa_transaction_code}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: `${INK}15` }}>
                          {order.customer_phone && (
                            <a href={`tel:${order.customer_phone}`}
                              className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: "#35548C" }}>
                              <Phone size={12} /> Call
                            </a>
                          )}
                          {getMapInfo(order) && (
                            <a href={getMapInfo(order).url}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: "#3F6B47" }}>
                              <MapPin size={12} /> {getMapInfo(order).label}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ============================================ */}
                    {/* DETAILS DISCLOSURE — timeline only, tucked away */}
                    {/* ============================================ */}
                    {hasTimelineExtras && (
                      <div className="pt-4 border-t border-dashed" style={{ borderColor: `${INK}20` }}>
                        <button
                          onClick={() => toggleExpanded(order.id)}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest"
                          style={{ fontFamily: TICKET_FONT, color: `${INK}60` }}
                        >
                          <ChevronDown size={13} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                          {isExpanded ? "Hide timeline" : "Show timeline"}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-5">

                            {/* TIMELINE — printed like a stamped log */}
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily: TICKET_FONT, color: `${INK}50` }}>
                                Timeline
                              </p>
                              <div className="space-y-0">
                                {[
                                  { key: "placed", label: "Order placed", time: order.created_at, ink: "#35548C", icon: <Package size={11} /> },
                                  order.confirmed_at && { key: "confirmed", label: "Confirmed by shop", time: order.confirmed_at, ink: "#35548C", icon: <ThumbsUp size={11} /> },
                                  order.washing_at && { key: "washing", label: "Washing started", time: order.washing_at, ink: "#1C6E8C", icon: <Droplets size={11} /> },
                                  order.completed_at && { key: "completed", label: "Completed", time: order.completed_at, ink: "#3F6B47", icon: <CheckCircle2 size={11} /> },
                                  order.declined_at && { key: "declined", label: "Declined", time: order.declined_at, ink: "#9C3B2E", icon: <XCircle size={11} /> },
                                  order.cancelled_at && { key: "cancelled", label: "Cancelled", time: order.cancelled_at, ink: "#6B675D", icon: <Ban size={11} /> },
                                ].filter(Boolean).map((step, i, arr) => (
                                  <div key={step.key} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: step.ink, color: step.ink }}>
                                        {step.icon}
                                      </div>
                                      {i < arr.length - 1 && (
                                        <div className="w-0.5 flex-1 my-1" style={{ background: `${INK}20` }} />
                                      )}
                                    </div>
                                    <div className={`${i < arr.length - 1 ? "pb-4" : ""} flex-1 pt-0.5`}>
                                      <p className="text-xs font-semibold" style={{ color: INK }}>{step.label}</p>
                                      <p className="text-xs mt-0.5" style={{ fontFamily: TICKET_FONT, color: `${INK}70` }}>{formatTime(step.time)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;