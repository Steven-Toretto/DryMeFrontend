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
  CheckCircle2, Clock, RotateCcw, CreditCard,
  ShoppingBag, Shirt, Sparkles, StickyNote, Pencil,
  ThumbsUp, XCircle, AlertTriangle, Ban,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

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
    navigate(`/book-pickup?shop=${order.shop.id}&service=${order.service.id}&weight=${order.weight}`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed": return { color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle2 size={12} />, bar: "bg-emerald-400", dot: "bg-emerald-500" };
      case "washing":   return { color: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",   icon: <Droplets size={12} className="animate-pulse" />, bar: "bg-blue-400", dot: "bg-blue-500" };
      case "confirmed": return { color: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", icon: <ThumbsUp size={12} />, bar: "bg-indigo-400", dot: "bg-indigo-500" };
      case "declined":  return { color: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", icon: <XCircle size={12} />, bar: "bg-rose-400", dot: "bg-rose-500" };
      case "cancelled": return { color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", icon: <Ban size={12} />, bar: "bg-slate-400", dot: "bg-slate-500" };
      default:          return { color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: <Clock size={12} />, bar: "bg-amber-300", dot: "bg-amber-500" };
    }
  };

  const getPaymentConfig = (ps) => {
    switch (ps) {
      case "paid":            return { color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",   label: "Paid" };
      case "pending_payment": return { color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", label: "Pending" };
      case "failed":          return { color: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",       label: "Failed" };
      default:                return { color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",     label: "Unpaid" };
    }
  };

  // ===========================
  // LOADING
  // ===========================
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50/40">
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="h-8 w-40 bg-white/20 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-24 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-[28px] border border-blue-900/5 p-5 animate-pulse shadow-sm">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-slate-100 rounded" />
                <div className="h-8 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/40">

      {/* HERO BANNER — soap-water gradient with bubble field */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6 relative overflow-hidden">
        {/* bubble motif */}
        <div className="absolute -top-8 right-10 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-16 right-32 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 left-1/3 w-3 h-3 rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-white/30 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-blue-100 text-xs font-bold tracking-widest uppercase mb-3">
              <Sparkles size={12} />
              {role === "owner" ? "Business dashboard" : "My laundry"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {role === "owner" ? "Shop Orders" : "My Orders"}
            </h1>
            <p className="text-blue-50/80 text-sm mt-1.5 font-medium">
              {orders.length} {orders.length === 1 ? "order" : "orders"} · {activeTab === "active" ? "Active" : "Archived"}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/10 backdrop-blur border border-white/20 items-center justify-center">
            <Shirt size={26} className="text-white" strokeWidth={1.75} />
          </div>
        </div>

        {/* wave transition into page */}
        <svg className="absolute bottom-0 left-0 w-full text-blue-50" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: "24px" }}>
          <path d="M0,20 C240,40 480,0 720,15 C960,30 1200,5 1440,20 L1440,40 L0,40 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* TABS */}
        <div className="inline-flex bg-white border border-blue-900/5 rounded-full p-1 mb-7 shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "active"
                ? "bg-blue-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "archived"
                ? "bg-blue-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Archived
          </button>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-blue-900/5 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={26} className="text-blue-300" strokeWidth={1.75} />
            </div>
            <p className="font-semibold text-slate-700">
              {activeTab === "archived" ? "No archived orders yet" : "No orders yet"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === "archived" ? "Completed orders you file away will show up here." : "When a wash is booked, it'll land here."}
            </p>
            {activeTab === "active" && role !== "owner" && (
              <Link to="/shops" className="inline-block mt-4 text-sm text-blue-700 font-semibold hover:underline">
                Browse shops →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const paymentCfg = getPaymentConfig(order.payment_status);

              return (
                <div key={order.id} className="relative bg-white rounded-[28px] border border-blue-900/5 shadow-md overflow-hidden">

                  {/* punch-hole ticket notches */}
                  <div className="absolute -left-3 top-24 w-6 h-6 rounded-full bg-blue-50/40 border border-blue-900/5" />
                  <div className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-blue-50/40 border border-blue-900/5" />

                  {/* STATUS BAR */}
                  <div className={`h-1.5 w-full ${statusCfg.bar}`} />

                  <div className="p-6">

                    {/* TOP */}
                    <div className="flex justify-between items-start gap-3 mb-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${statusCfg.color}`}>
                          <Shirt size={18} strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 leading-tight">{order.service?.name}</h3>
                          <Link
                            to={`/shop/${order.shop?.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-600 hover:underline mt-0.5 inline-block font-medium"
                          >
                            {order.shop?.name}
                          </Link>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* perforated tear line */}
                    <div className="border-t border-dashed border-blue-900/10 mb-5" />

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-3.5 bg-blue-50/40 rounded-2xl">
                        <p className="text-[11px] text-blue-700/60 font-semibold uppercase tracking-wide mb-0.5">Weight</p>
                        <p className="font-bold text-slate-800">{order.weight} kg</p>
                      </div>
                      <div className="p-3.5 bg-blue-50/40 rounded-2xl">
                        <p className="text-[11px] text-blue-700/60 font-semibold uppercase tracking-wide mb-0.5">Total</p>
                        <p className="font-bold text-blue-700">KES {order.total_price}</p>
                      </div>
                    </div>

                    {/* DECLINE / CANCEL NOTICE — shown to both roles once the order is a dead end */}
                    {(order.status === "declined" || order.status === "cancelled") && (
                      <div className={`mb-5 p-4 border rounded-2xl ${
                        order.status === "declined" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50"
                      }`}>
                        <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5 ${
                          order.status === "declined" ? "text-rose-800" : "text-slate-600"
                        }`}>
                          {order.status === "declined" ? <XCircle size={13} /> : <Ban size={13} />}
                          {order.status === "declined"
                            ? (role === "owner" ? "You declined this order" : "This order was declined")
                            : (role === "owner" ? "Customer cancelled this order" : "You cancelled this order")}
                        </p>
                        {order.status === "declined" && (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.decline_reason}</p>
                        )}
                        {order.refund_needed && (
                          <div className={`flex items-start gap-1.5 mt-3 pt-3 border-t ${
                            order.status === "declined" ? "border-rose-200/70" : "border-slate-200"
                          }`}>
                            <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">
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
                          <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                              <StickyNote size={13} /> Note for the shop
                            </label>
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              maxLength={500}
                              rows={3}
                              placeholder="Gate code, handling instructions, a stain to watch for..."
                              className="w-full text-sm border border-amber-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[11px] text-amber-700/60">{noteDraft.length}/500</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelEditNote}
                                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(order.id)}
                                  disabled={savingNoteId === order.id}
                                  className="px-4 py-1.5 text-xs font-bold rounded-full bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50"
                                >
                                  {savingNoteId === order.id ? "Saving..." : "Save note"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : order.customer_notes ? (
                          <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                                <StickyNote size={13} /> Your note
                              </p>
                              {activeTab !== "archived" && (
                                <button
                                  onClick={() => handleStartEditNote(order)}
                                  className="text-amber-700 hover:text-amber-900 shrink-0"
                                  aria-label="Edit note"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.customer_notes}</p>
                          </div>
                        ) : (
                          activeTab !== "archived" && (
                            <button
                              onClick={() => handleStartEditNote(order)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
                            >
                              <StickyNote size={13} /> Add a note for the shop
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* NOTES — OWNER (read-only, surfaced prominently) */}
                    {role === "owner" && order.customer_notes && (
                      <div className="mb-5 p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                          <StickyNote size={13} /> Customer note
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.customer_notes}</p>
                      </div>
                    )}

                    {/* PAYMENT — CUSTOMER ONLY */}
                    {role === "customer" && activeTab === "active" && order.status !== "declined" && order.status !== "cancelled" && (
                      <div className="mb-5 p-4 border border-blue-900/5 bg-white rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-slate-400" />
                            Payment
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${paymentCfg.color}`}>
                            {paymentCfg.label}
                          </span>
                        </div>

                        {order.payment_status === "paid" && order.mpesa_transaction_code && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
                            <p className="text-xs text-emerald-700">
                              M-Pesa Code: <strong>{order.mpesa_transaction_code}</strong>
                            </p>
                          </div>
                        )}

                        {(order.payment_status === "unpaid" || order.payment_status === "failed") && (
                          <button
                            onClick={() => handlePay(order.id)}
                            disabled={payingOrderId === order.id || pollingOrderId === order.id}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-2xl transition disabled:opacity-50 shadow-sm shadow-emerald-100"
                          >
                            {payingOrderId === order.id ? "Sending prompt..."
                              : pollingOrderId === order.id ? "Waiting for payment..."
                              : "Pay with M-Pesa"}
                          </button>
                        )}

                        {paymentMessage && (
                          <p className="text-xs text-slate-500 mt-2.5 text-center">{paymentMessage}</p>
                        )}
                      </div>
                    )}

                    {/* OWNER INFO */}
                    {role === "owner" && (
                      <div className="mb-5 bg-blue-50/40 rounded-2xl p-4">
                        <p className="text-[11px] font-bold text-blue-700/60 uppercase tracking-wide mb-3">Customer Info</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Name</span>
                            <span className="font-semibold text-slate-800">{order.user?.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Phone</span>
                            <span className="font-semibold text-slate-800">{order.customer_phone || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Location</span>
                            <span className="font-semibold text-slate-800">{order.customer_location || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3 pt-3 border-t border-blue-900/5">
                          {order.customer_phone && (
                            <a href={`tel:${order.customer_phone}`}
                              className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold hover:underline">
                              <Phone size={12} /> Call
                            </a>
                          )}
                          {order.customer_location && (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold hover:underline">
                              <MapPin size={12} /> Map
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* OWNER STATUS BUTTONS */}
                    {role === "owner" && activeTab !== "archived" && order.status !== "declined" && order.status !== "cancelled" && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {order.status === "pending" && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, "confirmed")}
                              className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-indigo-600 hover:bg-indigo-700">
                              <ThumbsUp size={11} className="inline mr-1" /> Accept
                            </button>
                            <button onClick={() => handleStartDecline(order)}
                              className="px-4 py-2 text-xs font-bold rounded-full capitalize transition bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                              <XCircle size={11} className="inline mr-1" /> Decline
                            </button>
                          </>
                        )}

                        {order.status === "confirmed" && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, "washing")}
                              className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-blue-500 hover:bg-blue-600">
                              <Droplets size={11} className="inline mr-1" /> Start Washing
                            </button>
                            <button onClick={() => handleStartDecline(order)}
                              className="px-4 py-2 text-xs font-bold rounded-full capitalize transition bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                              <XCircle size={11} className="inline mr-1" /> Decline
                            </button>
                          </>
                        )}

                        {order.status === "washing" && (
                          <button onClick={() => handleStatusUpdate(order.id, "completed")}
                            className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 size={11} className="inline mr-1" /> Mark Completed
                          </button>
                        )}

                        {order.status === "completed" && !order.owner_archived && (
                          <button onClick={() => handleArchive(order.id)}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
                            <Archive size={12} /> Archive
                          </button>
                        )}
                      </div>
                    )}

                    {/* DECLINE — inline reason form */}
                    {role === "owner" && decliningOrderId === order.id && (
                      <div className="mb-5 p-4 border border-rose-200 bg-rose-50/60 rounded-2xl">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wide mb-2">
                          <XCircle size={13} /> Reason for declining (required)
                        </label>
                        <textarea
                          value={declineReasonDraft}
                          onChange={(e) => setDeclineReasonDraft(e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder="e.g. Fully booked today, can't handle this fabric type... The customer will see this."
                          className="w-full text-sm border border-rose-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-rose-700/60">{declineReasonDraft.length}/500</span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelDecline}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitDecline(order.id)}
                              disabled={decliningSubmitId === order.id}
                              className="px-4 py-1.5 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
                            >
                              {decliningSubmitId === order.id ? "Declining..." : "Confirm decline"}
                            </button>
                          </div>
                        </div>
                        {declineError && (
                          <p className="text-xs text-rose-600 mt-2">{declineError}</p>
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
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
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
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
                          <Archive size={14} /> Archive Order
                        </button>
                      </div>
                    )}

                    {/* CUSTOMER ARCHIVE */}
                    {role === "customer" && activeTab !== "archived" &&
                      (order.status === "completed" || order.status === "declined" || order.status === "cancelled") && !order.customer_archived && (
                      <div className="mb-5">
                        <button onClick={() => handleArchive(order.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
                          <Archive size={14} /> Archive Order
                        </button>
                      </div>
                    )}

                    {/* BOOK AGAIN */}
                    {role === "customer" && activeTab === "archived" && (
                      <div className="mb-5">
                        <button onClick={() => handleBookAgain(order)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition">
                          <RotateCcw size={14} /> Book Again
                        </button>
                      </div>
                    )}

                    {/* TIMELINE */}
                    <div className="pt-5 border-t border-dashed border-blue-900/10">
                      <p className="text-[11px] font-bold text-blue-700/50 uppercase tracking-widest mb-3">Timeline</p>
                      <div className="space-y-0">
                        {[
                          { key: "placed", label: "Order placed", time: order.created_at, ring: "bg-blue-50 ring-blue-200", icon: <Package size={11} className="text-blue-600" /> },
                          order.confirmed_at && { key: "confirmed", label: "Confirmed by shop", time: order.confirmed_at, ring: "bg-indigo-50 ring-indigo-200", icon: <ThumbsUp size={11} className="text-indigo-600" /> },
                          order.washing_at && { key: "washing", label: "Washing started", time: order.washing_at, ring: "bg-blue-50 ring-blue-200", icon: <Droplets size={11} className="text-blue-600" /> },
                          order.completed_at && { key: "completed", label: "Completed", time: order.completed_at, ring: "bg-emerald-50 ring-emerald-200", icon: <CheckCircle2 size={11} className="text-emerald-600" /> },
                          order.declined_at && { key: "declined", label: "Declined", time: order.declined_at, ring: "bg-rose-50 ring-rose-200", icon: <XCircle size={11} className="text-rose-600" /> },
                          order.cancelled_at && { key: "cancelled", label: "Cancelled", time: order.cancelled_at, ring: "bg-slate-100 ring-slate-300", icon: <Ban size={11} className="text-slate-500" /> },
                        ].filter(Boolean).map((step, i, arr) => (
                          <div key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full ring-1 flex items-center justify-center shrink-0 ${step.ring}`}>
                                {step.icon}
                              </div>
                              {i < arr.length - 1 && (
                                <div className="w-0.5 flex-1 bg-blue-100 my-1" />
                              )}
                            </div>
                            <div className={`${i < arr.length - 1 ? "pb-4" : ""} flex-1 pt-0.5`}>
                              <p className="text-xs font-semibold text-slate-700">{step.label}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{formatTime(step.time)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOOTER — ticket number */}
                    <div className="mt-4 text-xs text-blue-900/25 font-mono tracking-wider">
                      ORDER #{String(order.id).padStart(4, "0")}
                    </div>

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



// import { useEffect, useState, useContext } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   getOrders, getOwnerOrders, getArchivedOrders,
//   getArchivedOwnerOrders, updateOrderStatus, archiveOrder,
//   initiatePayment, checkPaymentStatus, updateOrderNotes,
//   declineOrder, cancelOrder,
// } from "../api";
// import {
//   Phone, MapPin, Archive, Package, Droplets,
//   CheckCircle2, Clock, RotateCcw, CreditCard,
//   ShoppingBag, Shirt, Sparkles, StickyNote, Pencil,
//   ThumbsUp, XCircle, AlertTriangle, Ban,
// } from "lucide-react";
// import { AuthContext } from "../context/AuthContext";

// function Orders() {
//   const { token, user } = useContext(AuthContext);
//   const role = user?.role;
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("active");
//   const [payingOrderId, setPayingOrderId] = useState(null);
//   const [paymentMessage, setPaymentMessage] = useState("");
//   const [pollingOrderId, setPollingOrderId] = useState(null);

//   const [editingNotesId, setEditingNotesId] = useState(null);
//   const [noteDraft, setNoteDraft] = useState("");
//   const [savingNoteId, setSavingNoteId] = useState(null);

//   const [decliningOrderId, setDecliningOrderId] = useState(null);
//   const [declineReasonDraft, setDeclineReasonDraft] = useState("");
//   const [decliningSubmitId, setDecliningSubmitId] = useState(null);
//   const [declineError, setDeclineError] = useState("");

//   const [cancellingId, setCancellingId] = useState(null);

//   const formatTime = (dt) =>
//     new Date(dt).toLocaleString("en-KE", {
//       day: "numeric", month: "short",
//       hour: "2-digit", minute: "2-digit",
//     });

//   // ===========================
//   // MPESA
//   // ===========================
//   const handlePay = async (orderId) => {
//     setPaymentMessage("");
//     setPayingOrderId(orderId);
//     try {
//       const res = await initiatePayment(orderId);
//       setPaymentMessage(res.message || "Payment prompt sent to your phone!");
//       startPolling(orderId);
//     } catch (err) {
//       setPaymentMessage(err.response?.data?.error || "Payment initiation failed.");
//       setPayingOrderId(null);
//     }
//   };

//   const startPolling = (orderId) => {
//     setPollingOrderId(orderId);
//     let attempts = 0;
//     const interval = setInterval(async () => {
//       attempts++;
//       try {
//         const res = await checkPaymentStatus(orderId);
//         if (res.payment_status === "paid") {
//           setPaymentMessage("Payment confirmed! M-Pesa code: " + res.mpesa_transaction_code);
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//           fetchOrders(false);
//         } else if (res.payment_status === "failed") {
//           setPaymentMessage("Payment failed or cancelled. Click Pay to try again.");
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//           fetchOrders(false);
//         } else if (attempts >= 10) {
//           setPaymentMessage("Payment pending. Check back shortly.");
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//         }
//       } catch {
//         clearInterval(interval);
//         setPollingOrderId(null);
//       }
//     }, 3000);
//   };

//   // ===========================
//   // FETCH
//   // ===========================
//   const fetchOrders = async (showLoader = true) => {
//     try {
//       if (showLoader) setLoading(true);
//       let data;
//       if (activeTab === "archived") {
//         data = role === "owner" ? await getArchivedOwnerOrders() : await getArchivedOrders();
//       } else {
//         data = role === "owner" ? await getOwnerOrders() : await getOrders();
//       }
//       setOrders(data.results ?? data);
//     } catch (error) {
//       console.error("Fetch failed:", error.response?.data || error.message);
//     } finally {
//       if (showLoader) setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!token || !role) return;
//     fetchOrders(true);
//   }, [token, role, activeTab]);

//   useEffect(() => {
//     if (!token || !role) return;
//     const hasPending = orders.some((o) => o.payment_status === "pending_payment");
//     if (!hasPending) return;
//     const interval = setInterval(() => fetchOrders(false), 5000);
//     return () => clearInterval(interval);
//   }, [token, role, activeTab, orders]);

//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await updateOrderStatus(id, status);
//       fetchOrders(false);
//     } catch (error) {
//       console.error("Update error:", error.response?.data || error.message);
//     }
//   };

//   const handleArchive = async (id) => {
//     if (!window.confirm("Archive this order?")) return;
//     try {
//       await archiveOrder(id);
//       setOrders((prev) => prev.filter((o) => o.id !== id));
//     } catch (err) {
//       console.error("Archive error:", err.response?.data || err.message);
//       alert(err.response?.data?.error || "Couldn't archive this order. Try again.");
//     }
//   };

//   const handleCancelOrder = async (id) => {
//     if (!window.confirm("Cancel this order? This can't be undone.")) return;
//     setCancellingId(id);
//     try {
//       const res = await cancelOrder(id);
//       setOrders((prev) =>
//         prev.map((o) =>
//           o.id === id
//             ? { ...o, status: "cancelled", cancelled_at: new Date().toISOString(), refund_needed: res.refund_needed ?? false }
//             : o
//         )
//       );
//     } catch (err) {
//       console.error("Cancel error:", err.response?.data || err.message);
//       alert(err.response?.data?.error || "Couldn't cancel this order. Try again.");
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   const handleStartDecline = (order) => {
//     setDecliningOrderId(order.id);
//     setDeclineReasonDraft("");
//     setDeclineError("");
//   };

//   const handleCancelDecline = () => {
//     setDecliningOrderId(null);
//     setDeclineReasonDraft("");
//     setDeclineError("");
//   };

//   const handleSubmitDecline = async (orderId) => {
//     const reason = declineReasonDraft.trim();
//     if (!reason) {
//       setDeclineError("Let the customer know why — this is required.");
//       return;
//     }
//     setDecliningSubmitId(orderId);
//     setDeclineError("");
//     try {
//       const res = await declineOrder(orderId, reason);
//       setOrders((prev) =>
//         prev.map((o) =>
//           o.id === orderId
//             ? { ...o, status: "declined", decline_reason: res.decline_reason ?? reason, refund_needed: res.refund_needed ?? false }
//             : o
//         )
//       );
//       setDecliningOrderId(null);
//       setDeclineReasonDraft("");
//     } catch (err) {
//       setDeclineError(err.response?.data?.error || "Couldn't decline this order. Try again.");
//     } finally {
//       setDecliningSubmitId(null);
//     }
//   };

//   const handleStartEditNote = (order) => {
//     setEditingNotesId(order.id);
//     setNoteDraft(order.customer_notes || "");
//   };

//   const handleCancelEditNote = () => {
//     setEditingNotesId(null);
//     setNoteDraft("");
//   };

//   const handleSaveNote = async (orderId) => {
//     setSavingNoteId(orderId);
//     try {
//       const res = await updateOrderNotes(orderId, noteDraft.trim());
//       setOrders((prev) =>
//         prev.map((o) =>
//           o.id === orderId ? { ...o, customer_notes: res.customer_notes ?? noteDraft.trim() } : o
//         )
//       );
//       setEditingNotesId(null);
//     } catch (err) {
//       console.error("Note update failed:", err.response?.data || err.message);
//       alert(err.response?.data?.error || "Couldn't save your note. Try again.");
//     } finally {
//       setSavingNoteId(null);
//     }
//   };

//   const handleBookAgain = (order) => {
//     navigate(`/book-pickup?shop=${order.shop.id}&service=${order.service.id}&weight=${order.weight}`);
//   };

//   const getStatusConfig = (status) => {
//     switch (status) {
//       case "completed": return { color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle2 size={12} />, bar: "bg-emerald-400", dot: "bg-emerald-500" };
//       case "washing":   return { color: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",   icon: <Droplets size={12} className="animate-pulse" />, bar: "bg-blue-400", dot: "bg-blue-500" };
//       case "confirmed": return { color: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", icon: <ThumbsUp size={12} />, bar: "bg-indigo-400", dot: "bg-indigo-500" };
//       case "declined":  return { color: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", icon: <XCircle size={12} />, bar: "bg-rose-400", dot: "bg-rose-500" };
//       case "cancelled": return { color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", icon: <Ban size={12} />, bar: "bg-slate-400", dot: "bg-slate-500" };
//       default:          return { color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: <Clock size={12} />, bar: "bg-amber-300", dot: "bg-amber-500" };
//     }
//   };

//   const getPaymentConfig = (ps) => {
//     switch (ps) {
//       case "paid":            return { color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",   label: "Paid" };
//       case "pending_payment": return { color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", label: "Pending" };
//       case "failed":          return { color: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",       label: "Failed" };
//       default:                return { color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",     label: "Unpaid" };
//     }
//   };

//   // ===========================
//   // LOADING
//   // ===========================
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-blue-50/40">
//         <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6">
//           <div className="max-w-3xl mx-auto">
//             <div className="h-8 w-40 bg-white/20 rounded-xl animate-pulse mb-2" />
//             <div className="h-4 w-24 bg-white/10 rounded-xl animate-pulse" />
//           </div>
//         </div>
//         <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="bg-white rounded-[28px] border border-blue-900/5 p-5 animate-pulse shadow-[0_2px_20px_-8px_rgba(15,110,110,0.15)]">
//               <div className="flex justify-between mb-4">
//                 <div className="space-y-2">
//                   <div className="h-5 w-36 bg-slate-100 rounded" />
//                   <div className="h-3 w-24 bg-slate-100 rounded" />
//                 </div>
//                 <div className="h-6 w-20 bg-slate-100 rounded-full" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="h-8 bg-slate-100 rounded" />
//                 <div className="h-8 bg-slate-100 rounded" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-blue-50/40">

//       {/* HERO BANNER — soap-water gradient with bubble field */}
//       <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6 relative overflow-hidden">
//         {/* bubble motif */}
//         <div className="absolute -top-8 right-10 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
//         <div className="absolute top-16 right-32 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
//         <div className="absolute -bottom-10 left-0 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
//         <div className="absolute top-6 left-1/3 w-3 h-3 rounded-full bg-white/20 pointer-events-none" />
//         <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-white/30 pointer-events-none" />

//         <div className="max-w-3xl mx-auto relative z-10 flex items-center justify-between">
//           <div>
//             <span className="inline-flex items-center gap-1.5 text-blue-100 text-xs font-bold tracking-widest uppercase mb-3">
//               <Sparkles size={12} />
//               {role === "owner" ? "Business dashboard" : "My laundry"}
//             </span>
//             <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
//               {role === "owner" ? "Shop Orders" : "My Orders"}
//             </h1>
//             <p className="text-blue-50/80 text-sm mt-1.5 font-medium">
//               {orders.length} {orders.length === 1 ? "order" : "orders"} · {activeTab === "active" ? "Active" : "Archived"}
//             </p>
//           </div>
//           <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/10 backdrop-blur border border-white/20 items-center justify-center">
//             <Shirt size={26} className="text-white" strokeWidth={1.75} />
//           </div>
//         </div>

//         {/* wave transition into page */}
//         <svg className="absolute bottom-0 left-0 w-full text-blue-50" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: "24px" }}>
//           <path d="M0,20 C240,40 480,0 720,15 C960,30 1200,5 1440,20 L1440,40 L0,40 Z" fill="currentColor" />
//         </svg>
//       </div>

//       <div className="max-w-3xl mx-auto px-6 py-8">

//         {/* TABS */}
//         <div className="inline-flex bg-white border border-blue-900/5 rounded-full p-1 mb-7 shadow-sm">
//           <button
//             onClick={() => setActiveTab("active")}
//             className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
//               activeTab === "active"
//                 ? "bg-blue-700 text-white shadow-sm"
//                 : "text-slate-400 hover:text-slate-600"
//             }`}
//           >
//             Active Orders
//           </button>
//           <button
//             onClick={() => setActiveTab("archived")}
//             className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
//               activeTab === "archived"
//                 ? "bg-blue-700 text-white shadow-sm"
//                 : "text-slate-400 hover:text-slate-600"
//             }`}
//           >
//             Archived
//           </button>
//         </div>

//         {/* EMPTY */}
//         {orders.length === 0 ? (
//           <div className="bg-white rounded-[28px] border border-blue-900/5 p-16 text-center shadow-[0_2px_20px_-8px_rgba(15,110,110,0.1)]">
//             <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
//               <ShoppingBag size={26} className="text-blue-300" strokeWidth={1.75} />
//             </div>
//             <p className="font-semibold text-slate-700">
//               {activeTab === "archived" ? "No archived orders yet" : "No orders yet"}
//             </p>
//             <p className="text-sm text-slate-400 mt-1">
//               {activeTab === "archived" ? "Completed orders you file away will show up here." : "When a wash is booked, it'll land here."}
//             </p>
//             {activeTab === "active" && role !== "owner" && (
//               <Link to="/shops" className="inline-block mt-4 text-sm text-blue-700 font-semibold hover:underline">
//                 Browse shops →
//               </Link>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-5">
//             {orders.map((order) => {
//               const statusCfg = getStatusConfig(order.status);
//               const paymentCfg = getPaymentConfig(order.payment_status);

//               return (
//                 <div key={order.id} className="relative bg-white rounded-[28px] border border-blue-900/5 shadow-[0_2px_20px_-8px_rgba(15,110,110,0.12)] hover:shadow-[0_8px_28px_-8px_rgba(15,110,110,0.22)] transition-shadow overflow-hidden">

//                   {/* punch-hole ticket notches */}
//                   <div className="absolute -left-3 top-24 w-6 h-6 rounded-full bg-blue-50/40 border border-blue-900/5" />
//                   <div className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-blue-50/40 border border-blue-900/5" />

//                   {/* STATUS BAR */}
//                   <div className={`h-1.5 w-full ${statusCfg.bar}`} />

//                   <div className="p-6">

//                     {/* TOP */}
//                     <div className="flex justify-between items-start gap-3 mb-5">
//                       <div className="flex items-start gap-3">
//                         <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${statusCfg.color}`}>
//                           <Shirt size={18} strokeWidth={2} />
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-lg text-slate-900 leading-tight">{order.service?.name}</h3>
//                           <Link
//                             to={`/shop/${order.shop?.id}`}
//                             onClick={(e) => e.stopPropagation()}
//                             className="text-sm text-blue-600 hover:underline mt-0.5 inline-block font-medium"
//                           >
//                             {order.shop?.name}
//                           </Link>
//                         </div>
//                       </div>
//                       <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${statusCfg.color}`}>
//                         {statusCfg.icon}
//                         {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                       </span>
//                     </div>

//                     {/* perforated tear line */}
//                     <div className="border-t border-dashed border-blue-900/10 mb-5" />

//                     {/* DETAILS GRID */}
//                     <div className="grid grid-cols-2 gap-3 mb-5">
//                       <div className="p-3.5 bg-blue-50/40 rounded-2xl">
//                         <p className="text-[11px] text-blue-700/60 font-semibold uppercase tracking-wide mb-0.5">Weight</p>
//                         <p className="font-bold text-slate-800">{order.weight} kg</p>
//                       </div>
//                       <div className="p-3.5 bg-blue-50/40 rounded-2xl">
//                         <p className="text-[11px] text-blue-700/60 font-semibold uppercase tracking-wide mb-0.5">Total</p>
//                         <p className="font-bold text-blue-700">KES {order.total_price}</p>
//                       </div>
//                     </div>

//                     {/* DECLINE / CANCEL NOTICE — shown to both roles once the order is a dead end */}
//                     {(order.status === "declined" || order.status === "cancelled") && (
//                       <div className={`mb-5 p-4 border rounded-2xl ${
//                         order.status === "declined" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50"
//                       }`}>
//                         <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1.5 ${
//                           order.status === "declined" ? "text-rose-800" : "text-slate-600"
//                         }`}>
//                           {order.status === "declined" ? <XCircle size={13} /> : <Ban size={13} />}
//                           {order.status === "declined"
//                             ? (role === "owner" ? "You declined this order" : "This order was declined")
//                             : (role === "owner" ? "Customer cancelled this order" : "You cancelled this order")}
//                         </p>
//                         {order.status === "declined" && (
//                           <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.decline_reason}</p>
//                         )}
//                         {order.refund_needed && (
//                           <div className={`flex items-start gap-1.5 mt-3 pt-3 border-t ${
//                             order.status === "declined" ? "border-rose-200/70" : "border-slate-200"
//                           }`}>
//                             <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
//                             <p className="text-xs text-amber-700 font-medium">
//                               {role === "owner"
//                                 ? "This order was already paid — process a manual M-Pesa refund to the customer."
//                                 : "You already paid for this order — the shop will refund you via M-Pesa shortly. Contact them if it doesn't arrive."}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* NOTES — CUSTOMER (editable) */}
//                     {role === "customer" && (
//                       <div className="mb-5">
//                         {editingNotesId === order.id ? (
//                           <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
//                             <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
//                               <StickyNote size={13} /> Note for the shop
//                             </label>
//                             <textarea
//                               value={noteDraft}
//                               onChange={(e) => setNoteDraft(e.target.value)}
//                               maxLength={500}
//                               rows={3}
//                               placeholder="Gate code, handling instructions, a stain to watch for..."
//                               className="w-full text-sm border border-amber-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
//                               autoFocus
//                             />
//                             <div className="flex items-center justify-between mt-2">
//                               <span className="text-[11px] text-amber-700/60">{noteDraft.length}/500</span>
//                               <div className="flex gap-2">
//                                 <button
//                                   onClick={handleCancelEditNote}
//                                   className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
//                                 >
//                                   Cancel
//                                 </button>
//                                 <button
//                                   onClick={() => handleSaveNote(order.id)}
//                                   disabled={savingNoteId === order.id}
//                                   className="px-4 py-1.5 text-xs font-bold rounded-full bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50"
//                                 >
//                                   {savingNoteId === order.id ? "Saving..." : "Save note"}
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         ) : order.customer_notes ? (
//                           <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
//                             <div className="flex items-start justify-between gap-2 mb-1.5">
//                               <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
//                                 <StickyNote size={13} /> Your note
//                               </p>
//                               {activeTab !== "archived" && (
//                                 <button
//                                   onClick={() => handleStartEditNote(order)}
//                                   className="text-amber-700 hover:text-amber-900 shrink-0"
//                                   aria-label="Edit note"
//                                 >
//                                   <Pencil size={13} />
//                                 </button>
//                               )}
//                             </div>
//                             <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.customer_notes}</p>
//                           </div>
//                         ) : (
//                           activeTab !== "archived" && (
//                             <button
//                               onClick={() => handleStartEditNote(order)}
//                               className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
//                             >
//                               <StickyNote size={13} /> Add a note for the shop
//                             </button>
//                           )
//                         )}
//                       </div>
//                     )}

//                     {/* NOTES — OWNER (read-only, surfaced prominently) */}
//                     {role === "owner" && order.customer_notes && (
//                       <div className="mb-5 p-4 border border-amber-200 bg-amber-50/60 rounded-2xl">
//                         <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
//                           <StickyNote size={13} /> Customer note
//                         </p>
//                         <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.customer_notes}</p>
//                       </div>
//                     )}

//                     {/* PAYMENT — CUSTOMER ONLY */}
//                     {role === "customer" && activeTab === "active" && order.status !== "declined" && order.status !== "cancelled" && (
//                       <div className="mb-5 p-4 border border-blue-900/5 bg-white rounded-2xl">
//                         <div className="flex items-center justify-between mb-3">
//                           <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
//                             <CreditCard size={14} className="text-slate-400" />
//                             Payment
//                           </span>
//                           <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${paymentCfg.color}`}>
//                             {paymentCfg.label}
//                           </span>
//                         </div>

//                         {order.payment_status === "paid" && order.mpesa_transaction_code && (
//                           <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
//                             <p className="text-xs text-emerald-700">
//                               M-Pesa Code: <strong>{order.mpesa_transaction_code}</strong>
//                             </p>
//                           </div>
//                         )}

//                         {(order.payment_status === "unpaid" || order.payment_status === "failed") && (
//                           <button
//                             onClick={() => handlePay(order.id)}
//                             disabled={payingOrderId === order.id || pollingOrderId === order.id}
//                             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-2xl transition disabled:opacity-50 shadow-sm shadow-emerald-100"
//                           >
//                             {payingOrderId === order.id ? "Sending prompt..."
//                               : pollingOrderId === order.id ? "Waiting for payment..."
//                               : "Pay with M-Pesa"}
//                           </button>
//                         )}

//                         {paymentMessage && (
//                           <p className="text-xs text-slate-500 mt-2.5 text-center">{paymentMessage}</p>
//                         )}
//                       </div>
//                     )}

//                     {/* OWNER INFO */}
//                     {role === "owner" && (
//                       <div className="mb-5 bg-blue-50/40 rounded-2xl p-4">
//                         <p className="text-[11px] font-bold text-blue-700/60 uppercase tracking-wide mb-3">Customer Info</p>
//                         <div className="space-y-2 text-sm">
//                           <div className="flex justify-between">
//                             <span className="text-slate-400">Name</span>
//                             <span className="font-semibold text-slate-800">{order.user?.username}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-400">Phone</span>
//                             <span className="font-semibold text-slate-800">{order.customer_phone || "N/A"}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-400">Location</span>
//                             <span className="font-semibold text-slate-800">{order.customer_location || "N/A"}</span>
//                           </div>
//                         </div>
//                         <div className="flex gap-3 mt-3 pt-3 border-t border-blue-900/5">
//                           {order.customer_phone && (
//                             <a href={`tel:${order.customer_phone}`}
//                               className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold hover:underline">
//                               <Phone size={12} /> Call
//                             </a>
//                           )}
//                           {order.customer_location && (
//                             <a href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
//                               target="_blank" rel="noreferrer"
//                               className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold hover:underline">
//                               <MapPin size={12} /> Map
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* OWNER STATUS BUTTONS */}
//                     {role === "owner" && activeTab !== "archived" && order.status !== "declined" && order.status !== "cancelled" && (
//                       <div className="flex flex-wrap items-center gap-2 mb-3">
//                         {order.status === "pending" && (
//                           <>
//                             <button onClick={() => handleStatusUpdate(order.id, "confirmed")}
//                               className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-indigo-600 hover:bg-indigo-700">
//                               <ThumbsUp size={11} className="inline mr-1" /> Accept
//                             </button>
//                             <button onClick={() => handleStartDecline(order)}
//                               className="px-4 py-2 text-xs font-bold rounded-full capitalize transition bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
//                               <XCircle size={11} className="inline mr-1" /> Decline
//                             </button>
//                           </>
//                         )}

//                         {order.status === "confirmed" && (
//                           <>
//                             <button onClick={() => handleStatusUpdate(order.id, "washing")}
//                               className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-blue-500 hover:bg-blue-600">
//                               <Droplets size={11} className="inline mr-1" /> Start Washing
//                             </button>
//                             <button onClick={() => handleStartDecline(order)}
//                               className="px-4 py-2 text-xs font-bold rounded-full capitalize transition bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
//                               <XCircle size={11} className="inline mr-1" /> Decline
//                             </button>
//                           </>
//                         )}

//                         {order.status === "washing" && (
//                           <button onClick={() => handleStatusUpdate(order.id, "completed")}
//                             className="px-4 py-2 text-xs font-bold rounded-full text-white capitalize transition bg-emerald-600 hover:bg-emerald-700">
//                             <CheckCircle2 size={11} className="inline mr-1" /> Mark Completed
//                           </button>
//                         )}

//                         {order.status === "completed" && !order.owner_archived && (
//                           <button onClick={() => handleArchive(order.id)}
//                             className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
//                             <Archive size={12} /> Archive
//                           </button>
//                         )}
//                       </div>
//                     )}

//                     {/* DECLINE — inline reason form */}
//                     {role === "owner" && decliningOrderId === order.id && (
//                       <div className="mb-5 p-4 border border-rose-200 bg-rose-50/60 rounded-2xl">
//                         <label className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wide mb-2">
//                           <XCircle size={13} /> Reason for declining (required)
//                         </label>
//                         <textarea
//                           value={declineReasonDraft}
//                           onChange={(e) => setDeclineReasonDraft(e.target.value)}
//                           maxLength={500}
//                           rows={3}
//                           placeholder="e.g. Fully booked today, can't handle this fabric type... The customer will see this."
//                           className="w-full text-sm border border-rose-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
//                           autoFocus
//                         />
//                         <div className="flex items-center justify-between mt-2">
//                           <span className="text-[11px] text-rose-700/60">{declineReasonDraft.length}/500</span>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={handleCancelDecline}
//                               className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               onClick={() => handleSubmitDecline(order.id)}
//                               disabled={decliningSubmitId === order.id}
//                               className="px-4 py-1.5 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
//                             >
//                               {decliningSubmitId === order.id ? "Declining..." : "Confirm decline"}
//                             </button>
//                           </div>
//                         </div>
//                         {declineError && (
//                           <p className="text-xs text-rose-600 mt-2">{declineError}</p>
//                         )}
//                       </div>
//                     )}

//                     {/* CUSTOMER CANCEL — only before washing starts */}
//                     {role === "customer" && activeTab === "active" &&
//                       (order.status === "pending" || order.status === "confirmed") && (
//                       <div className="mb-5">
//                         <button
//                           onClick={() => handleCancelOrder(order.id)}
//                           disabled={cancellingId === order.id}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
//                         >
//                           <Ban size={14} /> {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
//                         </button>
//                       </div>
//                     )}

//                     {/* OWNER ARCHIVE — declined/cancelled orders (no further status actions apply) */}
//                     {role === "owner" && activeTab !== "archived" &&
//                       (order.status === "declined" || order.status === "cancelled") && !order.owner_archived && (
//                       <div className="mb-5">
//                         <button onClick={() => handleArchive(order.id)}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
//                           <Archive size={14} /> Archive Order
//                         </button>
//                       </div>
//                     )}

//                     {/* CUSTOMER ARCHIVE */}
//                     {role === "customer" && activeTab !== "archived" &&
//                       (order.status === "completed" || order.status === "declined" || order.status === "cancelled") && !order.customer_archived && (
//                       <div className="mb-5">
//                         <button onClick={() => handleArchive(order.id)}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-slate-800 hover:bg-slate-900 text-white transition">
//                           <Archive size={14} /> Archive Order
//                         </button>
//                       </div>
//                     )}

//                     {/* BOOK AGAIN */}
//                     {role === "customer" && activeTab === "archived" && (
//                       <div className="mb-5">
//                         <button onClick={() => handleBookAgain(order)}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition">
//                           <RotateCcw size={14} /> Book Again
//                         </button>
//                       </div>
//                     )}

//                     {/* TIMELINE */}
//                     <div className="pt-5 border-t border-dashed border-blue-900/10">
//                       <p className="text-[11px] font-bold text-blue-700/50 uppercase tracking-widest mb-3">Timeline</p>
//                       <div className="space-y-0">
//                         {[
//                           { key: "placed", label: "Order placed", time: order.created_at, ring: "bg-blue-50 ring-blue-200", icon: <Package size={11} className="text-blue-600" /> },
//                           order.confirmed_at && { key: "confirmed", label: "Confirmed by shop", time: order.confirmed_at, ring: "bg-indigo-50 ring-indigo-200", icon: <ThumbsUp size={11} className="text-indigo-600" /> },
//                           order.washing_at && { key: "washing", label: "Washing started", time: order.washing_at, ring: "bg-blue-50 ring-blue-200", icon: <Droplets size={11} className="text-blue-600" /> },
//                           order.completed_at && { key: "completed", label: "Completed", time: order.completed_at, ring: "bg-emerald-50 ring-emerald-200", icon: <CheckCircle2 size={11} className="text-emerald-600" /> },
//                           order.declined_at && { key: "declined", label: "Declined", time: order.declined_at, ring: "bg-rose-50 ring-rose-200", icon: <XCircle size={11} className="text-rose-600" /> },
//                           order.cancelled_at && { key: "cancelled", label: "Cancelled", time: order.cancelled_at, ring: "bg-slate-100 ring-slate-300", icon: <Ban size={11} className="text-slate-500" /> },
//                         ].filter(Boolean).map((step, i, arr) => (
//                           <div key={step.key} className="flex gap-3">
//                             <div className="flex flex-col items-center">
//                               <div className={`w-6 h-6 rounded-full ring-1 flex items-center justify-center shrink-0 ${step.ring}`}>
//                                 {step.icon}
//                               </div>
//                               {i < arr.length - 1 && (
//                                 <div className="w-0.5 flex-1 bg-blue-100 my-1" />
//                               )}
//                             </div>
//                             <div className={`${i < arr.length - 1 ? "pb-4" : ""} flex-1 pt-0.5`}>
//                               <p className="text-xs font-semibold text-slate-700">{step.label}</p>
//                               <p className="text-xs text-slate-400 mt-0.5">{formatTime(step.time)}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* FOOTER — ticket number */}
//                     <div className="mt-4 text-xs text-blue-900/25 font-mono tracking-wider">
//                       ORDER #{String(order.id).padStart(4, "0")}
//                     </div>

//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Orders;